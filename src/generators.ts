import type { LinkOptions, OutputFormat, ProxyNode, RuleMode } from "./types";
import { finalPolicyForMode, getClashRuleProviderUrl, getRulesForMode, LOYALSOLDIER_RULES } from "./rules";
import { stringifyYaml } from "./yaml";

export function generateConfig(format: OutputFormat, nodes: ProxyNode[], options: LinkOptions, origin: string, rulesBase?: string): string {
  if (format === "clash") return generateClash(nodes, options, rulesBase);
  if (format === "singbox") return generateSingBox(nodes, options, origin);
  return generateSurge(nodes, options, origin);
}

export function generateClash(nodes: ProxyNode[], options: LinkOptions, rulesBase?: string): string {
  const proxies = nodes.map(toClashProxy);
  const proxyNames = proxies.map((proxy) => proxy.name as string);
  const providerEntries = Object.fromEntries(
    getRulesForMode(options.ruleMode).map((rule) => [
      rule.name,
      {
        type: "http",
        behavior: rule.behavior,
        url: getClashRuleProviderUrl(rule, rulesBase),
        path: `./ruleset/${rule.name}.yaml`,
        interval: 86400
      }
    ])
  );

  const config = {
    "mixed-port": 7890,
    "allow-lan": false,
    mode: "rule",
    "log-level": "info",
    ipv6: true,
    "external-controller": "127.0.0.1:9090",
    proxies,
    "proxy-groups": [
      { name: "PROXY", type: "select", proxies: ["AUTO", ...proxyNames, "DIRECT"] },
      { name: "AUTO", type: "url-test", url: "http://www.gstatic.com/generate_204", interval: 300, proxies: proxyNames.length ? proxyNames : ["DIRECT"] }
    ],
    "rule-providers": providerEntries,
    rules: clashRules(options.ruleMode)
  };
  return stringifyYaml(config);
}

export function generateSingBox(nodes: ProxyNode[], options: LinkOptions, origin: string): string {
  const outbounds = nodes.map(toSingBoxOutbound);
  const nodeTags = outbounds.map((outbound) => outbound.tag as string);
  const config = {
    log: { level: "info" },
    dns: {
      servers: [{ tag: "cloudflare", address: "1.1.1.1" }],
      strategy: "prefer_ipv4"
    },
    outbounds: [
      { type: "selector", tag: "PROXY", outbounds: ["AUTO", ...nodeTags, "DIRECT"] },
      { type: "urltest", tag: "AUTO", outbounds: nodeTags.length ? nodeTags : ["DIRECT"], url: "http://www.gstatic.com/generate_204", interval: "5m" },
      ...outbounds,
      { type: "direct", tag: "DIRECT" },
      { type: "block", tag: "REJECT" }
    ],
    route: {
      rule_set: LOYALSOLDIER_RULES.map((rule) => ({
        type: "remote",
        tag: rule.name,
        format: "source",
        url: `${origin}/rules/singbox/${rule.name}.json`,
        download_detour: "DIRECT",
        update_interval: "24h"
      })),
      rules: singBoxRules(options.ruleMode),
      final: finalPolicyForMode(options.ruleMode)
    }
  };
  return `${JSON.stringify(config, null, 2)}\n`;
}

export function generateSurge(nodes: ProxyNode[], options: LinkOptions, origin: string): string {
  const proxyLines = nodes.map(toSurgeProxy).filter(Boolean);
  const nodeNames = nodes.map((node) => node.name);
  const finalPolicy = finalPolicyForMode(options.ruleMode);
  return [
    "#!MANAGED-CONFIG https://github.com/Loyalsoldier/clash-rules interval=86400 strict=false",
    "",
    "[General]",
    "loglevel = notify",
    "ipv6 = true",
    "dns-server = system, 223.5.5.5, 119.29.29.29, 1.1.1.1",
    "",
    "[Proxy]",
    ...proxyLines,
    "",
    "[Proxy Group]",
    `PROXY = select, AUTO, ${nodeNames.join(", ")}, DIRECT`,
    `AUTO = url-test, ${nodeNames.join(", ") || "DIRECT"}, url=http://www.gstatic.com/generate_204, interval=300`,
    "",
    "[Rule]",
    ...surgeRules(options.ruleMode, origin),
    `FINAL,${finalPolicy},dns-failed`
  ].join("\n");
}

function clashRules(mode: RuleMode): string[] {
  const rules = getRulesForMode(mode).map((rule) => `RULE-SET,${rule.name},${rule.target}`);
  if (mode === "whitelist") {
    return [...rules, "GEOIP,LAN,DIRECT", "GEOIP,CN,DIRECT", "MATCH,PROXY"];
  }
  return [...rules, "GEOIP,LAN,DIRECT", "GEOIP,CN,DIRECT", "MATCH,DIRECT"];
}

function singBoxRules(mode: RuleMode): Record<string, string>[] {
  const rules = getRulesForMode(mode).map((rule) => ({ rule_set: rule.name, outbound: rule.target }));
  if (mode === "whitelist") {
    return [...rules, { geoip: "cn", outbound: "DIRECT" }];
  }
  return [...rules, { geoip: "cn", outbound: "DIRECT" }];
}

function surgeRules(mode: RuleMode, origin: string): string[] {
  const rules = getRulesForMode(mode).map((rule) => `RULE-SET,${origin}/rules/surge/${rule.name}.txt,${rule.target}`);
  return mode === "whitelist" ? [...rules, "GEOIP,CN,DIRECT"] : [...rules, "GEOIP,CN,DIRECT"];
}

function toClashProxy(node: ProxyNode): Record<string, unknown> {
  const base: Record<string, unknown> = {
    name: node.name,
    type: node.type === "ss" ? "ss" : node.type,
    server: node.server,
    port: node.port,
    udp: node.udp ?? true
  };

  if (node.type === "vmess") {
    Object.assign(base, {
      uuid: node.uuid,
      alterId: node.alterId ?? 0,
      cipher: node.cipher || "auto",
      tls: node.tls || undefined,
      servername: node.servername || undefined,
      "skip-cert-verify": node.skipCertVerify || undefined,
      network: node.network || undefined
    });
  }
  if (node.type === "vless") {
    Object.assign(base, {
      uuid: node.uuid,
      tls: node.tls || undefined,
      servername: node.servername || undefined,
      flow: node.flow || undefined,
      network: node.network || undefined,
      "client-fingerprint": node.fingerprint || undefined,
      "reality-opts": node.security === "reality" ? { "public-key": node.realityPublicKey, "short-id": node.realityShortId } : undefined
    });
  }
  if (node.type === "trojan" || node.type === "hysteria2") {
    Object.assign(base, {
      password: node.password,
      sni: node.servername || undefined,
      "skip-cert-verify": node.skipCertVerify || undefined,
      network: node.network || undefined
    });
  }
  if (node.type === "ss") {
    Object.assign(base, { cipher: node.cipher, password: node.password });
  }

  if (node.network === "ws") {
    base["ws-opts"] = {
      path: node.wsPath || "/",
      headers: node.wsHost ? { Host: node.wsHost } : undefined
    };
  }
  if (node.network === "grpc") {
    base["grpc-opts"] = { "grpc-service-name": node.grpcServiceName || "" };
  }
  if (node.type === "hysteria2" && node.obfs) {
    base.obfs = node.obfs;
    base["obfs-password"] = node.obfsPassword;
  }
  return dropUndefined(base);
}

function toSingBoxOutbound(node: ProxyNode): Record<string, unknown> {
  const base: Record<string, unknown> = {
    type: node.type === "ss" ? "shadowsocks" : node.type,
    tag: node.name,
    server: node.server,
    server_port: node.port
  };

  if (node.type === "vmess") {
    Object.assign(base, { uuid: node.uuid, security: node.cipher || "auto", alter_id: node.alterId ?? 0 });
  }
  if (node.type === "vless") {
    Object.assign(base, { uuid: node.uuid, flow: node.flow });
  }
  if (node.type === "trojan" || node.type === "hysteria2") {
    Object.assign(base, { password: node.password });
  }
  if (node.type === "ss") {
    Object.assign(base, { method: node.cipher, password: node.password });
  }

  if (node.tls || node.type === "trojan" || node.type === "hysteria2") {
    base.tls = dropUndefined({
      enabled: true,
      server_name: node.servername,
      insecure: node.skipCertVerify,
      utls: node.fingerprint ? { enabled: true, fingerprint: node.fingerprint } : undefined,
      reality: node.security === "reality" ? { enabled: true, public_key: node.realityPublicKey, short_id: node.realityShortId } : undefined
    });
  }
  if (node.network === "ws") {
    base.transport = dropUndefined({ type: "ws", path: node.wsPath || "/", headers: node.wsHost ? { Host: node.wsHost } : undefined });
  }
  if (node.network === "grpc") {
    base.transport = dropUndefined({ type: "grpc", service_name: node.grpcServiceName });
  }
  if (node.type === "hysteria2" && node.obfs) {
    base.obfs = dropUndefined({ type: node.obfs, password: node.obfsPassword });
  }
  return dropUndefined(base);
}

function toSurgeProxy(node: ProxyNode): string {
  const common = `server=${node.server}, port=${node.port}`;
  if (node.type === "vmess") {
    return `${node.name} = vmess, ${common}, username=${node.uuid}, ws=${node.network === "ws" ? "true" : "false"}, tls=${node.tls ? "true" : "false"}${node.wsPath ? `, ws-path=${node.wsPath}` : ""}${node.wsHost ? `, ws-headers=Host:${node.wsHost}` : ""}${node.servername ? `, sni=${node.servername}` : ""}`;
  }
  if (node.type === "vless") {
    return `${node.name} = vless, ${common}, username=${node.uuid}, tls=${node.tls ? "true" : "false"}${node.servername ? `, sni=${node.servername}` : ""}`;
  }
  if (node.type === "trojan") {
    return `${node.name} = trojan, ${common}, password=${node.password}${node.servername ? `, sni=${node.servername}` : ""}`;
  }
  if (node.type === "ss") {
    return `${node.name} = ss, ${common}, encrypt-method=${node.cipher}, password=${node.password}`;
  }
  return `${node.name} = hysteria2, ${common}, password=${node.password}${node.servername ? `, sni=${node.servername}` : ""}`;
}

function dropUndefined<T extends Record<string, unknown>>(object: T): T {
  Object.keys(object).forEach((key) => {
    const value = object[key];
    if (value === undefined || (typeof value === "object" && value !== null && !Array.isArray(value) && Object.keys(value).length === 0)) {
      delete object[key];
    }
  });
  return object;
}
