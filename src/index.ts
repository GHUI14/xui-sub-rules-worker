import { Hono } from "hono";
import type { Env, LinkOptions, OutputFormat, StoredLink } from "./types";
import { allocateShortCode, createSignedPath, isFormat, readSignedOptions, requireAdmin, toStoredLink, validateLinkOptions, validateLinkRequest } from "./auth";
import { generateConfig } from "./generators";
import { parseNodesFromText } from "./parser";
import { convertToSingBoxSource, convertToSurgeRuleSet, fetchLoyalsoldierRule } from "./rules";
import { resolveSubscription } from "./subscription";
import { renderIndex } from "./ui";
import { formatSubscriptionUserInfo, getOrigin, jsonResponse, textResponse } from "./utils";
import { lookupXuiUsage } from "./xui";

const app = new Hono<{ Bindings: Env }>();

app.get("/", (c) => c.html(renderIndex()));

app.post("/api/links", async (c) => {
  const auth = requireAdmin(c.req.raw, c.env);
  if (auth) return auth;

  try {
    const request = validateLinkRequest(await c.req.json());
    const origin = getOrigin(c.req.raw);

    if (request.shortLink) {
      const code = await allocateShortCode(c.env, request.customCode);
      const stored = toStoredLink(request);
      await c.env.SUB_LINKS.put(code, JSON.stringify(stored));
      return jsonResponse({
        url: `${origin}/sub/${request.format}/${code}`,
        shortCode: code,
        format: request.format
      });
    }

    const path = await createSignedPath(request.format, stripFormat(request), c.env);
    return jsonResponse({ url: `${origin}${path}`, format: request.format });
  } catch (error) {
    return jsonResponse({ error: messageFrom(error) }, { status: 400 });
  }
});

app.post("/api/xui/lookup", async (c) => {
  const auth = requireAdmin(c.req.raw, c.env);
  if (auth) return auth;

  try {
    const body = (await c.req.json()) as { source?: string; xuiEmail?: string };
    const nodes = parseNodesFromText(String(body.source || ""));
    if (nodes.length !== 1 && !body.xuiEmail) {
      return jsonResponse({ matched: false, message: "请输入单条节点链接，或填写 3x-ui email。" }, { status: 400 });
    }
    const result = await lookupXuiUsage(c.env, nodes, body.xuiEmail?.trim());
    if (!result) {
      return jsonResponse({ matched: false, message: "3x-ui 面板环境变量未配置。" }, { status: 400 });
    }
    return jsonResponse(result);
  } catch (error) {
    return jsonResponse({ error: messageFrom(error) }, { status: 400 });
  }
});

app.get("/rules/singbox/:name.json", async (c) => {
  try {
    const text = await fetchLoyalsoldierRule(c.req.param("name"), c.env.RULES_BASE_URL);
    return jsonResponse(convertToSingBoxSource(text), {
      headers: { "cache-control": "public, max-age=86400" }
    });
  } catch (error) {
    return jsonResponse({ error: messageFrom(error) }, { status: 404 });
  }
});

app.get("/rules/clash/:name.txt", async (c) => {
  try {
    const text = await fetchLoyalsoldierRule(c.req.param("name"), c.env.RULES_BASE_URL);
    return textResponse(text, "text/plain; charset=utf-8", {
      headers: { "cache-control": "public, max-age=86400" }
    });
  } catch (error) {
    return jsonResponse({ error: messageFrom(error) }, { status: 404 });
  }
});

app.get("/rules/surge/:name.txt", async (c) => {
  try {
    const text = await fetchLoyalsoldierRule(c.req.param("name"), c.env.RULES_BASE_URL);
    return textResponse(convertToSurgeRuleSet(text), "text/plain; charset=utf-8", {
      headers: { "cache-control": "public, max-age=86400" }
    });
  } catch (error) {
    return jsonResponse({ error: messageFrom(error) }, { status: 404 });
  }
});

app.get("/sub/:format/:code", async (c) => {
  const format = c.req.param("format");
  if (!isFormat(format)) return new Response("Invalid output format.", { status: 404 });

  try {
    const storedText = await c.env.SUB_LINKS.get(c.req.param("code"));
    if (!storedText) return new Response("Short link not found.", { status: 404 });
    const options = validateLinkOptions(JSON.parse(storedText) as StoredLink);
    return buildSubscriptionResponse(format, options, c.req.raw, c.env);
  } catch (error) {
    return new Response(messageFrom(error), { status: 400 });
  }
});

app.get("/:format", async (c) => {
  const format = c.req.param("format");
  if (!isFormat(format)) return c.notFound();

  try {
    const options = await readSignedOptions(c.req.raw, c.env);
    return buildSubscriptionResponse(format, options, c.req.raw, c.env);
  } catch (error) {
    return new Response(messageFrom(error), { status: 401 });
  }
});

app.notFound(() => new Response("Not found", { status: 404 }));

async function buildSubscriptionResponse(format: OutputFormat, options: LinkOptions, request: Request, env: Env): Promise<Response> {
  const resolved = await resolveSubscription(env, options);
  if (resolved.nodes.length === 0) throw new Error("No supported nodes found in subscription source.");

  const content = generateConfig(format, resolved.nodes, options, getOrigin(request), env.RULES_BASE_URL);
  const headers = new Headers();
  headers.set("content-type", contentType(format));
  headers.set("content-disposition", `inline; filename="${safeFileName(options.title)}.${extension(format)}"`);
  headers.set("profile-title", encodeURIComponent(options.title));
  headers.set("profile-update-interval", "12");
  headers.set("cache-control", "no-store");
  const userInfo = resolved.upstreamUserInfo || formatSubscriptionUserInfo(resolved.meta);
  if (userInfo) headers.set("subscription-userinfo", userInfo);
  return new Response(content, { headers });
}

function stripFormat(request: { source: string; title: string; ruleMode: StoredLink["ruleMode"]; xuiEmail?: string }): LinkOptions {
  return {
    source: request.source,
    title: request.title,
    ruleMode: request.ruleMode,
    xuiEmail: request.xuiEmail
  };
}

function contentType(format: OutputFormat): string {
  if (format === "clash") return "text/yaml; charset=utf-8";
  if (format === "singbox") return "application/json; charset=utf-8";
  return "text/plain; charset=utf-8";
}

function extension(format: OutputFormat): string {
  if (format === "clash") return "yaml";
  if (format === "singbox") return "json";
  return "conf";
}

function safeFileName(value: string): string {
  return value.replace(/[\\/:*?"<>|]+/g, "_").slice(0, 80) || "subscription";
}

function messageFrom(error: unknown): string {
  return error instanceof Error ? error.message : String(error);
}

export default app;
