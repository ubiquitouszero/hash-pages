# Hash Pages

**Private, shareable, trackable single-file pages. No auth. No CMS. No build step.**

By [Ask the Human LLC](https://askthehuman.com) -- AI-accelerated engineering for people who ship.

You make a page. You get a URL. You send it to someone. You know when they open it. That's it.

I built this system to solve a specific problem: I need to share polished documents with clients, investors, and collaborators without friction -- no logins, no "request access" buttons, no Google Docs link that expires. Just a URL that works on any device, looks good when printed, and tells me when someone actually reads it.

Over 6 weeks, this turned into 60+ pages across two production domains, covering everything from sales one-pagers to interactive pricing calculators to legal contracts. This repo packages the system so you can stand up your own.

---

## Table of Contents

- [The Decisions (and Why)](#the-decisions-and-why)
- [What's In This Repo](#whats-in-this-repo)
- [Page Types](#page-types)
- [How It Works](#how-it-works)
- [Setup](#setup)
- [Creating Your First Page](#creating-your-first-page)
- [Advanced Patterns](#advanced-patterns)

---

## The Decisions (and Why)

### Why hash URLs instead of auth

Every page lives at `https://yourdomain.com/page-name-a1b2c3d4/`. That 8-character hex hash is the access control. You need the URL to find the page. The root of the site says "Nothing here."

**Why this works better than passwords or login walls:**

- **Zero friction for the recipient.** You text someone a link. They tap it. They're reading your proposal. No "sign up to view" interstitial, no password to remember, no SSO redirect. This matters because the person you're sending it to is busy. Every click you add between "received link" and "reading your thing" is a chance they'll do it later (meaning never).
- **Unguessable by default.** `secrets.token_hex(4)` gives you 4 billion possible URLs per page name. Nobody is stumbling onto your page. For higher-sensitivity docs (contracts, BAAs), use `token_hex(16)` for 128-bit hashes.
- **Shareable via any channel.** Text, email, Slack, iMessage, WhatsApp -- a URL works everywhere. Try that with a password-protected PDF.
- **No user database to maintain.** No accounts, no password resets, no GDPR deletion requests. The URL is the credential.

The tradeoff: if someone forwards the URL, the new person can see it too. For my use cases (proposals, meeting prep, pricing tools), that's a feature, not a bug. If your document is so sensitive that *forwarding* is a threat, you need a different system.

### Why self-contained HTML (no framework, no build step)

Each page is one `index.html` file with inline CSS and JS. You can open it from your filesystem and it works.

**Why:**

- **The page IS the deliverable.** You can email the HTML file. You can print it. You can host it on any static file server. There's no webpack, no node_modules, no "run `npm install` first." This makes AI coding assistants dramatically more effective -- there's no framework to learn, no build pipeline to debug. You describe what you want and you get a working page.
- **No dependency rot.** There's no package.json for the page itself. No breaking changes from a React upgrade. A page you build today works exactly the same in 5 years.
- **Instant deploys.** Deploying is copying files. `netlify deploy --prod --dir=.` and you're live. No build step, no CI pipeline, no "deploy failed because Node 18 deprecated something."
- **Easy to customize per-client.** Each page is independent. Change one client's brand colors without touching anyone else's page. Copy a page, modify it, deploy it -- no shared components to worry about.

The tradeoff: you repeat CSS across pages. That's fine. The total site is still tiny (HTML compresses well), and the independence of each page is worth more than DRY CSS.

### Why Netlify (and how to use Cloudflare Pages instead)

The system works on either platform. This repo defaults to Netlify because the free tier includes:

- **Edge Functions** -- run code on every request without adding latency (view tracking)
- **Blobs** -- serverless key-value storage (checklists, view counts)
- **One-command deploy** -- `netlify deploy --prod`

I also run a second instance on Cloudflare Pages using Workers and KV. The `cloudflare/` directory has the equivalent infrastructure. The page templates work on either platform without modification -- only the serverless functions differ.

### Why server-synced checklists

Action items that persist across devices. You check a box on your phone, your colleague sees it on their laptop. Every toggle records who checked it and when.

**The problem this solves:** I send a meeting debrief to my CEO with 8 action items. He checks 3 of them from his phone on the way to a meeting. I open the same page on my laptop and see which ones he's handled. No "did you see my email" follow-up needed.

**How it works:**
- Click a checkbox -> POST to serverless function -> stored in Blobs/KV
- Page load -> GET from serverless function -> restore checkbox state
- Offline fallback -> localStorage (syncs on next connection)
- First click prompts for your name (stored in localStorage)

### Why view tracking with Slack alerts

An edge function runs on every page request. It doesn't add latency -- it fires after the response is already sent (`waitUntil`). It tracks:

- **Total views** per page
- **Per-recipient views** via `?ref=name` parameter
- **First/last view timestamps**

On the **first view from a named ref**, it fires a Slack alert:

> :eyes: **First view** -- dan opened your-proposal
> **Ref:** `dan`
> **When:** Mar 10, 2026, 2:15 PM ET

**Why this matters:** You send a proposal to a client. 10 minutes later, your Slack lights up. They opened it. You now know they're thinking about it. You can follow up at the right time -- not too early (annoying), not too late (they forgot).

The `?ref=name` parameter is how you personalize tracking. Send Dan `?ref=dan` and send Sarah `?ref=sarah`. Same page, different tracking. The share tool at `/share` generates these links for you.

### Why print-first design for one-pagers

One-pagers use `@page { size: letter; margin: 0.5in }`. They're designed to print on a single sheet of paper.

**The context:** You're in a meeting. Someone says "can you send me that overview?" You want them to be able to print it right there, or save it as a PDF that looks intentional -- not like a screenshot of a website. `print-color-adjust: exact` forces colors in print. The toolbar with "Print / Save PDF" disappears when printing.

### Why CSS variables for instant rebranding

Every page uses the same variable system:

```css
:root {
  --accent: #0f766e;      /* swap this one value for client brand */
  --accent-dark: #134e4a;
  --gold: #d97706;
  ...
}
```

Dark mode is a `[data-theme="dark"]` attribute that overrides every variable. OS preference is detected on first visit. The toggle persists in localStorage.

**The workflow:** Copy a template, change `--accent` to your client's brand color, fill in the content, deploy. The entire page rebrands.

---

## What's In This Repo

```
hash-pages/
  README.md                 # You're reading it
  SETUP.md                  # Step-by-step deployment guide
  TEMPLATES.md              # Detailed catalog of every template type

  index.html                # Root page ("Nothing here.")
  netlify.toml              # Edge function config
  package.json              # @netlify/blobs dependency

  netlify/
    functions/
      checklist.mjs         # Server-synced checkbox persistence
      views.mjs             # View stats API (HTML + JSON)
      share.mjs             # Tracking link generator tool
    edge-functions/
      track-views.ts        # View tracking + Slack alerts

  cloudflare/               # Equivalent infrastructure for Cloudflare Pages
    functions/
      _middleware.js         # View tracking middleware
      api/views.js           # View stats API
      api/share.js           # Tracking link generator
    workers/checklist/       # Separate worker for checklist sync
      wrangler.toml
      src/index.js

  _templates/
    landing-page/           # General purpose page (nav, hero, cards, CTA)
    one-pager/              # Print-first, letter-size, single sheet
    calculator/             # Interactive tool with sliders and live results
    proposal/               # B2B proposal with pricing table
    deal-package/           # Multi-page linked documents (proposal + contract + BAA)
    meeting-prep/           # Pre-meeting briefing with bios and soundbites
    debrief/                # Post-meeting analysis with action items

  examples/
    acme-calculator-7f3a1b2c/    # Working calculator example
    acme-onepager-4d8e9f01/      # Working one-pager example
    acme-proposal-b2c4d6e8/      # Working proposal example
```

---

## Page Types

### Interactive Calculator / Tool

**When to use:** Your client needs to play with numbers. Pricing models, ROI calculators, fee breakdowns, financial projections.

**Why it's powerful:** Instead of sending a spreadsheet, you send a URL. The client slides the inputs, sees their specific scenario, and shares a link with their exact configuration baked into the URL hash. They can export to CSV. They can compare scenarios. And you see the moment they open it.

**Key patterns:**
- Range sliders with live-updating value labels
- Toggle buttons for discrete options (monthly/quarterly/annual)
- Results grid that recomputes on every input change
- Scenario comparison cards (conservative / base / aggressive)
- Bar charts built entirely in CSS (no charting library)
- Share via URL hash: `btoa(JSON.stringify(config))` encoded in `#cfg=`
- CSV export via `Blob` + dynamic download link
- `update()` function bound to all inputs -- single source of truth

### Sales One-Pager

**When to use:** Someone asks "what do you do?" and you need a polished answer that fits on one piece of paper and looks good on a phone.

**Why print-first:** The recipient might print this for a board meeting, save it as a PDF for their files, or read it on their phone in a taxi. All three need to work. Letter-size layout with forced print colors means the PDF looks identical to the screen. Dense, information-rich -- every pixel earns its space.

**Key patterns:**
- `@page { size: letter; margin: 0.5in }` for print
- `max-width: 8.5in` screen wrapper
- Fixed toolbar with Print button (hidden `@media print`)
- `-webkit-print-color-adjust: exact` on colored elements
- 9-13px font sizes to fit letter size
- Grid layouts collapse to single column on mobile

### Proposal & Legal Documents

**When to use:** Sending a scoped engagement, contract, or compliance document. Often part of a deal package (see below).

**Why HTML over PDF:** The recipient can read it on any device without a PDF viewer. It's searchable. It has working links. And you can update it after sending -- the URL stays the same, the content can be refreshed.

**Key patterns:**
- Problem/solution two-column layouts with color-coded borders
- Pricing tables with story point columns
- CTA box at the bottom
- For legal docs: wider margins (`0.75in`), larger font (`11pt`) in print

### Deal Package (Multi-Page)

**When to use:** You have 3-4 related documents that form a package -- proposal + contract + BAA, or role description + engineering deep dive + candidate assessment.

**Why linked pages instead of one long page:** Each document has a different audience and purpose. The proposal goes to the decision-maker. The contract goes to legal. The BAA goes to compliance. They need to be independently printable, independently shareable, but cross-referenced.

**Key patterns:**
- Toolbar on every page linking to all siblings
- Relative paths (`../sibling-slug/`) so the package works locally
- Mobile hamburger menu for the toolbar links
- Current page shown as inactive in the nav
- Print hides the toolbar (`no-print` class)

### Meeting Prep & Debrief

**When to use:** Before a meeting (prep) and after (debrief). The prep has bios, talking points, and a join link. The debrief has the strategic read, action items, and cleaned transcript.

**Key patterns:**
- Join bar at top with meeting link and dial-in
- Color-coded callout boxes (green = framing, orange = risks, blue = soundbites)
- Bio cards with photos
- Server-synced checklists for action items
- Prep page links forward to debrief; debrief links back to prep

---

## How It Works

### Creating a Page

1. Generate a hash: `python -c "import secrets; print(secrets.token_hex(4))"`
2. Create a folder: `my-page-a1b2c3d4/`
3. Copy a template and customize it
4. Deploy: `netlify deploy --prod --dir=. --functions=netlify/functions`
5. Share: `https://yourdomain.com/my-page-a1b2c3d4/`

### View Tracking Flow

```
Visitor opens page
       |
  Edge function intercepts (zero latency -- response sent immediately)
       |
  Skip if: root page, static asset, bot, non-GET, non-200
       |
  Extract slug from path: /my-page-a1b2c3d4/ -> my-page-a1b2c3d4
  Extract ref from ?ref=dan -> dan (or "_none")
       |
  Increment view count in Blobs/KV (async, doesn't block)
       |
  If first view for this ref:
    Check dedup sentinel key (_alerted:slug:ref)
    If not already alerted -> fire Slack Block Kit message
    Set sentinel to prevent duplicate alerts
```

### Checklist Sync Flow

```
User clicks checkbox
       |
  Toggle checked state
  POST to /functions/checklist?page=slug
    Body: {key: "item-id", checked: true, by: "Dan"}
       |
  Function reads existing state from Blobs/KV
  Upserts the key with {checked, by, at: timestamp}
  Returns full updated state
       |
  UI updates with "Dan, Mar 10 2:15 PM" metadata
```

### Sharing Flow

```
You create a page -> deploy
You open /share tool -> paste URL + recipient name
Tool generates: https://yourdomain.com/my-page-a1b2c3d4/?ref=dan
You send the link via text/email/Slack
       |
Dan opens the link
Edge function logs: first view, ref=dan
Slack fires: ":eyes: dan opened my-page-a1b2c3d4"
       |
You check stats: /views?page=my-page-a1b2c3d4
See: total views, dan's view count + timestamps
```

---

## Setup

See [SETUP.md](SETUP.md) for the full step-by-step guide. The short version:

1. Fork this repo (keep it private)
2. Create a Netlify site and link it
3. Set environment variables (Blobs token, Slack bot token)
4. `netlify deploy --prod --dir=. --functions=netlify/functions`
5. Point your domain at Netlify

---

## Creating Your First Page

```bash
# Generate a hash
python -c "import secrets; print(secrets.token_hex(4))"
# Output: 7f3a1b2c

# Copy a template
cp -r _templates/one-pager my-product-7f3a1b2c

# Edit the page
# (open my-product-7f3a1b2c/index.html in your editor or let AI generate it)

# Deploy
netlify deploy --prod --dir=. --functions=netlify/functions

# Share
echo "https://yourdomain.com/my-product-7f3a1b2c/"
```

See [TEMPLATES.md](TEMPLATES.md) for detailed guidance on each template type, including what to customize and what to leave alone.

---

## Advanced Patterns

### URL Hash State Sharing (Calculators)

Encode the current input state in the URL hash so anyone with the link sees the same configuration:

```javascript
function shareLink() {
  const cfg = { /* all slider/toggle values */ };
  const encoded = btoa(unescape(encodeURIComponent(JSON.stringify(cfg))));
  const url = location.origin + location.pathname + '#cfg=' + encoded;
  navigator.clipboard.writeText(url);
}

function loadFromHash() {
  if (location.hash.startsWith('#cfg=')) {
    const cfg = JSON.parse(decodeURIComponent(escape(atob(location.hash.slice(5)))));
    // Apply cfg values to all inputs
  }
}
```

### Multi-Page Deal Packages

When documents belong together, add a cross-linking toolbar to every page:

```html
<div class="toolbar no-print">
  <div class="toolbar-links">
    <a href="../proposal-a1b2c3d4/">Proposal</a>
    <a href="../contract-e5f6g7h8/">Contract</a>
    <span class="current">BAA</span>  <!-- current page -->
  </div>
  <button onclick="window.print()">Print / Save PDF</button>
</div>
```

Use `../` relative paths so the package works both deployed and locally.

### SEO / Sharing Meta Tags

Every page needs these for link previews in Slack, iMessage, etc.:

```html
<meta name="robots" content="noindex, nofollow">
<meta name="description" content="One sentence.">
<meta property="og:title" content="Page Title">
<meta property="og:description" content="Short description.">
<meta property="og:type" content="article">
<meta property="og:url" content="https://yourdomain.com/slug/">
<meta name="twitter:card" content="summary">
<meta name="twitter:title" content="Page Title">
<meta name="twitter:description" content="Short description.">
```

`noindex, nofollow` keeps search engines away. The OG/Twitter tags make link previews look professional.

### Using AI to Generate Pages

This system was designed to work with AI coding assistants. The prompt pattern:

> Build me a [page type] for [subject]. Use the template at `_templates/[type]/index.html`.
> Brand color: #2563eb. Content: [your content].

Because each page is self-contained HTML with no framework dependencies, AI assistants can generate complete, working pages in a single pass. No build errors, no import resolution, no "install these 14 packages first."

---

## Production Numbers

This system has shipped 60+ pages across 2 domains in 6 weeks. Page types include:

- 8 interactive calculators and tools
- 12 sales one-pagers and product overviews
- 6 proposals (including multi-page deal packages with contracts and BAAs)
- 10 meeting preps and debriefs
- 8 feature indexes and engineering deep-dives
- 4 resumes and portfolio pages
- Assorted: surveys, release notes, project updates, checklists, thought leadership

Average time to ship a new page from an existing template: 15-30 minutes.

---

## Built By

[Ask the Human LLC](https://askthehuman.com) -- Bert Carroll, fractional CTO and AI-accelerated builder. Story-point pricing, outcome-driven delivery.

This repo is a working example of how I build: AI-assisted development with clear architectural decisions, documented reasoning, and fast iteration. If you want pages like these built for your business, [get in touch](mailto:bert@askthehuman.com).

## License

MIT. See [LICENSE](LICENSE).
