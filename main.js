// Small progressive enhancement: hero entrance, case image reveals, sticky header rule.
(() => {
  const root = document.documentElement;
  // ?still renders the page at rest (for screenshot QA)
  const still = new URLSearchParams(location.search).has('still');
  if (!still) root.classList.add('js');
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // index children for CSS stagger
  document.querySelectorAll('.hero h1 .w, .hero .pieces figure').forEach((el) => {
    el.style.setProperty('--i', [...el.parentElement.children].indexOf(el));
  });
  document.querySelectorAll('.case .media').forEach((m) => {
    [...m.children].forEach((f, i) => f.querySelector('img')?.style.setProperty('--i', i));
  });

  const start = () => requestAnimationFrame(() => requestAnimationFrame(() => root.classList.add('ready')));
  if (document.fonts && document.fonts.ready) {
    Promise.race([document.fonts.ready, new Promise((r) => setTimeout(r, 600))]).then(start);
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

  const top = document.querySelector('.top');
  const onScroll = () => top.classList.toggle('is-stuck', window.scrollY > 8);
  onScroll();
  window.addEventListener('scroll', onScroll, { passive: true });
})();
