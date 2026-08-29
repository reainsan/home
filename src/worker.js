const json = (data, status = 200) => new Response(JSON.stringify(data), {
  status,
  headers: { "content-type": "application/json; charset=utf-8" },
});

const todayQuote = () => {
  const quotes = [
    "Your single life is not a waiting room. It is your life.",
    "Build a life you love so deeply that love gets to add to it—not define it.",
    "Being single is a relationship status. Being fulfilled is a life status.",
    "Choose yourself loudly, then build quietly.",
    "You do not need a partner to make your life feel complete.",
    "A full life does not require a plus-one.",
    "Romance can be part of your story without being the whole plot."
  ];
  const day = Math.floor(Date.now() / 86400000);
  return quotes[day % quotes.length];
};

const brevo = async (env, path, options = {}) => {
  return fetch(`https://api.brevo.com/v3${path}`, {
    ...options,
    headers: {
      accept: "application/json",
      "content-type": "application/json",
      "api-key": env.BREVO_API_KEY,
      ...(options.headers || {}),
    },
  });
};

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

      const response = await brevo(env, "/contacts", {
        method: "POST",
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

  async scheduled(event, env, ctx) {
    if (!env.BREVO_API_KEY || !env.BREVO_LIST_ID || !env.BREVO_SENDER_EMAIL) {
      console.error("Daily quote email is not configured.");
      return;
    }

    const quote = todayQuote();
    const senderName = env.BREVO_SENDER_NAME || "Single Life Quotes, by Rea";
    const subject = "Your Single Life Quote for Today";
    const htmlContent = `
      <div style="font-family:Arial,sans-serif;max-width:600px;margin:auto;padding:32px 20px;text-align:center">
        <p style="font-size:14px;letter-spacing:.08em;text-transform:uppercase">Single Life Quotes, by Rea</p>
        <h1 style="font-size:30px;line-height:1.25;font-weight:600">${quote}</h1>
        <p style="margin-top:32px;font-size:14px">A daily reminder to make your single life your own.</p>
      </div>`;

    const campaign = await brevo(env, "/emailCampaigns", {
      method: "POST",
      body: JSON.stringify({
        name: `Daily Quote ${new Date().toISOString()}`,
        subject,
        sender: { name: senderName, email: env.BREVO_SENDER_EMAIL },
        type: "classic",
        htmlContent,
        recipients: { listIds: [Number(env.BREVO_LIST_ID)] },
      }),
    });

    if (!campaign.ok) {
      console.error("Brevo campaign creation failed", campaign.status, await campaign.text());
      return;
    }

    const campaignData = await campaign.json();
    const send = await brevo(env, `/emailCampaigns/${campaignData.id}/sendNow`, {
      method: "POST",
      body: JSON.stringify({}),
    });

    if (!send.ok) {
      console.error("Brevo campaign send failed", send.status, await send.text());
    } else {
      console.log("Daily quote campaign sent", campaignData.id);
    }
  },
};
