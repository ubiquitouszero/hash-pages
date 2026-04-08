---
name: new-proposal
description: Interview the user for a client proposal (scoped engagement, pricing table, problem/solution framing), build it from _templates/proposal/, and deploy to Netlify. Use when the user says "/new-proposal" or asks for a proposal, scope document, SOW, or engagement letter.
---

# /new-proposal — Build and deploy a proposal

## What a proposal is

A scoped engagement document sent to a client. Has a problem/solution framing, a scope of work, a pricing table, and a call to action. Not a legal contract — those live separately. This is the sales-ready document that a prospect reads before committing.

**Template:** `_templates/proposal/index.html`

**Read `CLAUDE.md`** for the design system. Proposals need proper screen and print sizing — 11pt body in print, 16px+ on screen.

---

## Interview the user

1. **"Who's the client?"** — company + primary contact name.
2. **"What problem are they trying to solve?"** — the pain, in their words if possible.
3. **"What are you proposing to deliver?"** — the specific scope. If they have bullet points, take them verbatim.
4. **"What's the price?"** — total amount, or story-point breakdown, or hourly, or phased. If the user uses story points, ask the SP count and the SP rate.
5. **"Timeline or milestones?"** — start date, phases, delivery targets.
6. **"What's the CTA?"** — book a kickoff, sign and return, schedule a call, etc.
7. **"Your brand color?"** — or inherit from the existing ATH theme if they say "use my usual."
8. **"Your contact info?"** — the person the client should reply to.

---

## Build the page

1. **Slug:** `<client>-proposal`, e.g., `acme-proposal`, `smith-engagement`.
2. **Hash:** 8 hex chars via `python -c "import secrets; print(secrets.token_hex(4))"`
3. **Copy:**
   ```bash
   cp -r _templates/proposal <slug>-<hash>
   ```
4. **Customize:**
   - SEO meta tags
   - Brand CSS variables
   - Header: proposal title, date, prepared for, prepared by
   - Problem section — the client's pain, framed in their language
   - Solution section — what you're proposing, bullet points
   - Scope of work — specific deliverables, typically a table or bulleted list with owner + outcome
   - Pricing table — line items with SP count, SP rate, and total. Or fixed price. Or hourly range.
   - Timeline — phases with target dates
   - Terms — brief (payment schedule, revision policy, cancellation). Not legal boilerplate — save that for the contract.
   - CTA — the specific next step
   - Footer with your contact info

5. **Pricing format (if using story points):**

   | Item | SP | Rate | Subtotal |
   |------|-----|------|----------|
   | Discovery + kickoff | 3 | $300 | $900 |
   | Phase 1: build | 13 | $300 | $3,900 |
   | Phase 2: launch | 5 | $300 | $1,500 |
   | **Total** | **21** | — | **$6,300** |

6. **Print mode** — proposals are sometimes printed or saved as PDF for internal client review. Wider margins, 11pt body in print. The template handles this but verify it still works after your edits.

---

## Mandatory checks before deploying

- [ ] Client name and contact name correct (no placeholders)
- [ ] Pricing math adds up (sum the subtotals)
- [ ] All dates are real, not `YYYY-MM-DD`
- [ ] Brand color set
- [ ] SEO meta tags filled
- [ ] Print preview fits reasonably (proposals can span multiple pages, but check)
- [ ] Mobile (375px) readable at 16px+
- [ ] Tablet (768px), desktop (1024px), wide (1440px) all render cleanly
- [ ] CTA is specific and actionable

---

## Preview

> **Preview: Acme Robotics — Proposal**
>
> - **Slug:** `acme-proposal-a1b2c3d4`
> - **Brand:** indigo (#4f46e5)
> - **Scope:** Discovery (3 SP) + Build (13 SP) + Launch (5 SP) = 21 SP total
> - **Pricing:** $6,300 flat or $300/SP
> - **Timeline:** 4 weeks, 3 phases, starting [date]
> - **CTA:** "Sign and return, or book a kickoff call"
>
> Publish to Netlify now? (yes / no / changes)

---

## Deploy

```bash
netlify deploy --prod --dir=. --functions=netlify/functions
```

Return the live URL + a tracked link (`?ref=<client-contact>`) so the user knows when the client opens it.

---

## Note: real contracts use the contract-builder tool

This skill builds **proposals**, which are sales documents. Real legal contracts, SOWs, NDAs, and IP addendums should be generated via the contract-builder tool (`contract.ath.how`), not this skill. If the user asks for a contract, tell them: "Proposals I can do. For the actual contract, use contract.ath.how — it has legal templates, signable versions, and proper storage."
