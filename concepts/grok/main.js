(function () {
  var root = document.documentElement;
  var params = new URLSearchParams(location.search);
  var rest = params.has("rest");
  var hold = params.has("hold");
  if (rest) root.classList.add("rest");

  function applyLang(lang) {
    var next = lang === "es" ? "es" : "en";
    root.lang = next;
    document.querySelectorAll(".lang button").forEach(function (btn) {
      btn.setAttribute("aria-pressed", btn.getAttribute("data-set-lang") === next ? "true" : "false");
    });
    document.title = next === "es"
      ? "Roberto Anduray, diseñador gráfico senior y director creativo"
      : "Roberto Anduray, Senior Graphic Designer and Creative Director";
    try { localStorage.setItem("anduray-lang", next); } catch (e) {}
  }

  document.querySelectorAll(".lang button").forEach(function (btn) {
    btn.addEventListener("click", function () {
      applyLang(btn.getAttribute("data-set-lang"));
    });
  });
  applyLang(root.lang === "es" ? "es" : "en");

  var bar = document.querySelector(".progress span");
  var ticking = false;
  function paintProgress() {
    var max = root.scrollHeight - root.clientHeight;
    var p = max > 0 ? root.scrollTop / max : 0;
    if (bar) bar.style.transform = "scaleX(" + p + ")";
    ticking = false;
  }
  addEventListener("scroll", function () {
    if (!ticking) {
      ticking = true;
      requestAnimationFrame(paintProgress);
    }
  }, { passive: true });
  paintProgress();

  function syncHead() {
    var head = document.querySelector(".top");
    if (head) root.style.setProperty("--head", head.offsetHeight + "px");
  }
  syncHead();
  addEventListener("resize", syncHead);

  var hero = document.querySelector(".hero-visual");
  var shots = document.querySelectorAll(".shot");

  function showAll() {
    shots.forEach(function (el) { el.classList.add("in"); });
    if (hero) hero.classList.add("go");
  }

  if (rest || root.classList.contains("rm")) {
    showAll();
  } else if (hold) {
    /* closed slit, for stills */
  } else {
    requestAnimationFrame(function () {
      requestAnimationFrame(function () {
        if (hero) hero.classList.add("go");
      });
    });
    if ("IntersectionObserver" in window) {
      var io = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting) return;
          var group = entry.target.parentElement.querySelectorAll(".shot");
          var i = Array.prototype.indexOf.call(group, entry.target);
          if (!root.classList.contains("rm")) entry.target.style.transitionDelay = (i * 70) + "ms";
          entry.target.classList.add("in");
          io.unobserve(entry.target);
        });
      }, { threshold: 0.18 });
      shots.forEach(function (el) { io.observe(el); });
    } else {
      showAll();
    }
  }

  var reduceMq = matchMedia("(prefers-reduced-motion: reduce)");
  if (reduceMq.addEventListener) {
    reduceMq.addEventListener("change", function (e) {
      root.classList.toggle("rm", e.matches);
      if (e.matches) showAll();
    });
  }

  document.querySelectorAll(".hscroll").forEach(function (rail) {
    rail.addEventListener("keydown", function (e) {
      if (e.key !== "ArrowRight" && e.key !== "ArrowLeft") return;
      if (rail.scrollWidth <= rail.clientWidth + 2) return;
      var dir = e.key === "ArrowRight" ? 1 : -1;
      rail.scrollBy({
        left: rail.clientWidth * 0.82 * dir,
        behavior: root.classList.contains("rm") ? "auto" : "smooth"
      });
      e.preventDefault();
    });
  });

  function setCurrent(links, id) {
    links.forEach(function (a) {
      var href = a.getAttribute("href") || "";
      var key = href.charAt(0) === "#" ? href.slice(1) : "";
      if (key === id) a.setAttribute("aria-current", "true");
      else a.removeAttribute("aria-current");
    });
  }

  var spyLinks = Array.prototype.slice.call(document.querySelectorAll(".spy a"));
  var navLinks = Array.prototype.slice.call(document.querySelectorAll(".nav a"));
  var navMap = { work: "work", more: "work", practice: "practice", about: "about", contact: "contact" };

  if ("IntersectionObserver" in window) {
    var plateIO = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        setCurrent(spyLinks, entry.target.id);
      });
    }, { rootMargin: "-42% 0px -48% 0px", threshold: 0 });
    document.querySelectorAll("article[data-plate]").forEach(function (el) { plateIO.observe(el); });

    var sectionIO = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        var id = navMap[entry.target.id];
        if (id) setCurrent(navLinks, id);
      });
    }, { rootMargin: "-40% 0px -50% 0px", threshold: 0 });
    ["work", "more", "practice", "about", "contact"].forEach(function (id) {
      var el = document.getElementById(id);
      if (el) sectionIO.observe(el);
    });
  }
})();
