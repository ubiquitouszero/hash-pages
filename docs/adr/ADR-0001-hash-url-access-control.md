# ADR-0001: Hash URL Access Control

- **Status:** Accepted
- **Date:** 2026-03-16
- **Authors:** Bert Carroll, Claude Code
- **Related:** ADR-0002

---

## Context

We need a way to share private documents with specific people (clients, collaborators, investors) without requiring them to create an account, remember a password, or click through an auth wall. The documents contain sensitive business content (proposals, contracts, financial models) but are not classified -- the threat model is "don't let random people stumble onto it," not "defend against a motivated attacker with the URL."

**Decision Drivers:**
- Zero friction for the recipient (they get a link, they tap it, they're reading)
- No user database to maintain (no accounts, no password resets, no GDPR deletion requests)
- Works across every sharing channel (text, email, Slack, iMessage, WhatsApp)
- Simple to implement and reason about

## Decision

Use hash-based URLs as the sole access control mechanism. Each page lives at `/page-name-{hash}/` where the hash is a cryptographically random hex string. The root of the site returns "Nothing here." There is no public index of pages.

- **Standard pages:** 8-character hex hash (`secrets.token_hex(4)`) -- 4.3 billion possibilities per page name
- **Sensitive documents** (contracts, BAAs): 32-character hex hash (`secrets.token_hex(16)`) -- 128-bit entropy
- **All pages:** `<meta name="robots" content="noindex, nofollow">` to prevent search engine indexing

## Rationale

Authentication solves a different problem than ours. Auth is for systems where users return repeatedly, have roles, and need persistent sessions. We're sharing one-off documents where the recipient opens it once or twice. Adding auth would:

1. Require the recipient to create an account (friction that kills conversion)
2. Require us to maintain a user database (operational overhead for zero benefit)
3. Break sharing -- you can't text someone a password-protected URL and have them open it in 2 seconds

The hash URL pattern is the same approach used by Google Docs "anyone with the link" sharing, Figma share links, and Notion public pages. It's a proven pattern at scale.

## Considered Options

### Option 1: Hash URLs (chosen)
**Pros:**
- Zero friction for recipients
- No infrastructure beyond static file hosting
- Works on any device, any channel
- No user database

**Cons:**
- If URL is forwarded, new person has access
- No per-user audit trail (mitigated by `?ref=name` tracking)
- No revocation without changing the URL

### Option 2: Password-Protected Pages
**Pros:**
- Can share URL publicly, password separately
- Revocable by changing password

**Cons:**
- Requires server-side auth logic
- Recipients forget passwords
- Can't tap a link and immediately read

### Option 3: Auth Wall (login/SSO)
**Pros:**
- Full audit trail per user
- Granular permissions
- Revocable access

**Cons:**
- Requires user database and auth infrastructure
- Recipients must create accounts
- Massive friction for one-off document sharing
- Overkill for the threat model

### Option 4: Time-Limited Signed URLs
**Pros:**
- Automatic expiration
- No persistent credentials

**Cons:**
- URLs break after expiration (bad for reference docs)
- Requires signing infrastructure
- Complexity without proportionate security benefit

## Consequences

### Positive
- Recipients can read documents in under 3 seconds from link tap
- No auth infrastructure to maintain or secure
- Pages work offline (once loaded) and can be saved as PDFs
- View tracking via `?ref=name` provides per-recipient analytics without auth

### Negative
- Forwarded URLs grant access to new recipients (mitigated: for our use cases this is often desirable)
- No way to revoke access to a specific person without changing the URL for everyone (mitigated: use longer hashes for sensitive docs, deploy new URL if compromised)

### Neutral
- Search engines are excluded via robots meta tag, but a determined scraper could still find pages if they guess the hash (probability: negligible at 32+ bits of entropy)

## Implementation

**Files Affected:**
- `index.html` (root "Nothing here." page)
- All page templates (robots noindex meta tag)
- `netlify/edge-functions/track-views.ts` (slug extraction from URL path)

**Hash Generation:**
```bash
# Standard (8 chars, 32-bit)
python -c "import secrets; print(secrets.token_hex(4))"

# Sensitive (32 chars, 128-bit)
python -c "import secrets; print(secrets.token_hex(16))"
```

**Rollback Plan:**
Add password protection as a progressive enhancement -- hash URLs continue to work, password adds a second layer. No breaking change required.

## References

- [Google Docs sharing model](https://support.google.com/docs/answer/2494822) -- "Anyone with the link" pattern
- [OWASP Unguessable URLs](https://cheatsheetseries.owasp.org/cheatsheets/Unvalidated_Redirects_and_Forwards_Cheat_Sheet.html) -- security considerations for URL-based access

---

**Author:** Bert Carroll
**Last Updated:** 2026-03-16
