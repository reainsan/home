const json = (data, status = 200) => new Response(JSON.stringify(data), {
  status,
  headers: { "content-type": "application/json; charset=utf-8" },
});

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    if (url.pathname === "/api/subscribe") {
      if (request.method !== "POST") return json({ error: "Method not allowed" }, 405);

      if (!env.BREVO_API_KEY || !env.BREVO_LIST_ID) {
        return json({ error: "Newsletter service is not configured yet." }, 503);
      }

      let body;
      try { body = await request.json(); } catch { return json({ error: "Invalid request." }, 400); }

      const email = String(body?.email || "").trim().toLowerCase();
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        return json({ error: "Please enter a valid email address." }, 400);
      }

      const response = await fetch("https://api.brevo.com/v3/contacts", {
        method: "POST",
        headers: {
          "accept": "application/json",
          "content-type": "application/json",
          "api-key": env.BREVO_API_KEY,
        },
        body: JSON.stringify({
          email,
          listIds: [Number(env.BREVO_LIST_ID)],
          updateEnabled: true,
        }),
      });

      if (!response.ok) {
        const detail = await response.text();
        console.error("Brevo subscription failed", response.status, detail);
        return json({ error: "We couldn't add you right now. Please try again." }, 502);
      }

      return json({ ok: true });
    }

    return env.ASSETS.fetch(request);
  },
};
