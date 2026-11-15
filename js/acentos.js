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
    const mayus = getComputedStyle(padre).textTransform === 'uppercase';
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
        const real = document.createElement('span');
        real.className = 'ac-real'; real.textContent = ch;
        s.appendChild(real);
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

  tratar(document.body);
  // Lo que se pinta después (tarjetas de hoteles, globos del mapa…)
  new MutationObserver(cambios => {
    for (const c of cambios) {
      if (c.type === 'characterData') tratarTexto(c.target);
      else c.addedNodes.forEach(n => { if (!(n.nodeType === 1 && n.classList.contains('ac-palabra'))) tratar(n); });
    }
  }).observe(document.body, { childList:true, subtree:true, characterData:true });
})();
