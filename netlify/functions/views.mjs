/**
 * View Data API
 *
 * GET /.netlify/functions/views?page=slug  -> view data (HTML for browsers, JSON for scripts)
 *
 * No all-pages endpoint -- slugs are the access control.
 */

import { getStore } from "@netlify/blobs";

// TODO: Replace with your Netlify Site ID
const SITE_ID = "YOUR_NETLIFY_SITE_ID";

const JSON_HEADERS = {
  "Content-Type": "application/json",
  "Access-Control-Allow-Origin": "*",
  "Cache-Control": "no-cache",
};

function formatTime(iso) {
  if (!iso) return "--";
  return (
    new Date(iso).toLocaleString("en-US", {
      timeZone: "America/New_York",
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit",
    }) + " ET"
  );
}

function renderHTML(page, data) {
  const refs = Object.entries(data.refs || {})
    .sort((a, b) => b[1].count - a[1].count)
    .map(([name, r]) => {
      const isAnon = name === "_none";
      const label = isAnon ? "Direct (no ref)" : name;
      const cls = isAnon ? ' class="anon"' : "";
      return `<tr${cls}>
        <td><strong>${label}</strong></td>
        <td>${r.count}</td>
        <td>${formatTime(r.first)}</td>
        <td>${formatTime(r.last)}</td>
      </tr>`;
    })
    .join("\n");

  const namedRefs = Object.keys(data.refs || {}).filter((r) => r !== "_none");

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<meta name="robots" content="noindex, nofollow">
<title>Views -- ${page}</title>
<style>
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; background: #f1f5f9; color: #1e293b; line-height: 1.5; }
  .container { max-width: 680px; margin: 40px auto; padding: 0 20px; }
  .header { background: linear-gradient(135deg, #1e3a5f, #2563eb); color: white; padding: 24px 28px; border-radius: 12px 12px 0 0; }
  .header h1 { font-size: 18px; font-weight: 700; margin-bottom: 4px; }
  .header a { color: #93c5fd; text-decoration: none; font-size: 13px; }
  .stats { display: grid; grid-template-columns: repeat(3, 1fr); gap: 1px; background: #e2e8f0; }
  .stat { background: white; padding: 16px; text-align: center; }
  .stat .num { font-size: 28px; font-weight: 800; color: #2563eb; }
  .stat .label { font-size: 11px; color: #64748b; text-transform: uppercase; letter-spacing: 0.08em; }
  .card { background: white; border-radius: 0 0 12px 12px; box-shadow: 0 2px 12px rgba(0,0,0,0.08); overflow: hidden; }
  .section { padding: 20px 28px; }
  .section h2 { font-size: 12px; font-weight: 700; color: #2563eb; text-transform: uppercase; letter-spacing: 0.06em; margin-bottom: 12px; }
  table { width: 100%; border-collapse: collapse; }
  th { font-size: 10px; text-transform: uppercase; letter-spacing: 0.06em; color: #94a3b8; text-align: left; padding: 6px 0; border-bottom: 1px solid #e2e8f0; }
  td { font-size: 13px; padding: 8px 0; border-bottom: 1px solid #f1f5f9; }
  tr.anon td { color: #94a3b8; }
  .empty { text-align: center; padding: 32px; color: #94a3b8; font-size: 14px; }
  .meta { padding: 16px 28px; border-top: 1px solid #f1f5f9; font-size: 11px; color: #94a3b8; display: flex; justify-content: space-between; }
  .meta a { color: #2563eb; text-decoration: none; }
</style>
</head>
<body>
<div class="container">
  <div class="card">
    <div class="header">
      <h1>${page}</h1>
    </div>
    <div class="stats">
      <div class="stat"><div class="num">${data.total || 0}</div><div class="label">Total Views</div></div>
      <div class="stat"><div class="num">${namedRefs.length}</div><div class="label">Named Refs</div></div>
      <div class="stat"><div class="num">${formatTime(data.first_view).split(",")[0] || "--"}</div><div class="label">First View</div></div>
    </div>
    ${
      refs
        ? '<div class="section"><h2>Views by Ref</h2><table><thead><tr><th>Ref</th><th>Views</th><th>First</th><th>Last</th></tr></thead><tbody>' + refs + '</tbody></table></div>'
        : '<div class="empty">No views yet</div>'
    }
    <div class="meta">
      <span>Last view: ${formatTime(data.last_view)}</span>
      <a href="/.netlify/functions/views?page=${page}&format=json">JSON</a>
    </div>
  </div>
</div>
</body>
</html>`;
}

export const handler = async (event) => {
  if (event.httpMethod === "OPTIONS") {
    return {
      statusCode: 204,
      headers: { ...JSON_HEADERS, "Access-Control-Allow-Methods": "GET, OPTIONS", "Access-Control-Allow-Headers": "Content-Type" },
      body: "",
    };
  }

  if (event.httpMethod !== "GET") {
    return { statusCode: 405, headers: JSON_HEADERS, body: JSON.stringify({ error: "method not allowed" }) };
  }

  const page = event.queryStringParameters?.page;
  const format = event.queryStringParameters?.format;

  if (!page || !/^[a-z0-9-]+$/.test(page)) {
    return { statusCode: 400, headers: JSON_HEADERS, body: JSON.stringify({ error: "page parameter required (lowercase, numbers, hyphens)" }) };
  }

  const store = getStore({ name: "page-views", siteID: SITE_ID, token: process.env.NETLIFY_BLOBS_TOKEN });
  const data = (await store.get(page, { type: "json" })) || { total: 0, refs: {} };

  const accept = event.headers?.accept || "";
  if (format === "json" || !accept.includes("text/html")) {
    return { statusCode: 200, headers: JSON_HEADERS, body: JSON.stringify(data, null, 2) };
  }

  return {
    statusCode: 200,
    headers: { "Content-Type": "text/html; charset=utf-8", "Cache-Control": "no-cache" },
    body: renderHTML(page, data),
  };
};
