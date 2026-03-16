# ADR-0100: Claude Code AI Collaboration Contract

- **Status:** Accepted
- **Date:** {{DATE}}
- **Authors:** {{AUTHOR}}, Claude Code

---

## Context

Using Claude Code as the primary development environment with direct file access, tool execution, and git integration requires establishing clear collaboration patterns.

**Problem:** Without documented patterns, AI assistance becomes inconsistent and context is lost between sessions.

## Decision

Adopt the following **Claude Code Collaboration Contract** for AI-assisted development.

---

## Core Principles

### 1. Repository-Driven Development

**All project management, documentation, and planning live in the repository.**

| Document | Location | Purpose |
|----------|----------|---------|
| ADRs | `docs/architecture-decisions/` | Immutable architectural decisions |
| Roadmap | `ROADMAP.md` | Phase breakdown, acceptance criteria |
| State | `STATE.md` | Cross-session memory (decisions, blockers) |
| Sessions | `docs/sessions/` | What was built, story points |
| RCAs | `docs/root-cause-analysis/` | Incident analysis and prevention |
| Runbooks | `docs/runbooks/` | Operational troubleshooting |

**Why:** Keeps all context accessible to AI, enables git-based change tracking, eliminates tool-switching overhead.

### 2. Operating Mode

**Core principle: Protect context.**

**Task clarity check:** Is this clear enough to execute with acceptance criteria?

| Situation | Response |
|-----------|----------|
| Clear task | Execute with TodoWrite tracking |
| Unknown approach | Subagent explores, returns findings |
| Don't care how | Claude picks approach, executes |
| Complex (4+ files) | Plan mode first |
| "Let me check..." | Subagent immediately |
| Context > 50% | Warn, suggest /compact |
| Stuck/thrashing | Stop, re-plan |

### 3. Session Workflow

**Start of session:**

1. Read `STATE.md` for blockers, decisions, context
2. Read `ROADMAP.md` for current phase
3. Check recent commits for state

**End of session:**

1. Update `STATE.md` with decisions made, blockers hit
2. Update `ROADMAP.md` progress
3. Commit all work
4. Document session if significant (>3 SP)

---

## File Operations

| Task | Tool | NOT |
|------|------|-----|
| View file | `Read` | `cat`, `head`, `tail` |
| Edit file | `Edit` | `sed`, `awk` |
| Create file | `Write` | `echo >`, heredoc |
| Find files | `Glob` | `find`, `ls` |
| Search content | `Grep` | `grep`, `rg` |

**Rule:** Always `Read` a file before `Edit` or `Write`.

---

## Git Workflow

### Commits

- Meaningful messages: WHAT changed and WHY
- Format: `{type}({scope}): {description}`
- Types: `feat`, `fix`, `docs`, `refactor`, `test`, `chore`
- Include co-author footer:

  ```text
  Co-Authored-By: Claude <noreply@anthropic.com>
  ```

### What NOT to commit

- `.env` files
- Local databases (`*.sqlite3`)
- `.claude/settings.local.json`
- `node_modules/`, `__pycache__/`
- Credentials, API keys, secrets

---

## Quality Gates

| Gate | When | Action |
|------|------|--------|
| Pre-PR review | Before merging | "Grill me on these changes" |
| After corrections | Mistake identified | Update CLAUDE.md to prevent repeat |
| High-stakes plan | Architecture changes | Second Claude reviews as staff engineer |
| Mediocre solution | Shipped but not great | "Scrap and implement elegant solution" |

---

## Operating Rules

### DO

1. ✅ Read existing code before making changes
2. ✅ Use TodoWrite for multi-step tasks
3. ✅ Commit frequently (every 30-60 min during active work)
4. ✅ Update STATE.md with decisions and blockers
5. ✅ Use subagents for exploration/research
6. ✅ Be concise, direct, helpful
7. ✅ Warn when context is filling up

### DON'T

1. ❌ Start coding without understanding existing implementation
2. ❌ Commit secrets, credentials, or local config
3. ❌ Use bash for file operations (use Read/Edit/Write)
4. ❌ Make breaking changes without user confirmation
5. ❌ Leave todos in `in_progress` state indefinitely
6. ❌ Work for 3+ hours without committing
7. ❌ Burn context iterating when stuck (re-plan instead)

---

## Consequences

### Positive

- Repository is single source of truth
- AI has full context for every decision
- Git history shows reasoning behind changes
- No external tool dependencies
- Easy onboarding (just clone repo)

### Negative

- Requires discipline to keep docs updated
- Non-technical stakeholders need training for git/markdown
- Large doc files may become unwieldy

### Mitigations

- Establish documentation habits (session end ritual)
- Create summaries for stakeholders
- Split large docs by topic/date

---

## Related

- ADR-0101: Project Tracking with ROADMAP.md
- ADR-0102: Story Points Velocity Tracking
- `CLAUDE.md` template
- `STATE.md` template
- `ROADMAP.md` template

---

**Author:** {{AUTHOR}}
**Last Updated:** {{DATE}}
