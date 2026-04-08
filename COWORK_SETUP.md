# Claude Cowork Setup — Hash Pages

**For non-developers.** This guide walks you from zero to your first published page using Claude Cowork. No prior coding experience needed.

**Time required:** ~10 minutes the first time, ~30 seconds for every page after.

---

## What you'll end up with

- Your own copy of the hash-pages repo on GitHub (so you own your work and it's backed up)
- A live website at `https://<yourname>.netlify.app`
- A way to tell Claude "make me a one-pager about X" and get a working URL back in under a minute
- Pages that are mobile-friendly, print-ready, and can send you a Slack or Teams alert the moment someone opens them
- Every page you publish is automatically committed and pushed to your GitHub fork as a backup — so if anything happens to your Cowork VM, your pages are safe

---

## Why fork, not just clone?

**Short answer: so your work doesn't vanish.**

Claude Cowork runs a Linux virtual machine on your computer. Pages you create there live inside that VM. If the VM corrupts (a known issue on Windows), if you reinstall Cowork, if you switch machines — your pages are gone. That's bad.

The fix is to use GitHub as your backup. You fork the public hash-pages repo, which gives you your own copy on GitHub. Every time Claude publishes a page, it also commits and pushes it to your fork. Your pages live in **three** places: the live website, the Cowork VM, and GitHub. Any one of those can disappear and you're fine.

If you don't know what "fork" or "git" means, that's OK. You click one button on GitHub. The rest happens automatically.

> **Don't want to deal with GitHub at all?** If you're one of Bert's clients, ask about the concierge setup — Bert runs the repo and Netlify site for you, you just get a key and start publishing. For everyone else, the fork path below is the way to go.

---

## Before you start: check you can run Cowork

Claude Cowork has some hard requirements. Check these **before** you invest any time:

| Requirement | Check |
|-------------|-------|
| macOS 14+ on Apple Silicon (M1, M2, M3, M4), **OR** Windows 11 with admin rights | Intel Macs and non-admin Windows are not supported |
| Claude desktop app installed | Download from [claude.ai/download](https://claude.ai/download) |
| Claude Pro, Max, Team, or Enterprise plan | Cowork is not on the free plan |
| Virtualization enabled in BIOS (Windows only) | Usually on by default; if Cowork won't start on Windows, this is why |

If any of these fail, stop here. The rest of this guide won't work for you.

---

## Step 1: Fork the hash-pages repo on GitHub

1. Go to [github.com/ubiquitouszero/hash-pages](https://github.com/ubiquitouszero/hash-pages)
2. If you don't have a GitHub account, create one at [github.com/signup](https://github.com/signup) (free, takes 30 seconds)
3. Click the **Fork** button in the top right of the hash-pages page
4. On the next screen, click **Create fork** (the defaults are fine)
5. You now have your own copy at `github.com/<your-username>/hash-pages`

Write down `<your-username>` somewhere — you'll need it in a couple of steps.

---

## Step 2: Get a GitHub Personal Access Token (PAT)

So Claude can push to your fork without needing to log in.

1. Go to [github.com/settings/tokens](https://github.com/settings/tokens) (you may need to log in)
2. Click **Generate new token** → **Generate new token (classic)**
3. Note: `hash-pages-cowork`
4. Expiration: `No expiration` (or 1 year if you prefer)
5. Scopes: check **`repo`** (this gives Claude permission to push to your fork, nothing else)
6. Scroll down, click **Generate token**
7. **Copy the token.** It starts with `ghp_` and is a long string. You will not be able to see it again. Paste it somewhere safe.

---

## Step 3: Get a Netlify Personal Access Token (PAT)

Netlify is where your pages will be live on the web. You'll give Claude Cowork a token so it can deploy pages on your behalf without you ever typing a command.

1. Go to [netlify.com](https://netlify.com) and create a free account (or log in if you have one).
2. Click your profile picture → **User settings**
3. In the left sidebar, click **Applications** → **Personal access tokens** (or go directly to [app.netlify.com/user/applications#personal-access-tokens](https://app.netlify.com/user/applications#personal-access-tokens))
4. Click **New access token**
5. Description: `hash-pages-cowork`
6. Expiration: set to "No expiration" for convenience, or 1 year if you prefer
7. Click **Generate token**
8. **Copy the token.** It starts with `nfp_` and is a long string. You will not be able to see it again after you close the page. Paste it somewhere safe for the next step.

---

## Step 4: Open Claude Cowork and start a new session

1. Open the Claude desktop app
2. Click **Cowork** in the sidebar (or the Cowork tab at the top, depending on your version)
3. Click **New Cowork session**
4. Name it something like `hash-pages`
5. Wait for the Linux VM to start. First time this takes 1-2 minutes. You'll see a terminal appear when it's ready.

---

## Step 5: Give Claude both tokens

In the Cowork session, paste this into the chat. Replace `ghp_YOUR_GITHUB_TOKEN` and `nfp_YOUR_NETLIFY_TOKEN` with the tokens you copied in Steps 2 and 3. Replace `<your-username>` and `<your-email>` with your GitHub username and the email you use on GitHub.

```
Please set my tokens as environment variables and configure git so they persist:

# GitHub token (for pushing to my fork)
export GITHUB_TOKEN=ghp_YOUR_GITHUB_TOKEN
echo 'export GITHUB_TOKEN=ghp_YOUR_GITHUB_TOKEN' >> ~/.bashrc

# Netlify token (for deploying)
export NETLIFY_AUTH_TOKEN=nfp_YOUR_NETLIFY_TOKEN
echo 'export NETLIFY_AUTH_TOKEN=nfp_YOUR_NETLIFY_TOKEN' >> ~/.bashrc

# Git identity so commits have my name on them
git config --global user.name "<your-username>"
git config --global user.email "<your-email>"

# Tell git to use the GitHub token when pushing to github.com
git config --global credential.helper store
echo "https://<your-username>:${GITHUB_TOKEN}@github.com" > ~/.git-credentials

Then verify both tokens work:
  netlify status
  curl -sH "Authorization: token $GITHUB_TOKEN" https://api.github.com/user | grep login
```

Claude will run the commands. You should see:

- **Netlify**: your account email
- **GitHub**: your username

If either fails, the corresponding token is wrong or expired — go back to Step 2 or Step 3 to regenerate.

---

## Step 6: Clone your fork

Paste this into the chat (replace `<your-username>` with your actual GitHub username from Step 1):

```
Please clone my hash-pages fork from https://github.com/<your-username>/hash-pages into ~/hash-pages, cd into it, install dependencies with `npm install`, and read the CLAUDE.md file so you understand how to use this system.
```

Claude will clone **your fork** (not the original), install the Netlify CLI (via `npm install -g netlify-cli`) if it isn't already there, install project dependencies, and read the design system context.

You'll know this step worked when Claude says something like "I've read CLAUDE.md and I'm ready to build hash pages."

> **Important:** Always clone YOUR fork, not `ubiquitouszero/hash-pages`. Cloning the original means Claude can't push your pages back to GitHub because you don't have write access to that repo.

---

## Step 7: Create your Netlify site

Paste this:

```
Please create a new Netlify site for my hash pages. Use the name I give you if I provide one, otherwise pick a sensible default. Link this repo to the new site and tell me the site ID and the URL.
```

Claude will run `netlify sites:create` and `netlify link`. You'll get back:

- **Site name** (e.g., `alice-hash-pages`)
- **Site ID** (UUID)
- **Default URL** (e.g., `https://alice-hash-pages.netlify.app`)

Write down the Site ID somewhere safe — you'll only need it if something breaks.

---

## Step 8: Publish your first page

You're done with setup. Now you just say what you want. Try this:

```
/new-one-pager
```

Claude will interview you:

- **What's the page about?** (product, service, company, event, etc.)
- **Who is the audience?**
- **What do you want readers to do after reading?** (call you, sign up, buy, etc.)
- **Brand color?** (hex code, or "pick something professional")
- **Any specific content you want included?** (you can paste bullet points, a draft, whatever)

When Claude has enough, it will:

1. Generate the HTML page
2. Show you a preview of the structure
3. Ask if you want to publish
4. On "yes," deploy to Netlify **and** commit + push to your GitHub fork
5. Give you a live URL and a confirmation that your page is backed up

Total time from `/new-one-pager` to live URL: usually 1-3 minutes.

---

## What you can ask for

| Command | What it builds |
|---------|----------------|
| `/new-one-pager` | A single-sheet overview that prints nicely and works on a phone |
| `/new-landing` | A longer product or service page with sections and a call to action |
| `/new-proposal` | A scoped client proposal with a pricing table |
| `/new-survey` | An intake form that collects responses and sends you a notification |
| `/list-my-pages` | Shows everything you've published on this site |

You don't have to use slash commands. You can also just say things like:

- "Make me a one-pager for my consulting business called Acme Strategy. Brand color dark green. Audience is CFOs."
- "I need a page to send to investors about our Q2 results. Three sections: numbers, highlights, what's next."
- "Build a landing page for a webinar I'm hosting next Thursday on AI adoption."

Claude will pick the right template and run the interview.

---

## Editing a page after it's published

Just describe the change:

- "On the Acme page, change the brand color to blue and make the hero headline say 'Built for Growth' instead"
- "Add a fourth section to the investor page about our expansion plans"
- "Replace the photo placeholder with this image" (and paste the image)

Claude edits the HTML, redeploys, and the URL stays the same.

---

## Using a custom domain (recommended before sharing with clients)

Your default URL looks like `alice-hash-pages.netlify.app`. That's fine for testing, but once you start sharing pages with real clients you'll probably want something like `pages.yourcompany.com` or `your-domain.com`. Netlify makes this easy.

### What you need

- A domain you own (buy one at [Cloudflare](https://cloudflare.com), [Namecheap](https://namecheap.com), [Google Domains](https://domains.google), or wherever — usually $10-20/year)
- Access to where that domain's DNS is managed (usually the same place you bought it)

> **Recommendation: Cloudflare for DNS.** If you're buying a new domain or choosing where to manage DNS, Cloudflare is the best option. Reasons: (1) they don't play games with renewal pricing — what you pay this year is what you pay next year, (2) their DNS is fast and reliable, (3) free SSL and DDoS protection if you ever need them. The tradeoff: the Cloudflare dashboard has more knobs than Namecheap or Google Domains, so the learning curve is a little steeper. If you're non-technical and just want the simplest possible flow, Namecheap or Google Domains are easier on day one. If you're willing to learn one dashboard well and keep it forever, pick Cloudflare. Claude can walk you through either.

### Two flavors of custom domain

**Flavor A — A subdomain of a domain you already own** (e.g., `pages.yourcompany.com` or `share.yourdomain.com`)

This is the easiest. You keep your main website at `yourcompany.com` and point only a subdomain at Netlify. Most non-devs pick this.

**Flavor B — A whole domain** (e.g., `yourname.com` where the entire site IS your hash pages)

Do this if you're buying a new domain specifically for your hash pages and don't have a website there yet.

### How to set it up (both flavors)

1. **Open your Netlify dashboard** at [app.netlify.com](https://app.netlify.com) and click into your hash-pages site
2. Click **Domain management** (or **Domain settings** on older UI)
3. Click **Add a domain**
4. Type the domain or subdomain you want to use (e.g., `pages.yourcompany.com`)
5. Click **Verify** → **Add domain**

Netlify will now show you the DNS records you need to add. Exactly which record depends on your flavor:

**For Flavor A (subdomain):** Netlify gives you a CNAME record. Something like:

```
Type:  CNAME
Name:  pages
Value: alice-hash-pages.netlify.app
```

Go to your DNS provider (wherever you bought/manage the domain), find the DNS settings for `yourcompany.com`, add that CNAME record, save.

**For Flavor B (apex/whole domain):** Netlify gives you either A records (IP addresses) or an option to use Netlify DNS. The simplest path is to "Use Netlify DNS" — Netlify tells you the four nameservers, and you go to your domain registrar and change the nameservers to Netlify's. This delegates everything to Netlify. Downside: if you later host anything else on that domain (like email), you'll manage those DNS records in Netlify.

### Wait for DNS to propagate

DNS changes usually take 5-30 minutes to become visible. Sometimes longer. Be patient. When it's ready, Netlify will show a green checkmark next to your domain.

### HTTPS is automatic

Once DNS is working, Netlify automatically provisions a free Let's Encrypt SSL certificate. This takes a few more minutes. You don't need to do anything. When it's done, your pages are live at `https://pages.yourcompany.com/your-slug-a1b2c3d4/`.

### Ask Claude to help

If any of this is confusing, you can paste the whole thing into your Cowork chat:

```
I want to set up a custom domain for my hash pages site. My domain is pages.yourcompany.com and I bought it from Namecheap. Walk me through what I need to do, step by step, and tell me exactly what to type into the Netlify dashboard and what DNS records to create at Namecheap.
```

Claude will walk you through the specifics for your domain registrar. It won't be able to click the buttons for you (the Netlify dashboard and your DNS provider are outside Cowork's reach) but it can tell you exactly what to click and what to paste.

### Common gotchas

| Problem | Cause | Fix |
|---------|-------|-----|
| "Check DNS configuration" warning in Netlify | DNS not propagated yet | Wait 5-30 minutes, click "Retry DNS verification" |
| Site loads at old Netlify URL but not custom domain | CNAME record missing or pointed at wrong target | Double-check the value Netlify told you to use, make sure you pasted it exactly |
| SSL certificate error in browser | Let's Encrypt still provisioning | Wait 5-10 more minutes after DNS works |
| "Domain already in use" error | The domain is already attached to a different Netlify site | Remove it from the other site first |

### Do you have to do this?

No. You can live on `alice-hash-pages.netlify.app` forever if you want. The pages work exactly the same. Custom domains are just for branding and professionalism when you're sharing with clients.

---

## Sharing pages with tracking (optional)

Every page supports "who opened it" tracking. To send a tracked link:

```
Give me a tracked link for the acme-overview page for recipient "sarah"
```

Claude will return something like:
`https://alice-hash-pages.netlify.app/acme-overview-a1b2c3d4/?ref=sarah`

When Sarah opens that link, it counts her view separately. If you've configured Slack or Teams alerts (see below), the first view fires a notification.

---

## Optional: Slack or Teams alerts

If you want to be notified when someone opens a page for the first time:

**For Slack:** Get a bot token from [api.slack.com/apps](https://api.slack.com/apps) (create an app, add `chat:write` scope, install to your workspace). Then in Cowork:

```
Set these environment variables and redeploy:
SLACK_BOT_TOKEN=xoxb-...
SLACK_CHANNEL_ID=C0...
```

**For Teams:** Create an incoming webhook in your Teams channel (Channel → ⋯ → Workflows → Post to channel when webhook received). Then:

```
Set TEAMS_WEBHOOK_URL=<url> and redeploy.
```

Either or both work. You don't need both.

---

## Troubleshooting

### "netlify: command not found"

The Netlify CLI didn't install. Ask Claude:
```
Please run `npm install -g netlify-cli` and verify it worked with `netlify --version`.
```

### "Not logged in" from `netlify status`

The `NETLIFY_AUTH_TOKEN` env var isn't set, or it's wrong. Go back to Step 5. If the token is right but still failing, regenerate a new one at [app.netlify.com/user/applications#personal-access-tokens](https://app.netlify.com/user/applications#personal-access-tokens) and try again.

### "git push: authentication failed" or Claude can't push to my fork

The `GITHUB_TOKEN` env var isn't set, or the token is wrong, expired, or doesn't have `repo` scope. Go back to Step 2 to regenerate. Also check you're in **your fork**, not the original repo:

```
Ask Claude: "Run `git remote -v` and show me the output. I should see my GitHub username in the URL."
```

If the URL shows `ubiquitouszero/hash-pages` instead of `<your-username>/hash-pages`, you cloned the wrong repo. Delete `~/hash-pages` and clone your fork (Step 6).

### Cowork lost my environment variables between sessions

The `~/.bashrc` writes in Step 5 should persist both tokens. If they didn't, ask Claude:
```
Please verify GITHUB_TOKEN and NETLIFY_AUTH_TOKEN are in ~/.bashrc. If not, add them.
```

### My page deployed but the URL is 404

Usually a slug typo. Ask Claude:
```
Run `netlify deploy --prod --dir=.` again and show me the actual deployed URL.
```

### The VM won't start on Windows

This is a known Cowork issue on Windows with the `sessiondata.vhdx` file. From the support article at [support.claude.com](https://support.claude.com/en/articles/13345190-get-started-with-cowork): close Claude desktop, delete the `vm_bundles` folder in your Claude install directory, and reopen. If it still fails, this is a Cowork bug, not a hash-pages bug — report it to Anthropic.

### I'm on an Intel Mac

Cowork is not available on Intel Macs. You cannot use this flow. Options:

- Use a friend's Apple Silicon Mac for setup, then publish pages from there
- Use Claude Code directly on your Mac (not Cowork) — it doesn't need the VM
- Wait for Cowork Intel support (no known timeline)

### Claude says it can't find CLAUDE.md

You're not in the repo directory. Ask:
```
cd ~/hash-pages and read CLAUDE.md
```

---

## Cost

Free to run, as long as you stay within Netlify's free tier:

- 100 GB bandwidth/month
- 300 build minutes/month
- Unlimited sites, functions, and deploys

A hash page is tiny (10-50 KB per page). You can host hundreds of pages and serve thousands of views before hitting any limit.

Claude Cowork costs whatever your Claude Pro/Max/Team subscription costs. No additional Cowork fee.

---

## What's next

- **Build a library.** Over a few weeks you'll have a dozen pages. Ask `/list-my-pages` anytime to see them all.
- **Add a custom domain** if you haven't already. See the "Using a custom domain" section above — once you're sharing pages with real clients, `pages.yourcompany.com` looks much more professional than `alice-hash-pages.netlify.app`.
- **Learn the templates.** If you want to know what each page type looks like before committing, read `TEMPLATES.md` in this repo. Each template has screenshots and a "when to use this" section.
- **Check your fork occasionally.** Every published page lives at `github.com/<your-username>/hash-pages` as backup. If something ever happens to your Cowork VM, your pages are still there.

---

## Getting help

- **Questions about hash-pages itself:** open an issue at [github.com/ubiquitouszero/hash-pages/issues](https://github.com/ubiquitouszero/hash-pages/issues)
- **Questions about Claude Cowork:** [support.claude.com](https://support.claude.com)
- **Questions about Netlify:** [answers.netlify.com](https://answers.netlify.com)

Built by [Ask the Human LLC](https://askthehuman.com).
