# ADR-0108: Token Security Standards

- **Status:** Accepted
- **Date:** {{DATE}}
- **Authors:** {{AUTHOR}}, Claude Code
- **Related:** ADR-0104 (Pre-Merge Audit Protocol)

---

## Context

Applications commonly use tokens for:

- API authentication (API keys, bearer tokens)
- Session management
- Magic links (passwordless auth)
- Password reset links
- Email verification

**Problem:** Weak token entropy or poor token lifecycle management creates security vulnerabilities.

---

## Decision

**Adopt industry-standard token security practices based on NIST and OWASP guidelines.**

---

## Token Entropy Requirements

### Minimum Standards

| Token Type | Minimum Entropy | Recommended |
|------------|-----------------|-------------|
| Session tokens | 128 bits | 128 bits |
| API keys | 128 bits | 256 bits |
| Magic links | 112 bits | 128 bits |
| Password reset | 112 bits | 128 bits |
| CSRF tokens | 128 bits | 128 bits |

### Implementation

**Python:**
```python
import secrets
import uuid

# Option 1: secrets module (recommended)
token = secrets.token_urlsafe(32)  # 256 bits

# Option 2: UUID4 (122 effective bits)
token = str(uuid.uuid4())  # 32 hex chars
```

**Node.js:**
```javascript
const crypto = require('crypto');

// 256 bits
const token = crypto.randomBytes(32).toString('hex');

// URL-safe
const token = crypto.randomBytes(32).toString('base64url');
```

### DO NOT Use

- Sequential IDs
- Timestamps alone
- User-provided input as seed
- Math.random() or similar non-cryptographic RNG
- MD5/SHA1 hashes of predictable data

---

## Token Lifecycle

### Generation

```python
# GOOD: Cryptographically secure
token = secrets.token_urlsafe(32)
expires_at = now() + timedelta(hours=24)

# BAD: Predictable
token = hashlib.md5(user_email.encode()).hexdigest()
```

### Storage

| Approach | When to Use |
|----------|-------------|
| Store hash only | High-security tokens (API keys) |
| Store plaintext | Session tokens (performance) |
| Store encrypted | Tokens needing retrieval |

**Hashing tokens:**
```python
import hashlib

# Store hash, not plaintext
token_hash = hashlib.sha256(token.encode()).hexdigest()
```

### Validation

```python
def validate_token(token):
    # 1. Check exists
    token_obj = Token.objects.filter(token=token).first()
    if not token_obj:
        log_failed_attempt(token)
        return None

    # 2. Check not expired
    if token_obj.expires_at < now():
        return None

    # 3. Check not revoked
    if token_obj.is_revoked:
        return None

    # 4. Log successful validation
    token_obj.last_used = now()
    token_obj.save()

    return token_obj
```

### Expiration

| Token Type | Recommended Expiry |
|------------|-------------------|
| Session tokens | 24 hours (sliding) |
| API keys | No expiry (revocation only) |
| Magic links | 15 minutes - 24 hours |
| Password reset | 1 hour |
| Email verification | 24-72 hours |

---

## Rate Limiting

### Defense in Depth

Even with strong entropy, implement rate limiting:

```python
# Example: 10 attempts per 5 minutes per IP
@ratelimit(key='ip', rate='10/5m')
def validate_token(request, token):
    ...
```

### Rate Limit Guidelines

| Endpoint | Rate Limit |
|----------|------------|
| Token validation | 10/minute per IP |
| Login attempts | 5/minute per IP |
| Password reset | 3/hour per email |
| API endpoints | 100/minute per key |

---

## Audit Logging

### What to Log

**Token generation:**
```json
{
  "event": "token_generated",
  "token_type": "magic_link",
  "user_id": "123",
  "expires_at": "2026-01-15T12:00:00Z",
  "ip": "192.168.1.1"
}
```

**Token validation (success):**
```json
{
  "event": "token_validated",
  "token_type": "magic_link",
  "user_id": "123",
  "ip": "192.168.1.1"
}
```

**Token validation (failure):**
```json
{
  "event": "token_validation_failed",
  "reason": "expired|invalid|revoked",
  "ip": "192.168.1.1"
}
```

---

## Security Checklist

### Token Generation
- [ ] Uses cryptographically secure RNG
- [ ] Minimum 112-bit entropy (128-bit recommended)
- [ ] Unique constraint enforced in database
- [ ] Generation events logged

### Token Storage
- [ ] Sensitive tokens hashed before storage
- [ ] Database column indexed for fast lookup
- [ ] Tokens not logged in plaintext

### Token Validation
- [ ] Checks existence, expiration, revocation
- [ ] Rate limited to prevent enumeration
- [ ] Failed attempts logged
- [ ] Timing-safe comparison used

### Token Lifecycle
- [ ] Appropriate expiration times set
- [ ] Cleanup job for expired tokens
- [ ] Revocation mechanism exists
- [ ] Single-use tokens where appropriate

---

## Consequences

### Positive

1. **Resistant to Brute Force** - 128-bit entropy is computationally infeasible to crack
2. **Audit Trail** - Logging enables incident investigation
3. **Defense in Depth** - Rate limiting adds protection layer
4. **Industry Standard** - Follows NIST/OWASP guidelines

### Negative

1. **Implementation Effort** - Proper token handling takes more code
2. **Operational Overhead** - Cleanup jobs, monitoring needed

---

## References

- NIST SP 800-63B: Digital Identity Guidelines
- OWASP Session Management Cheat Sheet
- OWASP Authentication Cheat Sheet

---

**Author:** {{AUTHOR}}
**Last Updated:** {{DATE}}
