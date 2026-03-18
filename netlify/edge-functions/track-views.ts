/**
 * View Tracking Edge Function
 *
 * Intercepts page requests, serves the response immediately,
 * then tracks the view in Netlify Blobs and sends Slack alerts
 * on first view per ref+page combo.
 */

import { getStore } from "https://esm.sh/@netlify/blobs@8.1.0";
import type { Context } from "https://edge.netlify.com";

const SKIP_EXTENSIONS =
  /\.(js|css|png|jpg|jpeg|gif|svg|ico|woff|woff2|ttf|eot|webp|avif|map|json|mjs)$/i;

const BOT_PATTERNS =
  /bot|crawl|spider|slurp|facebookexternalhit|linkedinbot|twitterbot|slackbot|discordbot|whatsapp|telegrambot|preview|fetch|curl|wget|python-requests|httpie|postman/i;

// Edge functions can use getStore with just a name when deployed on Netlify.
// For manual config, set SITE_ID and NETLIFY_BLOBS_TOKEN env vars.

export default async (request: Request, context: Context) => {
  const response = await context.next();

  const url = new URL(request.url);
  const pathname = url.pathname;

  // Skip: root, assets, functions, non-GET, errors
  if (
    pathname === "/" ||
    pathname === "/index.html" ||
    SKIP_EXTENSIONS.test(pathname) ||
    pathname.startsWith("/.netlify/") ||
    request.method !== "GET" ||
    response.status !== 200
  ) {
    return response;
  }

  const userAgent = request.headers.get("user-agent") || "";
  if (!userAgent || BOT_PATTERNS.test(userAgent)) {
    return response;
  }

  // Extract slug: /my-page-a1b2c3d4/ -> my-page-a1b2c3d4
  const slug = pathname
    .replace(/^\//, "")
    .replace(/\/$/, "")
    .replace(/\/index\.html$/, "");

  if (!slug || slug.includes("/")) {
    return response;
  }

  const ref =
    url.searchParams.get("ref")?.toLowerCase().replace(/[^a-z0-9-]/g, "") ||
    "_none";

  // Fire and forget -- doesn't block the response
  context.waitUntil(trackView(context, slug, ref));

  return response;
};

async function trackView(context: Context, slug: string, ref: string) {
  const now = new Date().toISOString();
  const token = Netlify.env.get("NETLIFY_BLOBS_TOKEN") || "";
  const siteID = Netlify.env.get("SITE_ID") || "";

  const store = token && siteID
    ? getStore({ name: "page-views", siteID, token })
    : getStore("page-views");

  try {
    const existing = (await store.get(slug, { type: "json" })) as any || {
      total: 0,
      first_view: now,
      last_view: now,
      refs: {},
    };

    existing.total += 1;
    existing.last_view = now;

    const isFirstForRef = !existing.refs[ref];

    if (!existing.refs[ref]) {
      existing.refs[ref] = { count: 0, first: now, last: now };
    }
    existing.refs[ref].count += 1;
    existing.refs[ref].last = now;

    await store.setJSON(slug, existing);

    // Slack alert on first view for a named ref
    if (ref !== "_none" && isFirstForRef) {
      const alertKey = `_alerted:${slug}:${ref}`;
      const alreadyAlerted = await store.get(alertKey);

      if (!alreadyAlerted) {
        await store.set(alertKey, "1");
        await sendAlerts(slug, ref, now);
      }
    }
  } catch (err) {
    console.error("View tracking error:", err);
  }
}

async function sendAlerts(slug: string, ref: string, timestamp: string) {
  await Promise.allSettled([
    sendSlackAlert(slug, ref, timestamp),
    sendTeamsAlert(slug, ref, timestamp),
  ]);
}

async function sendSlackAlert(slug: string, ref: string, timestamp: string) {
  const token = Netlify.env.get("SLACK_BOT_TOKEN");
  const channel = Netlify.env.get("SLACK_CHANNEL_ID");
  if (!token || !channel) return;

  const when = formatTimestamp(timestamp);

  await fetch("https://slack.com/api/chat.postMessage", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json; charset=utf-8",
    },
    body: JSON.stringify({
      channel,
      text: `:eyes: First view: ${ref} opened ${slug}`,
      blocks: [
        {
          type: "section",
          text: {
            type: "mrkdwn",
            text: `:eyes: *First view* -- ${slug}\n*Ref:* \`${ref}\`\n*When:* ${when} ET`,
          },
        },
      ],
    }),
  });
}

async function sendTeamsAlert(slug: string, ref: string, timestamp: string) {
  const webhookUrl = Netlify.env.get("TEAMS_WEBHOOK_URL");
  if (!webhookUrl) return;

  const when = formatTimestamp(timestamp);
  const siteUrl = Netlify.env.get("SITE_URL") || Netlify.env.get("URL") || "https://share.example.com";
  const pageUrl = `${siteUrl}/${slug}/`;

  await fetch(webhookUrl, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      type: "message",
      attachments: [{
        contentType: "application/vnd.microsoft.card.adaptive",
        content: {
          $schema: "http://adaptivecards.io/schemas/adaptive-card.json",
          type: "AdaptiveCard",
          version: "1.4",
          body: [
            {
              type: "TextBlock",
              size: "Medium",
              weight: "Bolder",
              text: "First view",
            },
            {
              type: "FactSet",
              facts: [
                { title: "Page", value: slug },
                { title: "Ref", value: ref },
                { title: "When", value: `${when} ET` },
              ],
            },
          ],
          actions: [
            {
              type: "Action.OpenUrl",
              title: "View Page",
              url: pageUrl,
            },
            {
              type: "Action.OpenUrl",
              title: "View Stats",
              url: `${siteUrl}/api/views?page=${slug}`,
            },
          ],
        },
      }],
    }),
  });
}

function formatTimestamp(timestamp: string): string {
  return new Date(timestamp).toLocaleString("en-US", {
    timeZone: "America/New_York",
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}
