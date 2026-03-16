# ADR-0104: Pre-Merge Audit Protocol

- **Status:** Accepted
- **Date:** {{DATE}}
- **Authors:** {{AUTHOR}}, Claude Code
- **Priority:** High - Security and quality assurance

---

## Context

During development, branches may be created from mobile Claude Code sessions, feature development, or parallel work streams. Without a standardized security and quality audit, merges could introduce vulnerabilities, regressions, or code quality issues.

**Problem:** No standardized pre-merge checklist exists for validating branch safety before merging to main.

## Decision

**ALL merges from feature branches to main MUST run a comprehensive Pre-Merge Audit Protocol before approval.**

This protocol is MANDATORY for:

- Mobile Claude Code branches (`claude/*`)
- Feature branches (`feature/*`)
- Any external contributions
- Branches with significant changes (>500 lines or >10 files)

## Pre-Merge Audit Checklist

### 1. Security Checks

| Check | Method | Pass Criteria |
|-------|--------|---------------|
| **Authentication** | Code review | Protected routes require auth |
| **Authorization** | Code review | Data scoped to user/org |
| **Input Validation** | Code review | All inputs validated |
| **Secrets** | `grep -r "API_KEY\|SECRET\|PASSWORD"` | No hardcoded credentials |
| **XSS Prevention** | Code review | User input escaped |
| **SQL Injection** | Code review | Parameterized queries |

### 2. System Checks

```bash
# Run linters (adjust for your stack)
npm run lint          # Node.js
python -m flake8      # Python
cargo clippy          # Rust

# Run type checks
npm run typecheck     # TypeScript
python -m mypy .      # Python

# Run tests
npm test              # Node.js
pytest                # Python
cargo test            # Rust
```

### 3. Code Quality Checks

- **Naming**: Clear, descriptive names
- **DRY**: No duplicate code
- **Comments**: Adequate documentation
- **Error Handling**: Proper try/catch for external calls
- **Imports**: Organized and minimal

### 4. Change Summary

```bash
# Get diff stats
git diff main...[branch] --stat

# Document:
# - Commits ahead of main
# - Files changed
# - Lines added/removed
```

## Audit Report Template

Every merge commit message MUST include this audit summary:

```markdown
## PRE-MERGE AUDIT REPORT
**Branch**: [branch-name] -> main
**Date**: [YYYY-MM-DD]
**Auditor**: [Claude Desktop/Mobile/Human]

### CHANGE SUMMARY
- Commits: X commits ahead of main
- Files Changed: Y files
- Lines: +A / -B

### SECURITY CHECKS (X/6 PASSED)
- [ ] Authentication
- [ ] Authorization
- [ ] Input Validation
- [ ] No Hardcoded Secrets
- [ ] XSS Prevention
- [ ] SQL Injection Prevention

### CODE QUALITY
- Linting: PASS/FAIL
- Tests: PASS/FAIL
- Type Check: PASS/FAIL

### FINAL VERDICT: [APPROVED/REJECTED]
**Recommendation**: [MERGE/HOLD/REJECT]
```

## Consequences

### Positive

1. **Prevents security vulnerabilities** from reaching production
2. **Catches regressions** early
3. **Improves code quality** consistency
4. **Documents merge rationale** for future reference
5. **Builds confidence** in merge safety

### Negative

1. **Adds 10-15 minutes** to merge process
2. **Requires discipline** to follow checklist every time

## Implementation Phases

### Phase 1: Manual Checklist (Immediate)

- Run checklist before merging any branch
- Include audit report in merge commit message

### Phase 2: Automated Checks (Future)

- Add GitHub Actions workflow
- Run security scans automatically
- Block merge if critical issues found

## Related

- ADR-0100: Claude Code AI Collaboration
- ADR-0106: Root Cause Analysis Protocol

---

**Author:** {{AUTHOR}}
**Last Updated:** {{DATE}}
