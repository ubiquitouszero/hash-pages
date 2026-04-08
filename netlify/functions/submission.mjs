/**
 * Generic Survey Submission Handler — Hash Pages
 *
 * POST /.netlify/functions/submission
 *
 *   Body: {
 *     form:         "form-identifier",       // required, used to scope storage
 *     title:        "Display Title",          // optional, shown in notifications
 *     contact:      { company, name, email, role, rep },
 *     answers:      { FIELD_NAME: { label, index }, ... },
 *     comment:      "free text",
 *     submitted_at: "2026-04-07T12:34:56Z",
 *     ref:          "tracking-ref",
 *     user_agent:   "..."
 *   }
 *
 * Actions:
 *   1. Validate + normalize the payload
 *   2. Store in Netlify Blobs (store: "submissions", key: <id>)
 *   3. Post a formatted notification to Slack and/or Teams
 *   4. Return { ok: true, id } to the client
 *
 * Env vars (all optional — function gracefully skips missing destinations):
 *   NETLIFY_BLOBS_TOKEN  Netlify PAT for Blobs (only needed when running outside the deploy context)
 *   SITE_ID              Netlify site ID (paired with the token above)
 *   SLACK_BOT_TOKEN      Slack bot token (chat:write scope)
 *   SLACK_CHANNEL_ID     Slack channel ID to post into
 *   TEAMS_WEBHOOK_URL    Microsoft Teams incoming webhook URL (Power Automate or legacy O365)
 *
 * Customizing per-form pricing or extra logic:
 *   This file is generic. If you need form-specific computation (pricing,
 *   scoring, lead routing), copy this function to a new file alongside it
 *   (e.g. paycom-intake.mjs) and import the helpers, or wrap the response.
 */

import { getStore } from "@netlify/blobs";

const JSON_HEADERS = {
  "Content-Type": "application/json",
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

function blobStore(name) {
  if (process.env.SITE_ID && process.env.NETLIFY_BLOBS_TOKEN) {
    return getStore({
      name,
      siteID: process.env.SITE_ID,
      token: process.env.NETLIFY_BLOBS_TOKEN,
    });
  }
  return getStore(name);
}

function newId(prefix = "SUB") {
  const ts = new Date().toISOString().replace(/[-:.TZ]/g, "").slice(0, 14);
  const rand = Math.random().toString(36).slice(2, 8).toUpperCase();
  return `${prefix}-${ts}-${rand}`;
}

function clean(str, max = 2000) {
  if (typeof str !== "string") return "";
  return str.replace(/[\x00-\x08\x0b\x0c\x0e-\x1f]/g, "").trim().slice(0, max);
}

function isEmail(str) {
  return typeof str === "string" && /^\S+@\S+\.\S+$/.test(str);
}

function formatTimestamp(iso) {
  return new Date(iso).toLocaleString("en-US", {
    timeZone: "America/New_York",
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

function humanizeFieldName(field) {
  return field
    .toLowerCase()
    .replace(/_/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

/* ==========================================================================
 * Slack notification (Block Kit)
 * ========================================================================== */
function buildSlackBlocks(record) {
  const { id, contact, answers, comment, ref, submitted_at, title } = record;
  const when = formatTimestamp(submitted_at);

  const contactLines = [
    `*Company:* ${contact.company || "-"}`,
    `*Contact:* ${contact.name || "-"}${contact.role ? ` (${contact.role})` : ""}`,
    `*Email:* ${contact.email || "-"}`,
  ];
  if (contact.rep) contactLines.push(`*Referrer:* ${contact.rep}`);

  const answerLines = Object.entries(answers || {}).map(
    ([field, v]) => `• *${humanizeFieldName(field)}:* ${v.label}`
  );

  const blocks = [
    {
      type: "header",
      text: { type: "plain_text", text: title || "New Submission", emoji: true },
    },
    { type: "section", text: { type: "mrkdwn", text: contactLines.join("\n") } },
    {
      type: "section",
      text: {
        type: "mrkdwn",
        text: answerLines.join("\n") || "_(no answers)_",
      },
    },
  ];

  if (comment) {
    blocks.push({
      type: "section",
      text: {
        type: "mrkdwn",
        text: `*Notes:*\n>${comment.replace(/\n/g, "\n>")}`,
      },
    });
  }

  blocks.push({
    type: "context",
    elements: [
      {
        type: "mrkdwn",
        text: `Ref: \`${ref || "direct"}\` • Submitted: ${when} ET • ID: \`${id}\``,
      },
    ],
  });

  return blocks;
}

async function postToSlack(record) {
  const token = process.env.SLACK_BOT_TOKEN;
  const channel = process.env.SLACK_CHANNEL_ID;
  if (!token || !channel) return { skipped: true };

  const res = await fetch("https://slack.com/api/chat.postMessage", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json; charset=utf-8",
    },
    body: JSON.stringify({
      channel,
      text: `${record.title || "New submission"} from ${record.contact?.company || "unknown"}`,
      blocks: buildSlackBlocks(record),
    }),
  });

  const data = await res.json().catch(() => ({}));
  if (!data.ok) console.error("Slack post failed:", data);
  return data;
}

/* ==========================================================================
 * Microsoft Teams notification (Adaptive Card)
 *
 * Works with both Power Automate Workflows and legacy O365 Connector webhooks.
 * The "type: message + attachments" envelope is required by Workflows but
 * still accepted by legacy Connectors.
 * ========================================================================== */
function buildTeamsCard(record) {
  const { id, contact, answers, comment, ref, submitted_at, title } = record;
  const when = formatTimestamp(submitted_at);

  const contactFacts = [
    { title: "Company", value: contact.company || "-" },
    {
      title: "Contact",
      value: `${contact.name || "-"}${contact.role ? ` (${contact.role})` : ""}`,
    },
    { title: "Email", value: contact.email || "-" },
  ];
  if (contact.rep) contactFacts.push({ title: "Referrer", value: contact.rep });

  const answerFacts = Object.entries(answers || {}).map(([field, v]) => ({
    title: humanizeFieldName(field),
    value: v.label,
  }));

  const body = [
    {
      type: "TextBlock",
      text: title || "New Submission",
      weight: "Bolder",
      size: "Large",
      color: "Accent",
      wrap: true,
    },
    { type: "FactSet", facts: contactFacts, spacing: "Medium" },
    {
      type: "TextBlock",
      text: "Answers",
      weight: "Bolder",
      size: "Medium",
      spacing: "Medium",
      separator: true,
    },
  ];

  if (answerFacts.length) {
    body.push({ type: "FactSet", facts: answerFacts });
  } else {
    body.push({
      type: "TextBlock",
      text: "(no answers submitted)",
      isSubtle: true,
      wrap: true,
    });
  }

  if (comment) {
    body.push(
      {
        type: "TextBlock",
        text: "Notes",
        weight: "Bolder",
        size: "Medium",
        spacing: "Medium",
        separator: true,
      },
      { type: "TextBlock", text: comment, wrap: true }
    );
  }

  body.push({
    type: "TextBlock",
    text: `ID: ${id}  |  Ref: ${ref || "direct"}  |  Submitted: ${when} ET`,
    isSubtle: true,
    size: "Small",
    spacing: "Medium",
    separator: true,
    wrap: true,
  });

  return {
    type: "message",
    attachments: [
      {
        contentType: "application/vnd.microsoft.card.adaptive",
        contentUrl: null,
        content: {
          $schema: "http://adaptivecards.io/schemas/adaptive-card.json",
          type: "AdaptiveCard",
          version: "1.4",
          body,
        },
      },
    ],
  };
}

async function postToTeams(record) {
  const url = process.env.TEAMS_WEBHOOK_URL;
  if (!url) return { skipped: true };

  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json; charset=utf-8" },
    body: JSON.stringify(buildTeamsCard(record)),
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    console.error(`Teams post failed: ${res.status} ${text}`);
    return { ok: false, status: res.status };
  }
  return { ok: true, status: res.status };
}

/* ==========================================================================
 * Handler
 * ========================================================================== */
export const handler = async (event) => {
  if (event.httpMethod === "OPTIONS") {
    return { statusCode: 204, headers: JSON_HEADERS, body: "" };
  }
  if (event.httpMethod !== "POST") {
    return {
      statusCode: 405,
      headers: JSON_HEADERS,
      body: JSON.stringify({ error: "method not allowed" }),
    };
  }

  let payload;
  try {
    payload = JSON.parse(event.body || "{}");
  } catch {
    return {
      statusCode: 400,
      headers: JSON_HEADERS,
      body: JSON.stringify({ error: "invalid json" }),
    };
  }

  const form = clean(payload?.form, 80) || "submission";
  if (!/^[a-z0-9-]+$/.test(form)) {
    return {
      statusCode: 400,
      headers: JSON_HEADERS,
      body: JSON.stringify({ error: "invalid form identifier" }),
    };
  }

  const contact = {
    company: clean(payload?.contact?.company, 200),
    name: clean(payload?.contact?.name, 200),
    email: clean(payload?.contact?.email, 200),
    role: clean(payload?.contact?.role, 200),
    rep: clean(payload?.contact?.rep, 200),
  };

  if (!contact.company || !contact.name || !isEmail(contact.email)) {
    return {
      statusCode: 400,
      headers: JSON_HEADERS,
      body: JSON.stringify({ error: "missing required contact fields" }),
    };
  }

  const answers = {};
  if (payload?.answers && typeof payload.answers === "object") {
    for (const [field, v] of Object.entries(payload.answers)) {
      if (!/^[A-Z][A-Z0-9_]*$/.test(field)) continue;
      answers[field] = {
        label: clean(v?.label, 300),
        index: Number.isInteger(v?.index) ? v.index : null,
      };
    }
  }

  const id = newId(form.toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 6) || "SUB");
  const record = {
    id,
    form,
    title: clean(payload?.title, 200) || humanizeFieldName(form),
    contact,
    answers,
    comment: clean(payload?.comment, 4000),
    ref: clean(payload?.ref, 80) || "direct",
    submitted_at: payload?.submitted_at || new Date().toISOString(),
    user_agent: clean(payload?.user_agent, 500),
    ip: event.headers?.["x-forwarded-for"]?.split(",")[0]?.trim() || null,
  };

  // Store the submission in Blobs (best-effort, doesn't fail the request)
  try {
    const store = blobStore("submissions");
    await store.setJSON(`${form}/${id}`, record);
  } catch (err) {
    console.error("Blobs store failed:", err);
  }

  // Post to Slack and Teams in parallel (best-effort)
  await Promise.allSettled([postToSlack(record), postToTeams(record)]);

  return {
    statusCode: 200,
    headers: JSON_HEADERS,
    body: JSON.stringify({ ok: true, id }),
  };
};
