tidewatch — Implementation Handoff Spec
Everything below is normative. Where I say "exact", use the literal value. Brand frame: the Industry design system (Barlow Condensed headings over Barlow, square corners, hairline borders, + registration marks on framed objects, transparent cards) with the accent re-pointed from steel-blue to tide teal, plus a neutral near-black dark theme (dark is the default), JetBrains Mono for keys/SQL/timestamps, and a colorblind-safe status set that is never expressed by color alone.

1. DESIGN TOKENS
1.1 CSS custom properties
Dark is the default (:root). [data-theme="light"] overrides. Put this in src/styles/tokens.css, imported before Tailwind's @import "tailwindcss" output is used, or after — it does not matter since these are plain custom props referenced by the @theme block in 1.2.

/* ─────────────── tidewatch tokens — dark default ─────────────── */
:root,
[data-theme="dark"] {
  color-scheme: dark;

  /* background layers */
  --bg-canvas:        #0f1113;   /* app ground, body */
  --bg-sunken:        #0a0c0d;   /* code/pre wells, terminal log */
  --bg-raised:        #17191c;   /* surface: inputs, table head, popovers */
  --bg-overlay:       #17191c;   /* drawer/dialog panel */
  --bg-scrim:         rgba(6, 7, 8, 0.62); /* modal + drawer backdrop */
  --bg-faint:         rgba(230, 232, 234, 0.07); /* hover wash */
  --bg-fainter:       rgba(230, 232, 234, 0.04);

  /* borders */
  --border-hairline:  rgba(230, 232, 234, 0.14); /* default 1px rule */
  --border-strong:    rgba(230, 232, 234, 0.40); /* card hover, focused field */
  --border-inverse:   #0f1113;

  /* text */
  --text-primary:     #e6e8ea;
  --text-secondary:   rgba(230, 232, 234, 0.78);
  --text-muted:       rgba(230, 232, 234, 0.64);
  --text-faint:       rgba(230, 232, 234, 0.42);
  --text-inverse:     #0f1113;   /* on accent fill */

  /* accent — tide (dark: lighter steps are the darker inks) */
  --accent-100:       #0d3332;
  --accent-200:       #124c4b;
  --accent-300:       #176a68;
  --accent-400:       #30a39e;
  --accent-500:       #5cc2bc;
  --accent-600:       #8fdad4;
  --accent-700:       #c0ebe7;
  --accent-800:       #e4f6f4;
  --accent-900:       #f1fbfa;
  --accent:           #5cc2bc;   /* base — 8.1:1 on --bg-canvas */
  --accent-hover:     #8fdad4;
  --accent-pressed:   #30a39e;
  --accent-on:        #0f1113;   /* text/icon on an accent fill */

  /* status — fg / bg / border / subtle */
  --ok-fg:            #4ecb85;
  --ok-bg:            #12301f;
  --ok-border:        #1f6b43;
  --ok-subtle:        rgba(78, 203, 133, 0.14);

  --warn-fg:          #f0b33a;
  --warn-bg:          #3a2a08;
  --warn-border:      #8a6412;
  --warn-subtle:      rgba(240, 179, 58, 0.14);

  --alert-fg:         #ff7b72;
  --alert-bg:         #3f1a17;
  --alert-border:     #9c3d36;
  --alert-subtle:     rgba(255, 123, 114, 0.14);

  --unknown-fg:       #9aa0a6;
  --unknown-bg:       #25282b;
  --unknown-border:   #4a4f54;
  --unknown-subtle:   rgba(154, 160, 166, 0.12);

  --paused-fg:        #9aa0a6;
  --paused-bg:        transparent;
  --paused-border:    rgba(230, 232, 234, 0.14);
  --paused-subtle:    transparent;

  /* neutral ramp (chrome, skeletons, monogram tiles) */
  --neutral-100:      #1c1e21;
  --neutral-200:      #25282b;
  --neutral-300:      #34383c;
  --neutral-400:      #4a4f54;
  --neutral-500:      #6b7176;
  --neutral-600:      #8b9197;
  --neutral-700:      #adb2b7;
  --neutral-800:      #cdd1d4;
  --neutral-900:      #e6e8ea;

  /* focus */
  --ring:             #5cc2bc;
  --ring-width:       2px;
  --ring-offset:      2px;
  --ring-offset-color: #0f1113;

  /* elevation */
  --shadow-sm: 0 0 0 1px rgba(255,255,255,0.06), 0 1px 2px rgba(0,0,0,0.66);
  --shadow-md: 0 0 0 1px rgba(255,255,255,0.07), 0 6px 18px rgba(0,0,0,0.80);
  --shadow-lg: 0 0 0 1px rgba(255,255,255,0.08), 0 18px 48px rgba(0,0,0,0.86);

  /* skeleton */
  --skeleton-base:      rgba(230, 232, 234, 0.10);
  --skeleton-highlight: rgba(230, 232, 234, 0.16);
}

/* ─────────────── light ─────────────── */
[data-theme="light"] {
  color-scheme: light;

  --bg-canvas:        #f2f2f3;
  --bg-sunken:        #e4e5e7;
  --bg-raised:        #e9e9ea;
  --bg-overlay:       #f2f2f3;
  --bg-scrim:         rgba(29, 31, 32, 0.42);
  --bg-faint:         rgba(29, 31, 32, 0.06);
  --bg-fainter:       rgba(29, 31, 32, 0.03);

  --border-hairline:  rgba(29, 31, 32, 0.16);
  --border-strong:    rgba(29, 31, 32, 0.40);
  --border-inverse:   #f2f2f3;

  --text-primary:     #1d1f20;
  --text-secondary:   rgba(29, 31, 32, 0.76);
  --text-muted:       rgba(29, 31, 32, 0.58);
  --text-faint:       rgba(29, 31, 32, 0.40);
  --text-inverse:     #f2f2f3;

  --accent-100:       #e4f6f4;
  --accent-200:       #c0ebe7;
  --accent-300:       #8fdad4;
  --accent-400:       #5cc2bc;
  --accent-500:       #30a39e;
  --accent-600:       #1f8885;
  --accent-700:       #176a68;
  --accent-800:       #124c4b;
  --accent-900:       #0d3332;
  --accent:           #1f8885;   /* 4.42:1 on #f2f2f3 */
  --accent-hover:     #176a68;
  --accent-pressed:   #124c4b;
  --accent-on:        #f2f2f3;

  --ok-fg:            #1f8f5a;   /* 4.52:1 */
  --ok-bg:            #e2f4ea;
  --ok-border:        #96d3b2;
  --ok-subtle:        rgba(31, 143, 90, 0.10);

  --warn-fg:          #a86a05;   /* 4.56:1 */
  --warn-bg:          #fbeed3;
  --warn-border:      #e0bb6a;
  --warn-subtle:      rgba(168, 106, 5, 0.10);

  --alert-fg:         #c8433b;   /* 4.61:1 */
  --alert-bg:         #fbe3e0;
  --alert-border:     #e79a94;
  --alert-subtle:     rgba(200, 67, 59, 0.10);

  --unknown-fg:       #6b7075;   /* 5.05:1 */
  --unknown-bg:       #e9eaec;
  --unknown-border:   #c2c5c8;
  --unknown-subtle:   rgba(107, 112, 117, 0.10);

  --paused-fg:        #6b7075;
  --paused-bg:        transparent;
  --paused-border:    rgba(29, 31, 32, 0.16);
  --paused-subtle:    transparent;

  --neutral-100:      #f5f5f8;
  --neutral-200:      #e7e7ea;
  --neutral-300:      #d4d4d7;
  --neutral-400:      #b7b7ba;
  --neutral-500:      #98989b;
  --neutral-600:      #7a7a7d;
  --neutral-700:      #5d5d60;
  --neutral-800:      #424244;
  --neutral-900:      #2b2b2d;

  --ring:             #1f8885;
  --ring-offset-color: #f2f2f3;

  --shadow-sm: 0 1px 2px rgba(43, 43, 45, 0.14);
  --shadow-md: 0 3px 10px rgba(43, 43, 45, 0.16);
  --shadow-lg: 0 12px 32px rgba(43, 43, 45, 0.22);

  --skeleton-base:      rgba(29, 31, 32, 0.09);
  --skeleton-highlight: rgba(29, 31, 32, 0.14);
}
The public status page honors its own theme setting (auto | dark | light) independently of the app: auto → prefers-color-scheme. Apply by setting data-theme on <html> for the app and on the status-page root for the embed.

1.2 Tailwind v4 @theme block
src/styles/app.css:

@import "tailwindcss";
@import "./tokens.css";

@theme {
  /* fonts */
  --font-sans:    "Barlow", system-ui, -apple-system, "Segoe UI", sans-serif;
  --font-display: "Barlow Condensed", "Barlow", system-ui, sans-serif;
  --font-mono:    "JetBrains Mono", ui-monospace, SFMono-Regular, Menlo, monospace;

  /* colors — every token mapped; all resolve through the theme vars above */
  --color-canvas:      var(--bg-canvas);
  --color-sunken:      var(--bg-sunken);
  --color-raised:      var(--bg-raised);
  --color-overlay:     var(--bg-overlay);
  --color-scrim:       var(--bg-scrim);
  --color-faint:       var(--bg-faint);
  --color-fainter:     var(--bg-fainter);

  --color-hairline:    var(--border-hairline);
  --color-strong:      var(--border-strong);

  --color-ink:         var(--text-primary);
  --color-ink-2:       var(--text-secondary);
  --color-ink-muted:   var(--text-muted);
  --color-ink-faint:   var(--text-faint);
  --color-ink-inverse: var(--text-inverse);

  --color-tide-100: var(--accent-100);
  --color-tide-200: var(--accent-200);
  --color-tide-300: var(--accent-300);
  --color-tide-400: var(--accent-400);
  --color-tide-500: var(--accent-500);
  --color-tide-600: var(--accent-600);
  --color-tide-700: var(--accent-700);
  --color-tide-800: var(--accent-800);
  --color-tide-900: var(--accent-900);
  --color-tide:         var(--accent);
  --color-tide-hover:   var(--accent-hover);
  --color-tide-pressed: var(--accent-pressed);
  --color-tide-on:      var(--accent-on);

  --color-ok:            var(--ok-fg);
  --color-ok-bg:         var(--ok-bg);
  --color-ok-border:     var(--ok-border);
  --color-ok-subtle:     var(--ok-subtle);
  --color-warn:          var(--warn-fg);
  --color-warn-bg:       var(--warn-bg);
  --color-warn-border:   var(--warn-border);
  --color-warn-subtle:   var(--warn-subtle);
  --color-alert:         var(--alert-fg);
  --color-alert-bg:      var(--alert-bg);
  --color-alert-border:  var(--alert-border);
  --color-alert-subtle:  var(--alert-subtle);
  --color-unknown:       var(--unknown-fg);
  --color-unknown-bg:    var(--unknown-bg);
  --color-unknown-border:var(--unknown-border);
  --color-unknown-subtle:var(--unknown-subtle);
  --color-paused:        var(--paused-fg);
  --color-paused-border: var(--paused-border);

  --color-neutral-100: var(--neutral-100);
  --color-neutral-200: var(--neutral-200);
  --color-neutral-300: var(--neutral-300);
  --color-neutral-400: var(--neutral-400);
  --color-neutral-500: var(--neutral-500);
  --color-neutral-600: var(--neutral-600);
  --color-neutral-700: var(--neutral-700);
  --color-neutral-800: var(--neutral-800);
  --color-neutral-900: var(--neutral-900);

  --color-ring: var(--ring);

  /* spacing — Industry 0.85× density, 4px base → 3.4px step */
  --spacing: 3.4px;          /* p-1 = 3.4px, p-2 = 6.8px, p-4 = 13.6px … */

  /* radius — square frames, 4px on controls */
  --radius-none: 0px;
  --radius-sm:   2px;
  --radius-md:   4px;   /* inputs, chips, tags */
  --radius-lg:   7px;
  --radius-full: 9999px;

  /* shadows */
  --shadow-sm: var(--shadow-sm);
  --shadow-md: var(--shadow-md);
  --shadow-lg: var(--shadow-lg);

  /* motion */
  --ease-out:     cubic-bezier(0.2, 0.7, 0.2, 1);
  --ease-in-out:  cubic-bezier(0.65, 0, 0.35, 1);
  --ease-spring:  cubic-bezier(0.3, 1.3, 0.4, 1);
  --ease-linear:  linear;
  --duration-instant:   80ms;
  --duration-fast:     120ms;
  --duration-base:     160ms;
  --duration-slow:     200ms;
  --duration-drawer:   240ms;
  --duration-chart:    800ms;
  --duration-cinematic:1400ms;
  --duration-tide:    7000ms;
  --duration-stagger:  40ms;

  /* breakpoints (mobile-first) */
  --breakpoint-sm:  390px;
  --breakpoint-md:  768px;
  --breakpoint-lg: 1024px;
  --breakpoint-xl: 1440px;
  --breakpoint-2xl:1920px;

  /* type scale — see 1.3 */
  --text-display:    44px;  --text-display--line-height: 1.02;
  --text-h1:         28px;  --text-h1--line-height: 1.10;
  --text-h2:         22px;  --text-h2--line-height: 1.15;
  --text-h3:         17px;  --text-h3--line-height: 1.25;
  --text-body:       14px;  --text-body--line-height: 1.45;
  --text-body-sm:    13px;  --text-body-sm--line-height: 1.45;
  --text-label:      11px;  --text-label--line-height: 1.20;
  --text-metric:     26px;  --text-metric--line-height: 1.00;
  --text-metric-lg:  30px;  --text-metric-lg--line-height: 1.05;
  --text-mono:       13px;  --text-mono--line-height: 1.50;
  --text-mono-sm:    12px;  --text-mono-sm--line-height: 1.50;
  --text-mono-xs:  11.5px;  --text-mono-xs--line-height: 1.55;

  /* keyframes */
  @keyframes tw-rise { from { opacity:0; transform: translateY(6px) } to { opacity:1; transform:none } }
  @keyframes tw-pop  { from { opacity:0; transform: translateY(8px) scale(.98) } to { opacity:1; transform:none } }
  @keyframes tw-fade { from { opacity:0 } to { opacity:1 } }
  @keyframes tw-pulse-ring { 0% { box-shadow: 0 0 0 0 currentColor } 100% { box-shadow: 0 0 0 9px transparent } }
  @keyframes tw-shimmer { from { background-position: -200% 0 } to { background-position: 200% 0 } }
  @keyframes tw-draw { from { stroke-dashoffset: 1000 } to { stroke-dashoffset: 0 } }
  @keyframes tw-drawer-in { from { transform: translateX(100%) } to { transform: none } }
  @keyframes tw-sheet-in  { from { transform: translateY(100%) } to { transform: none } }
  @keyframes tw-blink { 0%,100% { opacity:1 } 50% { opacity:.35 } }
}

/* global base */
@layer base {
  html { -webkit-text-size-adjust: 100%; }
  body {
    background: var(--bg-canvas);
    color: var(--text-primary);
    font-family: var(--font-sans);
    font-size: 14px; line-height: 1.45;
    font-variant-numeric: tabular-nums;   /* tabular numerals EVERYWHERE */
  }
  * { font-variant-numeric: tabular-nums; }
  h1,h2,h3,h4,h5,h6 { font-family: var(--font-display); font-weight: 600; letter-spacing: 0.01em; }
  a { color: var(--accent); text-decoration: none; }
  a:hover { color: var(--accent-hover); text-decoration: underline; text-underline-offset: 2px; }
  :focus-visible { outline: var(--ring-width) solid var(--ring); outline-offset: var(--ring-offset); }
  ::selection { background: var(--accent-subtle, rgba(92,194,188,.25)); }
  [disabled], .is-disabled { opacity: 0.45; pointer-events: none; }
  @media (prefers-reduced-motion: reduce) {
    *, *::before, *::after { animation-duration: 1ms !important; animation-iteration-count: 1 !important; transition-duration: 1ms !important; }
  }
}
1.3 Type scale
Role	Family	Size	Line-height	Weight	Letter-spacing	Used for
display	Barlow Condensed	44px (mobile 32px)	1.02	600	−0.01em	Onboarding hero headline only
h1	Barlow Condensed	28px (condensed 20px)	1.10	600	0.01em	Screen titles
h2	Barlow Condensed	22px	1.15	600	0.01em	Drawer title, onboarding step title, public page brand
h3	Barlow Condensed	17px	1.25	600	0.02em	Card titles, check names, section headers
h4/section	Barlow Condensed	15px	1.3	600	0.04em	Group headers, settings section titles
body	Barlow	14px	1.45	400	0	Default UI text
body-sm	Barlow	13px	1.45	400	0	Helper text, list meta, drawer body
caption	Barlow	12px	1.4	400	0	Card meta, axis labels, footers
label	Barlow Condensed	11px	1.2	600	0.10em, uppercase	Field labels, kickers, table th, metric captions
mono	JetBrains Mono	13px	1.5	400	0	Dataset keys, hosts, SQL, values
mono-sm	JetBrains Mono	12px	1.5	400	0	Timestamps, badges, log times, kbd
mono-xs	JetBrains Mono	11.5px	1.55	400	0	<pre> raw error / probe output
metric	JetBrains Mono	26px	1.0	500	0	Freshness age on cards
metric-lg	JetBrains Mono	30px	1.05	500	0	Dataset-detail hero metrics
Never below 12px except label (11px, uppercase, 600 — legible at that size) and mono-xs in code wells.

1.4 Spacing scale
Tailwind step = 3.4px. Canonical steps used in the design:

Token	px	Use
p-1	3.4	icon-to-text in a badge
p-2	6.8	chip padding-y, tight stacks
p-3	10.2	compact density page padding, list row padding-y
p-4	13.6	control padding-x, card gap
p-5	17	comfortable card padding
p-6	20.4	comfortable page padding / grid gap
p-8	27.2	section gap
p-10	34	settings section gap
p-12	40.8	onboarding panel padding
p-14	47.6	public-page top padding
Density (useUiStore().density): comfortable → page padding 16px, grid gap 14px, row padding-y 12px. compact → 10px / 8px / 8px. Implement as two CSS vars on the app root: --pad and --gap, consumed with p-[var(--pad)] / gap-[var(--gap)].

1.5 Radius, borders, z-index
Radius: frames (cards, figures, primary button, dialogs, drawers, chart frames, monogram tiles) = 0. Controls that are not frames (inputs, chips, tags, kbd, checkboxes) = 4px. Status dot and avatar = 9999px. Never round a card.
Border widths: 1px hairline default (--border-hairline); 2px for the focus ring, the active tab underline, the active nav left edge, the toast left edge, and the mobile-nav top edge. Corner registration marks are 2 crossed 1px strokes in a 7×7px box, --border-strong, inset −1px at each corner of a framed object.
Z-index layers: 0 content · 4 sticky group headers · 5 condensing header strip · 10 mobile bottom nav · 20 toast region (mobile: above nav) · 30 incident drawer + scrim · 40 wizard dialog · 45 command palette · 60 confirm dialog / token modal (must sit above wizard) · 70 toast on desktop.
Breakpoints: sm 390 md 768 lg 1024 xl 1440 2xl 1920.
1.6 Motion tokens → interaction mapping
Token	Value	Used by
duration-instant 80ms	ease-out	checkbox/toggle knob, chip press
duration-fast 120ms	ease-out	all hover/press color + border changes, icon-button tint, table row hover
duration-base 160ms	ease-out	chip select, tab underline slide, toggle track, status color crossfade
duration-slow 200ms	ease-out	card rise-in, list reorder (layout), header condense, tab panel fade, toast in
duration-drawer 240ms	ease-out	incident drawer slide-in, mobile bottom sheet, dialog pop
duration-chart 800ms	ease-out	chart draw-in, 90-day strip wipe
duration-cinematic 1400ms	ease-out	onboarding headline/step rise, public-page hero, empty-state illustration
duration-tide 7000ms	ease-in-out	onboarding tide-line → sparkline morph
duration-stagger 40ms	—	per-item delay for card stagger (cap at 12 items = 480ms)
pulse-ring	900ms ease-out, 1 iteration	status-change pulse
live pulse	2400ms ease-out, infinite	SSE-connected indicator
shimmer	1400ms linear, infinite	skeleton
2. LAYOUT PRIMITIVES
┌─────────── app shell (desktop ≥1024) ───────────────────────────┐
│ sidebar 216px │ main (flex-1, min-w-0, overflow-y:auto)         │
│ (fixed,       │ ┌─ sticky header strip (z-5) ─────────────────┐ │
│  full height, │ │ h1 + counts + last-probe  /  filter chips   │ │
│  border-r 1px)│ └────────────────────────────────────────────┘ │
│               │ ┌─ sticky group header (z-4) ────────────────┐ │
│               │ ├─ dataset grid ─────────────────────────────┤ │
└───────────────┴─────────────────────────────────────────────────┘
Sidebar: expanded 216px. Collapsed 56px (icon-only, label in a Radix tooltip on the right, 12px delay). Collapse is manual (a chevron button at the bottom) and persisted in localStorage under tw.ui.sidebar. Auto-collapse below 1024px is not used — below lg the shell switches to the mobile layout. Internal padding 14px 10px; nav item height 36px (hit area padded to 44px on touch), gap 4px, active item = bg-faint + 2px left edge in --accent + --text-primary; inactive --text-muted.
Header: not a separate bar on desktop — each screen owns a sticky strip. Expanded height 76px (padding 16px, h1 28px, chips row). Scroll-condensed (scrollTop > 40) height 45px: padding 8px, h1 20px, chips row unmounts (AnimatePresence, fade 160ms). Background color-mix(in srgb, var(--bg-canvas) 88%, transparent) + backdrop-filter: blur(8px), bottom hairline.
Mobile top bar (<lg): height 52px, logo 22px + screen title (h3) + search icon-button + theme icon-button, each 44×44.
Mobile bottom nav: height 60px + env(safe-area-inset-bottom); 5 items (Overview, Sources, Incidents, Status, Settings); each item flex-col, icon 20px + 10px Barlow label, min-height 52px, top edge 2px accent when active; alert count badge as an 18px-tall mono pill at top-right of the Incidents item.
Content max-width: dataset grid and lists are full-bleed inside main (no max-width — the grid is the content). Reading-width regions are capped: Settings 860px, Dataset-detail Settings tab 900px, public status page 880px, onboarding right panel 520px.
Page padding by breakpoint: 390 → 12px; 768 → 16px; 1024 → 16px; 1440 → 16px; 1920 → 24px. Compact density subtracts 6px at every breakpoint (min 8px).
Dataset grid: grid-template-columns: repeat(auto-fill, minmax(250px, 1fr)), gap var(--gap). Resulting columns: 390 → 1 · 768 → 2 · 1024 → 3 (sidebar hidden at <1024; with sidebar at 1024 → 2) · 1440 → 4 · 1920 → 6. Min card height 132px (comfortable) / 116px (compact).
Two-pane screens: Status editor minmax(0,1fr) minmax(0,1.2fr) above lg, stacked below. Settings rows 220px minmax(0,1fr) above lg, stacked below. Dataset-detail charts repeat(auto-fit, minmax(320px,1fr)).
Drawer: desktop 460px wide, full height, right-anchored, border-l hairline, --shadow-lg. Mobile: bottom sheet, 88vh, full width, border-t.
3. COMPONENT SPECS
Conventions for every block below: hairline = border-hairline, Frame = the shared blueprint wrapper (§3.0). Focus is always focus-visible:outline-2 focus-visible:outline-ring focus-visible:outline-offset-2 — I omit repeating it. All interactive elements have a ≥44px hit area on touch (@media (pointer: coarse) padding, not size, so visual density is preserved).

3.0 Frame (blueprint wrapper — the system's core primitive)
Purpose: every card, figure, dialog and primary button is a square hairline-bordered line drawing with + registration marks. Nothing else gives the product its look; use it everywhere a "card" is implied.

<div className="relative border border-hairline bg-transparent">   {/* or as="button" */}
  <Corner pos="tl" /><Corner pos="tr" /><Corner pos="bl" /><Corner pos="br" />
  {children}
</div>
Corner renders <i aria-hidden className="pointer-events-none absolute size-[7px] before:absolute before:inset-x-0 before:top-1/2 before:h-px before:bg-strong after:absolute after:inset-y-0 after:left-1/2 after:w-px after:bg-strong" /> positioned -top-px -left-px / -top-px -right-px / -bottom-px -left-px / -bottom-px -right-px.

Props: as?: 'div'|'button'|'a'|'aside'|'section' · interactive?: boolean (adds hover:bg-faint hover:border-strong transition-[background,border-color] duration-fast ease-out) · filled?: boolean (accent fill — primary button only) · elevation?: 'none'|'sm'|'md'|'lg'. Never remove the corner marks; never add a radius or a surface fill (accent-filled primary button is the single exception).

3.1 StatusDot
Purpose: smallest state indicator; used in sidebar "live" indicator, drawer timeline, onboarding discovery rows. Anatomy: <span role="img" aria-label={${state} } className="inline-block size-2 rounded-full" style={{background: fg, color: fg}} /> — color must equal background so tw-pulse-ring (which uses currentColor) tints correctly. Props: state: DatasetState · size?: 6|8|10 (px) · pulse?: 'none'|'once'|'live'. States: color from §6.1. pulse="once" → animate-[tw-pulse-ring_900ms_var(--ease-out)_1]. pulse="live" → same keyframe, 2400ms, infinite. Paused renders a hollow dot (bg-transparent border border-paused-border) so it reads without color. A11y: always role="img" + aria-label. Never the sole carrier of state in a row — pair with text or StatusBadge.

3.2 StatusBadge
Purpose: the canonical state chip. Colour plus glyph — mandatory. Anatomy:

span.inline-flex.items-center.gap-1.px-[7px].py-[2px].text-[11px].font-medium.tracking-[.04em]
  └ <Icon size=12 strokeWidth=1.8 />          // §6.1 icon per state
  └ "OK" | "WARN" | "ALERT" | "UNKNOWN" | "PAUSED"
Colors: color: var(--{state}-fg), background: var(--{state}-bg). PAUSED uses bg-transparent + border border-paused-border. Props: state · size?: 'sm'|'md' (sm: 11px text/12px icon; md: 13px text/16px icon, padding 5px 10px — used in the dataset-detail hero) · pulse?: boolean. States: static; pulse (one 900ms ring) is driven by a state transition, not by the state value (§5.3). Loading → render Skeleton variant="badge" (18×52px) instead. A11y: the label text is the accessible name; no extra aria. Contrast ≥4.5:1 in both themes by construction.

3.3 FreshnessPill
Purpose: the ticking age of the newest row/message/object. Anatomy: <time dateTime={iso} className="font-mono tabular-nums">{formatted}</time> — optionally wrapped in span.px-2.py-[2px].border.border-hairline.rounded-md when used standalone (component sheet variant bordered). Tick interval (exact): one global ticker in a Zustand store (useClock), setInterval cadence 1000ms. Each pill subscribes and re-renders only if its formatted string changed (useMemo on the formatted value; compare with usePrevious). Cadence downshifts per pill: age < 1h → recompute every tick (1s); 1h ≤ age < 24h → every 10th tick; age ≥ 24h → every 60th tick. Pause the interval when document.hidden, and recompute once on visibilitychange. Format thresholds (exact): see §6.2. Props: since: string /* ISO */ | null · variant?: 'plain'|'bordered' · size?: 'metric'|'metric-lg'|'mono' · state?: DatasetState (colors the text only when alert). States: since === null → — with aria-label="never probed"; paused → frozen value + text-paused; alert → text-alert. Animation: none on tick (no flashing digits — tabular numerals make it stable). On a state change the badge pulses, not the pill. A11y: <time dateTime>; aria-label={last row ${verboseAge} ago} where verbose = "31 minutes 4 seconds".

3.4 Sparkline
Purpose: 24-point trend in a dataset card. Anatomy: <svg width="100%" height="28" viewBox="0 0 100 28" preserveAspectRatio="none" aria-hidden="true"><polyline points={pts} fill="none" stroke="currentColor" strokeWidth="1.5" vectorEffect="non-scaling-stroke"/></svg> on a wrapper with style={{color: stateFg}}. Point math: x = i * 100 / (n-1), y = 26 - (v / max) * 24 (2px top/bottom breathing room). n fixed at 24; fewer points → left-align and shorten the line, do not interpolate. Props: points: number[] · state: DatasetState · height?: 28|40. States: all-zero series → a flat line at y=26 in --unknown-fg. Single point → a 2px dot at x=0. Loading → Skeleton variant="chart" h=28. Animation: none in the grid (too many at once). On the dataset-detail page only, first mount draws with tw-draw 800ms. A11y: decorative — aria-hidden. The numbers it represents are already in the card as text.

3.5 MetricNumber
Purpose: the big mono number (age, rows, delta). Anatomy: <div><span className="font-mono text-metric font-medium leading-none">{value}</span><span className="text-caption text-ink-muted">{unit}</span></div> with optional label above in label role and note below in caption. Props: value: string · label?: string · note?: string · size?: 'metric'|'metric-lg' · tone?: 'ink'|'ok'|'warn'|'alert'|'muted'. States: null value → — in text-ink-faint. Loading → Skeleton 30×40% width. Animation: on change, no count-up. Deltas crossfade color over duration-base.

3.6 DatasetCard
Purpose: the atom of the Overview grid. Anatomy:

Frame as="button" interactive  p-[var(--pad)] flex flex-col gap-[10px] text-left min-h-[132px]
├ row: div.flex.items-start.gap-2.w-full
│   ├ span.font-mono.text-mono.flex-1.min-w-0.truncate      → displayName
│   └ <StatusBadge state pulse={justChanged}/>
├ row: div.flex.items-baseline.gap-3.w-full
│   ├ <FreshnessPill size="metric"/>
│   ├ span.text-caption.text-ink-muted                      → ageNote
│   └ span.font-mono.text-mono-sm.ml-auto                    → volumeDelta  (tone per sign)
├ <Sparkline points state/>
└ row: div.flex.gap-2.text-caption.text-ink-muted.w-full
    ├ Tag(tag)  ├ span(kind)  └ span.ml-auto → `${checkCount} checks`
Props: dataset: DatasetSummary · index: number (stagger) · animateIn: boolean · onOpen: () => void. States: default transparent; hover → bg-faint + border-strong (120ms); active → bg-fainter, translateY(1px); focus-visible → accent ring; selected (keyboard grid nav) → border-strong + 1px inner accent line; loading → SkeletonDatasetCard; paused → whole card opacity-70, hollow dot, delta —; unknown → age —, sparkline flat gray, note "never probed"; error (probe failed) → border-alert-border + a 12px TriangleAlert after the name; disabled n/a. Sizes: min 250px wide, height 132/116px (density), padding var(--pad). Animation: mount tw-rise 200ms ease-out, delay min(index,11) * 40ms, first paint only (guard with a hasAnimated ref in the store — never on filter change, never on SSE update). Status change → badge pulse (§5.3). Reorder → motion.div layout with transition={{duration:.2, ease:[.2,.7,.2,1]}}. A11y: <button> with aria-label={${key}, ${stateLabel}, last row ${age}}; the grid is a plain div (not a listbox) — arrow-key roving tabindex is optional (see §9).

3.7 SourceCard (list row)
Purpose: one connected source on the Sources screen. It is a row, not a card, on ≥768px; a Frame card below 768px. Anatomy (row, ≥768):

div.flex.items-center.gap-3.px-[var(--pad)].py-3.border-b.border-hairline.hover:bg-faint
├ <SourceIcon code/>                       34×34 tile
├ div.flex-1.min-w-0 : name (14px/500) + host (font-mono 12px text-ink-muted, truncate)
├ span.text-caption.text-ink-muted.w-[90px]   → type
├ span.text-caption.text-ink-muted.w-[80px]   → `${datasetCount} datasets`
├ span.inline-flex.gap-1.5.w-[110px]          → rolled-up state icon + "healthy|warn|alert|unknown"
├ span.font-mono.text-mono-sm.w-[80px]        → `probed ${age}`
├ button.btn-ghost                            → "Probe now"
└ button.btn-icon (Trash2)                    → destructive
Below 768: Frame card, two rows — (icon + name/host + state) and (type · N datasets · probed) with the two actions right-aligned at 44px. Props: source: Source · onProbe · onDelete · onOpen. States: hover bg-faint; probing → the "Probe now" button becomes disabled with a blinking ● and label "Probing…"; connection lost → the state cell shows HelpCircle + "unknown" and the host string gets text-alert; disabled n/a. A11y: the row is not itself clickable when it contains buttons — the name is a link to the filtered overview. Delete button aria-label={Delete source ${name}}.

3.8 NotifierCard
Anatomy:

Frame p-[var(--pad)] flex flex-col gap-[10px] min-h-[150px]
├ row: <SourceIcon code/>(30px) + div(name 14/500, target font-mono 11px truncate)
├ div.text-caption.text-ink-muted → `last sent ${age} · ${events} events / 7d`
└ row.mt-auto.gap-1.5 : Button secondary flex-1 "Send test" · Button ghost "Edit"
Props: notifier · onTest · onEdit. States: idle "Send test"; sending → disabled + blinking ● + "Sending…"; sent → "Sent ✓" in text-ok for 2600ms then revert, plus a success toast Test delivered to Slack · 212ms; failed → "Failed" in text-alert + an ErrorState inline collapsible with the raw transport error; never sent → meta reads last sent never · 0 events / 7d. Animation: mount tw-rise staggered 40ms. Label swap is a crossfade duration-base.

3.9 FilterChipBar
Purpose: status/source/tag filters on the Overview. Anatomy: div.flex.flex-wrap.gap-1.5 of button.inline-flex.items-center.gap-1.5.h-[30px].px-2.5.rounded-md.border.text-[12px]; each chip is label + a span.opacity-60 count. Props: chips: {id, label, count}[] · value: string · onChange. States: unselected border-hairline bg-transparent text-ink; hover bg-faint; selected bg-tide text-tide-on border-tide; count 0 → chip is disabled at 45% and unclickable (do not hide it — stable layout); focus ring as global. Animation: selection duration-base. The bar itself unmounts on header condense (fade 160ms). A11y: role="group" aria-label="Filter datasets"; each chip aria-pressed. Single-select (radio semantics implemented with aria-pressed, not role=radio, because "All" is a reset).

3.10 TimeRangePicker
Anatomy: div.inline-flex.border.border-hairline (segmented; role="radiogroup"), options 1h · 24h · 7d · 30d, each button role="radio" h-[34px] px-3 text-[12px], dividers = border-l hairline between options. States: selected bg-tide text-tide-on; hover bg-faint; focus ring on the group, arrow keys move selection (Radix ToggleGroup type="single"). Props: value: '1h'|'24h'|'7d'|'30d' · onChange. Range is a URL search param (?range=24h) so it survives reload and is shareable.

3.11 BaselineBandChart (row count)
Purpose: volume per bucket against a learned ±2σ band. Anatomy: Frame p-[var(--pad)] → header row (h3 "Row count" + caption "per hour · baseline ±2σ") → Recharts ComposedChart height 140 → footer row (mono-xs: rangeStart · note · "now"). Layers, bottom to top: <Area dataKey="band" /> as the ±2σ envelope (fill: var(--accent), fillOpacity .14, no stroke) · <Line dataKey="baseline" stroke="var(--accent)" strokeWidth={1} strokeDasharray="2 3" dot={false}/> · <Line dataKey="value" stroke="var(--text-primary)" strokeWidth={1.5} dot={false}/> · outlier <Scatter> dots r=3.5, fill = --alert-fg if |z|≥3 else --warn-fg. No gridlines, no axes ticks (the footer carries the range) — <Tooltip> only, styled: bg-overlay border-hairline shadow-md p-2 font-mono text-mono-sm, content "{bucket} · {value} rows · baseline {μ} ±{2σ}". Props: series: {t: string; value: number; baselineMean: number|null; baselineSd: number|null}[] · range · animate: boolean. States: baselineMean === null (learning) → hide band + baseline, show a caption note "baseline learning · 14h left"; series.length === 0 → EmptyState size="sm" "No probes in this range" + "Widen the range"; error → ErrorState; loading → Skeleton variant="chart" 140px with 3 shimmer bars matching the final geometry. Animation: first mount only — value line tw-draw 800ms ease-out (strokeDasharray:1000), band fades 400ms, outlier dots pop at 600ms +40ms stagger. Range change re-renders without draw-in. A11y: role="img" with aria-label summarising ("Row count over 24 hours, 1 point below the baseline band"), plus a visually-hidden <table> of the series behind a "Show data" <details> in the Frame footer.

3.12 FreshnessGapChart
Purpose: minutes between arrivals, per bucket, against warn/alert thresholds. Anatomy: Frame → header (h3 "Freshness gap" + caption "minutes between arrivals · {range}") → SVG/Recharts BarChart height 140, 48 bars, bar width 7px, gap 3px → footer (mono-xs: "−24h" · "warn 15m · alert 30m" · "now"). Threshold lines: y = warnMinutes, y = alertMinutes as 1px dashed 3 4 in --warn-fg / --alert-fg, drawn under the bars. Bar fill: value ≥ alert → --alert-fg; ≥ warn → --warn-fg; else --accent. Props: buckets: {t: string; gapMinutes: number}[] · warnMinutes: number · alertMinutes: number. States: gaps that are open-ended (still waiting) render as a hatched bar (fill: url(#tw-hatch), 45° 2px lines in --alert-fg) — this is how a currently-stale dataset reads. unknown (never probed) → EmptyState "Nothing probed yet". Loading → skeleton of 48 shimmer bars at the real geometry. Animation: first mount, bars rise from y=140 with tw-rise, stagger 15ms capped at 700ms total. A11y: as 3.11.

3.13 NinetyDayBarStrip
Purpose: the public-page / status-preview history strip. Anatomy: div.flex.gap-[2px].h-[26px] with 90 children div.flex-1 + a Radix tooltip per cell. Public page: 26px tall, 2px gap. Editor preview: 14px tall, 1px gap. Mobile: 18px tall, 1px gap, and 45 cells (last 45 days) with the caption changed to "45 days ago". Cell fill: day's worst state (ok → --ok-fg, warn → --warn-fg, alert → --alert-fg, no data → --unknown-bg). Below the strip: div.flex.justify-between.text-caption.text-ink-muted → "90 days ago" / "today". Props: days: {date: string; state: DayState; freshPct: number}[] (length 90, oldest first) · size?: 'lg'|'sm'. States: no-data cells are --unknown-bg and their tooltip reads "no data"; a partial history (< 90 days of retention) left-pads with no-data cells; today's cell always reflects live state. Animation: on the public page, wipe in — each cell tw-fade 200ms with delay = i * 8ms (720ms total), reduced-motion → all visible immediately. A11y: the container is role="img" with aria-label={90 day freshness history for ${key}: ${freshDays} fresh days, ${warnDays} degraded, ${alertDays} stale}; individual cells aria-hidden, tooltip content "{date} · {state}".

3.14 SchemaDiffRow
Anatomy: grid 28px 1fr 1fr auto, py-[7px] pr-3, border-b border-hairline, font-mono text-mono.

├ gutter  span.text-center.font-medium       "+" | "−" | "~" | ""
├ name    span  (line-through when removed)
├ type    span.text-ink-muted   [<s>oldType</s> → ] newType
└ note    span.text-[11px].text-ink-muted.font-sans   "added · nullable" | "removed" | "widened" | ""
Row background: added --ok-bg, removed --alert-bg, changed --warn-bg, unchanged transparent. Gutter color matches. Props: row: {name, type, oldType?, change: 'added'|'removed'|'changed'|'none', nullable: boolean}. A11y: the gutter glyph is real text (not an icon) so screen readers read "plus"; add aria-label on the row: "added column plan, type text, nullable". Zebra/hover: hover:bg-faint only on unchanged rows.

3.15 IncidentRow
Anatomy (desktop grid 84px minmax(0,1fr) 80px auto):

div.grid.items-center.gap-3.px-3.py-2.5.border.border-hairline.hover:bg-faint
├ severity  span.inline-flex.gap-1.5.text-[12px].font-medium  → icon(16) + "WARN"
├ button (opens drawer) flex-col: title (14/500) + `${key} · ${check}` (mono 12 truncate)
├ time      span.font-mono.text-mono-sm.text-ink-muted → "2h ago"
└ actions   flex gap-1: Ghost "Ack" · Ghost "Snooze" · Secondary "Resolve"
Mobile grid 70px 1fr: severity + title stack; actions move into a MoreVertical Radix dropdown (Ack / Snooze 1h / Resolve / Notify again). States: open → full opacity, all three actions; acked → Ack label becomes "Acked ✓" in text-ok, button disabled; snoozed → Snooze label "Snoozed 1h", row opacity-80, a BellOff icon appears before the time; resolved → opacity-60, actions replaced by Tag "resolved · 48m"; hover/focus as usual. Animation: status change → row layout transition 200ms to its new group; resolve fades opacity 160ms. New incident arriving via SSE → tw-rise 200ms at the top of Today. A11y: the title button is the row's primary control (aria-haspopup="dialog"). Action buttons carry aria-label={Acknowledge incident ${title}} etc.

3.16 IncidentDrawer
Purpose: evidence + timeline + actions for one incident. Radix Dialog with modal, rendered as a right-anchored panel (desktop) / bottom sheet (mobile). Anatomy:

Dialog.Overlay  fixed inset-0 z-30 bg-scrim           (fade 160ms)
Dialog.Content  ml-auto w-[460px] h-full bg-overlay border-l border-hairline shadow-lg flex flex-col
├ header  p-[var(--pad)] border-b border-hairline flex flex-col gap-2.5
│   ├ row: StatusBadge · Tag(status) · IconButton X (ml-auto, 44px)
│   ├ Dialog.Title  h2 22px
│   ├ button.font-mono.text-mono.text-tide  → `${datasetKey} ↗`   (navigates to dataset)
│   └ row.text-caption.text-ink-muted.font-mono.gap-[18px]
│         "opened 14:02" · "check · freshness" · "notified · slack, ntfy"
├ body  p-[var(--pad)] flex flex-col gap-4 flex-1 overflow-y-auto
│   ├ section "What changed"  (label) → bordered table of evidence rows
│   │     grid 1fr auto auto : label · <s>before</s> · after(colored, 500)
│   ├ section "Timeline"      (label) → rows grid 70px 12px 1fr
│   │     time(mono 12) · dot+rail · text(13)
│   └ <details> summary "Raw probe output" (Terminal icon, 13px, muted)
│         <pre class="font-mono text-mono-xs bg-sunken border border-hairline p-2.5 whitespace-pre-wrap">
└ footer p-[var(--pad)] border-t border-hairline flex gap-2 flex-wrap
      Secondary "Notify again" · Ghost "Ack" · Ghost "Snooze" · Primary(ml-auto) "Resolve"
Props: incidentId: string | null · onClose. Data via useQuery(['incident', id]); render the list row's data immediately as placeholder (placeholderData) so the drawer never flashes empty. States: loading → header from placeholder + body skeleton (3 evidence rows, 3 timeline rows); error → ErrorState inside the body with "Retry"; resolved → footer shows only "Notify again" + a Tag "resolved · 1h 12m"; empty evidence (rare) → "No evidence captured for this incident." in text-ink-muted. Animation: panel tw-drawer-in 240ms ease-out (mobile tw-sheet-in), overlay fade 160ms; exit reverses at 200ms via AnimatePresence. Resolving closes the drawer after the mutation settles (200ms) and fires a toast. A11y: Radix handles focus trap, aria-modal, Escape, and scroll lock. Initial focus → the close button. aria-describedby the evidence section. Mobile sheet supports swipe-down-to-close (drag on the header, threshold 80px) — optional.

3.17 WizardStepper
Anatomy: div.flex.gap-1 of 4 span.w-[22px].h-[3px]; fill --accent for i <= step, --border-hairline beyond. Sits in the dialog header, right of the title. Onboarding uses the labelled variant: div.flex.gap-1.5 of three columns, each div.h-[2px] bar + a label-role caption "01 · Admin"; current step's caption is --accent, others --text-muted. Props: steps: string[] · current: number · variant: 'bars'|'labelled'. A11y: role="progressbar" aria-valuemin={1} aria-valuemax={steps.length} aria-valuenow={current+1} aria-valuetext={Step 2 of 4, ${steps[1]}}. Not clickable (the "Change" link goes back).

3.18 SchemaDrivenForm
Purpose: render an add-source form from the connector's JSON Schema. Never hand-write per-connector forms. Mapping (authoritative):

JSON Schema	Control	Notes
type:"string"	Input (Barlow 14px)	—
type:"string", format:"uri" | x-mono:true | name matches `/url	host	dsn
format:"password" | writeOnly:true	Input type="password" + Eye/EyeOff toggle icon-button (44px)	value never echoed by the API; show •••••••• for saved secrets
type:"integer" / "number"	Input type="number" inputMode="numeric" mono, width 120px	min/max/multipleOf → zod + aria-describedby helper
enum ≤ 3 short options	segmented ToggleGroup	e.g. sslmode
enum 4+	shadcn Select	
type:"boolean"	Switch (36×20 track, 14px knob, square)	label to the right
type:"string", x-format:"duration"	mono Input with a suffix hint "s / m / h / d"	parse with a duration zod refine
type:"array", items.type:"string"	TagInput (chips, Enter to add, Backspace to remove)	e.g. consumer groups, prefixes
type:"object"	<fieldset> with a label-role legend	one nesting level max
x-widget:"sql"	Textarea mono, 6 rows, spellCheck=false	custom-SQL check editor
Layout rules: grid-cols-[repeat(auto-fit,minmax(200px,1fr))] gap-3; a field spans 2 columns when x-span:2 or when maxLength > 80 (URLs/DSNs always span 2). Order = schema x-order, else property order. required → a * in --alert-fg after the label. Validation: generate a zod schema from the JSON Schema at runtime (json-schema-to-zod or a small hand-rolled mapper for the 12 supported shapes) → react-hook-form with zodResolver, mode: 'onBlur', reValidateMode: 'onChange'. Field anatomy & states:

div.field flex flex-col gap-1.5
├ label  (label role, 11px/600/uppercase/.1em, text-ink-muted)
├ input  h-[38px] px-2.5 bg-raised border border-hairline rounded-md text-ink
│        hover:border-strong  focus:border-tide  invalid:border-alert
└ helper p.text-[11px].text-ink-muted   |  error p.text-[11px].text-alert (role="alert")
Disabled → 45% opacity + bg-fainter. Inherited value → placeholder shows the inherited string in text-ink-faint with a right-aligned Tag "inherited". A11y: every input has a real <label for>; errors are aria-describedby + aria-invalid; the first invalid field receives focus on submit.

3.19 ConnectionTestLog
Purpose: live output of "Test connection". This is the trust moment of the product — it must prove read-only access. Anatomy: <pre role="log" aria-live="polite" aria-atomic="false" className="m-0 p-3.5 min-h-[160px] bg-sunken border border-hairline font-mono text-mono-sm whitespace-pre-wrap overflow-auto"> with one <div> per line: span.text-ink-muted timestamp (+ 12ms, right-aligned in a 7ch field) + two spaces + message. Line tones: normal --text-primary; success assertions --ok-fg; warnings --warn-fg; failures --alert-fg. Canonical line set (Postgres):

+ 12ms  connecting to pg.internal:5432 (tls)
+ 53ms  handshake ok · 38ms
+ 94ms  authenticated as tidewatch_ro
+135ms  role is read-only: INSERT denied as expected ✓          (ok tone)
+176ms  information_schema readable · 12 tables in 3 schemas
+217ms  ready                                                    (ok tone)
Kafka substitutes lines 3–5 with SASL SCRAM-SHA-256 authenticated / ACLs: Describe, Read (no Write) ✓ / metadata: 42 topics, 3 brokers. S3 substitutes ListBucket, GetObject only ✓ — PutObject denied as expected / listed 1,092 objects under raw/. Props: lines: LogLine[] · status: 'idle'|'running'|'ok'|'failed'. States: running → header shows a blinking running… (tw-blink 1s steps(1) infinite) and "Discover datasets" is disabled; ok → CircleCheck + "connected · read-only verified" in --ok-fg, Discover enabled; failed → OctagonAlert + "connection failed" in --alert-fg, the failing line in alert tone, plus a footer with Secondary "Back to settings" and Ghost "Retry test"; the raw driver error goes in a <details> "Raw error" below the log. Animation: lines append with tw-fade 160ms. Auto-scroll to bottom on append unless the user has scrolled up (track scrollTop + clientHeight < scrollHeight - 8). Do not use scrollIntoView — set scrollTop = scrollHeight. A11y: role="log" + aria-live="polite"; do not announce every line on slow screen readers — batch by setting aria-relevant="additions text".

3.20 DiscoveryList
Purpose: pick which discovered datasets to monitor. Must survive 10k tables. Anatomy:

div.flex.flex-col.gap-3
├ toolbar flex gap-2 flex-wrap items-center
│   ├ search  relative flex-1 min-w-[180px] : Search icon(14, abs left 10) + Input pl-[30px]
│   │           placeholder="Search 1,284 discovered"
│   ├ Input.font-mono.w-[180px]  placeholder="pattern  public.*_events"
│   ├ Secondary "Select shown"
│   └ Ghost "Clear"
├ list  border border-hairline max-h-[320px] overflow-auto   ← TanStack Virtual when count > 200
│   └ label.grid.grid-cols-[16px_1fr_auto_auto].gap-3.px-3.py-2.min-h-[44px].border-b
│         Checkbox · key(mono, truncate) · rows(mono 12 muted) · hint(11px muted, w-110 right)
└ footer flex gap-2 items-center
      Primary "Monitor 8 datasets"  +  caption
      "Freshness + volume checks are added by default; baselines learn over 24h."
Pattern filter: glob on the key — * → .*, ? → ., . literal; anchored both ends; invalid pattern → the input goes border-alert with helper "Not a valid pattern" and the filter is ignored. Selection model: Set<string> of keys in the wizard store; "Select shown" unions the currently filtered keys; "Clear" empties. Selecting >500 shows an inline warning: "That's {n} datasets — expect ~{n}×2 checks per interval. You can narrow with a pattern." States: 0 discovered → EmptyState "Nothing to discover" / "The role can see the server but no tables in the allowed schemas. Check the role's grants." / "Retry discovery". 0 matches for the query → a 44px row "No matches for {q}" + Ghost "Clear filters". Loading → 8 skeleton rows. hint values: the detected timestamp column, or no ts column (row is selectable but gets an amber TriangleAlert and the hint "no ts column · volume only"), or view. A11y: each row is a <label> wrapping a real checkbox; the list has role="group" aria-label="Discovered datasets"; the footer count is aria-live="polite".

3.21 TokenShowOnceModal
Anatomy: Radix AlertDialog, Frame content w-[min(520px,100%)], bg-overlay, shadow-lg, z-60. Title (h2) "Token created"; body (13px muted) "Copy it now. For your safety it is stored hashed and can't be shown again."; then div.flex.gap-1.5: <code className="flex-1 p-2.5 font-mono text-[12.5px] bg-sunken border border-hairline break-all"> + Secondary "Copy" (Copy icon). Actions: Primary "I've saved it". States: after Copy → button label "Copied ✓" for 2s + toast "Token copied"; the primary button is disabled until the token has been copied or 10s have elapsed (prevents accidental dismissal) with helper "Copy the token to continue"; closing (Escape / outside click) is blocked — onInteractOutside={e => e.preventDefault()} and onEscapeKeyDown prevented; the only exit is "I've saved it". A11y: role="alertdialog", focus starts on the Copy button, aria-describedby on the body.

3.22 RoutingMatrix
Purpose: who hears about what. Scope rows × notifier columns + a min-severity per row. Anatomy: div.overflow-x-auto.border.border-hairline → <table className="w-full min-w-[560px]">

thead th = label role (11px/600/uppercase/.1em), bg-raised, border-b border-hairline, first column "Scope", one per notifier, last "Min severity".
tbody tr border-b border-hairline hover:bg-faint; first cell = span.label.text-ink-muted scope kind (GLOBAL|SOURCE|TAG) + span.font-mono.text-mono name.
Cell toggle: button 44×36 containing a 16×16 box — border-hairline bg-transparent when off, border-tide bg-tide + a 12px Check in --accent-on when on.
Last cell: severity Select rendered as a StatusBadge-styled trigger (icon + WARN/ALERT). Precedence rule (must be visible): more specific wins — tag overrides source overrides global. A cell whose value is inherited renders the box at 45% opacity with a dotted border and a tooltip "inherited from global"; clicking it sets an explicit value. A row can be reset via a RotateCcw icon-button at the row end ("Reset to inherited"). States: optimistic toggle; on mutation failure revert + toast "Couldn't save routing — retried 0/3" with a "Retry" action. Loading → 5 skeleton rows. Empty (no notifiers) → the table is replaced by EmptyState "No notifiers yet" / "Routing needs at least one notifier." / "Add notifier". A11y: each toggle role="switch" aria-checked + aria-label={${notifier} for ${scopeName}}; the table has a <caption class="sr-only">; arrow-key cell navigation is not required (see §9).
3.23 ConfirmDialog
Purpose: all destructive confirms. Destructive = typed confirm. Anatomy: Radix AlertDialog, Frame content w-[min(460px,100%)] bg-overlay p-[var(--pad)] flex flex-col gap-3.5: Title (h2) · body (13px, --text-secondary) · a field with label Type <span class="font-mono text-ink">{match}</span> to confirm + mono Input (autofocus) · actions right-aligned: Secondary "Cancel" + Primary with bg-alert border-alert text-white. Props: title · body · match: string · actionLabel · onConfirm · variant: 'typed'|'simple'. States: confirm button disabled until input.trim() === match (case-sensitive, exact); mismatch after blur → helper "Doesn't match {match}" in --alert-fg; pending → button shows blinking ● + "Deleting…", both buttons disabled; failure → keep the dialog open, show ErrorState inline. variant="simple" (non-destructive confirms, e.g. "Discard this wizard?") drops the typed field. A11y: role="alertdialog", aria-describedby body, Escape cancels, focus returns to the trigger.

3.24 Skeleton variants
Base: div with background: linear-gradient(90deg, var(--skeleton-base) 25%, var(--skeleton-highlight) 50%, var(--skeleton-base) 75%); background-size: 200% 100%; animation: tw-shimmer 1400ms linear infinite; radius 4px (0 for chart/strip variants).

Variant	Geometry (must match the final element)
text	h 12px, w prop (55% default)
title	h 18px, w 40%
badge	h 18px, w 52px
metric	h 30px, w 40%
chart	h as prop (28 / 140), w 100%, radius 0
strip	h 26px, w 100%, radius 0
row	h 44px, w 100%, radius 0, inside a hairline-bordered container
card	hairline-bordered div p-[var(--pad)] containing: row(text 55% + badge), metric, chart-28 — i.e. the DatasetCard geometry
Rules: every list, card, and chart has a skeleton; the skeleton container keeps the real border (border-hairline) but drops the corner marks so a loading card reads as unfinished. Skeleton counts: dataset grid 6, source list 5, incident list 4, notifier grid 4, discovery list 8, routing 5. aria-busy="true" + aria-label="Loading {thing}" on the container; the skeletons themselves aria-hidden.

3.25 EmptyState
Anatomy:

div.border.border-dashed.border-hairline.p-12.flex.flex-col.items-center.gap-3.text-center
├ <TideIllustration/>       72×40 inline SVG (§7.1), stroke --accent
├ h3 (Barlow Condensed 20px/600)      → title
├ p.text-[13px].text-ink-muted.max-w-[320px]  → body
└ Primary (or Secondary for a soft action)     → one action, never two primaries
Props: title · body · action?: {label, onClick} · secondary?: {label, onClick} · size?: 'sm'|'md' (sm: padding 28px, illustration 56×32, no illustration below 390px). Animation: cinematic — illustration tw-fade 600ms then the back wave path draws (tw-draw 1200ms ease-out); text tw-rise 400ms delay 200ms. Once per mount. Copy inventory: see §4 per screen. Rule: title is 2–3 words, body is one sentence that says why it's empty and what to do, action is a verb phrase.

3.26 ErrorState
Anatomy:

div.border.border-alert-border.p-3.5.flex.flex-col.gap-2.text-[13px]
├ row: OctagonAlert(14, --alert-fg) + strong headline + Ghost "Retry" (ml-auto)
└ <details>
    summary.text-[12px].text-ink-muted.cursor-pointer  "Raw error"
    <pre class="font-mono text-mono-xs bg-sunken border border-hairline p-2.5 whitespace-pre-wrap">
Headline copy pattern: Connection lost to {sourceName} / Couldn't load incidents / Probe failed for {datasetKey}. Raw block always includes, in order: the driver/transport message, the endpoint, and a probe trailer probe_id={id} attempt={n}/3 next_retry={s}s. Props: headline · raw: string · onRetry? · variant: 'inline'|'block'|'page'. page centers in the content region with 48px padding. States: retrying → Retry disabled + blinking ●; 3 failures → the Retry label becomes "Retry (3 failed)" and a secondary "Open settings" appears. A11y: container role="alert" on mount only (not on re-render); <details> is keyboard-native.

3.27 CommandPalette
Built on cmdk inside a Radix Dialog, z-45. Anatomy:

overlay fixed inset-0 bg-scrim
Frame content w-[min(560px,100%)] mt-[80px] mx-auto bg-overlay shadow-lg   (mobile: mt-3, w-full)
├ input row  flex items-center gap-2.5 px-3 border-b border-hairline
│   Search(16, muted) · Command.Input (h-11, font-mono 14px, bare) · kbd "esc"
│   placeholder: "Jump to dataset, source, incident… or type > for actions"
└ Command.List  max-h-[360px] overflow-auto p-1.5
    Command.Group heading (label role, px-2.5 pt-2 pb-1): "Datasets" | "Sources" | "Incidents" | "Actions"
    Command.Item  flex items-center gap-2.5 min-h-10 px-2.5 text-[13px]
        icon(14, state-colored) · label (mono for keys) · hint (11px muted, ml-auto)
Behaviour: ⌘K/Ctrl+K toggles from anywhere (global keydown, preventDefault); Escape closes; typing > switches to actions-only. Groups appear only when non-empty; max 5 datasets, 3 sources, 3 incidents. Selected item = bg-faint; cmdk owns arrow/Enter. Actions (exact labels + hints): Probe all sources now / "runs every check" · Toggle theme / "switch to light|dark" · Add source / "open wizard" · Open status page / "status.acme.dev" · Compact density / "switch to comfortable|compact". States: empty query → recents (last 5 visited datasets from the UI store) under a "Recent" group, then Actions; no results → a 40px row "No matches" + hint "Try a table name or >"; loading (search hits the API for >1k datasets, debounce 120ms) → 3 skeleton rows. A11y: cmdk provides role="dialog", combobox semantics, aria-activedescendant. Add aria-keyshortcuts="Meta+K Control+K" to the sidebar trigger.

3.28 ThemeToggle
Sidebar: a ghost row (Sun/Moon 14px + label "Light theme"/"Dark theme"). Mobile top bar: a 44px icon-button. Settings: a 3-option segmented control Dark · Light · System. State in Zustand, persisted to localStorage key tw.ui.theme ('dark'|'light'|'system'), applied by setting document.documentElement.dataset.theme — resolve system via matchMedia('(prefers-color-scheme: dark)') with a listener. Icon crossfades duration-base. aria-label="Switch to light theme", and the segmented control is a radiogroup. No transition on the theme swap itself — do not animate colors across a theme change (it strobes). Set document.documentElement.style.setProperty('--tw-no-transition','1') for one frame if you see bleed.

3.29 DensityToggle
A Switch in Settings ("Compact density") and a ghost button in the designer/dev chrome. Writes density: 'comfortable'|'compact' to the UI store, persisted at tw.ui.density, applied as data-density on the app root which sets --pad/--gap. Changing density animates nothing (instant relayout) — with motion's layout on cards it would jitter; explicitly disable layout animation for one frame after a density change.

3.30 SourceIcon
Purpose: identify a source type without copying anyone's logo. Canonical form (shipped): a square hairline tile with a 2-letter mono monogram — span.grid.place-items-center.border.border-hairline.font-mono.text-[11px].text-tide at 34×34 (source rows), 30×30 (notifier cards), 28×28 (wizard type grid), 22×22 (overview group headers). Codes: PG Postgres · MY MySQL · CH ClickHouse · TR Trino · DK DuckDB · IC Iceberg REST · S3 S3/Garage · KF Kafka/Redpanda · AF Airflow · DB dbt · SL Slack · DC Discord · TG Telegram · NT ntfy · EM Email · WH Webhook · ·· unknown/fallback. Optional glyph variant (variant="glyph"): original monoline marks in §7.2, 24×24, currentColor, stroke 1.5. Use the glyph variant only in the wizard type-picker grid if you want extra recognition; the monogram remains the default everywhere else so the set stays consistent as connectors are added. A11y: role="img" aria-label="Postgres"; the tile is decorative when the type name is already adjacent — then aria-hidden.

3.31 Buttons (Industry-derived; include for completeness)
Variant	Geometry	Default	Hover	Active	Disabled
primary	Frame-filled, h-9 px-4, Barlow 14/500, square, keeps corner marks	bg-tide text-tide-on border-tide	bg-tide-hover	bg-tide-pressed	45%
secondary	h-9 px-3.5, border-hairline bg-transparent	text-ink	bg-faint border-strong	bg-fainter	45%
ghost	h-9 px-2.5, no border	text-ink-muted	bg-faint text-ink	bg-fainter	45%
destructive	as primary but bg-alert border-alert text-white		filter: brightness(.92)	brightness(.85)	45%
icon	size-9 (touch 44), no border	text-ink-muted	bg-faint text-ink		45%
All: transition-[background,border-color,color] duration-fast ease-out, rounded-none (icon buttons rounded-md), focus ring global. Loading state = disabled + a blinking ● (tw-blink) before a present-participle label ("Probing…", "Sending…", "Deleting…"). Never a spinner ring — the blink matches the instrument-panel feel.

3.32 Tag / Kbd / Toast (sonner)
Tag: inline-flex h-[20px] items-center px-1.5 rounded-md text-[10px] tracking-[.04em]; variants accent (bg-tide-100 text-tide-700; dark: bg-tide-100 text-tide-700 resolve correctly by ramp inversion), neutral (bg-neutral-200 text-neutral-800), outline (border-hairline).
Kbd: font-mono text-[11px] px-1.5 border border-hairline rounded-md text-ink-muted.
Toast (sonner, custom render): flex items-center gap-2.5 px-3.5 py-2.5 bg-overlay border border-hairline border-l-2 shadow-md text-[13px] min-w-[240px] max-w-[360px]; left edge = state color; leading state icon (16px); text; optional action Ghost; dismiss X icon-button 28px. Position bottom-right desktop (bottom 16px), bottom-center mobile with bottom: 76px to clear the nav. Duration 4200ms, alert toasts 8000ms and not auto-dismissed while the tab is hidden. Mount tw-pop 200ms; stack max 3, older collapse. Region aria-live="polite"; alert toasts aria-live="assertive".
4. SCREEN SPECS
Route table (TanStack Router):

/onboarding                     (guard: !setupComplete → redirect here)
/                               → Overview
/sources
/datasets/$datasetId            ?tab=timeline|schema|checks|incidents|settings&range=1h|24h|7d|30d
/incidents                      ?filter=open|resolved|all&incident=$id   (drawer is a search param)
/notifiers
/status                         → editor
/status/$slug                   → PUBLIC page (unauthenticated layout, no shell)
/settings
Screen 1 — First-run onboarding /onboarding
┌───────────────────────────────┬─────────────────────────────┐
│ HERO (1.1fr, dark, overflow   │ FORM PANEL (1fr, max 520px) │
│ hidden, padding 40px)         │                             │
│  logo + "tidewatch"  (top)    │  [WizardStepper labelled]   │
│                               │   01 · Admin  02 · Source   │
│  ~~~ tide line SVG ~~~        │   03 · Datasets             │
│  (absolute, vertical center,  │                             │
│   1440×120, morphs to a       │  h2 step title              │
│   sparkline)                  │  p  step body               │
│                               │  [fields]                   │
│  display headline (bottom)    │  [actions]                  │
│  p subhead                    │                             │
│  mono docker line             │                             │
└───────────────────────────────┴─────────────────────────────┘
Hero copy (verbatim):

Wordmark: tidewatch
Headline (display, two lines, <br> after "data"): Know when your data / stops arriving.
Subhead (16px, --text-muted): Uptime Kuma for your data. One container, read-only toward your systems, zero telemetry.
Mono line (12px, --text-muted): docker run -p 3080:3080 ghcr.io/tidewatch/tidewatch
Step 01 — Admin

Title: Create the admin account
Body: Stored locally in the container's volume. No account with us — there is no us.
Fields: Email (type email, placeholder you@company.dev), Password (type password, helper At least 12 characters. A passphrase is fine.)
Action: Continue
Data: POST /api/setup/admin {email: string, password: string} → {token}. Validation (zod): email format; password min(12); on 409 (already set up) → redirect to /.
Step 02 — Source

Title: Add your first source
Body: Paste a connection URL. tidewatch only needs a read-only role.
Field: Connection URL (mono, placeholder postgres://user:pass@host:5432/db?sslmode=require), helper Postgres, MySQL, ClickHouse, Trino, DuckDB — or switch to the full form. with a Ghost "Use the full form" that jumps into the Add-source wizard at step 2 with the type inferred from the URL scheme.
Actions: Connect & discover (primary) · Try the demo dataset (secondary, with a trailing 11px muted span no credentials)
Data: POST /api/sources/parse-url {url} → {type, fields}; then the normal test+discover. Try the demo dataset calls POST /api/demo/seed → seeds the 7 demo datasets and jumps straight to step 03.
Edge: unparseable URL → field error Not a connection URL I recognise. Supported schemes: postgres, mysql, clickhouse, trino, duckdb.; test failure → inline ErrorState under the field with the raw error and a Retry; the step does not advance.
Step 03 — Datasets

Title: Datasets surfacing… (when discovery is still streaming) → Found {n} datasets (when complete)
Body: Found {n} in {sourceName}. Baselines learn over the first 24h.
List: up to 6 rows (StatusDot ok + mono key + {rows} rows), each rising in 90ms apart; if n > 6, a 7th row reads +{n-6} more in --text-muted.
Action: Open overview
Data: SSE GET /api/sources/{id}/discover/stream → {key, rows, tsColumn} events.
Edge: n === 0 → replace the list with EmptyState "Nothing to discover" / The role can see the server but no tables in the allowed schemas. Check the role's grants. / action Back to the source.
Responsive: ≥1024 two columns minmax(0,1.1fr) minmax(0,1fr); 768–1023 two columns 1fr 1fr with the headline at 36px; <768 single column — the hero collapses to a 240px band (logo, tide SVG, headline 32px, no mono line) above the form, form padding 20px. Guard: if GET /api/setup/state says complete, /onboarding redirects to /. The wizard state lives in a Zustand slice, not the URL, but the step index is mirrored to ?step= so a refresh resumes.

Screen 2 — Overview /
sticky strip (z-5)
├ h1 "Overview"   counts(mono): "6 OK  2 warn  1 alert  0 unknown  1 paused"
│                 right: "last probe 12s ago" + live dot
└ FilterChipBar:  All 9 · Alert 1 · Warn 2 · OK 6 · Unknown 0 · Paused 1 ·
                  warehouse-pg 4 · gold 1 · silver 3 · bronze 4
per source group:
├ sticky group header (z-4): [SourceIcon 22] "warehouse-pg"  "Postgres · 4"
└ grid of DatasetCard
Copy: h1 Overview. Counts render as {n} OK, {n} warn, {n} alert, {n} unknown, {n} paused — each with its state icon; a zero count renders in --text-muted with the same icon. Right meta: last probe {age}. Live dot tooltip: Live · SSE connected / when reconnecting: Reconnecting… (amber) / when down: Live updates offline — showing last known state (unknown gray, and the whole strip gains a 1px amber bottom border). Data per region: GET /api/datasets?view=summary → DatasetSummary[]:

type DatasetState = 'ok'|'warn'|'alert'|'unknown'|'paused';
interface DatasetSummary {
  id: string; key: string; displayName: string;
  sourceId: string; sourceName: string; sourceType: string; sourceCode: string;
  kind: 'table'|'view'|'topic'|'prefix'|'dbt model'|'dag';
  tags: string[]; state: DatasetState; stateSince: string;      // ISO
  lastRowAt: string | null;                                      // null = never probed
  expectedEverySeconds: number | null;
  warnAfterSeconds: number; alertAfterSeconds: number;
  rowsWindow: number | null; volumeDeltaPct: number | null;      // vs baseline
  sparkline: number[];                                            // 24 buckets
  checkCount: number; openIncidentCount: number;
  paused: boolean; pausedAt: string | null;
}
Live: SSE GET /api/stream events dataset.state, dataset.probe, incident.opened|resolved, source.state. Patch the TanStack Query cache with setQueryData — never refetch the whole list on an SSE tick. Grouping/sorting: grouped by source in the source's configured order; within a group, sort by severity (alert → warn → unknown → ok → paused), then by lastRowAt ascending (stalest first), then key alphabetically. Sort is stable so SSE updates reorder with a layout animation rather than jumping. Interactions & edge cases:

0 datasets, 0 sources → the whole content region is EmptyState: title No sources yet, body Connect a database, a bucket or a topic. Read-only is enough., action Add source (opens the wizard). No chips, no counts strip (h1 only).
0 datasets, ≥1 source → title Nothing monitored yet, body {sourceName} is connected but no datasets are selected., action Pick datasets (opens discovery for that source).
1 dataset → grid renders one card at minmax(250px,1fr) → full-width card up to 520px max, left-aligned (do not stretch a single card across 1440px): cap the grid at max-width: 520px when count === 1.
30+ datasets → group headers do the work; no pagination. Above 120 cards, virtualise the grid with TanStack Virtual (row-based, 3 cards/row at 1440) and disable mount stagger.
Very long names → the card name is truncate with title attr and a Radix tooltip showing the full key; never wrap (breaks the card grid rhythm).
Paused → card at 70% opacity, hollow dot, delta —, age frozen at pause time with note paused {age} ago. Paused cards sort last and are hidden under the "All" chip only if >5 paused exist — otherwise always shown (see §9).
Never probed → UNKNOWN badge, age —, note never probed, flat gray sparkline; clicking still opens the detail page (Timeline tab shows its own empty state).
Clicking a card → /datasets/$id?tab=timeline&range=24h. Middle-click/⌘-click opens a new tab (use a real <a> inside the button? No — make the card an <a> with role unchanged; that is the correct fix: the card is an <a href>, styled as above). Responsive: 390 → 1 column, chips scroll horizontally in a single row (overflow-x-auto, no wrap, 44px tall), counts wrap to a second line, group headers stick under the 52px top bar. 768 → 2 columns. 1024 → 3. 1440 → 4. 1920 → 6 and page padding 24px.
Screen 3 — Sources /sources
h1 "Sources"   caption "{n} connected · read-only roles"        [+ Add source]
border box
├ SourceCard row × n
Copy: h1 Sources; meta {n} connected · read-only roles; primary Add source; row action Probe now; delete aria-label Delete source {name}. Delete confirm: title Delete {name}? · body Removes the source, its {n} datasets and all probe history. Your database is untouched. · typed match = the source name · action Delete source. Data: GET /api/sources → Source[]:

interface Source {
  id: string; name: string; type: string; code: string; host: string;
  datasetCount: number; state: 'ok'|'warn'|'alert'|'unknown';
  lastProbeAt: string | null; readOnlyVerified: boolean; createdAt: string;
}
POST /api/sources/{id}/probe → 202. Add-source wizard (modal, 4 steps, z-40, w-[min(760px,100%)], max-h-full overflow-auto):

Step 1 — type picker. Header title Add source + WizardStepper. Body caption: Pick a type. The form is generated from the connector's JSON schema. Grid repeat(auto-fill,minmax(130px,1fr)) gap 8px of buttons: [SourceIcon 28] {name} / {kinds}: Postgres "tables · views" · MySQL "tables" · ClickHouse "tables · parts" · Trino "catalogs · tables" · DuckDB "file · tables" · Iceberg REST "snapshots" · S3 / Garage "prefixes · objects" · Kafka / Redpanda "topics · lag" · Airflow "DAG runs" · dbt "run results".

Step 2 — form. Row: [icon] {name} + caption schema v{n} + Ghost "Change" (ml-auto). SchemaDrivenForm from GET /api/connectors/{type}/schema. Footer: Primary "Test connection" + caption Runs SELECT 1 and checks the role is read-only. (Kafka: Fetches metadata and checks the ACLs are read-only.; S3: Lists the prefix and checks writes are denied.)

Step 3 — test. Row: Testing {name} + status chip. ConnectionTestLog. Footer: Primary "Discover datasets" (disabled while running) · Ghost "Back". Edge — failure mid-wizard: the log ends in an alert line, the status chip reads connection failed, Discover datasets stays disabled, and a <details> "Raw error" appears. Footer becomes Primary "Retry test" · Ghost "Back" · Ghost "Save anyway" (saves the source in UNKNOWN state so credentials aren't lost — toast Saved {name} — it will show UNKNOWN until a probe succeeds.). Closing the wizard with unsaved input opens ConfirmDialog variant="simple": Discard this source? / The form isn't saved. Your connection details will be lost. / Discard.

Step 4 — discovery. DiscoveryList. Footer primary Monitor {n} datasets (n = selection size; disabled at 0 with helper Pick at least one dataset.). Edge — 10k tables: discovery is paged (GET /api/sources/{id}/discover?cursor&limit=500) and virtualised; the search box placeholder shows the total (Search 10,412 discovered) and search/pattern are server-side (debounce 200ms) above 2,000 items. Default selection when count > 200: nothing pre-selected, and a caption Too many to select by default — search or use a pattern. Below 200: the first 8 are pre-selected (matching the demo flow). Responsive: the row layout collapses to Frame cards below 768 (see 3.7). The wizard is a full-screen sheet below 768 (inset-0, padding 8px, sticky footer). The type grid becomes minmax(110px,1fr).

Screen 4 — Dataset detail /datasets/$id
hero (border-b)
├ Ghost "← Overview"
├ row: [StatusBadge md] h1(mono, key) [copy icon]   ⟶ right: "Probe now" "Pause"
├ metrics row: Last row | Rows · 24h | Source      ⟶ right: TimeRangePicker
└ tablist: Timeline · Schema(3) · Checks(3) · Incidents(1) · Settings
panel per tab
Copy: back Overview; actions Probe now, Pause / Resume; metric labels Last row, Rows · 24h, Source; delta note {delta} vs 7-day baseline; copy-key toast Copied {key}; probe toast Probe queued for {displayName}. Metric values: Last row = FreshnessPill size="metric-lg" + note = expected every {interval} | alert after {t} | schema drift detected | paused {age} ago | never probed. Rows · 24h = formatted count (§6.3). Source = {sourceName} + caption {kind} · {tags.join(', ')}.

Tab: Timeline. Two Frames side by side (minmax(320px,1fr)): FreshnessGapChart then BaselineBandChart. Below them, when the range is ≥7d, a third full-width Frame Probe log — a 10-row table (time · result · duration · rows) with Ghost "Load more". Tab: Schema. Header row: Snapshot {fromTs} → {toTs} and right-aligned counts +{added} −{removed} ~{changed}. Then the diff table of SchemaDiffRow. A Select at the right of the header picks the comparison snapshot ("latest vs previous", "latest vs 7 days ago", "latest vs first"). Empty: No schema history yet / The first snapshot is taken on the next probe.; not applicable (S3 prefix / Kafka topic without a registry): Schema tracking isn't available for {kind} datasets. in --text-muted, no frame. Tab: Checks. One Frame per check: header row (StatusBadge sm + h3 name + caption description) with an enabled Switch right-aligned; second row = the check's fields via SchemaDrivenForm (inline, minmax(120px,1fr)) + Secondary "Save" + Ghost "Run now". Footer button Secondary "Add check · custom SQL". Check catalogue and their fields: Freshness (warn after, alert after) · Volume (band, min rows) · Schema drift (on added, on removed) · Null rate (column, max null %) · Custom SQL (expect, SQL textarea) · Kafka lag (warn above, alert above) · Run status (fail on). Dirty state: the Save button becomes Primary and a caption appears Unsaved changes; navigating away opens the simple confirm Discard check changes?. Tab: Incidents. IncidentRow list filtered to this dataset; empty → EmptyState Calm seas / No incidents for this dataset in the last 90 days. (no action). Tab: Settings. Fields: Display name, Tags (TagInput), Timestamp column (Select of the schema's timestamp columns + Detect automatically), Probe interval (mono duration, helper Minimum 15s. Reads one row.), Owner (email), Notifier route (read-only text inherit · per-source ({sourceName}) + Ghost "Edit routing" → /notifiers). Actions: Save (primary) and Stop monitoring (ghost, text-alert). Confirm: Stop monitoring {displayName}? / Deletes probe history for this dataset. The table itself is untouched. / typed match {displayName} / Stop monitoring. Data: GET /api/datasets/{id} (detail + checks + current schema) · GET /api/datasets/{id}/series?range=&metric=freshness|rows · GET /api/datasets/{id}/schema/diff?from=&to= · GET /api/datasets/{id}/incidents · PATCH /api/datasets/{id} · POST /api/datasets/{id}/probe · POST /api/datasets/{id}/pause|resume. Edge cases: never probed → all metrics —, both charts show Nothing probed yet / The first probe runs within {interval}. and Probe now is the primary action in the empty state. Paused → a full-width amber strip above the tabs: Paused {age} ago — checks aren't running. + Secondary "Resume"; charts render history but gray the region after the pause timestamp with a 4px diagonal hatch. Very long key → h1 uses overflow-wrap:anywhere and drops to 18px above 60 characters. Deleted dataset (404) → ErrorState variant="page" That dataset is gone / It may have been removed from monitoring. / Back to overview. Responsive: <768 — the hero action buttons move under the title as a 2-up row of 44px buttons; the metrics row becomes a 2-column grid; the TimeRangePicker becomes full-width segmented; the tablist scrolls horizontally with a fading right edge; charts stack single-column at height 120 and drop from 48 to 24 buckets (freshness) / 30 to 14 points (rows).

Screen 5 — Incidents /incidents
h1 "Incidents"   caption "{open} open · {resolved} resolved this week"   [Open|Resolved|All]
per day group
├ sticky day header: "Today" ──────────────────────
└ IncidentRow × n
[IncidentDrawer]  (?incident=id)
Copy: h1 Incidents; meta {n} open · {n} resolved this week; filters Open Resolved All; day labels Today, Yesterday, then Mon 8 Sep (locale short). Empty (Open filter): Nothing open / Every dataset is inside its thresholds. Incidents open here the moment one isn't. / Show resolved. Empty (All): No incidents in 90 days / Either things are healthy or nothing is being checked yet. / Review checks. Incident titles (generated server-side; these are the canonical patterns): No rows for {duration} · Volume {±pct} vs baseline · Consumer lag above {n} · Schema drift: +{a} column{s}, {c} type change{s} · dbt run failed · Null rate {pct} on {column} · Custom SQL check failed · Connection lost. Data:

interface Incident {
  id: string; datasetId: string; datasetKey: string; sourceName: string;
  severity: 'warn'|'alert'; title: string; check: string;
  openedAt: string; resolvedAt: string | null;
  status: 'open'|'acked'|'snoozed'|'resolved'; snoozedUntil: string | null;
  ackedBy: string | null; notifiedVia: string[];
  evidence: { label: string; before: string; after: string }[];
  timeline: { at: string; kind: 'opened'|'notified'|'acked'|'snoozed'|'resolved'|'note'; text: string }[];
  raw: string;
}
GET /api/incidents?filter=&cursor= · POST /api/incidents/{id}/ack|snooze|resolve|notify. Flows: Ack → optimistic, toast Acknowledged. Snooze → a Radix dropdown on the Snooze button with 1 hour, 4 hours, Until tomorrow 09:00, Until resolved; toast Snoozed for 1h. Resolve → optimistic, toast Resolved — will reopen if it recurs, row moves to the resolved style, drawer closes if open. Notify again → toast Re-sent to {notifier list}. All mutations revert on error with an assertive toast Couldn't {verb} — {reason} + Retry. Edge cases: an incident arriving while you're on the screen inserts at the top of "Today" with tw-rise and bumps the sidebar badge with a single pulse. More than 200 incidents → infinite scroll (useInfiniteQuery, page 50) with a sticky "Load more" fallback button for keyboard users. An incident on a now-deleted dataset shows the key in --text-faint with a tooltip dataset no longer monitored and the ↗ link is inert. Deep link ?incident=unknown-id → drawer opens with ErrorState Incident not found / Close. Responsive: <768 — actions collapse to a MoreVertical dropdown; the drawer becomes a bottom sheet; day headers stick under the top bar; the filter segmented control moves to its own full-width row under the h1.

Screen 6 — Notifiers /notifiers
h1 "Notifiers"   caption "Slack, Discord, Telegram, ntfy, email, webhook — 100+ more via Apprise"
                                                                     [+ Add notifier]
grid minmax(240px,1fr) of NotifierCard
h3 "Routing"  caption "Who hears about what. Per-source and per-tag rows override global."
RoutingMatrix
Copy: as above; card meta last sent {age} · {n} events / 7d; buttons Send test, Edit; matrix headers Scope, one per notifier, Min severity; scope kinds GLOBAL, SOURCE, TAG. Add notifier dialog: a type picker (Slack, Discord, Telegram, ntfy, Email, Webhook, Apprise URL) then a SchemaDrivenForm per type; the Apprise URL option is a single mono field with helper Any Apprise URL — e.g. tgram://token/chat_id. See the Apprise docs for the full list. Footer: Secondary "Send test" + Primary "Add notifier". Data: GET /api/notifiers, GET /api/routes, POST /api/notifiers/{id}/test, PUT /api/routes.

interface Notifier { id: string; kind: string; code: string; name: string; target: string;
  lastSentAt: string|null; events7d: number; enabled: boolean; }
interface Route { id: string; scope: 'global'|'source'|'tag'; scopeRef: string|null;
  notifierIds: string[]; minSeverity: 'warn'|'alert'; }
Edge cases: 0 notifiers → replace both regions with one EmptyState: No notifiers yet / tidewatch can't tell you anything until it has somewhere to send it. / Add notifier. >6 notifiers → the matrix scrolls horizontally with the Scope column sticky left-0 bg-canvas and a right-edge shadow. A notifier that has failed its last 3 deliveries gets a TriangleAlert + text-warn meta last 3 sends failed and its column header shows the same icon. Responsive: <768 — cards single column; the matrix becomes a per-scope accordion: each scope is a Frame with a header (scope + name + min severity) and inside, one 44px Switch row per notifier. Do not force a table on mobile.

Screen 7 — Status pages
7a. Editor /status

h1 "Status page"   mono "status.acme.dev/{slug}"     [View public page] [Publish]
┌ left (1fr) ─────────────────┬ right (1.2fr) ──────────┐
│ Title            [input]    │ Frame "LIVE PREVIEW"     │
│ Slug             [mono]     │  per dataset: icon + key │
│ Theme            [seg]      │  + uptime% + 90d strip   │
│ Datasets shown · 6          │                          │
│  [checkbox list, max-h 300] │                          │
│ ☑ Show incident history…    │                          │
└─────────────────────────────┴──────────────────────────┘
Copy: labels Title, Slug, Theme (auto dark light), Datasets shown · {n}, checkbox Show incident history (publicly), preview kicker LIVE PREVIEW, buttons View public page, Publish; publish toast Published to status.acme.dev/{slug}. Slug helper: Lowercase letters, numbers and dashes. Slug taken → That slug is taken. Data: GET/PUT /api/status-page → {title, slug, theme, datasetIds, showIncidents, published, publishedAt}. Edge: 0 datasets picked → Publish disabled with helper Pick at least one dataset to publish.; the preview shows EmptyState size="sm" Nothing selected. Unpublished → the header slug is text-ink-faint with a Tag "draft".

7b. Public page /status/$slug — no app shell, no auth, own theme root, max-width 880px, padding 48px var(--pad) 80px.

row: [logo] h2 {title}                                  (no nav)
Frame banner: [state icon 22] {bannerTitle} / {bannerSub}      right: "updated {age}"
per dataset:
  row: [state icon 16] mono key · {STATE label} · right "{uptime}% fresh · 90 days"
  NinetyDayBarStrip
  row: "90 days ago" ······································· "today"
grid 2-up:
  Frame "Badge":  two badge SVGs + mono URL
  Frame "Embed":  iframe snippet + [Copy]
footer: "Powered by tidewatch · open source" ······ "No cookies. No tracking."
Banner copy by worst state: ok → All datasets fresh / {n} datasets within their freshness windows; warn → Some datasets degraded / {n} warning · rest fresh; alert → Data incident in progress / {keys} stale — team notified; unknown → Status unknown / tidewatch hasn't probed these yet. When showIncidents is on, an extra section after the strips: h3 "Recent incidents" + up to 5 rows {date} · {title} · {duration} (mono, no actions, no evidence — never leak internals publicly). Data: GET /api/public/status/{slug} (unauthenticated, cache 30s, no cookies, no client-side analytics). Polls every 60s (no SSE publicly). Badge: GET /api/public/badge/{slug}/{dataset}.svg — shields-style, 20px tall, left block #2b2b2d with the dataset short name, right block --ok-fg/--warn-fg/--alert-fg/--unknown-fg with fresh 4m / stale 31m / lag 12k / unknown. Font JetBrains Mono 11px (embed as font-family="JetBrains Mono, monospace"; the SVG must render without the font too — set explicit textLength or accept fallback metrics). Cache-Control: max-age=60. URL shown as https://status.acme.dev/badge/orders.svg. Embed snippet (verbatim): <iframe src="https://status.acme.dev/embed?theme=auto" height="480"></iframe>; Copy toast Embed snippet copied. Edge: unknown slug → a bare centered page, Frame with No status page here / The link may be wrong, or the page was unpublished. (no tidewatch nav, no login link). All datasets unknown → banner unknown variant. Mobile: single column, strips 45 cells, the two Frames stack, banner text 17px. Responsive (public): 390 → padding 16px, h2 20px, strips 18px tall / 45 cells, uptime moves under the key. ≥768 → the 90-cell strip. ≥1024 → the badge/embed grid goes 2-up.

Screen 8 — Settings /settings
Sections, each grid-cols-[220px_minmax(0,1fr)] gap-[var(--gap)], 34px apart, max-width 860px. Left column: h4 + 12px muted description. Right: controls.

Section	Description copy	Controls & copy
Profile	Single admin by design. Add API tokens for automation.	Email · New password (helper Leave blank to keep the current one.) · Update → toast Saved
API tokens	Shown once. Scope them narrowly.	rows: [Key icon] {name} / mono {prefix}… · {scope} / used {age} / Revoke (ghost, alert). Button Create token. Create dialog: Name, Scope (segmented read probe admin), Expires (Select: Never, 30 days, 90 days, 1 year) → TokenShowOnceModal. Revoke confirm: Revoke {name}? / Anything using this token stops working immediately. / typed match {name} / Revoke
Security	tidewatch never sends data anywhere you didn't configure.	The egress Frame toggle (below) + two facts with ShieldCheck in --ok-fg: Telemetry: none, not optional · Source access: read-only, verified at connect
Retention	Probe history lives in the container's SQLite volume.	Raw probes 14d · Hourly rollups 400d · Schema snapshots keep all (mono duration inputs; helper under the row: Shortening a window deletes older rows on the next nightly compaction.)
Appearance	—	Theme segmented Dark Light System · Switch Compact density · Switch Reduce motion (helper Overrides your system setting for this browser.)
Keyboard	—	2-column list of {action} / <kbd>: Command palette ⌘ K · Go to overview g o · Go to incidents g i · Probe focused dataset p · Acknowledge incident a · Toggle theme t · Toggle density d · This list ?
Egress toggle (exact): a Frame button, aria-pressed, containing a 36×20 square track (bg-tide when on, transparent + hairline when off) with a 14×14 knob (left: 2px → left: 18px, duration-fast), then:

Title: Strict egress policy · {on|off}
Body: When on, the container can only talk to your sources and the notifiers you've listed. Any other outbound connection is refused and logged. Turn it off only if a notifier needs a redirect you can't predict. Turning it off requires a ConfirmDialog variant="simple": Allow unlisted outbound traffic? / tidewatch will stop refusing connections to hosts you haven't configured. Only do this if a notifier needs it. / Turn off. Data: GET/PATCH /api/settings, GET/POST/DELETE /api/tokens. Responsive: <1024 → sections stack (label above controls); token rows become two-line; the keyboard list becomes one column.
Screen 9 — Command palette (overlay on every screen)
Spec in §3.27. Screen-level notes: the palette is a route-independent overlay driven by useUiStore().paletteOpen, mounted once in the root layout. It closes on navigation. On mobile it is full-width with mt-3 and the input is 44px tall with autoFocus (accept the keyboard popping up). Recents are stored in the UI store (lastVisited: string[], max 5, persisted).

5. MOTION CHOREOGRAPHY
Use motion (Framer) for orchestrated/layout moves; plain CSS animations for loops (shimmer, pulse, tide). Wrap everything in a useReducedMotion() guard; the global CSS rule in §1.2 is the belt-and-braces fallback.

5.1 Onboarding cinematic, beat by beat
#	Trigger	Element	Property	From → To	Duration	Easing	Delay
1	mount	wordmark	opacity, y	0, 6px → 1, 0	1400ms	ease-out	0
2	mount	tide path	SVG d	sine wave (6 lobes, amp 40) → jagged sparkline path (16 segments, amp 10–46)	7000ms	ease-in-out	0; holds the wave for the first 45% (3150ms), morphs 45→70%, holds the sparkline after
3	mount	headline	opacity, y	0, 6px → 1, 0	1400ms	ease-out	300ms
4	mount	subhead + docker line	opacity	0 → 1	800ms	ease-out	700ms
5	mount	stepper	opacity	0 → 1	1400ms	ease-out	200ms
6	step change	step panel	opacity, y, scale	0, 8px, .98 → 1, 0, 1	200ms	ease-out	0 (exit: same reversed, 120ms)
7	stepper advance	active bar	background	hairline → accent	160ms	ease-out	per bar, 60ms apart
8	discovery event	each found row	opacity, y	0, 6px → 1, 0	200ms	ease-out	i * 90ms
9	"Open overview"	hero panel	opacity, x	1, 0 → 0, −24px	240ms	ease-out	0 — then route change
Animate d with motion's path interpolation (both paths must have the same command structure — author both as 16 C/S segments; I have working paths in the prototype, replicate the shape: a 6-lobe S-curve wave and a 16-node jagged line, both starting at M0 60 and ending at 1440 48–60). Reduced motion: no morph — render the sparkline path statically, fade all text in over 1ms, keep the stagger at 0.

5.2 Card stagger (first paint only)
Trigger: the Overview dataset query resolves for the first time in the session. motion.a with initial={{opacity:0, y:6}} animate={{opacity:1, y:0}} transition={{duration:.2, ease:[.2,.7,.2,1], delay: Math.min(index,11)*0.04}}. Set a hasStaggeredRef in the UI store — subsequent filter changes, SSE updates, density changes and route returns render with initial={false}. Reduced motion: initial={false} always.

5.3 Status-change pulse
Trigger: a dataset's state differs from the previous render's value (track with a useRef map keyed by dataset id; also fired by the SSE handler which stamps pulseUntil = Date.now()+1500). Target: the StatusBadge. Property: box-shadow via tw-pulse-ring — 0 0 0 0 currentColor → 0 0 0 9px transparent, 900ms ease-out, 1 iteration, where currentColor is the new state's fg at ~55% (color-mix(in srgb, currentColor 55%, transparent)). Simultaneously the badge's color/background crossfade over duration-base, and the card border crossfades to the state border if alert. Reduced motion: color crossfade only, no ring.

5.4 List reorder
Trigger: sort order changes (SSE state change, resolve, snooze). Use motion layout on DatasetCard and IncidentRow inside a LayoutGroup; transition={{duration:.2, ease:[.2,.7,.2,1]}}. Exiting items (filtered out) AnimatePresence → opacity 0, scale .98, 120ms. Cap: disable layout when the list exceeds 120 items (perf) and when density changed in the last frame. Reduced motion: layout={false}.

5.5 Drawer / sheet / dialog
Drawer (desktop): x: '100%' → 0, 240ms ease-out; exit x: '100%', 200ms. Overlay opacity 0→1, 160ms.
Sheet (mobile): y: '100%' → 0, 240ms ease-out; exit 200ms.
Dialogs (wizard, confirm, token): opacity 0→1 + y 8→0 + scale .98→1, 200ms ease-out; exit 120ms, no scale.
Reduced motion: opacity only, 1ms.
5.6 Chart draw-in (first mount only)
Line charts: strokeDasharray: 1000; strokeDashoffset: 1000 → 0, 800ms ease-out. Band: opacity 0 → .14, 400ms, delay 100ms. Bars: y: chartHeight → y, scaleY: 0 → 1 from transform-origin: bottom, 200ms each with 15ms stagger capped at 700ms total. Outlier dots: scale 0 → 1 with ease-spring, 200ms, delay 600ms + 40ms stagger. Guard with a per-chart hasDrawnRef; a range change re-renders without draw-in (just a 160ms crossfade of the data). Reduced motion: everything final-state immediately.

5.7 Skeleton shimmer
tw-shimmer 1400ms linear infinite on a 200%-wide gradient. All skeletons on a screen share one animation timeline (same duration, no per-item delay) so the page reads as one loading surface. Reduced motion: no animation — a static --skeleton-base fill (still clearly a placeholder).

5.8 SSE live-update pulse
Connected: the sidebar dot runs tw-pulse-ring 2400ms infinite at 35% alpha; the label reads live · SSE connected.
Probe tick (any dataset updated): the header strip's "last probe" dot fires one 900ms ring; the affected card's sparkline crossfades its last point over 160ms (no re-draw).
Reconnecting: the dot goes --warn-fg, tw-blink 1s steps(1) infinite, label reconnecting…; exponential backoff 1s → 30s.
Disconnected >60s: dot --unknown-fg, static, label live updates offline, and a single non-dismissing toast Live updates offline — showing last known state with a Retry action.
Reduced motion: no pulses; the label carries the state.
6. STATUS & FORMATTING RULES
6.1 State → colour + icon + shape (authoritative)
State	Meaning	fg token	bg token	lucide icon	Shape cue	Text label
ok	inside all thresholds	--ok-fg	--ok-bg	CircleCheck	circle	OK
warn	past warn, before alert	--warn-fg	--warn-bg	TriangleAlert	triangle	WARN
alert	past alert threshold	--alert-fg	--alert-bg	OctagonAlert	octagon	ALERT
unknown	never probed, or connection lost	--unknown-fg	--unknown-bg	CircleHelp	circle + ?	UNKNOWN
paused	checks disabled by a human	--paused-fg	transparent + hairline border	CirclePause	circle + bars	PAUSED
Rules: never render state as colour alone — every status carries its icon and (except in the 90-day strip and the sparkline, where the tooltip and the adjacent badge carry it) its text label. Icon stroke-width 1.8 for status glyphs (slightly heavier than the UI's 1.5 so the shape reads at 12px). Severity order for rollups and sorting: alert > warn > unknown > ok > paused. A source's state is the worst state among its datasets, ignoring paused. A day's state in the 90-day strip is the worst state observed in that day.

6.2 Relative time (formatAge)
Input: ISO string or null. Output, exact:

Age	Format	Example
null	—	—
< 10s	{n}s	4s
< 60s	{n}s	47s
< 60m	{m}m {ss}s (seconds zero-padded to 2)	31m 04s
< 24h	{h}h {mm}m	2h 08m
< 30d	{d}d {h}h	3d 4h
≥ 30d	{d}d	62d
negative (clock skew)	0s	—
formatAgo (list meta, "2h ago") is coarser: {n}s ago < 60s · {n}m ago < 60m · {n}h ago < 24h · {n}d ago ≥ 24h · never when null. Durations ("resolved · 1h 12m") use formatAge without padding on the leading unit. Verbose form for aria-label: 31 minutes 4 seconds, via Intl.RelativeTimeFormat where available, else hand-built.

6.3 Numbers
Row counts: Intl.NumberFormat(locale) with grouping, no abbreviation up to 9,999,999 (1,284,310). ≥10M → 3 significant figures + unit: 18.2M, 1.09B. Never abbreviate in a <pre>/SQL context.
Messages/objects: same, with a trailing unit noun: 18.2M msgs, 1,092 objects, 2,140 snapshots.
Bytes: binary units, 1 decimal above 1 unit: 934 B, 12.4 KiB, 3.1 MiB, 1.2 GiB, 4.0 TiB. Label as KiB not KB.
Percentages: one decimal when < 10 and non-integer (0.4%, 4.2%), integer at ≥10 (42%); uptime always one decimal (99.2%).
Deltas: always signed with a Unicode minus for negatives: +3.1%, −78%, +2 objects, +1 row. Zero → +0.0% in --text-muted, never a bare 0. Tone: positive-and-expected → --text-muted; beyond the baseline band → --warn-fg/--alert-fg by severity; improvements → --ok-fg only when recovering from an incident.
Lag: 12,418 msgs under 100k, 1.2M msgs above.
Durations in config fields: compact mono (15m, 30m, 26h, 14d, 400d, 60s); parse leniently (90, 90s, 1.5m all accepted), render canonically.
Locale: use navigator.language for grouping and month names only. Never localise mono/technical strings (keys, SQL, durations, thresholds). Force en digits (Intl.NumberFormat(locale, {numberingSystem:'latn'})) so tabular alignment holds.
6.4 Timestamps & timezone
Policy: the server stores and returns UTC ISO-8601 with offset (2026-09-10T14:02:11Z). The UI renders in the browser's local zone by default; a Settings switch (Show times in UTC) flips it globally (store tw.ui.tz = 'local'|'utc').
Formats: time only 14:02 (24h always, hour12: false); with seconds in logs 14:02:11; date + time 10 Sep 14:02; full in tooltips 2026-09-10 14:02:11 +02:00 (Europe/Berlin); day-group headers Today / Yesterday / Mon 8 Sep; snapshot headers 2026-09-10 14:05 (mono).
Every relative time has the absolute time in a title attribute and in <time dateTime>.
Chart axes show relative labels (−24h, now) not absolute times.
6.5 Truncation
Dataset keys in cards/rows: single-line truncate (ellipsis at the end), full value in title + a Radix tooltip. Minimum visible 18 characters before truncating — if the column can't give 18ch, drop the schema prefix instead (public.orders → orders) and show the full key in the tooltip.
Hosts / connection strings: truncate at the end; in the source row the host gets a fixed max-width: 360px.
Detail-page h1: never truncate — overflow-wrap: anywhere, and step the size down to 18px above 60 characters.
S3 prefixes: truncate in the middle (s3://lake/raw/…/vendor_feed/) — the tail carries the meaning. Implement with a MiddleTruncate helper (measure, not CSS).
Incident titles: 2-line clamp (line-clamp-2) in the row, full in the drawer.
Column names in the schema diff: never truncate (mono, they're short); the table scrolls horizontally instead.
Tags: show 2, then +{n} with a tooltip listing the rest.
7. ICONOGRAPHY
7.1 Logomark + illustration
Logomark — an eye whose iris is a tide line that breaks into a pulse. 32×32 viewBox, currentColor via stroke, stroke-width 1.8 (1.6 at ≥48px), round caps/joins. Ship as <TidewatchMark size={24} />.

<svg viewBox="0 0 32 32" fill="none" stroke="currentColor" stroke-width="1.8"
     stroke-linecap="round" stroke-linejoin="round" role="img" aria-label="tidewatch">
  <path d="M2 16c4-6 24-6 28 0c-4 6-24 6-28 0z"/>
  <path d="M6 16c2 0 2-3 4-3s2 3 4 3l1.5-5 2 9 1.5-4h7"/>
</svg>
Lockup: mark + tidewatch in Barlow Condensed 600, letter-spacing .02em, gap 10px, mark height = cap height × 1.15. The mark is --accent on chrome, --text-primary in monochrome contexts. Minimum size 16px (drop to a 1.6 stroke below 20px). Favicon: the mark on #0f1113, 4px padding, 32×32 and 180×180.

Empty-state illustration — two tide lines, the back one at 50% opacity (the "was", which draws in):

<svg viewBox="0 0 72 40" width="72" height="40" fill="none" stroke="currentColor"
     stroke-width="1.5" stroke-linecap="round" aria-hidden="true">
  <path opacity=".5" d="M2 24c6 0 6-8 12-8s6 8 12 8 6-8 12-8 6 8 12 8 6-8 12-8 6 8 8 8"/>
  <path d="M2 32c6 0 6-6 12-6s6 6 12 6 6-6 12-6 6 6 12 6 6-6 12-6 6 6 8 6"/>
</svg>
7.2 Source marks (original monoline, 24×24, currentColor, stroke 1.5)
All original geometric marks — no official logos, no brand colours. Each is a <g> in a single sprite component <SourceGlyph code="PG"/>.

<!-- PG · Postgres — stacked disks (relational store) -->
<g><ellipse cx="12" cy="6" rx="8" ry="3"/><path d="M4 6v12c0 1.7 3.6 3 8 3s8-1.3 8-3V6"/><path d="M4 12c0 1.7 3.6 3 8 3s8-1.3 8-3"/></g>

<!-- MY · MySQL — disk with a dorsal wave -->
<g><ellipse cx="12" cy="7" rx="8" ry="3"/><path d="M4 7v10c0 1.7 3.6 3 8 3s8-1.3 8-3V7"/><path d="M7 13c2 0 3-2 5-2s3 2 5 2"/></g>

<!-- CH · ClickHouse — column store bars -->
<g><path d="M4 4v16M9 8v12M14 5v15M19 11v9"/><path d="M2 21h20"/></g>

<!-- TR · Trino — split query fan -->
<g><path d="M12 3v6"/><path d="M12 9 5 15v6M12 9l7 6v6M12 9v12"/><circle cx="12" cy="3" r="1.6"/></g>

<!-- DK · DuckDB — single file with a ripple -->
<g><path d="M6 3h8l4 4v14H6z"/><path d="M14 3v4h4"/><path d="M8 15c1.5 0 1.5-2 3-2s1.5 2 3 2"/></g>

<!-- IC · Iceberg REST — floating berg, snapshot layers -->
<g><path d="M3 15h18"/><path d="M12 3 5 15h14z"/><path d="M8 19h8M6 22h12"/></g>

<!-- S3 · object storage — bucket with a prefix slash -->
<g><path d="M4 7h16l-1.5 13H5.5z"/><path d="M4 7 12 3l8 4"/><path d="M10 17l4-6"/></g>

<!-- KF · Kafka/Redpanda — partitioned log with an offset head -->
<g><path d="M3 6h14M3 12h14M3 18h14"/><circle cx="20" cy="6" r="1.6"/><circle cx="20" cy="12" r="1.6"/><circle cx="20" cy="18" r="1.6"/></g>

<!-- AF · Airflow — DAG, three nodes -->
<g><circle cx="5" cy="6" r="2.2"/><circle cx="19" cy="12" r="2.2"/><circle cx="5" cy="18" r="2.2"/><path d="M7 7l10 4M7 17l10-4"/></g>

<!-- DB · dbt — transform pipe, in-out -->
<g><path d="M3 8h7a4 4 0 0 1 4 4v0a4 4 0 0 0 4 4h3"/><path d="M18 13l3 3-3 3"/><circle cx="3" cy="8" r="1.4"/></g>

<!-- ·· · fallback — generic endpoint -->
<g><rect x="3" y="5" width="18" height="14" rx="0"/><path d="M7 10h4M7 14h8"/></g>
Notifier marks reuse the same treatment: SL slack → three offset bars in a pinwheel; DC discord → rounded chat capsule with two dots; TG telegram → paper dart triangle; NT ntfy → bell outline with a radiating arc; EM email → envelope; WH webhook → a hook path with a node. If you'd rather not draw these, the monogram tile is the shipped default — the glyph set is an enhancement.

7.3 lucide-react icon map (exact names)
Concept / action	Icon
OK / WARN / ALERT / UNKNOWN / PAUSED	CircleCheck · TriangleAlert · OctagonAlert · CircleHelp · CirclePause
Overview nav	LayoutGrid
Sources nav / database	Database
Incidents nav / lag / spike	Zap
Notifiers nav / notify again	Bell · muted: BellOff
Status pages nav / public	Globe
Settings nav	Settings
Search / palette	Search
Theme	Sun (to light) · Moon (to dark) · MonitorCog (system)
Density	Rows3 (compact) · Rows2 (comfortable)
Copy	Copy · copied Check
Close / clear	X
Back	ArrowLeft
Add	Plus
Confirm tick	Check
Delete	Trash2
Probe now / retry / refresh	RefreshCw
Open external	ExternalLink
Overflow menu	MoreVertical
API token / key	KeyRound
Security / read-only proof	ShieldCheck
Raw output / logs	Terminal
Time range / schedule	Clock
Schema / columns	Table2
Checks / rules	ListChecks
Custom SQL	FileCode2
Pause / resume	Pause · Play
Snooze	AlarmClockOff
Acknowledge	CircleCheckBig
Resolve	CheckCheck
Reset to inherited	RotateCcw
Sidebar collapse / expand	PanelLeftClose · PanelLeftOpen
Password reveal	Eye · EyeOff
Tag	Tag
Filter	Filter (mobile chip sheet trigger only)
Chevrons	ChevronDown · ChevronRight · ChevronLeft
Drag handle (status page dataset order)	GripVertical
Sort	ArrowUpDown
Info tooltip	Info
Connection lost	Unplug
Success toast	CircleCheck
Global icon defaults: size={16}, strokeWidth={1.5}, absoluteStrokeWidth. Status glyphs override to strokeWidth={1.8}. Set these once via a lucide provider or a thin <Icon> wrapper — do not repeat per call site.

8. ASSET & IMPLEMENTATION NOTES
8.1 Fonts
Self-host (no Google CDN — the product is self-hosted and must work air-gapped). Use @fontsource-variable/barlow… note Barlow has no variable release: install @fontsource/barlow (400, 500, 600), @fontsource/barlow-condensed (600), @fontsource-variable/jetbrains-mono (wght 400–500). Subset to latin + latin-ext.

// src/main.tsx
import '@fontsource/barlow/400.css';
import '@fontsource/barlow/500.css';
import '@fontsource/barlow-condensed/600.css';
import '@fontsource-variable/jetbrains-mono';
All faces font-display: swap; preload only Barlow 400 and Barlow Condensed 600 (<link rel="preload" as="font" crossorigin>) — the mono face is below the fold on first paint. Fallback stacks are in the @theme block; set size-adjust on the fallback if you see a reflow (Barlow x-height ≈ 0.52em).

8.2 Inline SVG assets
Only three: the logomark (§7.1), the empty-state tide (§7.1), the source glyph sprite (§7.2). Plus two SVG defs registered once in the app root: <pattern id="tw-hatch"> (45°, 2px lines, --alert-fg, used for open-ended gaps and paused chart regions) and <linearGradient id="tw-band"> if you prefer a gradient band to flat 14% opacity (flat is the spec). No raster images anywhere in the product. The badge endpoint is server-rendered SVG.

8.3 File structure
frontend/src/
├ main.tsx                     fonts, QueryClient, RouterProvider, ThemeProvider, Toaster
├ routeTree.gen.ts             (generated)
├ routes/
│  ├ __root.tsx                AppShell + CommandPalette + Toaster + SSE provider
│  ├ index.tsx                 Overview
│  ├ onboarding.tsx
│  ├ sources.tsx
│  ├ datasets.$datasetId.tsx
│  ├ incidents.tsx
│  ├ notifiers.tsx
│  ├ status.tsx                editor
│  ├ status.$slug.tsx          PUBLIC (own layout, no shell)
│  └ settings.tsx
├ shell/
│  ├ AppShell.tsx  Sidebar.tsx  MobileTopBar.tsx  MobileBottomNav.tsx
│  └ HeaderStrip.tsx           (condensing sticky strip)
├ components/
│  ├ primitives/   Frame.tsx Corner.tsx Button.tsx Input.tsx Tag.tsx Kbd.tsx Switch.tsx Segmented.tsx
│  ├ status/       StatusDot.tsx StatusBadge.tsx FreshnessPill.tsx SourceIcon.tsx SourceGlyph.tsx
│  ├ data/         Sparkline.tsx MetricNumber.tsx BaselineBandChart.tsx FreshnessGapChart.tsx
│  │               NinetyDayBarStrip.tsx SchemaDiffRow.tsx
│  ├ cards/        DatasetCard.tsx SourceCard.tsx NotifierCard.tsx
│  ├ feedback/     Skeleton.tsx EmptyState.tsx ErrorState.tsx Toast.tsx
│  ├ overlays/     IncidentDrawer.tsx ConfirmDialog.tsx TokenShowOnceModal.tsx CommandPalette.tsx
│  ├ forms/        SchemaDrivenForm.tsx fieldMap.tsx jsonSchemaToZod.ts TagInput.tsx
│  └ wizard/       AddSourceWizard.tsx WizardStepper.tsx ConnectionTestLog.tsx DiscoveryList.tsx
├ features/
│  ├ datasets/  queries.ts  mutations.ts  selectors.ts  types.ts
│  ├ sources/   incidents/  notifiers/  statusPage/  settings/  auth/
├ lib/
│  ├ api.ts        typed fetch wrapper, error normalisation
│  ├ sse.ts        EventSource with backoff + cache patching
│  ├ format.ts     formatAge formatAgo formatCount formatBytes formatPct formatDelta formatTs
│  ├ state.ts      DatasetState, severity order, stateMeta (color/icon/label)
│  ├ clock.ts      the single 1s ticker store
│  └ motion.ts     duration/easing constants mirroring the tokens + useReducedMotion helpers
├ stores/
│  ├ ui.ts         theme, density, sidebar, palette, recents, hasStaggered  (persist middleware)
│  └ wizard.ts     add-source wizard state
└ styles/
   ├ tokens.css    §1.1
   └ app.css       §1.2
Zustand persists ui to localStorage under tw.ui (partialize: theme, density, sidebar, tz, reduceMotion, recents). Never write anything else to storage.

8.4 Build order & definition of done
Foundations — tokens, fonts, Frame/Corner, Button/Input/Tag/Switch/Segmented, format.ts, state.ts, clock.ts, theme + density providers. DoD: a /dev/tokens page renders every token in both themes; Frame has corner marks at every size; contrast checked with axe (0 violations).
Shell + routing — sidebar (expanded/collapsed), mobile top bar + bottom nav, condensing header strip, Toaster, CommandPalette shell. DoD: every route reachable; keyboard tab order sidebar → strip → content; ⌘K opens/closes; no layout shift on scroll condense.
Overview — DatasetCard, Sparkline, StatusBadge, FreshnessPill, FilterChipBar, grouping/sorting, skeletons, empty states, SSE patching, stagger. DoD: all 6 edge cases in §4/Screen 2 render correctly against fixtures; 200-card fixture scrolls at 60fps; stagger fires once per session.
Dataset detail — hero, tabs, both charts, schema diff, checks forms, incidents tab, settings tab. DoD: range switching does not re-draw charts; never-probed and paused datasets render their variants; deep links with ?tab=&range= restore exactly.
Incidents + drawer — grouping by day, row actions with optimistic mutations, drawer with evidence/timeline/raw, ?incident= deep link. DoD: ack/snooze/resolve revert correctly on a forced 500; focus returns to the trigger on drawer close; Escape works at every nesting level.
Sources + wizard — list, type picker, SchemaDrivenForm, ConnectionTestLog, DiscoveryList (virtualised), failure paths, typed delete. DoD: a 10k-table fixture searches in <100ms; mid-wizard failure offers Retry/Back/Save anyway; discarding prompts.
Notifiers + routing — cards with test states, matrix with inheritance + mobile accordion. DoD: inheritance is visible and resettable; 8-notifier fixture scrolls with a sticky scope column.
Status pages — editor with live preview, public page, badge SVG, embed. DoD: the public page renders with no auth token present, sets no cookies, makes no third-party requests, and scores ≥95 Lighthouse a11y; badges render correctly without JetBrains Mono installed.
Settings — all six sections, token create/show-once/revoke, egress explanation + confirm. DoD: the token is un-dismissable until copied; revoke requires the typed name; retention edits warn about deletion.
Onboarding cinematic — last, because it's the most motion-heavy and least reusable. DoD: the tide→sparkline morph runs at 60fps on a mid-range laptop; reduced-motion renders the static sparkline; the setup guard redirects correctly both ways.
Polish pass — reduced-motion audit, keyboard audit (every interactive element reachable and operable), axe clean on all 9 screens in both themes, 390/768/1024/1440/1920 screenshots reviewed, prefers-contrast: more sanity check.
Cross-cutting DoD for every screen: skeleton for every async region, empty state for every list, error state with a raw collapsible for every failure, both themes, both size classes, no console warnings, TypeScript strict with no any.

9. OPEN QUESTIONS (each with a default — never block on these)
Grid keyboard navigation. Arrow-key roving tabindex across dataset cards, or plain tab order? Default: plain tab order (simple, predictable); revisit if users complain at 50+ cards.
Paused datasets under "All". Always shown, or hidden past a threshold? Default: always shown, sorted last, at 70% opacity. The Paused chip filters to them.
Multi-user. The design assumes a single admin plus API tokens. Default: keep single-admin; if users land, the sidebar footer becomes an account menu and incidents gain an ackedBy avatar — no other screen changes.
Baseline warm-up messaging. Exact copy while a baseline is learning. Default: baseline learning · {n}h left as a caption on the chart and learning as a Tag on the Volume check.
Snooze granularity. Default: 1h / 4h / Until tomorrow 09:00 / Until resolved.
Incident auto-resolve. Does returning inside thresholds auto-resolve? Default: yes, with a timeline entry Back inside thresholds · auto-resolved and the toast copy Resolved — will reopen if it recurs.
Timezone default. Default: browser-local, with a Show times in UTC switch in Settings (many data engineers will want UTC — make the switch easy to find).
Status page auth. Any optional password-protected status pages? Default: public only; if needed, add a Visibility field (Public / Link with token) to the editor — no layout change.
Sidebar collapse persistence across devices. Default: per-browser localStorage only (no server-side UI prefs).
Chart library escape hatch. Recharts handles the band + bars fine, but the 90-day strip and the sparkline are hand-rolled SVG (faster, exact geometry). Default: keep those two hand-rolled; do not force them through Recharts.
Locale for month names in day headers. Default: navigator.language, with en-GB-style ordering (Mon 8 Sep) as the fallback format string.
Demo mode in production builds. The prototype's timed demo (payments fails at T+90s) exists to show the flows. Default: ship Try the demo dataset as a real seeded source (POST /api/demo/seed) with a DuckDB-backed fixture that genuinely goes stale — not a fake timer — and a Remove demo data button in Settings → Retention.
