# 02 — Design System (Single Source of Truth)

**Project:** Protein Pasal — multi-brand protein & sports-supplement store for Nepal
**Applies to:** `E:\CLI\protein-pasal\storefront` (Medusa v2 Next.js starter, App Router, Tailwind v3)
**Status:** FINAL — implementation agents execute this verbatim. Do not re-open decisions.

This document defines every visual token, the Tailwind theme extension, the `next/font`
wiring, the full type scale, and copy-paste-ready component class strings for the brutalist /
editorial creator reskin. If a value is not here, derive it from the nearest rule here — do not
invent new colors, radii, or fonts.

---

## 0. Integration reality (read first)

The storefront is `medusajs/nextjs-starter-medusa`. Its Tailwind config
(`storefront/tailwind.config.js`) already:

- uses `presets: [require("@medusajs/ui-preset")]` and `plugins: [require("tailwindcss-radix")()]`
- sets `darkMode: "class"` and default `fontFamily.sans` to Inter
- defines a custom `borderRadius` scale: `none 0 / soft 2px / base 4px / rounded 8px / large 16px / circle 9999px`
- defines custom `screens`: `2xsmall 320 / xsmall 512 / small 1024 / medium 1280 / large 1440 / xlarge 1680 / 2xlarge 1920`
- ships marketing utilities in `styles/globals.css`: `.content-container` (`max-w-[1440px] px-6`), `.contrast-btn`, `.no-scrollbar`

The Medusa UI preset also injects a **functional typography scale** (`text-base-regular`,
`text-large-semi`, `txt-compact-medium`, `text-xsmall-regular`, etc.) that the starter's cart,
checkout, account, and form components depend on.

**Rule of two type systems:**
1. **Brand display system** (this doc) — used on all marketing/reskin surfaces: home, PLP hero,
   category/brand headers, product-card chrome, footer, banners, marquees.
2. **Medusa functional classes** — KEEP AS-IS on transactional UI (checkout steps, address
   forms, cart line-item tables, account panels). Do not rip these out; reskinning them means
   swapping color tokens and adding uppercase labels, not deleting the classes.

Everything below is **additive**. Merge into `theme.extend`; never replace the preset.

---

## 1. Color tokens

Warm near-black + warm off-white ("paper") + a single racing red. Two working grays plus one
elevated-dark surface. Warm neutrals (not pure `#000`/`#fff`) are what give the editorial feel —
never use `#000000` or `#FFFFFF` for large fields.

| Token        | Hex        | Role |
|--------------|------------|------|
| `ink`        | `#0B0B0B`  | Primary black. Body text on paper; background of dark sections/footer. |
| `coal`       | `#171717`  | Elevated dark surface: cards, inputs, hover panels sitting on `ink`. |
| `paper`      | `#F4F1EA`  | Primary page background (warm off-white). Text color on dark sections. |
| `fog`        | `#E7E3D8`  | Secondary light surface: alternating section band, input fill, skeletons. |
| `line`       | `#D8D3C6`  | Hairline borders/dividers on light. (On dark use `white/12`–`white/15`.) |
| `ash`        | `#6E6A62`  | Muted/secondary text, meta, captions, disabled, eyebrow labels on light. |
| `red`        | `#E10600`  | THE accent. Buttons, one-word highlights, badges, red marquee band, focus ring. |
| `red-deep`   | `#B00500`  | Red hover/pressed only. Never a second accent. |

### 1.1 CSS variables (source of truth for runtime + non-Tailwind CSS)

Add to `styles/globals.css` inside `@layer base` (see §4):

```css
:root {
  --ink: #0B0B0B;
  --coal: #171717;
  --paper: #F4F1EA;
  --fog: #E7E3D8;
  --line: #D8D3C6;
  --ash: #6E6A62;
  --red: #E10600;
  --red-deep: #B00500;
}
```

### 1.2 Usage law (non-negotiable)

- **One accent, everywhere.** Red is the ONLY chromatic color in the entire UI. No blues, greens,
  yellows, gradients-of-color. Success/error states in commerce flows use ink + red + text labels,
  not green/amber fills. (A tiny functional green check inside Medusa checkout is acceptable; do
  not add new colored UI.)
- **Red is emphasis, not a surface tint.** Full red fields are allowed only for: primary red
  button, red marquee band, sale badge, and at most one hero accent shape per page. Do not tint
  large backgrounds red.
- Default page = `paper`. Dark sections = `ink`. Alternating band = `fog`. That 3-value rhythm
  carries the whole layout; do not introduce a 4th background.
- Borders are hairlines (`line` on light, `white/12` on dark) — 1px. Avoid boxed cards with heavy
  borders; prefer dividers and whitespace.

---

## 2. Tailwind theme extension (drop-in)

Merge the following into the existing `theme.extend` in
`storefront/tailwind.config.js`. It preserves the Medusa preset and only adds tokens. Keep the
existing `borderRadius`, `screens`, `transitionProperty`, `colors.grey`, and all keyframes — add
to them.

```js
// theme.extend additions
colors: {
  ink:      "#0B0B0B",
  coal:     "#171717",
  paper:    "#F4F1EA",
  fog:      "#E7E3D8",
  line:     "#D8D3C6",
  ash:      "#6E6A62",
  red:      "#E10600",
  "red-deep": "#B00500",
  // keep existing grey: {…}
},
fontFamily: {
  // redefine sans to consume the next/font var, keep Inter stack as fallback
  sans:    ["var(--font-body)", "Inter", "-apple-system", "BlinkMacSystemFont",
            "Segoe UI", "Roboto", "Helvetica Neue", "Ubuntu", "sans-serif"],
  body:    ["var(--font-body)", "Inter", "sans-serif"],
  display: ["var(--font-display)", "Arial Narrow", "Impact", "sans-serif"],
  mono:    ["var(--font-mono)", "ui-monospace", "SFMono-Regular", "monospace"],
},
fontSize: {
  // [size, { lineHeight, letterSpacing }] — fluid via clamp()
  "display-hero": ["clamp(3.25rem, 11vw, 11rem)",   { lineHeight: "0.85", letterSpacing: "-0.01em" }],
  "display-1":    ["clamp(2.75rem, 7.5vw, 6.5rem)", { lineHeight: "0.90", letterSpacing: "-0.01em" }],
  "display-2":    ["clamp(2.25rem, 5vw, 4.5rem)",   { lineHeight: "0.92", letterSpacing: "-0.01em" }],
  "stat":         ["clamp(3rem, 8vw, 8rem)",        { lineHeight: "0.90", letterSpacing: "-0.02em" }],
  "h1":           ["clamp(2rem, 4vw, 3.25rem)",     { lineHeight: "1.02", letterSpacing: "-0.02em" }],
  "h2":           ["clamp(1.5rem, 3vw, 2.5rem)",    { lineHeight: "1.05", letterSpacing: "-0.01em" }],
  "h3":           ["1.5rem",                        { lineHeight: "1.15", letterSpacing: "-0.01em" }],
  "h4":           ["1.125rem",                      { lineHeight: "1.25" }],
  "body-lg":      ["clamp(1.125rem, 1.6vw, 1.5rem)",{ lineHeight: "1.45" }],
  "body":         ["1rem",                          { lineHeight: "1.6" }],
  "body-sm":      ["0.875rem",                      { lineHeight: "1.55" }],
  "label":        ["0.75rem",                       { lineHeight: "1", letterSpacing: "0.18em" }],
  "label-sm":     ["0.6875rem",                     { lineHeight: "1", letterSpacing: "0.2em" }],
},
letterSpacing: {
  tighter: "-0.04em",
  tight:   "-0.02em",
  label:   "0.18em",
  wide:    "0.06em",
  wider:   "0.24em",
},
borderRadius: {
  // ADD to existing scale (none/soft/base/rounded/large/circle stay)
  pill:  "9999px",   // pills & round buttons (alias of rounded-full)
  photo: "1.25rem",  // 20px — the ONLY radius for framed photos
},
keyframes: {
  // ADD alongside existing keyframes
  "marquee-x":  { "0%": { transform: "translateX(0)" }, "100%": { transform: "translateX(-50%)" } },
  "marquee-x-rev": { "0%": { transform: "translateX(-50%)" }, "100%": { transform: "translateX(0)" } },
  "reveal-up":  { "0%": { opacity: "0", transform: "translateY(16px)" },
                  "100%": { opacity: "1", transform: "translateY(0)" } },
},
animation: {
  // ADD alongside existing animation
  "marquee":     "marquee-x 32s linear infinite",
  "marquee-fast":"marquee-x 20s linear infinite",
  "marquee-rev": "marquee-x-rev 32s linear infinite",
  "reveal-up":   "reveal-up 0.5s cubic-bezier(0.22,1,0.36,1) both",
},
```

### 2.1 Border-radius policy

Sharp corners are the default identity. `rounded-none` is implied everywhere.

- **Sharp (`rounded-none`)**: all sections, section bands, dividers, nav bar, badges, inputs on
  marketing surfaces, product-card image frame edges (product cards are crisp).
- **`rounded-pill` / `rounded-full`**: pill buttons, chip filters, avatar, quantity stepper,
  cart-count bubble, scroll-cue.
- **`rounded-photo` (20px)**: editorial/lifestyle photos in split sections and feature cards ONLY.
- Nothing else gets radius. No `rounded-lg` cards, no soft-cornered panels.

---

## 3. Typography (`next/font`)

Load all three via `next/font/google` (self-hosted, zero layout shift, CSP-safe). Wire once in
`src/app/layout.tsx`.

- **Display** = **Anton** (single weight 400, ultra-condensed grotesque). Giant headlines, stat
  numbers, section titles, stacked link rows, marquees. Always `uppercase`, tight tracking.
  Fallback stack: Arial Narrow / Impact.
- **Body** = **Inter** (variable). All running text, buttons, product names, nav, forms. Matches
  the Medusa preset's existing `sans`, so functional components inherit cleanly.
- **Mono / labels** = **Space Mono** (400/700). Small uppercase eyebrows, kicker labels, meta,
  tags, ticker micro-text, and numeric price emphasis where a mono tick reads well. Gives the
  brutalist "spec-sheet" texture. Fallback: JetBrains Mono / ui-monospace.

### 3.1 `layout.tsx` wiring (exact)

```tsx
import { Anton, Inter, Space_Mono } from "next/font/google"

const display = Anton({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-display",
  display: "swap",
})
const body = Inter({
  subsets: ["latin"],
  variable: "--font-body",
  display: "swap",
})
const mono = Space_Mono({
  weight: ["400", "700"],
  subsets: ["latin"],
  variable: "--font-mono",
  display: "swap",
})

export default function RootLayout(props: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      data-mode="light"
      className={`${display.variable} ${body.variable} ${mono.variable}`}
    >
      <body className="bg-paper text-ink font-body antialiased">
        <main className="relative">{props.children}</main>
      </body>
    </html>
  )
}
```

The `.variable` classes expose `--font-display / --font-body / --font-mono`, which the
`fontFamily` extension in §2 consumes. After this, `font-display`, `font-body`/`font-sans`, and
`font-mono` all work as Tailwind utilities.

### 3.2 Type scale reference

| Utility class                                   | Font    | Case      | Use |
|-------------------------------------------------|---------|-----------|-----|
| `font-display text-display-hero uppercase`      | Anton   | UPPER     | Hero headline (full-bleed). |
| `font-display text-display-1 uppercase`         | Anton   | UPPER     | Section titles (centered giant caps). |
| `font-display text-display-2 uppercase`         | Anton   | UPPER     | Split-section heads, stacked link rows. |
| `font-display text-stat uppercase`              | Anton   | UPPER     | Stat-row numbers. |
| `font-body text-h1 font-bold`                   | Inter   | sentence  | Page H1 on non-hero pages (PLP/PDP title). |
| `font-body text-h2 font-bold`                   | Inter   | sentence  | Sub-section headings inside content. |
| `font-body text-h3 font-semibold`               | Inter   | sentence  | Card group titles, PDP section titles. |
| `font-body text-h4 font-semibold`               | Inter   | sentence  | Small headings, accordion triggers. |
| `font-body text-body-lg`                        | Inter   | sentence  | Intro statement block, lede paragraphs. |
| `font-body text-body`                           | Inter   | sentence  | Default body copy (min 16px). |
| `font-body text-body-sm text-ash`               | Inter   | sentence  | Secondary/meta copy. |
| `font-mono text-label uppercase tracking-label` | Sp.Mono | UPPER     | Eyebrows, kicker labels, brand tag, ticker micro. |
| `font-body text-sm font-semibold uppercase`     | Inter   | UPPER     | Button labels, nav links, product names. |
| `font-body font-bold` (1–1.25rem)               | Inter   | —         | Prices (NPR). |

**Uppercase rule:** apply caps via CSS (`uppercase` / `text-transform`), NEVER by typing capitals
into content. Keep DOM text in normal case so screen readers pronounce it correctly and CMS/search
stay clean.

---

## 4. Global CSS additions

Append to `styles/globals.css`. Adds base tokens, layout shell, marquee mechanics, reveal, focus,
and image-treatment utilities.

```css
@layer base {
  :root {
    --ink:#0B0B0B; --coal:#171717; --paper:#F4F1EA; --fog:#E7E3D8;
    --line:#D8D3C6; --ash:#6E6A62; --red:#E10600; --red-deep:#B00500;
  }
  ::selection { background: var(--red); color: var(--paper); }
  body { text-rendering: optimizeLegibility; }
}

@layer components {
  /* Full-bleed marketing shell (wider than Medusa's .content-container 1440). */
  .shell { @apply mx-auto w-full max-w-[1600px] px-5 md:px-8 lg:px-12; }
  /* Vertical rhythm for marketing sections. */
  .section-y { @apply py-16 md:py-24 lg:py-32; }
}

@layer utilities {
  /* Marquee track: place TWO identical rows inside; animate the flex parent. */
  .marquee-mask { -webkit-mask-image: linear-gradient(90deg, transparent, #000 6%, #000 94%, transparent); }

  /* Image treatments (see §7). */
  .img-editorial { filter: grayscale(1) contrast(1.05); }
  .img-product   { filter: none; }
  .img-editorial-hover { filter: grayscale(1) contrast(1.05); transition: filter .3s ease; }
  .group:hover .img-editorial-hover { filter: grayscale(0) contrast(1); }

  /* Outline display text (used for some footer marquee copies). */
  .text-stroke { -webkit-text-stroke: 1.5px var(--paper); color: transparent; }
  .text-stroke-ink { -webkit-text-stroke: 1.5px var(--ink); color: transparent; }
}

/* Accessibility: kill motion for users who ask. */
@media (prefers-reduced-motion: reduce) {
  .animate-marquee, .animate-marquee-fast, .animate-marquee-rev,
  .animate-reveal-up { animation: none !important; }
  * { scroll-behavior: auto !important; }
}
```

**Global focus ring** (add once, applies app-wide):

```css
@layer base {
  :where(a, button, [role="button"], input, select, textarea, [tabindex]):focus-visible {
    outline: none;
    box-shadow: 0 0 0 2px var(--paper), 0 0 0 4px var(--red);
  }
  /* On dark surfaces, swap the inner offset color. */
  .on-dark :where(a,button,[role="button"],input,select,textarea,[tabindex]):focus-visible {
    box-shadow: 0 0 0 2px var(--ink), 0 0 0 4px var(--red);
  }
}
```

---

## 5. Component specs (exact Tailwind classes)

Copy these class strings. `group`/`peer` usage is indicated. All hover transforms are ≤200ms,
ease-out, no bounce.

### 5.1 Pill button with arrow

Base shared classes (all variants):
```
inline-flex items-center gap-3 rounded-full px-7 py-3.5 font-body text-sm font-semibold
uppercase tracking-wide transition-transform duration-150 ease-out
hover:-translate-y-0.5 active:translate-y-0 will-change-transform group
```

Variants (append):
- **Primary (black):** `bg-ink text-paper hover:bg-coal`
- **Inverse (on dark):** `bg-paper text-ink hover:bg-white`
- **Red:** `bg-red text-paper hover:bg-red-deep`
- **Outline / ghost:** `bg-transparent text-ink border border-ink hover:bg-ink hover:text-paper`
- **Outline on dark:** `bg-transparent text-paper border border-white/40 hover:bg-paper hover:text-ink`

Arrow glyph — nest inside the button; it slides on hover:
```html
<span class="grid h-5 w-5 place-items-center transition-transform duration-150 ease-out group-hover:translate-x-1">
  <!-- inline arrow ↗ -->
  <svg viewBox="0 0 16 16" class="h-4 w-4" fill="none" stroke="currentColor" stroke-width="2">
    <path d="M4 12L12 4M6 4h6v6" stroke-linecap="square"/>
  </svg>
</span>
```
For a circular-arrow reference variant, wrap the SVG in
`rounded-full bg-red text-paper` and place it as a trailing badge (e.g. hero CTA).

Min touch target: `py-3.5` + line-height yields ≈48px height. Never go below `py-3` (44px).

### 5.2 Section header (giant centered caps)

```html
<header class="text-center max-w-4xl mx-auto">
  <p class="font-mono text-label uppercase tracking-label text-red mb-4">Shop by goal</p>
  <h2 class="font-display text-display-1 uppercase text-ink">
    Fuel <span class="text-red">every</span> rep
  </h2>
</header>
```
Rules: one optional red word max. Eyebrow is mono + red (or `text-ash`). Center-aligned; never
add a decorative underline — whitespace + the eyebrow carry hierarchy.

### 5.3 Stat row with vertical rules

```html
<dl class="grid grid-cols-2 md:grid-cols-3 divide-x divide-ink/15 border-y border-ink/15">
  <div class="px-6 py-10 text-center">
    <dt class="sr-only">Brands</dt>
    <dd class="font-display text-stat uppercase text-ink leading-none">30+</dd>
    <p class="mt-3 font-mono text-label uppercase tracking-label text-ash">Global brands</p>
  </div>
  <!-- repeat cells: 100% Authentic · 24 HR Kathmandu delivery -->
</dl>
```
On dark section: swap to `divide-white/15 border-white/15`, `text-paper`, label `text-paper/60`.
Vertical rules come exclusively from `divide-x`; do not draw manual borders.

### 5.4 Marquee ticker strip (red band + black band)

Structure: an overflow-hidden band with a flex track holding **two identical rows**; animate the
track. Second row is `aria-hidden`.

```html
<!-- RED BAND -->
<div class="relative overflow-hidden bg-red text-paper py-3 select-none">
  <div class="flex w-max animate-marquee">
    <ul class="flex shrink-0 items-center gap-10 pr-10 font-display text-2xl uppercase tracking-tight">
      <li>100% Authentic</li><li aria-hidden="true">✦</li>
      <li>Free delivery over Rs 5000</li><li aria-hidden="true">✦</li>
      <li>Cash on delivery</li><li aria-hidden="true">✦</li>
    </ul>
    <ul aria-hidden="true" class="flex shrink-0 items-center gap-10 pr-10 font-display text-2xl uppercase tracking-tight">
      <!-- identical copy -->
    </ul>
  </div>
</div>
```

- **Black band variant:** `bg-ink text-paper`, separators `text-red` (`✦` or `●`).
- **Micro-ticker (spec-sheet):** replace `font-display text-2xl` with
  `font-mono text-label uppercase tracking-label`, `gap-6`, `py-2.5` — for thin utility strips.
- Pause on hover/focus: add `hover:[animation-play-state:paused] focus-within:[animation-play-state:paused]`.
- Reverse direction row: use `animate-marquee-rev` (for a two-row opposed marquee).
- The whole strip should carry `role="marquee"` semantics only if it contains meaningful text;
  otherwise mark decorative copies `aria-hidden`.

### 5.5 Product card

Product photos are **full color** (`.img-product`) — trust matters for real tubs. Card chrome is
sharp; only the tiny sale badge is red.

```html
<article class="group flex flex-col bg-paper">
  <a class="relative block aspect-[3/4] overflow-hidden bg-fog rounded-base">
    <img src="…" alt="Optimum Nutrition Gold Standard Whey — Double Rich Chocolate"
         class="img-product h-full w-full object-cover transition-transform duration-300 ease-out group-hover:scale-[1.03]" />
    <!-- SALE badge (optional) -->
    <span class="absolute left-0 top-0 bg-red text-paper font-mono text-label-sm uppercase tracking-wider px-2.5 py-1.5">Sale</span>
    <!-- Quick-add reveal -->
    <span class="absolute inset-x-3 bottom-3 translate-y-3 opacity-0 transition-all duration-200 ease-out
                 group-hover:translate-y-0 group-hover:opacity-100">
      <button class="w-full rounded-full bg-ink text-paper py-3 font-body text-xs font-semibold uppercase tracking-wide hover:bg-red">Add to cart</button>
    </span>
  </a>
  <p class="mt-4 font-mono text-label uppercase tracking-label text-ash">Optimum Nutrition</p>
  <h3 class="mt-1.5 font-body text-sm font-semibold uppercase leading-tight text-ink line-clamp-2">
    Gold Standard 100% Whey — 2&nbsp;lb
  </h3>
  <div class="mt-2 flex items-baseline gap-2">
    <span class="font-body font-bold text-ink">Rs&nbsp;7,499</span>
    <span class="font-body text-body-sm text-ash line-through">Rs&nbsp;8,200</span>
  </div>
</article>
```

- Brand label (mono, ash) = the Medusa **Collection** name. Product name uppercase, 2-line clamp.
- Price: `Rs 7,499` — thin space between `Rs` and number, comma grouping. Sale price in `red`
  with old price `line-through text-ash`. Sale must ALSO carry the "Sale" text badge + strikethrough
  (never color alone).
- No drop shadow. Image frame `rounded-base` (4px) is the only softening; keep `bg-fog` behind so
  transparent PNG tubs sit on a neutral field.

### 5.6 Horizontal scroll card row

```html
<div class="flex gap-4 overflow-x-auto no-scrollbar snap-x snap-mandatory scroll-px-5 px-5 md:px-8 lg:px-12 pb-4">
  <div class="snap-start shrink-0 w-[78vw] xsmall:w-[340px]"><!-- product/brand card --></div>
  <!-- … -->
</div>
```
Uses the starter's existing `.no-scrollbar`. Snap to start, generous first/last inset via
`scroll-px` matching the shell padding. Optional prev/next arrow buttons reuse the icon-button
spec (round, `border border-ink hover:bg-ink hover:text-paper`).

### 5.7 Giant stacked link-list rows (hover-fill)

Full-width rows, hairline-separated, ink sweeps up on hover and text inverts to paper.

```html
<nav class="border-b border-ink/15">
  <a class="group relative flex items-center justify-between overflow-hidden border-t border-ink/15 py-6 md:py-9 px-1">
    <span class="pointer-events-none absolute inset-0 -z-0 bg-ink translate-y-full transition-transform duration-200 ease-out group-hover:translate-y-0"></span>
    <span class="relative z-10 font-display text-display-2 uppercase leading-none text-ink transition-colors duration-200 group-hover:text-paper">
      Whey Protein
    </span>
    <span class="relative z-10 flex items-center gap-3 transition-colors duration-200 group-hover:text-paper">
      <span class="font-mono text-label uppercase tracking-label text-ash group-hover:text-paper/70">128 products</span>
      <svg viewBox="0 0 16 16" class="h-5 w-5 -translate-x-1 transition-transform duration-200 group-hover:translate-x-0 text-ink group-hover:text-red" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 8h10M9 4l4 4-4 4" stroke-linecap="square"/></svg>
    </span>
  </a>
  <!-- repeat rows: Mass Gainer / Creatine / Pre-Workout / BCAA & EAA / Protein Bars / Multivitamins -->
</nav>
```
The fill is a translated ink layer (GPU-cheap, no reflow). Arrow tip turns `red` on hover for the
one-accent pop against the inverted row.

### 5.8 Dark split feature section

```html
<section class="on-dark bg-ink text-paper">
  <div class="shell section-y grid items-center gap-10 md:grid-cols-2 md:gap-16">
    <div>
      <p class="font-mono text-label uppercase tracking-label text-red mb-5">Bulk & save</p>
      <h2 class="font-display text-display-2 uppercase leading-[0.92]">Mass gainers that mean business</h2>
      <p class="mt-6 max-w-md font-body text-body-lg text-paper/80">Up to 1250 kcal a serving from the brands lifters actually trust. Stacked, sealed, and shipped across Nepal.</p>
      <a class="mt-8 inline-flex items-center gap-3 rounded-full bg-paper text-ink px-7 py-3.5 font-body text-sm font-semibold uppercase tracking-wide transition-transform duration-150 ease-out hover:-translate-y-0.5 group">
        Shop mass gainers
        <span class="transition-transform duration-150 group-hover:translate-x-1">→</span>
      </a>
    </div>
    <div class="relative aspect-[4/5] overflow-hidden rounded-photo bg-coal">
      <img src="…" alt="" class="img-editorial h-full w-full object-cover" />
    </div>
  </div>
</section>
```
`on-dark` swaps the focus-ring offset to ink. Photo is `rounded-photo` + grayscale editorial.
Eyebrow red, one CTA. Reverse the column order per section with `md:[&>div:first-child]:order-2`
or by markup to alternate rhythm.

### 5.9 Full-bleed photo hero

```html
<section class="relative flex min-h-[88vh] items-center justify-center overflow-hidden bg-ink">
  <img src="…" alt="" class="img-editorial absolute inset-0 h-full w-full object-cover" />
  <div class="absolute inset-0 bg-ink/45"></div>
  <div class="on-dark relative z-10 shell text-center text-paper">
    <p class="font-mono text-label uppercase tracking-label text-paper/80 mb-6">Nepal's multi-brand supplement store</p>
    <h1 class="font-display text-display-hero uppercase leading-[0.85]">
      Real gains<br/><span class="text-red">start here</span>
    </h1>
    <p class="mx-auto mt-6 max-w-xl font-body text-body-lg text-paper/85">Optimum Nutrition, MuscleBlaze, Dymatize & 30+ brands. 100% authentic. Delivered nationwide.</p>
    <div class="mt-9 flex flex-wrap justify-center gap-3">
      <a class="… pill primary but inverse: bg-paper text-ink …">Shop all <span>→</span></a>
      <a class="… pill outline on dark …">Browse brands</a>
    </div>
  </div>
</section>
```
Hero image is grayscale editorial; the only color on the hero is the red word + (optionally) a red
CTA. Overlay `bg-ink/45` guarantees paper text contrast over any photo. Add a bottom scroll-cue
(small `rounded-full border border-paper/40` pill or bouncing chevron — chevron uses a slow
2s fade, not a spring).

### 5.10 Footer with giant repeating brand marquee

```html
<footer class="on-dark bg-ink text-paper">
  <div class="shell section-y grid gap-10 md:grid-cols-[1.4fr_repeat(3,1fr)]">
    <div>
      <p class="font-display text-3xl uppercase leading-none">Protein Pasal</p>
      <p class="mt-4 max-w-xs font-body text-body-sm text-paper/70">Authentic sports nutrition, delivered across Nepal. Cash on delivery available.</p>
      <!-- newsletter: sharp input + red submit -->
      <form class="mt-6 flex max-w-sm">
        <input type="email" placeholder="Email address"
               class="min-w-0 flex-1 bg-coal border border-white/15 px-4 py-3 font-body text-sm text-paper placeholder:text-paper/40 focus:border-red" />
        <button class="bg-red text-paper px-5 font-body text-sm font-semibold uppercase tracking-wide hover:bg-red-deep">Join</button>
      </form>
    </div>
    <!-- 3 link columns: Shop / Brands / Support -->
    <nav class="flex flex-col gap-3">
      <p class="font-mono text-label uppercase tracking-label text-paper/50">Shop</p>
      <a class="font-body text-sm text-paper/80 hover:text-paper hover:underline underline-offset-4">Whey Protein</a>
      <!-- … -->
    </nav>
  </div>

  <!-- GIANT repeating brand marquee at the very bottom -->
  <div class="overflow-hidden border-t border-white/10 py-6 select-none">
    <div class="flex w-max animate-marquee">
      <span class="shrink-0 pr-8 font-display text-[clamp(3rem,12vw,10rem)] uppercase leading-none text-paper/90">Protein Pasal ✦&nbsp;</span>
      <span aria-hidden="true" class="shrink-0 pr-8 font-display text-[clamp(3rem,12vw,10rem)] uppercase leading-none text-stroke">Protein Pasal ✦&nbsp;</span>
      <span aria-hidden="true" class="shrink-0 pr-8 font-display text-[clamp(3rem,12vw,10rem)] uppercase leading-none text-paper/90">Protein Pasal ✦&nbsp;</span>
      <span aria-hidden="true" class="shrink-0 pr-8 font-display text-[clamp(3rem,12vw,10rem)] uppercase leading-none text-stroke">Protein Pasal ✦&nbsp;</span>
    </div>
  </div>
  <div class="shell flex flex-col gap-2 border-t border-white/10 py-6 text-paper/50 md:flex-row md:justify-between">
    <p class="font-mono text-label-sm uppercase tracking-label">© 2026 Protein Pasal</p>
    <p class="font-mono text-label-sm uppercase tracking-label">Kathmandu · Nepal</p>
  </div>
</footer>
```
Alternate solid (`text-paper/90`) and outline (`.text-stroke`) copies for the striped-poster look.
First copy is real text; the rest `aria-hidden`.

### 5.11 Supporting components (specs)

- **Eyebrow / kicker label:** `font-mono text-label uppercase tracking-label text-red` (or `text-ash`
  on busy backgrounds). Always sits directly above a heading, `mb-4`/`mb-5`.
- **Brand / filter chip:** `inline-flex items-center rounded-full border border-ink/25 px-4 py-2
  font-body text-xs font-semibold uppercase tracking-wide hover:border-ink`. Active:
  `bg-ink text-paper border-ink`.
- **Sale badge:** `bg-red text-paper font-mono text-label-sm uppercase tracking-wider px-2.5 py-1.5`
  (sharp corners).
- **Trust badge ("100% Authentic"):** `inline-flex items-center gap-2 border border-ink/20 px-3 py-1.5
  font-mono text-label-sm uppercase tracking-label text-ash` with a small ink check icon.
- **Icon button (round):** `grid h-11 w-11 place-items-center rounded-full border border-ink
  text-ink transition-colors hover:bg-ink hover:text-paper` (≥44px).
- **Input (marketing/light):** `w-full bg-paper border border-line px-4 py-3 font-body text-sm
  text-ink placeholder:text-ash focus:border-ink` — sharp corners, hairline border, no ring beyond
  the global focus-visible.
- **Cart count bubble:** `min-w-5 h-5 rounded-full bg-red text-paper text-[11px] font-bold grid place-items-center px-1`.
- **Section band (alternating):** wrap a section in `bg-fog` to break the paper rhythm; keep the
  same `.shell .section-y` inner container.

---

## 6. Interaction & motion

Fast, mechanical, no bounce. Motion communicates direction (slides, sweeps), never personality
via overshoot.

| Kind | Duration | Easing |
|------|----------|--------|
| Button/arrow/hover micro | 120–150ms | `ease-out` |
| Fill sweeps, reveals, quick-add | 180–220ms | `cubic-bezier(0.22,1,0.36,1)` |
| Image zoom on hover | 300ms | `ease-out` |
| Scroll-reveal (once) | 500ms | `cubic-bezier(0.22,1,0.36,1)` |
| Marquees | 20–32s | `linear` (only linear is allowed) |

Rules:
- **Allowed hovers:** `-translate-y-0.5` (buttons lift), `translate-x-1` (arrows advance), underline
  grow (`hover:underline underline-offset-4`), ink fill-sweep (link rows), `scale-[1.03]` image
  zoom, color inversion.
- **Banned:** bounce/spring/elastic easings, rotation gimmicks, scale > 1.04, parallax on text,
  blur transitions, anything that reflows layout on hover, color-cycling.
- **Tap/active:** `active:translate-y-0` (settle) only. No press-scale.
- **Scroll reveal** (optional, tasteful): `animate-reveal-up` on section entrances via
  IntersectionObserver, run ONCE, never re-trigger. Skip on hero (above the fold shows instantly).
- Respect `prefers-reduced-motion` — §4 already disables marquees + reveals; also gate JS-driven
  reveals behind the same media query.
- Marquees pause on hover/focus-within (§5.4).

---

## 7. Image treatment (decided — be consistent)

Two, and only two, image classes. Getting this wrong is the fastest way to look inconsistent.

1. **Editorial / lifestyle / hero / brand-story / feature photos → GRAYSCALE.**
   Use `.img-editorial` (`grayscale(1) contrast(1.05)`). This is the identity: black-and-white
   photography carries the brutalist tone, and the single red lives in the UI on top of it. The
   only color permitted over these photos is: the red accent word, a red badge/shape, or a
   `bg-ink/40–55` scrim for legibility. **Never** recolor a photo with a red duotone/tint — red
   stays graphic, not photographic.

2. **Product photos (actual supplement tubs/packaging) → FULL COLOR, always.**
   Use `.img-product`. Real brand colors are load-bearing for trust and purchase accuracy in a
   multi-brand catalog — a grayscale ON tub is a usability regression. Product images sit on
   `bg-fog` (or `bg-paper`), object-cover, `rounded-base` frame.

Optional flourish: on lifestyle **cards** (not hero, not product), a grayscale→color hover reveal
is allowed via `.img-editorial-hover` + `group` — use sparingly and never on product cards (they're
already color).

Do NOT mix: no half-grayscale collages, no per-image exceptions. If it's a person/scene → gray.
If it's a product you can buy → color.

---

## 8. Accessibility

Verified contrast ratios (WCAG 2.1, computed for these exact hex values):

| Pairing | Ratio | Verdict |
|---------|-------|---------|
| `ink` text on `paper` | **17.5:1** | AAA — default body. |
| `paper` text on `ink` | **17.5:1** | AAA — dark sections. |
| `ash` text on `paper` | **4.77:1** | AA normal text ✓ (secondary copy OK). |
| `paper` on `red` (button) | **4.97:1** | AA normal ✓ — **use white/paper text on red buttons.** |
| `red` text on `paper` | **4.41:1** | AA **large/bold only** (≥24px or ≥18.66px bold). Not body. |
| `red` text on `ink` | **3.96:1** | AA **large only**. Fine for display words; never small text. |
| `ink` text on `red` | **3.96:1** | Large only — prefer paper-on-red for buttons. |

Rules derived from the above:
- **Red is a display/accent color, not a text color for body copy.** Use it for big Anton words,
  badges, icons, and button fills (with paper text). Any red text must be ≥18.66px bold or ≥24px.
- **Buttons:** red button ⇒ paper text (4.97:1 ✓). Ink button ⇒ paper text (17.5:1 ✓).
- **Never rely on red alone to convey meaning.** Sale = red price **+** "Sale" badge **+**
  strikethrough. Errors = red **+** icon **+** text. Out-of-stock = label text, not just color.
- **Focus:** every interactive element shows the 2px-red-on-2px-offset ring via `:focus-visible`
  (§4). Never `outline: none` without this replacement. On dark surfaces add `on-dark` to swap the
  offset to ink so the ring stays visible.
- **Uppercase = CSS only** (§3.2) so screen readers get correct pronunciation; keep real casing in
  the DOM/`alt`/`aria-label`.
- **Marquees:** decorative duplicate copies are `aria-hidden="true"`; pause on hover/focus; fully
  stopped under `prefers-reduced-motion`. Keep exactly one readable (non-hidden) copy.
- **Touch targets ≥ 44×44px:** pills (`py-3.5`), icon buttons (`h-11 w-11`), chips (`py-2` + text)
  all comply. Do not shrink below `py-3`.
- **Body text ≥ 16px** (`text-body` = 1rem). `ash` verified at 4.77:1 — safe for secondary text at
  body size; do not use `ash` for anything smaller than 14px.
- **Images:** editorial photos are decorative ⇒ `alt=""`. Product images carry descriptive alt
  (brand + product + variant), e.g. `alt="MuscleBlaze Biozyme Whey — Rich Chocolate, 1kg"`.
- **Hit-area for card:** make the whole product-card image the primary link; the quick-add button
  is a secondary control with its own accessible label.

---

## 9. Layout, spacing, grid

- **Spacing base:** 4px (Tailwind default scale). Compose in 4/8 increments.
- **Marketing container:** `.shell` = `max-w-[1600px] px-5 md:px-8 lg:px-12`. Sections are
  full-bleed (`w-full`, colored bands span 100vw); inner content uses `.shell`.
- **Functional container:** keep Medusa's `.content-container` (`max-w-[1440px] px-6`) on
  cart/checkout/account so starter components stay aligned.
- **Section rhythm:** `.section-y` = `py-16 md:py-24 lg:py-32`. Alternate `paper` / `fog` / `ink`
  backgrounds down the page — never two identical backgrounds adjacent.
- **Product grid (PLP):** `grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-x-4 gap-y-10`.
  Two columns on mobile is intentional (dense, catalog feel).
- **Breakpoints:** use the starter's custom screens (`xsmall 512 / small 1024 / medium 1280 /
  large 1440 / xlarge 1680`). Prefer `md:` (1280) and `small:`/`xsmall:` for the big shifts.
- **Body must never scroll horizontally.** Only opt-in scrollers (card rows, marquees) overflow-x,
  each inside its own `overflow-hidden`/`overflow-x-auto` container.

---

## 10. Iconography

- **Style:** thin line icons, ~1.5–2px stroke, square/`stroke-linecap="square"` for the brutalist
  edge. The Medusa starter ships `@medusajs/icons`; use those for functional UI (cart, user,
  search, chevrons) and inline SVGs (per specs above) for the arrow glyph so stroke/tip color can
  turn red on hover.
- **Signature arrow:** the `↗`/`→` slide is the brand's interaction motif — present on every CTA
  and link row. Keep it consistent (advance on hover, `red` tip on inverted surfaces).
- **Separator glyph:** `✦` (or `●`) in marquees and eyebrow rows. Pick one per surface; don't mix.

---

## 11. Do / Don't (anti-slop guardrails)

**Do:** sharp corners; hairline dividers; huge Anton caps; generous whitespace; one red accent;
warm neutrals; flat surfaces; mono eyebrows; full-bleed bands; grayscale editorial + color product.

**Don't:** drop shadows / glows; soft `rounded-lg` cards; gradients (except the hero ink scrim);
a second accent color; pure `#000`/`#fff` fills; bouncy/springy motion; red body text; centering
long paragraphs; boxed cards with thick borders; grayscale on product tubs; capital letters typed
into content instead of CSS `uppercase`.

---

## 12. Token quick-reference (for implementers)

```
Colors:   ink #0B0B0B · coal #171717 · paper #F4F1EA · fog #E7E3D8
          line #D8D3C6 · ash #6E6A62 · red #E10600 · red-deep #B00500
Fonts:    display=Anton  body=Inter  mono=Space Mono   (next/font vars)
Radius:   default rounded-none · pills rounded-full · photos rounded-photo(20px) · product frame rounded-base(4px)
Type:     display-hero / display-1 / display-2 / stat / h1–h4 / body-lg / body / body-sm / label
Motion:   150ms hovers · 200ms sweeps · 300ms zoom · marquees 20–32s linear · no bounce
Layout:   .shell (1600) marketing · .content-container (1440) checkout · .section-y rhythm
Images:   .img-editorial (grayscale) scenes/hero · .img-product (color) tubs
Focus:    2px paper offset + 2px red ring (on-dark → ink offset)
```
