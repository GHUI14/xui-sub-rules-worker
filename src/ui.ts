export function renderIndex(): string {
  return `<!doctype html>
<html lang="zh-CN">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>XUI Sub Rules Worker</title>
  <script src="https://unpkg.com/lucide@latest/dist/umd/lucide.min.js" defer></script>
  <style>
    :root {
      color-scheme: light;
      --ink: #071b4d;
      --muted: #627091;
      --line: #dbe5f5;
      --panel: rgba(255,255,255,.82);
      --blue: #2777ff;
      --violet: #7357ff;
      --green: #0f9f6e;
      --red: #d8213c;
      --shadow: 0 22px 60px rgba(38, 75, 128, .16);
    }
    * { box-sizing: border-box; }
    body {
      margin: 0;
      min-height: 100vh;
      font-family: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
      color: var(--ink);
      background:
        linear-gradient(120deg, rgba(219,231,255,.9) 0 28%, transparent 28% 100%),
        linear-gradient(180deg, #f8fbff 0%, #edf5ff 100%);
    }
    .shell {
      width: min(1500px, calc(100% - 48px));
      margin: 34px auto;
      padding: 54px;
      background: var(--panel);
      border: 1px solid var(--line);
      border-radius: 8px;
      box-shadow: var(--shadow);
      backdrop-filter: blur(12px);
    }
    header {
      display: grid;
      grid-template-columns: auto 1fr auto;
      gap: 24px;
      align-items: center;
    }
    .brand-mark {
      width: 86px;
      height: 86px;
      display: grid;
      place-items: center;
      border-radius: 50%;
      background: #fff;
      border: 1px solid var(--line);
      box-shadow: 0 16px 40px rgba(54, 100, 180, .14);
      color: var(--blue);
    }
    h1 {
      margin: 0;
      font-size: clamp(34px, 4vw, 58px);
      line-height: 1.05;
      letter-spacing: 0;
    }
    .origin {
      margin-top: 12px;
      color: #53668f;
      font-size: 21px;
      word-break: break-all;
    }
    .status {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      padding: 12px 18px;
      border: 1px solid var(--line);
      border-radius: 999px;
      color: #41547c;
      background: rgba(255,255,255,.7);
      white-space: nowrap;
    }
    .rail {
      position: relative;
      height: 22px;
      margin: 44px 0 0;
    }
    .rail::before {
      content: "";
      position: absolute;
      left: 0;
      right: 0;
      top: 10px;
      height: 2px;
      background: linear-gradient(90deg, var(--violet), var(--blue));
    }
    .rail::after {
      content: "";
      position: absolute;
      left: 0;
      top: 0;
      width: 22px;
      height: 22px;
      border-radius: 50%;
      background: var(--violet);
      box-shadow: 0 0 0 10px rgba(115,87,255,.14);
    }
    .panel {
      margin-top: 12px;
      padding: 28px;
      border: 1px solid var(--line);
      border-radius: 8px;
      background: rgba(255,255,255,.66);
    }
    .grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 24px 26px;
      align-items: end;
    }
    .span { grid-column: 1 / -1; }
    label {
      display: block;
      font-weight: 800;
      margin-bottom: 10px;
      font-size: 18px;
    }
    .label-row {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 16px;
    }
    input, textarea, select {
      width: 100%;
      border: 1px solid var(--line);
      border-radius: 8px;
      background: rgba(255,255,255,.88);
      color: var(--ink);
      font: inherit;
      font-weight: 650;
      outline: none;
      transition: border-color .15s, box-shadow .15s;
    }
    textarea {
      min-height: 102px;
      padding: 16px 18px;
      resize: vertical;
    }
    input, select {
      height: 58px;
      padding: 0 18px;
    }
    input:focus, textarea:focus, select:focus {
      border-color: #7da8ff;
      box-shadow: 0 0 0 4px rgba(39,119,255,.12);
    }
    .segmented {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      border: 1px solid var(--line);
      border-radius: 8px;
      overflow: hidden;
      height: 58px;
      background: #fff;
    }
    .segmented button {
      border: 0;
      background: transparent;
      color: var(--ink);
      font: inherit;
      font-weight: 800;
      cursor: pointer;
    }
    .segmented button.active {
      color: #fff;
      background: linear-gradient(90deg, var(--violet), var(--blue));
    }
    .checkrow {
      display: flex;
      align-items: center;
      gap: 12px;
      min-height: 58px;
      font-weight: 800;
    }
    .checkrow input {
      width: 22px;
      height: 22px;
      padding: 0;
    }
    .actions {
      display: grid;
      grid-template-columns: minmax(180px, 280px) minmax(180px, 240px);
      gap: 16px;
      justify-content: end;
      align-items: end;
    }
    button.primary, button.secondary, button.copy {
      height: 58px;
      border-radius: 8px;
      border: 1px solid var(--line);
      font: inherit;
      font-weight: 850;
      display: inline-flex;
      justify-content: center;
      align-items: center;
      gap: 10px;
      cursor: pointer;
      white-space: nowrap;
    }
    button.primary {
      border: 0;
      color: #fff;
      background: linear-gradient(90deg, var(--violet), var(--blue));
      box-shadow: 0 14px 30px rgba(39,119,255,.18);
    }
    button.secondary, button.copy {
      color: #36517e;
      background: rgba(255,255,255,.74);
    }
    .result {
      margin-top: 24px;
      display: none;
      grid-template-columns: 1fr auto;
      gap: 14px;
      align-items: center;
    }
    .result input {
      font-size: 15px;
      color: #264066;
    }
    .traffic {
      display: none;
      margin-top: 16px;
      grid-template-columns: repeat(4, 1fr);
      gap: 12px;
    }
    .metric {
      border: 1px solid var(--line);
      border-radius: 8px;
      padding: 14px;
      background: rgba(255,255,255,.62);
    }
    .metric span {
      display: block;
      color: var(--muted);
      font-size: 13px;
      font-weight: 800;
    }
    .metric strong {
      display: block;
      margin-top: 6px;
      font-size: 18px;
      overflow-wrap: anywhere;
    }
    .rules-head {
      margin-top: 38px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 16px;
    }
    .rules-head h2 {
      margin: 0;
      font-size: 24px;
      letter-spacing: 0;
    }
    .rules-head small {
      color: #53668f;
      font-weight: 800;
      font-size: 16px;
    }
    .rules {
      margin-top: 18px;
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 12px;
    }
    .rule {
      min-height: 52px;
      border: 1px solid var(--line);
      border-radius: 8px;
      background: rgba(255,255,255,.7);
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 12px;
      padding: 0 14px;
      font-weight: 850;
    }
    .rule em {
      font-style: normal;
      font-size: 13px;
      color: #53668f;
    }
    .rule em.proxy { color: #075eea; }
    .rule em.reject { color: var(--red); }
    .toast {
      min-height: 24px;
      margin-top: 14px;
      color: #53668f;
      font-weight: 750;
    }
    .toast.error { color: var(--red); }
    .toast.ok { color: var(--green); }
    @media (max-width: 900px) {
      .shell { width: min(100% - 24px, 760px); padding: 28px 18px; margin: 14px auto; }
      header { grid-template-columns: 64px 1fr; }
      .brand-mark { width: 64px; height: 64px; }
      .status { grid-column: 1 / -1; justify-self: start; }
      .origin { font-size: 16px; }
      .grid, .rules, .traffic { grid-template-columns: 1fr; }
      .actions { grid-template-columns: 1fr; justify-content: stretch; }
      .result { grid-template-columns: 1fr; }
      .segmented { grid-template-columns: 1fr; height: auto; }
      .segmented button { min-height: 50px; }
    }
  </style>
</head>
<body>
  <main class="shell">
    <header>
      <div class="brand-mark"><i data-lucide="sparkles" aria-hidden="true"></i></div>
      <div>
        <h1>XUI Sub Rules Worker</h1>
        <div class="origin" id="origin"></div>
      </div>
      <div class="status"><i data-lucide="activity" aria-hidden="true"></i><span id="ready">Ready</span></div>
    </header>
    <div class="rail" aria-hidden="true"></div>

    <section class="panel">
      <div class="grid">
        <div class="span">
          <label for="source">订阅地址</label>
          <textarea id="source" placeholder="https://example.com/sub 或 vmess://..."></textarea>
        </div>
        <div>
          <label for="ruleMode">规则模式</label>
          <select id="ruleMode">
            <option value="whitelist">白名单</option>
            <option value="blacklist">黑名单</option>
          </select>
        </div>
        <div>
          <label>输出格式</label>
          <div class="segmented" role="tablist" aria-label="输出格式">
            <button type="button" class="active" data-format="clash">Clash</button>
            <button type="button" data-format="singbox">Sing-Box</button>
            <button type="button" data-format="surge">Surge</button>
          </div>
        </div>
        <div>
          <label for="title">订阅标题</label>
          <input id="title" value="XUI Sub Rules" />
        </div>
        <div>
          <label for="token">管理密钥</label>
          <input id="token" type="password" autocomplete="current-password" placeholder="ADMIN_TOKEN" />
        </div>
        <div>
          <label for="xuiEmail">3x-ui Email</label>
          <input id="xuiEmail" placeholder="自动匹配失败时填写" />
        </div>
        <div>
          <label for="customCode">自定义短码</label>
          <input id="customCode" placeholder="可选" />
        </div>
        <div class="checkrow">
          <input id="shortLink" type="checkbox" />
          <span>短链接</span>
        </div>
        <div class="actions">
          <button type="button" class="secondary" id="lookup"><i data-lucide="gauge" aria-hidden="true"></i>读取流量</button>
          <button type="button" class="primary" id="generate"><i data-lucide="rocket" aria-hidden="true"></i>生成链接</button>
        </div>
      </div>
      <div class="traffic" id="traffic">
        <div class="metric"><span>已上传</span><strong id="upload">0 B</strong></div>
        <div class="metric"><span>已下载</span><strong id="download">0 B</strong></div>
        <div class="metric"><span>总流量</span><strong id="total">0 B</strong></div>
        <div class="metric"><span>到期时间</span><strong id="expire">未知</strong></div>
      </div>
      <div class="result" id="result">
        <input id="link" readonly />
        <button type="button" class="copy" id="copy"><i data-lucide="copy" aria-hidden="true"></i>复制</button>
      </div>
      <div class="toast" id="toast"></div>
    </section>

    <section>
      <div class="rules-head">
        <h2><i data-lucide="file-text" aria-hidden="true"></i> 规则配置文件</h2>
        <small id="ruleSummary">Clash · 白名单 · 11 个文件</small>
      </div>
      <div class="rules" id="rules"></div>
    </section>
  </main>

  <script>
    const rules = [
      ["applications.txt", "DIRECT"], ["private.txt", "DIRECT"], ["reject.txt", "REJECT"],
      ["icloud.txt", "DIRECT"], ["apple.txt", "DIRECT"], ["google.txt", "PROXY"],
      ["proxy.txt", "PROXY"], ["direct.txt", "DIRECT"], ["telegramcidr.txt", "PROXY"],
      ["cncidr.txt", "DIRECT"], ["lancidr.txt", "DIRECT"]
    ];
    const state = { format: "clash" };
    const $ = (id) => document.getElementById(id);
    $("origin").textContent = location.origin;
    $("token").value = localStorage.getItem("adminToken") || "";

    function drawRules() {
      const mode = $("ruleMode").value;
      const visible = mode === "blacklist" ? rules.filter(([name]) => name !== "applications.txt") : rules;
      $("rules").innerHTML = visible.map(([name, target]) => '<div class="rule"><span>' + name + '</span><em class="' + target.toLowerCase() + '">' + target + '</em></div>').join("");
      const formatName = state.format === "singbox" ? "Sing-Box" : state.format[0].toUpperCase() + state.format.slice(1);
      $("ruleSummary").textContent = formatName + " · " + (mode === "whitelist" ? "白名单" : "黑名单") + " · " + visible.length + " 个文件";
    }

    function payload() {
      const token = $("token").value.trim();
      localStorage.setItem("adminToken", token);
      return {
        token,
        body: {
          source: $("source").value.trim(),
          title: $("title").value.trim() || "XUI Sub Rules",
          ruleMode: $("ruleMode").value,
          format: state.format,
          shortLink: $("shortLink").checked,
          customCode: $("customCode").value.trim(),
          xuiEmail: $("xuiEmail").value.trim()
        }
      };
    }

    function toast(message, kind = "") {
      $("toast").textContent = message;
      $("toast").className = "toast " + kind;
    }

    function human(bytes) {
      if (!bytes) return "0 B";
      const units = ["B","KB","MB","GB","TB","PB"];
      let size = bytes, unit = 0;
      while (size >= 1024 && unit < units.length - 1) { size /= 1024; unit++; }
      return (size >= 10 || unit === 0 ? size.toFixed(0) : size.toFixed(1)) + " " + units[unit];
    }

    function showTraffic(meta) {
      if (!meta) return;
      $("traffic").style.display = "grid";
      $("upload").textContent = human(meta.upload);
      $("download").textContent = human(meta.download);
      $("total").textContent = human(meta.total);
      $("expire").textContent = meta.expire ? new Date(meta.expire * 1000).toLocaleString() : "未知";
    }

    async function postJson(url, body, token) {
      const response = await fetch(url, {
        method: "POST",
        headers: { "content-type": "application/json", "authorization": "Bearer " + token },
        body: JSON.stringify(body)
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(data.error || response.statusText);
      return data;
    }

    document.querySelectorAll("[data-format]").forEach((button) => {
      button.addEventListener("click", () => {
        state.format = button.dataset.format;
        document.querySelectorAll("[data-format]").forEach((item) => item.classList.toggle("active", item === button));
        drawRules();
      });
    });
    $("ruleMode").addEventListener("change", drawRules);
    $("lookup").addEventListener("click", async () => {
      const { token, body } = payload();
      try {
        toast("正在读取 3x-ui 流量...");
        const data = await postJson("/api/xui/lookup", { source: body.source, xuiEmail: body.xuiEmail }, token);
        if (data.meta) showTraffic(data.meta);
        toast(data.email ? "已匹配 " + data.email : data.message || "未匹配到客户端", data.meta ? "ok" : "error");
      } catch (error) {
        toast(error.message, "error");
      }
    });
    $("generate").addEventListener("click", async () => {
      const { token, body } = payload();
      try {
        toast("正在生成链接...");
        const data = await postJson("/api/links", body, token);
        $("result").style.display = "grid";
        $("link").value = data.url;
        toast(data.shortCode ? "短链接已生成: " + data.shortCode : "链接已生成", "ok");
      } catch (error) {
        toast(error.message, "error");
      }
    });
    $("copy").addEventListener("click", async () => {
      await navigator.clipboard.writeText($("link").value);
      toast("已复制", "ok");
    });
    window.addEventListener("load", () => { if (window.lucide) window.lucide.createIcons(); });
    drawRules();
  </script>
</body>
</html>`;
}
