---
name: new-survey
description: Interview the user for a survey/intake form (one-question-per-screen, conditional branching, contact capture, submissions to Netlify Blobs with Slack/Teams alerts), build it from _templates/survey/, and deploy to Netlify. Use when the user says "/new-survey" or asks for a survey, intake form, quiz, lead-capture form, or questionnaire.
---

# /new-survey — Build and deploy a survey

## What a survey is

A one-question-per-screen intake form with a progress bar, optional contact/lead-capture step, multiple-choice questions with conditional branching, and a free-text comment field. Submissions are stored in Netlify Blobs and can fire Slack or Teams notifications.

**Template:** `_templates/survey/index.html`
**Backend:** `netlify/functions/submission.mjs` (generic, already shipped — no new function needed)

**Read `CLAUDE.md`** for the design system. Surveys are screen-first; mobile-first; must work on a phone because that's where most respondents will open it.

---

## Interview the user

1. **"What's the survey for?"** — lead qualification, customer feedback, event RSVP, content preference, etc.
2. **"Who's taking it?"** — prospects, existing customers, event attendees. Shapes tone.
3. **"Do you need contact info from the respondent?"** — if yes, which fields: name, email, company, role, phone, referred-by.
4. **"What questions do you want to ask?"** — let them list them. Each question needs:
   - The question text
   - Answer type: multiple choice (single select), multiple choice (multi-select), or free text
   - If multiple choice: the options
   - Optional: a "show if previous answer was X" branching rule
5. **"Any final free-text question?"** — e.g., "Anything else you'd like us to know?"
6. **"What should the thank-you screen say?"** — confirmation message and optional next step.
7. **"Where do you want submissions sent?"** — Slack channel, Teams channel, email, or just stored in Blobs (the env vars `SLACK_BOT_TOKEN` + `SLACK_CHANNEL_ID` or `TEAMS_WEBHOOK_URL` control this site-wide; survey-specific routing is not supported yet).
8. **"Brand color?"**

---

## Build the page

1. **Slug:** descriptive and short. `acme-feedback`, `webinar-rsvp`, `customer-needs`.
2. **Hash:** 8 hex chars.
3. **Copy:**
   ```bash
   cp -r _templates/survey <slug>-<hash>
   ```
4. **Customize `index.html`:**
   - SEO meta tags
   - Brand CSS variables (`--accent`, `--accent-hover`, `--accent-soft`, `--accent-light`)
   - Header logo/title
   - Intro headline and opening copy
   - **The `QS` array in the `<script>` tag** — this is the question definition. Each entry is an object with `id`, `q`, `type`, `options`, `showIf`. See the comments inside the template for the exact schema.
   - Contact step fields (if needed) — enable/disable in the config
   - Final free-text question
   - Submission payload's `form` identifier — set this to your slug, it scopes storage in Blobs
   - Thank-you screen text

5. **Submission handling:**
   - The form POSTs to `/.netlify/functions/submission` (already deployed)
   - Body includes `form` (your slug), `contact`, `answers`, `comment`, `submitted_at`, `ref`, `user_agent`
   - Backend stores in Blobs store `submissions`, keyed by submission ID
   - If `SLACK_BOT_TOKEN` + `SLACK_CHANNEL_ID` are set, Slack gets a formatted message
   - If `TEAMS_WEBHOOK_URL` is set, Teams gets an adaptive card
   - Both can be set simultaneously

---

## Mandatory checks before deploying

- [ ] SEO meta tags filled
- [ ] Brand color set
- [ ] `form` identifier in the submission payload matches the slug
- [ ] All questions defined in the `QS` array with proper `id`, `q`, `type`, `options`
- [ ] Branching (`showIf`) rules tested — walk through the flow mentally, verify skip logic
- [ ] Contact fields match what the user asked for
- [ ] Thank-you screen text is set
- [ ] **Mobile (375px):** questions fill the screen, tap targets are big enough, progress bar works
- [ ] **Tablet (768px):** looks intentional, not stretched mobile
- [ ] **Desktop (1024px):** centered, readable max-width

---

## Preview

> **Preview: Acme Customer Feedback Survey**
>
> - **Slug:** `acme-feedback-a1b2c3d4`
> - **Brand:** teal (#0f766e)
> - **Contact step:** name, email, company (optional)
> - **Questions:**
>   1. How satisfied are you? (1-5)
>   2. Which features do you use most? (multi-select)
>   3. (If satisfaction < 3) What's frustrating you? (free text) ← branching
>   4. Would you recommend us? (yes / no / maybe)
> - **Final comment:** "Anything else you'd like us to know?"
> - **Thank-you:** "Thanks — we'll be in touch within 2 business days."
> - **Notifications:** Slack (if configured)
>
> Publish now? (yes / no / changes)

---

## Deploy

```bash
netlify deploy --prod --dir=. --functions=netlify/functions
```

---

## After publishing

Tell the user:

- **Live URL** for the survey
- **Where submissions go:** Netlify Blobs store `submissions`
- **How to view them:** "Submissions are stored in Netlify Blobs. You can ask me to list recent submissions for this survey anytime." (This would require another skill or a direct function call — flag as a follow-up if they want it.)
- **Slack/Teams alerts:** if configured, they'll see notifications there. If not, offer to help them set it up.

Stop. Don't ask what's next.
