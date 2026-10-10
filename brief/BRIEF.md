# Design brief: Roberto Anduray portfolio (v1 style preview)
Owner: Muse. Build: Pixel. Source material: resume.txt, projects.md (24 Behance projects, tiered A/B/C).

## Read on his work
- Range: editorial key visuals (El Heraldo, La Montañita fire), illustrated public-service campaigns (Dengue, his most-viewed project), duotone photo campaigns (Estilo breast self-exam), full brand books (Banpaís 2019), media kits (Buen Provecho, E&N), pitch decks (Leyde via Havas), event key visuals (Estilo Pink Party), in-house social and web content (H2Ocean).
- Strength: concept plus copy. Almost every project credits him "Idea, concept, creative direction, copy". He writes the line and makes the picture, which is rarer than layout skill and should be the headline.
- Look of his work: loud, saturated colour (Banpaís yellow, Estilo mint/pink, fire orange), condensed bold headlines, strong photo and illustration. So the site must stay neutral and let the work carry all the colour.
- Weak spots: the Florida work (H2Ocean, Bug Bite Thing) is thin on Behance (single social posts at 808 px). Packaging, which his resume leads with, has no project at all. Ask him for H2Ocean packaging photos and the Bug Bite Thing brand book; until then the site leads with the Honduras campaigns.

## Directed brief
GOAL: A hiring manager or in-house creative lead around Port St. Lucie, Stuart and Jensen Beach sees within 10 seconds that he has led campaigns for national brands and writes his own concepts, then opens a case study or downloads the CV. Confident, employed tone: no "open to work", no "hire me".
OUTPUT: Static `index.html` + `styles.css` + `tokens.css` + `main.js` + `assets/`, no build step, GitHub Pages. Breakpoints checked at 375 / 768 / 1280 / 1920. Content max width 1440 px.
LOOK:
- Paper `#F3F0E8` (background), ink `#151412` (text, dark bands), muted `#5C574E` (secondary text, 6.3:1 on paper), rule `#D8D2C4` (1 px lines), one accent vermilion `#B23516` (5.4:1 on paper) used only for labels, links, focus rings and the CV button. On ink bands: paper text (16:1), muted `#A39E93` (6.9:1).
- One family: Archivo (variable width + weight, Google Fonts). Display: width 68, weight 800, uppercase, line-height 0.88, tracking -0.01em, size clamp(64px, 13vw, 232px) for the name and clamp(40px, 6vw, 96px) for section heads. Body: width 100, weight 400, 18 px / 1.55 desktop, 16 px / 1.5 mobile, max 62ch. Labels: 12 px, weight 600, tracking 0.08em, uppercase, tabular numbers.
- 12-column grid, gutter 24 px (16 px mobile), outer margin clamp(20px, 4vw, 64px). Asymmetric: text sits in 4-5 columns, images take the rest. Never centre a whole section.
- Materials: flat. Images sit on the paper with no shadow, no radius, no frame. Dark ink band only for the La Montañita case (the fire images need black around them).
SECTIONS (one idea each):
1. Header: name left, Work / Experience / About / Contact and a "Download CV" link right. Sticky only after scroll; 64 px tall.
2. Hero: the name set huge across the full width, a two-sentence positioning line in cols 1-5, three tall pieces from three different clients in cols 6-12 with vertical offsets 0 / 56 / 112 px. Hands off to the client list by a 1 px rule.
3. Clients: "Clients and agencies" label, then names typeset in display caps (El Heraldo, Banpaís, Estilo, E&N, Buen Provecho, Leyde, USAP, QuieroCasa.hn, H2Ocean, Bug Bite Thing, McCann, Havas). Text, not logos.
4. Selected work, six case studies, each a different layout: El Heraldo La Montañita (ink band, 5 posters in a row), El Heraldo Dengue (3 posters, text left), Estilo breast self-exam (3x2 grid), Banpaís brand book (1 large + 4 small), Buen Provecho media kit (1 large + 3), El Heraldo Short Film Festival (posters + spreads). Each has a number, client, title, year, his role in his own words, two sentences and a "View on Behance" link.
5. More work: E&N media kit, Leyde pitch (Havas), Estilo Pink Party, H2Ocean posts, QuieroCasa.hn, USAP, ZOCA ZOCA in a 4-column grid with mixed spans, plus a link to all 24 projects on Behance.
6. Experience: 6 rows (years / role / company, city), plus the Bronze Jade Award and the National Advertising Awards nomination.
7. About: short first-person paragraph (needs his approval), bilingual line.
8. Contact: email as a large link, Behance, CV download. Phone stays in the CV only.
MOTION (tokens in tokens.css, no inline numbers):
- Hero name: words rise 0.35em + fade, 700 ms ease-out-expo, 90 ms stagger. Hero images: 32 px rise + fade, 900 ms ease-out-quint, start 300 ms after the name, 120 ms stagger.
- Case-study images: scale 1.03 to 1 + fade, 800 ms ease-out-quint, once, when 15% visible; 60 ms stagger within a case. Text never animates.
- Hover on More work items: image scale 1.02, 200 ms; link underline offset change 150 ms.
- prefers-reduced-motion: everything visible at rest, no transforms.
BANNED: purple/blue gradients, glow, neon, particles, glassmorphism, fade-and-slide-up on every element, centred-everything sections, hero + 3 feature cards, emoji or icon rows for skills, skill bars or percentages, "open to work" or "available for hire", testimonial carousels, rotating hero words, autoplay video, custom cursors, drop shadows and rounded corners on work images, stock illustrations.
QA: Playwright full-page stills at 375 / 768 / 1280 / 1920 plus the hero at 0 / 400 / 1200 ms; contact sheet; Lighthouse (LCP <= 2.5 s, CLS <= 0.1) and axe pass; fix and re-render.

## Open questions for Luis / Roberto
1. Name on the site: Behance and his email use "Roberto Anduray"; the resume header says "Ramon Roberto Anduray Navarro". v1 uses Roberto Anduray.
2. OK to show the agency work for these clients publicly? (It is already public on his Behance.)
3. Can he send H2Ocean packaging photos and the Bug Bite Thing brand book? Packaging is his resume's lead skill but has no project yet.
4. About copy is a draft in his voice; he should approve it.
