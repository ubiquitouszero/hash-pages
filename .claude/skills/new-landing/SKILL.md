---
name: new-landing
description: Interview the user for a landing page (general product/service page with nav, hero, sections, CTA), build it from _templates/landing-page/, and deploy to Netlify. Use when the user says "/new-landing" or asks for a landing page, product page, webinar page, event page, service page, or similar.
---

# /new-landing — Build and deploy a landing page

## What a landing page is

A general-purpose web page with nav, hero, content sections, and a call to action. Longer and more flexible than a one-pager. Designed for screens, not print. Used for product overviews, service descriptions, event/webinar pages, feature indexes.

**Template:** `_templates/landing-page/index.html`

**Read `CLAUDE.md`** for the design system — especially the mandatory four-breakpoint responsive rules (mobile / tablet / desktop / wide desktop) and the typography scale.

---

## Interview the user

One question at a time. Capture info they volunteer out of order.

1. **"What is this page for?"** — product, service, event, webinar, company, initiative.
2. **"Who's the audience?"** — shapes tone and depth.
3. **"What do you want visitors to do?"** — sign up, book, buy, contact, download. This is the primary CTA.
4. **"What sections do you want?"** — offer defaults based on the use case: product ("Features / How it works / Pricing / FAQ"), event ("When & where / Agenda / Speakers / Register"), service ("What we do / Process / Results / Get started").
5. **"Brand color?"** — hex, named, or "pick something."
6. **"Anything specific to include?"** — let them paste content.
7. **"Company/product name for the nav?"**
8. **"Footer info?"** — contact, social, legal links.

---

## Build the page

1. **Slug:** kebab-case. `acme-platform`, `q2-webinar`, `strategy-services`.
2. **Hash:** `python -c "import secrets; print(secrets.token_hex(4))"`
3. **Copy the template:**
   ```bash
   cp -r _templates/landing-page <slug>-<hash>
   ```
4. **Customize `index.html`:**
   - SEO meta tags (title, description, og:*, twitter:*)
   - `:root --accent` and related brand color variables
   - Nav brand name
   - Hero headline + subtitle + primary CTA button
   - Content sections per the interview
   - Footer
5. **Responsive behavior — mandatory.** This is a screen-first page. Every section must render cleanly at mobile, tablet, desktop, and wide desktop sizes. See `CLAUDE.md` for the breakpoint table. No horizontal scroll on any size.
6. **Dark mode toggle** should stay — users toggle it with the button in the nav, and OS preference is detected on first visit.

---

## Mandatory checks before deploying

- [ ] All placeholders replaced
- [ ] Brand color set
- [ ] SEO meta tags filled
- [ ] `<title>` matches page
- [ ] **Mobile (375px):** single column, 16px+ body, no horizontal scroll
- [ ] **Tablet (768px):** real tablet layout (not stretched mobile)
- [ ] **Desktop (1024px):** full multi-column layout where appropriate
- [ ] **Wide (1440px):** max-width container prevents sprawling
- [ ] Dark mode toggle works
- [ ] Primary CTA button is visible above the fold on mobile

---

## Preview

Summarize to the user before publishing:

> **Preview: Acme Platform — Landing**
>
> - **Slug:** `acme-platform-a1b2c3d4`
> - **Brand:** royal blue (#2563eb)
> - **Hero:** "The fastest way to [value proposition]" + "Get started free" button
> - **Sections:** Features, How It Works, Pricing, FAQ
> - **CTA:** Primary — sign up. Secondary — book a demo.
>
> Publish to Netlify now? (yes / no / changes)

---

## Deploy

```bash
netlify deploy --prod --dir=. --functions=netlify/functions
```

Return the live URL and stop. Don't ask follow-up questions.
