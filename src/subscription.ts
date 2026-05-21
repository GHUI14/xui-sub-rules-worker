import type { Env, LinkOptions, ResolvedSubscription, SourceResult, SubscriptionMeta } from "./types";
import { parseNodesFromText } from "./parser";
import { isHttpUrl, parseSubscriptionUserInfo } from "./utils";
import { lookupXuiUsage } from "./xui";

export async function resolveSubscription(env: Env, options: LinkOptions): Promise<ResolvedSubscription> {
  const source = await resolveSource(options.source);
  const xui = source.upstreamUserInfo ? undefined : await lookupXuiUsage(env, source.nodes, options.xuiEmail);
  return {
    nodes: source.nodes,
    upstreamUserInfo: source.upstreamUserInfo,
    meta: parseSubscriptionUserInfo(source.upstreamUserInfo) || xui?.meta
  };
}

export async function resolveSource(source: string): Promise<SourceResult> {
  const trimmed = source.trim();
  if (isHttpUrl(trimmed)) {
    const response = await fetch(trimmed, {
      headers: { "user-agent": "ClashforWindows/0.20 xui-sub-rules-worker/0.1" },
      cf: { cacheTtl: 60, cacheEverything: false }
    } as RequestInit);
    if (!response.ok) throw new Error(`Subscription fetch failed: ${response.status}`);
    const text = await response.text();
    return {
      nodes: parseNodesFromText(text),
      upstreamUserInfo: response.headers.get("subscription-userinfo") || undefined,
      rawText: text
    };
  }
  return { nodes: parseNodesFromText(trimmed), rawText: trimmed };
}

export function mergeUserInfo(upstream?: string, meta?: SubscriptionMeta): string | undefined {
  return upstream || formatMeta(meta);
}

function formatMeta(meta?: SubscriptionMeta): string | undefined {
  if (!meta) return undefined;
  const fields = [`upload=${Math.max(0, Math.floor(meta.upload))}`, `download=${Math.max(0, Math.floor(meta.download))}`, `total=${Math.max(0, Math.floor(meta.total))}`];
  if (meta.expire) fields.push(`expire=${Math.floor(meta.expire)}`);
  return fields.join("; ");
}
