(function () {
  document.documentElement.classList.replace("no-js", "js");
  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const head = document.querySelector("[data-sticky]");
  const hero = document.querySelector(".hero");
  const inkCases = document.querySelectorAll(".case--ink, .case--stage");

  function initReveals() {
    const revealEls = document.querySelectorAll("[data-reveal]");
    if (reduced) {
      revealEls.forEach((el) => el.classList.add("is-in"));
      document.querySelectorAll("[data-reveal-group]").forEach((g) => g.classList.add("is-in"));
      return;
    }
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add("is-in");
            io.unobserve(e.target);
          }
        });
      },
      { threshold: 0.12 }
    );
    revealEls.forEach((el) => io.observe(el));

    const groupIo = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add("is-in");
            groupIo.unobserve(e.target);
          }
        });
      },
      { threshold: 0.15 }
    );
    document.querySelectorAll("[data-reveal-group]").forEach((g) => groupIo.observe(g));
  }

  function initHeader() {
    if (!head) return;
    const onScroll = () => {
      const y = window.scrollY;
      const headH = head.offsetHeight;
      let onDark = false;

      if (hero) {
        const heroBottom = hero.getBoundingClientRect().bottom;
        if (heroBottom > headH * 0.6) onDark = true;
      }
      inkCases.forEach((c) => {
        const r = c.getBoundingClientRect();
        if (r.top < headH && r.bottom > headH * 0.25) onDark = true;
      });

      head.classList.toggle("is-ink", onDark);
      head.classList.toggle("is-solid", y > 48 && !onDark);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
  }

  function initCaseAccents() {
    document.querySelectorAll("[data-case]").forEach((caseEl) => {
      const accent = caseEl.getAttribute("data-accent");
      if (accent) caseEl.style.setProperty("--accent", accent);
    });
  }

  function initRegisterNudge() {
    if (reduced) return;
    const marks = document.querySelector(".register-marks");
    if (!marks) return;
    marks.animate(
      [
        { transform: "translate(2px, -1px)" },
        { transform: "translate(0, 0)" },
      ],
      { duration: 600, easing: "cubic-bezier(0.16, 1, 0.3, 1)", fill: "forwards" }
    );
  }

  initReveals();
  initHeader();
  initCaseAccents();
  initRegisterNudge();
})();
