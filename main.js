// Small progressive enhancement: hero entrance, case image reveals, sticky header rule.
(() => {
  const root = document.documentElement;
  // ?still renders the page at rest (for screenshot QA)
  const still = new URLSearchParams(location.search).has('still');
  root.classList.add('js');
  if (still) root.classList.add('still', 'ready');
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // index children for CSS stagger
  document.querySelectorAll('.hero .p img').forEach((el) => {
    el.style.setProperty('--i', [...el.closest('.hero').querySelectorAll('.p')].indexOf(el.parentElement));
  });
  document.querySelectorAll('.case .media').forEach((m) => {
    [...m.children].forEach((f, i) => f.querySelector('img')?.style.setProperty('--i', i));
  });

  const start = () => requestAnimationFrame(() => requestAnimationFrame(() => root.classList.add('ready')));
  if (document.fonts && document.fonts.ready) {
    const wait = parseFloat(getComputedStyle(root).getPropertyValue('--font-wait')) || 200;
    Promise.race([document.fonts.ready, new Promise((r) => setTimeout(r, wait))]).then(start);
  } else start();

  const media = document.querySelectorAll('.case .media');
  if (reduce || !('IntersectionObserver' in window)) {
    media.forEach((m) => m.classList.add('in'));
  } else {
    const io = new IntersectionObserver((entries) => {
      entries.forEach((e) => { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } });
    }, { threshold: 0.15 });
    media.forEach((m) => io.observe(m));
  }

  // QA hook: ?y=1200 scrolls there on load so headless stills can capture scroll states
  const y = new URLSearchParams(location.search).get('y');
  if (y) addEventListener('load', () => { root.style.scrollBehavior = 'auto'; scrollTo(0, +y); });

  // Pinned La Montañita row: when keyboard focus lands inside it, scroll to the
  // pin's start so the case header (and its link) is on screen, not slid away.
  const pin = document.querySelector('.pin');
  const pinned = () => pin && getComputedStyle(pin.querySelector('.pin-stage')).position === 'sticky';
  if (pin) pin.addEventListener('focusin', () => {
    if (!pinned()) return;
    const topY = pin.getBoundingClientRect().top + window.scrollY;
    requestAnimationFrame(() => window.scrollTo({ top: topY, behavior: 'instant' }));
  });

  // The poster row is a keyboard-scrollable region only when it actually scrolls (small screens).
  const row = document.querySelector('.m-row5');
  const syncRow = () => { if (!row) return; const scrolls = row.scrollWidth > row.clientWidth + 1; row.toggleAttribute('tabindex', scrolls); if (scrolls) row.tabIndex = 0; };
  syncRow(); addEventListener('resize', syncRow, { passive: true }); addEventListener('load', syncRow);

  const top = document.querySelector('.top');
  const onScroll = () => top.classList.toggle('is-stuck', window.scrollY > 8);
  onScroll();
  window.addEventListener('scroll', onScroll, { passive: true });
})();
