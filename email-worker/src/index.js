const quotes = [
  ["Freedom", "Being single isn't waiting for life to begin. It's realizing life is already happening."],
  ["Self-Love", "The right relationship should add to the life you already love living."],
  ["Soft Life", "A soft life doesn't require a plus-one. Sometimes peace is the whole point."],
  ["Independence", "I stopped looking for someone to complete my life and started building one I didn't want to escape."],
  ["Dating", "Date because you're curious, not because you're incomplete."],
  ["Confidence", "Single is not a status to explain. It's a life to experience."],
  ["Freedom", "Your life gets bigger when your plans don't need permission from a partner."],
  ["Self-Love", "Choose yourself so consistently that being chosen becomes a bonus, never a requirement."],
  ["Home", "Build a home that feels like you—even if the only name on the lease is yours."],
  ["Dreams", "There is no waiting room called single. Go live the life you want now."],
  ["Joy", "Romance is one kind of love. A life you adore is another."],
  ["Single Life", "Master the art of being single: make your own rules, fund your own dreams, and enjoy your own company."]
];

const json = (data, status = 200) => new Response(JSON.stringify(data), {
  status,
  headers: { "content-type": "application/json; charset=utf-8" }
});

function quoteForDay(date = new Date()) {
  const day = Math.floor(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()) / 86400000);
  return quotes[((day % quotes.length) + quotes.length) % quotes.length];
}

function escapeHtml(value) {
  return value.replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;").replaceAll('"', "&quot;");
}

async function sendDailyQuote(env) {
  if (!env.BREVO_API_KEY || !env.BREVO_LIST_ID || !env.BREVO_SENDER_EMAIL) {
    throw new Error("Missing BREVO_API_KEY, BREVO_LIST_ID, or BREVO_SENDER_EMAIL");
  }

  const [category, quote] = quoteForDay();
  const today = new Date().toISOString().slice(0, 10);
  const subject = `Your daily single-life quote ✦ ${category}`;
  const html = `<!doctype html><html><body style="margin:0;background:#f7f4ef;font-family:Arial,sans-serif;color:#191919"><div style="max-width:620px;margin:0 auto;padding:48px 24px"><p style="letter-spacing:.12em;text-transform:uppercase;font-size:12px">SINGLE LIFE QUOTES, BY REA</p><div style="background:#fff;padding:44px 36px;margin-top:24px"><p style="font-size:12px;letter-spacing:.1em;text-transform:uppercase">${escapeHtml(category)}</p><h1 style="font-size:32px;line-height:1.2;font-weight:500">“${escapeHtml(quote)}”</h1><p style="margin-top:32px">— Rea Insan</p></div><p style="font-size:13px;line-height:1.6;margin-top:28px">A little reminder to choose yourself. New quote every day.</p><p style="font-size:12px;color:#666">${today}</p></div></body></html>`;

  const response = await fetch("https://api.brevo.com/v3/emailCampaigns", {
    method: "POST",
    headers: {
      "accept": "application/json",
      "content-type": "application/json",
      "api-key": env.BREVO_API_KEY
    },
    body: JSON.stringify({
      name: `Single Life Quote — ${today}`,
      subject,
      sender: {
        email: env.BREVO_SENDER_EMAIL,
        name: env.BREVO_SENDER_NAME || "Single Life Quotes, by Rea"
      },
      recipients: {
        listIds: [Number(env.BREVO_LIST_ID)]
      },
      htmlContent: html,
      previewText: quote,
      tag: "single-life-quotes-daily"
    })
  });

  if (!response.ok) {
    const detail = await response.text();
    throw new Error(`Brevo campaign creation failed (${response.status}): ${detail}`);
  }

  const campaign = await response.json();
  if (!campaign.id) throw new Error("Brevo did not return a campaign ID");

  const sendResponse = await fetch(`https://api.brevo.com/v3/emailCampaigns/${campaign.id}/sendNow`, {
    method: "POST",
    headers: {
      "accept": "application/json",
      "api-key": env.BREVO_API_KEY
    }
  });

  if (!sendResponse.ok) {
    const detail = await sendResponse.text();
    throw new Error(`Brevo send failed (${sendResponse.status}): ${detail}`);
  }

  return { campaignId: campaign.id, subject };
}

export default {
  async fetch(request) {
    const url = new URL(request.url);
    if (url.pathname === "/health") return json({ ok: true, service: "single-life-quotes-daily-email" });
    return new Response("Single Life Quotes daily email worker", { status: 200 });
  },

  async scheduled(controller, env) {
    try {
      const result = await sendDailyQuote(env);
      console.log(JSON.stringify({ event: "daily_quote_sent", ...result }));
    } catch (error) {
      console.error(JSON.stringify({ event: "daily_quote_failed", error: String(error) }));
      controller.noRetry();
    }
  }
};
