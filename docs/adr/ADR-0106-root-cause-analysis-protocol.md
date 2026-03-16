# ADR-0106: Root Cause Analysis (RCA) Protocol

- **Status:** Accepted
- **Date:** {{DATE}}
- **Authors:** {{AUTHOR}}, Claude Code
- **Priority:** Medium - Process improvement for incident response

---

## Context

Production incidents are inevitable. When they occur, the team needs a systematic approach to:

1. **Understand what happened** - Complete timeline and symptom analysis
2. **Identify root causes** - Not just symptoms, but underlying systemic issues
3. **Prevent recurrence** - Implement effective mitigation strategies
4. **Share learnings** - Document for team knowledge and future reference

### Industry Best Practices

**Five Whys Method** (Toyota Production System):

- Ask "why" five times to drill down from symptom to root cause

**Incident Review Format** (Google SRE):

- What happened (timeline)
- Why it happened (root cause)
- How we fixed it (resolution)
- How we prevent it (mitigation)

**Blameless Postmortems** (Etsy):

- Focus on systems and processes, not individuals
- Learning-focused, not punishment-focused

## Decision

**Implement a standardized Root Cause Analysis (RCA) protocol for all production incidents.**

### Incident Classification

**Severity Levels:**

- **Critical** - Production down, data loss, security breach
- **High** - Feature broken, significant user impact
- **Medium** - Minor feature issue, limited user impact
- **Low** - Cosmetic issue, no user impact

**Trigger Criteria:**

- **Always** perform RCA for Critical and High severity incidents
- **Optional** for Medium and Low (at team's discretion)

### RCA Document Template

```markdown
# RCA: [Brief Incident Title]

**Date**: YYYY-MM-DD
**Severity**: Critical/High/Medium/Low
**Duration**: X minutes/hours
**Impact**: [User-facing impact description]
**Status**: Draft/Under Review/Completed

## Executive Summary
[2-3 sentence summary of what happened and resolution]

## Timeline
[Chronological sequence of events with timestamps]

## Symptoms
[What users/systems experienced]

## Root Cause Analysis

### Immediate Cause
[Direct technical cause]

### Contributing Factors
[Environmental/process factors]

### Root Cause (Five Whys)
1. Why did X happen? Because Y.
2. Why did Y happen? Because Z.
3. [Continue until root cause identified]

### Systemic Issues
[Organizational/process issues that need addressing]

## Resolution
[How the incident was resolved]

## Impact Assessment
- **Users Affected**: [Number/percentage]
- **Time to Detect**: [How long until we noticed]
- **Time to Resolve**: [How long to fix]

## Prevention & Mitigation

### Immediate Actions (Completed)
- [x] Action taken to resolve incident

### Short-term Mitigation (Next Sprint)
- [ ] Actions to prevent immediate recurrence

### Long-term Prevention (Next Quarter)
- [ ] Systemic improvements

## Lessons Learned
[Key takeaways for team]

## Action Items
- [ ] Owner: Action item with due date
```

### RCA Process

**Step 1: Initial Response** (During incident)

- Focus on resolution, not analysis
- Document timeline as events occur
- Save logs, screenshots, error messages

**Step 2: RCA Creation** (Within 24 hours)

- Complete all sections
- Use Five Whys method
- Identify root causes

**Step 3: Team Review** (Within 48 hours)

- Validate root cause analysis
- Prioritize mitigation strategies
- Assign action items

**Step 4: Follow-up** (Ongoing)

- Track action items to completion
- Update RCA with lessons learned

### Storage

**Location:** `docs/root-cause-analysis/`
**File Naming:** `YYYYMMDD-rca-[brief-description].md`

## Consequences

### Positive

1. **Systematic learning** - Every incident becomes a learning opportunity
2. **Pattern identification** - Easier to spot recurring issues
3. **Better prevention** - Focused mitigation strategies
4. **Knowledge sharing** - Team learns from each incident
5. **Blameless culture** - Focus on systems, not individuals

### Negative

1. **Time investment** - RCA process takes 1-2 hours per incident
2. **Process overhead** - Another document to maintain

## Example: Five Whys in Practice

**Immediate Cause:** API call failed

1. Why did the API call fail? **Server returned 500 error.**
2. Why did the server return 500? **Database connection timed out.**
3. Why did the connection timeout? **Connection pool exhausted.**
4. Why was pool exhausted? **Queries not returning connections.**
5. Why weren't connections returned? **Missing connection close in exception handler.**

**Root Cause:** Missing error handling in database layer

**Mitigation:** Add connection cleanup in exception handlers + monitoring for pool exhaustion

## Related

- ADR-0100: Claude Code AI Collaboration
- ADR-0105: Dev Environment and CI/CD Pipeline

---

**Author:** {{AUTHOR}}
**Last Updated:** {{DATE}}
