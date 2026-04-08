# Setup Guide

Get your own hash pages site running in 15 minutes.

---

## Prerequisites

- Node.js 18+ (for Netlify CLI)
- Python 3 (for hash generation)
- A Netlify account (free tier is fine)
- Optional: Slack workspace (for view alerts)
- Optional: Custom domain

---

## Option A: Netlify (Recommended)

### 1. Install Netlify CLI

```bash
npm install -g netlify-cli
```

### 2. Fork and Clone

Fork this repo (keep it private), then:

```bash
git clone git@github.com:YOUR_USER/hash-pages.git
cd hash-pages
npm install
```

### 3. Create a Netlify Site

```bash
netlify init
# Choose "Create & configure a new site"
# Pick your team
# Set site name (e.g., "my-pages")
```

Note the **Site ID** from the output. You'll need it for the functions.

> If you missed it, find it again at any time: Netlify dashboard → your site → **Site settings** → **Site information** → **Site ID** (UUID format like `12345678-90ab-cdef-1234-567890abcdef`).

### 4. Set Up Environment Variables

The functions read both `SITE_ID` and `NETLIFY_BLOBS_TOKEN` from environment variables — no source code edits needed.

**4a. Get a Personal Access Token (PAT):**

1. Go to [Netlify User Settings > Applications > Personal Access Tokens](https://app.netlify.com/user/applications#personal-access-tokens)
2. Click **New access token**, name it `hash-pages-blobs`
3. Use a **Personal Access Token (legacy)**, not a fine-grained token — Netlify Blobs requires the legacy PAT format
4. Copy the token (starts with `nfp_`)

**4b. Set both env vars on your site:**

```bash
netlify env:set SITE_ID "your-site-id-from-step-3"
netlify env:set NETLIFY_BLOBS_TOKEN "nfp_your_token_here"
```

That's it. No code edits, no `grep` for placeholders. The functions in `netlify/functions/` and the edge function in `netlify/edge-functions/` automatically read these at runtime.

### 5. Deploy

```bash
netlify deploy --prod --dir=. --functions=netlify/functions
```

Your site is live. The root URL shows "Nothing here." -- that's correct.

> **Important:** Make sure you have a `.netlifyignore` file at the repo root before deploying. This repo ships with one. It excludes documentation files, templates, internal docs, and `node_modules` from the static deploy. Without it, your `README.md`, `STATE.md`, `CLAUDE.md`, and other internal files would be publicly fetchable at `yoursite.com/README.md` — which leaks the "URL is the credential" security model. Verify it exists:
>
> ```bash
> cat .netlifyignore
> ```

### 6. Custom Domain (Optional)

1. In Netlify dashboard > Domain settings > Add custom domain
2. Point your domain's DNS to Netlify (CNAME or Netlify DNS)
3. Netlify provisions HTTPS automatically

### 7. Slack Alerts (Optional)

To get notified when someone opens your pages:

1. Create a Slack app at [api.slack.com/apps](https://api.slack.com/apps)
2. Add the `chat:write` bot scope
3. Install to your workspace
4. Create a channel for alerts (e.g., `#page-views`)
5. Set environment variables:

```bash
netlify env:set SLACK_BOT_TOKEN "xoxb-your-bot-token"
netlify env:set SLACK_CHANNEL_ID "C0YOUR_CHANNEL_ID"
```

6. Invite the bot to the channel: `/invite @YourBotName`

### 8. Microsoft Teams Alerts (Optional)

To get notified in Teams when someone opens your pages:

> **Heads up:** Microsoft is sunsetting the legacy "Connectors → Incoming Webhook" path by end of 2025. The new path is **Workflows → "Post to a channel when a webhook request is received"**. The steps below use the Workflows path; if you have an existing legacy webhook URL, it will keep working until the deprecation date.

1. In Teams, go to the channel where you want alerts
2. Click the **...** menu next to the channel name → **Workflows**
3. Search for the template **"Post to a channel when a webhook request is received"** and click it
4. Name the workflow (e.g., "Hash Pages View Alerts"), pick the team and channel, click **Add workflow**
5. Copy the generated webhook URL
6. Set the environment variable:

```bash
# Netlify
netlify env:set TEAMS_WEBHOOK_URL "https://prod-XX.westus.logic.azure.com:443/workflows/..."

# Cloudflare
npx wrangler pages secret put TEAMS_WEBHOOK_URL --project-name=your-pages
```

Both Slack and Teams can run simultaneously -- configure whichever you use.

### 9. Verify Everything Works

```bash
# Create a test page
python -c "import secrets; print(secrets.token_hex(4))"
# e.g., a1b2c3d4

cp -r _templates/landing-page test-page-a1b2c3d4
netlify deploy --prod --dir=. --functions=netlify/functions

# Open the deployed page in your browser
# macOS:    open https://your-site.netlify.app/test-page-a1b2c3d4/
# Linux:    xdg-open https://your-site.netlify.app/test-page-a1b2c3d4/
# Windows:  start https://your-site.netlify.app/test-page-a1b2c3d4/
# WSL:      explorer.exe https://your-site.netlify.app/test-page-a1b2c3d4/

# Confirm internal docs are NOT publicly accessible
# (should return 404 — if it returns 200, your .netlifyignore is missing or wrong)
curl -sI https://your-site.netlify.app/README.md | head -1

# Check view tracking
curl -s https://your-site.netlify.app/.netlify/functions/views?page=test-page-a1b2c3d4

# Test checklist (if page has checkboxes)
# Click a checkbox, reload the page, verify it persists

# Test Slack/Teams (if configured)
# Visit with ?ref=test -- should fire alert
# https://your-site.netlify.app/test-page-a1b2c3d4/?ref=test
```

### 10. Revoking a Page (Important)

The hash-pages security model is "the URL is the credential." If a hash URL leaks — forwarded to the wrong person, posted somewhere public, scraped — the page is exposed. Revoke immediately:

```bash
# Delete the page folder
rm -rf my-leaked-page-a1b2c3d4

# Redeploy
netlify deploy --prod --dir=. --functions=netlify/functions
```

Within seconds, the URL returns 404. Anyone with the old link sees nothing.

**Permanent removal from Netlify deploy history:** the above removes the page from the live site, but Netlify retains every prior deploy in its history for rollback purposes. Anyone with access to your Netlify dashboard could view a prior deploy. To purge fully, you also need to delete the affected deploys from the Netlify dashboard (Site → **Deploys** → click the deploy → **Options** → **Delete deploy**). Only do this if the leak is sensitive — otherwise the active 404 is sufficient.

**If you're worried a page may have leaked but not sure:** check view stats first. `https://your-site.netlify.app/.netlify/functions/views?page=my-page-slug` shows total views and per-`ref` breakdown. Unexpected views from refs you didn't create are the early-warning signal.

**Prevention:** for genuinely sensitive pages (contracts, BAAs, financial models), use 16-character hashes (`token_hex(16)`) instead of 8-character hashes — that's 128 bits of entropy versus 32, making URL guessing computationally infeasible even for adversaries who know the slug pattern.

---

## Option B: Cloudflare Pages

The `cloudflare/` directory has equivalent infrastructure. Key differences:

| Netlify | Cloudflare |
|---------|------------|
| Edge Functions | Pages Middleware (`functions/_middleware.js`) |
| Blobs | KV Namespaces |
| `netlify deploy` | `wrangler pages deploy` |
| Functions at `/.netlify/functions/` | Functions at `/api/` |

### 1. Install Wrangler

```bash
npm install -g wrangler
wrangler login
```

### 2. Create KV Namespaces

```bash
wrangler kv namespace create PAGE_VIEWS
wrangler kv namespace create CHECKLISTS
```

Note the IDs and update `wrangler.toml`.

### 3. Copy Cloudflare Files

```bash
cp -r cloudflare/functions ./functions
cp cloudflare/wrangler.toml ./wrangler.toml
```

### 4. Deploy Checklist Worker

The checklist runs as a separate Cloudflare Worker:

```bash
cd cloudflare/workers/checklist
wrangler deploy
```

### 5. Deploy Site

```bash
wrangler pages deploy . --project-name your-pages
```

### 6. Update Checklist API URL

In your page templates, change the checklist API endpoint:

```javascript
// Netlify:
var API = '/.netlify/functions/checklist?page=' + PAGE;

// Cloudflare:
var API = '/api/checklist?page=' + PAGE;
// OR if using external worker:
var API = 'https://your-checklist-worker.workers.dev/api/checklist?page=' + PAGE;
```

---

## Daily Workflow

```bash
# Generate hash for new page
python -c "import secrets; print(secrets.token_hex(4))"

# Copy template, customize, deploy
cp -r _templates/one-pager client-overview-a1b2c3d4
# edit client-overview-a1b2c3d4/index.html
netlify deploy --prod --dir=. --functions=netlify/functions

# Generate tracked link
open https://yourdomain.com/.netlify/functions/share
# Or manually: https://yourdomain.com/client-overview-a1b2c3d4/?ref=sarah

# Check views later
open https://yourdomain.com/.netlify/functions/views?page=client-overview-a1b2c3d4
```

---

## Environment Variables Reference

| Variable | Required | Purpose |
|----------|----------|---------|
| `NETLIFY_BLOBS_TOKEN` | Yes | Netlify PAT for Blobs storage (checklists + views) |
| `SLACK_BOT_TOKEN` | No | Slack bot token for view alerts |
| `SLACK_CHANNEL_ID` | No | Slack channel for alerts |
| `TEAMS_WEBHOOK_URL` | No | Microsoft Teams incoming webhook URL for view alerts |

---

## Troubleshooting

**Checklists not persisting:** Check that `NETLIFY_BLOBS_TOKEN` is set and the Site ID in `checklist.mjs` matches your Netlify site.

**Slack alerts not firing:** Ensure bot has `chat:write` scope, is invited to the channel, and both `SLACK_BOT_TOKEN` and `SLACK_CHANNEL_ID` are set as env vars.

**View counts not incrementing:** Edge functions need to be deployed with the site. Make sure `netlify.toml` includes the `[[edge_functions]]` block.

**Pages showing 404:** Ensure each page is in its own folder with an `index.html` file (e.g., `my-page-a1b2c3d4/index.html`, not `my-page-a1b2c3d4.html`).
