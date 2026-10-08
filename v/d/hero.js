/* Version D "Wild": papercut hero parallax + filter sizing.
 * - Desktop (hover + fine pointer): pointer-driven. Phones / touch / coarse
 *   pointers: scroll-driven. Chosen live via matchMedia.
 * - Writes only `transform` on .d-sheet, inside requestAnimationFrame, from
 *   passive listeners; idles when the hero is off screen or the tab is hidden.
 * - prefers-reduced-motion: nothing attaches, the scene is static.
 * - Amounts come from each sheet's --shift (tokens --parallax-1..5); the
 *   pointer follow factor from --parallax-lerp.
 * - fitFilters(): filter values are in artboard units, so they scale with the
 *   SVG. Any <fe*> with data-px="attr:px ..." is rescaled on resize so the
 *   12 px shadow / 8 px glow stay those sizes on screen. Not animated.
 */
(() => {
  'use strict';
  const hero = document.querySelector('[data-d-hero]');
  if (!hero) return;

  const root = document.documentElement;
  const sheets = [...hero.querySelectorAll('.d-sheet')];
  const firstSvg = hero.querySelector('.d-sheet svg');
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const fine = matchMedia('(hover: hover) and (pointer: fine)');
  const css = (el, name) => parseFloat(getComputedStyle(el).getPropertyValue(name)) || 0;

  /* ---- filter sizing --------------------------------------------------- */
  const vb = firstSvg ? firstSvg.viewBox.baseVal : null;
  const fitFilters = () => {
    if (!vb || !vb.width) return;
    const r = firstSvg.getBoundingClientRect();
    const scale = Math.max(r.width / vb.width, r.height / vb.height); // "slice"
    if (!scale) return;
    document.querySelectorAll('[data-px]').forEach((fe) => {
      fe.dataset.px.trim().split(/\s+/).forEach((pair) => {
        const [attr, px] = pair.split(':');
        const v = String(Math.round((parseFloat(px) / scale) * 100) / 100);
        if (fe.getAttribute(attr) !== v) fe.setAttribute(attr, v);
      });
    });
  };

  /* ---- parallax ---------------------------------------------------------- */
  let amounts = [];
  let lerp = 0;
  let mode = 'off';            // 'pointer' | 'scroll' | 'off'
  let inView = true;
  let raf = 0;
  const cur = { x: 0, y: 0 };
  const target = { x: 0, y: 0 };
  let heroTop = 0;
  let heroH = 1;
  const last = [];

  const measure = () => {
    amounts = sheets.map((s) => css(s, '--shift'));
    lerp = Math.min(1, Math.max(0, css(root, '--parallax-lerp'))) || 1;
    const r = hero.getBoundingClientRect();
    heroTop = r.top + scrollY;
    heroH = Math.max(1, r.height);
  };

  const write = (fx, fy) => {
    for (let i = 0; i < sheets.length; i++) {
      const a = amounts[i];
      const t = `translate3d(${(fx * a).toFixed(2)}px, ${(fy * a).toFixed(2)}px, 0)`;
      if (last[i] !== t) { sheets[i].style.transform = t; last[i] = t; }
    }
  };

  const frame = () => {
    raf = 0;
    if (mode === 'scroll') {
      const p = Math.min(1, Math.max(0, (scrollY - heroTop) / heroH));
      write(0, -p);                 // front sheets rise faster as the hero leaves
    } else if (mode === 'pointer') {
      cur.x += (target.x - cur.x) * lerp;
      cur.y += (target.y - cur.y) * lerp;
      if (Math.abs(target.x - cur.x) < 0.001 && Math.abs(target.y - cur.y) < 0.001) {
        cur.x = target.x; cur.y = target.y;
      } else {
        schedule();
      }
      write(-cur.x, -cur.y);        // sheets drift against the pointer, front most
    }
  };

  const schedule = () => {
    if (!raf && inView && !document.hidden && mode !== 'off') raf = requestAnimationFrame(frame);
  };

  const onPointer = (e) => {
    if (e.pointerType && e.pointerType !== 'mouse' && e.pointerType !== 'pen') return;
    target.x = (e.clientX / innerWidth) * 2 - 1;
    target.y = (e.clientY / innerHeight) * 2 - 1;
    schedule();
  };
  const onLeave = (e) => { if (!e.relatedTarget) { target.x = 0; target.y = 0; schedule(); } };
  const onScroll = () => schedule();

  const detach = () => {
    removeEventListener('pointermove', onPointer);
    document.removeEventListener('pointerout', onLeave);
    removeEventListener('scroll', onScroll);
    if (raf) cancelAnimationFrame(raf);
    raf = 0;
  };

  const setMode = () => {
    detach();
    cur.x = cur.y = target.x = target.y = 0;
    sheets.forEach((s, i) => { s.style.transform = ''; last[i] = ''; });
    mode = reduced.matches ? 'off' : fine.matches ? 'pointer' : 'scroll';
    if (mode === 'off') return;
    measure();
    if (mode === 'pointer') {
      addEventListener('pointermove', onPointer, { passive: true });
      document.addEventListener('pointerout', onLeave, { passive: true });
    } else {
      addEventListener('scroll', onScroll, { passive: true });
      schedule();
    }
  };

  let resizeRaf = 0;
  addEventListener('resize', () => {
    if (resizeRaf) return;
    resizeRaf = requestAnimationFrame(() => {
      resizeRaf = 0;
      fitFilters();
      if (mode !== 'off') { measure(); schedule(); }
    });
  }, { passive: true });

  if ('IntersectionObserver' in window) {
    new IntersectionObserver(([en]) => { inView = en.isIntersecting; schedule(); }).observe(hero);
  }
  document.addEventListener('visibilitychange', schedule);
  reduced.addEventListener('change', setMode);
  fine.addEventListener('change', setMode);

  fitFilters();
  setMode();

  window.DHero = { get mode() { return mode; }, fitFilters };
})();
