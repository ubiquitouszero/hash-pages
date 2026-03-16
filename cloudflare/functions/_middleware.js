/**
 * Cloudflare Pages Middleware -- View Tracking
 *
 * Equivalent to the Netlify edge function.
 * Runs on every request, tracks views in KV.
 */

const SKIP_EXTENSIONS =
  /\.(js|css|png|jpg|jpeg|gif|svg|ico|woff|woff2|ttf|eot|webp|avif|map|json)$/i;

const BOT_PATTERNS =
  /bot|crawl|spider|slurp|facebookexternalhit|linkedinbot|twitterbot|slackbot|discordbot|whatsapp|telegrambot|preview|fetch|curl|wget|python-requests|httpie|postman/i;

export async function onRequest(context) {
  const { request, next, env, waitUntil } = context;
  const response = await next();

  const url = new URL(request.url);
  const pathname = url.pathname;

  if (
    pathname === "/" ||
    pathname === "/index.html" ||
    SKIP_EXTENSIONS.test(pathname) ||
    pathname.startsWith("/api/") ||
    request.method !== "GET" ||
    response.status !== 200
  ) {
    return response;
  }

  const userAgent = request.headers.get("user-agent") || "";
  if (!userAgent || BOT_PATTERNS.test(userAgent)) {
    return response;
  }

  const slug = pathname.replace(/^\//, "").replace(/\/$/, "").replace(/\/index\.html$/, "");
  if (!slug || slug.includes("/")) return response;

  const ref = url.searchParams.get("ref")?.toLowerCase().replace(/[^a-z0-9-]/g, "") || "_none";

  waitUntil(trackView(env, slug, ref));

  return response;
}

async function trackView(env, slug, ref) {
  const now = new Date().toISOString();
  const kvKey = `views:${slug}`;

  try {
    const raw = await env.PAGE_VIEWS.get(kvKey, { type: "json" });
    const existing = raw || { total: 0, first_view: now, last_view: now, refs: {} };

    existing.total += 1;
    existing.last_view = now;

    const isFirstForRef = !existing.refs[ref];
    if (!existing.refs[ref]) {
      existing.refs[ref] = { count: 0, first: now, last: now };
    }
    existing.refs[ref].count += 1;
    existing.refs[ref].last = now;

    await env.PAGE_VIEWS.put(kvKey, JSON.stringify(existing));

    if (ref !== "_none" && isFirstForRef) {
      const alertKey = `alerted:${slug}:${ref}`;
      const alreadyAlerted = await env.PAGE_VIEWS.get(alertKey);
      if (!alreadyAlerted) {
        await env.PAGE_VIEWS.put(alertKey, "1");
        await sendSlackAlert(env, slug, ref, now);
      }
    }
  } catch (err) {
    console.error("View tracking error:", err);
  }
}

async function sendSlackAlert(env, slug, ref, timestamp) {
  const token = env.SLACK_BOT_TOKEN;
  const channel = env.SLACK_CHANNEL_ID;
  if (!token || !channel) return;

  const when = new Date(timestamp).toLocaleString("en-US", {
    timeZone: "America/New_York",
    month: "short", day: "numeric", year: "numeric",
    hour: "numeric", minute: "2-digit",
  });

  await fetch("https://slack.com/api/chat.postMessage", {
    method: "POST",
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json; charset=utf-8" },
    body: JSON.stringify({
      channel,
      text: `:eyes: First view: ${ref} opened ${slug}`,
      blocks: [{
        type: "section",
        text: { type: "mrkdwn", text: `:eyes: *First view* -- ${slug}\n*Ref:* \`${ref}\`\n*When:* ${when} ET` },
      }],
    }),
  });
}
