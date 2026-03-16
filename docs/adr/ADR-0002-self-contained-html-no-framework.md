# ADR-0002: Self-Contained HTML, No Framework

- **Status:** Accepted
- **Date:** 2026-03-16
- **Authors:** Bert Carroll, Claude Code
- **Related:** ADR-0001

---

## Context

We need to choose how pages are built and deployed. The pages range from static one-pagers to interactive calculators with sliders, scenario comparisons, and CSV export. Traditional approaches would use React/Vue/Svelte with a build step, or a static site generator like Astro/Hugo.

**Decision Drivers:**
- AI coding assistants should be able to generate complete pages in a single pass
- No build step -- deploying is copying files
- Each page is independently customizable (different brand colors, different content)
- Pages should work when opened from the local filesystem
- No dependency rot over time

## Decision

Each page is a single `index.html` file with all CSS and JavaScript inline. No external dependencies, no build step, no shared component library. The design system is a documented specification (CSS variables, component patterns) rather than shared code.

## Rationale

The key insight: **the page IS the deliverable.** It's not a React component that renders into a page. It's the actual HTML file. You can email it. You can print it. You can open it from your desktop. You can host it on any static file server in the world.

This matters for three reasons:

1. **AI generation speed.** When Claude or any AI assistant generates a page, there's no framework to configure, no imports to resolve, no build errors to debug. The output is the final product. This cuts page creation time from "hours of framework wrangling" to "15 minutes of content."

2. **Zero maintenance.** A page built today works identically in 5 years. There are no dependencies to update, no breaking changes from framework upgrades, no `npm audit` vulnerabilities to patch. The page is frozen in time.

3. **Independent customization.** Changing one client's brand colors doesn't touch any other page. There's no shared CSS to cascade through 60 pages. Copy, modify, deploy -- each page is its own island.

## Considered Options

### Option 1: Self-contained HTML (chosen)
**Pros:**
- No build step, no dependencies
- AI assistants generate working pages in one shot
- Each page is independently customizable
- Works from filesystem, any hosting, email attachment
- Zero maintenance burden

**Cons:**
- CSS is repeated across pages (not DRY)
- No component reuse across pages
- Design changes must be applied per-page

### Option 2: React/Vue/Svelte SPA
**Pros:**
- Component reuse
- Shared state management
- Ecosystem of UI libraries

**Cons:**
- Build step required (webpack/vite)
- Framework lock-in and version churn
- AI assistants struggle with framework-specific patterns
- Can't open from filesystem
- Single dependency vulnerability affects all pages

### Option 3: Static Site Generator (Astro/Hugo/11ty)
**Pros:**
- Shared layouts and components
- Markdown content with templates
- Good build performance

**Cons:**
- Build step required
- Template language learning curve
- AI must understand both the template syntax and the output
- Harder to customize individual pages

### Option 4: Shared CSS file + per-page HTML
**Pros:**
- DRY CSS
- Design changes propagate automatically

**Cons:**
- CSS changes affect all pages (risky)
- Pages don't work standalone (need the CSS file)
- Deployment couples all pages together

## Consequences

### Positive
- Page creation time averages 15-30 minutes with AI assistance
- Zero build failures -- if the HTML is valid, it works
- Pages can be shared as email attachments (useful for offline/restricted environments)
- No `node_modules`, no `package-lock.json` per page
- 60+ pages shipped in 6 weeks with this approach

### Negative
- CSS repetition across pages (~3-5KB duplicated per page). Mitigated: HTML compresses extremely well; total site is still small
- Design system changes (e.g., new card pattern) must be applied to existing pages manually. Mitigated: old pages continue to work fine with old styles; only update if content changes

### Neutral
- The `package.json` at the repo root exists only for `@netlify/blobs` (used by server functions), not for page generation

## Implementation

**Files Affected:**
- All files in `_templates/` -- each is a self-contained HTML file
- All files in `examples/` -- working examples following the same pattern
- `TEMPLATES.md` -- documents the CSS variable system and component patterns

**Design System Enforcement:**
The design system is enforced by convention and documentation, not by shared code:
- CSS variables (`:root { --accent: ... }`) in every template
- Component class names (`.card`, `.stat-card`, `.callout`) documented in TEMPLATES.md
- Dark mode pattern (`[data-theme="dark"]`) consistent across all templates

**Rollback Plan:**
N/A -- this is a foundational decision. Moving to a framework would be a full rewrite, which is why we're confident in the self-contained approach: there's no migration path to maintain.

## References

- [Locality of Behavior](https://htmx.org/essays/locality-of-behaviour/) -- the principle that behavior should be colocated with the element it affects
- Production evidence: 60+ pages shipped across 2 domains in 6 weeks

---

**Author:** Bert Carroll
**Last Updated:** 2026-03-16
