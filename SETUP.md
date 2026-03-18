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

### 4. Update Site IDs

Replace the placeholder site ID in these files with your actual Netlify Site ID:

- `netlify/functions/checklist.mjs` -- line with `SITE_ID`
- `netlify/functions/views.mjs` -- line with `SITE_ID`
- `netlify/edge-functions/track-views.ts` -- line with `SITE_ID`

### 5. Set Up Blobs Token

Netlify Blobs needs a personal access token for server-side storage:

1. Go to [Netlify User Settings > Applications > Personal Access Tokens](https://app.netlify.com/user/applications#personal-access-tokens)
2. Create a new token with a descriptive name like "hash-pages-blobs"
3. Set it as an environment variable:

```bash
netlify env:set NETLIFY_BLOBS_TOKEN "your-token-here"
```

### 6. Deploy

```bash
netlify deploy --prod --dir=. --functions=netlify/functions
```

Your site is live. The root URL shows "Nothing here." -- that's correct.

### 7. Custom Domain (Optional)

1. In Netlify dashboard > Domain settings > Add custom domain
2. Point your domain's DNS to Netlify (CNAME or Netlify DNS)
3. Netlify provisions HTTPS automatically

### 8. Slack Alerts (Optional)

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

### 8b. Microsoft Teams Alerts (Optional)

To get notified in Teams when someone opens your pages:

1. In Teams, go to the channel where you want alerts
2. Click the **...** menu > **Connectors** (or **Workflows** in new Teams)
3. Add an **Incoming Webhook** and name it (e.g., "Page Views")
4. Copy the webhook URL
5. Set the environment variable:

```bash
# Netlify
netlify env:set TEAMS_WEBHOOK_URL "https://your-org.webhook.office.com/webhookb2/..."

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

# Visit the page
open https://your-site.netlify.app/test-page-a1b2c3d4/

# Check view tracking
open https://your-site.netlify.app/.netlify/functions/views?page=test-page-a1b2c3d4

# Test checklist (if page has checkboxes)
# Click a checkbox, reload the page, verify it persists

# Test Slack (if configured)
# Visit with ?ref=test -- should fire Slack alert
open https://your-site.netlify.app/test-page-a1b2c3d4/?ref=test
```

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
