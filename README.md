# XUI Sub Rules Worker

Cloudflare Worker subscription converter for 3x-ui nodes and subscriptions. It converts `vmess://`, `vless://`, `trojan://`, `ss://`, `hysteria2://` links, multi-line subscriptions, base64 subscriptions, and HTTP subscriptions into Clash, Sing-Box, and Surge configs. Rule sets are based only on Loyalsoldier/clash-rules.

## Setup

```bash
npm install
npm run dev
```

On Windows PowerShell, use `Copy-Item .dev.vars.example .dev.vars` before `npm run dev` if you want local secrets.

Create the KV namespace and update `wrangler.toml`, then set secrets:

```bash
wrangler kv namespace create SUB_LINKS
wrangler kv namespace create SUB_LINKS --preview
wrangler secret put ADMIN_TOKEN
wrangler secret put XUI_PANEL_URL
wrangler secret put XUI_USERNAME
wrangler secret put XUI_PASSWORD
```

Optional secrets:

```bash
wrangler secret put SIGNING_SECRET
wrangler secret put XUI_WEB_BASE_PATH
```

`ADMIN_TOKEN` protects the web app actions and short-link creation. Generated short subscription URLs are client-friendly and do not require the token.

## Routes

- `GET /` web UI
- `POST /api/links` generate signed links or KV short links
- `POST /api/xui/lookup` preview 3x-ui traffic for a single node
- `GET /clash?payload=...&sig=...`
- `GET /singbox?payload=...&sig=...`
- `GET /surge?payload=...&sig=...`
- `GET /sub/:format/:code`
- `GET /rules/clash/:name.txt`
- `GET /rules/singbox/:name.json`
- `GET /rules/surge/:name.txt`

## 3x-ui Traffic

For single links, the Worker logs in to 3x-ui, matches the parsed UUID/password against inbound clients, then reads `/panel/api/inbounds/getClientTraffics/:email`. If automatic matching fails, enter the client's 3x-ui email in the UI.
