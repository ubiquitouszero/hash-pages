import { getStore } from "@netlify/blobs";

// TODO: Replace with your Netlify Site ID (found in Site Settings > General)
const SITE_ID = "YOUR_NETLIFY_SITE_ID";

export const handler = async (event) => {
  const headers = {
    "Content-Type": "application/json",
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
  };

  if (event.httpMethod === "OPTIONS") {
    return { statusCode: 204, headers, body: "" };
  }

  const page = event.queryStringParameters?.page;

  if (!page || !/^[a-z0-9-]+$/.test(page)) {
    return {
      statusCode: 400,
      headers,
      body: JSON.stringify({ error: "invalid page" }),
    };
  }

  const store = getStore({
    name: "checklists",
    siteID: SITE_ID,
    token: process.env.NETLIFY_BLOBS_TOKEN,
  });

  if (event.httpMethod === "GET") {
    const data = await store.get(page, { type: "json" });
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify(data || {}),
    };
  }

  if (event.httpMethod === "POST") {
    const body = JSON.parse(event.body);
    const existing = (await store.get(page, { type: "json" })) || {};
    existing[body.key] = {
      checked: body.checked,
      by: body.by || "Unknown",
      at: new Date().toISOString(),
    };
    await store.setJSON(page, existing);
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify(existing),
    };
  }

  return { statusCode: 405, headers, body: "Method not allowed" };
};
