import type { ProxyNode } from "./types";
import { decodeBase64Text, safeDecodeURIComponent, sanitizeName, tryDecodeBase64Text, uniqueName } from "./utils";

const supportedSchemes = /^(vmess|vless|trojan|ss|hysteria2|hy2):\/\//i;

export function parseNodesFromText(input: string): ProxyNode[] {
  const trimmed = input.trim();
  if (!trimmed) return [];

  const directLinks = splitCandidateLinks(trimmed);
  let links = directLinks;
  if (links.length === 0 || (links.length === 1 && !supportedSchemes.test(links[0]))) {
    const decoded = tryDecodeBase64Text(trimmed);
    if (decoded && decoded !== trimmed) {
      links = splitCandidateLinks(decoded);
    }
  }

  const usedNames = new Set<string>();
  return links
    .map((line, index) => parseNode(line, index + 1))
    .filter((node): node is ProxyNode => Boolean(node))
    .map((node) => ({ ...node, name: uniqueName(node.name, usedNames) }));
}

export function parseNode(raw: string, index = 1): ProxyNode | undefined {
  const value = raw.trim();
  if (!supportedSchemes.test(value)) return undefined;
  const scheme = value.slice(0, value.indexOf("://")).toLowerCase();
  if (scheme === "vmess") return parseVmess(value, index);
  if (scheme === "vless") return parseVless(value, index);
  if (scheme === "trojan") return parseTrojan(value, index);
  if (scheme === "ss") return parseShadowsocks(value, index);
  if (scheme === "hysteria2" || scheme === "hy2") return parseHysteria2(value, index);
  return undefined;
}

export function isSingleNodeSource(source: string): boolean {
  const nodes = parseNodesFromText(source);
  return nodes.length === 1 && supportedSchemes.test(source.trim());
}

function splitCandidateLinks(text: string): string[] {
  const lines = text
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);
  if (lines.length > 1) return lines.filter((line) => supportedSchemes.test(line));
  if (supportedSchemes.test(text.trim())) return [text.trim()];
  return lines.filter((line) => supportedSchemes.test(line));
}

function parseVmess(raw: string, index: number): ProxyNode | undefined {
  const payload = raw.replace(/^vmess:\/\//i, "");
  let data: Record<string, unknown>;
  try {
    data = JSON.parse(decodeBase64Text(payload)) as Record<string, unknown>;
  } catch {
    return undefined;
  }

  const server = stringField(data.add);
  const port = numberField(data.port);
  const uuid = stringField(data.id);
  if (!server || !port || !uuid) return undefined;

  const network = stringField(data.net);
  const tlsField = stringField(data.tls);
  const host = stringField(data.host);
  const path = stringField(data.path);
  const alpn = stringField(data.alpn);

  return {
    type: "vmess",
    name: sanitizeName(stringField(data.ps), `VMess ${index}`),
    server,
    port,
    uuid,
    alterId: numberField(data.aid) ?? 0,
    cipher: stringField(data.scy) || "auto",
    network,
    tls: tlsField === "tls",
    servername: stringField(data.sni) || host,
    skipCertVerify: stringField(data.allowInsecure) === "1",
    wsHost: network === "ws" ? host : undefined,
    wsPath: network === "ws" ? path || "/" : undefined,
    grpcServiceName: network === "grpc" ? path : undefined,
    alpn: alpn ? alpn.split(",").map((item) => item.trim()).filter(Boolean) : undefined,
    raw
  };
}

function parseVless(raw: string, index: number): ProxyNode | undefined {
  const url = safeUrl(raw);
  if (!url) return undefined;
  const uuid = safeDecodeURIComponent(url.username);
  const port = Number(url.port || "443");
  if (!url.hostname || !uuid || !Number.isFinite(port)) return undefined;
  const params = url.searchParams;
  const network = params.get("type") || params.get("net") || "tcp";
  const security = params.get("security") || "";
  return {
    type: "vless",
    name: sanitizeName(safeDecodeURIComponent(url.hash.slice(1)), `VLESS ${index}`),
    server: url.hostname,
    port,
    uuid,
    network,
    security,
    tls: security === "tls" || security === "reality",
    servername: params.get("sni") || params.get("peer") || params.get("host") || undefined,
    flow: params.get("flow") || undefined,
    fingerprint: params.get("fp") || undefined,
    realityPublicKey: params.get("pbk") || undefined,
    realityShortId: params.get("sid") || undefined,
    wsHost: network === "ws" ? params.get("host") || undefined : undefined,
    wsPath: network === "ws" ? params.get("path") || "/" : undefined,
    grpcServiceName: network === "grpc" ? params.get("serviceName") || undefined : undefined,
    raw
  };
}

function parseTrojan(raw: string, index: number): ProxyNode | undefined {
  const url = safeUrl(raw);
  if (!url) return undefined;
  const password = safeDecodeURIComponent(url.username);
  const port = Number(url.port || "443");
  if (!url.hostname || !password || !Number.isFinite(port)) return undefined;
  const params = url.searchParams;
  const network = params.get("type") || params.get("net") || "tcp";
  return {
    type: "trojan",
    name: sanitizeName(safeDecodeURIComponent(url.hash.slice(1)), `Trojan ${index}`),
    server: url.hostname,
    port,
    password,
    network,
    tls: true,
    servername: params.get("sni") || params.get("peer") || params.get("host") || undefined,
    wsHost: network === "ws" ? params.get("host") || undefined : undefined,
    wsPath: network === "ws" ? params.get("path") || "/" : undefined,
    grpcServiceName: network === "grpc" ? params.get("serviceName") || undefined : undefined,
    raw
  };
}

function parseShadowsocks(raw: string, index: number): ProxyNode | undefined {
  const payload = raw.replace(/^ss:\/\//i, "");
  const [beforeHash, hash = ""] = payload.split("#");
  const [beforeQuery] = beforeHash.split("?");
  let decoded = beforeQuery;

  if (!beforeQuery.includes("@")) {
    const maybe = tryDecodeBase64Text(beforeQuery);
    if (maybe) decoded = maybe;
  }

  let userInfo = "";
  let hostPort = "";
  if (decoded.includes("@")) {
    const at = decoded.indexOf("@");
    userInfo = decoded.slice(0, at);
    hostPort = decoded.slice(at + 1);
    const maybeUser = tryDecodeBase64Text(userInfo);
    if (maybeUser) userInfo = maybeUser;
  } else if (beforeQuery.includes("@")) {
    const at = beforeQuery.indexOf("@");
    userInfo = beforeQuery.slice(0, at);
    hostPort = beforeQuery.slice(at + 1);
    const maybeUser = tryDecodeBase64Text(userInfo);
    if (maybeUser) userInfo = maybeUser;
  }

  const splitAt = userInfo.indexOf(":");
  if (splitAt < 1 || !hostPort) return undefined;
  const cipher = safeDecodeURIComponent(userInfo.slice(0, splitAt));
  const password = safeDecodeURIComponent(userInfo.slice(splitAt + 1));
  const parsedHost = parseHostPort(hostPort);
  if (!cipher || !password || !parsedHost) return undefined;

  return {
    type: "ss",
    name: sanitizeName(safeDecodeURIComponent(hash), `Shadowsocks ${index}`),
    server: parsedHost.host,
    port: parsedHost.port,
    cipher,
    password,
    udp: true,
    raw
  };
}

function parseHysteria2(raw: string, index: number): ProxyNode | undefined {
  const normalized = raw.replace(/^hy2:\/\//i, "hysteria2://");
  const url = safeUrl(normalized);
  if (!url) return undefined;
  const password = safeDecodeURIComponent(url.username);
  const port = Number(url.port || "443");
  if (!url.hostname || !password || !Number.isFinite(port)) return undefined;
  const params = url.searchParams;
  return {
    type: "hysteria2",
    name: sanitizeName(safeDecodeURIComponent(url.hash.slice(1)), `Hysteria2 ${index}`),
    server: url.hostname,
    port,
    password,
    tls: true,
    servername: params.get("sni") || undefined,
    obfs: params.get("obfs") || undefined,
    obfsPassword: params.get("obfs-password") || params.get("obfs_password") || undefined,
    skipCertVerify: params.get("insecure") === "1",
    raw
  };
}

function safeUrl(value: string): URL | undefined {
  try {
    return new URL(value);
  } catch {
    return undefined;
  }
}

function parseHostPort(value: string): { host: string; port: number } | undefined {
  const trimmed = value.trim();
  if (trimmed.startsWith("[")) {
    const end = trimmed.indexOf("]");
    const host = trimmed.slice(1, end);
    const port = Number(trimmed.slice(end + 2));
    return host && Number.isFinite(port) ? { host, port } : undefined;
  }
  const lastColon = trimmed.lastIndexOf(":");
  if (lastColon < 1) return undefined;
  const host = trimmed.slice(0, lastColon);
  const port = Number(trimmed.slice(lastColon + 1));
  return host && Number.isFinite(port) ? { host, port } : undefined;
}

function stringField(value: unknown): string | undefined {
  if (value == null) return undefined;
  return String(value);
}

function numberField(value: unknown): number | undefined {
  const number = Number(value);
  return Number.isFinite(number) ? number : undefined;
}
