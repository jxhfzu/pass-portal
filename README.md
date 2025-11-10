# pass-portal
静态前端：访客通行证生成（输入姓名 + 生成二维码），适合部署到 Cloudflare Pages。

## 部署到 Cloudflare Pages（简要）
1. 将本仓库 push 到你的 GitHub（例如仓库名 `pass-portal`）。
2. 登录 Cloudflare → Pages → Create a project → 选择 GitHub 仓库 → 选择分支（如 `main`）。
3. Build settings:
   - Framework preset: **None**
   - Build command: （留空）
   - Build output directory: `.`
4. 部署后会得到一个 `xxxx.pages.dev` 域名（自动托管 HTTPS）。

## 绑定自定义子域（示例：pass.606520.xyz）
1. Pages 项目 → Custom domains → Add custom domain → 输入 `pass.606520.xyz`。
2. Cloudflare 会提示 DNS 记录。通常你需要在 Cloudflare DNS 中添加一个 **CNAME**：
   - **Type**: CNAME
   - **Name**: pass
   - **Target**: `<your-project>.pages.dev` （Cloudflare 提示的值）
   - **Proxy status**: DNS only（若 Cloudflare 要求）
3. 等待验证与证书颁发（通常几分钟到一小时）。

## 本地测试
1. 在本地打开 `index.html` 测试交互、二维码生成与下载。
2. 如果想本地运行一个简单静态服务器（可选）：
   ```bash
   # 使用 python 3
   python3 -m http.server 8000
   # 然后访问 http://localhost:8000
