# Anatomy Page Blueprint - Modeled on oklch.fyi

A teardown of [oklch.fyi](https://oklch.fyi/) and a translation layer for building the Numora "Anatomy" page. The goal of the source page is to teach a single concept (OKLCH) through stacked, comparison-driven demos. Our goal is the same: teach inputs → numeric inputs → Numora.

---

## 1. Page-level architecture (oklch.fyi)

Top to bottom:

1. **Top nav bar** - logo (left) · primary nav (center) · social/auth (right)
2. **Hero** - single-sentence promise, two CTAs
3. **~10 educational sections** stacked vertically, each ~one screen tall
4. **Footer** - credit, feedback, sign-in, socials

There is no sidebar, no sticky TOC, no in-page anchor index. The reader scrolls. Each section is self-contained and roughly screen-height, so the page reads like a deck of slides that keep building.

### Top navigation
`Home · Skill · Create · Convert · Color Palettes · Gradients · Gamut Visualizer · Bulk Convert · Saved`

Mostly tools, not docs. The teaching content lives on `/`.

### Hero
- **Headline:** _"Explore color as we see it"_
- **Subheadline:** _"Discover how the OKLCH color model works. Learn, experiment and create more consistent and perceptually uniform color palettes."_
- **Primary CTA:** `Create`
- **Secondary CTA:** `Explore`

No hero illustration. Text-only, generous whitespace, color does the visual work below the fold.

### Footer
`oklch.fyi by Jakub Krehel` · Feedback · Sign in · Ko-fi / Contact / X.

---

## 2. The teaching pattern (the "anatomy" structure)

Every section is one of four shapes:

| Shape | Purpose | Example |
|---|---|---|
| **Definition** | Name a concept and its parts | "What are OKLCH colors?", "Structure" |
| **Comparison** | Show old way vs new way side-by-side | "Consistent brightness", "Predictable shades", "Gradients" |
| **Constraint** | Explain a boundary or failure mode | "Gamut", "Maximum chroma" |
| **Practical** | How to use it in real code | "Browser support & fallbacks" |

The order is deliberate: **define the parts → show why it's better → explain its limits → tell you how to ship it.** This is the anatomy-class arc.

### Section-by-section (in order)

1. **What are OKLCH colors?** - Definition. Code samples of the same color in `oklch / hsl / rgb / lch / lab / xyz / hex`.
2. **Color models** - Definition. Plain-English framing of what a color model is.
3. **Gamut** - Constraint. CIE 1931 chromaticity diagram with Display-P3 vs sRGB overlay.
4. **Structure** - Definition. Annotated `oklch(0.5 0.2 40)` showing Lightness · Chroma · Hue.
5. **Consistent brightness** - Comparison. Row of 4 OKLCH buttons (uniform L) above a row of 4 HSL buttons (visibly inconsistent L).
6. **Predictable shades** - Comparison. Blue shade ramp in OKLCH (clean) vs HSL (drifts in hue/saturation).
7. **Gradients** - Comparison. Yellow→Blue gradient rendered in sRGB, OKLab, OKLCH.
8. **Color space support** - Comparison. sRGB swatch vs Display-P3 swatch.
9. **Maximum chroma** - Constraint. Code sample with an out-of-gamut color, gamut-mapping note.
10. **Browser support & fallbacks** - Practical. CSS with `@supports` fallback to hex.

Each comparison section opens with a relatable scenario ("Let's say you want to create a couple of buttons…") before the demo. **Story → demo → takeaway.**

---

## 3. Voice and typography

- **Tone:** technical-but-friendly. Backticked terms (`oklch`, `lch`) inline. Second person ("you can do the same thing with hsl").
- **Heading hierarchy:** one H1 in the hero, H2 per section, H3 sparingly inside.
- **Code:** monospace blocks with the actual colors rendered live where applicable.
- **Whitespace:** lots of vertical breathing room between sections.

---

## 4. Visual language

- Minimal chrome. The page itself is mostly black/white/neutral so the color demos pop.
- Demos render **live CSS values** - they aren't screenshots. The page is itself a proof of the concept.
- Side-by-side framing for every comparison: old-way left/top, new-way right/bottom, the visual difference is the punchline.
- No icons-as-decoration. Visuals are always doing teaching work.

---

## 5. Demo vocabulary

| Demo type | Used for |
|---|---|
| Static syntax block | Definition sections |
| Live color swatch row | "Consistent brightness", "Color space support" |
| Shade ramp | "Predictable shades" |
| Gradient strip | "Gradients" |
| Annotated code (labels pointing at parts) | "Structure" |
| Diagram (chromaticity) | "Gamut" |
| Code snippet w/ explanation | "Maximum chroma", "Browser support & fallbacks" |

The page mixes ~7 demo types across 10 sections - enough variety to keep scrolling interesting, not enough to feel chaotic.

---

## 6. Patterns worth copying

1. **Problem → solution framing** in every comparison section. Open with a familiar pain ("colors don't look uniform"), then show the fix.
2. **Live demos, not screenshots.** The thing being taught is also the thing rendering the page.
3. **One concept per section.** No section tries to teach two things.
4. **Sequential dependency.** Section N assumes you read section N–1. Don't try to make sections independent - the arc is the product.
5. **Static then interactive.** Most demos read fine without touching them; sliders and toggles are upgrades, not requirements.
6. **Footer stays minimal.** Don't dilute the ending.

## 7. Patterns to avoid copying

- No sidebar / sticky TOC means it's hard to deep-link or skim. For Numora's `/docs/anatomy`, **we already have the docs sidebar** - keep it. The anatomy page lives inside docs, not as a marketing landing page.
- The hero is light on context. For Numora, the hero needs one extra line: _what_ is being dissected here.

---

## 8. Translation: Numora Anatomy page

The same arc, retargeted from "perceptual color" to "precision numeric input."

### Hero
- **Headline:** _"How a numeric input actually works."_ (or similar)
- **Subheadline:** Explain that we're dissecting the HTML input, the things that go wrong with numbers, and how Numora fixes them.
- **CTA:** `Try it` → live demo · `Install` → install page.

### Section arc (proposed)

| # | Section | Shape | Demo |
|---|---|---|---|
| 1 | **What is an `<input>`?** | Definition | Bare `<input type="text">` with annotated parts (value, selectionStart, selectionEnd, type, inputMode, pattern). |
| 2 | **The event pipeline** | Definition | Sequence diagram: `keydown → beforeinput → input → change`. Annotated like the OKLCH "Structure" section. |
| 3 | **Why `Number` is the enemy** | Constraint | `0.1 + 0.2 === 0.30000000000000004`. Side-by-side: float math vs string math. |
| 4 | **What users actually type** | Constraint | Table/demo of edge cases: `1,000.50`, `1.5e-7`, `1k`, `1٬234`, `--5`, leading zeros, mobile keyboard junk. |
| 5 | **Sanitization pipeline** | Definition | Annotated 7-step pipeline (mobile junk → separators → compact → scientific → non-numeric → extra dots → leading zeros). One input, watch each step transform it. |
| 6 | **Plain input vs Numora** | Comparison | Two side-by-side inputs. Type the same thing into both. Plain one breaks; Numora one formats live. |
| 7 | **Format on change vs on blur** | Comparison | Two Numora inputs with different `formatOn` modes, type into both. |
| 8 | **Thousand grouping styles** | Comparison | Three inputs: Thousand (`1,000,000`) · Lakh (`10,00,000`) · Wan (`100,0000`). |
| 9 | **Cursor preservation** | Comparison | Type into the middle of `1,234,567` - show how naive reformatting jumps the cursor, and how Numora keeps it pinned to the right digit. |
| 10 | **`beforeinput` and undo/redo** | Constraint | Explain why we use `beforeinput` over `input`: preserves native undo. Demo: type, undo, redo. |
| 11 | **Raw value vs formatted value** | Practical | `e.target.value` vs `e.target.formattedValue`. Code block + live readout. |
| 12 | **Drop-in usage** | Practical | Final code sample: install + minimal React/vanilla example. |

### Demo types to build

- **Annotated input** (like oklch's `oklch(0.5 0.2 40)` breakdown) - for sections 1, 2, 5.
- **Side-by-side input pair** - for sections 6, 7, 8, 9.
- **Live readout** of `value` / `formattedValue` / `selectionStart` next to an input - for sections 1, 11.
- **Step-through** of the sanitization pipeline - for section 5. The novel one; this is our "gradient comparison."
- **Code block with rendered output** - for sections 3, 12.

### Voice
Match oklch.fyi: technical, second person, scenario-led. _"Let's say a user pastes `1.5e-7` into your price field…"_

### Layout in the docs site
Keep the docs sidebar - the anatomy page is `/docs/anatomy` (one per package), not a landing page. The hero is smaller than oklch's homepage hero because it sits inside the docs shell. Sections are still ~screen-height and stacked.

---

## 9. Build order recommendation

1. Lock the section list (12 above is a starting point - trim to ~8–10 for v1).
2. Build the **annotated input** and **side-by-side input pair** components first; they cover most sections.
3. Build the **sanitization step-through** demo last - it's the showpiece and the most complex.
4. Write copy section-by-section, scenario-first.
5. Ship without a TOC; rely on the docs sidebar.
