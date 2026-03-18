# Contributing to Hash Pages

Thanks for considering a contribution. This is a small project but useful things tend to grow.

## Templates

The most useful contribution is a new page template. Drop it in `_templates/your-template-name/` with:

- `index.html` -- self-contained, inline CSS/JS, no external dependencies
- `README.md` -- what it's for, screenshot if applicable
- Checklist sync wired up if checkboxes are involved (`/.netlify/functions/checklist` or `/api/checklist`)

Look at `_templates/calculator/` or `_templates/one-pager/` for the pattern.

## Bug Fixes

If something is broken, open an issue or PR. Include:

- What you expected
- What happened
- Which platform (Netlify or Cloudflare)

## Code Style

- No frameworks, no build tools, no transpilation
- Self-contained HTML files with inline `<style>` and `<script>`
- CSS variables for theming (see any existing template)
- Mobile-first, dark mode support, print styles

## License

By contributing, you agree that your contributions will be licensed under the MIT License.
