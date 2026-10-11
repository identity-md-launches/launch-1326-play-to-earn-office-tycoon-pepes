# Implementation and validation record

Date: **12 October 2026, Asia/Taipei** (11 October UTC); the revision checks in the last section were rerun on 11 October 2026 (UTC). This is a record of checks performed by the implementing worker, not an independent certification.

## Delivery and environment

The final source is a Vite/React/TypeScript static application with four hash-routed pages, original SVG city and character art, local fonts, and a local game model. The runtime has no remote API or asset dependency. The complete export is in `dist/`.

The pinned Better Interface main guide, reference workflow, core principles of all six domains, relevant supporting checks, and design-documentation section were read before and during implementation. The provided license was retained in `licenses/interface-guidance.txt`. The guide was applied while building, then used for a rendered review and repairs. The assignment’s requested playful city and static-export constraints remained the design scope.

Tools used: Node 24.21.0, npm 11.19.0, TypeScript, Vite 7.3.7, Node’s test runner through tsx, Chromium through the supplied browser tools, axe-core 4.11.0, and Python for file/contrast measurements. Dependencies and the temporary axe tool were installed under `/tmp`, not in the repository. The build staging copy was compared byte for byte against delivered source and package files. No real chain, wallet, recipient, or owner credentials were needed for this explicitly labelled local simulation.

## Production checks

The actual command transcript is [check-results.txt](check-results.txt), from the final rerun in the repository working copy after `npm ci` from the committed lockfile (the first round ran the same commands in an isolated `/tmp` copy):

| Command | Actual result |
| --- | --- |
| `npm run typecheck` | Exit 0, `tsc --noEmit` |
| `npm run test` | Exit 0, 17 tests passed, none failed/skipped |
| `npm run build` | Exit 0, Vite production export generated |
| `npm run check:export` | Exit 0, 11 files, 719,147 bytes; six local relative references; PNG 1200 × 630 |

The model tests cover the required Pepe before opening; free-first/paid-later mint; charges and invalid company names; per-second accrual; cent fractions; settlement before training; one worker per desk; capacity; release retaining level; all upgrade stages, cooldown and final cap; affordability; level-10 training cap; last/working-worker sale restrictions; sale/repurchase preserving identity and level; boost expiry; eight-hour offline cap; backward clocks; all role probability boundaries; save round-trip and malformed/duplicate/over-capacity saves; and repeated same-time actions. Long timers are advanced deterministically in tests, not waited out.

`base: './'`, hash navigation, and the finished CSS/HTML references were inspected. The static checker verifies every referenced JS/CSS/font/favicon/social-image path exists locally and rejects absolute runtime asset URLs. The final build includes title, description, favicon, `og:title`, `og:image`, image dimensions/alt, and Twitter card metadata. There are no source maps, vendored registry archives, dependency/cache folders, or symlinks in the production export.

The export was served through a temporary HTTP server at **`http://localhost:4173/preview/`**, exercising a gateway-style nested path. The final fresh navigation reported **0 console errors and 0 warnings**; HTML, JS, CSS, both fonts, and favicon all returned HTTP 200 or 304. A temporary preview-server interruption earlier caused favicon connection-refused messages during hash navigation; restarting the preview and doing a fresh full navigation removed them. This was not silently counted as a clean initial run. Temporary unused font preloads had also produced browser warnings and were removed before the final build.

## Useful interaction validation

These were exercised in the rendered production build with browser clicks, input, selects, and real keyboard events. State inspection supplemented visible observations. Where a fixture was used, it is identified below.

| Scenario | Observed outcome |
| --- | --- |
| Fresh mobile start | Product, explanation, balance, and Start playing visible on the first 390 × 844 screen. Button bounds: x=238.14, y=192.78, width=121.86, height=40; bottom=232.78. |
| Onboarding | Free mint produced Pip; whitespace company name displayed inline error with `aria-invalid` and focused input without charging; valid opening charged 250; hiring filled one desk and produced 22/min. |
| Keyboard-only onboarding | From a real Settings reset, Tab/Enter completed Start playing → mint → name/open → hire → Explore. The next-step focus moved correctly; final balance 950, one employed Pepe, Garage. |
| Collect | Balance increased and pending earnings dropped to the retained sub-cent fraction; repeat collection did not duplicate money. |
| Training | Pip level 1 → 2 cost 60 and score became 13.8; later keyboard activation trained to level 3 for 99 and score 15.9. |
| Upgrade | Garage → Small Office cost 600, expanded 3 → 6 desks, changed the visible building, and disabled another upgrade with a live cooldown explanation. Remaining stages/cap checked in the model tests. |
| Additional mint | A second worker, Fern, cost 300; owned-worker count and cards updated. |
| Hiring and filters | Hire/release changed employment and earnings; All, At work, and Available filters produced correct cards/counts and an actionable empty state. |
| Trained-worker sale/repurchase | Released Pip level 2, sold for 246, found the listing at 271, filtered Intern, and bought back. ID 1001, role, appearance, and level 2 persisted; the listing disappeared without duplicate ownership. |
| Marketplace affordability | Unaffordable purchase remained disabled with its amount explanation; role selection and Show all restored results from an empty filter. |
| Coffee | Paid 60; observed a 299-second remaining boost and 37 → 46.25/min. Exact expiration arithmetic checked deterministically. |
| City controls | Office, café, labs, and plaza buttons opened their respective content. Day/night changed scene colors/window lights. Pause stopped the walking workers. Find my office restored 100% zoom and opened the office. |
| Zoom bounds | Three increments reached exactly 160% with Zoom in disabled; three decrements reached 100% with Zoom out disabled. Only the map scrolled; the 390 px page remained 390 px wide. |
| Navigation and dialogs | Hash routes, active navigation, heading focus, Escape dismissal, focus return, focus trapping, and mobile drawer background inertness checked. Shift+Tab wrapped within the drawer. |
| Disabled-action dialog | A cooldown dialog with only Close enabled kept keyboard focus within the dialog after the focus-trap repair. |
| Save and reset | Reload retained progression; cancelled reset retained the company; confirmed reset restored fresh state. A downloaded JSON record was parsed and contained version 1/company/worker data. |
| Corrupt persistence fixture | Injected malformed saved JSON, then reloaded: fresh 1,200 balance, visible recovery warning, usable Start playing. The prior valid session was restored afterward. |
| Long-name fixture | Injected a maximum-length 32-character company name and reloaded at 320 px: heading wrapped over three lines, no document overflow. The normal save was restored. Re-measured in the revision below: the city office label wraps to two lines and clears the café label. |

No real asset transaction or network multiplayer behavior is implied by these checks. Cross-tab event handling was inspected and repaired to avoid timestamp write-back loops, but concurrent transactions across multiple active tabs were not exhaustively tested.

## Better Interface review: six domains

| Domain | Source / non-rendered coverage | Rendered coverage | Findings and result |
| --- | --- | --- | --- |
| Accessibility | Semantic landmarks/headings; accessible icon names; labels, errors and status; focus logic; reduced-motion/forced-colors rules; disabled reasons | Keyboard-only loop, dialog/drawer trapping and return, 200% root-text enlargement, reduced-motion and forced-colors emulation, eight axe scans | Fixed missing roles on labelled groups, changing-dialog focus, title hierarchy, control contrast, and night focus. No scanner violations remained. Native assistive-technology testing remains unperformed. |
| Layout | Fluid grid tracks; six breakpoints; constrained dialogs; map-contained overflow; long names; first-screen order | All four pages at 320/390/768/1024/1440/1920 px; screenshots inspected; 32-character name; enlarged text | Fixed map clipping, mobile labels, sidebar brand wrapping, and clipped enlarged amounts/header. All 24 final page/width measurements had no document horizontal overflow. |
| Writing | Short product headline and plain explanation; direct action labels; costs/units; local-simulation disclosure; empty/error/success states | Fresh onboarding, errors, affordability, cooldown, sale, reset, and marketplace-empty copy read in context | Corrected the earnings equation to show `(Building base + team score) × boosts`. Kept detailed economy/help alongside relevant controls. No placeholder contact, chain, or contract data. |
| Typography | Two local font families; one six-size scale; hierarchy, numeric alignment, wrapping; no tracked uppercase eyebrows | Font-loading status inspected; all page widths; company-name stress case; enlarged text | Fixed wrapping brand and number fragments; changed standalone worker headings to `h2`, and sidebar promotional text to a paragraph. No additional display font or size scale introduced. |
| Colors | Semantic tokens; text/background pairs; role palettes; non-color status cues; interactive borders/focus | Day/night, selected/disabled/error states; axe contrast checks; computed WCAG ratios; forced colors | Darkened muted/filter/role text and control outlines. Added opaque plot-label backing and dual-color night focus. Decorative SVG/composite contrast caveats remain documented below. |
| UI | Consistent button/card/dialog/filter patterns; action eligibility; persistence; confirmation and status; motion conditions | Full gameplay loop, state transitions, pause/zoom, empty states, reset/download, keyboard use | Fixed floating-point zoom boundary, form focus, dialog trapping and enlarged-text layout. All local actions are synchronous; artificial loading spinners were unnecessary. |

### Findings repaired in final source

References point to the implemented fix, not removed code. Line numbers are from the final formatted source.

| Finding | Fix and source reference | Verification |
| --- | --- | --- |
| Small muted text was too light on several tinted surfaces (e.g. 4.27:1 on the page); filter and collection copy also failed contrast | Darkened semantic secondary text and surface-specific labels: `src/styles.css:33`, `src/styles.css:45`, `src/styles.css:1583` | Final eight main-page axe scans: zero violations; measured pairs below |
| Developer rarity and some Intern art labels could cross darker illustration circles | Updated role text colors: `src/styles.css:1603`, `src/styles.css:1613` | Worst representative composited backgrounds calculated; Developer 4.52:1, Intern 4.83:1 |
| Control outline contrast was about 2.06:1 against white | Dedicated `--color-control-border: #86927b`: `src/styles.css:36`, `src/styles.css:2115` | New white-background boundary ratio 3.28:1 |
| Labelled generic elements lacked suitable semantic roles | Balance/filter/onboarding group roles and capacity image role: `src/App.tsx:512`, `src/App.tsx:700`, `src/App.tsx:1029`, `src/App.tsx:1278` | Relevant axe role violations disappeared |
| Native dialog focus could leave after a step removed its focused button, or when only Close was enabled | Explicit Tab wrap and dynamic-content focus recovery: `src/App.tsx:99` | Keyboard-only onboarding and disabled-upgrade dialog passed |
| Worker cards skipped from page `h1` to `h3`; sidebar promotional copy created an irrelevant heading | Worker cards use `h2`; sidebar uses a styled paragraph: `src/App.tsx:180`, `src/App.tsx:648`; styles `src/styles.css:340`, `src/styles.css:1697` | Final heading outline inspected; heading-order rule on the city passed |
| Wide-map crop and small-screen place-label overlap reduced discoverability | Proportional world/viewport sizing and label placement: `src/styles.css:4209`, `src/styles.css:4230`, `src/styles.css:4320` | Inspected 320–1920 px; large map fully fits at 100%, zoom scroll remains internal |
| An SVG floor path filled an unintended triangle, and taller preview roofs could clip | Explicit non-filled detail strokes and adjusted building composition: `src/components/City.tsx:190`, `src/components/City.tsx:328` | Day, night, current building and progression previews inspected |
| Green keyboard focus had poor separation from night scenery | Light outline plus dark halo: `src/styles.css:4258` | Keyboard-focused night place button inspected; outline/halo pair 10.64:1 |
| Long names and 200% text could clip a fixed-height header or split a money amount | Wrapping names, flexible header height, wrapping action rows, non-wrapping figures: `src/styles.css:4265`, `src/styles.css:4281` | 320 px long-name case and 390/768 px text-enlargement checks passed |
| Zoom could retain a floating-point value just short of its end-stop | Round zoom changes to tenths before clamping: `src/components/City.tsx:767`, `src/components/City.tsx:775` | Exact 100%/160% boundaries and disabled buttons checked |
| Visible formula could imply multiplication before summing the building base | Explicit parenthesized equation: `src/App.tsx:906` | Company page read and captured in final screenshot |
| Plot-label text crossed variable artwork; preload links warned as unused | Opaque label surface: `src/styles.css:4345`; removed unnecessary preloads from `index.html` | Final scans/manual pair check; clean final console |

### Color measurements and remaining scanner questions

Ratios were calculated from the actual CSS foreground/background hex values using sRGB relative luminance and `(lighter + .05) / (darker + .05)`. These are calculated pair ratios, not a claim of pixel sampling every point in an illustration.

| Pair | Ratio |
| --- | ---: |
| Muted `#626c5d` on page `#f7f8f2` | 5.14:1 |
| Muted `#626c5d` on marketplace banner `#e9edde` | 4.61:1 |
| Primary text `#fbfcf5` on forest `#273e31` | 11.18:1 |
| Form boundary `#86927b` against white | 3.28:1 |
| Normal focus `#527039` against dialog `#fbfcf6` | 5.45:1 |
| Night outline `#f6f8da` against its `#273e31` halo | 10.64:1 |
| Plot label `#536449` on opaque preview `#f0f3e7` | 5.68:1 |
| Intern text `#4f663e` on representative composited circle `#d9e5c5` | 4.83:1 |
| Developer text `#6d587a` on representative composited circle `#e1d6ec` | 4.52:1 |

The [raw summarized axe results](accessibility-audit.json) retain `incomplete` color-contrast cases (4–14 elements depending on page/width). They include decorative coin/sparkle art, lettering inside decorative SVG building previews, illustration-circle backgrounds, and the building-journey connector pseudo-element. These were inspected to distinguish UI text from artwork; UI colors and representative composited role backgrounds were calculated. This is not an exhaustive pixelwise certification of text drawn inside the art. No unresolved automated violation was hidden by omitting it from the report.

## Responsive, motion, and visual evidence

[layout-audit.json](layout-audit.json) records all 24 final measurements. The observed page widths equal the viewport widths across City, Company, Pepes, and Marketplace at 320, 390, 768, 1024, 1440, and 1920 px. Normal-view screenshots were visually reviewed alongside DOM measurements.

At **200% root font size**, tested at 390 and 768 px, the header grew, the collection control reflowed under its amount, and the page retained its width. This is text-enlargement testing, **not** browser-native page zoom. With `prefers-reduced-motion: reduce`, all seven walking elements reported `animation-name: none`, with no running document animations after settling. Forced-colors emulation at 1024 px retained legible controls, selected boundaries, and focus. This is browser emulation, not a real Windows high-contrast hardware session.

The screenshots were captured from the actual production application. Gameplay balances change naturally between captures; no UI was painted over the screenshots.

| Evidence | View |
| --- | --- |
| [mobile-start.webp](mobile-start.webp) | Fresh 390 × 844 first screen; fresh local-storage fixture only for this capture |
| [desktop-city.webp](desktop-city.webp) | 1440 px day city, upgraded company and live earnings |
| [night-city.webp](night-city.webp) | Same neighbourhood with illuminated windows and night palette |
| [company.webp](company.webp) | Earnings equation, building progression and activity |
| [mobile-pepes.webp](mobile-pepes.webp) | 390 px worker cards and mint action |
| [marketplace.webp](marketplace.webp) | Role-varied trained-worker listings and prices |

## Limitations and non-applicable checks

- No native screen-reader session, Safari/Firefox run, physical touch device, browser-native zoom, right-to-left language, or non-Latin localization was tested. The language is English and the bundled fonts cover Latin.
- Reduced motion and forced colors were emulated; animation inspection at 10% speed and formal motion-sensitivity testing were not performed.
- No real wallet, NFT contract, token transfer, secure server clock, login, multiplayer, or financial settlement is implemented or tested. The local simulation is disclosed in-product and in the README. Local storage/device time are not secure; use a single active tab for predictable play.
- Save JSON export works; an import UI does not exist. Storage-unavailable handling was reviewed in source; the corrupt-data recovery path was tested in-browser. Browser storage quota exhaustion was not forced.
- No actual social-platform unfurl or deployment was tested. Relative metadata and the local social PNG were verified; some external crawlers may require an absolute image URL after publication.
- The city is a vector-rendered isometric scene with clickable places and moving workers, not a free-roaming WebGL world or a simulation of live neighbouring players.
- No dark application theme is claimed. Day/night changes the city. Async backend loading/error states are not applicable to these synchronous local actions.
- No formal performance benchmark, large multiplayer/load test, or independent accessibility audit was run. Automated pass results supplement, rather than replace, the recorded manual review.

## Packaging

`dist/` was regenerated from the final source. Temporary axe injection, older hashed bundles, browser scratch downloads, and package caches were removed from the deliverable. Source, lockfile, all runtime assets, required documentation, notices, and screenshots remain complete. The raw deliverable size and file inventory are recorded in [submission-size.json](submission-size.json); the export hashes are in [export-manifest.json](export-manifest.json).

The explicit path budget for `.gitignore` is **512 bytes** (actual 300 bytes); it excludes dependency/cache directories at every nesting level without excluding `dist/`. The 8,388,608-byte submission limit is checked against all deliverable file bytes, not just the site export. No `.git/`, `.github/`, `.env` file, or repository `node_modules/` was modified. No git submodule or publishing action was created.

## Revision: stale export and narrow-screen label overlap

An independent review reported two defects after the second round. Both were reproduced before anything changed.

| Finding | Reproduction | Cause and fix | Verification |
| --- | --- | --- | --- |
| The committed `dist/` was the build from the round before; the second round's source changes never reached the export | `git diff --stat HEAD~1 HEAD` listed only four `src/` files; `dist/assets` still held `index-BLZ9iJ1D.js` and `index-DQfoHKtL.css`. A fresh `vite build` into `test/scratch/build` produced the reviewer's `index-DvT4iG5N.js` / `index-DX4ZebRe.css`, and string counts differed exactly as reported (`Georgia` 1 vs 0, `font-weight:650` 4 vs 0, `drawer-close` 2 vs 0, `☕` 1 vs 0, `Take your time` 1 vs 0) | The second round rebuilt the export but did not deliver it. `npm run build` was rerun from the final source after the label fix below; `dist/index.html` and `dist/assets/*` were replaced, the old hashed bundles removed, and `export-manifest.json`, `check-results.txt` and `submission-size.json` regenerated | On the rebuilt export served at 390 × 844 with fresh storage: the disclosure `Simulated play · No wallet or real money` is visible under the top bar; Start playing opens a dialog titled `Mint your first Pepe`; the status toast is `display: none` and empty while a dialog is open. With one hired Pepe: the office label has `text-overflow: clip`, `scrollWidth` equals `clientWidth`, and three walking Pepes render (two fixed neighbourhood commuters plus one per hired Pepe). Final CSS declares weights 400, 500, 600 and 800 only |
| At 320 px a wrapped 32-character company name's office pill overlapped the café pill (`src/styles.css` 360 px rule) | 320 × 844 Chromium, save seeded with `Wonderful Lilypad Ventures Co 32` and one hired Pepe: office pill x=113 w=176, café pill right edge 116, overlap 3 px (reviewer: 4 px) | The 360 px rule's `left: 62%` never applied: a later `max-width: 620px` block sets `left: 64%` on the same selector with equal specificity, so it won at every narrow width. The reviewer's proposed 65% was simulated in-page and still left the pills touching (gap 0) because the map is 294 px wide at 320. The dead declaration was removed and a new 360 px block after the 620 px block sets `left: 68%` (`src/styles.css:4094`) | Rebuilt export, same fixture: at 320 px the office pill is x=125–301, 9 px clear of the café pill and 6 px inside the map edge; at 360 px it is 16 px clear and 7 px inside; no document horizontal overflow at either width. Screenshot checked in Chromium. WebKit and Firefox were not run |

The revision touched only the 360 px label rule in `src/styles.css`, the regenerated export and the records above. No other accepted behaviour was changed.
