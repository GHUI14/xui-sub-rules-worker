import { describe, expect, it } from "vitest";
import { parseNodesFromText } from "../src/parser";

function b64(value: string): string {
  return btoa(value);
}

describe("parseNodesFromText", () => {
  it("parses vmess links", () => {
    const link = `vmess://${b64(JSON.stringify({ ps: "vmess-a", add: "example.com", port: "443", id: "11111111-1111-1111-1111-111111111111", aid: "0", net: "ws", type: "none", host: "cdn.example.com", path: "/ws", tls: "tls" }))}`;
    const nodes = parseNodesFromText(link);
    expect(nodes).toHaveLength(1);
    expect(nodes[0]).toMatchObject({
      type: "vmess",
      name: "vmess-a",
      server: "example.com",
      port: 443,
      uuid: "11111111-1111-1111-1111-111111111111",
      wsPath: "/ws"
    });
  });

  it("parses vless, trojan, ss, and hysteria2 from base64 subscriptions", () => {
    const lines = [
      "vless://22222222-2222-2222-2222-222222222222@example.com:443?security=tls&type=ws&host=cdn.example.com&path=%2Fvless#vless-a",
      "trojan://pass@example.com:443?sni=t.example.com#trojan-a",
      `ss://${b64("aes-128-gcm:secret@example.com:8388")}#ss-a`,
      "hysteria2://hy-pass@example.com:443?sni=h.example.com#hy2-a"
    ].join("\n");
    const nodes = parseNodesFromText(b64(lines));
    expect(nodes.map((node) => node.type)).toEqual(["vless", "trojan", "ss", "hysteria2"]);
    expect(nodes.map((node) => node.name)).toEqual(["vless-a", "trojan-a", "ss-a", "hy2-a"]);
  });
});
