# Roadmap: Hash Pages

## Overview

A template system for private, shareable, trackable single-file pages. Hash URL access control, server-synced checklists, view tracking with Slack alerts, print-first design. No auth, no CMS, no build step.

## Milestones

- [x] **v1.0 Initial Release** - Phase 1
- [ ] **v1.1 Refinement** - Phase 2
- [ ] **v2.0 Advanced Patterns** - Phase 3

---

## MVP Acceptance Criteria

The repo is **NOT complete** until a new user can go from fork to deployed page without asking the author for help.

### AC1: First-Time User Flow

As a **developer who just forked this repo**, I should be able to:

| Step | Status | Gap |
|------|--------|-----|
| Fork and clone the repo | Done | - |
| Follow SETUP.md to deploy on Netlify | Done | - |
| Create a new page from a template | Done | Templates + instructions in TEMPLATES.md |
| Deploy and share a tracked link | Done | Share tool + view tracking included |
| See view stats when someone opens the link | Done | Views function + Slack alerts |
| Use server-synced checklists | Done | Checklist function + inline script |

### AC2: Non-Technical Recipient Flow

As a **person who receives a hash page link**, I should be able to:

| Step | Status | Gap |
|------|--------|-----|
| Open the link on any device | Done | Mobile-responsive, no login |
| Read the content without friction | Done | No auth wall, instant load |
| Print or save as PDF | Done | Print styles on all templates |
| Check/uncheck action items | Done | Server-synced checklists |
| View in dark mode | Done | Auto-detects OS preference |

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
- [x] 01-09: Create private GitHub repo, push

### Phase 2: Refinement
**Goal**: Improve based on first-user feedback, add missing template types
**Depends on**: Phase 1 + feedback from initial users
**Story Points**: ~8 SP (estimated)
**Success Criteria**:
  1. First 3 users can deploy without help
  2. Any setup friction is documented or fixed
  3. Missing template types added based on demand
**Status**: Not Started

Plans:
- [ ] 02-01: Collect feedback from first 3 users
- [ ] 02-02: Fix any setup friction (unclear steps, missing docs)
- [ ] 02-03: Add template types requested by users (feature index, release notes, status update)
- [ ] 02-04: Add CONTRIBUTING.md if people want to submit templates
- [ ] 02-05: Consider auto-deploy for examples/ to a demo site

### Phase 3: Advanced Patterns
**Goal**: Patterns for power users -- multi-tenant, analytics, A/B testing
**Depends on**: Phase 2
**Story Points**: ~13 SP (estimated)
**Success Criteria**:
  1. Multi-domain support documented (one repo, multiple sites)
  2. Analytics dashboard template (aggregate view stats across all pages)
  3. A/B variant pattern (same page, different content per ref)
**Status**: Not Started

Plans:
- [ ] 03-01: Document multi-domain pattern (Netlify site per domain, shared templates)
- [ ] 03-02: Build analytics dashboard page (reads from views API)
- [ ] 03-03: Document A/B testing pattern (ref-based content switching)
- [ ] 03-04: Add grocery/app template (mobile-first, dark-mode-default)
- [ ] 03-05: Add survey/form template with serverless backend

---

## Progress

| Phase | SP | Status | Completed |
|-------|-----|--------|-----------|
| 1. Initial Release | 18 | Complete | 2026-03-16 |
| 2. Refinement | ~8 | Not Started | - |
| 3. Advanced Patterns | ~13 | Not Started | - |
| **Total** | **~39** | **46%** | - |

---

## Risk Register

| Risk | Phase | Mitigation |
|------|-------|------------|
| Netlify Blobs API changes | 1-3 | Pin @netlify/blobs version, test on upgrade |
| Cloudflare KV pricing changes | 1-3 | Free tier is generous; monitor usage |
| Users can't set up Slack integration | 2 | Make Slack optional (it already is), improve docs |
| Template sprawl (too many types) | 2-3 | Keep templates opinionated, not comprehensive |
| Hash collisions at scale | 3 | 8-char hex = 4B possibilities per name; use 16-char for high-volume sites |
