# 部署与分发方案

课件 dist/ 是纯静态文件。**先看决策树**选方案，再展开实施。

---

## 决策树

| 用户场景 | 推荐方案 |
|:--|:--|
| "给用户一个网页链接直接看" | **方案 1** 静态托管（Vercel / Netlify / Nginx） |
| "嵌进 Notion / Confluence / 飞书 / 钉钉 / 公司 OA" | **方案 2** iframe 嵌入 |
| "我的应用是 React / Vue / Next.js / Nuxt" | **方案 3** 宿主应用挂载 |
| "我想发 B 站 / 公众号 / 抖音" | **方案 4** 录屏 MP4（详见 RECORDING.md） |
| "想离线用 / 装本地" | **方案 5** PWA / Service Worker |
| "统一容器化部署" | **方案 6** Docker |
| "大流量 / 公网分发" | **方案 7** CDN |

---

## 方案 1：静态托管（最常用 · 推荐）

适用：Vercel / Netlify / Cloudflare Pages / GitHub Pages / Nginx / Apache / Caddy

```bash
# 构建
cd presentation && npm run build     # 产出 dist/

# Vercel 部署（一行）
npx vercel --prod

# Netlify
npx netlify deploy --prod --dir=dist

# Cloudflare Pages
npx wrangler pages deploy dist

# GitHub Pages：把 dist/ 推到 gh-pages 分支
# Nginx: 拷 dist/ 到 /var/www，配置 server block
```

**Nginx 最小配置**：

```nginx
server {
  listen 80;
  server_name my-course.example.com;
  root /var/www/my-course/dist;
  index index.html;
  location / { try_files $uri $uri/ /index.html; }  # SPA fallback
}
```

**坑**：
- `index.html` 引用 `assets/` 路径**带 hash**，刷新不 404
- 子路由走 SPA fallback（`try_files ... /index.html`）
- 音频 mp3 通常 1-5 MB，配 `Cache-Control: public, max-age=31536000, immutable`

---

## 方案 2：iframe 嵌入

适用：Notion / Confluence / 飞书 / 钉钉文档 / 公司 OA / 个人博客

```html
<iframe src="https://my-course.example.com/?auto=0&chapter=0"
        style="width:100%;height:80vh;border:none"
        allowFullScreen></iframe>
```

**坑**：
- 目标服务器要 `X-Frame-Options: SAMEORIGIN` 或 `ALLOW-FROM https://嵌入来源`
- 跨域嵌入改用 `Content-Security-Policy: frame-ancestors *`
- iframe 内 `?auto=1` 会循环自动跳步——给用户用**务必 `auto=0`**

---

## 方案 3：宿主应用挂载

适用：React / Vue / Next.js / Nuxt 等 SPA 项目

```tsx
// React 路由
import CourseApp from './courses/my-course/dist/assets/index.js';
<Route path="/courses/my-course/*" element={<CourseApp />} />

// 或直接 iframe
<Route path="/courses/*" element={
  <iframe src="/courses/my-course/?auto=0" style={{width:'100%',height:'100vh',border:'none'}} />
} />
```

**坑**：
- 路径相对部署 base 路径要一致（vite `base` 配置 + `?auto=0` 不要拼 base）
- 避免宿主路由与课件路由冲突（前者是 SPA 路由，**别**让 `/courses/*` 触达宿主）
- 共享 `localStorage` 时 key 加前缀避免与宿主冲突

---

## 方案 4：录屏 MP4 视频

详见 `references/RECORDING.md`。QuickTime / OBS / ffmpeg + headless Chrome。
**录屏模式**：`http://localhost:5174/?auto=1` 一镜到底。

---

## 方案 5：PWA / 离线

```bash
cd presentation
npm install -D vite-plugin-pwa
# 在 vite.config.ts 加 VitePWA 插件
# 配置 manifest + service worker
npm run build   # dist/ 含 sw.js
# dist/ 可直接 file:// 访问（但部分功能受限于 file:// origin）
```

**坑**：
- service worker 只在 `https://` 或 `localhost` 注册生效
- file:// 协议下 `?auto=1` 可能因 SW 缓存而不更新
- 视频 / 音频文件**必须**预缓存（默认 vite-plugin-pwa 不会）

---

## 方案 6：Docker 容器化

```dockerfile
FROM nginx:alpine
COPY dist/ /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
```

```nginx
# nginx.conf
server { listen 80; root /usr/share/nginx/html; location / { try_files $uri $uri/ /index.html; } }
```

```bash
docker build -t my-course:v1 .
docker run -d -p 8080:80 my-course:v1
```

**坑**：
- 多页应用（多 dist/ 合并）需要分别配置 `location /<course-id>/`
- 容器时区影响录屏，但课件本身**无时间依赖**（除非用 `Date.now()`）

---

## 方案 7：CDN / 大流量

CloudFront / Cloudflare / Fastly：把 dist/ 上传到 S3 / R2 / OSS，
开 CDN，配 HTTPS + 缓存。

```bash
# AWS S3 + CloudFront 伪代码
aws s3 sync dist/ s3://my-course-bucket/ --delete
aws cloudfront create-invalidation --distribution-id E123 --paths "/*"
```

**坑**：
- 音频 mp3 通常 1-5 MB，CDN 缓存收益**最大**
- `index.html` 通常**不缓存**（`Cache-Control: no-cache`），否则更新不生效
- 静态资产 `Cache-Control: public, max-age=31536000, immutable` 强缓存
- 跨域 CORS：mp3 走 `<audio>` 不需要 CORS，但用 JS fetch 需要 `Access-Control-Allow-Origin`

---

## 跨方案通用坑

1. **路径 hash 化**：vite 默认给所有资产 `?hash=xxx`，刷新**不要**改
2. **MIME 类型**：mp3 / m4a / ogg 在某些服务器默认 `application/octet-stream`，要配
3. **CORS**：跨域 fetch 需要 `Access-Control-Allow-Origin`
4. **缓存头**：课件内容可设 `Cache-Control: public, max-age=31536000, immutable`
5. **录像模式 `?auto=1`**：只在用户录屏时打开，**不要**给普通用户用（无音频自动跳转错位）
6. **首屏空白**：vite 默认 `index.html` 在 `dist/`，直接 `npx serve dist` 验证

---

## 进一步阅读

按场景查对应官方文档：
- Vercel / Netlify：各自平台文档
- Nginx： `try_files` + `location` 路由
- React Router：嵌套路由
- iframe CORS：MDN X-Frame-Options / CSP frame-ancestors
- PWA：Google PWA 指南
- Docker：nginx alpine 镜像
- CDN：各 CDN 平台 cache 配置

本文件**只给范本**。遇到具体技术栈时按需深入。
