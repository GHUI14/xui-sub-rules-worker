import type { Env, LinkOptions, LinkRequest, OutputFormat, RuleMode, StoredLink } from "./types";
import { encodeBase64Url, randomCode, signPayload, timingSafeEqual, verifySignature, decodeBase64Text } from "./utils";

export function isFormat(value: string): value is OutputFormat {
  return value === "clash" || value === "singbox" || value === "surge";
}

export function isRuleMode(value: string): value is RuleMode {
  return value === "whitelist" || value === "blacklist";
}

export function requireAdmin(request: Request, env: Env): Response | undefined {
  if (!env.ADMIN_TOKEN) return new Response("ADMIN_TOKEN is not configured.", { status: 500 });
  const header = request.headers.get("authorization") || "";
  const token = header.replace(/^Bearer\s+/i, "");
  if (!token || !timingSafeEqual(token, env.ADMIN_TOKEN)) {
    return new Response("Unauthorized", { status: 401, headers: { "www-authenticate": "Bearer" } });
  }
  return undefined;
}

export function validateLinkRequest(input: unknown): LinkRequest {
  if (!isRecord(input)) throw new Error("Request body must be an object.");
  const source = stringValue(input.source).trim();
  if (!source) throw new Error("Subscription source is required.");
  const title = stringValue(input.title).trim() || "XUI Sub Rules";
  const format = stringValue(input.format);
  if (!isFormat(format)) throw new Error("Invalid output format.");
  const ruleMode = stringValue(input.ruleMode) || "whitelist";
  if (!isRuleMode(ruleMode)) throw new Error("Invalid rule mode.");
  const customCode = stringValue(input.customCode).trim();
  if (customCode && !/^[A-Za-z0-9_-]{3,64}$/.test(customCode)) {
    throw new Error("Custom short code must be 3-64 characters: A-Z, a-z, 0-9, underscore, hyphen.");
  }
  return {
    source,
    title,
    format,
    ruleMode,
    shortLink: Boolean(input.shortLink),
    customCode: customCode || undefined,
    xuiEmail: stringValue(input.xuiEmail).trim() || undefined
  };
}

export function toStoredLink(request: LinkRequest): StoredLink {
  return {
    source: request.source,
    title: request.title,
    ruleMode: request.ruleMode,
    xuiEmail: request.xuiEmail,
    createdAt: new Date().toISOString()
  };
}

export async function createSignedPath(format: OutputFormat, options: LinkOptions, env: Env): Promise<string> {
  const payload = encodeBase64Url(JSON.stringify(options));
  const sig = await signPayload(payload, signingSecret(env));
  return `/${format}?payload=${encodeURIComponent(payload)}&sig=${encodeURIComponent(sig)}`;
}

export async function readSignedOptions(request: Request, env: Env): Promise<LinkOptions> {
  const url = new URL(request.url);
  const payload = url.searchParams.get("payload");
  const sig = url.searchParams.get("sig");
  if (!payload || !sig) throw new Error("Missing signed payload.");
  const ok = await verifySignature(payload, sig, signingSecret(env));
  if (!ok) throw new Error("Invalid signed payload.");
  const parsed = JSON.parse(decodeBase64Text(payload)) as unknown;
  return validateLinkOptions(parsed);
}

export function validateLinkOptions(input: unknown): LinkOptions {
  if (!isRecord(input)) throw new Error("Payload must be an object.");
  const source = stringValue(input.source).trim();
  const title = stringValue(input.title).trim() || "XUI Sub Rules";
  const ruleMode = stringValue(input.ruleMode) || "whitelist";
  if (!source) throw new Error("Subscription source is required.");
  if (!isRuleMode(ruleMode)) throw new Error("Invalid rule mode.");
  return {
    source,
    title,
    ruleMode,
    xuiEmail: stringValue(input.xuiEmail).trim() || undefined
  };
}

export async function allocateShortCode(env: Env, customCode?: string): Promise<string> {
  if (customCode) {
    const existing = await env.SUB_LINKS.get(customCode);
    if (existing) throw new Error("Custom short code already exists.");
    return customCode;
  }
  for (let attempt = 0; attempt < 6; attempt += 1) {
    const code = randomCode(8);
    const existing = await env.SUB_LINKS.get(code);
    if (!existing) return code;
  }
  throw new Error("Unable to allocate a short code.");
}

export function signingSecret(env: Env): string {
  return env.SIGNING_SECRET || env.ADMIN_TOKEN;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function stringValue(value: unknown): string {
  return value == null ? "" : String(value);
}
