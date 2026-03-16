# ADR-0105: Development Environment and CI/CD Pipeline

- **Status:** Accepted
- **Date:** {{DATE}}
- **Authors:** {{AUTHOR}}, Claude Code
- **Priority:** High - Prevents production incidents

---

## Context

Deploying directly from local development to production without an intermediate staging environment leads to production incidents that could have been prevented.

**Problem:** No staging environment to catch integration issues before production.

### Current Deployment Flow (Anti-pattern)

```text
┌──────────────┐       git push        ┌─────────────────┐
│   Local Dev  │ ──────────────────> │   Production    │
│ (laptop)     │                       │                 │
└──────────────┘                       └─────────────────┘
```

**Problems with Direct-to-Production:**

1. No integration testing - Conflicts only discovered in production
2. No deployment validation - Can't verify changes work before users see them
3. High risk deployments - Every push goes straight to production
4. No rollback testing - Can't verify rollback procedures work
5. Limited debugging - Can't reproduce production issues in isolated environment

## Decision

**Implement a staging environment with automated CI/CD pipeline.**

### Proposed Architecture

```text
┌──────────────┐     git push      ┌─────────────────┐     Manual      ┌─────────────────┐
│   Local Dev  │ ───────────────> │   Staging Env   │ ── Promotion ─> │   Production    │
│ (laptop)     │                   │                 │                  │                 │
└──────────────┘                   └─────────────────┘                  └─────────────────┘
                                           │
                                           │ Auto-deploy on push
                                           │
                                   ┌───────┴────────┐
                                   │  GitHub Actions │
                                   │  - Run tests    │
                                   │  - Build        │
                                   │  - Deploy       │
                                   │  - Run migrations│
                                   └─────────────────┘
```

### CI/CD Pipeline

```yaml
# On push to main:
1. Run linters
2. Run test suite
3. Build application
4. Deploy to staging environment
5. Run database migrations on staging
6. Run smoke tests on staging
7. Notify team

# Manual promotion to production:
8. Review staging environment
9. Manual approval required
10. Deploy same build to production
11. Run database migrations on production
12. Run smoke tests on production
13. Notify team of deployment
```

### Database Strategy

**Staging Database:**

- Separate database instance
- Periodically refresh with sanitized production data (or use synthetic data)
- Allows migration testing without affecting production

**Migration Validation:**

- Migrations run on staging first
- Any conflicts caught before production
- Can test rollback procedures safely

## Consequences

### Positive

1. **Prevents production incidents** - Integration issues caught in staging
2. **Safer deployments** - Validate changes before production
3. **Better debugging** - Reproduce production issues in staging
4. **Rollback testing** - Verify rollback procedures work
5. **Confidence in changes** - Know changes work before users see them
6. **Audit trail** - Clear deployment history via GitHub Actions

### Negative

1. **Additional infrastructure costs** - Staging environment resources
2. **Increased complexity** - More environments to manage
3. **Setup time** - Initial implementation investment
4. **Manual promotion step** - Requires approval for production deployment

## Implementation Phases

### Phase 1: Staging Environment Setup

1. Create staging infrastructure resources
2. Configure staging environment variables
3. Set up staging DNS/domains

### Phase 2: CI/CD Pipeline

1. Create GitHub Actions workflows
2. Add automated staging deployment
3. Add smoke tests for staging validation
4. Add manual approval step for production promotion
5. Configure notifications

### Phase 3: Documentation & Training

1. Document staging workflow
2. Update deployment documentation
3. Create runbook for promotion to production
4. Train team on new workflow

## Related

- ADR-0100: Claude Code AI Collaboration
- ADR-0106: Root Cause Analysis Protocol

---

**Author:** {{AUTHOR}}
**Last Updated:** {{DATE}}
