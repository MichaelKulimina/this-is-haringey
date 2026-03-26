# This Is Haringey — Design Language System
**Version 1.0 · Source of Truth**

This document is the single source of truth for the visual and design language of This Is Haringey. All design decisions — across digital, print, and social — should refer to and be consistent with this system.

---

## 1. Brand Foundation

### Purpose
This Is Haringey is a general community directory for the London Borough of Haringey, covering local businesses, events, and neighbourhood discovery in one place.

### Creative Concept
**"Many voices, one place."**
Haringey is one of London's most genuinely diverse boroughs. The brand holds all its voices together without flattening them — consistent in structure, alive with variety.

### Brand Personality
- **Warm** — approachable and community-led, never corporate
- **Enthusiastic** — an excited newcomer sharing discoveries, not a detached authority
- **Modern** — clean and purposeful, never cluttered or nostalgic
- **Grounded** — rooted in the real borough, its streets, people, and culture

### Brand Voice (in brief)
Write as if you're telling a friend about a great discovery. Direct, warm, specific. Use the borough's place names — N8, N17, N22. Celebrate the ordinary as well as the extraordinary.

---

## 2. Logo

### Primary Logotype — Option A (Punctuation)

The primary logo is a stacked typographic lockup using Inter ExtraBold. The full stop is a deliberate design choice — a declaration that turns the brand name into a statement of confidence and pride.

```
THIS IS           ← Inter SemiBold, 11px, tracking +0.20em, uppercase, Terracotta
Haringey.         ← Inter ExtraBold 800, 40px, tracking −0.04em, Ink
```

The full stop at the end is set in **Terracotta** (#E05A2B). It is the only coloured element in the primary logotype.

### Logo Variants

| Variant | Use case |
|---|---|
| **Stacked (primary)** | Hero contexts, marketing, print, splash screens |
| **Inline** | Navbar, app headers, compact digital contexts |
| **Monogram — TIH** | Favicon, app icon, avatar, social profile image |

### Monogram
The letters **TIH** set in Inter ExtraBold, white, on a solid Terracotta (#E05A2B) square with 6px border radius. Used wherever the full logotype cannot fit.

### Clear Space
Maintain a minimum clear space equal to the cap-height of the "H" in "Haringey" on all sides of the logo.

### Minimum Size
- Stacked: 120px wide minimum on screen; 30mm in print
- Inline: 80px wide minimum
- Monogram: 24px × 24px minimum

### What to avoid
- Do not stretch, skew, or recolour the logotype
- Do not use the logotype reversed on non-approved backgrounds
- Do not use a drop shadow or any decorative effect
- Do not retype the logo in a different typeface
- Do not place the logotype on a busy photographic background without a clear contrast layer

### Approved backgrounds for the primary logo
- White (#FFFFFF) ✓
- Cream (#F7F5F0) ✓
- Ink (#1A1A1A) — use white logotype variant ✓
- Terracotta (#E05A2B) — use white logotype variant ✓

---

## 3. Colour Palette

### Primary Colours

| Name | Hex | RGB | Role |
|---|---|---|---|
| **Ink** | `#1A1A1A` | 26, 26, 26 | Headlines, body text, primary UI |
| **Terracotta** | `#E05A2B` | 224, 90, 43 | Primary accent, CTAs, logo mark |
| **Cream** | `#F7F5F0` | 247, 245, 240 | Page backgrounds, card surfaces |
| **White** | `#FFFFFF` | 255, 255, 255 | Canvas, input fields, overlay surfaces |
| **Sage** | `#6B7C6E` | 107, 124, 110 | Secondary accent, tag outlines, supporting UI |

### Terracotta Tint Scale

| Stop | Hex | Use |
|---|---|---|
| 10% | `#FDF5F1` | Tag backgrounds, hover states, alert fills |
| 20% | `#F9DDD0` | Subtle highlights |
| 40% | `#F2B89A` | Illustrative accents |
| 70% | `#E8845A` | Secondary buttons, borders |
| 100% | `#E05A2B` | Primary accent — full strength |
| Shade 1 | `#B84520` | Hover state on primary buttons |
| Shade 2 | `#7A2D14` | Active/pressed states |

### Sage Tint Scale

| Stop | Hex | Use |
|---|---|---|
| 10% | `#EEF3EF` | Green Spaces tag background |
| 50% | `#A8B8AA` | Muted secondary text |
| 100% | `#6B7C6E` | Secondary accent — full strength |

### Colour in Use — Category Tags

```
Food & Drink     → bg: #FDF5F1  text: #B84520
Green Spaces     → bg: #EEF3EF  text: #3D5240
Events           → bg: #F0EDE6  text: #555555
Arts & Culture   → bg: #F0EDE6  text: #555555
New              → bg: #1A1A1A  text: #FFFFFF
```

### Colour in Use — Buttons

```
Primary CTA      → bg: #E05A2B  text: #FFFFFF  hover bg: #B84520
Secondary CTA    → bg: transparent  text: #1A1A1A  border: 0.5px #1A1A1A
Ghost            → bg: transparent  text: #E05A2B  border: none
```

### Accessibility
- Terracotta (#E05A2B) on White: contrast ratio **3.5:1** — use for large text and UI only (≥18px or bold ≥14px)
- Ink (#1A1A1A) on White: contrast ratio **18.1:1** — AA and AAA compliant at all sizes
- White on Terracotta: contrast ratio **3.5:1** — acceptable for large/bold text; use Shade 1 for body text contexts
- Always verify contrast with a tool such as [WebAIM Contrast Checker](https://webaim.org/resources/contrastchecker/) before shipping

---

## 4. Typography

### Typeface — Inter (Variable)

**Inter** is the sole typeface of This Is Haringey. All hierarchy, tone, and structure is achieved through weight and letter-spacing variation — not font-family switching.

Load via Google Fonts:
```html
<link rel="preconnect" href="https://fonts.googleapis.com">
<link href="https://fonts.googleapis.com/css2?family=Inter:ital,opsz,wght@0,14..32,100..900;1,14..32,100..900&display=swap" rel="stylesheet">
```

Or via CSS variable (where available):
```css
font-family: 'Inter', Arial, sans-serif;
```

### Type Scale

| Role | Size | Weight | Tracking | Line Height | Usage |
|---|---|---|---|---|---|
| **Display** | 40px | 800 ExtraBold | −0.04em | 0.95 | Logo, hero headlines |
| **H1** | 32px | 800 ExtraBold | −0.04em | 1.05 | Page titles |
| **H2** | 24px | 700 Bold | −0.03em | 1.1 | Section headings |
| **H3** | 20px | 700 Bold | −0.02em | 1.2 | Card titles, sub-sections |
| **H4** | 16px | 600 SemiBold | −0.01em | 1.3 | UI headings |
| **Body Large** | 17px | 400 Regular | 0 | 1.7 | Feature articles, intro text |
| **Body** | 15px | 400 Regular | 0 | 1.65 | Standard content |
| **Body Small** | 13px | 400 Regular | 0 | 1.6 | Supporting copy |
| **Label** | 11px | 600 SemiBold | +0.10em | 1.4 | Tags, eyebrows — always uppercase |
| **Caption** | 11px | 400 Regular | +0.03em | 1.5 | Timestamps, meta, credits |
| **Mono** | 13px | 400 Regular | 0 | 1.6 | Postcodes, codes, addresses |

### Type Rules

**1. Tight tracking on display sizes**
All text at 20px and above must use negative letter-spacing. The larger the text, the tighter the tracking. This gives Inter its editorial authority.

**2. Wide tracking on labels**
Category labels, eyebrows, and status badges use Inter SemiBold in uppercase with +0.08em to +0.14em tracking. The contrast between tight headings and wide labels creates a clear, readable hierarchy.

**3. Weight discipline**
```
400 → body copy, captions
500 → UI labels (sparingly — prefer 400 or 600)
600 → sub-headings, emphasis, tags
700 → section headings
800 → display, H1, logo — never in body copy
```

**4. Line height**
Body text must never drop below 1.6 line-height. Content needs breathing room. Headings use tighter line heights (1.0–1.2) to hold multi-line headlines together visually.

**5. Italic**
Inter Italic is used exclusively for the logo prefix in the Option D variant. In UI and content contexts, avoid italic — the weight system provides sufficient emphasis.

### Typographic Examples

```css
/* Page title */
font-family: 'Inter', sans-serif;
font-size: 32px;
font-weight: 800;
letter-spacing: -0.04em;
line-height: 1.05;
color: #1A1A1A;

/* Section heading */
font-size: 24px;
font-weight: 700;
letter-spacing: -0.03em;
line-height: 1.1;

/* Body copy */
font-size: 15px;
font-weight: 400;
letter-spacing: 0;
line-height: 1.65;
color: #444444;

/* Category label */
font-size: 11px;
font-weight: 600;
letter-spacing: 0.10em;
text-transform: uppercase;
color: #B84520;
```

---

## 5. Spacing & Layout

### Base Unit
The spacing system uses an **8px base unit**. All spacing values should be multiples of 8 (or 4 for micro-spacing).

| Token | Value | Use |
|---|---|---|
| `space-1` | 4px | Micro — between label and icon |
| `space-2` | 8px | Tight — internal component gaps |
| `space-3` | 12px | Default — between related elements |
| `space-4` | 16px | Medium — card padding, section gaps |
| `space-5` | 24px | Large — between components |
| `space-6` | 32px | XL — section separation |
| `space-7` | 48px | 2XL — major layout sections |
| `space-8` | 64px | 3XL — hero sections |

### Grid
- **Mobile**: 1 column, 16px gutters, 16px margins
- **Tablet**: 2 columns, 20px gutters, 24px margins
- **Desktop**: 12 columns, 24px gutters, 32px+ margins
- **Max content width**: 1200px, centred

### Border Radius

| Token | Value | Use |
|---|---|---|
| `radius-sm` | 4px | Tags, pills, small badges |
| `radius-md` | 8px | Buttons, inputs, small cards |
| `radius-lg` | 12px | Cards, panels |
| `radius-xl` | 16px | Feature cards, hero elements |
| `radius-full` | 9999px | Avatar circles, toggle tracks |

---

## 6. Components

### Cards — Listing Card

```
Structure:
┌──────────────────────────────┐
│ [Image area — 16:9 or 4:3]   │
├──────────────────────────────┤
│ CATEGORY TAG    · Postcode   │  ← Label, 11px, uppercase
│ Business Name               │  ← H3, 20px, 700, −0.02em
│ Short description…          │  ← Body Small, 13px, 400
│ [CTA →]                     │  ← Ghost button
└──────────────────────────────┘
```

- Background: `#FFFFFF`
- Border: `0.5px solid #E5E2DB`
- Border radius: `radius-lg` (12px)
- Padding: `space-4` (16px)
- Hover: `box-shadow: 0 4px 16px rgba(0,0,0,0.07)`; lift 2px (`translateY(-2px)`)

### Buttons

**Primary**
```css
background: #E05A2B;
color: #FFFFFF;
font-family: 'Inter', sans-serif;
font-size: 14px;
font-weight: 600;
letter-spacing: -0.01em;
padding: 10px 20px;
border-radius: 8px;
border: none;
cursor: pointer;
transition: background 0.15s;

/* hover */
background: #B84520;
```

**Secondary (outline)**
```css
background: transparent;
color: #1A1A1A;
border: 0.5px solid #1A1A1A;
font-size: 14px;
font-weight: 500;
padding: 10px 20px;
border-radius: 8px;

/* hover */
background: #F7F5F0;
```

### Tags / Badges
```css
display: inline-block;
font-size: 11px;
font-weight: 600;
letter-spacing: 0.08em;
text-transform: uppercase;
padding: 4px 10px;
border-radius: 20px;

/* e.g. Food & Drink */
background: #FDF5F1;
color: #B84520;
```

### Navigation (top bar)
- Background: `#FFFFFF` with `border-bottom: 0.5px solid #E5E2DB`
- Logo: inline variant — "This Is | Haringey"
- Nav links: Inter 14px, weight 500, colour #555, hover colour #1A1A1A
- CTA button: Primary button, right-aligned

---

## 7. Imagery & Iconography

### Photography
Photography is the primary carrier of the borough's diversity and warmth. Images should feel:
- **Candid and real** — not stock-photo perfect
- **Community-focused** — people, places, food, activity
- **Well-lit and warm** — avoid cold, blue-toned, or overly dark images
- **Specific to Haringey** — the more recognisably local, the better

Avoid: generic city stock photography, tourism-board compositions, images without people or context.

### Aspect Ratios
- Hero / banner: **16:9**
- Listing card thumbnail: **4:3**
- Square tiles / grid: **1:1**
- Avatar / profile: **1:1** (circular crop)

### Iconography
Use a consistent, lightweight icon set. Recommended: **Lucide Icons** or **Phosphor Icons** — both share the clean, 1.5px-stroke, rounded-corner aesthetic that complements Inter.

- Stroke width: 1.5px
- Size: 16px (inline), 20px (UI actions), 24px (features)
- Colour: always inherit from surrounding text or explicitly set — never hardcoded standalone

---

## 8. Motion & Interaction

### Principles
- **Purposeful** — animate only to aid understanding or feedback, not for decoration
- **Fast** — most transitions 150–200ms; nothing over 400ms in UI
- **Subtle** — easing should feel natural, not springy or theatrical

### Standard Transitions
```css
/* Hover state (buttons, cards) */
transition: all 0.15s ease;

/* Page / panel transitions */
transition: opacity 0.2s ease, transform 0.2s ease;

/* Card lift on hover */
transform: translateY(-2px);
box-shadow: 0 4px 16px rgba(0,0,0,0.07);
transition: transform 0.15s ease, box-shadow 0.15s ease;
```

### Reduced Motion
Always respect `prefers-reduced-motion`:
```css
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    transition-duration: 0.01ms !important;
  }
}
```

---

## 9. Tone of Voice

| Situation | Do | Don't |
|---|---|---|
| Listing headline | "The best jerk chicken in N17" | "Authentic Afro-Caribbean dining experience" |
| CTA | "Explore Haringey" / "Find it" | "Click here" / "Learn more" |
| Category label | "Food & Drink" | "Catering & Hospitality" |
| Empty state | "Nothing here yet — be the first to add one" | "No results found" |
| Error | "Something went wrong. Try again?" | "Error 404: Resource not found" |

### Key principles
1. **Specific over generic** — use postcodes, neighbourhood names, real references
2. **Active over passive** — "Explore" not "Browse available listings"
3. **Warm not saccharine** — friendly without being gushing
4. **Borough-proud** — Haringey is the star, not a backdrop

---

## 10. Do / Don't Summary

| ✅ Do | ❌ Don't |
|---|---|
| Use Inter at all times | Mix in other typefaces |
| Use Terracotta sparingly as an accent | Fill entire sections with Terracotta |
| Let white space breathe | Crowd elements together |
| Use tight tracking on large headings | Use default/loose tracking on headlines |
| Reference real neighbourhood names | Write generic "London" copy |
| Use the Cream background for warmth | Use pure white everywhere |
| Show real community photography | Use generic stock images |
| Keep the full stop in the primary logo | Remove the punctuation mark |

---

*This Is Haringey DLS — Version 1.0*
*Maintained by the This Is Haringey team. Update this document when design decisions change.*
