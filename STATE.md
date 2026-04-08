# Session State

**Last Updated:** 2026-04-08

Cross-session memory. This file persists decisions, blockers, and context that shouldn't be lost between conversations.

---

## Active Decisions

| Date | Decision | Context |
|------|----------|---------|
| 2026-04-08 | **Fork-first flow for Cowork users**, not clone-only | Pages live in three places (Netlify, Cowork VM, GitHub fork). Any one can fail and the user is fine. Clone-only would lose pages on VM corruption (known Windows Cowork bug). |
| 2026-04-08 | GitHub auth via `GITHUB_TOKEN` env var + `~/.git-credentials` helper | Same OAuth-in-VM friction as Netlify. PAT with `repo` scope pasted once into env vars + git credential helper. Sidesteps device-code flow. |
| 2026-04-08 | `publish-page` skill commits and pushes after every deploy | Best-effort backup. Failure is a warning in the report, not a hard publish failure. Wrong-repo (cloned upstream instead of fork) is a hard pre-flight stop. |
| 2026-04-08 | Custom domain section added to `COWORK_SETUP.md` | Non-devs need real domains for client work. Walks through Cloudflare/Namecheap, CNAME records, subdomain vs apex, gotchas. Cloudflare DNS recommended for stable pricing + reliability. |
| 2026-04-08 | Two-path framing in `README.md`: developer (`SETUP.md`) vs non-developer (`COWORK_SETUP.md`) | Same templates, same design system, same infra. Different onboarding for different audiences. Both paths first-class. |
| 2026-04-07 | Add first-class Claude Cowork support | Cowork runs a persistent Linux VM with shell + npm + git; a non-dev user can clone this repo, paste a Netlify PAT, and have Cowork build + deploy pages autonomously. `CLAUDE.md` + `.claude/skills/` carry the design system and publish workflow. |
| 2026-04-07 | Netlify auth via `NETLIFY_AUTH_TOKEN` env var, not `netlify login` | Browser OAuth flows are broken inside Cowork's VM (same devcontainer port-forwarding issue). Personal Access Token pasted once is the clean workaround. |
| 2026-04-07 | Survey template shipped | One-question-per-screen intake form with conditional branching, contact capture, Netlify Blobs storage, Slack/Teams notifications. Generic `submission.mjs` backend so any survey form reuses the same function. |
| 2026-03-16 | Dual platform support (Netlify + Cloudflare) | Templates are platform-agnostic; infrastructure code provided for both |
| 2026-03-16 | Self-contained HTML, no framework | Each page is one file with inline CSS/JS -- no build step, no dependencies |
| 2026-03-16 | Hash URLs for access control | 8-char hex (32-bit) for general pages, 16-char (128-bit) for sensitive docs |
| 2026-03-16 | Server-synced checklists via Blobs/KV | Cross-device persistence, not just localStorage |
| 2026-03-16 | Edge-function view tracking | Zero-latency tracking with Slack alerts on first view per ref |

---

## Current Blockers

| Blocker | Status | Notes |
|---------|--------|-------|
| None | - | Cowork integration in progress; no hard blockers |

---

## Phase Status

**Total:** 32 SP | **Progress:** 90% (Phase 1, 1.5, and most of Phase 2 complete; only end-to-end Cowork test remaining for Phase 2)

| Phase | Status | Notes |
|-------|--------|-------|
| 1. Initial Release | Complete | 7 templates, 3 examples, dual-platform infra, docs |
| 1.5 Survey Tool | Complete | Survey template + generic submission function + Slack/Teams notifications |
| 2. Cowork Integration | Nearly Complete | Fork-first flow shipped; only end-to-end test in real Cowork session remains. CLAUDE.md, COWORK_SETUP.md, 6 skills, fork+token auth, custom domain guide, README two-path framing all done. |
| 3. Community Refinement | Not Started | Feedback-driven improvements |
| 4. Advanced Patterns | Not Started | Multi-tenant, analytics dashboard, A/B testing |

---

## Today's Session (2026-04-07 / 2026-04-08)

**Focus:** Ship survey tool, add Claude Cowork support, fork-first backup flow

**Completed (2026-04-07):**

- Added `_templates/survey/` — one-question-per-screen intake form with conditional branching, contact capture, progress bar, mobile-first
- Added `netlify/functions/submission.mjs` — generic form submission backend with Blobs storage + Slack + Teams notifications
- Updated `TEMPLATES.md` with survey entry in the catalog
- Wrote `CLAUDE.md` with design system, four-breakpoint responsive rules, separate screen vs print typography scales, SEO meta tag block, em-dash rules, publish workflow, guardrails
- Wrote initial `COWORK_SETUP.md` (Netlify PAT path)
- Wrote 6 skills under `.claude/skills/`: `new-one-pager`, `new-landing`, `new-proposal`, `new-survey`, `publish-page`, `list-my-pages`
- Updated `STATE.md` and `ROADMAP.md` with Phase 1.5 (Survey) complete and Phase 2 (Cowork) in progress

**Completed (2026-04-08):**

- Reframed Cowork flow as **fork-first**, not clone-only — pages now have GitHub backup
- Added Step 1 (fork on GitHub) and Step 2 (GitHub PAT) to `COWORK_SETUP.md`
- Added Step 5 combining both tokens + git config + credential helper setup so `git push` works inside the VM
- Added "Why fork, not just clone?" intro section explaining backup model in plain language
- Added full **"Using a custom domain"** section: subdomain vs apex, DNS records, registrar walkthrough, Cloudflare DNS recommendation, common gotchas table
- Updated `publish-page` skill: pre-flight check for `git remote -v` to catch wrong-repo clones, best-effort `git add/commit/push` after deploy, two report formats (success vs degraded), troubleshooting table for git failures
- Updated `CLAUDE.md` publish workflow from 6 steps to 8 steps including fork verification and git push backup
- Updated `README.md`: added Claude Cowork to TL;DR, added "Using Claude Cowork" section, added survey to Page Types, added fork-first to repo tree, added two-path Setup framing, updated AI generation pattern with both Claude Code and Cowork variants
- Saved memory `project_astra_pages_location.md` so future sessions don't conflate Astra (SeleneP2C/share, Cloudflare) with Jeff's consulting (jpk-how, Netlify)

**Decisions Made:**

- **Fork-first** is the right default. Clone-only loses pages on VM corruption. Three-place storage (live site + VM + GitHub fork) is the right backup model.
- **GitHub PAT + credential helper** is the auth pattern. Same shape as Netlify PAT. Sidesteps OAuth-in-VM brokenness.
- **Best-effort git push** — failure is a warning in the publish report, not a hard publish failure. Page is already live; backup gap is recoverable.
- **Two-path framing in README**: developer (`SETUP.md`) and non-developer (`COWORK_SETUP.md`) are both first-class. Same templates, same infra, different onboarding.
- **Custom domains in COWORK_SETUP.md** because non-devs need real domains for client work. Cloudflare DNS recommended for stable pricing.

**Next Steps:**

- Test end-to-end in a fresh Cowork session: fork the public repo, paste both tokens, clone fork, run `/new-one-pager`, verify deploy + git push
- Capture any friction and fix in `COWORK_SETUP.md` and the skills
- Commit all hash-pages changes (currently in working tree, not yet committed)
- Share with first non-dev user (Jeff is testing now per session context)

---

## Pending Alignment

| Topic | Options | Status |
|-------|---------|--------|
| Template contribution workflow | PRs vs forks | Decide after first users try it |
| CI/CD for examples | Auto-deploy examples to demo site vs local-only | Future consideration |
| Cowork: shared Netlify site vs per-user site | One site with folder-per-user vs each user runs their own site | Default to per-user for v1 (simpler auth model) |

---

## Key Files

| Purpose | Location |
|---------|----------|
| Roadmap | `ROADMAP.md` |
| Architecture decisions | `docs/adr/` |
| Templates | `_templates/` |
| Working examples | `examples/` |
| Netlify infrastructure | `netlify/` |
| Cloudflare infrastructure | `cloudflare/` |
| Setup guide (developer) | `SETUP.md` |
| Setup guide (Claude Cowork) | `COWORK_SETUP.md` |
| Cowork instructions for Claude | `CLAUDE.md` |
| Cowork slash commands | `.claude/skills/` |
| Template catalog | `TEMPLATES.md` |
| Generic submission backend | `netlify/functions/submission.mjs` |
