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
      --shadow: 0 18px 44px rgba(38, 75, 128, .14);
    }
    * { box-sizing: border-box; }
    body {
      margin: 0;
      min-height: 100vh;
      font-family: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
      color: var(--ink);
      background:
        linear-gradient(120deg, rgba(219,231,255,.9) 0 50%, transparent 50% 100%),
        linear-gradient(180deg, #f8fbff 0%, #edf5ff 100%);
    }
    .shell {
      width: min(1180px, calc(100% - 40px));
      margin: 24px auto;
      padding: 34px;
      background: var(--panel);
      border: 1px solid var(--line);
      border-radius: 8px;
      box-shadow: var(--shadow);
      backdrop-filter: blur(12px);
    }
    header {
      display: grid;
      grid-template-columns: auto 1fr auto;
      gap: 18px;
      align-items: center;
    }
    .brand-mark {
      width: 64px;
      height: 64px;
      display: grid;
      place-items: center;
      border-radius: 50%;
      background: #fff;
      border: 1px solid var(--line);
      box-shadow: 0 12px 28px rgba(54, 100, 180, .12);
      color: var(--blue);
    }
    h1 {
      margin: 0;
      font-size: clamp(30px, 3vw, 42px);
      line-height: 1.08;
      letter-spacing: 0;
    }
    .origin {
      margin-top: 8px;
      color: #53668f;
      font-size: 16px;
      word-break: break-all;
    }
    .status {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      padding: 9px 14px;
      font-size: 14px;
      border: 1px solid var(--line);
      border-radius: 999px;
      color: #41547c;
      background: rgba(255,255,255,.7);
      white-space: nowrap;
    }
    .rail {
      position: relative;
      height: 22px;
      margin: 30px 0 0;
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
      margin-top: 10px;
      padding: 22px;
      border: 1px solid var(--line);
      border-radius: 8px;
      background: rgba(255,255,255,.66);
    }
    .grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 18px 20px;
      align-items: end;
    }
    .span { grid-column: 1 / -1; }
    label {
      display: block;
      font-weight: 800;
      margin-bottom: 8px;
      font-size: 15px;
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
      min-height: 86px;
      padding: 13px 15px;
      resize: vertical;
    }
    input, select {
      height: 48px;
      padding: 0 14px;
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
      height: 48px;
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
      min-height: 48px;
      font-weight: 800;
    }
    .checkrow input {
      width: 18px;
      height: 18px;
      padding: 0;
    }
    .actions {
      display: grid;
      grid-template-columns: minmax(150px, 220px) minmax(150px, 200px);
      gap: 12px;
      justify-content: end;
      align-items: end;
    }
    button.primary, button.secondary, button.copy {
      height: 48px;
      border-radius: 8px;
      border: 1px solid var(--line);
      font: inherit;
      font-weight: 850;
      display: inline-flex;
      justify-content: center;
      align-items: center;
      gap: 8px;
      cursor: pointer;
      white-space: nowrap;
    }
    button.primary {
      border: 0;
      color: #fff;
      background: linear-gradient(90deg, var(--violet), var(--blue));
      box-shadow: 0 10px 22px rgba(39,119,255,.16);
    }
    button.secondary, button.copy {
      color: #36517e;
      background: rgba(255,255,255,.74);
    }
    .result {
      margin-top: 18px;
      display: none;
      grid-template-columns: 1fr auto;
      gap: 14px;
      align-items: center;
    }
    .result input {
      font-size: 14px;
      color: #264066;
    }
    .traffic {
      display: none;
      margin-top: 14px;
      grid-template-columns: repeat(4, 1fr);
      gap: 12px;
    }
    .metric {
      border: 1px solid var(--line);
      border-radius: 8px;
      padding: 12px;
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
      font-size: 16px;
      overflow-wrap: anywhere;
    }
    .rules-head {
      margin-top: 28px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 16px;
    }
    .rules-head h2 {
      margin: 0;
      font-size: 20px;
      letter-spacing: 0;
    }
    .rules-head small {
      color: #53668f;
      font-weight: 800;
      font-size: 14px;
    }
    .rules {
      margin-top: 14px;
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 12px;
    }
    .rule {
      min-height: 44px;
      border: 1px solid var(--line);
      border-radius: 8px;
      background: rgba(255,255,255,.7);
      color: var(--ink);
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 12px;
      padding: 0 12px;
      font-size: 14px;
      font: inherit;
      font-weight: 850;
      text-align: left;
      cursor: pointer;
      transition: border-color .15s, box-shadow .15s, transform .15s;
    }
    .rule:hover, .rule:focus-visible {
      border-color: #7da8ff;
      box-shadow: 0 10px 26px rgba(39,119,255,.12);
      transform: translateY(-1px);
      outline: none;
    }
    .rule span {
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
    .rule em {
      font-style: normal;
      font-size: 13px;
      color: #53668f;
    }
    .rule em.proxy { color: #075eea; }
    .rule em.reject { color: var(--red); }
    .toast {
      min-height: 22px;
      margin-top: 12px;
      color: #53668f;
      font-weight: 750;
    }
    .dialog-backdrop {
      position: fixed;
      inset: 0;
      display: none;
      place-items: center;
      padding: 24px;
      background: rgba(7, 27, 77, .22);
      backdrop-filter: blur(6px);
      z-index: 20;
    }
    .dialog-backdrop.open { display: grid; }
    .dialog {
      width: min(620px, 100%);
      border: 1px solid var(--line);
      border-radius: 8px;
      background: rgba(255,255,255,.96);
      box-shadow: 0 24px 70px rgba(38, 75, 128, .24);
      padding: 22px;
    }
    .dialog-head {
      display: flex;
      justify-content: space-between;
      gap: 16px;
      align-items: start;
    }
    .dialog-head h3 {
      margin: 0;
      font-size: 22px;
      letter-spacing: 0;
    }
    .icon-button {
      width: 36px;
      height: 36px;
      border: 1px solid var(--line);
      border-radius: 8px;
      background: #fff;
      color: var(--ink);
      display: inline-grid;
      place-items: center;
      cursor: pointer;
    }
    .dialog-meta {
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
      margin: 14px 0;
    }
    .chip {
      border: 1px solid var(--line);
      border-radius: 999px;
      padding: 6px 10px;
      color: #41547c;
      font-size: 13px;
      font-weight: 800;
      background: #fff;
    }
    .rule-url {
      display: grid;
      grid-template-columns: 1fr auto;
      gap: 10px;
      align-items: center;
    }
    .dialog-actions {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 10px;
      margin-top: 14px;
    }
    .rule-preview {
      margin-top: 14px;
      max-height: 220px;
      overflow: auto;
      border: 1px solid var(--line);
      border-radius: 8px;
      background: #f8fbff;
      padding: 12px;
      color: #243a61;
      font-family: ui-monospace, SFMono-Regular, Consolas, "Liberation Mono", monospace;
      font-size: 12px;
      white-space: pre-wrap;
    }
    .toast.error { color: var(--red); }
    .toast.ok { color: var(--green); }
    @media (max-width: 900px) {
      .shell { width: min(100% - 20px, 760px); padding: 22px 16px; margin: 10px auto; }
      header { grid-template-columns: 52px 1fr; }
      .brand-mark { width: 52px; height: 52px; }
      .status { grid-column: 1 / -1; justify-self: start; }
      .origin { font-size: 16px; }
      .grid, .rules, .traffic { grid-template-columns: 1fr; }
      .actions { grid-template-columns: 1fr; justify-content: stretch; }
      .result { grid-template-columns: 1fr; }
      .segmented { grid-template-columns: 1fr; height: auto; }
      .segmented button { min-height: 44px; }
      .rule-url, .dialog-actions { grid-template-columns: 1fr; }
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
  <div class="dialog-backdrop" id="ruleDialog" aria-hidden="true">
    <div class="dialog" role="dialog" aria-modal="true" aria-labelledby="ruleDialogTitle">
      <div class="dialog-head">
        <h3 id="ruleDialogTitle">规则文件</h3>
        <button type="button" class="icon-button" id="closeRuleDialog" aria-label="关闭"><i data-lucide="x" aria-hidden="true"></i></button>
      </div>
      <div class="dialog-meta">
        <span class="chip" id="ruleDialogFormat">Clash</span>
        <span class="chip" id="ruleDialogTarget">DIRECT</span>
        <span class="chip" id="ruleDialogMode">白名单</span>
      </div>
      <div class="rule-url">
        <input id="ruleDialogUrl" readonly />
        <button type="button" class="copy" id="copyRuleUrl"><i data-lucide="copy" aria-hidden="true"></i>复制</button>
      </div>
      <div class="dialog-actions">
        <button type="button" class="secondary" id="previewRule"><i data-lucide="eye" aria-hidden="true"></i>预览文件</button>
        <button type="button" class="primary" id="openRule"><i data-lucide="external-link" aria-hidden="true"></i>打开文件</button>
      </div>
      <pre class="rule-preview" id="rulePreview">点击预览文件查看前 80 行。</pre>
    </div>
  </div>

  <script>
    const rules = [
      ["applications.txt", "DIRECT"], ["private.txt", "DIRECT"], ["reject.txt", "REJECT"],
      ["icloud.txt", "DIRECT"], ["apple.txt", "DIRECT"], ["google.txt", "PROXY"],
      ["proxy.txt", "PROXY"], ["direct.txt", "DIRECT"], ["telegramcidr.txt", "PROXY"],
      ["cncidr.txt", "DIRECT"], ["lancidr.txt", "DIRECT"]
    ];
    const state = { format: "clash", activeRule: null };
    const $ = (id) => document.getElementById(id);
    $("origin").textContent = location.origin;
    $("token").value = localStorage.getItem("adminToken") || "";

    function drawRules() {
      const mode = $("ruleMode").value;
      const visible = mode === "blacklist" ? rules.filter(([name]) => name !== "applications.txt") : rules;
      $("rules").innerHTML = visible.map(([name, target]) => '<button type="button" class="rule" data-rule="' + name + '" data-target="' + target + '"><span>' + name + '</span><em class="' + target.toLowerCase() + '">' + target + '</em></button>').join("");
      const formatName = formatLabel();
      $("ruleSummary").textContent = formatName + " · " + (mode === "whitelist" ? "白名单" : "黑名单") + " · " + visible.length + " 个文件";
      document.querySelectorAll("[data-rule]").forEach((button) => {
        button.addEventListener("click", () => openRuleDialog(button.dataset.rule, button.dataset.target));
      });
    }

    function formatLabel(format = state.format) {
      if (format === "singbox") return "Sing-Box";
      return format[0].toUpperCase() + format.slice(1);
    }

    function ruleUrl(name, format = state.format) {
      const base = name.replace(/\.txt$/, "");
      if (format === "singbox") return location.origin + "/rules/singbox/" + base + ".json";
      if (format === "surge") return location.origin + "/rules/surge/" + base + ".txt";
      return location.origin + "/rules/clash/" + base + ".txt";
    }

    function openRuleDialog(name, target) {
      state.activeRule = { name, target };
      $("ruleDialogTitle").textContent = name;
      $("ruleDialogFormat").textContent = formatLabel();
      $("ruleDialogTarget").textContent = target;
      $("ruleDialogMode").textContent = $("ruleMode").value === "whitelist" ? "白名单" : "黑名单";
      $("ruleDialogUrl").value = ruleUrl(name);
      $("rulePreview").textContent = "点击预览文件查看前 80 行。";
      $("ruleDialog").classList.add("open");
      $("ruleDialog").setAttribute("aria-hidden", "false");
      if (window.lucide) window.lucide.createIcons();
    }

    function closeRuleDialog() {
      $("ruleDialog").classList.remove("open");
      $("ruleDialog").setAttribute("aria-hidden", "true");
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
    $("closeRuleDialog").addEventListener("click", closeRuleDialog);
    $("ruleDialog").addEventListener("click", (event) => {
      if (event.target === $("ruleDialog")) closeRuleDialog();
    });
    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape") closeRuleDialog();
    });
    $("openRule").addEventListener("click", () => {
      if (!state.activeRule) return;
      window.open(ruleUrl(state.activeRule.name), "_blank", "noopener,noreferrer");
    });
    $("copyRuleUrl").addEventListener("click", async () => {
      await navigator.clipboard.writeText($("ruleDialogUrl").value);
      toast("规则链接已复制", "ok");
    });
    $("previewRule").addEventListener("click", async () => {
      if (!state.activeRule) return;
      $("rulePreview").textContent = "正在读取规则文件...";
      try {
        const response = await fetch(ruleUrl(state.activeRule.name));
        if (!response.ok) throw new Error("规则文件读取失败: " + response.status);
        const text = await response.text();
        $("rulePreview").textContent = text.split("\n").slice(0, 80).join("\n") || "文件为空";
      } catch (error) {
        $("rulePreview").textContent = error.message;
      }
    });
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
