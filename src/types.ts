export type OutputFormat = "clash" | "singbox" | "surge";
export type RuleMode = "whitelist" | "blacklist";
export type ProxyType = "vmess" | "vless" | "trojan" | "ss" | "hysteria2";

export interface Env {
  SUB_LINKS: KVNamespace;
  ADMIN_TOKEN: string;
  SIGNING_SECRET?: string;
  XUI_PANEL_URL?: string;
  XUI_USERNAME?: string;
  XUI_PASSWORD?: string;
  XUI_WEB_BASE_PATH?: string;
  RULES_BASE_URL?: string;
}

export interface ProxyNode {
  type: ProxyType;
  name: string;
  server: string;
  port: number;
  raw: string;
  uuid?: string;
  password?: string;
  cipher?: string;
  alterId?: number;
  network?: string;
  tls?: boolean;
  servername?: string;
  skipCertVerify?: boolean;
  udp?: boolean;
  wsPath?: string;
  wsHost?: string;
  grpcServiceName?: string;
  flow?: string;
  security?: string;
  fingerprint?: string;
  realityPublicKey?: string;
  realityShortId?: string;
  alpn?: string[];
  obfs?: string;
  obfsPassword?: string;
}

export interface SubscriptionMeta {
  upload: number;
  download: number;
  total: number;
  expire?: number;
}

export interface LinkOptions {
  source: string;
  title: string;
  ruleMode: RuleMode;
  xuiEmail?: string;
}

export interface LinkRequest extends LinkOptions {
  format: OutputFormat;
  shortLink?: boolean;
  customCode?: string;
}

export interface StoredLink extends LinkOptions {
  createdAt: string;
}

export interface SourceResult {
  nodes: ProxyNode[];
  upstreamUserInfo?: string;
  rawText?: string;
}

export interface ResolvedSubscription {
  nodes: ProxyNode[];
  meta?: SubscriptionMeta;
  upstreamUserInfo?: string;
}

export interface RuleFile {
  name: string;
  behavior: "domain" | "ipcidr" | "classical";
  target: "DIRECT" | "PROXY" | "REJECT";
}
