# ADR-0005: Edge Function View Tracking with Slack Alerts

- **Status:** Accepted
- **Date:** 2026-03-16
- **Authors:** Bert Carroll, Claude Code
- **Related:** ADR-0001, ADR-0003

---

## Context

When you send a proposal to a client, you want to know when they open it. Traditional approaches are email read receipts (unreliable, easily blocked) or embedding tracking pixels (blocked by email clients, doesn't work for links shared via text/Slack). We needed a tracking system that works for any sharing channel and tells us not just that someone viewed the page, but who.

**Decision Drivers:**
- Zero latency impact on page load (tracking must not slow down the visitor's experience)
- Per-recipient tracking without requiring login
- Real-time notification when someone first opens a page
- View stats accessible without a separate analytics dashboard
- Works across all sharing channels (text, email, Slack, iMessage)

## Decision

Deploy an edge function that intercepts every page request. The function serves the response immediately (`context.next()`), then tracks the view asynchronously via `waitUntil()`. The tracking is invisible to the visitor and adds zero latency.

**Per-recipient tracking** uses a URL query parameter: `?ref=dan`. When generating a sharing link, append a unique ref for each recipient. The first view from a named ref triggers a Slack alert.

**Architecture:**
```
Request -> Edge Function -> Serve response immediately (zero delay)
                         -> waitUntil: increment view count
                         -> waitUntil: if first view for ref, fire Slack alert
```

## Rationale

Edge functions run at the CDN level, before the response is served. By calling `next()` first and doing all tracking in `waitUntil()`, the visitor never experiences any delay. This is fundamentally different from client-side analytics (which loads after the page) or server-side analytics (which adds latency before the response).

The `?ref=name` parameter is a deliberate design choice over cookies or fingerprinting:
- It's transparent (the recipient can see `?ref=dan` in the URL)
- It works across devices (cookie-based tracking breaks when Dan opens on phone then laptop)
- It requires no JavaScript on the client
- It's opt-in (links without `?ref=` still track, just as anonymous `_none`)

The Slack alert on first view is the killer feature. You send a proposal at 2 PM. At 2:47 PM, Slack lights up: ":eyes: First view -- dan opened your-proposal." You now know they're thinking about it and can time your follow-up.

## Considered Options

### Option 1: Edge function with waitUntil (chosen)
**Pros:**
- Zero latency impact
- Tracks all page views (not just those with JavaScript enabled)
- Per-recipient via URL parameter
- Real-time Slack alerts
- Server-side (can't be blocked by ad blockers)

**Cons:**
- Requires edge function support (Netlify or Cloudflare)
- Slack integration needs bot token configuration
- View counts include bots unless filtered

### Option 2: Client-side analytics (Google Analytics, Plausible, etc.)
**Pros:**
- No server infrastructure needed
- Rich behavioral data (time on page, scroll depth)

**Cons:**
- Blocked by ad blockers (30-40% of technical users)
- Adds page load time (external script)
- No per-recipient tracking without auth
- No real-time Slack alerts
- Third-party data dependency

### Option 3: Tracking pixel in the HTML
**Pros:**
- Simple to implement
- Works without JavaScript

**Cons:**
- Still requires server-side endpoint
- Visible in page source
- Doesn't provide real-time notifications without additional infrastructure

### Option 4: Email read receipts
**Pros:**
- Built into email clients

**Cons:**
- Only works for email (not text, Slack, iMessage)
- Easily blocked by recipients
- No per-page granularity
- Doesn't work when link is forwarded

## Consequences

### Positive
- Know the exact moment a recipient opens your page
- Slack alerts enable timely follow-up (the biggest sales impact)
- View stats per-ref show engagement patterns (opened once vs. keeps coming back)
- Bot filtering prevents inflated counts
- Zero impact on page load speed

### Negative
- Edge function runs on every request (including assets). Mitigated: aggressive skip logic for static files, bots, non-200 responses, API paths
- Slack alerts are fire-once per ref (deduped via sentinel key). If you need to reset, manually delete the `_alerted:slug:ref` key from Blobs/KV

### Neutral
- Anonymous views (no `?ref=`) are tracked as `_none` -- you see total traffic but can't attribute it
- The share tool at `/.netlify/functions/share` (or `/api/share`) generates tracked links with a UI, reducing the manual URL construction

## Implementation

**Files Affected:**
- `netlify/edge-functions/track-views.ts` -- Netlify implementation
- `cloudflare/functions/_middleware.js` -- Cloudflare implementation
- `netlify/functions/views.mjs` -- View stats API (Netlify)
- `cloudflare/functions/api/views.js` -- View stats API (Cloudflare)
- `netlify/functions/share.mjs` -- Share link generator (Netlify)
- `cloudflare/functions/api/share.js` -- Share link generator (Cloudflare)

**Skip Logic (prevents tracking noise):**
- Root page (`/`, `/index.html`)
- Static assets (`.js`, `.css`, `.png`, `.jpg`, `.svg`, `.ico`, `.woff2`, etc.)
- API paths (`/.netlify/`, `/api/`)
- Non-GET methods
- Non-200 responses
- Known bots (regex pattern matching common bot user agents)

**Slack Alert Format (Block Kit):**
```
:eyes: First view -- proposal-a1b2c3d4
Ref: dan
When: Mar 10, 2026, 2:47 PM ET
```

**Dedup Mechanism:**
A sentinel key `_alerted:{slug}:{ref}` is written to storage after the first alert. Subsequent views from the same ref skip the Slack call.

**Rollback Plan:**
Remove the edge function entry from `netlify.toml` (or delete `functions/_middleware.js` for Cloudflare). Pages continue to work; tracking stops silently. No visitor-facing impact.

## References

- [Netlify Edge Functions](https://docs.netlify.com/edge-functions/overview/) -- `context.next()` + `waitUntil()` pattern
- [Cloudflare Pages Functions](https://developers.cloudflare.com/pages/functions/) -- middleware `onRequest` pattern
- Production evidence: View tracking active on 60+ pages since February 2026, Slack alerts used for sales follow-up timing

---

**Author:** Bert Carroll
**Last Updated:** 2026-03-16
