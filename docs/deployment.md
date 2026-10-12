# Deployment

This project deploys to Cloudflare Workers through Cloudflare's Git
integration (Workers Builds).

## Deployment flow

1. Push to `main`.
2. Cloudflare builds the site and deploys the worker described in
   `wrangler.jsonc`. Build settings and logs live in the Cloudflare dashboard
   under the worker's **Settings → Build**, not in this repository.
3. Before uploading, `wrangler deploy` runs `bun run check` (the `build`
   command in `wrangler.jsonc`), so an Astro or type error fails the deploy.

The worker serves the static build from `dist/` and answers `/music/*` range
requests via the shim in `worker/index.js` (see `wrangler.jsonc`).

## Manual deploy

With `CLOUDFLARE_API_TOKEN` and `CLOUDFLARE_ACCOUNT_ID` exported (or after
`wrangler login`):

```bash
bun run deploy
```

## Rollback

List recent deployments and roll back to a previous one:

```bash
bunx wrangler deployments list -c ./wrangler.jsonc
bunx wrangler rollback -c ./wrangler.jsonc
```
