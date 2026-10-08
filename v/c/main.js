/* Version C "Idea, line, picture" */
(() => {
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const css = getComputedStyle(document.documentElement);
  const tok = (n, d) => { const v = parseFloat(css.getPropertyValue(n)); return isNaN(v) ? d : v; };
  const clamp = (v) => Math.min(1, Math.max(0, v));
  const quart = (t) => t < .5 ? 8 * t ** 4 : 1 - (-2 * t + 2) ** 4 / 2, expo = (t) => t === 1 ? 1 : 1 - 2 ** (-10 * t);
  const small = innerWidth < 768;

  /* ---- hero: sketch, then the line, then the picture, three pieces on a loop ---- */
  const W = [
    { img: 'montanita-5', cx: 450, cy: 723, line: '“Me vi al espejo y no reconocí a ese hombre.”', en: 'I looked in the mirror and didn’t recognise that man.', who: 'El Heraldo, La Montañita fire special edition' },
    { img: 'dengue-1', cx: 423, cy: 563, line: '“…no es tu amigo.”', en: '…is not your friend.', who: 'El Heraldo, dengue awareness series' },
    { img: 'estilo-5', cx: 558, cy: 515, line: '“¡Así debes tocarte!”', en: 'This is how to check yourself.', who: 'Estilo magazine, breast self-exam campaign' }
  ];
  const T = { sketch: tok('--t-sketch', 1800), line: tok('--t-line', 1500), pic: tok('--t-pic', 1000), hold: tok('--t-hold', 2600), out: tok('--t-out', 400) };
  const PER = T.sketch + T.line + T.pic + T.hold + T.out;
  let seed = 7; const rnd = () => ((seed = (seed * 16807) % 2147483647) / 2147483647);
  let d = 'M 40 60'; for (let y = 60, k = 0; y < 1260; y += 105, k++) { const x = k % 2 ? 60 + rnd() * 40 : 840 - rnd() * 40; d += ` Q ${450 + (rnd() - .5) * 200} ${y + 20 + rnd() * 40} ${x} ${y + 105}`; }
  const $ = (s) => document.querySelector(s);
  const sp = $('#sp'), rc = $('#rc'), sk = $('#sk'), fin = $('#fin'), art = $('#art');
  sp.setAttribute('d', d);
  const lineEl = $('.hline'), cap = $('.hcap'), tag = $('.htag'), bars = [...document.querySelectorAll('.hsteps b')], lis = [...document.querySelectorAll('.hsteps li')];
  const R = 1400;
  let cur = -1, spans = [];
  const setPiece = (i) => {
    const w = W[i]; cur = i;
    sk.setAttribute('href', `sketches/${w.img}${small ? '-640' : ''}.webp`);
    fin.setAttribute('href', `../../assets/work/${w.img}${small ? '-640' : ''}.webp`);
    rc.setAttribute('cx', w.cx); rc.setAttribute('cy', w.cy);
    lineEl.textContent = ''; spans = [...w.line].map((ch) => { const s = document.createElement('span'); s.textContent = ch; lineEl.appendChild(s); return s; });
    lineEl.setAttribute('lang', 'es'); cap.innerHTML = `<b>${w.en}</b><br>${w.who}`; tag.textContent = `${String(i + 1).padStart(2, '0')} / ${String(W.length).padStart(2, '0')}`;
  };
  window.renderAt = (t) => {   // every frame is a pure function of t (review hook: ?t=ms)
    const i = Math.floor(t / PER) % W.length, u = t % PER; if (i !== cur) setPiece(i);
    const a = clamp(u / T.sketch), b = clamp((u - T.sketch) / T.line), c = clamp((u - T.sketch - T.line) / T.pic), o = clamp((u - PER + T.out) / T.out);
    sp.setAttribute('stroke-dashoffset', 1 - quart(a));
    const n = Math.round(expo(b) * spans.length); spans.forEach((s, k) => s.classList.toggle('v', k < n));
    rc.setAttribute('r', (quart(c) * R).toFixed(1));
    art.style.opacity = 1 - o; lineEl.style.opacity = 1 - o; cap.style.opacity = c > 0 ? 1 - o : clamp(b * 3) * (1 - o);
    [a, b, c].forEach((v, k) => { bars[k].style.transform = `scaleX(${v})`; lis[k].classList.toggle('on', (v > 0 && v < 1) || (k === 2 && v === 1)); });
  };
  const q = new URLSearchParams(location.search);
  if (q.has('t')) window.renderAt(+q.get('t'));
  else if (reduce) window.renderAt(T.sketch + T.line + T.pic + 10);
  else {
    let t0 = null, visible = true;
    new IntersectionObserver(([e]) => { visible = e.isIntersecting; }).observe($('.hero'));
    const loop = (now) => { if (t0 === null) t0 = now; if (visible && !document.hidden) window.renderAt(now - t0); requestAnimationFrame(loop); };
    window.renderAt(0);
    (document.fonts ? Promise.race([document.fonts.ready, new Promise(r => setTimeout(r, 800))]) : Promise.resolve()).then(() => requestAnimationFrame(loop));
  }

  /* ---- case boards: scroll turns the sketch into the picture ---- */
  const boards = [...document.querySelectorAll('.board')].map(b => ({ b, c: b.querySelector('.rv'), fin: b.querySelector('.fin'), st: [...b.querySelectorAll('.steps span')] }));
  const s0 = tok('--board-start', .85), s1 = tok('--board-end', .3);
  if (!small) boards.forEach(o => { const f = o.fin.getAttribute('data-full'); if (f) o.fin.setAttribute('href', f); });
  const paint = () => {
    for (const o of boards) {
      const r = o.b.getBoundingClientRect(), mid = r.top + r.height / 2;
      const p = reduce ? 1 : clamp((innerHeight * s0 - mid) / (innerHeight * (s0 - s1)));
      o.c.setAttribute('r', (quart(p) * +o.c.dataset.r).toFixed(1));
      o.st[0].classList.toggle('on', p < .34); o.st[1].classList.toggle('on', p >= .34 && p < .99); o.st[2].classList.toggle('on', p >= .99);
    }
  };
  let tick = false;
  addEventListener('scroll', () => { if (!tick) { tick = true; requestAnimationFrame(() => { tick = false; paint(); }); } }, { passive: true });
  addEventListener('resize', paint); paint();

  /* ---- pencil underline on section titles ---- */
  const heads = document.querySelectorAll('.sec-head');
  if (reduce || !('IntersectionObserver' in window)) heads.forEach(h => h.classList.add('in'));
  else { const io = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } }), { rootMargin: '0px 0px -20% 0px' }); heads.forEach(h => io.observe(h)); }

  const y = q.get('y'); if (y) addEventListener('load', () => setTimeout(() => scrollTo(0, +y), 1600));
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
