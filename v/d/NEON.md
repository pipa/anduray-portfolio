# Version D: "lights off" neon mode

A layout-independent module for Version D "Wild": one button switches the papercut
diorama between **day** and **neon** ("lights off"). Built by Kernel for Pixel to drop
into `v/d/index.html`. Demo: `neon-demo.html`
([preview](https://raw.githack.com/pipa/anduray-portfolio/versions/d-neon-toggle/v/d/neon-demo.html)).

| File | What it is |
|---|---|
| `tokens.css` | D's **single** colour + motion tokens file. Extend it (sections marked `PIXEL:`), don't replace it. Tokens marked `[neon]` are read by the module. |
| `neon.css` | Toggle button, `.neon-glow` hook, view-transition cross-fade, ignite animation, reduced-motion rules. |
| `neon.js` | Behaviour, 6 KB (2.5 KB gzipped), no dependencies. `defer`. |
| `neon-demo.html` | Placeholder papercut scene (sun + 4 layers) in both modes. Demo-only CSS lives inline in it. |

## Integrate in 4 steps

**1. Head snippet** — inline, first thing in `<head>`, before any stylesheet. It sets
`<html data-mode>` before first paint, so a returning neon visitor never sees a flash of day.

```html
<script>!function(d,k){var m;try{m=localStorage.getItem(k)}catch(e){}if(m!=="neon"&&m!=="day")m=d.hasAttribute("data-neon-follow-os")&&matchMedia("(prefers-color-scheme: dark)").matches?"neon":"day";d.dataset.mode=m}(document.documentElement,"anduray-d-mode")</script>
<meta name="theme-color" content="#F3F0E8"> <!-- optional; neon.js keeps it in sync with --surface -->
<link rel="stylesheet" href="tokens.css">
<link rel="stylesheet" href="neon.css">
<script src="neon.js" defer></script>
```

Don't put `data-mode` on `<html>` in the markup: with JS off there is no `data-mode`, the
page renders day (day values sit on `:root`) and the button is hidden (it can't work without JS).

**2. Button** — anywhere (header, phone menu, both). Any number of them stay in sync.

```html
<button type="button" class="neon-toggle" data-neon-toggle aria-pressed="false">
  <span class="neon-toggle__switch" aria-hidden="true"></span>
  <span class="neon-toggle__label">Lights off</span>
</button>
```

- Keep the label **constant** ("Lights off"); `aria-pressed="true"` means the lights are off.
  Changing the label as well as the pressed state makes screen readers announce a contradiction.
- If you hide the visible label (icon-only), keep it as `.visually-hidden` text or add
  `aria-label="Lights off"`.
- 44 px tall, never shrinks in a flex row, 3 px focus ring in `--focus` with 3 px offset,
  native Enter/Space. Forced-colors mode is handled.
- Buttons added later (e.g. a rendered phone menu) work through event delegation; call
  `DNeon.sync()` once after inserting one so its `aria-pressed` is right.

**3. Glow filter** — define once per page, top of `<body>` (neon.js injects the same filter
if `#neon-glow` is missing, but inline avoids a frame without glow). Muse's spec: 2 px tube
(`--glow-stroke`), 8 px glow (blur sigma 4). `data-px` lets hero.js rescale the blur so it stays
8 px on screen however the SVG is scaled; without hero.js the values are artboard units.

```html
<svg class="neon-defs" aria-hidden="true" focusable="false" width="0" height="0" style="position:absolute;width:0;height:0;overflow:hidden">
  <filter id="neon-glow" x="-20%" y="-60%" width="140%" height="220%" color-interpolation-filters="sRGB">
    <feGaussianBlur in="SourceGraphic" stdDeviation="1" result="near" data-px="stdDeviation:1"/>
    <feGaussianBlur in="SourceGraphic" stdDeviation="4" result="far" data-px="stdDeviation:4"/>
    <feMerge><feMergeNode in="far"/><feMergeNode in="far"/><feMergeNode in="near"/><feMergeNode in="SourceGraphic"/></feMerge>
  </filter>
</svg>
```

**4. Paper layers + glow copies** — each paper layer gets a pre-rendered glow copy with
`class="neon-glow"`. In SVG it is the layer's top edge (open path, no fill) stroked in
`--glow-color` through the static filter. It sits at opacity 0 (and `visibility: hidden`, so it isn't painted) in day and 1 in neon;
only its **opacity** ever animates.

```html
<g class="paper-layer">
  <path class="paper" d="M0 400 C… 1440 385 V640 H0 Z" style="fill: var(--paper-2)"/>
  <path class="neon-glow" d="M0 400 C… 1440 385" style="--glow-color: var(--neon-2); --i: 2"/>
</g>
```

- `--glow-color`: tube colour (`--neon-1` cyan, `--neon-2` pink, `--neon-3` yellow, `--neon-4` green, `--neon-5` orange). Default `--neon-1`.
- `--i`: ignite order (0 = back). Each layer starts `--stagger-ignite` after the previous.
- Use the open edge path for the glow, not the closed fill shape, or the sides and bottom
  of the layer glow too. A closed shape (sun/moon circle) can use the same element.
  (The hero instead overscans each closed path past the artboard so one `<use>` of the fill
  path works as the tube: only the top edge is ever on screen. See HERO.md.)
- `.neon-glow` also works on a whole `<svg>`/`<img>`/`<div>` (e.g. a pre-rendered glow PNG
  per parallax layer): then only the opacity rules apply. That's the cheapest option if
  the filtered SVG costs too much while the scene is scrolling.
- Paper fills: `fill: var(--paper-1…4)`, sun `var(--paper-sun)`; all swap per mode.
  In the demo, `#paper-shadow` (a static `feDropShadow` using `--paper-shadow`) gives the
  cut-paper depth.

## Behaviour

- **Initial mode:** saved choice (`localStorage["anduray-d-mode"]`) → else **day**.
  Opt in to OS dark → neon with `<html data-neon-follow-os>`; it then follows the OS live
  until the user presses the button. Default is off: the papercut day scene is D's first
  impression, and neon is the reveal.
- Only a user's choice (or `DNeon.set`) is saved. Storage blocked (private mode) → it still
  works, just isn't remembered. Other open tabs follow via the `storage` event.
- **Motion (normal):** View Transitions cross-fade of the whole page (new view fades in
  over the old, `--dur-lights-off` 360 ms / `--dur-lights-on` 200 ms, `--ease-premium`),
  then the glow layers ignite back-to-front (`--dur-ignite` 480 ms, one dim-and-catch,
  starting at `--delay-ignite` 180 ms, `--stagger-ignite` 70 ms). Browsers without View
  Transitions swap colours instantly and still play the ignite.
  The UA group animation and `plus-lighter` blend are switched off, so only opacity animates.
- **Reduced motion:** all switch durations are 0 in tokens, neon.js skips the view
  transition and the ignite, so the swap is instant with no flicker. Knob doesn't slide.
- Ignite never plays on page load, only after a switch to neon.
- No flashes: one opacity dip per glow layer, well under 3 flashes per second.

## JS API (for GSAP / scene code)

```js
DNeon.mode            // "day" | "neon"
DNeon.set('neon')     // animated, saved
DNeon.toggle()
DNeon.sync()          // re-sync aria-pressed + theme-color after inserting buttons
document.addEventListener('neon:change', (e) => e.detail /* { mode, source: "user"|"api"|"storage"|"os" } */);
```

## Contrast (WCAG 2.2, relative luminance, computed)

Every text colour passes 4.5:1 on its own surface, so any can be body text.

| Mode | Foreground | Background | Use | Ratio | Needs |
|---|---|---|---|---|---|
| Day | `--text` #151412 | `--surface` #F3F0E8 | body, headings | **16.17:1** | 4.5 |
| Day | `--text-muted` #5C574E | #F3F0E8 | secondary text | **6.30:1** | 4.5 |
| Day | `--accent` #B23516 | #F3F0E8 | links, labels | **5.40:1** | 4.5 |
| Day | `--focus` #B23516 | #F3F0E8 | focus ring | **5.40:1** | 3 |
| Day | `--toggle-border` / track #151412 | #F3F0E8 | toggle outline, switch track | **16.17:1** | 3 |
| Day | knob #F3F0E8 | track #151412 | switch knob | **16.17:1** | 3 |
| Neon | `--text` #F3F0E8 | `--surface` #0E0C14 | body, headings | **17.05:1** | 4.5 |
| Neon | `--text-muted` #A9A3B8 | #0E0C14 | secondary text | **7.97:1** | 4.5 |
| Neon | `--accent` #FF5FA8 | #0E0C14 | links, labels | **6.89:1** | 4.5 |
| Neon | `--focus` #5CF2E6 | #0E0C14 | focus ring, toggle outline, track on | **14.15:1** | 3 |
| Neon | knob #0E0C14 | track on #5CF2E6 | switch knob | **14.15:1** | 3 |
| Neon | tube `--neon-1` #5CF2E6 | `--paper-1` #17142A | graphic edge | **13.08:1** | 3 |
| Neon | tube `--neon-2` #FF5FA8 | `--paper-2` #1C1833 | graphic edge | **6.07:1** | 3 |
| Neon | tube `--neon-3` #FFE45C | `--paper-3` #211C3C | graphic edge | **12.73:1** | 3 |
| Neon | tube `--neon-4` #8CFF6B | `--paper-4` #0A0910 | graphic edge | **15.70:1** | 3 |
| Neon | tube `--neon-5` #FF8A3D | `--sheet-5` #07060B | graphic edge (hero) | **8.61:1** | 3 |

Text over the scene isn't covered: if Pixel sets copy on top of a paper layer, check it
against that layer's fill in both modes (e.g. #151412 on `--paper-3` #F08A5D is 7.45:1, but
`--accent` on it is 2.49:1, not usable). During the 360 ms cross-fade, contrast dips mid-fade as in
any cross-fade; both end states pass.

Note: the root BRIEF bans neon and glow for the main site. That ban doesn't apply to D,
whose brief *is* a neon "lights off" mode, but keep the glow on the scene, not on text.

## Verified (`/workspace/team/portfolio-anduray/tools/neon-check.mjs`)

Playwright 1.64 + Chromium, 375 and 1280: 31/31 checks pass. Initial day + `aria-pressed=false`;
first Tab stop; Space → neon, saved, theme-color updated; Enter → day; reload stays neon with
**neon.js blocked** (head snippet alone, so no flash); only `opacity`/`transform` animate during
the switch; transition classes cleaned up; reduced motion → neon immediately with 0 running
animations; OS dark without opt-in stays day; axe (WCAG 2.0/2.1/2.2 A+AA) clean in day, neon
and reduced-motion neon at both widths; no console errors.
Screenshots: `/workspace/team/portfolio-anduray/renders/d-neon-toggle/`.
