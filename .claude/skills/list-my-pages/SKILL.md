---
name: list-my-pages
description: List all hash pages that exist in the current repo and have been deployed to the linked Netlify site. Shows slug, title, and live URL for each. Use when the user says "/list-my-pages", "what pages have I published", "show me my pages", or similar.
---

# /list-my-pages — List all published pages

## What this does

Scans the repo for page folders (directories at the repo root that match the `<slug>-<hash>` naming pattern) and shows the user what they've published.

---

## How to find pages

Every hash page lives in a folder at the repo root named `<slug>-<8hexchars>` with an `index.html` inside. The `_templates/`, `netlify/`, `cloudflare/`, `docs/`, `examples/`, `node_modules/`, and `.claude/` folders are infrastructure and should be ignored.

```bash
# List candidate page folders
find . -maxdepth 1 -type d -name '*-????????' -not -path '.' | sort
```

Then for each match, read the `<title>` tag from its `index.html`:

```bash
for dir in *-????????/; do
  title=$(grep -oP '(?<=<title>)[^<]+' "$dir/index.html" | head -1)
  echo "$dir $title"
done
```

---

## Get the live site base URL

```bash
netlify sites:list --json | python -c "
import json, sys
sites = json.load(sys.stdin)
for s in sites:
    if s.get('published_deploy'):
        print(s['ssl_url'] or s['url'])
        break
"
```

Or, simpler, check `.netlify/state.json` for the linked site ID, then `netlify api getSite --data '{\"site_id\":\"<id>\"}'` for the URL.

---

## Report format

Show the user a table:

| Slug | Title | URL |
|------|-------|-----|
| `acme-overview-a1b2c3d4` | Acme Strategy — Overview | [link](https://alice-hash-pages.netlify.app/acme-overview-a1b2c3d4/) |
| `q2-investor-brief-e5f6g7h8` | Q2 Investor Update | [link](https://alice-hash-pages.netlify.app/q2-investor-brief-e5f6g7h8/) |
| `webinar-rsvp-9i0j1k2l` | AI Adoption Webinar RSVP | [link](https://alice-hash-pages.netlify.app/webinar-rsvp-9i0j1k2l/) |

Order by modification time of the page folder (newest first).

---

## Optional: view stats

If the user wants to see view counts per page, the stats endpoint is at:

```
https://<site-url>/.netlify/functions/views?page=<slug>
```

Offer this only if they ask. Don't fetch stats for every page unsolicited — it's extra work they didn't request.

---

## Edge cases

- **No pages found:** tell the user "You haven't published any pages yet. Try `/new-one-pager` to build your first one."
- **Pages exist locally but haven't been deployed:** the `find` will include them. Flag them as "local draft, not deployed" so the user knows.
- **Page in the repo but folder name doesn't match the pattern:** rare but possible. List it separately as "unusual naming — may not be a hash page."
