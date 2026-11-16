/* ==========================================================
   Tildes, eñes y signos de apertura que faltan en las fuentes
   ----------------------------------------------------------
   Brittany Signature dibuja «é» como «e» (sin tilde) y la demo
   de Yellow Peas no trae ni vocales acentuadas, ni «ñ», ni «¿¡».
   Aquí cada una de esas letras se cambia por:
     <span class="ac" data-b="e" data-m="agudo"><span class="ac-real">é</span></span>
   · la letra base se pinta con la propia fuente (::before),
   · la tilde se dibuja encima con CSS (::after),
   · la letra real sigue en el texto (transparente) para que copiar,
     buscar y los lectores de pantalla la lean bien.
   ========================================================== */
(function(){
  // letra → [base, marca]
  const MAPA = {
    'á':['a','agudo'],'é':['e','agudo'],'í':['i','agudo'],'ó':['o','agudo'],'ú':['u','agudo'],
    'Á':['A','agudo'],'É':['E','agudo'],'Í':['I','agudo'],'Ó':['O','agudo'],'Ú':['U','agudo'],
    'ñ':['n','virgulilla'],'Ñ':['N','virgulilla'],'ü':['u','dieresis'],'Ü':['U','dieresis'],
    '¿':['?','invertido'],'¡':['!','invertido']
  };
  // Qué le falta a cada fuente
  const FUENTES = {
    'Brittany':    { clase:'f-brit', faltan:/[áéíóúÁÉÍÓÚñÑüÜ]/ },          // ¿ y ¡ sí los tiene
    'Yellow Peas': { clase:'f-yp',   faltan:/[áéíóúÁÉÍÓÚñÑüÜ¿¡]/ }
  };
  const TODAS = /[áéíóúÁÉÍÓÚñÑüÜ¿¡]/;
  const SALTAR = new Set(['SCRIPT','STYLE','TEXTAREA','TITLE','svg','SVG','NOSCRIPT']);

  function fuenteDe(el){
    const ff = getComputedStyle(el).fontFamily.split(',')[0].trim().replace(/["']/g, '');
    return FUENTES[ff] || null;
  }

  function tratarTexto(nodo){
    const padre = nodo.parentElement;
    if (!padre || SALTAR.has(padre.tagName) || padre.closest('.ac, .ac-palabra, [hidden], svg')) return;
    const txt = nodo.nodeValue;
    if (!TODAS.test(txt)) return;
    const f = fuenteDe(padre);
    if (!f || !f.faltan.test(txt)) return;
    const estilo = getComputedStyle(padre);
    const mayus = estilo.textTransform === 'uppercase';
    const cursiva = estilo.fontStyle !== 'normal';   // las dos fuentes no tienen cursiva: el navegador la inclina
    const frag = document.createDocumentFragment();
    // Palabra a palabra: la que lleva letras dibujadas va en un bloque que no se parte
    for (const pal of txt.split(/(\s+)/)) {
      if (!pal) continue;
      if (!f.faltan.test(pal)) { frag.appendChild(document.createTextNode(pal)); continue; }
      const caja = document.createElement('span');
      caja.className = 'ac-palabra';
      let trozo = '';
      for (const ch of pal) {
        const m = MAPA[ch];
        if (!m || !f.faltan.test(ch)) { trozo += ch; continue; }
        if (trozo) { caja.appendChild(document.createTextNode(trozo)); trozo = ''; }
        const s = document.createElement('span');
        const alta = mayus || ch !== ch.toLowerCase();
        s.className = 'ac ' + f.clase + (alta ? ' alta' : '') + (m[0] === 'i' && !alta ? ' sin-punto' : '');
        s.dataset.b = m[0]; s.dataset.m = m[1];
        if (cursiva) s.dataset.cursiva = '1';
        const real = document.createElement('span');
        real.className = 'ac-real'; real.textContent = ch;
        s.appendChild(real);
        if (listo) colocar(s);
        caja.appendChild(s);
      }
      if (trozo) caja.appendChild(document.createTextNode(trozo));
      frag.appendChild(caja);
    }
    nodo.replaceWith(frag);
  }

  function tratar(raiz){
    if (raiz.nodeType === 3) return tratarTexto(raiz);
    if (raiz.nodeType !== 1 || SALTAR.has(raiz.tagName)) return;
    const w = document.createTreeWalker(raiz, NodeFilter.SHOW_TEXT);
    const nodos = [];
    while (w.nextNode()) if (TODAS.test(w.currentNode.nodeValue)) nodos.push(w.currentNode);
    nodos.forEach(tratarTexto);
  }

  /* ---------- Colocar cada tilde midiendo en este navegador ----------
     · Por fuente: dónde cae la línea base (--A) y cuánto baja el texto (--D). Cada navegador
       (Chrome, Safari…) lo calcula a su manera con Brittany, así que se mide aquí mismo.
     · Por letra: hasta dónde llega su tinta por arriba (--top) y el centro de esa parte de arriba (--cx),
       para que la tilde caiga justo encima aunque la letra sea inclinada. */
  const NOMBRE = { 'f-brit':'Brittany', 'f-yp':'Yellow Peas' };
  const T = 200, X0 = 40, BASE = 230;          // tamaño de prueba y punto donde se dibuja la letra
  const lienzo = document.createElement('canvas'); lienzo.width = 320; lienzo.height = 320;
  const ctx = lienzo.getContext('2d', { willReadFrequently:true });
  const medidas = {};
  let listo = false;

  // Filas con tinta y sus columnas, de la letra dibujada a tamaño T
  function filas(fam, ch){
    ctx.clearRect(0, 0, 320, 320);
    ctx.font = T + 'px "' + fam + '"'; ctx.textBaseline = 'alphabetic'; ctx.fillStyle = '#000';
    ctx.fillText(ch, X0, BASE);
    const d = ctx.getImageData(0, 0, 320, 320).data, f = [];
    for (let y = 0; y < 320; y++) {
      const xs = [];
      for (let x = 0; x < 320; x++) if (d[(y * 320 + x) * 4 + 3] > 90) xs.push(x);
      f.push(xs);
    }
    return f;
  }
  // Centro horizontal de la tinta en una franja a partir de la fila y0
  function centro(f, y0){
    let s = 0, n = 0;
    for (let y = y0; y < Math.min(320, y0 + Math.round(T * 0.07)); y++) for (const x of f[y]) { s += x; n++; }
    return n ? s / n : null;
  }
  function medir(fam, ch, sinPunto){
    const k = fam + '|' + ch + (sinPunto ? '|sp' : '');
    if (medidas[k]) return medidas[k];
    const f = filas(fam, ch);
    let arriba = f.findIndex(xs => xs.length);
    if (arriba < 0) return null;
    if (sinPunto) {
      // «i»: saltar el punto (tinta, luego hueco) y quedarse con el palo
      let y = arriba; while (y < BASE && f[y].length) y++;
      let z = y; while (z < BASE && !f[z].length) z++;
      if (z < BASE && z > y) arriba = z;
    }
    const cx = centro(f, arriba);
    return (medidas[k] = { top: (BASE - arriba) / T, cx: cx === null ? null : (cx - X0) / T });
  }
  function colocar(s){
    if (s.dataset.m === 'invertido') return;
    const clase = s.classList.contains('f-brit') ? 'f-brit' : 'f-yp';
    let ch = s.dataset.b; if (s.classList.contains('alta')) ch = ch.toUpperCase();
    const m = medir(NOMBRE[clase], ch, s.classList.contains('sin-punto'));
    if (!m) return;
    s.style.setProperty('--top', m.top.toFixed(3) + 'em');
    // En cursiva inventada por el navegador la letra se inclina hacia la derecha (~0,25 por cada em de altura):
    // la tilde se desplaza lo mismo a la altura a la que va
    const inclinada = s.dataset.cursiva ? (m.top + 0.12) * 0.25 : 0;
    if (m.cx !== null) s.style.setProperty('--cx', (m.cx + inclinada).toFixed(3) + 'em');
  }
  // Línea base de cada fuente tal y como la pone este navegador
  function lineaBase(){
    let css = '';
    for (const [clase, fam] of Object.entries(NOMBRE)) {
      const caja = document.createElement('div');
      caja.style.cssText = 'position:absolute;left:-9999px;top:0;visibility:hidden';
      const t = document.createElement('span'); t.style.font = '100px "' + fam + '"'; t.textContent = 'x';
      const p = document.createElement('i'); p.style.cssText = 'display:inline-block;width:0;height:0;vertical-align:baseline';
      t.appendChild(p); caja.appendChild(t); document.body.appendChild(caja);
      const r = t.getClientRects()[0], b = p.getBoundingClientRect();
      if (r && r.height) { const A = (b.top - r.top) / 100, D = r.height / 100 - A; css += '.' + clase + '{--A:' + A.toFixed(3) + 'em;--D:' + D.toFixed(3) + 'em}'; }
      caja.remove();
    }
    const st = document.createElement('style'); st.textContent = css; document.head.appendChild(st);
  }
  if (document.fonts && document.fonts.load) {
    Promise.all(Object.values(NOMBRE).map(fam => document.fonts.load('100px "' + fam + '"')))
      .then(() => { lineaBase(); listo = true; document.querySelectorAll('.ac').forEach(colocar); })
      .catch(() => {});
  }

  tratar(document.body);
  // Lo que se pinta después (tarjetas de hoteles, globos del mapa…)
  new MutationObserver(cambios => {
    for (const c of cambios) {
      if (c.type === 'characterData') tratarTexto(c.target);
      else c.addedNodes.forEach(n => { if (!(n.nodeType === 1 && n.classList.contains('ac-palabra'))) tratar(n); });
    }
  }).observe(document.body, { childList:true, subtree:true, characterData:true });
})();
