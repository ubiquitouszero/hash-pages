# ADR-0003: Dual Platform Support (Netlify + Cloudflare Pages)

- **Status:** Accepted
- **Date:** 2026-03-16
- **Authors:** Bert Carroll, Claude Code
- **Related:** ADR-0004, ADR-0005

---

## Context

The system needs serverless infrastructure for three features: view tracking, checklist persistence, and a share link generator tool. Both Netlify and Cloudflare Pages offer free tiers that cover our needs, but their serverless APIs differ significantly.

We run two production instances: one on Netlify and one on Cloudflare Pages. Users of this template repo should be able to choose either platform.

**Decision Drivers:**
- Users shouldn't be locked into one platform
- Both platforms have generous free tiers
- The page templates themselves should be platform-agnostic
- Infrastructure code should be clearly separated from content

## Decision

Provide infrastructure code for both platforms. Page templates reference the checklist API via a single variable (`API`) that's set per-platform. The platform-specific code lives in separate directories (`netlify/` and `cloudflare/`).

| Feature | Netlify | Cloudflare |
|---------|---------|------------|
| View tracking | Edge Function (TypeScript) | Pages Middleware (JavaScript) |
| Checklist storage | Blobs | KV Namespace |
| View storage | Blobs | KV Namespace |
| Checklist API path | `/.netlify/functions/checklist` | `/api/checklist` |
| Views API path | `/.netlify/functions/views` | `/api/views` |
| Deploy command | `netlify deploy --prod` | `wrangler pages deploy` |

## Rationale

Platform lock-in is the enemy of a template system. If we only support Netlify, users on Cloudflare can't use the infrastructure features. The page templates are pure HTML and work anywhere, but the serverless features (which are the major differentiator) would be single-platform.

The implementation cost is low because the logic is identical -- only the storage API differs (Blobs vs KV). The view tracking logic, Slack alert format, and checklist data model are the same on both platforms.

## Considered Options

### Option 1: Dual platform support (chosen)
**Pros:**
- No platform lock-in
- Users choose based on existing infrastructure
- Proves the architecture is platform-independent

**Cons:**
- Two implementations to maintain
- Users must choose and configure one platform

### Option 2: Netlify only
**Pros:**
- Single implementation, simpler repo
- Netlify has slightly better DX for edge functions

**Cons:**
- Locks out Cloudflare users
- Conflates template system with hosting choice

### Option 3: Abstract the storage layer
**Pros:**
- Single implementation with pluggable backend

**Cons:**
- Over-engineering for 3 simple functions
- Adds an abstraction layer that doesn't earn its complexity
- Still need platform-specific deployment config

## Consequences

### Positive
- Users on either platform can use the full feature set
- Migration between platforms is possible without rewriting page content
- Documents the mapping between Netlify and Cloudflare concepts (useful reference)

### Negative
- Two sets of function code to maintain. Mitigated: logic is simple (~50 lines each), changes are rare
- SETUP.md is longer with two paths. Mitigated: clearly separated sections, user picks one

### Neutral
- Cloudflare checklist runs as a separate Worker (not co-deployed with Pages) due to KV binding requirements. This is a Cloudflare architectural constraint, not a design choice.

## Implementation

**Files Affected:**
- `netlify/` -- all Netlify-specific infrastructure
- `cloudflare/` -- all Cloudflare-specific infrastructure
- `_templates/meeting-prep/index.html`, `_templates/debrief/index.html` -- checklist API URL variable
- `SETUP.md` -- dual-path setup guide

**Key Difference: Checklist API URL**

In templates with checklists, one line determines the platform:
```javascript
// Netlify:
var API = '/.netlify/functions/checklist?page=' + PAGE;

// Cloudflare:
var API = '/api/checklist?page=' + PAGE;
```

**Rollback Plan:**
Remove the `cloudflare/` directory to go Netlify-only, or remove `netlify/` to go Cloudflare-only. No other files affected.

## References

- [Netlify Blobs docs](https://docs.netlify.com/blobs/overview/)
- [Cloudflare KV docs](https://developers.cloudflare.com/kv/)
- Production evidence: Two production domains (Netlify and Cloudflare) running the same page templates

---

**Author:** Bert Carroll
**Last Updated:** 2026-03-16
