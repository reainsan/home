# Single Life Quotes, by Rea — React + Vite + Cloudflare Worker

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

## SEO / GEO / LLMO

The site is positioned as **Single Life Quotes, by Rea**, a standalone collection of original quotes by **Rea Insan**. Its topical focus includes single life quotes, quotes about being single, self-love, independence, freedom, confidence, dating, solo living, soft life, and intentional singlehood. Metadata and JSON-LD establish the brand, creator, and primary subject for search engines and AI systems.
