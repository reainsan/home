# Single Life Quotes — React + Vite + Cloudflare Worker

Flashy single-page quote experience for **Single Life Quotes by Rea Insan / Life Legally Single**.

## Cloudflare Workers deployment

This repo is configured for a **Cloudflare Worker with static assets**.

### Cloudflare build settings

Use these settings in the Workers & Pages dashboard:

- **Build command:** `npm run build`
- **Deploy command:** `npx wrangler deploy`
- **Build output directory:** leave blank / not required for Workers deployment

The build command creates `dist/` before Wrangler deploys. The previous deployment error happened because Wrangler was being run without first running Vite, so `dist/` did not exist.

### Local

```bash
npm install
npm run build
npx wrangler deploy
```

Or:

```bash
npm run deploy
```

## SPA routing

`wrangler.toml` uses `not_found_handling = "single-page-application"`, so unknown routes fall back to `index.html`.

## SEO / GEO / LLMO

The app includes crawlable text, metadata, Open Graph tags, JSON-LD, author attribution, and topical language around single life quotes, self-love, independence, solo living, dating, freedom, and soft life.
