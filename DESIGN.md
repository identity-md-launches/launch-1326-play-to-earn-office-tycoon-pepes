# Pepe & Co. design

## Overview

A working office-tycoon dashboard centered on a small, welcoming Pepe city. The first screen says “Small office. Big dreams.”, explains the product in one line, and offers Start playing before the city illustration. Once a company exists, live earnings and Collect become the most prominent controls.

The interface uses warm cream, forest green, quiet borders, rounded cards, and an original isometric SVG neighbourhood. The scene is deliberately compact: a café, plaza, trees, streets, neighbouring offices, and the player’s visibly growing building. All gameplay controls are ordinary HTML buttons, links, inputs, and selects layered around the art; the illustration is not the only route to an action.

This document describes the implemented source, principally `src/styles.css`, `src/App.tsx`, and `src/components/City.tsx`. It is not a proposed redesign.

## Colors

The root tokens separate palette values from their UI roles. Artwork has its own pastel surface/shadow colors and does not redefine the application palette.

| Semantic token | Implemented value | Use |
| --- | --- | --- |
| `--color-bg` | `#f7f8f2` | Page background |
| `--color-surface` | `#ffffff` | Cards and inputs |
| `--color-surface-soft` | `#eff1e8` | Secondary surfaces |
| `--color-text` / `--color-accent` | `#273e31` | Main text and primary actions |
| `--color-muted` | `#626c5d` | Secondary text |
| `--color-subtle` | `#56654e` | Additional supporting text |
| `--color-border` | `#e1e5d8` | Decorative card separators |
| `--color-control-border` | `#86927b` | Identifiable form-control boundaries |
| `--color-on-accent` | `#fbfcf5` | Primary-button text |
| `--color-accent-hover` | `#3e5d3d` | Primary hover |
| `--color-highlight` | `#c4e795` | Lime accents |
| `--color-selected` | `#e9efdf` | Selected navigation surface |
| `--color-success` / background | `#496c36` / `#e6f3cc` | Positive status |
| `--color-warning` / background | `#82521e` / `#fff0d4` | Save warnings |
| `--color-danger` / background | `#994838` / `#f9e9e4` | Errors and reset |
| `--color-focus` | `#527039` | Visible keyboard outline |
| `--color-text-on-soft` | `#536449` | Labels on tinted panels |
| `--color-scene` / preview | `#eaf0e5` / `#f0f3e7` | City and building panels |

The supporting palette includes creams `#eff1e8`, `#e1e5d8`, `#c8cfc0`; forests `#e9efdf`, `#dbe8c9`, `#63804f`, `#3e5d3d`, `#273e31`; and limes `#e6f3cc`, `#c4e795`, `#b4db7c`.

Worker-role palettes are defined together in `.worker-green`, `.worker-blue`, `.worker-purple`, `.worker-peach`, and `.worker-gold`:

| Role | Surface | Illustration circle | Text |
| --- | --- | --- | --- |
| Intern | `#e5edd5` | `#d2e1bc` | `#4f663e` |
| Analyst | `#e0ecea` | `#c7dad9` | `#3f6466` |
| Developer | `#ece6f3` | `#dbcee9` | `#6d587a` |
| Manager | `#f5e9db` | `#e9d4b9` | `#785539` |
| CEO | `#f6efcc` | `#ecdda3` | `#715d28` |

Role, rarity, employment, level, and selected states also have text, icons, borders, or pressed/current semantics. Color is never their sole explanation. Night is a scene lighting mode, not a dark application theme. Its keyboard focus uses a light `#f6f8da` outline over a dark `#273e31` halo.

## Typography

Locally bundled variable **DM Sans** is the interface/body family (400–700); **Manrope** is the heading/brand family (500–800). Fallbacks are Arial/sans-serif and DM Sans/sans-serif respectively. `font-display: swap` keeps text available while the two Latin WOFF2 files load.

One six-size scale is used for interface text, based on a 16 px root:

| Token | Size | Usage |
| --- | --- | --- |
| `--text-xs` | 0.75rem / 12px | Metadata, units, compact labels |
| `--text-sm` | 0.875rem / 14px | Default interface body and controls |
| `--text-body` | 1rem / 16px | Inputs and card headings |
| `--text-lg` | 1.25rem / 20px | Section/dialog headings and brand |
| `--text-xl` | 1.75rem / 28px | Mobile page headings and figures |
| `--text-display` | 2.25rem / 36px | Desktop page headings and main figures |

Body line-height is 1.5. Page headings use 1.2 with −1.5 px tracking; section headings use 1.3 with −0.55 px tracking. Dialog prose uses 1.8. The headings use weight 800; normal text 400–500 and emphasis 600–650. Mobile headings are 28 px with −1 px tracking. The design has no small tracked uppercase eyebrow labels. Tiny lettering drawn inside the SVG buildings is decorative illustration detail, not interface instructions.

Live amounts use tabular numerals and stay on one line; their action can wrap below at enlarged text sizes. Long company names wrap in headings/dialogs. The constrained city label uses an ellipsis with the full name in its title and office dialog. Page changes focus the new `h1`; worker cards are `h2` sections under their page heading.

## Layout

The declared spacing scale is 4, 8, 12, 16, 20, 24, 32, 40, and 48 px (`--space-1` through `--space-12`). Component padding also includes optical adjustments such as 17, 21, and 34 px; it is not claimed that every measurement is a multiple of four.

On a standard desktop, a fixed 226 px sidebar sits beside the application. The top bar has a minimum 80 px height and grows for enlarged text. Main padding is 32 px vertically and 34 px horizontally. Summary cards form a 1.6:1:1 grid. The city takes remaining width beside a 290 px company rail, with a 22 px gap. Content uses fluid `minmax(0, 1fr)` tracks to avoid accidental page overflow.

| Breakpoint | Implemented behavior |
| --- | --- |
| ≥1650 px | Main side padding 42 px; company rail 320 px; map grows proportionally |
| ≤1250 px | Sidebar narrows to 208 px; gaps/padding tighten |
| ≤1050 px | Sidebar narrows to 192 px; city and company rail stack; company supporting cards reflow |
| ≤800 px | Sidebar becomes a 235 px navigation drawer; compact top bar; 28 px page titles; three worker columns |
| ≤620 px | 17 px main side padding; earnings card spans full width above two summary cards; map and company panels stack; two worker columns; card actions stack |
| ≤360 px | Additional padding and control-spacing adjustments retain the same content order |

At 390 px, the product heading, plain description, and Start playing button appear above the first fold. The button was measured at y=192.78–232.78 px in an 844 px viewport. No introductory hero pushes the game below the fold.

The city viewport uses a 1040:660 ratio on wide screens and 1.18 on narrow screens. Zoom changes the inner world from 100% to 160%; scrolling is contained in the map. The page itself stays within its viewport. Dialogs are 460 px wide, or 620 px for wide content, capped at viewport minus 32 px; their maximum height is viewport minus 48 px with internal vertical scrolling.

## Elevation & Depth

The city creates depth with isometric vector faces, soft ground shadows, overlapping trees, visible window desks, and layered building details. The player building changes across all five levels. The SVG is code-native and shares its building renderer with the office preview and social artwork.

UI elevation stays light: `--shadow-card` is `0 2px 3px #263c3003, 0 0 0 1px #273e3110`; `--shadow-float` is `0 4px 16px #273e3112, 0 1px 3px #273e310d`. Dialogs use `0 24px 100px #142e3533`, with a translucent `#223c3c55` backdrop and 4 px blur. Borders and spacing carry most of the hierarchy.

## Shapes

The radius tokens are 8 px for small elements, 10 px for controls, 16 px for cards, 20 px for panels, and 999 px for pills. Dialogs use a 24 px radius. Avatar windows and role cards repeat these soft shapes. Icons are Lucide strokes; the coin and Pepe mark are original local SVG artwork.

## Components

- **Application navigation:** Four hash links with icon, text, active surface, and `aria-current`. The mobile drawer has an explicit close button, keyboard trapping, Escape dismissal, and inert background content. A skip link reaches the main region.
- **Earnings and summary cards:** Collect, current pending earnings, rate per minute, team work score, and occupied desks. Currency units accompany values. The live timer does not repeatedly announce every tick; user actions announce concise status messages.
- **City:** Original SVG art with an accessible description, ordinary HTML place buttons, day/night select, motion toggle, zoom controls, and Find my office. Offices, café, and plaza open useful dialogs. All key company/worker actions are also available outside the map.
- **Company card and progression:** Current building preview, capacity, employed count, next upgrade, costs, and visible cooldown. The journey shows all five building stages. The equation includes parentheses to make boost order unambiguous.
- **Worker cards:** Portrait, identity, role, rarity, level, work score, employment text, and relevant hire/train/release/sell controls. Filters expose selection with `aria-pressed`. Marketplace cards include explicit prices and affordability states.
- **Buttons:** Forest primary buttons, outlined secondary buttons, quiet text links, and labelled icon controls. Hover is limited to hover-capable pointers. Press feedback uses a 150 ms transition only when reduced motion is not requested. Disabled actions retain nearby reasons such as insufficient funds, full desks, maximum level, or cooldown.
- **Forms and dialogs:** Native `dialog`, explicit heading/description associations, focus containment/restoration, Escape, labelled company-name input, a 32-character limit, and adjacent invalid-input feedback. Onboarding moves focus to the next step after its controls change. Reset and sale have reviewable confirmation dialogs.
- **Feedback:** Persistent local-save status, alert text when storage fails, a downloadable state record, dismissible polite status toast, recent-activity list, and purposeful empty states with an action.
- **Motion and accessibility modes:** Small workers stroll on a 17-second loop in work hours; pause and reduced-motion preferences stop the motion. Forced-colors rules retain control borders, selection and focus; character art retains its illustration palette. The application does not require motion or hover to play.

## Do’s and Don’ts

- Keep the next gameplay action close to its cost, effect, and availability explanation.
- Keep locally simulated assets clearly identified; only add real-value language once an actual system exists.
- Reuse the six typography sizes, semantic UI colors, and existing card/button patterns.
- Preserve full information in accessible text when an illustration or compact label is decorative or truncated.
- Keep new runtime assets local and relative, and inspect the export at a gateway subpath.
- Do not use status color alone, place interaction solely inside SVG art, auto-dismiss errors, or animate when reduced motion is requested.
- Do not replace the early playable controls with a large marketing hero or introduce uppercase tracked labels.
- Do not infer WCAG certification from automated scans; retain keyboard, contrast, enlarged-text, and responsive review when changing the UI.
