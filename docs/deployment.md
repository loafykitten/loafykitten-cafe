# Deployment

This project deploys to Cloudflare Workers through GitHub Actions.

## Deployment flow

1. Push to `main` (or trigger the `Deploy Worker` workflow manually).
2. GitHub Actions runs `bun install --frozen-lockfile` and `bun run check`.
3. If validation passes, Actions runs `bun run deploy`, which builds the site
   and runs `wrangler deploy -c ./wrangler.jsonc --no-autoconfig`.

The worker serves the static build from `dist/` and answers `/music/*` range
requests via the shim in `worker/index.js` (see `wrangler.jsonc`).

## GitHub Actions secrets

- `CLOUDFLARE_API_TOKEN`: API token with the **Edit Cloudflare Workers** permission
- `CLOUDFLARE_ACCOUNT_ID`: account ID from the Cloudflare dashboard

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
