/**
 * Tracking Link Generator
 *
 * Browser-only tool -- paste a page URL + recipient name, get a tracked link.
 * No server state needed. Pure client-side UI served from a function.
 */

export const handler = async (event) => {
  if (event.httpMethod !== "GET") {
    return { statusCode: 405, body: "Method not allowed" };
  }

  return {
    statusCode: 200,
    headers: { "Content-Type": "text/html; charset=utf-8", "Cache-Control": "no-cache" },
    body: renderPage(),
  };
};

function renderPage() {
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<meta name="robots" content="noindex, nofollow">
<title>Share with Tracking</title>
<style>
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; background: #f1f5f9; color: #1e293b; line-height: 1.5; }
  .container { max-width: 520px; margin: 60px auto; padding: 0 20px; }
  .card { background: white; border-radius: 12px; box-shadow: 0 2px 12px rgba(0,0,0,0.08); overflow: hidden; }
  .header { background: linear-gradient(135deg, #1e3a5f, #2563eb); color: white; padding: 24px 28px; text-align: center; }
  .header h1 { font-size: 18px; font-weight: 700; margin-bottom: 4px; }
  .header p { font-size: 13px; opacity: 0.9; }
  .form { padding: 24px 28px; }
  label { display: block; font-size: 12px; font-weight: 600; color: #475569; text-transform: uppercase; letter-spacing: 0.04em; margin-bottom: 6px; margin-top: 16px; }
  label:first-child { margin-top: 0; }
  input[type="text"] { width: 100%; padding: 10px 14px; border: 1px solid #e2e8f0; border-radius: 8px; font-size: 14px; font-family: inherit; color: #1e293b; transition: border-color 0.15s; }
  input:focus { outline: none; border-color: #2563eb; box-shadow: 0 0 0 3px rgba(37,99,235,0.1); }
  .hint { font-size: 11px; color: #94a3b8; margin-top: 4px; }
  .output { margin-top: 20px; display: none; }
  .output.visible { display: block; }
  .result-url { width: 100%; padding: 12px 14px; background: #eff6ff; border: 2px solid #2563eb; border-radius: 8px; font-family: 'SF Mono', 'Fira Code', monospace; font-size: 13px; color: #1e3a5f; word-break: break-all; cursor: pointer; }
  .result-url:hover { background: #dbeafe; }
  .actions { display: flex; gap: 8px; margin-top: 10px; }
  .btn { flex: 1; padding: 10px; border: none; border-radius: 8px; font-size: 13px; font-weight: 600; cursor: pointer; font-family: inherit; }
  .btn-copy { background: #2563eb; color: white; }
  .btn-copy:hover { background: #1d4ed8; }
  .btn-copy.copied { background: #1e3a5f; }
  .btn-views { background: #f1f5f9; color: #475569; }
  .btn-views:hover { background: #e2e8f0; }
</style>
</head>
<body>
<div class="container">
  <div class="card">
    <div class="header">
      <h1>Share with Tracking</h1>
      <p>Generate a tracked link for any page</p>
    </div>
    <div class="form">
      <label for="url">Page URL or Slug</label>
      <input type="text" id="url" placeholder="https://yourdomain.com/my-page-a1b2c3d4/" autocomplete="off" spellcheck="false">
      <div class="hint">Paste any page URL or just the slug</div>
      <label for="ref">Recipient Name</label>
      <input type="text" id="ref" placeholder="dan, sarah, investor" autocomplete="off" spellcheck="false">
      <div class="hint">Lowercase, letters/numbers/hyphens. Shows in Slack alerts and view stats.</div>
      <div class="output" id="output">
        <label>Tracked Link</label>
        <div class="result-url" id="result" onclick="copyLink()" title="Click to copy"></div>
        <div class="actions">
          <button class="btn btn-copy" id="copyBtn" onclick="copyLink()">Copy Link</button>
          <button class="btn btn-views" id="viewsBtn" onclick="openViews()">View Stats</button>
        </div>
      </div>
    </div>
  </div>
</div>
<script>
const urlInput = document.getElementById('url');
const refInput = document.getElementById('ref');
const output = document.getElementById('output');
const result = document.getElementById('result');
const copyBtn = document.getElementById('copyBtn');
let currentSlug = '';

function update() {
  const raw = urlInput.value.trim();
  const ref = refInput.value.trim().toLowerCase().replace(/[^a-z0-9-]/g, '');
  let slug = '';
  try {
    if (raw.includes('/')) {
      const u = new URL(raw.startsWith('http') ? raw : 'https://' + raw);
      slug = u.pathname.replace(/^\\//, '').replace(/\\/$/, '');
    } else if (/^[a-z0-9-]+$/.test(raw)) {
      slug = raw;
    }
  } catch(e) { slug = raw.replace(/^\\//,'').replace(/\\/$/,''); }
  if (!slug || !ref) { output.classList.remove('visible'); return; }
  currentSlug = slug;
  refInput.value = ref;
  const tracked = location.origin + '/' + slug + '/?ref=' + ref;
  result.textContent = tracked;
  output.classList.add('visible');
}

urlInput.addEventListener('input', update);
refInput.addEventListener('input', update);

function copyLink() {
  navigator.clipboard.writeText(result.textContent).then(() => {
    copyBtn.textContent = 'Copied!';
    copyBtn.classList.add('copied');
    setTimeout(() => { copyBtn.textContent = 'Copy Link'; copyBtn.classList.remove('copied'); }, 2000);
  });
}

function openViews() {
  if (currentSlug) window.open('/.netlify/functions/views?page=' + currentSlug, '_blank');
}
</script>
</body>
</html>`;
}
