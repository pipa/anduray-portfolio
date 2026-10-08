/* Version D "Wild": "lights off" neon mode.
 * Load with <script src="neon.js" defer></script>, after the inline head snippet
 * (see NEON.md) has already set <html data-mode> before first paint.
 *
 * - Any <button data-neon-toggle> toggles the mode
 *   (event delegation, so buttons added later, e.g. in the phone menu, work too).
 * - The mode is <html data-mode="day|neon">. A user's choice is saved in
 *   localStorage ("anduray-d-mode") and synced across open tabs.
 * - No saved choice: day. Opt in to following the OS dark setting with
 *   <html data-neon-follow-os>.
 * - Motion: the page swaps instantly, then the .neon-glow layers ignite
 *   (opacity). With prefers-reduced-motion there is no ignite either.
 *   Durations are read from tokens.css; nothing is hard-coded here.
 * - API: window.DNeon.mode / .set("neon"|"day") / .toggle() / .sync()
 *   Event: document "neon:change" with detail { mode, source }.
 */
(() => {
  'use strict';

  const KEY = 'anduray-d-mode';
  const MODES = ['day', 'neon'];
  const root = document.documentElement;
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const osDark = matchMedia('(prefers-color-scheme: dark)');
  const followOS = root.hasAttribute('data-neon-follow-os');

  let igniteTimer = 0;

  const valid = (m) => MODES.includes(m);

  const stored = () => {
    try {
      const m = localStorage.getItem(KEY);
      return valid(m) ? m : null;
    } catch {
      return null; // storage blocked (private mode, sandboxed iframe)
    }
  };

  const store = (m) => {
    try { localStorage.setItem(KEY, m); } catch { /* not persisted, still works */ }
  };

  const fallbackMode = () => (followOS && osDark.matches ? 'neon' : 'day');

  // "360ms" / "0.36s" from tokens.css -> 360
  const ms = (name) => {
    const v = getComputedStyle(root).getPropertyValue(name).trim();
    const n = parseFloat(v);
    if (!Number.isFinite(n)) return 0;
    return v.endsWith('ms') ? n : v.endsWith('s') ? n * 1000 : n;
  };

  const ensureFilter = () => {
    if (document.getElementById('neon-glow')) return;
    const ns = 'http://www.w3.org/2000/svg';
    const wrap = document.createElement('div');
    wrap.innerHTML =
      `<svg xmlns="${ns}" class="neon-defs" aria-hidden="true" focusable="false" width="0" height="0" style="position:absolute;width:0;height:0;overflow:hidden">` +
      '<filter id="neon-glow" x="-20%" y="-60%" width="140%" height="220%" color-interpolation-filters="sRGB">' +
      '<feGaussianBlur in="SourceGraphic" stdDeviation="1" result="near" data-px="stdDeviation:1"/>' +
      '<feGaussianBlur in="SourceGraphic" stdDeviation="4" result="far" data-px="stdDeviation:4"/>' +
      '<feMerge><feMergeNode in="far"/><feMergeNode in="far"/><feMergeNode in="near"/><feMergeNode in="SourceGraphic"/></feMerge>' +
      '</filter></svg>';
    document.body.prepend(wrap.firstChild);
  };

  const sync = () => {
    const on = root.dataset.mode === 'neon';
    document.querySelectorAll('[data-neon-toggle]').forEach((b) => {
      // The label names what a click does: "Lights off" in day, "Lights on" in neon.
      // No aria-pressed: a changing label plus a pressed state would read as a contradiction.
      b.dataset.on = String(on);
      b.removeAttribute('aria-pressed');
      const label = b.querySelector('.neon-toggle__label');
      if (label) label.textContent = on ? 'Lights on' : 'Lights off';
    });
    const meta = document.querySelector('meta[name="theme-color"]');
    if (meta) meta.setAttribute('content', getComputedStyle(root).getPropertyValue('--surface').trim());
  };

  const apply = (mode) => {
    root.dataset.mode = mode;
    sync();
  };

  const ignite = () => {
    clearTimeout(igniteTimer);
    root.classList.remove('neon-igniting');
    void root.offsetWidth; // restart the animation if toggled again quickly
    root.classList.add('neon-igniting');
    const count = document.querySelectorAll('.neon-glow').length;
    const total = ms('--delay-ignite') + ms('--dur-ignite') + Math.max(0, count - 1) * ms('--stagger-ignite');
    igniteTimer = setTimeout(() => root.classList.remove('neon-igniting'), total);
  };

  const set = (mode, { animate = true, persist = true, source = 'api' } = {}) => {
    if (!valid(mode)) return;
    if (persist) store(mode);
    if (mode === root.dataset.mode) { sync(); return; }

    const motion = animate && !reduced.matches && !document.hidden;
    const swap = () => {
      apply(mode);
      if (motion && mode === 'neon') ignite();
      else { clearTimeout(igniteTimer); root.classList.remove('neon-igniting'); }
      document.dispatchEvent(new CustomEvent('neon:change', { detail: { mode, source } }));
    };

    // Instant swap, then the glow ignites. No full-page cross-fade: its overlay
    // swallowed taps while it ran (2-4 s in Safari), so a quick second tap did nothing.
    swap();
  };

  const toggle = (source = 'api') =>
    set(root.dataset.mode === 'neon' ? 'day' : 'neon', { source });

  // Init: trust what the head snippet set; fall back if it is missing.
  if (!valid(root.dataset.mode)) root.dataset.mode = stored() || fallbackMode();
  ensureFilter();
  sync();

  document.addEventListener('click', (e) => {
    const btn = e.target instanceof Element && e.target.closest('[data-neon-toggle]');
    if (btn) toggle('user');
  });

  // Another tab changed it.
  addEventListener('storage', (e) => {
    if (e.key !== KEY) return;
    set(valid(e.newValue) ? e.newValue : fallbackMode(), { animate: false, persist: false, source: 'storage' });
  });

  // Following the OS only until the user makes a choice.
  if (followOS) {
    osDark.addEventListener('change', () => {
      if (!stored()) set(fallbackMode(), { persist: false, source: 'os' });
    });
  }

  window.DNeon = {
    get mode() { return root.dataset.mode; },
    set: (mode) => set(mode, { source: 'api' }),
    toggle: () => toggle('api'),
    sync,
  };
})();
