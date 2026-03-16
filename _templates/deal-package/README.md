# Deal Package Template

A deal package is a set of linked documents that form a complete closing package.
Typical set: **Proposal + Contract + BAA (if HIPAA) + Internal Debrief**

## How It Works

Each document is a separate page folder. Every page has a toolbar at the top
linking to all sibling documents. The toolbar uses relative paths (`../`) so
the package works both deployed and when opened locally.

## Creating a Deal Package

```bash
# Generate hashes for each document
python -c "import secrets; print(secrets.token_hex(4))"  # e.g., a1b2c3d4
python -c "import secrets; print(secrets.token_hex(4))"  # e.g., e5f6g7h8
python -c "import secrets; print(secrets.token_hex(4))"  # e.g., i9j0k1l2

# Create folders
mkdir client-proposal-a1b2c3d4
mkdir client-contract-e5f6g7h8
mkdir client-baa-i9j0k1l2

# Copy templates and customize
cp proposal-template.html client-proposal-a1b2c3d4/index.html
cp contract-template.html client-contract-e5f6g7h8/index.html
cp baa-template.html client-baa-i9j0k1l2/index.html
```

## Toolbar Pattern

Add this to every page, updating the links and marking the current page:

```html
<div class="toolbar no-print">
  <div class="toolbar-links">
    <span class="current">Proposal</span>  <!-- current page -->
    <a href="../client-contract-e5f6g7h8/">Contract</a>
    <a href="../client-baa-i9j0k1l2/">HIPAA BAA</a>
  </div>
  <button onclick="window.print()">Print / Save PDF</button>
</div>
```

## Mobile Hamburger

For 4+ links, add a mobile hamburger menu:

```html
<button class="hamburger no-print" onclick="document.getElementById('mobileMenu').classList.toggle('open')">&#9776;</button>
<div id="mobileMenu" class="toolbar-mobile no-print">
  <a href="../client-proposal-a1b2c3d4/">Proposal</a>
  <a href="../client-contract-e5f6g7h8/">Contract</a>
  <a href="../client-baa-i9j0k1l2/">HIPAA BAA</a>
</div>
```

## Tips

- Use longer hashes (`token_hex(16)`) for client-facing legal documents
- Legal docs should use wider margins (`0.75in`) and larger font (`11pt`) in print
- Toolbar links use `../` relative paths -- works both deployed and locally
- The `.no-print` class hides the toolbar when printing
- Each document should be independently printable as a standalone PDF
