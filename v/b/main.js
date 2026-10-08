// Version B, "Press check". Progressive enhancement only: the page reads complete without this file.
// Every motion value is read from tokens.css.
(() => {
  const root = document.documentElement;
  const params = new URLSearchParams(location.search);
  const css = getComputedStyle(root);
  const tok = (n) => css.getPropertyValue(n).trim();
  const num = (n) => parseFloat(tok(n));
  const ms = (n) => { const v = tok(n); return v.endsWith('ms') ? parseFloat(v) : parseFloat(v) * 1000; };
  const pair = (n) => tok(n).split(/\s+/).map(parseFloat);
  const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
  const bezier = (s) => {
    const m = /cubic-bezier\(([^)]+)\)/.exec(s);
    if (!m) return (x) => x;
    const [x1, y1, x2, y2] = m[1].split(',').map(parseFloat);
    const cx = 3 * x1, bx = 3 * (x2 - x1) - cx, ax = 1 - cx - bx, cy = 3 * y1, by = 3 * (y2 - y1) - cy, ay = 1 - cy - by;
    const sx = (t) => ((ax * t + bx) * t + cx) * t, sy = (t) => ((ay * t + by) * t + cy) * t, dx = (t) => (3 * ax * t + 2 * bx) * t + cx;
    return (x) => { let t = x; for (let i = 0; i < 8; i++) { const e = sx(t) - x, d = dx(t); if (Math.abs(e) < 1e-5 || !d) break; t -= e / d; } return sy(clamp(t, 0, 1)); };
  };

  const mqReduce = matchMedia('(prefers-reduced-motion: reduce)');
  const mqFine = matchMedia('(hover: hover) and (pointer: fine)');
  const mqWide = matchMedia('(min-width: 1024px)');
  const still = root.classList.contains('still');
  const freezeAt = params.has('t') ? Math.max(0, +params.get('t') || 0) : null;
  let motion = !mqReduce.matches && !still;
  const hasIO = 'IntersectionObserver' in window;
  const scrollTimeline = CSS.supports && CSS.supports('animation-timeline: view()');
  window.__press = true;

  /* ---------- header: rule once stuck, current sheet in the slug ---------- */
  const top = document.querySelector('.top');
  const onScroll = () => top.classList.toggle('is-stuck', scrollY > 8);
  addEventListener('scroll', onScroll, { passive: true });
  onScroll();
  const nowN = top.querySelector('.now-n'), nowT = top.querySelector('.now-t');
  if (hasIO) {
    const io = new IntersectionObserver((entries) => {
      for (const e of entries) if (e.isIntersecting) { nowN.textContent = e.target.dataset.sheet; nowT.textContent = e.target.dataset.title; }
    }, { rootMargin: '-45% 0px -54% 0px' });
    document.querySelectorAll('[data-sheet]').forEach((s) => io.observe(s));
  }

  /* ---------- phone menu: a halftone screen fills in, then the links ---------- */
  const btn = top.querySelector('.menu-btn'), nav = document.getElementById('nav');
  const dot = nav.querySelector('.nav-screen circle');
  const pitch = num('--menu-pitch');
  dot.parentNode.setAttribute('width', pitch); dot.parentNode.setAttribute('height', pitch);
  dot.setAttribute('cx', pitch / 2); dot.setAttribute('cy', pitch / 2);
  const rFull = pitch * Math.SQRT1_2 + 0.75;
  const outside = [document.getElementById('main'), document.querySelector('.colophon'), document.querySelector('.skip')];
  const mqMenu = matchMedia('(max-width: 899px)');
  const easeMenu = bezier(tok('--ease-move'));
  let menuOpen = false, menuRaf = 0;
  const screenTo = (from, to, dur, done) => {
    cancelAnimationFrame(menuRaf);
    if (!motion || dur <= 0) { dot.setAttribute('r', to); done(); return; }
    const t0 = performance.now();
    const frame = (now) => {
      const p = Math.min(1, (now - t0) / dur);
      dot.setAttribute('r', (from + (to - from) * easeMenu(p)).toFixed(2));
      if (p < 1) menuRaf = requestAnimationFrame(frame); else done();
    };
    menuRaf = requestAnimationFrame(frame);
  };
  const setMenu = (open, moveFocus = true) => {
    if (open === menuOpen) return;
    menuOpen = open;
    btn.setAttribute('aria-expanded', String(open));
    btn.textContent = open ? 'Close' : 'Menu';
    outside.forEach((el) => { if (el) el.inert = open; });
    root.style.overflow = open ? 'hidden' : '';
    if (open) {
      top.classList.remove('menu-closing');
      top.classList.add('menu-open');
      nav.classList.remove('screened');
      screenTo(0, rFull, ms('--dur-menu-in'), () => nav.classList.add('screened'));
      if (moveFocus) nav.querySelector('a').focus({ preventScroll: true });
    } else {
      nav.classList.remove('screened');
      top.classList.add('menu-closing');
      screenTo(+dot.getAttribute('r') || rFull, 0, ms('--dur-menu-out'), () => top.classList.remove('menu-open', 'menu-closing'));
      if (moveFocus) btn.focus({ preventScroll: true });
    }
  };
  btn.addEventListener('click', () => setMenu(!menuOpen));
  nav.addEventListener('click', (e) => { if (menuOpen && e.target.closest('a')) setMenu(false, false); });
  addEventListener('keydown', (e) => {
    if (!menuOpen) return;
    if (e.key === 'Escape') { e.preventDefault(); setMenu(false); return; }
    if (e.key !== 'Tab') return;
    const loop = [top.querySelector('.who'), btn, ...nav.querySelectorAll('a')];
    const i = loop.indexOf(document.activeElement);
    if (e.shiftKey && i <= 0) { e.preventDefault(); loop[loop.length - 1].focus(); }
    else if (!e.shiftKey && i === loop.length - 1) { e.preventDefault(); loop[0].focus(); }
  });
  mqMenu.addEventListener('change', () => { if (!mqMenu.matches) setMenu(false, false); });

  /* ---------- proofs: wrap each picture so marks, plates and screens sit on the image itself ---------- */
  document.querySelectorAll('.proof .media figure > img').forEach((img) => {
    const pic = document.createElement('span');
    pic.className = 'pic';
    img.replaceWith(pic);
    pic.appendChild(img);
  });
  const crops = '<span class="crop tl"></span><span class="crop tr"></span><span class="crop bl"></span><span class="crop br"></span>';
  document.querySelectorAll('[data-marks]').forEach((el) => {
    const host = el.matches('figure') ? el.querySelector('.pic') : el;
    const m = document.createElement('span');
    m.className = 'marks';
    m.setAttribute('aria-hidden', 'true');
    m.innerHTML = crops;
    host.appendChild(m);
  });

  /* ---------- hero: four plates spring into register ---------- */
  const hero = document.querySelector('.hero');
  const nameEl = hero.querySelector('.name');
  const ro = hero.querySelector('.ro-v');
  hero.querySelectorAll('.crop, .reg').forEach((el, i) => el.style.setProperty('--i', i % 4));
  hero.querySelectorAll('.bar i').forEach((el, i) => el.style.setProperty('--i', i));
  const W = num('--spring-w'), Z = num('--spring-z'), K = W * W, C = 2 * Z * W;
  const stagger = ms('--stagger-plate'), scatter = num('--scatter'), knockMax = num('--knock-max'), tapKnock = num('--tap-knock'), pxmm = num('--px-mm');
  const plates = ['y', 'm', 'c', 'k'].map((key, i) => ({
    key, i, el: nameEl.querySelector('.plate-' + key),
    from: [num(`--plate-${key}-x`), num(`--plate-${key}-y`), num(`--plate-${key}-r`)],
    push: pair(`--plate-${key}-push`), knock: num(`--plate-${key}-knock`),
    x: 0, y: 0, r: 0, vx: 0, vy: 0, vr: 0, live: false,
  }));
  let fs = parseFloat(getComputedStyle(nameEl).fontSize);
  const startOffsets = !root.classList.contains('no-press');
  plates.forEach((p) => { if (startOffsets) { p.x = p.from[0] * fs; p.y = p.from[1] * fs; p.r = p.from[2]; } });

  let heroOn = true, raf = 0, last = 0, t0 = null, lastMove = -1e9;
  const ptr = { x: 0, y: 0, cx: 0, cy: 0, has: false };
  const settleTau = 420;

  const targets = (p, now) => {
    if (!p.live) return [p.from[0] * fs, p.from[1] * fs, p.from[2]];
    const s = clamp(scrollY / Math.max(1, hero.offsetHeight), 0, 1) * scatter;
    const act = ptr.has ? Math.exp(-(now - lastMove) / settleTau) : 0;
    return [
      p.from[0] * fs * s + ptr.x * p.push[0] * fs * act,
      p.from[1] * fs * s + ptr.y * p.push[1] * fs * act,
      p.from[2] * s,
    ];
  };
  const paint = () => {
    for (const p of plates) p.el.style.transform = `translate3d(${p.x.toFixed(2)}px, ${p.y.toFixed(2)}px, 0) rotate(${p.r.toFixed(3)}deg)`;
    const k = plates[3];
    const d = plates.slice(0, 3).map((p) => Math.hypot(p.x - k.x, p.y - k.y) * pxmm);
    const text = Math.max(...d) < 0.05 ? 'In register'
      : `<b class="c"></b>C ${d[2].toFixed(1)}<b class="m"></b>M ${d[1].toFixed(1)}<b class="y"></b>Y ${d[0].toFixed(1)} mm`;
    if (ro.innerHTML !== text) ro.innerHTML = text;
  };
  const advance = (now, dt) => {
    const steps = Math.max(1, Math.ceil(dt / (1 / 240))), h = dt / steps;
    let busy = false;
    for (const p of plates) {
      if (!p.live && t0 !== null && now - t0 >= p.i * stagger) p.live = true;
      const [tx, ty, tr] = targets(p, now);
      for (let s = 0; s < steps; s++) {
        p.vx += (K * (tx - p.x) - C * p.vx) * h; p.x += p.vx * h;
        p.vy += (K * (ty - p.y) - C * p.vy) * h; p.y += p.vy * h;
        p.vr += (K * (tr - p.r) - C * p.vr) * h; p.r += p.vr * h;
      }
      const resting = Math.abs(tx - p.x) < 0.04 && Math.abs(ty - p.y) < 0.04 && Math.abs(tr - p.r) < 0.003
        && Math.abs(p.vx) < 0.4 && Math.abs(p.vy) < 0.4 && Math.abs(p.vr) < 0.04;
      if (resting) { p.x = tx; p.y = ty; p.r = tr; p.vx = p.vy = p.vr = 0; }
      if (!p.live || !resting) busy = true;
    }
    if (ptr.has && now - lastMove < settleTau * 8) busy = true;
    return busy;
  };
  const frame = (now) => {
    raf = 0;
    const dt = last ? Math.min(0.05, (now - last) / 1000) : 0;
    last = now;
    const busy = advance(now, dt);
    paint();
    if (busy && heroOn) raf = requestAnimationFrame(frame); else last = 0;
  };
  const wake = () => { if (motion && heroOn && t0 !== null && !raf && freezeAt === null) raf = requestAnimationFrame(frame); };
  const impulse = (p, dx, dy, dr) => {
    const vmax = knockMax * fs * W;
    p.vx = clamp(p.vx + dx, -vmax, vmax);
    p.vy = clamp(p.vy + dy, -vmax, vmax);
    p.vr = clamp(p.vr + dr, -W * 6, W * 6);
  };

  if (motion) {
    if (hasIO) new IntersectionObserver(([e]) => { heroOn = e.isIntersecting; if (heroOn) wake(); }).observe(hero);
    addEventListener('scroll', () => { if (heroOn) wake(); }, { passive: true });
    addEventListener('resize', () => { fs = parseFloat(getComputedStyle(nameEl).fontSize); wake(); }, { passive: true });
    // cursor: a light nudge that follows the pointer, plus a knock when it sweeps across the name
    addEventListener('pointermove', (e) => {
      if (e.pointerType !== 'mouse' || !heroOn) return;
      const nx = e.clientX / innerWidth - 0.5, ny = e.clientY / innerHeight - 0.5;
      if (ptr.has) {
        const box = nameEl.getBoundingClientRect(), pad = fs * 0.35;
        const near = e.clientX > box.left - pad && e.clientX < box.right + pad && e.clientY > box.top - pad && e.clientY < box.bottom + pad;
        if (near) {
          const dx = e.clientX - ptr.cx, dy = e.clientY - ptr.cy;
          for (const p of plates) if (p.live) impulse(p, dx * p.knock * W, dy * p.knock * W, dx * p.knock * 0.05 * W);
        }
      }
      ptr.x = nx; ptr.y = ny; ptr.cx = e.clientX; ptr.cy = e.clientY; ptr.has = true;
      lastMove = performance.now();
      wake();
    }, { passive: true });
    document.documentElement.addEventListener('pointerleave', () => { lastMove = -1e9; wake(); });
    // touch and pen: tap the name to knock the plates away from your finger
    nameEl.addEventListener('pointerdown', (e) => {
      if (e.pointerType === 'mouse') return;
      const box = nameEl.getBoundingClientRect();
      const ux = (box.left + box.width / 2 - e.clientX) / box.width, uy = (box.top + box.height / 2 - e.clientY) / box.height;
      const v = tapKnock * fs * W;
      for (const p of plates) if (p.live) impulse(p, (ux + 0.35) * v * Math.sign(p.knock || 1) * Math.abs(p.knock) * 3, (uy + 0.25) * v * Math.abs(p.knock) * 3, p.knock * 30);
      wake();
    });
  }

  const startHero = () => {
    if (!motion) { plates.forEach((p) => { p.el.style.transform = ''; }); return; }
    if (freezeAt !== null) {
      // QA still: run the intro to ?t= milliseconds and hold
      t0 = 0;
      const h = 1 / 240;
      for (let t = 0; t <= freezeAt; t += h * 1000) advance(t, h);
      paint();
      root.style.setProperty('--t', `-${freezeAt}ms`);
      root.classList.add('ready');
      return;
    }
    root.classList.add('ready');
    t0 = performance.now();
    if (!startOffsets) plates.forEach((p) => { p.live = true; });
    wake();
  };
  const fontsReady = document.fonts && document.fonts.ready
    ? Promise.race([document.fonts.ready, new Promise((r) => setTimeout(r, ms('--font-wait')))])
    : Promise.resolve();
  fontsReady.then(() => requestAnimationFrame(startHero));

  mqReduce.addEventListener('change', () => {
    motion = !mqReduce.matches && !still;
    if (!motion) {
      cancelAnimationFrame(raf); raf = 0;
      plates.forEach((p) => { p.el.style.transform = ''; p.x = p.y = p.r = p.vx = p.vy = p.vr = 0; p.live = true; });
      ro.textContent = 'In register';
    }
  });

  if (!motion) return;

  /* ---------- headings print in register ---------- */
  document.querySelectorAll('[data-plates]').forEach((h) => {
    const text = h.textContent.trim();
    h.textContent = '';
    for (const key of ['y', 'm', 'c']) {
      const s = document.createElement('span');
      s.className = 'gp gp-' + key;
      s.setAttribute('aria-hidden', 'true');
      s.textContent = text;
      h.appendChild(s);
    }
    const k = document.createElement('span');
    k.className = 'gp-k';
    k.textContent = text;
    h.appendChild(k);
    h.classList.add('reg-in');
  });
  if (!scrollTimeline && hasIO) {
    const io = new IntersectionObserver((entries) => {
      for (const e of entries) if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); }
    }, { rootMargin: '0px 0px -15% 0px' });
    document.querySelectorAll('.reg-in').forEach((h) => io.observe(h));
  }

  if (!hasIO) {
    document.querySelectorAll('.proof .marks').forEach((m) => m.classList.add('in'));
    return;
  }

  /* ---------- proofs arrive: marks draw, plates pull into register ---------- */
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

  const separate = mqWide.matches && mqFine.matches;
  const sepFigures = [...document.querySelectorAll('.proof .media figure')].filter((f) => !f.closest('[data-screen]'));
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
    const media = fig.closest('.media');
    const idx = [...media.querySelectorAll('figure')].indexOf(fig);
    const d = Math.max(0, idx) * staggerProof;
    prepare(fig).then((sep) => {
      fig.style.setProperty('--d', `${d}ms`);
      requestAnimationFrame(() => requestAnimationFrame(() => fig.classList.add('sep-go')));
      setTimeout(() => {
        fig.classList.remove('sep-wait', 'sep-go');
        fig.classList.add('sep-done');
        sep.remove();
      }, d + durSep + 2 * staggerSep + 80);
    });
  };
  if (separate) {
    const below = (el) => el.getBoundingClientRect().top > innerHeight * 0.9;
    const prepIO = new IntersectionObserver((entries) => {
      for (const e of entries) if (e.isIntersecting) { if (below(e.target)) prepare(e.target); prepIO.unobserve(e.target); }
    }, { rootMargin: '0px 0px 35% 0px' });
    const goIO = new IntersectionObserver((entries) => {
      for (const e of entries) if (e.isIntersecting) { if (prep.has(e.target)) go(e.target); goIO.unobserve(e.target); }
    }, { rootMargin: '0px 0px -12% 0px' });
    sepFigures.forEach((f) => { prepIO.observe(f); goIO.observe(f); });
  }

  /* ---------- La Montañita: a halftone screen opens out of the black ---------- */
  const NS = 'http://www.w3.org/2000/svg';
  const sp = num('--screen-pitch'), rCover = sp * Math.SQRT1_2 + 0.6;
  const durScreen = ms('--dur-screen'), staggerScreen = ms('--stagger-screen'), easeScreen = bezier(tok('--ease-screen'));
  let screenId = 0;
  const screenFigs = [...document.querySelectorAll('[data-screen] figure')];
  const screens = new Map();
  screenFigs.forEach((fig) => {
    if (fig.getBoundingClientRect().top < innerHeight) return;
    const svg = document.createElementNS(NS, 'svg');
    svg.setAttribute('class', 'screen');
    svg.setAttribute('aria-hidden', 'true');
    const id = 'scr-' + (++screenId);
    svg.innerHTML = `<defs><pattern id="${id}" patternUnits="userSpaceOnUse" width="${sp}" height="${sp}" patternTransform="rotate(45)"><circle cx="${sp / 2}" cy="${sp / 2}" r="${rCover}"/></pattern></defs><rect width="100%" height="100%" fill="url(#${id})"/>`;
    fig.querySelector('.pic').appendChild(svg);
    screens.set(fig, svg);
  });
  const open = (fig, delay) => {
    const svg = screens.get(fig);
    if (!svg) return;
    const c = svg.querySelector('circle');
    loaded(fig.querySelector('.pic > img')).then(() => {
      const t0 = performance.now() + delay;
      const step = (now) => {
        const p = clamp((now - t0) / durScreen, 0, 1);
        c.setAttribute('r', (rCover * (1 - easeScreen(p))).toFixed(2));
        if (p < 1) requestAnimationFrame(step); else svg.remove();
      };
      requestAnimationFrame(step);
    });
  };
  const screenIO = new IntersectionObserver((entries) => {
    const hits = entries.filter((e) => e.isIntersecting);
    hits.forEach((e, k) => { open(e.target, k * staggerScreen); screenIO.unobserve(e.target); });
  }, { rootMargin: '0px 0px -15% 0px', threshold: 0.2 });
  screens.forEach((_, fig) => screenIO.observe(fig));

  /* ---------- the sign-off stamp lands once ---------- */
  const stamp = document.querySelector('.stamp');
  if (stamp) {
    const io = new IntersectionObserver(([e]) => { if (e.isIntersecting) { stamp.classList.add('in'); io.disconnect(); } }, { threshold: 0.8 });
    io.observe(stamp);
  }
})();

/* ---------- loupe: a linen tester over every proof, with a densitometer reading ---------- */
(() => {
  if (!matchMedia('(hover: hover) and (pointer: fine)').matches) return;
  const root = document.documentElement;
  const css = getComputedStyle(root);
  const loupe = document.querySelector('.loupe');
  const lens = loupe.querySelector('.loupe-lens img');
  const read = loupe.querySelector('.loupe-read');
  const size = parseFloat(css.getPropertyValue('--loupe-size')), R = size / 2;
  const zMax = parseFloat(css.getPropertyValue('--loupe-zoom')), zMin = parseFloat(css.getPropertyValue('--loupe-zoom-min'));
  const samples = new WeakMap();
  let cur = null, box = null, z = 2, last = null, sample = null;

  const largest = (img) => {
    const set = img.getAttribute('srcset');
    if (!set) return { src: img.getAttribute('src'), w: +img.getAttribute('width') || img.naturalWidth };
    const best = set.split(',').map((s) => s.trim().split(/\s+/)).sort((a, b) => parseFloat(b[1]) - parseFloat(a[1]))[0];
    return { src: best[0], w: parseFloat(best[1]) };
  };
  const sampler = (img) => {
    if (samples.has(img)) return samples.get(img);
    let data = null;
    try {
      const w = 96, h = Math.max(1, Math.round(w * img.naturalHeight / img.naturalWidth));
      const cv = document.createElement('canvas');
      cv.width = w; cv.height = h;
      const cx = cv.getContext('2d', { willReadFrequently: true });
      cx.drawImage(img, 0, 0, w, h);
      data = { w, h, px: cx.getImageData(0, 0, w, h).data };
    } catch (e) { data = null; }
    samples.set(img, data);
    return data;
  };
  const cmyk = (r, g, b) => {
    r /= 255; g /= 255; b /= 255;
    const k = 1 - Math.max(r, g, b);
    if (k > 0.995) return [0, 0, 0, 100];
    return [(1 - r - k) / (1 - k), (1 - g - k) / (1 - k), (1 - b - k) / (1 - k), k].map((v) => Math.round(v * 100));
  };
  const two = (v) => String(v).padStart(2, '0');
  const place = () => {
    if (!cur || !last) return;
    const x = last.x - box.left, y = last.y - box.top;
    loupe.style.transform = `translate3d(${(last.x - R).toFixed(1)}px, ${(last.y - R).toFixed(1)}px, 0)`;
    lens.style.transform = `translate3d(${(R - x * z).toFixed(1)}px, ${(R - y * z).toFixed(1)}px, 0)`;
    if (sample) {
      const sx = clampInt(Math.floor(x / box.width * sample.w), 0, sample.w - 1), sy = clampInt(Math.floor(y / box.height * sample.h), 0, sample.h - 1);
      const o = (sy * sample.w + sx) * 4, [c, m, yy, k] = cmyk(sample.px[o], sample.px[o + 1], sample.px[o + 2]);
      read.innerHTML = `<b class="c"></b>C ${two(c)}<b class="m"></b>M ${two(m)}<b class="y"></b>Y ${two(yy)}<b class="k"></b>K ${two(k)}`;
    }
  };
  const clampInt = (v, a, b) => Math.min(b, Math.max(a, v));
  const contentBox = (img) => {
    const r = img.getBoundingClientRect(), s = getComputedStyle(img);
    const l = parseFloat(s.paddingLeft), t = parseFloat(s.paddingTop);
    return { left: r.left + l, top: r.top + t, width: r.width - l - parseFloat(s.paddingRight), height: r.height - t - parseFloat(s.paddingBottom) };
  };
  const enter = (img, e) => {
    cur = img;
    box = contentBox(img);
    const big = largest(img);
    z = Math.min(zMax, Math.max(zMin, big.w / box.width));
    if (lens.getAttribute('src') !== big.src) lens.src = big.src;
    lens.style.width = `${box.width * z}px`;
    lens.style.height = `${box.height * z}px`;
    sample = img.complete && img.naturalWidth ? sampler(img) : null;
    read.hidden = !sample;
    last = { x: e.clientX, y: e.clientY };
    place();
    loupe.classList.add('on');
  };
  const leave = () => { cur = null; loupe.classList.remove('on'); };
  document.querySelectorAll('.proof .media img').forEach((img) => {
    img.classList.add('has-loupe');
    img.addEventListener('pointerenter', (e) => { if (e.pointerType === 'mouse') enter(img, e); });
    img.addEventListener('pointermove', (e) => { if (cur === img) { last = { x: e.clientX, y: e.clientY }; place(); } });
    img.addEventListener('pointerleave', leave);
  });
  addEventListener('scroll', () => { if (cur) { box = contentBox(cur); place(); } }, { passive: true });
  addEventListener('blur', leave);
})();

/* QA hook: ?y=1200 scrolls there on load so headless stills can capture scroll states */
(() => {
  const y = new URLSearchParams(location.search).get('y');
  if (y) addEventListener('load', () => { document.documentElement.style.scrollBehavior = 'auto'; scrollTo(0, +y); });
})();
