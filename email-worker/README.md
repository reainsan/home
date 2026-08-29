# Single Life Quotes — Daily Email Worker

Tiny Cloudflare Worker that sends the daily **Single Life Quotes, by Rea** quote to a Brevo marketing list.

## What it does

- Runs once a day at **13:00 UTC** (9:00 AM Eastern during daylight saving time).
- Selects the day's quote deterministically so the same quote is not randomly repeated during the day.
- Creates a Brevo email campaign targeted at `BREVO_LIST_ID`.
- Sends that campaign immediately.
- Uses Brevo campaign sending so list unsubscribe handling remains part of Brevo's marketing-email flow.

Cloudflare Cron Triggers invoke the Worker `scheduled()` handler on the configured schedule. Brevo's Email Campaign API supports creating a campaign with a recipient list and sending it with `sendNow`. See the official docs linked below.

## Secrets

Set these as Cloudflare Worker secrets — never commit the real values:

```bash
npx wrangler secret put BREVO_API_KEY
npx wrangler secret put BREVO_LIST_ID
npx wrangler secret put BREVO_SENDER_EMAIL
npx wrangler secret put BREVO_SENDER_NAME
```

`BREVO_SENDER_EMAIL` must be a verified Brevo sender.

For local development, copy `.dev.vars.example` to `.dev.vars` and fill in your values.

## Deploy

From this directory:

```bash
npx wrangler deploy
```

The Worker is intentionally independent from the website Worker. The website only needs its `/api/subscribe` endpoint to add subscribers to the same Brevo list.

## Important

The Brevo API key belongs in Cloudflare secrets, not GitHub source code. Cloudflare's current Worker guidance recommends secrets for credentials, and Cron Triggers execute on UTC time.

- Cloudflare Cron Triggers: https://developers.cloudflare.com/workers/configuration/cron-triggers/
- Brevo Create Email Campaign: https://developers.brevo.com/reference/create-email-campaign
- Brevo Send Campaign Now: https://developers.brevo.com/reference/send-email-campaign-now
