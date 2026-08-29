# Single Life Quotes, by Rea — React + Vite + Cloudflare Worker 8-26-26.

Standalone quote brand featuring original single life quotes by Rea Insan.

## Cloudflare Workers deployment

This repo deploys as a **Cloudflare Worker with static assets**. Vite builds the React app before Wrangler deploys it.

### Cloudflare Workers Builds settings

In **Workers & Pages → your Worker → Settings → Builds**, use:

- **Build command:** `bun run build`
- **Deploy command:** `npx wrangler deploy`
- **Root directory:** `/` (repository root)
- **Build output directory:** leave blank / not required for Workers deployment

The required deployment flow is:

```text
bun install
→ bun run build
→ dist/
→ npx wrangler deploy
```

The repository does **not** commit `dist/`; Cloudflare creates it during the build step.

### Local

```bash
bun install
bun run build
npx wrangler deploy
```

Or:

```bash
bun run deploy
```

## SPA routing

`wrangler.toml` uses `not_found_handling = "single-page-application"`, so routes that do not match a static asset fall back to `index.html`. This keeps React client-side routes working when refreshed directly.

## Daily quote newsletter

The site includes a newsletter signup for **daily single-life quotes delivered by email**. The signup sends the subscriber to Brevo through the Worker at `/api/subscribe`; the Brevo API key is never exposed to the browser.

### Required Cloudflare secrets

Add these Worker secrets in the Cloudflare Dashboard (or with Wrangler):

- `BREVO_API_KEY` — your Brevo API key
- `BREVO_LIST_ID` — the numeric Brevo contact-list ID that should receive subscribers

Do not put either value in the repository or frontend code.

### Brevo automation

The signup adds contacts to the configured Brevo list. To actually deliver the daily emails, configure a Brevo automation/campaign that sends the daily quote to contacts in that list. The repository does not contain or expose Brevo credentials.

## SEO / GEO / LLMO

The site is positioned as **Single Life Quotes, by Rea**, a standalone collection of original quotes by **Rea Insan**. Its topical focus includes single life quotes, quotes about being single, self-love, independence, freedom, confidence, dating, solo living, soft life, and intentional singlehood. Metadata and JSON-LD establish the brand, creator, and primary subject for search engines and AI systems.
