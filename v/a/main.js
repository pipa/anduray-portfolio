/* Version A "Window" */
(() => {
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const css = getComputedStyle(document.documentElement);
  const tok = (n, d) => parseFloat(css.getPropertyValue(n)) || d;
  const NS = 'http://www.w3.org/2000/svg';
  const pics = ['montanita-5','dengue-1','estilo-5','banpais-1','montanita-3','en-1','dengue-2','estilo-2','leyde-1','buenprovecho-2','montanita-1','pinkparty-1','filmfest-1','estilo-6','h2ocean-1','dengue-3','montanita-4','usap-1','estilo-3','quierocasa-1','leyde-2','montanita-2','h2box-front','estilo-1'];
  const svg = document.querySelector('svg.hero'), stage = document.querySelector('.stage');
  const next = document.querySelector('.next'), meta = document.querySelector('.meta');
  const el = (tag, attrs, parent) => { const n = document.createElementNS(NS, tag); for (const k in attrs) n.setAttribute(k, attrs[k]); if (parent) parent.appendChild(n); return n; };

  // two compositions: wide (one line each, 16:9) and tall (phones)
  const L = {
    wide: { vb: [1600, 900], fs: 400, tl: 1520, ys: [400, 740], cx: 800, cy: 600, cw: 200, ch: 272, n: 8 },
    tall: { vb: [900, 600], fs: 300, tl: 820, ys: [270, 540], cx: 450, cy: 420, cw: 150, ch: 204, n: 6 }
  };
  let mode = null, mt, ol, zoom, target = { x: 0, y: 0 };
  const build = () => {
    const m = innerWidth < 768 ? 'tall' : 'wide';
    if (m === mode) return; mode = m; const c = L[m];
    svg.textContent = ''; svg.setAttribute('viewBox', `0 0 ${c.vb[0]} ${c.vb[1]}`); svg.setAttribute('preserveAspectRatio', 'xMidYMid meet');
    const defs = el('defs', {}, svg);
    const mask = el('mask', { id: 'm', maskUnits: 'userSpaceOnUse', x: -40000, y: -40000, width: 80000, height: 80000 }, defs);
    el('rect', { x: -40000, y: -40000, width: 80000, height: 80000, fill: '#000' }, mask);
    mt = el('g', {}, mask);
    const word = (parent, cls, fill, i) => { const t = el('text', { class: 'name-text ' + cls, x: c.cx, y: c.ys[i], 'text-anchor': 'middle', 'font-size': c.fs, textLength: c.tl, lengthAdjust: 'spacingAndGlyphs', fill }, parent); t.textContent = i ? 'ANDURAY' : 'ROBERTO'; return t; };
    const t1 = word(mt, '', '#fff', 0); word(mt, '', '#fff', 1);
    zoom = el('g', {}, svg);
    const halo = el('g', { opacity: 0 }, zoom); word(halo, 'halo', 'none', 0); word(halo, 'halo', 'none', 1);
    const cols = el('g', { mask: 'url(#m)' }, zoom);
    const top = -c.ch;
    for (let k = 0; k < c.n; k++) {
      const g = el('g', { class: 'col' }, cols);
      g.style.setProperty('--dir', k % 2 ? 'down' : 'up'); g.style.setProperty('--dur', (tok('--dur-col-min', 48) + (k * 7) % 20) + 's');
      const per = Math.ceil((c.vb[1] - top) / c.ch) + 1;
      for (let j = 0; j < per * 2; j++) el('image', { href: 'thumbs/' + pics[(k * 5 + (j % per) * 3) % pics.length] + '.webp', x: k * c.cw, y: top + j * c.ch - (k % 2 ? 60 : 0), width: c.cw, height: c.ch, preserveAspectRatio: 'xMidYMid slice' }, g);
    }
    ol = el('g', { opacity: 0 }, zoom); word(ol, 'outline', 'none', 0); word(ol, 'outline', 'none', 1);
    ol.halo = halo;
    target = { x: c.cx - c.tl * 0.27, y: c.ys[0] - c.fs * 0.3 };
    try { const r = t1.getExtentOfChar(1); target = { x: r.x + r.width * 0.14, y: r.y + r.height * 0.58 }; } catch (e) {}
    mode === 'tall' || true;
  };
  const showOutline = (o) => { ol.setAttribute('opacity', o); ol.halo.setAttribute('opacity', o); };
  const intro = () => {
    if (reduce) { showOutline(1); return; }
    const c = L[mode], from = tok('--intro-from', 9), dur = tok('--dur-intro', 1400), t0 = performance.now();
    const ease = (t) => t < .5 ? 8 * t ** 4 : 1 - (-2 * t + 2) ** 4 / 2;
    const step = (now) => {
      const t = Math.min(1, (now - t0) / dur), s = from - (from - 1) * ease(t);
      mt.setAttribute('transform', `translate(${c.cx} ${c.cy}) scale(${s}) translate(${-c.cx} ${-c.cy})`);
      showOutline(Math.max(0, (t - .7) / .3));
      if (t < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  };
  const fontsReady = document.fonts ? Promise.race([document.fonts.ready, new Promise(r => setTimeout(r, 900))]) : Promise.resolve();
  fontsReady.then(() => { build(); intro(); onScroll(); });
  addEventListener('resize', () => { const before = mode; build(); if (mode !== before) { showOutline(1); onScroll(); } });

  // scroll: dive through the left stroke of the O, then hand over to the work, on ink
  const zmax = tok('--zoom-max', 70);
  const wins = [...document.querySelectorAll('.win')].map(s => ({ s, img: s.querySelector('.win-img') }));
  let ticking = false;
  function onScroll() {
    ticking = false;
    if (!reduce && zoom) {
      const p = Math.min(1, Math.max(0, scrollY / (stage.offsetHeight - innerHeight)));
      const z = Math.min(1, p / .8), s = Math.exp(z ** 2.2 * Math.log(zmax));
      zoom.setAttribute('transform', `translate(${target.x} ${target.y}) scale(${s}) translate(${-target.x} ${-target.y})`);
      meta.style.opacity = Math.max(0, 1 - p * 5);
      next.style.opacity = Math.min(1, Math.max(0, (p - .6) / .22));
    }
    if (!reduce) for (const w of wins) {   // each case number is a window: the picture drifts behind it
      const r = w.s.getBoundingClientRect();
      if (r.bottom < -200 || r.top > innerHeight + 200) continue;
      const q = Math.min(1, Math.max(0, (innerHeight - r.top) / (innerHeight + r.height)));
      w.img.setAttribute('y', (-240 + q * 240).toFixed(1));
    }
  }
  addEventListener('scroll', () => { if (!ticking) { ticking = true; requestAnimationFrame(onScroll); } }, { passive: true });

  // capture hook for review stills: ?y=<px>
  const y = new URLSearchParams(location.search).get('y'); if (y) addEventListener('load', () => setTimeout(() => scrollTo(0, +y), 1600));
})();

/* phone menu: full-screen panel, Esc/button/link closes, focus trapped, focus returns */
(() => {
  const btn = document.querySelector('.menu-btn'), panel = document.getElementById('menu');
  if (!btn || !panel) return;
  const close = panel.querySelector('.menu-close');
  const focusables = () => [...panel.querySelectorAll('a,button')];
  const open = () => { panel.hidden = false; requestAnimationFrame(() => panel.classList.add('on'));
    btn.setAttribute('aria-expanded','true'); document.documentElement.classList.add('menu-open'); focusables()[0].focus(); };
  const shut = (ret = true) => { panel.classList.remove('on'); btn.setAttribute('aria-expanded','false');
    document.documentElement.classList.remove('menu-open'); setTimeout(() => { panel.hidden = true; }, 320); if (ret) btn.focus(); };
  btn.addEventListener('click', () => btn.getAttribute('aria-expanded') === 'true' ? shut() : open());
  close.addEventListener('click', () => shut());
  panel.addEventListener('click', e => { if (e.target.closest('a')) shut(false); });
  document.addEventListener('keydown', e => {
    if (panel.hidden) return;
    if (e.key === 'Escape') shut();
    if (e.key === 'Tab') { const f = focusables(), a = f[0], z = f[f.length-1];
      if (e.shiftKey && document.activeElement === a) { e.preventDefault(); z.focus(); }
      else if (!e.shiftKey && document.activeElement === z) { e.preventDefault(); a.focus(); } }
  });
})();
/* reveal on view (transform/opacity only); reduced motion shows everything */
(() => {
  const els = document.querySelectorAll('[data-in]');
  if (matchMedia('(prefers-reduced-motion: reduce)').matches || !('IntersectionObserver' in window)) { els.forEach(e => e.classList.add('in')); return; }
  const io = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } }), { rootMargin: '0px 0px -12% 0px' });
  els.forEach(e => io.observe(e));
})();
