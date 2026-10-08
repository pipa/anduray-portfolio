# Version D: papercut hero (day) + neon via "Lights off"

Hero only. Pixel builds the sections and the full page after Version B; this is a
drop-in partial. Preview:
https://raw.githack.com/pipa/anduray-portfolio/versions/d-neon-toggle/v/d/index.html

| File | What it is |
|---|---|
| `index.html` | Head + filter defs + the hero partial between `D:HERO START` / `D:HERO END`, then a placeholder section (`#work`) so the page scrolls. |
| `hero.css` | Hero layout, sheets, name panel, phone layout, reduced motion. Also holds the Archivo `@font-face` and a minimal body reset; move both to D's main CSS when it exists. |
| `hero.js` | Parallax (pointer on desktop, scroll on touch) + filter sizing. `defer`, no dependencies, 5.4 KB (~2 KB gzipped). |
| `tokens.css` | D's single tokens file. Hero tokens are marked `[hero]`. |
| `neon.css` / `neon.js` | The toggle module (NEON.md). |
| `/workspace/team/portfolio-anduray/tools/build_d_hero.py` | Generates `index.html`, including the SVG paths. Edit art there and re-run, or edit the HTML by hand and stop using the script. |

## Integrate into the full page

1. **Head**, in this order: head snippet (NEON.md step 1), font preload, `tokens.css`,
   `neon.css`, `hero.css`, then `neon.js` and `hero.js` with `defer`.
2. **Top of `<body>`**: the one `<svg class="neon-defs">` with `#d-sheet-shadow` and `#neon-glow`.
   Define these once for the whole page.
3. **Hero**: paste everything between `D:HERO START` and `D:HERO END` as the first thing in `<main>`.
   It's a `<section aria-labelledby>` with the page's only `<h1>`.
4. **Toggle**: it sits in `.d-hero__tools` (top right, on its own solid pill). When the
   site header exists, move the `<button data-neon-toggle>` into the header (and phone menu)
   and delete `.d-hero__tools`. Nothing else changes.
5. Replace the `.d-next` placeholder with the real sections. Keep `id="work"` or update links.

## Structure

```
section.d-hero[data-d-hero]          100svh (min 560 px), overflow hidden
  div.d-hero__scene[aria-hidden]     decorative; < 768 px: top 66% only
    div.d-sheet × 5                  one composited layer each (will-change: transform)
      style="--depth: 4..0; --shift: var(--parallax-1..5)"
      svg viewBox 0 0 1440 900, preserveAspectRatio xMaxYMax slice
        g.d-sheet__paper             fill var(--sheet-N), 1 px cut edge, #d-sheet-shadow
          path#d-sheet-N             the cut shape (overscanned to x -80..1520, y ..1000)
        use.neon-glow[href=#d-sheet-N]  same path as a neon tube (opacity only)
  div.d-hero__tools                  toggle on a solid pill
  div.d-hero__panel                  name panel: solid --panel-bg, flat, never moves
```

- **All copy is on solid panels**, never over the art. The panel isn't transformed or
  filtered, so the text stays sharp. On phones it becomes a full-bleed sheet at the foot that
  covers the bottom edge of the scene.
- `xMaxYMax slice` keeps the right side of the artboard on narrow screens (the
  registration-mark sun, wave and palms), while the mountains on the left fall behind the panel.
- Each closed path runs past the artboard, so the sides and bottom are never on screen. That
  lets one `<use>` of the fill path serve as the tube. In neon only the top cut edge lights up.

## Art (back to front)

| # | Fill (day) | Fill (neon) | Tube | Motif |
|---|---|---|---|---|
| 1 | `#F3F0E8` (0%) | `#2E2750` | `--neon-3` yellow | **Registration-mark sun**: printer's crosshair, ring and bullseye quadrants, cut as a stencil (print/ink) |
| 2 | `#B5B2AC` (25%) | `#231E3D` | `--neon-4` green | **Merendón ridge**: the knife-cut mountains over San Pedro Sula |
| 3 | `#7A7873` (50%) | `#19162B` | `--neon-1` cyan | **The wave**: one crossing swell breaking left (Honduras → Florida) |
| 4 | `#44433F` (75%) | `#100D1B` | `--neon-2` pink | **Florida coast**: low dune and two palms |
| 5 | `#151412` (100%) | `#07060B` | `--neon-5` orange | **Ink swell**: the foreground as a roll of ink with a small curl |

The day fills are OKLab steps from paper `#F3F0E8` to ink `#151412` at 0/25/50/75/100%,
i.e. ink tints, like a print proof. Light sky at the back, ink at the front. The neon fills
are the same kind of ramp from night violet `#2E2750` to `#07060B`.
The art is 5 paths + 5 `<use>`; the scene markup totals 4.3 KB inline.

## Muse's spec → implementation

| Spec | How |
|---|---|
| 5 sheets, paper → ink | `--sheet-1..5` (day and neon), table above |
| each sheet offset 6 px more than the one in front | `.d-sheet { top: … - var(--depth) * var(--sheet-step) }`, depth 4..0 back→front, `--sheet-step: 6px` (static; read as "6 px higher") |
| 1 px cut edge | `stroke: var(--edge)` 1 px, `vector-effect: non-scaling-stroke`. Light sheets get `--sheet-edge-dark`, dark ones `--sheet-edge-light`. Transparent in neon. |
| 12 px ink shadow at 18% | `#d-sheet-shadow` feDropShadow sigma 6 (12 px blur), dy -2, `--sheet-shadow-color` / `--sheet-shadow-opacity`. Static; hero.js only rescales it on resize (`data-px`) so it's 12 px on screen at every width. |
| parallax 0/4/8/12/16 px | `--parallax-1..5` via each sheet's `--shift`. Pointer: −x·shift, −y·shift (sheets drift against the pointer), eased with `--parallax-lerp` 0.12. Scroll: `translateY(−progress · shift)` over the hero's height. |
| desktop pointer, touch/coarse scroll | `matchMedia('(hover: hover) and (pointer: fine)')`, re-evaluated live |
| transform-only, rAF, passive | writes only `style.transform`, one rAF at a time, passive listeners, idle when the hero is off screen (IntersectionObserver) or the tab is hidden |
| reduced motion = static | hero.js attaches nothing; CSS forces `transform: none` |
| name panel flat, no parallax, sharp, AA | solid `--panel-bg`, no transform or filter; contrast below |
| neon: 2 px tubes, 8 px glow, opacity only | `.neon-glow` `<use>` per sheet, `--glow-stroke: 2px`, `#neon-glow` blur sigma 4; neon.js ignites it back → front |
| lightweight SVG | inline, 10 drawn nodes, no images; LCP is a text paragraph |

JS: `DHero.mode` (`"pointer" | "scroll" | "off"`), `DHero.fitFilters()`.

## Name panel contrast (WCAG 2.2)

| Mode | Text | On panel | Ratio | Needs |
|---|---|---|---|---|
| Day | name, role `#151412` | `#F3F0E8` | **16.17:1** | 4.5 |
| Day | kicker `#5C574E` (12 px, 600) | `#F3F0E8` | **6.30:1** | 4.5 |
| Day | links `#B23516` (12 px, 600) | `#F3F0E8` | **5.40:1** | 4.5 |
| Day | focus ring `#B23516` | `#F3F0E8` | **5.40:1** | 3 |
| Neon | name, role `#F3F0E8` | `#0E0C14` | **17.05:1** | 4.5 |
| Neon | kicker `#A9A3B8` | `#0E0C14` | **7.97:1** | 4.5 |
| Neon | links `#FF5FA8` | `#0E0C14` | **6.89:1** | 4.5 |
| Neon | focus ring `#5CF2E6` | `#0E0C14` | **14.15:1** | 3 |

## Copy (all from resume.txt / BRIEF.md)

Kicker "Senior Graphic Designer & Creative Director"; H1 "Roberto Anduray"; role line
"18+ years of brand identity, campaigns and content, from agencies in San Pedro Sula,
Honduras, to in‑house brands in Florida." (McCann, IDEAS, Havas → Bug Bite Thing, H2Ocean);
links: Behance and the CV. Nothing about looking for work. If Pixel wants the quiet
current-role line, add it in the about/experience sections, not the hero.

## Verified

`/workspace/team/portfolio-anduray/tools/d-hero-check.mjs` (Playwright 1.64): **56/56 pass**.
- Mode: scroll at 375/768, pointer at 1280/1920, off with reduced motion.
- Pointer at the corner gives the front sheet ~-16 px and the steps are 0/4/8/12/16. 50% scroll gives 0/-2/-4/-6/-8.
- Only `transform` changes and LayoutCount +0 during parallax. No CSS animations on the scene.
- Filters measure 12 px shadow and 8 px glow on screen at every width.
- Tab order: Lights off → Work on Behance → Download CV. Space switches to neon.
- axe (WCAG 2.x A/AA + best practices) is clean in day, neon and reduced-motion neon. No console errors.
- Reduced motion: the scene stays static and the toggle is instant.

The toggle demo regression (`neon-check.mjs`) is still 31/31.

Lighthouse 13 mobile (local server, simulated Slow 4G): Performance 100, Accessibility 100,
Best Practices 100. FCP 0.9 s, **LCP 1.7 s**, **CLS 0**, TBT 0 ms, 126 KiB.
Renders: `/workspace/team/portfolio-anduray/renders/d-hero/` (`final-*`, `final-contact-sheet.jpg`,
loop rounds `r1..r4-sheet.jpg`).
