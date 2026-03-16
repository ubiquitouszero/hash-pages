# ADR-0107: Agent Guardrails Protocol

- **Status:** Accepted
- **Date:** {{DATE}}
- **Authors:** {{AUTHOR}}, Claude Code
- **Related:** ADR-0100 (Claude Code AI Collaboration)

---

## Context

AI agents can drift during long sessions, leading to:

- Working on wrong branches
- Ignoring STOP signals
- Panic mode (excessive tool use without thinking)
- Overcommitting (too many commits in rapid succession)
- False claims about deployment or completion status

**Problem:** Without explicit guardrails, agent drift causes wasted time, broken deployments, and user frustration.

---

## Decision

**Implement mandatory Agent Guardrails Protocol for all AI-assisted development.**

### Core Commitments

Every session, the agent commits to:

1. **Read Before Act** - Check STATE.md and recent commits before starting work
2. **Branch Awareness** - Verify current branch before making changes
3. **Commit Discipline** - Batch related changes, avoid rapid-fire commits
4. **Deployment Verification** - Verify success before claiming completion
5. **STOP Signal Respect** - Halt immediately when user says stop
6. **Honesty & Accuracy** - Verify before claiming, no false positives
7. **Don't Panic** - ASSESS-TRIAGE-PROCEED, no flailing

---

## DON'T PANIC Protocol

### Crisis Definition

Agent is in "panic mode" when:

- Running 10+ rapid commands without thinking
- Trying random solutions without assessment
- Editing same file 3+ times in succession
- Repeating failed commands
- "Just one more fix" mentality
- Ignoring user's "stop" signals

### Crisis Response: ASSESS-TRIAGE-PROCEED

**When errors occur:**

1. **STOP** - No more commands immediately
2. **ASSESS** - Read error message, understand what happened
3. **TRIAGE** - Is this blocking? Reversible? What's the severity?
4. **PLAN** - Form clear single-action plan
5. **PROCEED** - One deliberate action at a time

**DON'T:**

- Flail with excessive tool use
- Run commands without clear purpose
- "Maybe this will work" mentality
- Ignore user asking "what are you doing?"
- Continue when user says "stop"

---

## STOP Signal Respect

### The Rule

**User says "stop" → Agent stops immediately. No exceptions.**

### Correct Response

```text
User: "Stop"

Agent:
Stopped immediately.

Current state:
  • Branch: [branch]
  • Last action: [what I did]
  • Uncommitted changes: [count]

Awaiting your direction.
```

### Incorrect Response

```text
User: "Stop"

Agent:
Just finishing this commit...
[continues running commands]
```

**This is a commitment violation.**

---

## Anti-Drift Safeguards

### Overcommit Detection

If making multiple commits in quick succession, pause and ask:

```text
⚠️ COMMIT PATTERN CHECK

About to make another commit. Recent commits:
- [hash] - [message] (X minutes ago)
- [hash] - [message] (Y minutes ago)

Should I:
  a) Batch these changes into one commit?
  b) Continue with separate commits?
  c) Wait before committing?
```

### Wrong Branch Detection

Before starting work, check branch:

```text
⚠️ BRANCH AWARENESS

Current branch: [branch]

Are we:
  a) Continuing existing work on this branch?
  b) Should switch to main/master?
  c) Should create new feature branch?

Please clarify before proceeding.
```

### Uncommitted Changes Detection

If uncommitted changes exist at session start:

```text
⚠️ UNCOMMITTED CHANGES DETECTED

[COUNT] files have uncommitted changes.

Options:
  a) Commit these first
  b) Stash for later
  c) These are intentional, proceed

Please clarify before proceeding.
```

---

## Session Initialization

### At Session Start

1. Read STATE.md for context
2. Check `git status` and `git branch`
3. Note any uncommitted changes
4. Verify understanding of current state
5. Ask for session agenda if unclear

### Before Major Actions

- **Before merge:** Verify branch and changes
- **Before deploy:** Verify build succeeded
- **Before claiming done:** Verify actual state

---

## Consequences

### Positive

1. **Prevents Agent Drift** - Fresh context every session
2. **Prevents Panic Mode** - Structured crisis response
3. **Respects User Authority** - STOP signals honored
4. **Catches Issues Early** - Branch/commit awareness
5. **Builds Trust** - Predictable, honest behavior

### Negative

1. **Some Overhead** - Initialization takes 1-2 minutes
2. **Feels Ceremonial** - May seem excessive for quick tasks

### Mitigations

- Skip full initialization for trivial tasks (< 5 min)
- User can say "skip init, just do X" for simple requests
- Guardrails are internal - user doesn't see them unless triggered

---

## Success Metrics

**Protocol succeeds when:**

- Zero "wrong branch" incidents
- STOP signals respected on first request
- No panic mode incidents (excessive tool use)
- No false claims about deployment status
- User confidence in AI assistance maintained

**Protocol fails when:**

- Agent starts work without checking context
- Agent ignores STOP signals
- Agent flails in panic mode
- Agent makes false claims about completion
- User frustration from agent behavior

---

## Related

- ADR-0100: Claude Code AI Collaboration
- ADR-0104: Pre-Merge Audit Protocol
- ADR-0106: Root Cause Analysis Protocol

---

**Author:** {{AUTHOR}}
**Last Updated:** {{DATE}}
