# Course Mode — 课程模式增量

本文件记录 Course Forge **相较于单视频模式的增量能力**：
课程结构 / 课程结构文档 / 互动评估 / 多课程管理 / 故障自检。
**主模式是单视频**，本文件**默认不读**——只有当用户**明确**说"做课件/课程/多段"时
才加载。

> **课程模式 5 级术语**（与 SKILL 主体"章"对齐，避免歧义）：
> - **课 (Section)** = 整节课件（多段课程的顶层单元，自己定义命名），JSON 字段 `sections`
> - **段 (Segment)** = 课内主题分块（id 形如 S1、S2...，**段数按内容需要灵活切分**，常见 1~5 段），JSON 字段 `segments`
> - **小节 (Lesson)** = 段下内容编排单位（agent 切分时的人为分组，**不进入 JSON**）
> - **章 (Chapter)** = 30-60s 画面 = N 步 = **SKILL 主体"章"**（JSON 字段 `chapters`）
> - 步 (Step) = 最小口播节拍（与 SKILL 主体同义）
>
> JSON 数据结构 4 级：`course → sections[] → segments[] → chapters[]`，每章含 N 步。

---

## S1-S5 段数灵活骨架（**参考，不是固定模板**）

课程课件**至少**包含：
- **1 段导入类**（案例 / 冲突 / 角色定位）—— 钩住观众 + 定位
- **1 段收官类**（复盘 / 作业 / 下节预告 / 模块收官）—— 闭环
- 中间**任意数量**的"知识精讲 / 案例演示 / 难点攻克"段——**内容驱动**

| 段类型 | 内容方向 | 教学方法 | 何时用 |
|---|---|---|---|
| 导入 | 案例 / 冲突场景 / 角色定位 | 灾难复盘 / 角色代入 | 每课开头 |
| 知识精讲 | 核心概念 / 体系框架 / 原理 | 视觉化演示 | 中段（多次） |
| 案例演示 | 真实数据 / 操作步骤 | before-after 对比 | 中段 |
| 难点攻克 | 边界案例 / 常见陷阱 | 启发式设问 | 中后段 |
| 收官 | 复盘 / 作业 / 模块收官 | 柯氏四级评估 | 末段 |

> 应根据内容灵活切分
>
> **段标题由内容自取**

---

## 课程结构文档（course.json 格式 spec）

### JSON 结构

```json
{
  "courseId": "my-course",
  "title": "示例课程",
  "sections": [
    {
      "id": "1.1",
      "title": "section 标题",
      "source": "1.1业务流程设计.md",
      "segments": [
        { "id": "S1", "title": "导入", "chapters": [{"id":"xx","title":"xx"},...] },
        { "id": "S2", "title": "知识精讲", "chapters": [...] }
      ]
    }
  ]
}
```

### 字段约定

| 层级 | 字段 | 必填 | 说明 |
|------|------|:--:|------|
| Root | `courseId` | ✓ | 课程唯一标识 |
| Root | `title` | ✓ | 课程名称（显示在 ChapterMenu 顶部） |
| Root | `sections` | ✓ | Section 数组 |
| Section | `id` | ✓ | 如 "1.1", "1.2"，小写+数字+连字符 |
| Section | `title` | ✓ | 给人看的中文标题 |
| Section | `source` | | 关联的原始文档文件名 |
| Section | `segments` | ✓ | Segment 数组 |
| Segment | `id` | ✓ | "S1"~"S5"（或 S6+） |
| Segment | `title` | ✓ | 内容驱动命名 |
| Segment | `chapters` | ✓ | **章** ID+Title 数组（`chapters` 字段名沿用单视频模式历史命名，不要改；课程模式下其内部条目实际语义 = 30-60s 屏 = SKILL 主体"章"） |
| Chapter | `id` | ✓ | 必须在 chapters.ts 中注册 |
| Chapter | `title` | ✓ | 显示在 ChapterMenu 中 |

### 单视频模式：course.json **可删**

单视频模式不需要 `course.json`（无多段 / 无菜单需求）。删除 `course.json` +
从 `src/registry/chapters.ts` 删 `ChapterMenu` 引用即可回到纯视频模式。

### 课程模式：course.json 必存在

课程模式依赖 `course.json` 渲染三级导航菜单。**不可删**。

---

## 多课程管理（course-<id>.json）

单一 `course.json` 默认对应当 URL 不带 `?course=` 时。多课程时，额外加：

| 文件 | 对应 URL |
|:--|:--|
| `course.json` | `localhost:5174/` (默认) |
| `course-<id>.json` | `localhost:5174/?course=<id>` |

> 课程 ID 建议用**课程级编号 (L1/L2/L3/L4)** 或 **主题分类 (kids/teens/pro)**，
> 避免与未来版本冲突。

### 文件关系

| 文件 | 作用 | 何时存在 |
|:--|:--|:--|
| `course.json` | 默认课程的结构化目录 | 始终存在（课程模式） |
| `course-<id>.json` | 某门特定课程的结构化目录 | 每新增一门课就多一个 |
| `public/course-<id>.json` | vite 真正服务的副本 | 由 `scripts/sync-course-json.sh` 自动同步 |
| `src/registry/chapters.ts` | **全部课程的章平铺注册表**（文件名沿用 SKILL 主体约定；课程模式沿用此目录命名） | 始终存在 · 目录名自动生成 |

### 两套注册机制

- **`chapters.ts`** — 全局平铺的章注册表。所有课程的章按目录名字母序排列，`course-*.json` 通过章 ID 引用其中的条目。**这是什么？** 一个巨大的线性列表。
- **`course-*.json`** — 结构化课程目录。定义每门课的 `课 → 段 → 章` 层级（"小节"作为 agent 切分概念不进 JSON），驱动导航菜单。**这是什么？** 课程的大纲/目录。

> **关键**：新增/删除章 → 两个地方都要一致。章目录创建后自动注册到 `chapters.ts`，`course-*.json` 需手工添加对应条目。`course.json` 不可删除——导航菜单依赖它渲染。

### App.tsx 中的路由规则

前端通过两层过滤决定展示哪些章：

1. **`filterChapters`** — 按章 ID 前缀筛选，只把属于当前课程的章从 `chapters.ts` 中挑出来
2. **`jsonMap`** — `?course=<id>` 映射到对应的 `course-<id>.json` 文件，提供结构化菜单

### 静态文件的双源问题（**最容易踩的坑**）

vite dev server **只从 `public/` 目录**服务静态资源，**不会读根目录的 `course-*.json`**。

| 你改的文件 | vite 看到吗? | 修复 |
|:--|:--:|:--|
| 根目录 `course-*.json` | ❌ | 跑 `sync-course-json.sh` 建软链 |
| `public/course-*.json` | ✅ | 直接生效（dev 改完 HMR 触发） |

> **解决方案**：在 `public/` 下用 `ln -sf` 软链把每个 `course-*.json` 指向根目录的对应文件。
> 一处修改，两处生效（dev 阶段实时）。
> `npm run build` 阶段会展开软链为真实文件，**生产 dist/ 不受影响**。

> **为什么根目录 + 软链，而不是直接放 `public/`？** 因为 `public/` 是 vite dev server 服务区；根目录放 `course.json` 是为了**与 `course-l4.json` 等多课程文件平级管理**——编辑器一次打开 / git diff 一目了然。软链 = 鱼与熊掌兼得（dev 同步 + 编辑器友好）。

> **修改根目录 `course-*.json` 后不需要再跑 `sync-course-json.sh`** —— 软链已建立，改完即生效（HMR 实时更新）。脚本只在 **3 种场景** 跑：
> 1. 首次创建软链
> 2. 新增 `course-<id>.json`（多了一门课要建立新软链）
> 3. 软链断了（`ls -la public/course*.json` 看是否有 `->` 箭头；或 `sync-course-json.sh` 报错）

### 同步多课程 JSON（一键操作）

```bash
bash scripts/sync-course-json.sh
```

输出示例：
```
→ Project root: /path/to/presentation
→ Found 3 json file(s): course.json course-<primary>.json course-<kids>.json
  ✓ Linked public/course.json -> ../course.json
  ✓ Linked public/course-<primary>.json -> ../course-<primary>.json
  ✓ Linked public/course-<kids>.json -> ../course-<kids>.json
→ Total: 3 json file(s) synced to public/
```

脚本会先验证每个 JSON 语法，**任一损坏立即报错**（exit 2）—— 不会让 vite 提供损坏的菜单。

### 新增一门课程

1. 创建 `course-<id>.json`，定义各课/段/章的层级（"小节"作为 agent 切分概念不进 JSON）
2. 在 `App.tsx` 的 `filterChapters` 中追加新课程的章 ID 前缀过滤规则
3. 在 `App.tsx` 的 `jsonMap` 中追加 `"{id}": "course-<id>.json"` 映射
4. 跑 `bash scripts/sync-course-json.sh` 自动建软链
5. 章目录按字母后缀法分配编号，避免与已有课程的编号区间重叠
6. 验证：访问 `?course=<id>`，确认导航菜单正常显示

---

## 互动测验

### 选择题（类型 A）

```tsx
{step >= 1 && (
  <div className="quiz-options">
    <button className="quiz-opt" data-no-advance
      onClick={() => setSelected(0)}>A. 选项一</button>
    <button className="quiz-opt" data-no-advance
      onClick={() => setSelected(1)}>B. 选项二 ✓</button>
  </div>
)}
```

- 在 `chapters.ts` 中标记 `interactiveSteps: [1, 2]`
- Auto 模式在 interactiveSteps 步骤自动暂停，等用户点击
- 多题章：Q1 在 step 1、Q2 在 step 2

### 简答题（类型 B）

```tsx
<textarea className="quiz-input" placeholder="输入你的答案..." />
<button className="quiz-submit" data-no-advance>提交</button>
```

答案校验：关键词匹配或 LLM-as-judge。持久化到 localStorage。

### CSS 3D 探索（类型 C）

零依赖方案：`transform-style: preserve-3d` + pointer events。
拖拽旋转 / 着色切换 / 约 200-300 个点模拟真实场景。

---

## 柯氏四级评估

每节课末段嵌入 L1-L4 评估：

| 层级 | 含义 | 末段嵌入方式 |
|:--|:--|:--|
| L1 反应层 | 学员满意度 | 弹题中加"你觉得本节难易度如何？" |
| L2 学习层 | 知识掌握 | 随堂选择题 + 通关代码截图 |
| L3 行为层 | 实际应用 | 课后挑战（如"极限测试X/Y坐标边界"） |
| L4 结果层 | 业务效果 | 追踪项目指标改善比例（长期） |

---

## 章编号方案

章目录 `src/chapters/{编号}-{前缀}-{id}/`，排序由目录名字母序决定。

### 插入章时避免编号冲突

| 方案 | 方法 | 用于 |
|:--|:--|:--|
| 有空隙 | 直接使用间隙编号 | 前后有数字空档 |
| **加字母后缀** | 前编号后加字母 (`674a-`, `674b-`...) | 无空隙时 |
| 移末尾 | 用曲线顺序的大编号 | 区间已满 |

```bash
# 验证无冲突
ls {编号}-*/ | sort
```

> 音频目录基于章 ID（非编号），重编号无需移动音频。

---

## 增补/插入章到已有课程

| 方案 | 方法 | 示例 |
|:--|:--|:--|
| 有空隙 | 使用空隙内编号 | 674→680 间可用 675-679 |
| **加字母后缀** | 前编号后加字母 | `10a-` 在 `10-` 后、`11-` 前 |
| 区间已满 | 用更大编号 | 挪到末尾 |

```bash
ls {编号}-*/ | sort
```

### 注意事项

- `course.json` 是课程的默认菜单文件，**课程模式不可删**
- 不同课程的章 ID 前缀必须互斥——通过 `filterChapters` 的过滤规则保证菜单不混淆
- 音频目录基于章 ID（非编号），重编号无需移动音频文件

---

## 素材目录

课件开发中口播提到的真实场景截图、模板文件、参考图片等素材
统一存放在项目 `docs/materials/` 目录下。

### 开发时调用

Checkpoint Plan 阶段向用户确认素材文件名后，在章 TSX 中以
相对路径引用：

```html
<img src="docs/materials/factory-screenshot.png" />
```

### 多模态模型接入

当接入多模态视觉模型时，Phase 2 开发前先将素材目录中的图片
传给模型识别内容，再将识别结果融入画面设计。
此时 `docs/materials/` 即为多模态模型的图片输入源。

### 验收链接（dev server 跑起来后告诉用户怎么验证菜单结构）

- 默认课程（无 ?course=）：     http://localhost:5174/
- 多课程时按 ID 切换：        http://localhost:5174/?course=<course-id>
- 例（仅作通用范式参考）：   http://localhost:5174/?course=l4

启动方式提示：标准：`npm run dev`（vite 默认端口 5174）
  
---

## 故障自检（菜单空白排查）

ChapterMenu 组件从对应 `course-*.json` 读取数据渲染三级导航。如果
该文件格式错误（JSON parse 失败），`courseDef` 为 null，导航菜单
不渲染。**日志无报错，仅表现为空白**——这是最常被忽略的 bug 来源。

**自检流程**：导航菜单空白 → 逐项排查：

1. `python3 -m json.tool < public/course-<id>.json` → JSON 能 parse？
2. `ls -la public/course-*.json` → 软链是否健全？
3. `cat /tmp/vite.log | tail -20` → vite 是否报错？
4. `curl -s http://localhost:5174/course-<id>.json` → vite 服务的副本是否对？
5. 若第 1 步报错 → 跑 `sync-course-json.sh` 修 JSON 语法
6. 若第 2 步断链 → 跑 `sync-course-json.sh` 重软链
7. 若第 4 步拿到的是旧版 → vite 缓存了，重启 vite

> **预防**：每次改 `course-*.json` 后**立即**跑 `sync-course-json.sh`，
> 顺手验证 JSON 语法。

---

## 部署与分发（可选）

课件交付 = 纯静态 `dist/`。具体部署方案（静态托管 / iframe 嵌入 /
宿主应用挂载 / 录屏成片 / PWA / Docker / CDN）**不在本文档展开**，
按用户技术栈和场景见 `references/DEPLOYMENT.md` 的决策树。
