# 课件嵌入 Web 应用方案

## 方案对比

| 方案 | 兼容性 | 代码量 | 推荐场景 |
|------|:--:|:--:|------|
| **A. 新窗口打开** | ⭐⭐⭐⭐⭐ | 3 行 | **推荐：所有场景** |
| B. iframe 嵌入 | ⭐⭐⭐⭐ | 5 行 | 需配置 X-Frame-Options + nginx |
| C. React 动态加载 | ⭐⭐⭐ | ~30 行 | 需要深度集成到 SPA |
| D. DB 驱动路由 | ⭐⭐⭐⭐ | 需后端 | 多章节管理系统 |
| E. URL 参数控制 | ⭐⭐⭐⭐⭐ | 2 行 | 配合 A 或 B 使用 |

---

## 方案 A：新窗口打开（已验证，推荐）

```tsx
const openChapter = (c: Chapter) => {
  const ch = c.start_chapter ?? 0;
  const url = `/${c.base_path}embed.html?auto=1&chapter=${ch}`;
  window.open(url, '_blank');
};
```

**优点**：零兼容性问题，无 X-Frame-Options 限制，全屏体验最佳
**缺点**：不是"嵌入"体验，是一个独立 tab

---

## 方案 B：iframe 嵌入

```html
<iframe src="/courses/ai-trainer/embed.html?auto=1&chapter=30"
        style="width:100%;height:100%;border:none"
        allowFullScreen />
```

### Nginx 配置（关键！）

默认的 `X-Frame-Options: DENY` 会阻止 iframe 加载。需要为课程路径单独配置：

```nginx
# 主应用：禁止被嵌入
location / {
    add_header X-Frame-Options "DENY" always;
}

# 课件：允许被同源嵌入
location /courses/ {
    root /usr/share/nginx/html;
    try_files $uri $uri/ =404;
    # 不设置 X-Frame-Options 或设置为 SAMEORIGIN
}
```

> 实测：如果在 server 级别设置了 `add_header X-Frame-Options "DENY"`，在 location 级别单独覆盖可能因 nginx `add_header` 继承机制导致意外行为。**推荐方案**：server 级别不设全局 X-Frame-Options，在每个需要保护的 location 内单独设置。

---

## 方案 C：React SPA 动态加载

```tsx
const CourseViewer = ({ chapter }) => {
  const src = `/${chapter.base_path}embed.html?auto=1&chapter=${chapter.start_chapter ?? 0}`;
  return <iframe src={src} style={{ width: '100%', height: '100%', border: 'none' }} />;
};
```

与方案 B 类似，但通过 React 状态管理 `activeChapter` 来控制 iframe 的显示/隐藏。

---

## 方案 D：DB 驱动路由（ExamMaster 模式）

适合有多节课、每节课有多个章节的管理系统：

```sql
-- 课程组表
CREATE TABLE interactive_course_groups (
  id VARCHAR(64) PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  description TEXT DEFAULT ''
);

-- 章节表
CREATE TABLE interactive_courses (
  id VARCHAR(64) PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  base_path VARCHAR(255) NOT NULL,      -- 如 courses/ai-trainer/
  start_chapter INTEGER DEFAULT 0,      -- 该章节在 presentation 中的起始 index
  group_id VARCHAR(64),                  -- 所属课程组
  status VARCHAR(16) DEFAULT 'draft'
);
```

API 返回课程组及其章节，前端渲染两级卡片 → 点击打开新窗口/iframe。

---

## 方案 E：URL 参数控制

所有方案都可叠加 URL 参数：

| 参数 | 值 | 效果 |
|------|-----|------|
| `auto=1` | 布尔 | 自动播放模式（Audio + Auto-advance） |
| `chapter=N` | 整数 0-indexed | 从第 N 章开始播放 |
| `step=M` | 整数 | 从该章的第 M 步开始 |

示例 URL：
```
/courses/ai-trainer/embed.html?auto=1&chapter=30
→ 打开课件，自动模式，从第 30 章（1.2 开头）开始
```

> 注意：`?chapter=N` 优先级高于 localStorage 历史记录。见 `useStepper.ts` 的 `readURLParams()` 实现。

---

## 不同技术栈的部署

### 纯静态站点（nginx/Apache/CDN）

将 `presentation/dist/` 拷贝到 Web 服务器的静态目录。确保 `base: "./"` 在 vite.config.ts 中设置。

### Docker 部署

```dockerfile
FROM nginx:alpine
COPY presentation/dist/ /usr/share/nginx/html/courses/ai-trainer/
COPY nginx.conf /etc/nginx/nginx.conf
```

### Vite 嵌入到已有项目

```ts
// vite.config.ts (主项目)
export default defineConfig({
  publicDir: 'public',
  // courses/ai-trainer/ 下的文件会在 build 时自动拷贝到 dist/
});
```
