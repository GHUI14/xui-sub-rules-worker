import type { Env, ProxyNode, SubscriptionMeta } from "./types";
import { joinUrl, normalizeBasePath, normalizeBaseUrl } from "./utils";

interface XuiClient {
  id?: string;
  password?: string;
  email?: string;
  subId?: string;
}

interface XuiInbound {
  settings?: string | { clients?: XuiClient[] };
}

interface XuiResponse<T> {
  success?: boolean;
  msg?: string;
  obj?: T;
}

export interface XuiLookupResult {
  email?: string;
  meta?: SubscriptionMeta;
  matched: boolean;
  message?: string;
}

export async function lookupXuiUsage(env: Env, nodes: ProxyNode[], fallbackEmail?: string): Promise<XuiLookupResult | undefined> {
  if (!env.XUI_PANEL_URL || !env.XUI_USERNAME || !env.XUI_PASSWORD) return undefined;
  if (nodes.length !== 1 && !fallbackEmail) return undefined;

  const cookie = await login(env);
  const email = fallbackEmail || (await findEmailByNode(env, cookie, nodes[0]));
  if (!email) {
    return { matched: false, message: "No matching 3x-ui client email found." };
  }

  const meta = await getClientTraffic(env, cookie, email);
  return { email, meta, matched: Boolean(meta), message: meta ? undefined : "3x-ui returned no traffic data." };
}

async function login(env: Env): Promise<string> {
  const url = panelUrl(env, "/login");
  const body = new URLSearchParams({ username: env.XUI_USERNAME || "", password: env.XUI_PASSWORD || "" });
  const response = await fetch(url, {
    method: "POST",
    headers: { "content-type": "application/x-www-form-urlencoded" },
    body
  });
  if (!response.ok) throw new Error(`3x-ui login failed: ${response.status}`);
  const cookie = response.headers.get("set-cookie") || "";
  if (!cookie) throw new Error("3x-ui login did not return a session cookie.");
  return cookie
    .split(",")
    .map((part) => part.split(";")[0].trim())
    .filter(Boolean)
    .join("; ");
}

async function findEmailByNode(env: Env, cookie: string, node: ProxyNode): Promise<string | undefined> {
  const response = await fetch(panelUrl(env, "/panel/api/inbounds/list"), {
    headers: { cookie, accept: "application/json" }
  });
  if (!response.ok) throw new Error(`3x-ui inbound list failed: ${response.status}`);
  const data = (await response.json()) as XuiResponse<XuiInbound[]>;
  const inbounds = Array.isArray(data.obj) ? data.obj : [];
  const matches: XuiClient[] = [];

  for (const inbound of inbounds) {
    const clients = extractClients(inbound);
    matches.push(...clients.filter((client) => clientMatchesNode(client, node)));
  }

  const uniqueEmails = [...new Set(matches.map((client) => client.email).filter((email): email is string => Boolean(email)))];
  return uniqueEmails.length === 1 ? uniqueEmails[0] : undefined;
}

async function getClientTraffic(env: Env, cookie: string, email: string): Promise<SubscriptionMeta | undefined> {
  const response = await fetch(panelUrl(env, `/panel/api/inbounds/getClientTraffics/${encodeURIComponent(email)}`), {
    headers: { cookie, accept: "application/json" }
  });
  if (!response.ok) throw new Error(`3x-ui traffic lookup failed: ${response.status}`);
  const data = (await response.json()) as XuiResponse<Record<string, unknown> | Record<string, unknown>[]>;
  const traffic = Array.isArray(data.obj) ? data.obj[0] : data.obj;
  if (!traffic) return undefined;

  const upload = numberField(traffic.up);
  const download = numberField(traffic.down);
  const total = numberField(traffic.total);
  const expiryTime = numberField(traffic.expiryTime);
  return {
    upload,
    download,
    total,
    expire: expiryTime ? normalizeExpiry(expiryTime) : undefined
  };
}

function extractClients(inbound: XuiInbound): XuiClient[] {
  const settings = typeof inbound.settings === "string" ? safeJson(inbound.settings) : inbound.settings;
  const clients = settings?.clients;
  return Array.isArray(clients) ? clients : [];
}

function clientMatchesNode(client: XuiClient, node: ProxyNode): boolean {
  const ids = [client.id, client.password, client.subId].filter(Boolean).map((value) => String(value).toLowerCase());
  const nodeKeys = [node.uuid, node.password].filter(Boolean).map((value) => String(value).toLowerCase());
  return nodeKeys.some((key) => ids.includes(key));
}

function panelUrl(env: Env, path: string): string {
  const base = normalizeBaseUrl(env.XUI_PANEL_URL || "");
  const basePath = normalizeBasePath(env.XUI_WEB_BASE_PATH);
  return joinUrl(`${base}${basePath}`, path);
}

function safeJson(value: string): { clients?: XuiClient[] } | undefined {
  try {
    return JSON.parse(value) as { clients?: XuiClient[] };
  } catch {
    return undefined;
  }
}

function numberField(value: unknown): number {
  const number = Number(value);
  return Number.isFinite(number) ? number : 0;
}

function normalizeExpiry(value: number): number {
  return value > 9999999999 ? Math.floor(value / 1000) : Math.floor(value);
}
