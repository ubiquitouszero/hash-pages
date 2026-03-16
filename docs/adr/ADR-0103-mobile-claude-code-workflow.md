---
status: accepted
date: 2025-10-21
decision-makers: Bert Carroll
consulted: Claude (Sr. Dev Review)
---

# ADR-0103: Mobile Claude Code Integration Workflow

## Context and Problem Statement

Claude Code mobile provides valuable development capabilities, enabling rapid feature development when away from the primary workstation. However, mobile-generated code requires systematic integration to maintain code quality, security, and project consistency.

**Challenge**: How do we safely integrate mobile Claude Code work into the main codebase while maintaining:
1. Code quality standards
2. Security review requirements
3. Test coverage
4. Team visibility
5. Audit trail

## Decision Drivers

* Mobile Claude Code is too valuable to not use (productivity gains)
* Code quality cannot be compromised for convenience
* Security vulnerabilities must be caught before production
* Team needs visibility into what was built
* Need repeatable, documented process

## Considered Options

1. **Direct merge (no review)** - Fast but risky
2. **Full PR review by team** - Thorough but slow for solo dev
3. **Automated review + senior dev checklist** - Balanced approach
4. **Separate mobile branch** - Safe but creates drift

## Decision Outcome

**Chosen option**: "Automated review + senior dev checklist" (Option 3)

Implement a structured workflow that balances speed with safety:

### Mobile Claude Code Integration Workflow

#### Phase 1: Mobile Development Session
1. **Work in isolated branch**: Use Claude Code mobile to develop features
2. **Document commits**: Ensure clear commit messages with What/Why/How
3. **Track story points**: Reference backlog items in commits
4. **Generate session docs**: Use Claude to create session summaries

#### Phase 2: Integration Preparation (Desktop)
1. **Fetch remote work**: `git fetch --all`
2. **Review commits**: `git log origin/<mobile-branch>..HEAD --oneline`
3. **Check file changes**: `git diff --stat origin/master..HEAD`
4. **Run automated checks**:
   ```bash
   python manage.py check --deploy
   python manage.py migrate --check
   pre-commit run --all-files
   ```

#### Phase 3: Senior Developer Review (Self-Review Checklist)

**Code Quality**:
- [ ] Clear, descriptive commit messages
- [ ] Atomic commits (one feature per commit)
- [ ] No TODO/FIXME without tracking tickets
- [ ] Documentation updated

**Security**:
- [ ] Input validation on all user-facing endpoints
- [ ] CSRF protection enabled (except webhooks)
- [ ] Rate limiting on critical endpoints
- [ ] No hardcoded secrets or credentials
- [ ] SQL injection prevention (use ORM, no raw SQL)
- [ ] XSS prevention (template escaping, sanitization)
- [ ] Authentication/authorization checks

**Database**:
- [ ] Migrations are backward compatible
- [ ] No data loss migrations without backup plan
- [ ] Indexes added for query performance
- [ ] Default values provided for new fields

**Transactions**:
- [ ] Bulk operations use all-or-nothing transactions
- [ ] No partial data states on failure
- [ ] Rollback behavior documented

**Testing**:
- [ ] Critical paths have integration tests
- [ ] Security features have security tests
- [ ] Edge cases covered

**Performance**:
- [ ] No N+1 queries
- [ ] File uploads have size limits
- [ ] Pagination for large datasets
- [ ] Rate limiting prevents abuse

**Breaking Changes**:
- [ ] API changes documented
- [ ] Migration path provided
- [ ] Rollback plan exists

#### Phase 4: Address Issues
1. **Fix blocking issues**: Security vulnerabilities, breaking changes
2. **Add missing tests**: Critical security features MUST have tests
3. **Document workarounds**: Known limitations documented
4. **Create follow-up tickets**: Nice-to-haves moved to backlog

#### Phase 5: Merge and Monitor
1. **Merge to master**: Use merge commit (not rebase) to preserve history
2. **Monitor for 48 hours**:
   - Check error logs
   - Watch rate limit violations
   - Monitor performance metrics
   - Review user feedback
3. **Create retrospective**: Document lessons learned

### Session 18 Example (Oct 21, 2025)

**Mobile Work Completed**:
- 20 commits via Claude Code mobile
- Security fixes (P0-34)
- Bulk import (P0-33)
- Super admin dashboard (P0-31)
- Patient dashboard (P0-26, P0-27, P0-9)

**Integration Process**:
1. ✅ Fetched remote branch
2. ✅ Reviewed 24 commits, 37 files changed, 10,094 insertions
3. ✅ Senior dev review identified:
   - 🟢 Excellent code quality, security-first approach
   - 🟡 Bulk import needed transaction fix
   - 🔴 Missing security tests
4. ✅ Fixed blocking issues:
   - Changed per-row transactions to all-or-nothing
   - Added comprehensive security test suite
   - Added cache health check
5. ✅ Approved with conditions met

**Time Investment**:
- Mobile development: ~8 hours (estimated)
- Integration review: ~2 hours
- Issue fixes: ~1 hour
- **Total overhead**: ~3 hours for 8 hours of work (38%)

**Result**: High-quality merge with security fixes deployed safely

## Consequences

### Positive

* **Enables mobile development** without compromising quality
* **Systematic review process** catches issues before production
* **Documentation-first** approach improves team communication
* **Automated checks** reduce human error
* **Audit trail** preserved through merge commits

### Negative

* **Integration overhead**: 30-40% time overhead for review/fixes
* **Requires discipline**: Easy to skip steps under time pressure
* **Single-person bottleneck**: No second pair of eyes (solo dev)
* **Test creation lag**: Tests often written post-development

### Mitigations

1. **Time budget**: Allocate 40% extra time for integration
2. **Automated checks**: Pre-commit hooks catch common issues
3. **AI review assist**: Use Claude for initial security scan
4. **Prioritize tests**: Write tests for security features immediately

## Validation

Success criteria:
- [ ] Zero critical security vulnerabilities deployed
- [ ] All mobile work integrated within 24 hours
- [ ] No production hotfixes needed from mobile work
- [ ] Team understands what was built

Measured by:
- Security audit results
- Production error rates
- Rollback frequency
- Documentation quality

## Notes

### Tools Required
- Git for version control
- Pre-commit hooks for linting
- Django checks for settings validation
- Test suite for integration tests
- Claude Code for AI-assisted review

### References
- Session 18 Summary: `backend/docs/sessions/session-18-summary.md`
- Security Audit: `backend/docs/security/audit-2025-10-21.md`
- Rate Limiting Guide: `backend/docs/security/rate-limiting.md`

### Future Improvements
- [ ] Automated security scanning (Bandit, Safety)
- [ ] Contract testing for API changes
- [ ] Automated rollback triggers
- [ ] Team code review (when team grows)
- [ ] CI/CD pipeline with staging deployment

---

**Decision**: Accepted and implemented as of Session 18 (2025-10-21)
**Review Date**: After 3 mobile integration sessions (collect data)
