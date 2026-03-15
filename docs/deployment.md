# Deployment

This project deploys to Debian through GitHub Actions, Tailscale, GitHub Container Registry, Dockge, and a manually managed public Caddy instance.

## Server prerequisites

- Docker and Dockge installed on the server.
- Tailscale installed on the server and connected to your tailnet.
- The SSH deploy user can run `docker` and `docker compose` without `sudo`.
- The easiest way to do that is to add the deploy user to the `docker` group, then log out and back in before testing GitHub Actions.
- The shared reverse-proxy network created once:

```bash
docker network create public-proxy
```

- A Dockge stack directory ready for this app. Set `DEPLOY_PATH` to that directory in GitHub Actions secrets.
- A public Caddy stack already running on `80/443` and attached to `public-proxy`.
- A public Caddy route for the production hostname pointing to `loafykitten-net:80`.
- The workflow runner needs normal OpenSSH access to the server over Tailscale. If Tailscale SSH is enabled on the server for tailnet traffic on port `22`, point `SERVER_PORT` at a separate `sshd` port such as `2222`, or use a host/path where standard `sshd` is still reachable.

Example public Caddy route:

```caddyfile
example.com {
    reverse_proxy loafykitten-net:80
}
```

## GitHub Actions secrets

- `SERVER_HOST`: Debian server hostname or IP
- `SERVER_HOST` should be the server's Tailscale MagicDNS name or Tailscale IP for this workflow.
- `SERVER_PORT`: SSH port, or leave unset to use `22`
- `SERVER_USER`: SSH user with Docker access
- `SERVER_SSH_KEY`: private key used by GitHub Actions
- `DEPLOY_PATH`: absolute path to the Dockge stack directory for this app
- `GHCR_USERNAME`: GitHub username that can pull the private package
- `GHCR_PAT`: GitHub personal access token with `read:packages`
- `TS_OAUTH_CLIENT_ID`: Tailscale federated identity client ID for the GitHub Action
- `TS_OAUTH_AUDIENCE`: audience value for that Tailscale federated identity

## Deployment flow

1. Push to `main`.
2. GitHub Actions runs `bun install --frozen-lockfile`, `bun run check`, and `bun run build`.
3. If validation passes, Actions builds an `nginx:alpine` image and pushes:
   - `ghcr.io/loafykitten/loafykitten-net:main`
   - `ghcr.io/loafykitten/loafykitten-net:sha-<commit>`
4. Actions joins your tailnet using the Tailscale GitHub Action.
5. Actions copies `deploy/compose.yaml` to the server, writes a `.env` file with the immutable image tag, logs into GHCR on the server, and runs `docker compose pull && docker compose up -d --remove-orphans`.

Before relying on the workflow, verify the deploy user manually:

```bash
ssh user@your-server.tailnet-name.ts.net
docker ps
docker compose version
```

If your server uses Tailscale SSH on port `22`, test the actual port you will use from GitHub Actions:

```bash
ssh -p 2222 user@your-server.tailnet-name.ts.net
```

## Tailscale setup

The workflow uses `tailscale/github-action` with workload identity federation.

You need to configure in Tailscale:

- a tag for the ephemeral GitHub runner, such as `tag:ci`
- a federated identity that trusts your GitHub repository/workflow and grants `auth_keys`
- a tailnet policy that allows `tag:ci` network access to your server's SSH port

Using MagicDNS for `SERVER_HOST` is recommended because it keeps the workflow readable and avoids hard-coding a Tailscale IP.

## Dockge stack contents

The deployed stack lives in the server directory pointed to by `DEPLOY_PATH`. It should contain:

- `compose.yaml`
- `.env`
- `.env.example`

Dockge can manage the running stack from that directory after the first deployment.

## Rollback

Set `IMAGE_TAG` in the server-side `.env` to a previous `sha-<commit>` tag, then rerun:

```bash
docker compose --env-file .env -f compose.yaml up -d
```
