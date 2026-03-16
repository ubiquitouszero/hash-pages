# ADR-0102: Story Points Velocity Tracking

- **Status:** Accepted
- **Date:** {{DATE}}
- **Authors:** {{AUTHOR}}, Claude Code
- **Related:** ADR-0100 (Claude Code AI Collaboration)

---

## Context

### The Problem

**Activity ≠ Productivity.** Tracking commits-per-day or hours creates perverse incentives:
- Developers make small, frequent commits to inflate velocity
- Large refactors get split into artificial chunks
- Code quality suffers when optimizing for commit count
- Can't compare "this feature" to "similar historical features"

**Why Story Points:**
1. **Accurate estimation**: Predict how long tasks will take
2. **Velocity tracking**: Measure actual output, not activity
3. **Risk mitigation**: Data-driven estimates protect timelines
4. **Cross-feature comparison**: "Feature X is similar to Feature Y"

---

## Decision

**Use story points (1, 2, 3, 5, 8) as the primary unit for measuring task complexity.**

### What Story Points Measure

- **Complexity** (technical difficulty)
- **Scope** (amount of work)
- **Uncertainty** (unknowns, research needed)
- **Risk** (potential for issues)

Story points are **independent of**:
- Who's doing the work
- How many commits it takes
- How long it takes (AI acceleration doesn't change complexity)

### Story Point Scale

| SP | Category | Example |
|----|----------|---------|
| 1 | Trivial | Fix typo, update constant, simple config change |
| 2 | Small | Add simple component, single API endpoint |
| 3 | Medium | New UI component with state, API endpoint with validation |
| 5 | Large | New page/feature, auth flow, complex integration |
| 8 | Very Large | Major feature, architectural refactor, multi-system change |

**Rule:** If estimate is >8, break the task down into smaller pieces.

### Four-Factor Assessment

When estimating, consider each factor (1-5 scale):

1. **Complexity**: How hard is the logic? Edge cases? Domain knowledge?
2. **Scope**: How many files? Components? Lines of code?
3. **Uncertainty**: How well understood? Research needed? Dependencies?
4. **Risk**: Complications likely? Testing required? Rework probable?

**Composite Score:**

```text
Average = (Complexity + Scope + Uncertainty + Risk) / 4

1.0 - 1.5 → 1 SP
1.5 - 2.5 → 2 SP
2.5 - 3.5 → 3 SP
3.5 - 4.5 → 5 SP
4.5+      → 8 SP (or break it down)
```

---

## Implementation

### Session Tracking

Track story points per session in `docs/sessions/`:

```markdown
# Session XXXX - [Description]

**Date:** YYYY-MM-DD
**Story Points:** X SP

## Work Completed

### Task 1 (3 SP)
- What was done
- Files changed

### Task 2 (2 SP)
- What was done
```

### Velocity Calculation

Track in `STATE.md` or session summaries:

```markdown
## Velocity

| Week | Sessions | SP | Avg SP/Session |
|------|----------|-----|----------------|
| W1 | 5 | 32 | 6.4 |
| W2 | 4 | 28 | 7.0 |
```

### What Counts as Story Points

**Include:**

- Feature development
- Bug fixes
- Architecture research and ADRs
- UX/UI design iterations
- Documentation
- Planning and backlog grooming

**Don't count separately:**

- Meetings (unless producing deliverables)
- Pure communication
- Waiting time

---

## Consequences

### Positive

1. **Accurate planning** - Can estimate completion with confidence
2. **Cross-feature comparison** - Meaningful complexity comparisons
3. **Prevents gaming** - Can't inflate story points like commits
4. **Reveals hidden work** - Architecture, research, docs all visible

### Negative

1. **Learning curve** - Takes 5-10 tasks to calibrate
2. **Estimation overhead** - Time spent estimating

### Mitigations

- Start with rough estimates, refine over time
- Review estimates retrospectively to calibrate
- Use reference tasks: "This is like Task X which was 5 SP"

---

## Related

- ADR-0100: Claude Code AI Collaboration
- ADR-0101: Project Tracking with ROADMAP.md
- `templates/docs/session-template.md`

---

**Author:** {{AUTHOR}}
**Last Updated:** {{DATE}}
