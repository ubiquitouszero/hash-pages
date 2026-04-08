---
name: publish-page
description: Deploy the current hash-pages repo state to Netlify. Handles slug+hash generation if needed, verifies NETLIFY_AUTH_TOKEN is set, runs netlify deploy, and returns the live URL. Use when the user says "/publish-page", "publish it", "ship it", "make it live", or has finished editing a page and wants it deployed.
---

# /publish-page — Deploy to Netlify

## When to use this

The user has a page ready (either built via one of the `/new-*` skills, or hand-edited in their Cowork VM) and wants it live. This skill handles the deploy step.

---

## Pre-flight checks

Run these before attempting to deploy. If any fail, fix before proceeding.

1. **Netlify auth token present:**
   ```bash
   if [ -z "$NETLIFY_AUTH_TOKEN" ]; then
     echo "NETLIFY_AUTH_TOKEN is not set"
     exit 1
   fi
   netlify status
   ```
   If this says "Not logged in," the token is wrong or expired. Send the user to `COWORK_SETUP.md` Step 5 to regenerate.

2. **GitHub token present (best effort — warn, don't block):**
   ```bash
   if [ -z "$GITHUB_TOKEN" ]; then
     echo "Warning: GITHUB_TOKEN is not set — pages will deploy but will not be backed up to your GitHub fork."
   fi
   ```
   If missing, deploy proceeds anyway but flag the backup gap in the final report so the user knows.

3. **Repo is a fork (not the upstream):**
   ```bash
   git remote -v | grep origin
   ```
   If the URL points to `ubiquitouszero/hash-pages`, the user cloned the wrong repo. Stop and tell them to clone their fork instead (COWORK_SETUP Step 6). Deploys will work but `git push` will fail because they don't have write access to the upstream.

4. **Site linked:**
   ```bash
   netlify sites:list
   ```
   If the current repo isn't linked to a site, run:
   ```bash
   netlify link
   ```
   or, if they need a new site, `netlify sites:create --name <name>` then `netlify link --id <site-id>`.

5. **Page folder exists:**
   - Confirm the page folder (e.g., `acme-overview-a1b2c3d4/`) exists at the repo root with an `index.html` inside
   - If the user says "publish it" but there are multiple recent drafts, ask which one

6. **Placeholders replaced:**
   ```bash
   grep -l "PAGE_TITLE\|YOUR_\|lorem ipsum" <page-folder>/index.html
   ```
   If any placeholder text remains, stop and tell the user. Don't ship a page with `PAGE_TITLE` in the `<title>` tag.

---

## Deploy

```bash
netlify deploy --prod --dir=. --functions=netlify/functions
```

**Do not use `netlify login`.** Authentication is via the `NETLIFY_AUTH_TOKEN` env var, set once during setup.

**Do not use `--draft` unless the user explicitly asks.** Default to `--prod` so the URL is shareable immediately.

---

## Back up to the user's GitHub fork

Immediately after a successful deploy, commit the new page and push to the user's fork. This is the backup that protects them from VM corruption or device loss.

```bash
cd ~/hash-pages  # or wherever the repo is
git add <slug>-<hash>/
git commit -m "Add <slug>-<hash>"
git push origin main
```

**This is best-effort.** If any of these fail, do not treat it as a publish failure — the page is already live on Netlify. Instead:

- Capture the error message
- Include a clear warning in the final report: "Deploy succeeded, but the GitHub backup failed. Your page is live but not backed up to your fork. Reason: [message]. You can fix this by [action]."

Common failures and fixes:

| Error | Cause | What to tell the user |
|-------|-------|----------------------|
| `authentication failed` | `GITHUB_TOKEN` missing or expired | "Go to COWORK_SETUP Step 2 and regenerate your GitHub token." |
| `Permission denied to ubiquitouszero/hash-pages` | User cloned the upstream repo, not their fork | "You cloned the wrong repo. Delete ~/hash-pages and re-clone from your fork: github.com/YOUR-USERNAME/hash-pages" |
| `nothing to commit, working tree clean` | Already committed | Not an error — skip the commit step and push if needed |
| `non-fast-forward` / `rejected` | Upstream has changes the local doesn't | `git pull --rebase origin main`, resolve any conflicts, then push again. If conflicts are in user's own pages, stop and ask for guidance. |
| `repository not found` | Remote URL is wrong | `git remote -v` to diagnose; tell the user to verify their GitHub username |

If the repo isn't a git repo at all (rare but possible if the user's setup skipped steps), run `git init && git remote add origin https://github.com/<user>/hash-pages` — but only after confirming with the user.

---

## Capture the URL

Parse the deploy output. It will include lines like:

```
Website Draft URL: https://...
Website URL:       https://alice-hash-pages.netlify.app
```

The page lives at the Website URL + the page slug folder:

```
https://alice-hash-pages.netlify.app/<slug>-<hash>/
```

Construct this URL and verify it's reachable:

```bash
curl -sI https://alice-hash-pages.netlify.app/<slug>-<hash>/ | head -1
```

A 200 means it worked. Anything else: investigate before reporting success.

---

## Report back

Format (both deploy and backup succeeded):

```
Deployed and backed up.

Live URL:     https://alice-hash-pages.netlify.app/acme-overview-a1b2c3d4/
Tracked link: https://alice-hash-pages.netlify.app/acme-overview-a1b2c3d4/?ref=sarah
GitHub:       github.com/alice/hash-pages (commit <short-sha>)

To edit, just tell me what to change.
```

Format (deploy succeeded, backup failed):

```
Deployed — but backup failed.

Live URL:     https://alice-hash-pages.netlify.app/acme-overview-a1b2c3d4/
Tracked link: https://alice-hash-pages.netlify.app/acme-overview-a1b2c3d4/?ref=sarah

WARNING: I couldn't push to your GitHub fork. Your page is live, but it's only stored in this Cowork VM right now. If the VM is reset or corrupted, you'll lose the page.

Reason: <specific error>
Fix:    <specific action from the troubleshooting table above>
```

Then stop. Don't offer next steps unsolicited.

---

## Troubleshooting

| Error | Cause | Fix |
|-------|-------|-----|
| `Not logged in` | `NETLIFY_AUTH_TOKEN` missing or expired | Regenerate token at `app.netlify.com/user/applications#personal-access-tokens`, update env var |
| `Site not linked` | `.netlify/state.json` missing | `netlify link` or `netlify sites:create` then `netlify link --id` |
| `404` after deploy | Folder structure wrong — needs `<slug>/index.html`, not `<slug>.html` | Verify `index.html` exists inside the slug folder |
| `Failed to upload functions` | Missing `node_modules` | `npm install` then retry |
| Deploy succeeds but page is blank | Template file is empty or broken | Check the HTML file actually has content |
