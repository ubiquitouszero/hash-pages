# Roadmap: Hash Pages

## Overview

A template system for private, shareable, trackable single-file pages. Hash URL access control, server-synced checklists, view tracking with Slack alerts, print-first design. No auth, no CMS, no build step.

## Milestones

- [x] **v1.0 Initial Release** - Phase 1
- [x] **v1.1 Survey Tool** - Phase 1.5
- [ ] **v1.2 Claude Cowork Support** - Phase 2
- [ ] **v1.3 Refinement** - Phase 3
- [ ] **v2.0 Advanced Patterns** - Phase 4

---

## MVP Acceptance Criteria

The repo is **NOT complete** until a new user can go from fork to deployed page without asking the author for help.

### AC1: First-Time Developer Flow

As a **developer who just forked this repo**, I should be able to:

| Step | Status | Gap |
|------|--------|-----|
| Fork and clone the repo | Done | - |
| Follow SETUP.md to deploy on Netlify | Done | - |
| Create a new page from a template | Done | Templates + instructions in TEMPLATES.md |
| Deploy and share a tracked link | Done | Share tool + view tracking included |
| See view stats when someone opens the link | Done | Views function + Slack alerts |
| Use server-synced checklists | Done | Checklist function + inline script |
| Collect survey submissions with notifications | Done | Survey template + generic submission function |

### AC2: Non-Technical Recipient Flow

As a **person who receives a hash page link**, I should be able to:

| Step | Status | Gap |
|------|--------|-----|
| Open the link on any device | Done | Mobile-responsive, no login |
| Read the content without friction | Done | No auth wall, instant load |
| Print or save as PDF | Done | Print styles on all templates |
| Check/uncheck action items | Done | Server-synced checklists |
| Answer a survey without creating an account | Done | Survey template, one-question-per-screen |
| View in dark mode | Done | Auto-detects OS preference |

### AC3: Claude Cowork User Flow (NEW)

As a **non-developer using Claude Cowork**, I should be able to:

| Step | Status | Gap |
|------|--------|-----|
| Install Claude desktop and enable Cowork | Done (external) | One-time install per machine |
| Generate a Netlify Personal Access Token | To do | Screenshot walkthrough in COWORK_SETUP.md |
| Paste the token into Cowork as `NETLIFY_AUTH_TOKEN` | To do | Instructions in COWORK_SETUP.md |
| Clone this public repo in the Cowork VM | To do | Single command, doc in COWORK_SETUP.md |
| Run `/new-one-pager` and answer Claude's questions | To do | Skill at `.claude/skills/new-one-pager/` |
| Have Claude build and deploy the page automatically | To do | `/publish-page` skill wraps `netlify deploy` |
| Share the resulting URL with a recipient | To do | Returned by publish skill |
| Iterate on the page by describing changes | To do | Cowork edits the HTML in place, re-deploys |

---

## Phases

### Phase 1: Initial Release
**Goal**: Shareable repo with templates, infrastructure, docs, and working examples
**Depends on**: Nothing
**Story Points**: 18 SP
**Success Criteria**:
  1. 7 template types covering the key use cases
  2. Infrastructure for both Netlify and Cloudflare
  3. README explains every architectural decision
  4. Working examples demonstrate each template type
  5. No personal data, tokens, or client content in the repo
**Status**: Complete

Plans:

- [x] 01-01: Explore both production site architectures (Netlify + Cloudflare)
- [x] 01-02: Write README.md with philosophy and decision rationale
- [x] 01-03: Write SETUP.md for Netlify and Cloudflare
- [x] 01-04: Port and clean Netlify functions (checklist, views, share, track-views)
- [x] 01-05: Port and clean Cloudflare functions (middleware, views, share, checklist worker)
- [x] 01-06: Create 7 starter templates
- [x] 01-07: Create 3 working examples (calculator, one-pager, proposal)
- [x] 01-08: Write TEMPLATES.md catalog
- [x] 01-09: Create public GitHub repo, push

### Phase 1.5: Survey Tool
**Goal**: Ship a reusable survey/intake form template with a generic submission backend
**Depends on**: Phase 1
**Story Points**: 5 SP
**Success Criteria**:
  1. One-question-per-screen survey template with conditional branching
  2. Contact / lead-capture step
  3. Generic `submission.mjs` function (any form can reuse it)
  4. Slack and Teams notifications on new submission
  5. Submissions persisted in Netlify Blobs
**Status**: Complete

Plans:

- [x] 1.5-01: Build `_templates/survey/` with progress bar, branching, contact step
- [x] 1.5-02: Ship generic `netlify/functions/submission.mjs`
- [x] 1.5-03: Add Slack and Teams notification paths with optional env vars
- [x] 1.5-04: Update `TEMPLATES.md` with survey entry

### Phase 2: Claude Cowork Support (NEW)
**Goal**: A non-developer using Claude Cowork can publish hash pages end-to-end with GitHub fork backup
**Depends on**: Phase 1
**Story Points**: 11 SP (was 9 SP — +2 for fork-first flow and custom domain section)
**Success Criteria**:
  1. `COWORK_SETUP.md` walks a first-time user from zero to first deploy in under 10 minutes
  2. Netlify auth works via `NETLIFY_AUTH_TOKEN` env var (no broken browser OAuth)
  3. GitHub auth works via `GITHUB_TOKEN` env var + git credential helper (no broken OAuth flow)
  4. `CLAUDE.md` loads the design system, publish flow, and guardrails for Cowork
  5. Slash commands available for every page type: `/new-one-pager`, `/new-proposal`, `/new-landing`, `/new-survey`, `/publish-page`, `/list-my-pages`
  6. Cowork generates a fresh page, runs the `netlify deploy --prod` command, AND commits + pushes to the user's GitHub fork as backup
  7. Failed git push is a warning, not a hard publish failure
  8. Custom domain setup documented for non-devs (subdomain + apex + DNS gotchas)
  9. README presents two onboarding paths (developer + non-developer) as equally first-class
  10. End-to-end tested with a fresh Cowork session against the public repo
**Status**: Nearly Complete (only 02-09 — end-to-end test — remaining)

Plans:

- [x] 02-01: Write `CLAUDE.md` with design system, publish workflow, and Cowork-mode guardrails (8-step publish workflow including fork verification + git backup)
- [x] 02-02: Write `COWORK_SETUP.md` onboarding guide (fork, GitHub PAT, Netlify PAT, clone fork, first deploy, custom domain, troubleshooting)
- [x] 02-03: Create `.claude/skills/new-one-pager/SKILL.md` — interview flow + template anchors + screen-vs-print typography rules
- [x] 02-04: Create `.claude/skills/new-proposal/SKILL.md`
- [x] 02-05: Create `.claude/skills/new-landing/SKILL.md`
- [x] 02-06: Create `.claude/skills/new-survey/SKILL.md`
- [x] 02-07: Create `.claude/skills/publish-page/SKILL.md` — pre-flight checks + `netlify deploy` + best-effort `git push` backup + degraded report format
- [x] 02-08: Create `.claude/skills/list-my-pages/SKILL.md`
- [x] 02-08a: Add fork-first flow to `COWORK_SETUP.md` (Step 1 fork, Step 2 GitHub PAT, Step 5 dual-token + git credential helper)
- [x] 02-08b: Add "Using a custom domain" section to `COWORK_SETUP.md` with Cloudflare DNS recommendation and gotchas table
- [x] 02-08c: Update `README.md` with two-path setup framing, Cowork section, survey in page types, fork-first repo tree
- [ ] 02-09: Test end-to-end in a fresh Cowork session; fix any friction
- [x] 02-10: Document known gotchas (Windows admin requirement, Apple Silicon requirement, OAuth-in-VM brokenness, wrong-repo-cloned diagnosis)

### Phase 3: Refinement
**Goal**: Improve based on first-user feedback, add missing template types
**Depends on**: Phase 2 + feedback from initial users
**Story Points**: ~8 SP (estimated)
**Success Criteria**:
  1. First 3 users (including at least one non-developer on Cowork) can deploy without help
  2. Any setup friction is documented or fixed
  3. Missing template types added based on demand
**Status**: Not Started

Plans:

- [ ] 03-01: Collect feedback from first 3 users
- [ ] 03-02: Fix any setup friction (unclear steps, missing docs)
- [ ] 03-03: Add template types requested by users (feature index, release notes, status update)
- [ ] 03-04: Consider auto-deploy for examples/ to a demo site

### Phase 4: Advanced Patterns
**Goal**: Patterns for power users — multi-tenant, analytics, A/B testing
**Depends on**: Phase 3
**Story Points**: ~13 SP (estimated)
**Success Criteria**:
  1. Multi-domain support documented (one repo, multiple sites)
  2. Analytics dashboard template (aggregate view stats across all pages)
  3. A/B variant pattern (same page, different content per ref)
**Status**: Not Started

Plans:

- [ ] 04-01: Document multi-domain pattern (Netlify site per domain, shared templates)
- [ ] 04-02: Build analytics dashboard page (reads from views API)
- [ ] 04-03: Document A/B testing pattern (ref-based content switching)
- [ ] 04-04: Add grocery/app template (mobile-first, dark-mode-default)
- [ ] 04-05: Survey submissions dashboard (reads from submissions blobs)

---

## Progress

| Phase | SP | Status | Completed |
|-------|-----|--------|-----------|
| 1. Initial Release | 18 | Complete | 2026-03-16 |
| 1.5 Survey Tool | 5 | Complete | 2026-04-07 |
| 2. Cowork Support | 11 | Nearly Complete (10/11 plans done; e2e test remaining) | - |
| 3. Refinement | ~8 | Not Started | - |
| 4. Advanced Patterns | ~13 | Not Started | - |
| **Total** | **~55** | **62%** | - |

---

## Risk Register

| Risk | Phase | Mitigation |
|------|-------|------------|
| Netlify Blobs API changes | 1-4 | Pin `@netlify/blobs` version, test on upgrade |
| Cloudflare KV pricing changes | 1-4 | Free tier is generous; monitor usage |
| Users can't set up Slack integration | 3 | Make Slack optional (it already is), improve docs |
| Template sprawl (too many types) | 3-4 | Keep templates opinionated, not comprehensive |
| Hash collisions at scale | 4 | 8-char hex = 4B possibilities per name; use 16-char for high-volume sites |
| Cowork VM instability on Windows | 2 | Document known `sessiondata.vhdx` issue; recommend macOS Apple Silicon as primary target |
| Netlify CLI browser OAuth broken in Cowork VM | 2 | Use `NETLIFY_AUTH_TOKEN` env var (Personal Access Token) instead of `netlify login` |
| Cowork unavailable for Intel Macs or non-admin Windows users | 2 | Document the requirement clearly; fallback is using Claude Code directly |
| Skill files drift from templates | 2-3 | Skills reference template paths; include a lint step that verifies every skill's template anchor exists |
