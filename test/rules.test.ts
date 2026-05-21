import { describe, expect, it } from "vitest";
import { convertToSingBoxSource, convertToSurgeRuleSet } from "../src/rules";

const sample = `
payload:
  - DOMAIN-SUFFIX,example.com
  - DOMAIN,exact.example.com
  - DOMAIN-KEYWORD,video
  - IP-CIDR,10.0.0.0/8,no-resolve
`;

describe("rule conversion", () => {
  it("converts Loyalsoldier rules to sing-box source format", () => {
    const converted = convertToSingBoxSource(sample);
    expect(converted).toEqual({
      version: 1,
      rules: [
        { domain_suffix: ["example.com"] },
        { domain: ["exact.example.com"] },
        { domain_keyword: ["video"] },
        { ip_cidr: ["10.0.0.0/8"] }
      ]
    });
  });

  it("converts Loyalsoldier rules to Surge rule set lines", () => {
    const converted = convertToSurgeRuleSet(sample);
    expect(converted).toContain("DOMAIN-SUFFIX,example.com");
    expect(converted).toContain("IP-CIDR,10.0.0.0/8,no-resolve");
  });
});
