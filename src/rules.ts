import type { RuleFile, RuleMode } from "./types";

export const LOYALSOLDIER_RULES: RuleFile[] = [
  { name: "applications", behavior: "classical", target: "DIRECT" },
  { name: "private", behavior: "domain", target: "DIRECT" },
  { name: "reject", behavior: "domain", target: "REJECT" },
  { name: "icloud", behavior: "domain", target: "DIRECT" },
  { name: "apple", behavior: "domain", target: "DIRECT" },
  { name: "google", behavior: "domain", target: "PROXY" },
  { name: "proxy", behavior: "domain", target: "PROXY" },
  { name: "direct", behavior: "domain", target: "DIRECT" },
  { name: "telegramcidr", behavior: "ipcidr", target: "PROXY" },
  { name: "cncidr", behavior: "ipcidr", target: "DIRECT" },
  { name: "lancidr", behavior: "ipcidr", target: "DIRECT" }
];

export function getRulesBaseUrl(base?: string): string {
  return (base || "https://cdn.jsdelivr.net/gh/Loyalsoldier/clash-rules@release").replace(/\/+$/, "");
}

export function getClashRuleProviderUrl(rule: RuleFile, base?: string): string {
  return `${getRulesBaseUrl(base)}/${rule.name}.txt`;
}

export function getRulesForMode(mode: RuleMode): RuleFile[] {
  if (mode === "blacklist") {
    return LOYALSOLDIER_RULES.filter((rule) => rule.name !== "applications");
  }
  return LOYALSOLDIER_RULES;
}

export function finalPolicyForMode(mode: RuleMode): "PROXY" | "DIRECT" {
  return mode === "whitelist" ? "PROXY" : "DIRECT";
}

export function ruleExists(name: string): boolean {
  return LOYALSOLDIER_RULES.some((rule) => rule.name === name);
}

export async function fetchLoyalsoldierRule(name: string, base?: string): Promise<string> {
  if (!ruleExists(name)) throw new Error(`Unknown rule file: ${name}`);
  const response = await fetch(`${getRulesBaseUrl(base)}/${name}.txt`, {
    headers: { "user-agent": "xui-sub-rules-worker/0.1" },
    cf: { cacheTtl: 86400, cacheEverything: true }
  } as RequestInit);
  if (!response.ok) throw new Error(`Failed to fetch rule file ${name}: ${response.status}`);
  return response.text();
}

export function normalizeRuleLines(text: string): string[] {
  return text
    .split(/\r?\n/)
    .map((line) => line.trim())
    .map((line) => line.replace(/^-\s*/, "").trim())
    .filter((line) => line && !line.startsWith("#") && line !== "payload:");
}

export function convertToSurgeRuleSet(text: string): string {
  const lines = normalizeRuleLines(text)
    .map((line) => normalizeSurgeLine(line))
    .filter(Boolean);
  return `${lines.join("\n")}\n`;
}

export function convertToSingBoxSource(text: string): Record<string, unknown> {
  const rules = normalizeRuleLines(text)
    .map((line) => normalizeSingBoxRule(line))
    .filter((rule): rule is Record<string, string[]> => Boolean(rule));
  return { version: 1, rules };
}

function normalizeSurgeLine(line: string): string {
  if (/^(DOMAIN|DOMAIN-SUFFIX|DOMAIN-KEYWORD|IP-CIDR|IP-CIDR6|GEOIP|PROCESS-NAME),/i.test(line)) {
    return line;
  }
  if (/^\d+\.\d+\.\d+\.\d+\/\d+/.test(line) || /^[a-f0-9:]+\/\d+/i.test(line)) {
    return `IP-CIDR,${line},no-resolve`;
  }
  if (line.startsWith(".")) return `DOMAIN-SUFFIX,${line.slice(1)}`;
  return `DOMAIN-SUFFIX,${line}`;
}

function normalizeSingBoxRule(line: string): Record<string, string[]> | undefined {
  const [rawType, rawValue] = line.split(",", 2);
  const type = rawValue ? rawType.toUpperCase() : "";
  const value = rawValue || line;
  if (!value) return undefined;

  if (type === "DOMAIN") return { domain: [value] };
  if (type === "DOMAIN-SUFFIX") return { domain_suffix: [value] };
  if (type === "DOMAIN-KEYWORD") return { domain_keyword: [value] };
  if (type === "IP-CIDR" || type === "IP-CIDR6") return { ip_cidr: [value] };
  if (type === "PROCESS-NAME") return { process_name: [value] };
  if (/^\d+\.\d+\.\d+\.\d+\/\d+/.test(value) || /^[a-f0-9:]+\/\d+/i.test(value)) return { ip_cidr: [value] };
  if (value.startsWith(".")) return { domain_suffix: [value.slice(1)] };
  return { domain_suffix: [value] };
}
