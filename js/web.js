/* ==========================================================
   Comportamiento general de la web
   ========================================================== */
(function(){
  const $ = (s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => [...el.querySelectorAll(s)];
  const quieto = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;' }[c]));
  const PIN = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 21s-7-6.2-7-11.5A7 7 0 0 1 19 9.5C19 14.8 12 21 12 21z"/><circle cx="12" cy="9.5" r="2.5"/></svg>';

  /* ---------- Dónde dormir: tarjetas desde datos.js ---------- */
  const maps = q => 'https://www.google.com/maps/search/?api=1&query=' + encodeURIComponent(q);
  $('#bloques').innerHTML = ALOJAMIENTOS.map(g => `
    <details class="${g.color}" id="bloque-${g.id}">
      <summary>
        <h3>${esc(g.titulo)}</h3>
        <span class="cuantos">${g.hoteles.length} alojamientos</span>
        <span class="flecha" aria-hidden="true"><svg viewBox="0 0 24 24"><path d="M6 9l6 6 6-6"/></svg></span>
      </summary>
      <div class="rejilla">${g.hoteles.map(h => `
        <article class="ficha" id="ficha-${h.id}">
          <div class="cabeza"><h4>${esc(h.n)}</h4><span class="precio" title="Precio orientativo">${esc(h.p)}</span></div>
          <p class="meta">${esc(h.m)}</p>
          <p class="dato">${esc(h.d)}</p>
          ${h.t ? `<p class="dato">${esc(h.t)}</p>` : ''}
          <div class="botones">
            <a class="lleno" href="${esc(h.u)}" target="_blank" rel="noopener">Ver alojamiento</a>
            <a class="vacio" href="${esc(maps(h.q))}" target="_blank" rel="noopener">Google Maps</a>
            <button type="button" class="ir-mapa" data-mapa="${h.id}">${PIN}En el mapa</button>
          </div>
        </article>`).join('')}
      </div>
    </details>`).join('');

  /* ---------- Saltos entre partes ---------- */
  // Cualquier botón con data-mapa="ceremonia|banquete|idHotel" baja al mapa y lo centra ahí
  document.addEventListener('click', e => {
    const b = e.target.closest('[data-mapa]');
    if (!b) return;
    $('.mapa').scrollIntoView({ behavior: quieto() ? 'auto' : 'smooth', block: 'center' });
    window.Mapa && Mapa.ir(b.dataset.mapa);
  });
  // Desde el globo del mapa: abre el bloque del hotel, baja a su tarjeta y la resalta
  function irAFicha(id){
    const f = document.getElementById('ficha-' + id);
    if (!f) return;
    f.closest('details').open = true;
    f.scrollIntoView({ behavior: quieto() ? 'auto' : 'smooth', block: 'center' });
    f.classList.add('resaltada');
    setTimeout(() => f.classList.remove('resaltada'), 3200);
  }
  window.Web = { irAFicha };

  /* ---------- Menú ---------- */
  const barra = $('.barra'), boton = $('.boton-menu'), lista = $('.enlaces');
  const cerrar = () => { lista.classList.remove('abierto'); boton.setAttribute('aria-expanded', 'false'); };
  boton.addEventListener('click', () => {
    const abrir = !lista.classList.contains('abierto');
    lista.classList.toggle('abierto', abrir); boton.setAttribute('aria-expanded', String(abrir));
  });
  lista.addEventListener('click', e => { if (e.target.closest('a')) cerrar(); });
  document.addEventListener('click', e => { if (!e.target.closest('.barra')) cerrar(); });
  document.addEventListener('keydown', e => { if (e.key === 'Escape') cerrar(); });
  const fondo = () => barra.classList.toggle('con-fondo', window.scrollY > 40);
  window.addEventListener('scroll', fondo, { passive:true }); fondo();

  // Marca en el menú la sección que se está viendo
  const enlaces = $$('.enlaces a');
  const secciones = enlaces.map(a => document.querySelector(a.getAttribute('href'))).filter(Boolean);
  if ('IntersectionObserver' in window) {
    const obs = new IntersectionObserver(ents => {
      for (const e of ents) if (e.isIntersecting) {
        enlaces.forEach(a => a.setAttribute('aria-current', String(a.getAttribute('href') === '#' + e.target.id)));
      }
    }, { rootMargin:'-45% 0px -50% 0px' });
    secciones.forEach(s => obs.observe(s));

    /* ---------- Aparición suave al bajar (estilo Canva) ---------- */
    const rev = new IntersectionObserver((ents, o) => {
      for (const e of ents) if (e.isIntersecting) { e.target.classList.add('visible'); o.unobserve(e.target); }
    }, { rootMargin:'0px 0px -8% 0px' });
    $$('.aparece').forEach(el => rev.observe(el));
  } else $$('.aparece').forEach(el => el.classList.add('visible'));

  /* ---------- Cuenta atrás (26/06/2027 18:30, hora de Pamplona) ---------- */
  const BODA = new Date('2027-06-26T18:30:00+02:00').getTime();
  const cuenta = $('#cuenta');
  function tic(){
    let s = Math.max(0, Math.floor((BODA - Date.now()) / 1000));
    if (s === 0) { cuenta.innerHTML = '<p class="entradilla" style="margin:0">¡Hoy es el día!</p>'; return; }
    const d = Math.floor(s / 86400); s -= d * 86400;
    const h = Math.floor(s / 3600); s -= h * 3600;
    const m = Math.floor(s / 60); s -= m * 60;
    $('[data-u="d"]', cuenta).textContent = d;
    $('[data-u="h"]', cuenta).textContent = String(h).padStart(2, '0');
    $('[data-u="m"]', cuenta).textContent = String(m).padStart(2, '0');
    $('[data-u="s"]', cuenta).textContent = String(s).padStart(2, '0');
    setTimeout(tic, 1000 - (Date.now() % 1000));
  }
  tic();
})();
