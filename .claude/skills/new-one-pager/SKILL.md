---
name: new-one-pager
description: Interview the user for a one-pager (print-first, single letter-size sheet, sales overview), build it from _templates/one-pager/, and deploy to Netlify. Use when the user says "/new-one-pager" or asks for a one-pager, single-sheet overview, printable summary, or similar.
---

# /new-one-pager — Build and deploy a one-pager

## What a one-pager is

A one-pager is a single letter-size sheet designed to be handed out in a meeting, printed, saved as PDF, or read on a phone. Dense, information-rich, print-first. Used for sales overviews, product summaries, company intros, investor briefs.

**Template:** `_templates/one-pager/index.html` — copy this whole file, customize the content, deploy.

**Read `CLAUDE.md` for the design system**, especially the responsive breakpoints and typography rules. The one-pager template handles print sizing, but you must preserve screen sizing for mobile/tablet/desktop — don't inherit print type sizes onto small screens.

---

## Interview the user

Ask these in order. Don't ask all at once — one question per message, wait for the answer, then the next. If they volunteer information out of order, capture it and skip the corresponding question.

1. **"What is this one-pager about?"** — the subject: company, product, service, event, role.
2. **"Who's the audience?"** — investors, clients, partners, recruits. This shapes the tone.
3. **"What's the one thing you want them to do after reading it?"** — call a number, email, book a meeting, sign up. This is the CTA.
4. **"What brand color should I use?"** — hex code, a named color ("dark green", "royal blue"), or "pick something that fits the subject."
5. **"Anything specific you want included?"** — let them paste bullet points, a draft, an existing brief, whatever. If they have nothing, that's fine, you'll draft it.
6. **"Is there a tagline or one-sentence positioning statement?"** — optional but strong if they have one.
7. **"Your contact info for the footer?"** — name, email, website, phone (whichever they want visible).

**Stop asking questions when you have enough to write a good page.** A one-pager needs a subject, an audience, a CTA, and a brand color. Everything else is bonus. Don't turn the interview into a 20-question interrogation.

---

## Build the page

1. **Pick the slug.** Short kebab-case, descriptive. Examples: `acme-overview`, `q2-investor-brief`, `ai-consulting`.
2. **Generate the hash:**
   ```bash
   python -c "import secrets; print(secrets.token_hex(4))"
   ```
   Append it to the slug with a dash: `acme-overview-a1b2c3d4`.
3. **Copy the template:**
   ```bash
   cp -r _templates/one-pager acme-overview-a1b2c3d4
   ```
4. **Edit `acme-overview-a1b2c3d4/index.html`:**
   - Replace `PAGE_TITLE`, `PAGE_DESCRIPTION`, `PAGE_SLUG` in meta tags
   - Set `--brand` and `--brand-dark` CSS variables to the user's brand color (pick a dark shade for `--brand-dark` automatically)
   - Fill in the header brand text and tagline
   - Write the hero statement (1 headline + 1 paragraph, punchy, their positioning)
   - Fill sections — usually "The Problem," "The Solution," "How It Works," "Results/Proof," "Who We Serve," "Next Steps." Adapt to subject.
   - Fill the CTA with the action they specified
   - Footer with their contact info

5. **Responsive sizing — critical.** The one-pager template is print-first with 9-13px type, but **that is print-only sizing**. On mobile, tablet, and desktop the same page must render at a comfortable reading size:
   - Mobile (≤767px): 16px body minimum
   - Tablet (768-1023px): 16-17px body
   - Desktop (≥1024px): 16-18px body, scale headings up
   - Print: 9-13px body (unchanged — fits letter size)

   The template should already separate screen and print scales via `@media screen` and `@media print`. **If the template you're working with doesn't have proper screen-size breakpoints, add them.** Never ship a one-pager that renders at 9px on a phone. That's a usability failure.

6. **Content rules:**
   - Keep it tight — a one-pager should fit on a single letter-size sheet when printed
   - Every sentence should earn its space
   - Use bullet points and short paragraphs, not walls of text
   - Authentic, not marketing copy. Write like a person explaining what something is and why it matters.
   - Use `&mdash;` for em dashes in HTML, never `--`

7. **Mandatory checks before deploying:**
   - [ ] All `PAGE_TITLE` / `PAGE_DESCRIPTION` placeholders replaced
   - [ ] All `YOUR_*` placeholders replaced
   - [ ] Brand color set via `:root --brand`
   - [ ] SEO meta tags filled (og:title, og:description, og:url)
   - [ ] `<title>` tag matches page title
   - [ ] Contact info in footer is real, not `example@example.com`
   - [ ] **Mobile viewport (375px) renders with readable type (16px+ body)**
   - [ ] **Tablet viewport (768px) renders cleanly, not a stretched mobile layout**
   - [ ] **Desktop (1024px+) renders the full layout**
   - [ ] **Print preview shows it fits on one letter-size sheet**

---

## Preview before deploying

Show the user a summary:

> **Preview: Acme Strategy — Overview**
>
> - **Slug:** `acme-overview-a1b2c3d4`
> - **Brand:** dark green (#064e3b)
> - **Hero:** "Strategy consulting for CFOs who want numbers, not decks"
> - **Sections:** The Gap, Our Approach, Recent Wins, Who We Serve, Next Steps
> - **CTA:** "Book a 30-min call: calendly.com/acme-strategy"
>
> Publish to Netlify now? (yes / no / changes)

Wait for confirmation. If they want changes, apply them and re-preview.

---

## Deploy

```bash
netlify deploy --prod --dir=. --functions=netlify/functions
```

This uses `NETLIFY_AUTH_TOKEN` automatically. Do not run `netlify login`.

Capture the deploy URL from the command output. The page lives at:
```
https://<site>.netlify.app/acme-overview-a1b2c3d4/
```

---

## Report back

Show the user:

- **Live URL** (clickable)
- **Tracked link example** (append `?ref=recipient-name`)
- **How to edit** ("just tell me what to change")
- **How to print** ("click the Print button in the toolbar, or Cmd+P / Ctrl+P")

Then stop. Do not ask "would you like me to...". The work is done.

---

## If something breaks

- **Deploy fails with auth error:** `NETLIFY_AUTH_TOKEN` is missing or invalid. Send the user to `COWORK_SETUP.md` Step 3.
- **Deploy fails with "site not linked":** run `netlify sites:list`, pick the right site, `netlify link --id <site-id>`.
- **Page loads but looks broken:** check that you copied the full template directory, not just `index.html`.
- **Page is tiny on mobile:** you inherited print sizing onto screen. Wrap the 9-13px rules in `@media print { ... }` and add `@media screen` rules with 16px+ body.
