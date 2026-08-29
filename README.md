# Single Life Quotes — React + Vite + Cloudflare Worker

Flashy single-page quote experience for **Single Life Quotes by Rea Insan / Life Legally Single**.

## Cloudflare Workers deployment

This repo deploys as a **Cloudflare Worker with static assets**. Vite must build the React app before Wrangler deploys it.

### Cloudflare build settings

Use these settings in the Workers & Pages dashboard:

- **Build command:** `bun run build`
- **Deploy command:** `npx wrangler deploy`
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

## SEO / GEO / LLMO

The app includes crawlable text, metadata, Open Graph tags, JSON-LD, author attribution, and topical language around single life quotes, self-love, independence, solo living, dating, freedom, and soft life.
