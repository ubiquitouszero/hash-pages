# ADR-0004: Server-Synced Checklists Over localStorage

- **Status:** Accepted
- **Date:** 2026-03-16
- **Authors:** Bert Carroll, Claude Code
- **Related:** ADR-0003

---

## Context

Pages with action items (meeting debriefs, project checklists, travel packing lists) need interactive checkboxes. The question is where to persist the checked/unchecked state.

The use case that forced this decision: A CEO opened a debrief page on his phone during a commute and checked off 3 action items. Later, the CTO opened the same page on a laptop and saw no checkmarks. The phone's localStorage was invisible to the laptop.

**Decision Drivers:**
- Checkbox state must sync across devices (phone checked, laptop sees it)
- Must track who checked what and when (accountability on shared action items)
- Must work offline (degrade gracefully, sync when reconnected)
- Minimal infrastructure (no database, no auth)

## Decision

Persist checkbox state server-side via Netlify Blobs or Cloudflare KV, keyed by page slug. Each checkbox toggle fires a POST with `{key, checked, by}`. On page load, a GET fetches the full state. localStorage serves as an offline fallback only.

**Data Model:**
```json
{
  "item-key": {
    "checked": true,
    "by": "Dan",
    "at": "2026-03-10T14:15:00Z"
  }
}
```

**User Identification:**
- First checkbox click prompts for a name
- Name is stored in localStorage (`hash-pages-user`)
- Subsequent clicks use the stored name automatically

## Rationale

localStorage is per-browser, per-device. It cannot sync. For single-user, single-device checklists (like a personal to-do list), localStorage is fine. But our checklists are shared artifacts -- two people checking off action items on the same debrief page. Server-side persistence is the only option that satisfies the "sync across devices" requirement.

The name prompt on first click is a lightweight alternative to auth. It's not secure (anyone can type any name), but it's not meant to be -- it's for attribution, not access control. The hash URL is the access control (ADR-0001).

## Considered Options

### Option 1: Server-synced with localStorage fallback (chosen)
**Pros:**
- Cross-device sync
- Who/when attribution
- Works offline (localStorage fallback)
- No auth required

**Cons:**
- Requires serverless function + storage
- Name is self-reported (not authenticated)

### Option 2: localStorage only
**Pros:**
- No server infrastructure needed
- Works offline by default
- Zero latency

**Cons:**
- Does not sync across devices (deal-breaker)
- No attribution (who checked what)
- Lost when browser data is cleared

### Option 3: Real-time sync (WebSocket/SSE)
**Pros:**
- Instant cross-device updates
- Multiple users see changes live

**Cons:**
- Requires persistent connection infrastructure
- Dramatically more complex than fire-and-forget POST
- Overkill -- checklists are checked once, not live-collaborative

## Consequences

### Positive
- CEO checks a box on his phone, CTO sees it on laptop -- the core use case works
- Every toggle records who and when -- enables "Did Dan see the action items?" verification
- Offline fallback means the page is still interactive without connectivity

### Negative
- Requires Blobs token (Netlify) or KV namespace (Cloudflare) to be configured. Mitigated: SETUP.md covers this; checklists degrade to localStorage if server is unreachable
- Name is not authenticated -- anyone could type "Dan." Mitigated: acceptable for the trust model of shared hash pages

### Neutral
- Checklist data is stored per-page-slug. No cross-page aggregation. This is fine because each page's checklist is independent.

## Implementation

**Files Affected:**
- `netlify/functions/checklist.mjs` -- Netlify Blobs implementation
- `cloudflare/workers/checklist/src/index.js` -- Cloudflare KV implementation
- `_templates/meeting-prep/index.html` -- inline checklist script
- `_templates/debrief/index.html` -- inline checklist script

**API Contract:**
| Method | URL | Body | Response |
|--------|-----|------|----------|
| GET | `/checklist?page=slug` | -- | `{key: {checked, by, at}}` |
| POST | `/checklist?page=slug` | `{key, checked, by}` | Full updated state |

**Rollback Plan:**
Remove the checklist `<script>` block from templates. Checkboxes become non-functional (static HTML). No server-side changes needed.

## References

- Production evidence: Server-synced checklists used across 20+ pages on two production domains since February 2026
- The incident that motivated this decision: checkbox state lost between phone and laptop during active deal closing

---

**Author:** Bert Carroll
**Last Updated:** 2026-03-16
