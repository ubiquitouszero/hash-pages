/**
 * View Stats API (Cloudflare Pages Function)
 *
 * GET /api/views?page=slug -> HTML for browsers, JSON for scripts
 */

export async function onRequestGet(context) {
  const url = new URL(context.request.url);
  const page = url.searchParams.get("page");
  const format = url.searchParams.get("format");

  if (!page || !/^[a-z0-9-]+$/.test(page)) {
    return new Response(JSON.stringify({ error: "page parameter required" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  const kvKey = `views:${page}`;
  const data = (await context.env.PAGE_VIEWS.get(kvKey, { type: "json" })) || { total: 0, refs: {} };

  const accept = context.request.headers.get("accept") || "";
  if (format === "json" || !accept.includes("text/html")) {
    return new Response(JSON.stringify(data, null, 2), {
      headers: { "Content-Type": "application/json", "Cache-Control": "no-cache" },
    });
  }

  // Return styled HTML (same as Netlify version)
  const namedRefs = Object.keys(data.refs || {}).filter((r) => r !== "_none");
  const refs = Object.entries(data.refs || {})
    .sort((a, b) => b[1].count - a[1].count)
    .map(([name, r]) => {
      const label = name === "_none" ? "Direct (no ref)" : name;
      return `<tr><td><strong>${label}</strong></td><td>${r.count}</td><td>${r.first || "--"}</td><td>${r.last || "--"}</td></tr>`;
    })
    .join("");

  const html = `<!DOCTYPE html><html><head><meta charset="UTF-8"><meta name="robots" content="noindex"><title>Views - ${page}</title>
<style>body{font-family:system-ui;max-width:680px;margin:40px auto;padding:0 20px;background:#f1f5f9}
.card{background:#fff;border-radius:12px;box-shadow:0 2px 12px rgba(0,0,0,.08);overflow:hidden}
.header{background:linear-gradient(135deg,#1e3a5f,#2563eb);color:#fff;padding:24px}
.header h1{font-size:18px}
.stats{display:grid;grid-template-columns:repeat(3,1fr);text-align:center;gap:1px;background:#e2e8f0}
.stat{background:#fff;padding:16px}.stat .num{font-size:28px;font-weight:800;color:#2563eb}
.stat .label{font-size:11px;color:#64748b;text-transform:uppercase}
table{width:100%;border-collapse:collapse;padding:20px}th,td{padding:8px;text-align:left;border-bottom:1px solid #f1f5f9;font-size:13px}
th{font-size:10px;text-transform:uppercase;color:#94a3b8}</style></head>
<body><div class="card"><div class="header"><h1>${page}</h1></div>
<div class="stats"><div class="stat"><div class="num">${data.total||0}</div><div class="label">Total Views</div></div>
<div class="stat"><div class="num">${namedRefs.length}</div><div class="label">Named Refs</div></div>
<div class="stat"><div class="num">${data.first_view?new Date(data.first_view).toLocaleDateString():"--"}</div><div class="label">First View</div></div></div>
<div style="padding:20px"><table><thead><tr><th>Ref</th><th>Views</th><th>First</th><th>Last</th></tr></thead><tbody>${refs||"<tr><td colspan=4 style=text-align:center;color:#94a3b8>No views yet</td></tr>"}</tbody></table></div></div></body></html>`;

  return new Response(html, {
    headers: { "Content-Type": "text/html; charset=utf-8", "Cache-Control": "no-cache" },
  });
}
