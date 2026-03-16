/**
 * Checklist Worker (Cloudflare)
 *
 * GET  /api/checklist?page=slug -> {key: {checked, by, at}}
 * POST /api/checklist           -> {page, key, checked, by}
 */

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    // CORS
    if (request.method === "OPTIONS") {
      return new Response(null, {
        status: 204,
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
          "Access-Control-Allow-Headers": "Content-Type",
        },
      });
    }

    const headers = {
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": "*",
    };

    if (request.method === "GET") {
      const page = url.searchParams.get("page");
      if (!page || !/^[a-z0-9-]+$/.test(page)) {
        return new Response(JSON.stringify({ error: "invalid page" }), { status: 400, headers });
      }

      const data = await env.CHECKLISTS.get(page, { type: "json" });
      return new Response(JSON.stringify(data || {}), { headers });
    }

    if (request.method === "POST") {
      const body = await request.json();
      const page = body.page || url.searchParams.get("page");

      if (!page || !/^[a-z0-9-]+$/.test(page)) {
        return new Response(JSON.stringify({ error: "invalid page" }), { status: 400, headers });
      }

      const existing = (await env.CHECKLISTS.get(page, { type: "json" })) || {};
      existing[body.key] = {
        checked: body.checked,
        by: body.by || "Unknown",
        at: new Date().toISOString(),
      };
      await env.CHECKLISTS.put(page, JSON.stringify(existing));
      return new Response(JSON.stringify(existing), { headers });
    }

    return new Response("Method not allowed", { status: 405, headers });
  },
};
