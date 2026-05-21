const encoder = new TextEncoder();
const decoder = new TextDecoder();

export function isHttpUrl(value: string): boolean {
  return /^https?:\/\//i.test(value.trim());
}

export function normalizeBaseUrl(url: string): string {
  return url.trim().replace(/\/+$/, "");
}

export function normalizeBasePath(path = ""): string {
  const trimmed = path.trim();
  if (!trimmed) return "";
  return `/${trimmed.replace(/^\/+|\/+$/g, "")}`;
}

export function joinUrl(base: string, path: string): string {
  return `${normalizeBaseUrl(base)}${path.startsWith("/") ? path : `/${path}`}`;
}

export function safeDecodeURIComponent(value: string): string {
  try {
    return decodeURIComponent(value);
  } catch {
    return value;
  }
}

export function decodeBase64Text(value: string): string {
  const normalized = value
    .trim()
    .replace(/-/g, "+")
    .replace(/_/g, "/")
    .replace(/\s/g, "");
  const padded = normalized.padEnd(normalized.length + ((4 - (normalized.length % 4)) % 4), "=");
  const binary = atob(padded);
  const bytes = Uint8Array.from(binary, (char) => char.charCodeAt(0));
  return decoder.decode(bytes);
}

export function encodeBase64Url(value: string | Uint8Array): string {
  const bytes = typeof value === "string" ? encoder.encode(value) : value;
  let binary = "";
  bytes.forEach((byte) => {
    binary += String.fromCharCode(byte);
  });
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
}

export function tryDecodeBase64Text(value: string): string | undefined {
  try {
    const decoded = decodeBase64Text(value);
    if (/[\u0000-\u0008\u000E-\u001F]/.test(decoded)) return undefined;
    return decoded;
  } catch {
    return undefined;
  }
}

export async function signPayload(payload: string, secret: string): Promise<string> {
  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  const signature = await crypto.subtle.sign("HMAC", key, encoder.encode(payload));
  return encodeBase64Url(new Uint8Array(signature));
}

export async function verifySignature(payload: string, signature: string, secret: string): Promise<boolean> {
  const expected = await signPayload(payload, secret);
  return timingSafeEqual(expected, signature);
}

export function timingSafeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let mismatch = 0;
  for (let index = 0; index < a.length; index += 1) {
    mismatch |= a.charCodeAt(index) ^ b.charCodeAt(index);
  }
  return mismatch === 0;
}

export function jsonResponse(data: unknown, init: ResponseInit = {}): Response {
  const headers = new Headers(init.headers);
  headers.set("content-type", "application/json; charset=utf-8");
  return new Response(JSON.stringify(data), { ...init, headers });
}

export function textResponse(text: string, contentType: string, init: ResponseInit = {}): Response {
  const headers = new Headers(init.headers);
  headers.set("content-type", contentType);
  return new Response(text, { ...init, headers });
}

export function getOrigin(request: Request): string {
  const url = new URL(request.url);
  return `${url.protocol}//${url.host}`;
}

export function parseBoolean(value: string | undefined): boolean | undefined {
  if (value == null) return undefined;
  if (/^(1|true|yes|tls)$/i.test(value)) return true;
  if (/^(0|false|no|none)$/i.test(value)) return false;
  return undefined;
}

export function sanitizeName(value: string | undefined, fallback: string): string {
  const trimmed = (value || "").trim();
  return trimmed || fallback;
}

export function uniqueName(name: string, used: Set<string>): string {
  if (!used.has(name)) {
    used.add(name);
    return name;
  }
  let suffix = 2;
  while (used.has(`${name} ${suffix}`)) suffix += 1;
  const next = `${name} ${suffix}`;
  used.add(next);
  return next;
}

export function parseSubscriptionUserInfo(value?: string | null): import("./types").SubscriptionMeta | undefined {
  if (!value) return undefined;
  const fields = new Map<string, number>();
  value.split(";").forEach((part) => {
    const [key, raw] = part.trim().split("=");
    const number = Number(raw);
    if (key && Number.isFinite(number)) fields.set(key.toLowerCase(), number);
  });
  const upload = fields.get("upload") ?? 0;
  const download = fields.get("download") ?? 0;
  const total = fields.get("total") ?? 0;
  const expire = fields.get("expire");
  if (!upload && !download && !total && !expire) return undefined;
  return { upload, download, total, expire };
}

export function formatSubscriptionUserInfo(meta?: import("./types").SubscriptionMeta): string | undefined {
  if (!meta) return undefined;
  const chunks = [`upload=${Math.max(0, Math.floor(meta.upload))}`, `download=${Math.max(0, Math.floor(meta.download))}`, `total=${Math.max(0, Math.floor(meta.total))}`];
  if (meta.expire) chunks.push(`expire=${Math.floor(meta.expire)}`);
  return chunks.join("; ");
}

export function bytesToHuman(bytes: number): string {
  if (!Number.isFinite(bytes) || bytes <= 0) return "0 B";
  const units = ["B", "KB", "MB", "GB", "TB", "PB"];
  let size = bytes;
  let unit = 0;
  while (size >= 1024 && unit < units.length - 1) {
    size /= 1024;
    unit += 1;
  }
  return `${size >= 10 || unit === 0 ? size.toFixed(0) : size.toFixed(1)} ${units[unit]}`;
}

export function randomCode(length = 8): string {
  const alphabet = "abcdefghijkmnopqrstuvwxyzABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  const bytes = crypto.getRandomValues(new Uint8Array(length));
  return Array.from(bytes, (byte) => alphabet[byte % alphabet.length]).join("");
}
