# ADR-0101: Project Tracking with ROADMAP.md

- **Status:** Accepted
- **Date:** {{DATE}}
- **Authors:** {{AUTHOR}}, Claude Code
- **Related:** ADR-0100 (Claude Code AI Collaboration)

---

## Context

When building at high velocity with AI assistance, traditional project management tools become bottlenecks:

**The Problem:**
> "Commits ≠ completion. This is the activity ≠ results problem. Results are completion of goals with acceptance criteria."

**Options Considered:**

- **Notion** - Manual admin, not AI-friendly, no velocity tracking
- **Jira** - Heavy admin, sprint-focused, manual updates
- **Linear** - Better than Jira, still requires manual updates
- **GitHub Projects** - No velocity/burn-up charts
- **backlog-data.json** - Machine-readable but AI prefers markdown

**Requirements:**

- Track **results** (features shipped) not **activity** (commits/hours)
- AI can read/update tracking easily (markdown in git)
- Phase-based progress with acceptance criteria
- Cross-session memory for decisions and blockers
- Zero admin overhead

---

## Decision

**Source of Truth: `ROADMAP.md` + `STATE.md`**

Use markdown files in the repo as the single source of truth for project tracking:

| File | Purpose |
|------|---------|
| **ROADMAP.md** | Phase breakdown, acceptance criteria, progress tracking |
| **STATE.md** | Cross-session memory - decisions, blockers, session log |
| **Signal Dashboard** | Optional visualization (HTML + Chart.js) |

### Why Markdown over JSON

- AI reads/writes markdown more naturally
- Human-readable without parsing
- Git diffs are cleaner
- No schema validation errors
- Works in any project (no tooling dependencies)

### ROADMAP.md Structure

```markdown
# Project Roadmap

## Current Phase: [Phase Name]
**Status:** In Progress | Complete
**Target:** [Date or milestone]

### Acceptance Criteria
- [ ] Criterion 1
- [ ] Criterion 2

### Progress
| Task | SP | Status | Notes |
|------|-----|--------|-------|
| Task 1 | 3 | ✅ Done | |
| Task 2 | 5 | 🔄 In Progress | Blocker: X |

## Phase 2: [Next Phase]
...
```

### STATE.md Structure

```markdown
# Project State

## Active Decisions
| Decision | Date | Rationale |
|----------|------|-----------|
| Use X over Y | 2026-01-15 | Performance reasons |

## Current Blockers
- [ ] Blocker 1 - Owner: @name

## Session Log
| Date | SP | Summary |
|------|-----|---------|
| 2026-01-15 | 8 | Completed auth flow |
```

### AI Workflow

```markdown
# Session Start
1. Read STATE.md for context
2. Read ROADMAP.md for current phase
3. Work on tasks
4. Update progress in ROADMAP.md
5. Log decisions/blockers in STATE.md
6. Commit changes
```

---

## Optional: Signal Dashboard

For visual project tracking, Signal provides:

- Burn-up charts with scope lines
- Velocity tracking
- Task status visualization
- Story point tracking

**Architecture:**

- Reads from `ROADMAP.md` or `backlog-data.json`
- HTML + Chart.js (no framework)
- Can be served from any static host

Signal is **optional** - ROADMAP.md/STATE.md work without it.

---

## Consequences

### Positive

- ✅ AI can manage tracking (no manual admin)
- ✅ Git history provides audit trail
- ✅ Results-focused (acceptance criteria, not commits)
- ✅ Zero context switching (AI works in git repo)
- ✅ Human-readable without special tools
- ✅ Works offline

### Negative

- ⚠️ No real-time collaboration (git-based)
- ⚠️ Manual merge conflicts possible
- ⚠️ No built-in notifications

### Mitigations

- Use atomic commits for tracking updates
- Establish convention: update tracking at session end
- Optional: add CI notification on tracking changes

---

## Why NOT Traditional PM Tools?

| Tool | Problem |
|------|---------|
| **Notion** | Manual UI clicking, no AI integration |
| **Jira** | Heavy admin, sprint-focused, complex API |
| **GitHub Issues** | No velocity tracking, scattered context |
| **Spreadsheets** | No AI integration, manual updates |

**ROADMAP.md:**
- ✅ AI reads/writes directly
- ✅ Zero admin overhead
- ✅ Version controlled
- ✅ Works with any tech stack

---

## Implementation

### Immediate (Day 1)

1. Create `ROADMAP.md` with current phase and tasks
2. Create `STATE.md` with known decisions/blockers
3. Add to CLAUDE.md: "Read STATE.md at session start"

### Short-term (Week 1)

1. Establish session documentation habit
2. Track story points per session
3. Update progress after each work block

### Optional (Future)

1. Deploy Signal dashboard for visualization
2. Add CI notifications on tracking changes
3. Generate weekly status reports from ROADMAP.md

---

## Related

- ADR-0100: Claude Code AI Collaboration
- ADR-0102: Story Points Velocity Tracking
- `templates/ROADMAP.md.template`
- `templates/STATE.md.template`

---

**Author:** {{AUTHOR}}
**Last Updated:** {{DATE}}
