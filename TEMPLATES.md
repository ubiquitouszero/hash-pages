# Template Catalog

Each template is a self-contained HTML file. Copy it, customize it, deploy it.

---

## Quick Reference

| Template | When to Use | Time to Ship | Template Path |
|----------|-------------|--------------|---------------|
| **Landing Page** | General purpose product/service page | 15-30 min | `_templates/landing-page/` |
| **One-Pager** | Print-first, single-sheet overview | 15-30 min | `_templates/one-pager/` |
| **Calculator** | Interactive tool with sliders and live results | 30-60 min | `_templates/calculator/` |
| **Proposal** | Scoped engagement with pricing table | 15-30 min | `_templates/proposal/` |
| **Deal Package** | Multi-page linked documents | 1-3 hours | `_templates/deal-package/` |
| **Meeting Prep** | Pre-meeting briefing with bios and checklist | 30 min | `_templates/meeting-prep/` |
| **Debrief** | Post-meeting analysis with action items | 30 min | `_templates/debrief/` |

---

## Landing Page

**Path:** `_templates/landing-page/index.html`

General purpose page with nav, hero, stats, cards, CTA, and footer. Good for product overviews, feature indexes, or anything that needs sections.

### What to Customize

| Element | What to Change |
|---------|---------------|
| `--accent` | Brand color (CSS variable in `:root`) |
| `--accent-dark` | Darker shade of brand color |
| Nav brand | Company/product name |
| Hero | Headline, subtitle, CTA button text and link |
| Stats | Numbers and labels |
| Cards | Feature titles, descriptions, icons |
| CTA | Call to action text and email/link |
| Footer | Your name and website |
| Meta tags | `og:title`, `og:description`, `og:url` |

### Features Included

- Dark mode toggle (OS detection + manual switch)
- Scroll-triggered fade-in animations
- Responsive card grid
- Print styles (hides nav, adjusts spacing)

---

## One-Pager

**Path:** `_templates/one-pager/index.html`

Print-first design. Fits on a single letter-size sheet. Use for sales overviews, product summaries, or anything someone might print in a meeting.

### What to Customize

| Element | What to Change |
|---------|---------------|
| CSS `--brand` | Brand color (used in headers, bullets, borders) |
| CSS `--brand-dark` | Darker brand shade |
| Header | Brand name, subtitle, tagline |
| Hero | One-line value prop, supporting sentence |
| Steps | How-it-works flow (adjust count as needed) |
| Stats | Key metrics (4 across) |
| Two columns | Left: differentiators. Right: personas or features. |
| Use cases | 3 across. Different contexts for same product. |
| Footer | Company, URL, contact, confidentiality notice |
| Toolbar link | Your website URL |

### Design Notes

- `@page { size: letter; margin: 0.5in }` for print
- `-webkit-print-color-adjust: exact` on all colored elements
- Font sizes are 9-13px to fit letter size -- deliberate
- Toolbar with Print button disappears on actual print
- Grid layouts collapse to single column on mobile

---

## Calculator / Interactive Tool

**Path:** `_templates/calculator/index.html`

Interactive page with sliders, toggle buttons, live-updating results, scenario comparison, share link, and CSV export.

### What to Customize

| Element | What to Change |
|---------|---------------|
| `--accent` | Brand color |
| Slider inputs | Change IDs, min/max/step, labels |
| Toggle buttons | Change options and `data-value` |
| `calculate()` function | **Your actual math goes here** |
| Results grid | Change card labels and positive/negative/neutral classes |
| `buildScenario()` | Adjust scenario row labels |
| Assumptions | Your domain-specific assumptions |
| CSV export columns | Match your output fields |

### Key Patterns

**Single `update()` function:** All inputs bind to one function that recalculates everything. This is the critical pattern -- it means the page is always consistent.

**Share via URL hash:**
```javascript
const cfg = { /* all input values */ };
const url = location.pathname + '#cfg=' + btoa(JSON.stringify(cfg));
```
Anyone who opens the link sees the exact same configuration.

**Scenario comparison:** Conservative (0.5x inputs), Base (your inputs), Aggressive (2x inputs). Automatically generated from the same `calculate()` function.

---

## Proposal

**Path:** `_templates/proposal/index.html`

B2B proposal with problem/solution layout, implementation phases, pricing table, and CTA.

### What to Customize

| Element | What to Change |
|---------|---------------|
| `--brand` | Client or your brand color |
| Top bar | Your company, client name |
| Hero | Project title, one-sentence description |
| Problem/solution blocks | Their specific pain, your specific answer |
| Steps | Your delivery phases |
| Pricing table | Phases, deliverables, story points, estimates |
| CTA | Email link with prefilled subject |
| Note box | Pricing model explanation |

### Design Notes

- Problem blocks have red left border, solutions have green
- Pricing table header uses dark brand color (print-safe)
- CTA box at the bottom creates urgency
- Phase 1 is always positioned as low-commitment entry point

---

## Deal Package

**Path:** `_templates/deal-package/README.md`

Not a single template but a pattern for linking multiple pages. Read the README for the full guide.

### Typical Set

1. **Proposal** -- the engagement overview
2. **Contract** -- Software Development Agreement
3. **BAA** -- HIPAA Business Associate Agreement (if applicable)
4. **Internal Debrief** -- your strategic read (not shared with client)

### Toolbar CSS

```css
.toolbar { position: fixed; top: 0; left: 0; right: 0; z-index: 50; background: #1a365d; color: white; padding: 8px 16px; display: flex; justify-content: space-between; align-items: center; font-size: 13px; }
.toolbar a { color: #93c5fd; text-decoration: none; margin: 0 8px; }
.toolbar .current { color: #64748b; }
.no-print { }
@media print { .no-print { display: none !important; } }
```

---

## Meeting Prep

**Path:** `_templates/meeting-prep/index.html`

Pre-meeting briefing with join link, bios, talking points, and server-synced checklist.

### What to Customize

| Element | What to Change |
|---------|---------------|
| Header | Meeting name, date/time |
| Join bar | Meeting link, dial-in, passcode |
| Quick links | Section anchors |
| Bio cards | Attendee photos, names, roles, backgrounds |
| Callout boxes | Frame (green), Warning (orange), Soundbite (blue) |
| Checklist items | `data-key` attributes + labels |
| Checklist API | Change API path if using Cloudflare |

### Callout Box Types

| Class | Border Color | Use |
|-------|-------------|-----|
| `.frame-box` | Green | Strategic framing -- how to position the conversation |
| `.warning-box` | Orange | Risks, things to avoid, sensitive topics |
| `.soundbite` | Blue | The quotable line you want them to remember |

---

## Debrief

**Path:** `_templates/debrief/index.html`

Post-meeting analysis. Green header (vs navy for prep) signals "done/post-meeting."

### What to Customize

| Element | What to Change |
|---------|---------------|
| Header | Meeting name + "Debrief" |
| Prep link | URL to the original prep page |
| Strategic read | What happened, what it means, what to do |
| Key people table | Names, roles, observations |
| Action items | Split by owner, each with `data-key` |
| Transcript | Cleaned transcript (bold speaker names) |
| Checklist API | Change API path if using Cloudflare |

### Workflow

1. Meeting happens
2. Clean transcript in a local doc
3. Copy debrief template, fill in strategic read + actions
4. Deploy
5. Add "Post-Meeting Debrief" link to the prep page's quick links bar
6. Share the debrief URL with the person who needs to act

---

## Common Customization Across All Templates

### Meta Tags (Required)

Every page needs these for link previews:

```html
<meta name="robots" content="noindex, nofollow">
<meta name="description" content="...">
<meta property="og:title" content="...">
<meta property="og:description" content="...">
<meta property="og:type" content="article">
<meta property="og:url" content="https://yourdomain.com/slug/">
<meta name="twitter:card" content="summary">
```

### Brand Colors

Change the CSS variables in `:root`. Everything cascades.

### Checklist API Path

- **Netlify:** `/.netlify/functions/checklist?page=SLUG`
- **Cloudflare:** `/api/checklist?page=SLUG` (or external worker URL)

The checklist script auto-detects the page slug from the URL path. You only need to change the API base URL.
