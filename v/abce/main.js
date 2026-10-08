/* ABCE mix. A: hero (unchanged) */
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

  // scroll: dive through the left stroke of the O, then fade to paper and hand over to the intro (A faded to ink)
  const zmax = tok('--zoom-max', 70);
  const fadeFrom = tok('--fade-from', .45), fadeTo = tok('--fade-to', .58);
  let ticking = false;
  function onScroll() {
    ticking = false;
    if (!reduce && zoom) {
      const p = Math.min(1, Math.max(0, scrollY / (stage.offsetHeight - innerHeight)));
      const z = Math.min(1, p / .8), s = Math.exp(z ** 2.2 * Math.log(zmax));
      zoom.setAttribute('transform', `translate(${target.x} ${target.y}) scale(${s}) translate(${-target.x} ${-target.y})`);
      meta.style.opacity = Math.max(0, 1 - p * 5);
      next.style.opacity = Math.min(1, Math.max(0, (p - fadeFrom) / (fadeTo - fadeFrom)));   // paper covers the dive before the zoom goes soft
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
/* C: sketch-to-picture reveal, the one move per sheet. Lead image only, five sheets; scroll opens the mask (SVG r attribute). */
(() => {
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const css = getComputedStyle(document.documentElement);
  const tok = (n, d) => { const v = parseFloat(css.getPropertyValue(n)); return isNaN(v) ? d : v; };
  const clamp = (v) => Math.min(1, Math.max(0, v));
  const quart = (t) => t < .5 ? 8 * t ** 4 : 1 - (-2 * t + 2) ** 4 / 2;
  const boards = [...document.querySelectorAll('.board')].map(b => ({ b, c: b.querySelector('.rv') }));
  if (!boards.length) return;
  if (innerWidth >= 768) document.querySelectorAll('.board [data-full]').forEach(i => i.setAttribute('href', i.getAttribute('data-full')));
  const s0 = tok('--board-start', .85), s1 = tok('--board-end', .3);
  const paint = () => {
    for (const o of boards) {
      const r = o.b.getBoundingClientRect();
      if (!reduce && (r.bottom < -innerHeight || r.top > innerHeight * 2)) continue;
      // keyed to the board's top edge (C keyed it to the centre): these leads are taller than C's boards,
      // so the picture is finished while most of it is still on screen
      const p = reduce ? 1 : clamp((innerHeight * s0 - r.top) / (innerHeight * (s0 - s1)));
      const v = (quart(p) * +o.c.dataset.r).toFixed(1);
      if (o.c.getAttribute('r') !== v) o.c.setAttribute('r', v);
    }
  };
  if (reduce) { paint(); return; }
  let tick = false;
  addEventListener('scroll', () => { if (!tick) { tick = true; requestAnimationFrame(() => { tick = false; paint(); }); } }, { passive: true });
  addEventListener('resize', paint); paint();
})();

/* E: index preview follows a mouse pointer only; never on touch, never with reduced motion */
(() => {
  const prev = document.querySelector('.prev');
  if (!prev || !matchMedia('(hover: hover) and (pointer: fine)').matches || matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  const lag = parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--prev-lag')) || .16;
  let x = 0, y = 0, tx = 0, ty = 0, raf = 0, seen = false;
  const step = () => { x += (tx - x) * lag; y += (ty - y) * lag; prev.style.transform = `translate3d(${(x + 24).toFixed(1)}px, ${(y - prev.offsetHeight / 2).toFixed(1)}px, 0)`; raf = Math.abs(tx - x) + Math.abs(ty - y) > .5 ? requestAnimationFrame(step) : 0; };
  document.querySelectorAll('.idx a').forEach(a => {
    a.addEventListener('mouseenter', (e) => { prev.src = a.dataset.prev; prev.classList.add('on'); if (!seen) { seen = true; x = tx = e.clientX; y = ty = e.clientY; } });
    a.addEventListener('mouseleave', () => prev.classList.remove('on'));
  });
  addEventListener('mousemove', (e) => { tx = e.clientX; ty = e.clientY; if (!raf) raf = requestAnimationFrame(step); }, { passive: true });
})();

/* A: header colour. Ink strip only over Contact, paper everywhere else (the hero now fades to paper, so it never needs the ink strip) */
(() => {
  const bar = document.querySelector('.top'), contact = document.querySelector('.contact');
  if (!bar || !contact) return;
  let tick = false;
  const set = () => {
    tick = false;
    const y = bar.offsetHeight / 2, c = contact.getBoundingClientRect();
    bar.classList.toggle('on-ink', c.top <= y && c.bottom > y);
  };
  addEventListener('scroll', () => { if (!tick) { tick = true; requestAnimationFrame(set); } }, { passive: true });
  addEventListener('resize', set); set();
})();
