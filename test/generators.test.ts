import { describe, expect, it } from "vitest";
import { generateClash, generateSingBox, generateSurge } from "../src/generators";
import type { LinkOptions, ProxyNode } from "../src/types";

const nodes: ProxyNode[] = [
  {
    type: "vless",
    name: "node-a",
    server: "example.com",
    port: 443,
    uuid: "22222222-2222-2222-2222-222222222222",
    tls: true,
    network: "ws",
    wsPath: "/vless",
    wsHost: "cdn.example.com",
    raw: "vless://..."
  }
];

const options: LinkOptions = {
  source: "vless://...",
  title: "XUI Sub Rules",
  ruleMode: "whitelist"
};

describe("config generators", () => {
  it("generates Clash YAML with Loyalsoldier providers", () => {
    const yaml = generateClash(nodes, options);
    expect(yaml).toContain("rule-providers:");
    expect(yaml).toContain("proxy.txt");
    expect(yaml).toContain("RULE-SET,proxy,PROXY");
  });

  it("generates Sing-Box JSON with remote rule sets", () => {
    const json = JSON.parse(generateSingBox(nodes, options, "https://worker.example.com"));
    expect(json.route.rule_set[0].url).toContain("/rules/singbox/");
    expect(json.outbounds.some((outbound: { tag?: string }) => outbound.tag === "node-a")).toBe(true);
  });

  it("generates Surge config with remote rule sets", () => {
    const surge = generateSurge(nodes, options, "https://worker.example.com");
    expect(surge).toContain("[Proxy]");
    expect(surge).toContain("RULE-SET,https://worker.example.com/rules/surge/proxy.txt,PROXY");
  });
});
