/* A+B mix: A "Window" hero, menu and header; B "Press check" proof sheets. Motion values come from tokens.css. */
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

/* header colour: ink strip only over the hero fade-out and Contact; it stays paper over the proof sheets */
(() => {
  const bar = document.querySelector('.top'), stage = document.querySelector('.stage');
  if (!bar || !stage) return;
  const dark = [...document.querySelectorAll('.contact')];
  const set = () => {
    const y = bar.offsetHeight / 2, s = stage.getBoundingClientRect();
    const fade = s.bottom > y && s.bottom - innerHeight * 0.5 < bar.offsetHeight;
    bar.classList.toggle('on-ink', fade || dark.some(d => { const r = d.getBoundingClientRect(); return r.top <= y && r.bottom > y; }));
  };
  addEventListener('scroll', set, { passive: true }); addEventListener('resize', set); set();
})();

/* proof sheets: wrap each picture so marks and plates sit on the image, then the press reveal runs once per sheet */
(() => {
  const css = getComputedStyle(document.documentElement);
  const ms = (n) => { const v = css.getPropertyValue(n).trim(); return v.endsWith('ms') ? parseFloat(v) : parseFloat(v) * 1000; };

  // sideways poster rows get a tab stop only while they actually scroll
  const rows = document.querySelectorAll('.m-row5');
  const syncRows = () => rows.forEach((r) => { if (r.scrollWidth > r.clientWidth + 1) r.setAttribute('tabindex', '0'); else r.removeAttribute('tabindex'); });
  syncRows();
  addEventListener('resize', syncRows, { passive: true });

  document.querySelectorAll('.proof .media figure > img').forEach((img) => {
    const pic = document.createElement('span');
    pic.className = 'pic';
    img.replaceWith(pic);
    pic.appendChild(img);
  });
  const crops = '<span class="crop tl"></span><span class="crop tr"></span><span class="crop bl"></span><span class="crop br"></span>';
  document.querySelectorAll('.proof [data-marks]').forEach((el) => {
    const host = el.matches('figure') ? el.querySelector('.pic') : el;
    const m = document.createElement('span');
    m.className = 'marks';
    m.setAttribute('aria-hidden', 'true');
    m.innerHTML = crops;
    host.appendChild(m);
  });

  if (matchMedia('(prefers-reduced-motion: reduce)').matches || !('IntersectionObserver' in window)) {
    document.querySelectorAll('.proof .marks').forEach((m) => m.classList.add('in'));
    return;
  }

  const staggerProof = ms('--stagger-proof'), durSep = ms('--dur-sep'), staggerSep = ms('--stagger-sep');
  const loaded = (img) => (img.complete && img.naturalWidth ? Promise.resolve() : new Promise((r) => {
    img.addEventListener('load', r, { once: true });
    img.addEventListener('error', r, { once: true });
  })).then(() => (img.decode ? img.decode().catch(() => {}) : null));

  const marksIO = new IntersectionObserver((entries) => {
    for (const e of entries) {
      if (!e.isIntersecting) continue;
      const m = e.target;
      const sibs = [...m.closest('.media').querySelectorAll('.marks')];
      m.style.setProperty('--d', `${Math.max(0, sibs.indexOf(m)) * staggerProof}ms`);
      m.classList.add('in');
      marksIO.unobserve(m);
    }
  }, { rootMargin: '0px 0px -10% 0px' });
  document.querySelectorAll('.proof .marks').forEach((m) => marksIO.observe(m));

  // the plate separation is a desktop flourish: wide screens with a fine pointer only
  if (!(matchMedia('(min-width: 1024px)').matches && matchMedia('(hover: hover) and (pointer: fine)').matches)) return;
  const prep = new WeakMap();
  const prepare = (fig) => {
    if (prep.has(fig)) return prep.get(fig);
    const img = fig.querySelector('.pic > img');
    fig.classList.add('sep-wait');
    const job = loaded(img).then(() => {
      const src = img.currentSrc || img.src;
      const sep = document.createElement('span');
      sep.className = 'sep';
      sep.setAttribute('aria-hidden', 'true');
      for (const key of ['y', 'm', 'c']) {
        const l = new Image();
        l.className = 's-' + key;
        l.alt = '';
        l.decoding = 'sync';
        l.src = src;
        sep.appendChild(l);
      }
      img.after(sep);
      return Promise.all([...sep.children].map((l) => (l.decode ? l.decode().catch(() => {}) : null))).then(() => sep);
    });
    prep.set(fig, job);
    return job;
  };
  const go = (fig) => {
    const figs = [...fig.closest('.media').querySelectorAll('figure')];
    const d = Math.max(0, figs.indexOf(fig)) * staggerProof;
    prepare(fig).then((sep) => {
      fig.style.setProperty('--d', `${d}ms`);
      requestAnimationFrame(() => requestAnimationFrame(() => fig.classList.add('sep-go')));
      setTimeout(() => {
        fig.classList.remove('sep-wait', 'sep-go');
        sep.remove();
      }, d + durSep + 2 * staggerSep + 80);
    });
  };
  // only pictures still below the fold get the reveal, so nothing already on screen blinks out
  const below = (el) => el.getBoundingClientRect().top > innerHeight * 0.9;
  const prepIO = new IntersectionObserver((entries) => {
    for (const e of entries) if (e.isIntersecting) { if (below(e.target)) prepare(e.target); prepIO.unobserve(e.target); }
  }, { rootMargin: '0px 0px 35% 0px' });
  const goIO = new IntersectionObserver((entries) => {
    for (const e of entries) if (e.isIntersecting) { if (prep.has(e.target)) go(e.target); goIO.unobserve(e.target); }
  }, { rootMargin: '0px 0px -12% 0px' });
  document.querySelectorAll('.proof .media figure').forEach((f) => { prepIO.observe(f); goIO.observe(f); });
})();
