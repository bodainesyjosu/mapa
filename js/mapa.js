/* ==========================================================
   Mapa interactivo (MapLibre + teselas de OpenFreeMap / OpenStreetMap)
   - Se carga al llegar a la sección (no frena la portada).
   - Mapa.ir('ceremonia' | 'banquete' | idHotel): centra y abre el globo.
   - El globo de un hotel tiene "Ver ficha", que lleva a su tarjeta.
   ========================================================== */
(function(){
  const C = { bg:'#E6E4DD', light:'#FFFDF8', line:'#CFCBC0', ink:'#2E2B27', ink2:'#67635B',
              water:'#B7C7CD', terra:'#AF4510', olive:'#467A43', slate:'#023F5D', bldg:'#DAD7CE' };
  const COLOR_GRUPO = { terra: C.terra, oliva: C.olive, pizarra: C.slate };
  const BOUNDS = [[-1.6990, 42.7805], [-1.6140, 42.8400]];
  const LOGRONO_LAT = 42.7951;      // altura por la que sale la A-12
  const REF_ZOOM = 11.5;            // a partir de este zoom se ven los lugares de referencia (más bajo = se ven desde más lejos);
                                    // en el centro, además, solo salen cuando hay sitio sin tapar los nombres de los hoteles
  const ESP_ZOOM = 12.5;            // los corazones (puntos especiales) solo se ven al acercar; con el mapa entero, no
  const REF_COLOR = '#4A4740';      // gris de los lugares de referencia (punto y nombre)
  const CARTELES_ZOOM_EXTRA = 0.8;  // al acercar más que esto sobre el encuadre inicial, se ocultan los carteles

  const caja = document.querySelector('.mapa');
  let map = null, listo = false, pendiente = null, baseZoom = 0, lastW = 0, popup = null;

  // ---------- Datos a GeoJSON ----------
  const feats = [];
  feats.push({ type:'Feature', properties:{ id:'ceremonia', name:LUGARES.ceremonia.nombre, kind:'cer' }, geometry:{ type:'Point', coordinates:LUGARES.ceremonia.c } });
  feats.push({ type:'Feature', properties:{ id:'banquete', name:LUGARES.banquete.nombre, kind:'ban' }, geometry:{ type:'Point', coordinates:LUGARES.banquete.c } });
  for (const [id, l] of Object.entries(LUGARES)) if (l.especial)
    feats.push({ type:'Feature', properties:{ id, name:l.nombre, kind:'esp' }, geometry:{ type:'Point', coordinates:l.c } });
  const HOTEL = {};
  for (const g of ALOJAMIENTOS) for (const h of g.hoteles) {
    HOTEL[h.id] = Object.assign({ grupo: g.color }, h);
    feats.push({ type:'Feature', properties:{ id:h.id, name:h.mapa, kind:'h', g:g.color }, geometry:{ type:'Point', coordinates:h.c } });
  }
  const REF = {};   // lugares de referencia por id ('ref0', 'ref1'…), para abrir su globo al tocarlos
  REFERENCIAS.forEach((r, i) => {
    REF['ref' + i] = r;
    feats.push({ type:'Feature', properties:{ id:'ref' + i, name:r.n, kind:'ref' }, geometry:{ type:'Point', coordinates:r.c } });
  });
  for (const z of ZONAS) feats.push({ type:'Feature', properties:{ name:z.n, kind:'area' }, geometry:{ type:'Point', coordinates:z.c } });
  const pts = { type:'FeatureCollection', features: feats };

  // ---------- Estilo "papel viejo" ----------
  const F = { r:['Noto Sans Regular'], b:['Noto Sans Bold'], i:['Noto Sans Italic'] };
  const zs = (a, b) => ['interpolate', ['linear'], ['zoom'], 11.5, a, 13, b];
  const style = {
    version: 8,
    glyphs: 'https://tiles.openfreemap.org/fonts/{fontstack}/{range}.pbf',
    sources: { omt: { type:'vector', url:'https://tiles.openfreemap.org/planet' }, pts: { type:'geojson', data: pts } },
    layers: [
      { id:'bg', type:'background', paint:{ 'background-color':C.bg } },
      { id:'green', type:'fill', source:'omt', 'source-layer':'landcover', filter:['in',['get','class'],['literal',['grass','wood','farmland']]], paint:{ 'fill-color':C.light, 'fill-opacity':0.9 } },
      { id:'park', type:'fill', source:'omt', 'source-layer':'park', paint:{ 'fill-color':C.light } },
      { id:'landuse', type:'fill', source:'omt', 'source-layer':'landuse', filter:['in',['get','class'],['literal',['pitch','cemetery','stadium','park','garden']]], paint:{ 'fill-color':C.light } },
      { id:'water', type:'fill', source:'omt', 'source-layer':'water', paint:{ 'fill-color':C.water } },
      { id:'waterway', type:'line', source:'omt', 'source-layer':'waterway', filter:['in',['get','class'],['literal',['river','canal']]], paint:{ 'line-color':C.water, 'line-width':['interpolate',['linear'],['zoom'],12,2,15,6] } },
      { id:'bldg', type:'fill', source:'omt', 'source-layer':'building', minzoom:14, paint:{ 'fill-color':C.bldg, 'fill-opacity':0.7 } },
      { id:'rail', type:'line', source:'omt', 'source-layer':'transportation', filter:['==',['get','class'],'rail'], paint:{ 'line-color':C.line, 'line-width':1, 'line-dasharray':[3,2] } },
      { id:'road-minor', type:'line', source:'omt', 'source-layer':'transportation', filter:['in',['get','class'],['literal',['minor','service','tertiary','path','pedestrian']]], layout:{ 'line-cap':'round', 'line-join':'round' }, paint:{ 'line-color':C.line, 'line-opacity':0.8, 'line-width':['interpolate',['linear'],['zoom'],13,0.4,16,1.6] } },
      { id:'road-major-case', type:'line', source:'omt', 'source-layer':'transportation', filter:['in',['get','class'],['literal',['motorway','trunk','primary','secondary']]], layout:{ 'line-cap':'round', 'line-join':'round' }, paint:{ 'line-color':C.line, 'line-width':['interpolate',['linear'],['zoom'],12,['match',['get','class'],['motorway','trunk'],5,'primary',3.5,2.5],16,9] } },
      { id:'road-major', type:'line', source:'omt', 'source-layer':'transportation', filter:['in',['get','class'],['literal',['motorway','trunk','primary','secondary']]], layout:{ 'line-cap':'round', 'line-join':'round' }, paint:{ 'line-color':C.light, 'line-width':['interpolate',['linear'],['zoom'],12,['match',['get','class'],['motorway','trunk'],2.6,'primary',1.8,1.2],16,6] } },
      { id:'river-label', type:'symbol', source:'omt', 'source-layer':'waterway', filter:['all',['==',['get','class'],'river'],['in','Arga',['coalesce',['get','name'],'']]], layout:{ 'symbol-placement':'line', 'text-field':'Río Arga', 'text-font':F.i, 'text-size':zs(13,18), 'text-letter-spacing':0.25, 'symbol-spacing':350 }, paint:{ 'text-color':C.ink2, 'text-halo-color':C.bg, 'text-halo-width':1.5 } },
      { id:'road-label', type:'symbol', source:'omt', 'source-layer':'transportation_name', minzoom:12, filter:['in',['get','class'],['literal',['motorway','trunk','primary']]], layout:{ 'symbol-placement':'line', 'text-field':['coalesce',['get','name:es'],['get','name'],['get','ref']], 'text-font':F.r, 'text-size':12, 'symbol-spacing':600 }, paint:{ 'text-color':C.ink2, 'text-halo-color':C.bg, 'text-halo-width':1.5 } },
      { id:'barrios', type:'symbol', source:'omt', 'source-layer':'place', filter:['in',['get','class'],['literal',['suburb','quarter','neighbourhood']]], layout:{ 'text-field':['upcase',['coalesce',['get','name:es'],['get','name']]], 'text-font':F.r, 'text-size':zs(10,14), 'text-letter-spacing':0.18, 'text-max-width':8, 'text-padding':12 }, paint:{ 'text-color':C.ink2, 'text-opacity':0.85, 'text-halo-color':C.bg, 'text-halo-width':1.5 } },
      // Lugares de referencia: punto gris del mismo color que su nombre (en cursiva); solo al acercar el centro.
      // Punto y nombre son un mismo símbolo: si el nombre no cabe, desaparecen los dos (nunca queda un punto sin nombre).
      // Van antes que los hoteles: si no caben, ceden su sitio a los nombres de hotel.
      { id:'refs', type:'symbol', source:'pts', minzoom:REF_ZOOM, filter:['==',['get','kind'],'ref'],
        layout:{ 'icon-image':'punto-ref', 'icon-optional':false, 'text-optional':false,
                 'text-field':['get','name'], 'text-font':F.i, 'text-size':['interpolate',['linear'],['zoom'],REF_ZOOM,11,14.5,13.5], 'text-padding':0, 'icon-padding':0, 'text-variable-anchor':['top','bottom','left','right','top-left','top-right','bottom-left','bottom-right'],
                 'text-radial-offset':0.8, 'text-justify':'auto', 'text-max-width':9 },
        paint:{ 'text-color':REF_COLOR, 'text-halo-color':C.bg, 'text-halo-width':2 } },
      // Puntos especiales (corazones), parte 1: su nombre (cursiva gris). Va aquí abajo para que, si no cabe,
      // ceda el sitio a los nombres de hoteles y zonas. El corazón va al final de la lista (siempre encima).
      { id:'especial', type:'symbol', source:'pts', minzoom:ESP_ZOOM, filter:['==',['get','kind'],'esp'],
        layout:{ 'text-field':['get','name'], 'text-font':F.i, 'text-size':13, 'text-max-width':11,
                 'text-variable-anchor':['left','right','top','bottom','top-left','top-right','bottom-left','bottom-right'], 'text-radial-offset':0.9, 'text-justify':'auto' },
        paint:{ 'text-color':REF_COLOR, 'text-halo-color':C.bg, 'text-halo-width':2 } },
      { id:'hotels', type:'circle', source:'pts', filter:['==',['get','kind'],'h'], paint:{ 'circle-radius':zs(4.5,5.5), 'circle-stroke-color':C.light, 'circle-stroke-width':2, 'circle-color':['match',['get','g'],'terra',C.terra,'oliva',C.olive,C.slate] } },
      { id:'main', type:'circle', source:'pts', filter:['in',['get','kind'],['literal',['cer','ban']]], paint:{ 'circle-radius':zs(9,13), 'circle-color':['match',['get','kind'],'cer',C.terra,C.olive], 'circle-stroke-color':C.light, 'circle-stroke-width':3 } },
      // Zonas: ceden ante los nombres de hotel (si chocan, la zona se oculta hasta acercar el mapa)
      { id:'areas', type:'symbol', source:'pts', filter:['==',['get','kind'],'area'], layout:{ 'text-field':['get','name'], 'text-font':F.b, 'text-size':zs(11,16), 'text-letter-spacing':0.2, 'text-padding':4 }, paint:{ 'text-color':C.ink2, 'text-halo-color':C.bg, 'text-halo-width':2 } },
      { id:'hotel-labels', type:'symbol', source:'pts', filter:['==',['get','kind'],'h'], layout:{ 'text-field':['get','name'], 'text-font':F.r, 'text-size':zs(10.5,13), 'text-variable-anchor':['left','right','top','bottom','top-left','bottom-left','top-right','bottom-right'], 'text-radial-offset':0.6, 'text-justify':'auto', 'text-padding':3 }, paint:{ 'text-color':C.ink, 'text-halo-color':C.bg, 'text-halo-width':2 } },
      // Puntos especiales, parte 2: el corazón. Siempre se dibuja, encima de todo, y los demás nombres se apartan de él
      { id:'especial-icono', type:'symbol', source:'pts', minzoom:ESP_ZOOM, filter:['==',['get','kind'],'esp'],
        layout:{ 'icon-image':'corazon', 'icon-size':0.68, 'icon-allow-overlap':true, 'icon-padding':2 } },
      { id:'main-labels', type:'symbol', source:'pts', filter:['in',['get','kind'],['literal',['cer','ban']]], layout:{ 'text-field':['get','name'], 'text-font':F.b, 'text-size':zs(14,20), 'text-max-width':30, 'text-anchor':['match',['get','kind'],'cer','top','right'], 'text-radial-offset':1.3, 'text-allow-overlap':true }, paint:{ 'text-color':['match',['get','kind'],'cer',C.terra,C.olive], 'text-halo-color':C.bg, 'text-halo-width':2.5 } },
    ]
  };

  // ---------- Carga de la librería con varios CDN de reserva ----------
  function cargarLibreria(){
    const CDNS = [
      'https://unpkg.com/maplibre-gl@4.7.1/dist/maplibre-gl',
      'https://cdn.jsdelivr.net/npm/maplibre-gl@4.7.1/dist/maplibre-gl',
      'https://cdnjs.cloudflare.com/ajax/libs/maplibre-gl/4.7.1/maplibre-gl',
    ];
    return new Promise((resolve, reject) => {
      const probar = i => {
        if (window.maplibregl) return resolve();
        if (i >= CDNS.length) return reject(new Error('sin librería'));
        const css = document.createElement('link'); css.rel = 'stylesheet'; css.href = CDNS[i] + '.css';
        document.head.appendChild(css);
        const s = document.createElement('script'); s.src = CDNS[i] + '.js';
        s.onload = () => window.maplibregl ? resolve() : (css.remove(), probar(i + 1));
        s.onerror = () => { css.remove(); s.remove(); probar(i + 1); };
        document.head.appendChild(s);
      };
      probar(0);
    });
  }

  const estrecho = () => caja.clientWidth < 600;
  const margen = () => estrecho() ? { top:60, bottom:110, left:14, right:14 } : { top:76, bottom:130, left:50, right:50 };

  function escala(){
    const lat = map.getCenter().lat;
    const mPx = 40075016.686 * Math.cos(lat * Math.PI / 180) / (512 * Math.pow(2, map.getZoom()));
    const objetivo = estrecho() ? 70 : 110;
    const op = [100, 250, 500, 1000, 2000, 5000];
    const m = op.find(o => o / mPx >= objetivo) || op[op.length - 1];
    const fmt = v => v >= 1000 ? (v / 1000).toLocaleString('es') + ' km' : v + ' m';
    const w = (m / mPx) + 'px';
    caja.querySelector('.barra-escala').style.width = w;
    caja.querySelector('.escala .marcas').style.width = w;
    const [, mid, end] = caja.querySelectorAll('.escala .marcas span');
    mid.textContent = fmt(m / 2); mid.style.left = '50%';
    end.textContent = fmt(m); end.style.left = '100%';
  }
  function cartelLogrono(){
    const el = caja.querySelector('.cartel.izq'), box = caja.getBoundingClientRect(), h = el.offsetHeight;
    const minY = caja.querySelector('.cartel.arriba').getBoundingClientRect().bottom - box.top + 10;
    const maxY = caja.querySelector('.pila').getBoundingClientRect().top - box.top - h - 10;
    const y = map.project([map.getBounds().getWest(), LOGRONO_LAT]).y - h / 2;
    el.style.top = (maxY < minY ? minY : Math.max(minY, Math.min(maxY, y))) + 'px';
  }
  function carteles(){ caja.classList.toggle('cerca', map.getZoom() > baseZoom + CARTELES_ZOOM_EXTRA); }
  function nombresHotel(){ if (map.getLayer('hotel-labels')) map.setLayerZoomRange('hotel-labels', estrecho() ? 12.6 : 0, 24); }
  function refrescar(){ escala(); cartelLogrono(); carteles(); }

  // Enlace de Google Maps: por nombre si hay q (sale la ficha del sitio); si no, a las coordenadas exactas
  const enlaceMaps = p => 'https://www.google.com/maps/search/?api=1&query=' +
    encodeURIComponent(p.q || (p.c[1] + ',' + p.c[0]));

  function globo(id){
    const lugar = LUGARES[id], hotel = HOTEL[id], ref = REF[id];
    const titulo = lugar ? lugar.nombre : hotel ? hotel.n : ref.n;
    const detalle = lugar ? lugar.detalle : hotel ? hotel.d : '';
    const c = (lugar || hotel || ref).c;
    const div = document.createElement('div');
    const b = document.createElement('b'); b.textContent = titulo; div.appendChild(b);
    if (detalle) { const s = document.createElement('small'); s.textContent = detalle; div.appendChild(s); }
    if (hotel) {
      // Los hoteles llevan a su ficha, que ya tiene su propio enlace a Google Maps
      const btn = document.createElement('button'); btn.type = 'button'; btn.textContent = 'Ver ficha';
      btn.addEventListener('click', () => window.Web && Web.irAFicha(id));
      div.appendChild(btn);
    } else {
      const a = document.createElement('a'); a.className = 'ir-maps'; a.textContent = 'Abrir en Google Maps';
      a.href = enlaceMaps(lugar || ref); a.target = '_blank'; a.rel = 'noopener';
      div.appendChild(a);
    }
    if (popup) popup.remove();
    popup = new maplibregl.Popup({ closeButton:true, offset:14, maxWidth:'260px' })
      .setLngLat(c).setDOMContent(div).addTo(map);
  }

  function crear(){
    map = new maplibregl.Map({
      container:'mapa-lienzo', style, attributionControl:false,
      bounds:BOUNDS, fitBoundsOptions:{ padding: margen() },
      cooperativeGestures:true, dragRotate:false, pitchWithRotate:false, maxZoom:17, minZoom:10,
      locale:{
        'CooperativeGesturesHandler.WindowsHelpText':'Usa Ctrl + rueda del ratón para acercar el mapa',
        'CooperativeGesturesHandler.MacHelpText':'Usa ⌘ + rueda del ratón para acercar el mapa',
        'CooperativeGesturesHandler.MobileHelpText':'Usa dos dedos para mover el mapa',
        'NavigationControl.ZoomIn':'Acercar', 'NavigationControl.ZoomOut':'Alejar', 'Popup.Close':'Cerrar'
      }
    });
    map.touchZoomRotate.disableRotation();
    // Punto gris de los lugares de referencia (se dibuja aquí porque el estilo no trae imágenes)
    map.on('styleimagemissing', e => {
      if (e.id === 'corazon' && !map.hasImage('corazon')) {
        // Corazón gris (como los lugares de referencia) con borde claro, a doble resolución para que se vea nítido
        const px = 2, t = 22 * px, cv = document.createElement('canvas'); cv.width = cv.height = t;
        const g = cv.getContext('2d'); g.scale(px, px);
        const corazon = () => { g.beginPath(); g.moveTo(11, 18.5);
          g.bezierCurveTo(4, 13.5, 2.5, 10, 2.5, 7.3); g.bezierCurveTo(2.5, 4.6, 4.6, 2.8, 7, 2.8);
          g.bezierCurveTo(8.8, 2.8, 10.2, 3.9, 11, 5.4); g.bezierCurveTo(11.8, 3.9, 13.2, 2.8, 15, 2.8);
          g.bezierCurveTo(17.4, 2.8, 19.5, 4.6, 19.5, 7.3); g.bezierCurveTo(19.5, 10, 18, 13.5, 11, 18.5); g.closePath(); };
        corazon(); g.lineWidth = 3; g.lineJoin = 'round'; g.strokeStyle = C.light; g.stroke();
        corazon(); g.fillStyle = REF_COLOR; g.fill();
        map.addImage('corazon', g.getImageData(0, 0, t, t), { pixelRatio: px });
        return;
      }
      if (e.id !== 'punto-ref' || map.hasImage('punto-ref')) return;
      const px = 2, t = 13 * px, cv = document.createElement('canvas'); cv.width = cv.height = t;
      const g = cv.getContext('2d');
      g.beginPath(); g.arc(t / 2, t / 2, 6 * px, 0, Math.PI * 2); g.fillStyle = C.light; g.fill();
      g.beginPath(); g.arc(t / 2, t / 2, 4.5 * px, 0, Math.PI * 2); g.fillStyle = REF_COLOR; g.fill();
      map.addImage('punto-ref', g.getImageData(0, 0, t, t), { pixelRatio: px });
    });
    map.addControl(new maplibregl.NavigationControl({ showCompass:false }), 'bottom-left');
    baseZoom = map.getZoom(); lastW = caja.clientWidth;

    map.on('click', e => {
      const f = map.queryRenderedFeatures(e.point, { layers:['especial-icono','especial','hotels','main','refs'] })[0];
      if (f) globo(f.properties.id);
    });
    for (const l of ['hotels','main','especial','especial-icono','refs']) {
      map.on('mouseenter', l, () => map.getCanvas().style.cursor = 'pointer');
      map.on('mouseleave', l, () => map.getCanvas().style.cursor = '');
    }
    map.on('load', () => {
      nombresHotel(); refrescar(); caja.classList.add('listo'); listo = true;
      if (pendiente) { const p = pendiente; pendiente = null; ir(p); }
    });
    map.on('move', refrescar);
    map.on('resize', () => {
      const w = caja.clientWidth;
      if (Math.abs(w - lastW) > 40) { lastW = w; map.fitBounds(BOUNDS, { padding: margen(), animate:false }); baseZoom = map.getZoom(); nombresHotel(); }
      refrescar();
    });
  }

  let arrancado = false;
  function iniciar(){
    if (arrancado) return; arrancado = true;
    cargarLibreria().then(crear).catch(() => {
      caja.classList.add('error');
      caja.querySelector('.aviso').textContent = 'No se ha podido cargar el mapa. Prueba a recargar la página.';
    });
  }

  // Centra el mapa en un lugar u hotel y abre su globo
  function ir(id){
    if (!listo) { pendiente = id; iniciar(); return; }
    const lugar = LUGARES[id], hotel = HOTEL[id];
    if (!lugar && !hotel) return;
    const c = lugar ? lugar.c : hotel.c;
    const quieto = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    map[quieto ? 'jumpTo' : 'flyTo']({ center:c, zoom: Math.max(map.getZoom(), 14.5), duration: 1200 });
    globo(id);
  }

  // Arranca al acercarse a la sección
  if ('IntersectionObserver' in window) {
    new IntersectionObserver((ents, obs) => {
      if (ents.some(e => e.isIntersecting)) { iniciar(); obs.disconnect(); }
    }, { rootMargin:'400px 0px' }).observe(caja);
  } else iniciar();
  // Por si el navegador no avisa de que se ha llegado a la sección: arranca igualmente al poco de cargar
  window.addEventListener('load', () => setTimeout(iniciar, 2500));

  window.Mapa = { iniciar, ir, get mapa(){ return map; } };
})();
