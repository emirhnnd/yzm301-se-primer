---
name: Clinical Diagnostic Paper
colors:
  surface: '#f4f7f6'
  surface-dim: '#cddddb'
  surface-bright: '#f4f7f6'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#e7f7f5'
  surface-container: '#e1f1ef'
  surface-container-high: '#dbebe9'
  surface-container-highest: '#d6e6e4'
  on-surface: '#101e1d'
  on-surface-variant: '#3e4948'
  inverse-surface: '#253332'
  inverse-on-surface: '#e4f4f2'
  outline: '#6e7978'
  outline-variant: '#bec9c7'
  surface-tint: '#006a65'
  primary: '#005450'
  on-primary: '#ffffff'
  primary-container: '#0b6e69'
  on-primary-container: '#9cede6'
  inverse-primary: '#84d5ce'
  secondary: '#5256a7'
  on-secondary: '#ffffff'
  secondary-container: '#a2a6fe'
  on-secondary-container: '#343888'
  tertiary: '#743a1f'
  on-tertiary: '#ffffff'
  tertiary-container: '#915134'
  on-tertiary-container: '#ffd5c5'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#a0f1ea'
  primary-fixed-dim: '#84d5ce'
  on-primary-fixed: '#00201e'
  on-primary-fixed-variant: '#00504c'
  secondary-fixed: '#e1e0ff'
  secondary-fixed-dim: '#bfc1ff'
  on-secondary-fixed: '#080962'
  on-secondary-fixed-variant: '#3a3e8e'
  tertiary-fixed: '#ffdbcd'
  tertiary-fixed-dim: '#ffb596'
  on-tertiary-fixed: '#360f00'
  on-tertiary-fixed-variant: '#70371c'
  background: '#f4f7f6'
  on-background: '#101e1d'
  surface-variant: '#d6e6e4'
typography:
  headline-lg:
    fontFamily: IBM Plex Sans
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
    letterSpacing: -0.01em
  headline-md:
    fontFamily: IBM Plex Sans
    fontSize: 20px
    fontWeight: '600'
    lineHeight: 28px
    letterSpacing: -0.005em
  headline-sm:
    fontFamily: IBM Plex Sans
    fontSize: 18px
    fontWeight: '600'
    lineHeight: 24px
  body-lg:
    fontFamily: IBM Plex Sans
    fontSize: 17px
    fontWeight: '400'
    lineHeight: 26px
  body-md:
    fontFamily: IBM Plex Sans
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  body-md-medium:
    fontFamily: IBM Plex Sans
    fontSize: 16px
    fontWeight: '500'
    lineHeight: 24px
  label-md:
    fontFamily: IBM Plex Sans
    fontSize: 14px
    fontWeight: '500'
    lineHeight: 20px
    letterSpacing: 0.01em
  label-sm:
    fontFamily: IBM Plex Sans
    fontSize: 13px
    fontWeight: '600'
    lineHeight: 18px
    letterSpacing: 0.04em
  mono-metric:
    fontFamily: IBM Plex Mono
    fontSize: 18px
    fontWeight: '600'
    lineHeight: 24px
  mono-code:
    fontFamily: IBM Plex Mono
    fontSize: 14px
    fontWeight: '500'
    lineHeight: 20px
  mono-badge:
    fontFamily: IBM Plex Mono
    fontSize: 12px
    fontWeight: '700'
    lineHeight: 14px
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  gutter: 0.75rem
  margin: 1rem
  space-xs: 0.25rem
  space-sm: 0.5rem
  space-md: 0.75rem
  space-lg: 1rem
  space-xl: 1.5rem
---

## Brand & Style

This design system models the quiet precision, physical calm, and stark legibility of an authentic clinical laboratory report document. Geared toward software engineering students debugging high-stakes systems in an educational simulation, it avoids noisy tech tropes, heavy dark consoles, and superficial gamification. Instead, it immerses users in an accountable medical software environment where calm focus, high legibility, and architectural clarity are imperative.

The visual style blends institutional modernism with paper-like structural clarity. The interface relies entirely on razor-sharp hairline borders, flat container tones, and tabular data density rather than ambient depth or drop shadows. The emotional impact is clinical, cerebral, and methodical—inviting learners to evaluate incident telemetry, lab values, and system configurations with diagnostic rigor.

## Colors

The palette reproduces an authentic sterile report: cool hospital parchment `#F4F7F6` forms the foundational canvas, while pure `#FFFFFF` serves as the primary card surface. Visual structure relies on a precise border tone `#C9D6D3`, completely omitting decorative box-shadows.

Semantic lab values adhere strictly to hospital diagnostic conventions:
- **Primary / Action (`#0B6E69`):** Clinical deep teal reserved for critical user actions, confirmed selections, and focal navigational items.
- **Card Selection Fill (`#D7EEEB`):** Soft teal tint with a 1.5px `#0B6E69` active border for student scenario picks.
- **Normal Flag `[N]`:** `#1B6B3A` text over `#DDF3E4` container.
- **Elevated/Warning Flag `[H]`:** `#8A4B00` text over `#FFF1D6` container.
- **Critical/Low Flag `[L]`:** `#B3261E` text over `#FDE7E5` container.
- **AI Tutor / Mentor (`#3B3F8F` on `#E8E9FA`):** Dedicated periwinkle-slate profile paired with an institutional shield marker for educational interventions.
- **Body & Secondary Copy:** Dense charcoal `#12201F` ensures maximum contrast; auxiliary metadata uses muted slate-sage `#4A5F5C`. Dark navy fills and bright orange accents are strictly excluded.

## Typography

Typography prioritizes legibility in high-stress simulation contexts. To prevent cognitive fatigue on mobile displays, standard running Turkish text never drops below 16px.

- **Primary Text (`IBM Plex Sans`):** Delivers clean humanist-grotesque authority for narrative scenario cards, student choices, and tutor guidance.
- **Monospaced Data (`IBM Plex Mono`):** Applied systematically to telemetry parameters, timestamps, reference ranges, latency stats, error trace dumps, and laboratory test status identifiers `[N]`, `[H]`, and `[L]`.
- **Turkish Diacritics Care:** All line-height ratios preserve comfortable breathing space around extended ascenders/descenders (ç, ğ, ı, İ, ö, ş, ü).

## Layout & Spacing

Designed primarily for mobile portrait viewports (baseline 360x800), the layout adopts a disciplined single-column report sheet structure. Margins sit comfortably at 16px (`margin: 1rem`) to maximize screen estate while preserving clean gutters.

The vertical rhythm utilizes a base 4px/8px incremental grid. Interactive containers, decision buttons, and form rows maintain a strict minimum bounding box of 48x48px for precise touch execution during timed incident events. Section separation follows logical clinical document divider rules rather than arbitrary white space gaps.

## Elevation & Depth

This system avoids floating UI tropes. All surface elevations are zero-plane:
- **`box-shadow: none`** is strictly enforced on cards, action buttons, overlays, and dialogs.
- Depth and container grouping are achieved entirely through 1px structural outlines `#C9D6D3` set against background `#F4F7F6`.
- State differentiation relies on surface color fills (e.g., active cards shifting to `#D7EEEB`) and solid border reinforcements rather than cast shadows.
- Modal or tutor bottom-sheets sit flat, separated from the canvas via a subtle solid barrier hairline `#C9D6D3`.

## Shapes

The geometric framework balances technical rigor with handheld comfort:
- Standard surface cards and interactive modules feature a consistent `12px` border radius (`roundedness: 2`).
- Clinical parameter badges `[N]`, `[H]`, and `[L]` utilize complete pill shapes (`9999px`) to immediately signal standardized reference flags.
- Action buttons share the cohesive `12px` radius to reflect the primary card container vocabulary.

## Components

### Action Buttons
- **Primary:** Solid `#0B6E69` fill with crisp `#FFFFFF` text. Minimum height 48px, horizontal padding 20px, radius 12px. No shadow. Active state darkens to `#085450`.
- **Secondary / Ghost:** `#FFFFFF` background with 1px border `#0B6E69` and text `#0B6E69`. Minimum height 48px.

### Laboratory Decision Cards
- **Base State:** Pure `#FFFFFF` surface, 1px solid `#C9D6D3` border, radius 12px, padding 16px. Box-shadow is none.
- **Selected State:** Background shifts to `#D7EEEB` with an amplified border of 1.5px `#0B6E69`.

### Diagnostic Parameter Badges
- Pill-shaped tags (`border-radius: 9999px`) displaying monospaced identifiers:
  - **Normal `[N]`:** `#DDF3E4` container, `#1B6B3A` text.
  - **High `[H]`:** `#FFF1D6` container, `#8A4B00` text.
  - **Low/Critical `[L]`:** `#FDE7E5` container, `#B3261E` text.

### AI Tutor Callout Bubble
- `#E8E9FA` background surface with a 1px solid `#CBD0F2` frame.
- Text rendered in `#3B3F8F` (`IBM Plex Sans`, 16px).
- Prefixed with an institutional shield icon marker to signify pedagogical guidance and architectural hints.

### Telemetry & Specimen Tables
- Edge-to-edge row layouts inside cards with light hairline dividers (`1px solid #E1EBE8`).
- Metric keys set in `#4A5F5C`, values rendered via `IBM Plex Mono` in `#12201F`.

## Interaction States

| State | Behavior |
|---|---|
| Timer <= 15 s | Progress bar turns amber (`#8A4B00`), text "15 sn" appears |
| Timer expired | Result panel shows "Süre doldu"; option B (fast/risky) is applied |
| Tutor typing | Three-dot indicator, announced via `aria-live="polite"` |
| Network/API error | Tutor bubble: "Şu an soru soramıyorum, bir daha dene." Game continues |
| Continue button | Disabled until a choice is made; enabled after the result panel opens |
| Reduced motion | `prefers-reduced-motion` turns animations off |

Motion is 150-200 ms, opacity and slide only.

## Accessibility

- Text contrast >= 4.5:1, control borders >= 3:1 (WCAG 2.1 AA). Meaning is never carried by color alone: every flag has an icon or word next to it (`[N]` Normal, `[H]` Yüksek, `[L]` Düşük).
- Smallest text is 13 px. Body never below 16 px. Touch targets >= 48 px.
- Focus ring: 3 px `#0B6E69` on every interactive element. Options use `radiogroup`; when the result panel opens, focus moves to its "Ne oldu" heading.
- Do not block zoom (no `user-scalable=no`). No horizontal scroll at 360 px.

## Copy Tone

Short sentences, no commands, no blame: "Sızıntı sürüyor", never "Yanlış yaptın". The AI tutor only asks questions and never states or implies the correct option. Technical terms are explained in parentheses on first use: "özellik bayrağı (feature flag)".
