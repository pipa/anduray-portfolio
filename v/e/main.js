/* Version E "Top-tier studio" */
(() => {
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const fine = matchMedia('(hover: hover) and (min-width: 1024px)').matches;
  const lag = parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--prev-lag')) || .16;
  // index: a small preview of the lead picture follows the cursor
  const prev = document.querySelector('.prev');
  if (prev && fine && !reduce) {
    let x = 0, y = 0, tx = 0, ty = 0, raf = 0;
    const step = () => { x += (tx - x) * lag; y += (ty - y) * lag; prev.style.transform = `translate3d(${x + 24}px, ${y - prev.offsetHeight / 2}px, 0)`; raf = Math.abs(tx - x) + Math.abs(ty - y) > .5 ? requestAnimationFrame(step) : 0; };
    document.querySelectorAll('.idx a').forEach(a => {
      a.addEventListener('mouseenter', (e) => { prev.src = a.dataset.prev; prev.classList.add('on'); if (!x) { x = tx = e.clientX; y = ty = e.clientY; } });
      a.addEventListener('mouseleave', () => prev.classList.remove('on'));
    });
    addEventListener('mousemove', (e) => { tx = e.clientX; ty = e.clientY; if (!raf) raf = requestAnimationFrame(step); }, { passive: true });
  }
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
