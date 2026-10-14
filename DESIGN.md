---
name: "Bodferð reading edition"
description: "A quiet engineering dossier for confidential THORChain node communication."
colors:
  paper: "#f9faf9"
  ink: "#202c34"
  muted: "#536573"
  blue: "#17486b"
  rail: "#eaf0f3"
  rule: "#ccd6dc"
  code: "#eef2f4"
  focus: "#075e9c"
  brand-fjord: "#163f46"
  brand-copper: "#b46c3d"
typography:
  brand-wordmark:
    fontFamily: 'Georgia, "Times New Roman", serif'
    fontSize: "68px"
    fontWeight: 400
    lineHeight: 1.05
    letterSpacing: "-0.035em"
  brand-tagline:
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif'
    fontSize: "16px"
    fontWeight: 400
    lineHeight: 1.5
  brand-masthead:
    fontFamily: 'Georgia, "Times New Roman", serif'
    fontSize: "25px"
    fontWeight: 400
    letterSpacing: "-0.02em"
  display:
    fontFamily: 'Georgia, "Times New Roman", serif'
    fontSize: "48px"
    fontWeight: 400
    lineHeight: 1.12
    letterSpacing: "-0.025em"
  headline:
    fontFamily: 'Georgia, "Times New Roman", serif'
    fontSize: "32px"
    fontWeight: 400
    lineHeight: 1.2
    letterSpacing: "-0.015em"
  title:
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif'
    fontSize: "20px"
    fontWeight: 650
    lineHeight: 1.35
  body:
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif'
    fontSize: "17px"
    fontWeight: 400
    lineHeight: 1.7
  lead:
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif'
    fontSize: "21px"
    fontWeight: 400
    lineHeight: 1.55
  reference:
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif'
    fontSize: "16px"
    fontWeight: 400
    lineHeight: 1.75
  label:
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif'
    fontSize: "13px"
    fontWeight: 400
  mono:
    fontFamily: '"SFMono-Regular", Consolas, "Liberation Mono", monospace'
    fontSize: "12px"
    fontWeight: 400
    lineHeight: 1.65
rounded:
  small: "3px"
spacing:
  compact: "12px"
  inset-small: "16px"
  inset: "20px"
  reading-mobile: "22px"
  separation: "24px"
  section-inset: "35px"
components:
  brand-wordmark:
    textColor: "{colors.brand-fjord}"
    typography: "{typography.brand-wordmark}"
  brand-tagline:
    textColor: "{colors.muted}"
    typography: "{typography.brand-tagline}"
  brand-masthead:
    textColor: "{colors.ink}"
    typography: "{typography.brand-masthead}"
  search-input:
    backgroundColor: "{colors.paper}"
    textColor: "{colors.ink}"
    rounded: "{rounded.small}"
    padding: "8px 9px"
  contents-link:
    textColor: "{colors.muted}"
    rounded: "{rounded.small}"
    padding: "7px 10px"
  document-status:
    backgroundColor: "{colors.rail}"
    textColor: "{colors.ink}"
    padding: "17px 20px"
  draft-label:
    textColor: "{colors.muted}"
    padding: "2px 8px"
  code-block:
    backgroundColor: "{colors.code}"
    textColor: "{colors.ink}"
    typography: "{typography.mono}"
    padding: "20px 22px"
  print-button:
    textColor: "{colors.blue}"
    padding: "6px 10px"
---

# Design System: Bodferð reading edition

## Overview

**Creative North Star: "The Engineering Design Dossier"**

The engineering design dossier makes technical reading its primary task. Paper-white ground, a blue-grey contents rail, charcoal ink and restrained deep-blue links establish a calm, conventional document. Georgia headings give the long text a recognizable editorial hierarchy; system sans carries explanations and interface labels, while monospace identifies literal contracts.

Thin rules, whitespace and tonal changes organize the material without turning sections into cards. Navigation stays alongside the reading column on wide screens and becomes a disclosure above it on narrow screens. This visual system belongs to the reading edition; its patterns do not imply that the proposed relay or messaging service exists.

The Bodferð identity extends this dossier with an original angular conversation seal, Norse hammer and communication nodes. Deep fjord green and copper identify the brand; the live serif name and “Private Fortified Communications.” tagline accompany the emblem. A small flat vector serves the masthead and favicon, while a transparent copper-and-enamel illustration serves the opening lockup. This richer artwork belongs to the identity, with the document retaining its established reading hierarchy and flat surfaces.

**Key Characteristics:**
- Quiet paper and ink with blue reserved for links and wayfinding.
- Readable prose, conventional tables and literal code.
- Flat ruled structure with visible keyboard focus.
- Responsive contents and a normal print edition.
- Original Norse conversation emblem with a live serif name and P.F.C. tagline.

## Colors

The palette combines cool paper neutrals and charcoal ink with a restrained, authoritative blue.

### Primary

- **Deep document blue** (`blue`): actual links, pathway headings and navigation accents.
- **Keyboard focus blue** (`focus`): the shared visible outline for interactive and scrollable elements.

### Secondary

- **Deep fjord green** (`brand-fjord`): the opening wordmark, emphasized P.F.C. initials and original vector emblem.
- **Carved copper** (`brand-copper`): hammer and small carved cuts in the vector emblem; the hero illustration develops the same copper-and-deep-green identity with baked material detail.

These identity accents do not recolor document links, reading text, navigation states or protocol headings.

### Neutral

- **Paper white** (`paper`): page, masthead and search field ground.
- **Charcoal ink** (`ink`): principal reading text and identity.
- **Blue-grey text** (`muted`): captions, metadata, supporting explanations and unselected contents links.
- **Contents wash** (`rail`): navigation rail, table headings and status notices.
- **Fine rule** (`rule`): the shared line separating sections, surfaces and table rows.
- **Code wash** (`code`): inline code and code blocks.

Hover and selected navigation use distinct, stronger blue-grey fills in the implemented CSS. They are component states, not an additional brand accent. White and the confidential-lane tint distinguish the two architecture rows locally; they are not a global card palette.

**The Wayfinding Blue Rule.** Use deep blue for actual links, selected navigation and technical pathway headings; keep running text in ink.

## Typography

**Display Font:** Georgia, with Times New Roman and serif fallbacks.
**Body Font:** the platform system sans stack.
**Label/Mono Font:** SFMono-Regular, Consolas, Liberation Mono and monospace fallbacks for literal text.

**Character:** editorial reading headings paired with practical interface text. No external font request is required by the implementation.

### Hierarchy

The normative frontmatter records desktop roles. Display carries the document title; headline carries section titles; title identifies subsections. Body explains the design, lead introduces it, reference handles the full technical text, label supports wayfinding and metadata, and mono represents preformatted contracts. Fourth-level headings use system sans (17px, 650, 1.4); small table and metadata labels use the observed compact range (12–13px).

The opening identity has its own live wordmark and tagline roles, separate from the base document display role. The wordmark uses Georgia with the inherited serif fallbacks and the desktop role in frontmatter; it steps to (58px) at the middle breakpoint and (44px) on mobile, retaining (1.05) line height and (-0.035em) tracking. The tagline uses system sans at (16px) desktop, (14px) middle and (15px) mobile, with (1.5) line height. Its P, F and C initials are emphasized (650) in fjord green; the complete phrase is “Private Fortified Communications.” without an extra acronym badge. Masthead lettering uses the brand-masthead role and becomes (24px) on mobile.

Body paragraphs and ordinary lists are limited to (72ch); the lead is narrower (58ch). The base document display becomes (42px) at the middle breakpoint; the dedicated brand wordmark overrides that size in the opening. At the narrow breakpoint display becomes (37px, 1.15), headline (28px), title (19px), body (16px), lead (19px), reference (15px), and code blocks (11px). Do not compress the entire dossier to its smallest label size.

**The Reading Roles Rule.** Use Georgia for document and section headings, system sans for explanations and controls, and monospace for literal code or parameters.

## Layout

The wide document frame is centered with a maximum width (1450px), a fixed contents column (270px) and a flexible reading column. The sticky masthead is (78px) tall; the contents rail begins below it and scrolls independently. Main content has a maximum width (1000px) and desktop insets (52px 70px 64px). Long sections are separated by a rule and generous vertical space, not by cards.

At (1050px) and below, the rail narrows (225px), main insets reduce (42px 35px), and title size steps down. At (760px) and below, the frame becomes a single column; the masthead wraps and loses stickiness, the contents disclosure sits above the document, and main insets become (32px 22px 44px). The three-column facts and architecture steps become vertical. Tables and preformatted contracts retain horizontal overflow instead of crushing their contents. Above (1450px), the reading column gains a larger right inset (90px).

The opening brand lockup places a square transparent raster emblem beside live lettering. On desktop the emblem is (158px) wide with a (25px) gap and (34px) bottom separation. At the middle breakpoint its width is (128px) with a (20px) gap. At the narrow breakpoint a two-column grid places the (92px) emblem beside the name, with an (18px) gap; the full tagline spans both columns below and the lockup has (28px) bottom separation. The small masthead SVG is (36 × 43px), becoming (30 × 36px) on mobile.

The small repeated insets and separations appear in frontmatter; they describe observed rhythm, not an exhaustive invented spacing grid. In print the contents rail and screen actions disappear, the frame becomes a normal single-column document, text becomes black on white, and code wraps. Print uses body (10pt), base display (28pt), headline (20pt) and code/table text (8pt). The brand lockup has explicit print overrides: emblem width (64px), wordmark (36pt), tagline (10pt), gap (20px) and bottom separation (20px).

## Elevation & Depth

This is a flat document. There are no box shadows. Thin rules mark the frame and section boundaries; background washes distinguish navigation, status and literal code. Sticky elements remain on the same paper ground. A visible focus outline marks interaction rather than simulating elevation. The stylesheet uses immediate state changes and automatic scrolling, with no decorative transition or animation vocabulary. Copper bevels and enamel depth are baked into the hero illustration; they are artwork details, not CSS shadow tokens or a new surface elevation system.

**The Flat Document Rule.** Use thin rules and tonal backgrounds to establish boundaries; the reading edition uses no shadows.

## Shapes

The frame, status notices, architecture lanes, tables and code blocks have straight, rectangular boundaries. A small softened corner is reused for contents links, the search input and inline code. The identity uses original angular message-seal geometry, a broad Norse hammer, two diamond communication nodes and small copper cuts. Its authored SVG remains flat for small placements. The larger raster develops the same idea with restrained Norse interlace and material detail; neither asset establishes a general icon family. Architecture lanes remain sequential diagram rows and become stacked steps on narrow screens.

## Components

### Brand identity

The masthead links a small color SVG emblem and live serif name to the overview; the favicon uses its square vector variant. The opening uses `src/brand/bodferd-emblem-512.png`, an original (512 × 512px) raster with real alpha, beside a live text wordmark and the full tagline. Both on-page emblem images have empty alt text because adjacent lettering identifies Bodferð. Keep the name and tagline as responsive text on this page. `bodferd-lockup.svg` is the standalone exported name/tagline asset; `bodferd-mark-mono.svg` is the one-color variant. Use the simple SVG for small identity placements and the expressive PNG for the larger opening placement.

The raster's exact generation prompt is retained in `docs/brand-generation.txt` and embedded in the PNG. It is a brand asset, not a whole-page composition. Its color and material rendering do not replace the document palette or flat component vocabulary.

### Links and actions

Document links are blue and underlined, with an offset underline that thickens on hover. Download is a real anchor, styled as a compact masthead action. Print is a small outlined text button in the footer; JavaScript reveals it and calls the browser print function. Both use the shared keyboard outline (3px, with 4px offset). Avoid inventing a filled primary button family for this edition.

### Contents navigation

Compact, calm wayfinding. Links are muted at rest; hover adds a blue-grey wash; the current section receives a stronger wash and heavier text. Current location is also expressed through `aria-current="location"`. Nested reference entries use a disclosure. JavaScript highlights top-level sections; all anchor links remain available without it. At the narrow breakpoint, the contents disclosure starts collapsed when JavaScript is available and closes after choosing a link.

### Document search

A labeled, paper-ground field with a fine border and the small corner token. JavaScript creates the search control and a status region. Queries shorter than two characters receive a prompt; valid queries search section text and link to up to twelve matching sections, with explicit empty and capped-result messages. Search does not replace access to the full document.

### Status notices and draft label

The draft label is an outlined metadata label. Larger status notices use the contents wash, thin rule and moderate inset; their bold opening identifies the design's state or a technical distinction. These are contextual notices, not an interchangeable card grid.

### Architecture lanes

Two ruled rows represent public enrollment and confidential reporting. Each has a compact blue heading and three ordered steps with bold labels and muted descriptions. White and a slightly blue-tinted ground distinguish the rows. Mobile stacks the steps; captions explain the trust boundary beneath the figure. The sequence is meaningful text, not a decorative illustration.

### Tables and code

Tables use a tinted header, horizontal rules, top-aligned cells and tabular numerals. A focusable overflow region protects dense columns. Code blocks use the code wash, a thin rule and monospace; inline code uses the same wash with the small corner. Literal whitespace is preserved on screen and wraps in print. Do not imply that a displayed command or schema is a live service control.

## Do's and Don'ts

### Do:
- **Do** use the simple SVG emblem for small placements and the transparent 512px raster for the larger opening lockup.
- **Do** keep Bodferð and “Private Fortified Communications.” as live responsive text on the reading page.
- **Do** preserve the measured reading width and the responsive contents disclosure.
- **Do** show actionable links, current location and a visible keyboard focus state.
- **Do** keep code and tables scrollable on screen and readable in print.
- **Do** distinguish document status from actions and claims about an implemented service.

### Don't:
- **Don't** turn baked copper bevels or enamel detail into global CSS shadows or component decoration.
- **Don't** substitute upstream organization logos or add a separate P.F.C. badge to the approved tagline.
- **Don't** turn ordinary document sections into a card grid.
- **Don't** add ambient shadows or decorative motion to this reading edition.
- **Don't** replace literal contracts with imagery or promotional summaries.
- **Don't** use monospace for ordinary explanatory paragraphs.
