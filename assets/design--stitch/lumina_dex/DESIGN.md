---
name: Lumina Dex
colors:
  surface: '#111319'
  surface-dim: '#111319'
  surface-bright: '#373940'
  surface-container-lowest: '#0c0e14'
  surface-container-low: '#191b22'
  surface-container: '#1d1f26'
  surface-container-high: '#282a30'
  surface-container-highest: '#33343b'
  on-surface: '#e2e2ea'
  on-surface-variant: '#e1bfba'
  inverse-surface: '#e2e2ea'
  inverse-on-surface: '#2e3037'
  outline: '#a88a85'
  outline-variant: '#59413e'
  surface-tint: '#ffb4a9'
  primary: '#ffb4a9'
  on-primary: '#690002'
  primary-container: '#fa6555'
  on-primary-container: '#650002'
  inverse-primary: '#af2f25'
  secondary: '#9acbff'
  on-secondary: '#003355'
  secondary-container: '#0076be'
  on-secondary-container: '#f6f8ff'
  tertiary: '#57dcbe'
  on-tertiary: '#00382d'
  tertiary-container: '#00a98e'
  on-tertiary-container: '#00352b'
  error: '#ffb4ab'
  on-error: '#690005'
  error-container: '#93000a'
  on-error-container: '#ffdad6'
  primary-fixed: '#ffdad5'
  primary-fixed-dim: '#ffb4a9'
  on-primary-fixed: '#410001'
  on-primary-fixed-variant: '#8d1510'
  secondary-fixed: '#cfe4ff'
  secondary-fixed-dim: '#9acbff'
  on-secondary-fixed: '#001d34'
  on-secondary-fixed-variant: '#004a79'
  tertiary-fixed: '#77f8da'
  tertiary-fixed-dim: '#57dcbe'
  on-tertiary-fixed: '#00201a'
  on-tertiary-fixed-variant: '#005143'
  background: '#111319'
  on-background: '#e2e2ea'
  surface-variant: '#33343b'
typography:
  display-hero:
    fontFamily: Plus Jakarta Sans
    fontSize: 3.5rem
    fontWeight: '800'
    lineHeight: '1.1'
    letterSpacing: -0.03em
  display-hero-mobile:
    fontFamily: Plus Jakarta Sans
    fontSize: 2.25rem
    fontWeight: '800'
    lineHeight: '1.15'
    letterSpacing: -0.025em
  headline-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 2.25rem
    fontWeight: '700'
    lineHeight: '1.2'
    letterSpacing: -0.02em
  headline-lg-mobile:
    fontFamily: Plus Jakarta Sans
    fontSize: 1.75rem
    fontWeight: '700'
    lineHeight: '1.25'
    letterSpacing: -0.015em
  headline-md:
    fontFamily: Plus Jakarta Sans
    fontSize: 1.5rem
    fontWeight: '700'
    lineHeight: '1.3'
    letterSpacing: -0.015em
  headline-sm:
    fontFamily: Plus Jakarta Sans
    fontSize: 1.125rem
    fontWeight: '600'
    lineHeight: '1.4'
    letterSpacing: -0.01em
  body-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 1rem
    fontWeight: '400'
    lineHeight: '1.6'
    letterSpacing: '0'
  body-md:
    fontFamily: Plus Jakarta Sans
    fontSize: 0.875rem
    fontWeight: '400'
    lineHeight: '1.5'
    letterSpacing: '0'
  body-sm:
    fontFamily: Plus Jakarta Sans
    fontSize: 0.75rem
    fontWeight: '400'
    lineHeight: '1.4'
    letterSpacing: 0.01em
  label-entry-id:
    fontFamily: Plus Jakarta Sans
    fontSize: 0.875rem
    fontWeight: '800'
    lineHeight: '1'
    letterSpacing: 0.08em
  label-badge:
    fontFamily: Plus Jakarta Sans
    fontSize: 0.6875rem
    fontWeight: '700'
    lineHeight: '1'
    letterSpacing: 0.04em
  stat-value:
    fontFamily: Plus Jakarta Sans
    fontSize: 0.875rem
    fontWeight: '700'
    lineHeight: '1'
    letterSpacing: -0.01em
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  gutter: 1.25rem
  gutter-desktop: 1.75rem
  margin: 1rem
  margin-tablet: 2rem
  margin-desktop: 3rem
  space-xxs: 0.25rem
  space-xs: 0.5rem
  space-sm: 0.75rem
  space-md: 1rem
  space-lg: 1.5rem
  space-xl: 2rem
  space-2xl: 3rem
  space-3xl: 4rem
---

## Brand & Style

This design system establishes a high-fidelity digital encyclopedia aesthetic that balances the technical utility of an advanced catalog with the energetic, joyful nostalgia of monster collection. 

### Design Philosophy & Aesthetic Movement
The interface blends **Neo-Digital Tactility** with **Hyper-Clean Minimalism**:
- **Canvas Restraint:** Base framing remains ultra-clean, monochromatic, and balanced to allow full-saturation creature renderings and authentic elemental type palettes to dominate visual weight.
- **Organic Geometry:** Uses continuous curvature squircles (`rounded-2xl` through `rounded-3xl`) to evoke modern handheld consumer hardware.
- **Depth through Light:** Employs low-opacity ambient color washes and translucent frosted materials (glassmorphism) rather than rigid opaque panels, making elemental attributes bleed softly into card backdrops.
- **Data Clarity:** Converts dense competitive statistics and elemental tables into immediate, high-readability visual meters, crisp monospace numbering, and tactile status pills.

## Colors

The palette system is anchored by deep chromatic neutrals engineered to eliminate visual glare while making creature artwork and elemental states intensely vibrant.

### Core Canvas & Neutrals
- **Background Base (`#0B0D12`):** Obsidian void serving as the foundation canvas.
- **Surface Elevation 1 (`#12141A`):** Deep charcoal canvas for main collection listings and layout shells.
- **Surface Elevation 2 (`#1A1D26`):** Secondary container surface for individual monster cards and standard panels.
- **Surface Elevation 3 (`#232733`):** Modal surfaces, flyouts, and interactive elevated modules.
- **Border Subdued (`rgba(255, 255, 255, 0.08)`):** Ghost borders for container boundary definition.
- **Text High-Contrast (`#F9FAFB`):** Primary display text, stat scores, and titles.
- **Text Muted (`#94A3B8`):** IDs, subheaders, category labels, and physical metrics.

### Canonical Elemental Tokens
Use these dedicated semantic tokens strictly for type classification, ambient card washes, active pills, and meter fills:
- **Fire (`#FA6555`):** Incandescent coral-red.
- **Water (`#58ABF6`):** Cerulean sky-blue.
- **Grass (`#48CFB2`):** Mint emerald-teal.
- **Electric (`#FFCE4B`):** Warm radiant amber.
- **Poison (`#9F5BBA`):** Royal orchid-violet.
- **Psychic (`#FF6C92`):** Bubblegum magenta.
- **Bug (`#A8B820`):** Chartreuse olive.
- **Flying (`#A890F0`):** Soft lavender periwinkle.
- **Normal (`#A8A878`):** Warm sandstone grey.
- **Ground (`#E0C068`):** Warm ochre earth.
- **Fairy (`#F4A6C7`):** Petal blush pink.
- **Fighting (`#C03028`):** Crimson rust.
- **Rock (`#B8A038`):** Muted brass gold.
- **Ghost (`#705898`):** Deep spectral indigo.
- **Ice (`#98D8D8`):** Glacial cyan tint.
- **Dragon (`#7038F8`):** Vivid hyper-violet.
- **Steel (`#B8B8D0`):** Polished cobalt-silver.
- **Dark (`#705848`):** Deep obsidian umber.

### Ambient Wash Application Rules
Cards representing an entity must apply their primary type color as an ambient radial surface tint: `radial-gradient(circle at 85% 15%, ${typeColor}26 0%, transparent 70%)`.

## Typography

The typographic hierarchy relies on Plus Jakarta Sans to combine geometric clarity with contemporary friendly terminals.

### Implementation Rules
- **Entry Numerical Tracking:** All Pokedex indices (e.g., `#0006`, `#0150`) must render with `label-entry-id`, tabular figures (`font-variant-numeric: tabular-nums`), and an opacity of 50% relative to adjacent headline text.
- **Type Badges:** Elemental names inside pill components always render uppercase using `label-badge`.
- **Stat Label Alignment:** Stat keys (HP, ATK, DEF, SPA, SPD, SPE) render with `label-badge` in muted slate (`#94A3B8`) pinned at a fixed width of `3rem` to maintain strict baseline alignment across meters.

## Layout & Spacing

The layout is built upon an adaptive 12-column fluid grid system engineered for smooth transition between high-density collection views and focused detail presentations.

### Grid Anatomy & Breakpoints
- **Mobile (< 640px):** 4-column layout, `margin` (1rem / 16px), `gutter` (1.25rem / 20px). Grid cards span 2 columns (2-across) or 4 columns (hero/list mode).
- **Tablet (640px – 1024px):** 8-column layout, `margin-tablet` (2rem / 32px), `gutter` (1.25rem / 20px). Grid items span 4 columns (2-across) or 8 columns (detail panes).
- **Desktop (> 1024px):** 12-column layout, max width `1440px` centered, `margin-desktop` (3rem / 48px), `gutter-desktop` (1.75rem / 28px). Grid items span 3 columns (4-across) or 4 columns (3-across). Detail views operate as an asymmetrical 5-column (visual display) + 7-column (stats, moves, evolution) split.

### Vertical Rhythm
Section blocks strictly follow `space-2xl` spacing on mobile and `space-3xl` spacing on desktop. Subordinate metadata clusters stick to `space-sm` gaps to preserve semantic grouping.

## Elevation & Depth

Visual hierarchy uses layered luminous depth, replacing stark Drop Shadows with subtle colored ambient glows and back-surface diffusion.

### Elevation Levels
- **Level 0 (Flat / Floor):** `background: #0B0D12` with no shadow. Used for the root application shell.
- **Level 1 (Card Canvas):** `background: rgba(26, 29, 38, 0.7)`, backdrop blur `16px`, ghost border `1px solid rgba(255, 255, 255, 0.06)`, shadow: `0 4px 20px -2px rgba(0, 0, 0, 0.4)`.
- **Level 2 (Hover / Active Cards):** `background: rgba(35, 39, 51, 0.85)`, backdrop blur `20px`, ghost border `1px solid rgba(255, 255, 255, 0.14)`. Adds an ambient glow tinted to the primary type color: `0 12px 32px -4px ${typeColor}33, 0 4px 12px -2px rgba(0, 0, 0, 0.3)`. Transform translateY: `-4px`.
- **Level 3 (Modals / Floating Bottom Sheets):** `background: rgba(18, 20, 26, 0.92)`, backdrop blur `24px`, border `1px solid rgba(255, 255, 255, 0.12)`, shadow: `0 24px 48px -8px rgba(0, 0, 0, 0.6)`.

### Glassmorphism Overlays
Floating UI panels, filter dock bars, and back-buttons must use `backdrop-filter: blur(12px)` paired with `background: rgba(18, 20, 26, 0.75)` and `border: 1px solid rgba(255, 255, 255, 0.08)` to maintain legibility over moving or scrolling illustrations.

## Shapes

The interface embraces modern ergonomic squircle geometry that feels organic, approachable, and hardware-inspired.

### Geometry Specifications
- **Cards & Primary Modules:** `rounded-2xl` (1rem / 16px) on mobile cards; scaling to `rounded-3xl` (1.5rem / 24px) for hero visual containers, detail modal wrappers, and interactive display cards.
- **Type Badges & Status Chips:** Fully pill-shaped (`rounded-full` / `9999px`) to create an immediate structural contrast against rectangular squircle cards.
- **Stat Bars & Sliders:** Full radius pill tracks (`rounded-full`) preventing angular edges from distracting the eye during comparative stat evaluation.
- **Buttons & Search Inputs:** `rounded-xl` (0.75rem / 12px) for form inputs; `rounded-full` for pure action buttons (filters, back navigation, audio cry player).

## Components

### 1. Creature Grid Card
- **Structure:** Vertical flex container. Rounded via `rounded-2xl` or `rounded-3xl`. Overflow hidden.
- **Background:** Base `#1A1D26` overlaid with top-right radial gradient: `radial-gradient(circle at 90% 10%, ${primaryTypeColor}2B 0%, transparent 60%)`.
- **Border:** `1px solid rgba(255, 255, 255, 0.06)`.
- **Contents:**
  - Header row: Creature Name (`headline-sm`) positioned left; Pokedex ID (`label-entry-id`) positioned right in muted slate.
  - Body row: Horizontal pill tags aligned left; Artwork floating right/center.
  - Artwork: High-res render positioned with absolute or relative overlap, slightly breaking boundaries on hover (`scale(1.06)` transition `300ms cubic-bezier(0.34, 1.56, 0.64, 1)`).

### 2. Elemental Type Badges (Pills)
- **Geometry:** Height `24px`, padding `0 10px`, `rounded-full`.
- **Palette Logic:** Fill is saturated `${typeColor}22` (14% alpha tint). Text is high-contrast `${typeColor}`. Border is `1px solid ${typeColor}44`.
- **Iconography:** Optional 12px SVG elemental silhouette positioned left of text label with `gap-1.5`.

### 3. Stat Bar Meters
- **Layout:** Horizontal flex row with centered vertical alignment (`gap-3`).
- **Keys:** Stat title (e.g., `HP`, `ATK`) rendered with `label-badge`, width `2.75rem`, color `#94A3B8`.
- **Numerical Value:** `stat-value` text, width `2.25rem`, right-aligned, color `#F9FAFB`.
- **Track:** Flex-1, height `6px`, background `rgba(255, 255, 255, 0.08)`, `rounded-full`, overflow hidden.
- **Fill:** Height `100%`, `rounded-full`. Width mapped to stat value (e.g., `(stat / 255) * 100%`).
- **Meter Fill Colors:** Dynamic based on value thresholds:
  - `< 50`: Coral Red (`#FA6555`)
  - `50 - 89`: Warm Gold (`#FFCE4B`)
  - `90 - 119`: Mint Teal (`#48CFB2`)
  - `120+`: Sky Cyan (`#58ABF6`) with continuous shimmer animation.

### 4. Interactive Buttons
- **Primary Pill Action:** Height `44px`, `rounded-full`, background `linear-gradient(135deg, #FA6555 0%, #E04B3B 100%)`, shadow `0 8px 20px -4px rgba(250, 101, 85, 0.4)`, text `#FFFFFF`, font weight `700`.
- **Ghost Glass Button:** Height `44px`, `rounded-full`, background `rgba(255, 255, 255, 0.06)`, border `1px solid rgba(255, 255, 255, 0.1)`, text `#F9FAFB`, hover background `rgba(255, 255, 255, 0.12)`.
- **Circular Icon Button:** Dimensions `40px x 40px`, `rounded-full`, centered icon, glassmorphic fill for back arrows, favorites toggle, and audio cry triggers.

### 5. Search & Filter Bar
- **Search Input:** Height `48px`, `rounded-2xl`, background `rgba(26, 29, 38, 0.9)`, border `1px solid rgba(255, 255, 255, 0.08)`, left inset search icon, placeholder text `Search by name or number...` in `#64748B`. Focused state adds border `1px solid #58ABF6` and subtle ring `0 0 0 3px rgba(88, 171, 246, 0.15)`.
- **Filter Chips:** Horizontal scrolling list of type pills; inactive chips use `rgba(255, 255, 255, 0.05)` fill with `#94A3B8` text; active chips switch to their full elemental color fill with pure white text and glowing shadow.

### 6. Evolution Chain Nodes
- **Structure:** Horizontal flex row interconnected by soft animated arrow SVGs.
- **Node Card:** `rounded-2xl`, background `rgba(26, 29, 38, 0.5)`, border `1px solid rgba(255, 255, 255, 0.06)`, padding `12px`, centered thumbnail image (64px x 64px), creature name below in `body-sm`.
- **Condition Badge:** Embedded over the arrow link (e.g., `Lvl 16`, `Thunder Stone`, `Friendship`) using `label-badge` with `#94A3B8` text on dark pill backdrop.