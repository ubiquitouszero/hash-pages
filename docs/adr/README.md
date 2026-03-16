# Architecture Decision Records

Decisions that shaped how Hash Pages works and why.

## Index

| ADR | Title | Status |
|-----|-------|--------|
| [0001](ADR-0001-hash-url-access-control.md) | Hash URL Access Control | Accepted |
| [0002](ADR-0002-self-contained-html-no-framework.md) | Self-Contained HTML, No Framework | Accepted |
| [0003](ADR-0003-dual-platform-netlify-cloudflare.md) | Dual Platform Support (Netlify + Cloudflare) | Accepted |
| [0004](ADR-0004-server-synced-checklists.md) | Server-Synced Checklists Over localStorage | Accepted |
| [0005](ADR-0005-edge-function-view-tracking.md) | Edge Function View Tracking with Slack Alerts | Accepted |

### Standard ADRs (0100-series)

Baseline methodology decisions from the [AI Development Starter Kit](https://github.com/ubiquitouszero/ai-development-starter-kit). These apply to any project using AI-assisted development.

| ADR | Title | Category |
|-----|-------|----------|
| [0100](ADR-0100-claude-code-ai-collaboration.md) | Claude Code AI Collaboration Contract | Workflow |
| [0101](ADR-0101-project-tracking-signal-dashboard.md) | Project Tracking via ROADMAP.md + STATE.md | Workflow |
| [0102](ADR-0102-story-points-velocity-tracking.md) | Story Points & Velocity Tracking | Workflow |
| [0103](ADR-0103-mobile-claude-code-workflow.md) | Mobile Claude Code Workflow | Workflow |
| [0104](ADR-0104-pre-merge-audit-protocol.md) | Pre-Merge Audit Protocol | Quality Gates |
| [0105](ADR-0105-dev-environment-and-cicd-pipeline.md) | Dev Environment & CI/CD Pipeline | Operations |
| [0106](ADR-0106-root-cause-analysis-protocol.md) | Root Cause Analysis Protocol | Operations |
| [0107](ADR-0107-agent-guardrails-protocol.md) | Agent Guardrails Protocol | Quality Gates |
| [0108](ADR-0108-token-security-standards.md) | Token Security Standards | Security |

## How to Read These

Each ADR follows the same structure:

1. **Context** -- the problem and what drove the decision
2. **Decision** -- what we chose
3. **Rationale** -- why we chose it (the most important section)
4. **Considered Options** -- what else we looked at and why we didn't pick it
5. **Consequences** -- what happens because of this decision (good and bad)
6. **Implementation** -- which files are affected and how to roll back

## Adding New ADRs

Use `ADR-template.md` in this directory. Project-specific decisions use the 0001-series (sequential from 0006). Standard methodology decisions use the 0100-series (from the starter kit).
