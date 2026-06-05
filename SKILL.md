---
name: course-forge
description: 把知识文档或口播稿，做成带旁白配音、互动测验、3D探索和嵌入式评估的分段式互动课件。产出物 = Vite + React + TS 项目 + course.json 三级课程架构 + 按章节切分的音频 + 字幕时序。工作流：知识文档 → 分段拆分(S1-S5) → 逐段开发(每段3-8章) → 互动组件嵌入(选择题/简答题/CSS 3D探索) → 音频合成(TTS provider-agnostic) → 字幕生成(字数占比分配ms) → 录屏部署。适合职业教育、企业培训、技能认证等场景。
---

# Course Forge — Interactive Courseware Builder

把一份知识文档或口播稿，一步步做成可录屏的分段式互动课件。产出物 = Vite + React + TS 项目 + course.json 三级架构 + 按章节切分的音频 + 互动测验组件 + CSS 3D 探索场景。

---

## 工作流总览

```
Phase 0   输入识别与内容准备
   0.1   识别用户输入（5 种场景）
   0.2   口播稿生成 → docs/ 目录存档 → 用户验收
   0.3   拆分章节方案：S1-S5 段 → 用户确认
   0.4   主题选定（chalk-garden 推荐用于教学）
   ▼
[Checkpoint Plan]   ← 硬节点。确认口播稿 + S1-S5 拆分 + 主题
   ▼
Phase 1   逐段开发（S1→S2→S3→S4→S5）
   1.1   脚手架
   1.2-1.N  每段 3-8 章，逐章制作 TSX+CSS+narrations，逐段验收
   ▼
[Checkpoint Audio]   ← 硬节点。是否合成音频
   ▼
Phase 2   音频合成与字幕（可选）
   ▼
Phase 3   构建与本地验收
   3.1   npm run build → dist/（纯静态文件，零服务端依赖）
   3.2   本地预览 → 用户验收通过
   ▼
[Checkpoint Accept]  ← 硬节点。课件内容通过本地验收
   ▼
Phase 4   部署与嵌入（后期，按项目技术栈适配）
```

## 何时不使用（降级为 web-video-presentation）

- 用户要求"做个视频"而非"做门课"
- 没有教学评估需求
- 不需要互动测验或 3D 交互
- 不需要将课件嵌入其他 Web 应用

---

## Phase 0 — 输入识别与内容准备

### 0.1 识别用户输入

根据用户首次提供的内容，匹配以下行为路径：

| # | 用户输入 | 触发行为 | 进入 |
|---|---------|------|:--:|
| **A** | 知识文档 + 口播稿 | 已有完整材料，跳过 0.2 | → 0.3 拆分 |
| **B** | 知识文档，无口播稿 | **询问**：是否根据文档生成口播稿？→ 是则执行 0.2 | → 0.2 → 0.3 |
| **C** | 仅课件大纲 / 主题 / 知识点列表 | **先生成课程大纲**，自动存档到 `docs/` → 再生成口播稿 → 存档 | → 0.2 → 0.3 |
| **D** | 仅课程名称 / 一句话需求 | **反问**：什么主题领域？有素材或大纲吗？请先提供内容 | — |
| **E** | 直接口播稿文本（粘贴/贴文件） | 跳过 0.2，直接使用已有稿子 | → 0.3 拆分 |

### 0.2 口播稿生成与存档

当用户选择生成口播稿（场景 B/C）时：

1. **生成口播稿**：根据源文档内容 + 下文 0.3 的 S1-S5 模板，逐段生成完整口播稿
   - 每章 ~3-4 步，每步 80-130 字，通过增加知识深度和广度扩展内容
   - 遵循双源原则（口播定节拍 + 画面定密度）
2. **创建目录**：如项目中不存在 `docs/` 目录则自动创建
3. **存档**：口播稿保存为 `docs/<标题>.md`（如 `docs/1.8 复杂场景业务流程分析与优化.md`）
4. **告知路径**：明确告知用户「口播稿已生成：`docs/xxx.md`，请审阅验收后继续」
5. **用户验收**：等用户确认口播稿内容无误（或提出修改意见）后，方可进入 0.3

### 0.3 拆分章节方案

**硬性拆分规则**（基于 97 章生产级课件验证）：

| 文档字数 | 拆分方案 | 每段章节数 | 预估时长 |
|---------|:-------:|:--------:|:-------:|
| ≤ 2,000 字 | 不拆，直接做 | 4-6 | ~10-15 min |
| 2,000-5,000 字 | 3 段 (S1/S2+S3/S4+S5) | 4-7/段 | ~25-35 min |
| 5,000-8,000 字 | 5 段 (S1-S5) | 4-7/段 | ~45 min |
| > 8,000 字 | **先建议用户精简到 8,000 字** | — | — |

> 8,000 字是黄金时长——经口播化改写 + 教学设计扩展后约对应 45 分钟，恰好是录播课的注意力上限。

**S1-S5 标准模板**：

| 段 | 类型 | 典型内容 | 教学方法 |
|----|------|---------|---------|
| S1 导入 | 场景 | 事故案例、冲突场景、角色定位 | 案发现场复盘 + 视觉化演示 |
| S2 知识精讲 | 理论 | 核心概念、体系框架、技术原理 | 视觉化演示（波形图/3D/对比表） |
| S3 案例演示 | 实战 | 真实数据、操作步骤、before/after | 极端场景推演 |
| S4 难点攻克 | 进阶 | 边界案例、常见陷阱、专家判断 | 案发现场复盘 + 启发式设问 |
| S5 总结通关 | 评估 | 复盘、弹题、SOP 作业、下节预告 | 柯氏四级评估嵌入 |

**输出模板**（给用户确认用）：

```
根据《XXXX》文档，建议拆分为 5 段：

S1 导入 (~6 min): <章节数>章 — <内容概要>
S2 知识精讲 (~10 min): <章节数>章 — <内容概要>
S3 案例演示 (~10 min): <章节数>章 — <内容概要>
S4 难点攻克 (~10 min): <章节数>章 — <内容概要>
S5 总结通关 (~7 min): <章节数>章 — <内容概要>

章节 ID 命名：<课程前缀>-<描述>（如 t5-black-truck, t5-3d-explore）
编号延续前序章节。

确认后我按 S1→S2→S3→S4→S5 逐段开发验收。
```

### 0.4 主题选择

**教学场景推荐 `chalk-garden`**（暗石板底+粉笔黄+手写字体，教室感）

其他可选：`blueprint`（技术架构）、`bold-signal`（醒目的）、`midnight-press`（正式学术）

### 0.5 确认目标时长与口播稿内容量

**必须在 Checkpoint Plan 前完成此步骤。**

0.5.1 **询问目标时长**：在进入开发前，明确询问用户：
> "本门课件目标时长是多少分钟？建议标准课时 45 分钟 / 微课 15-20 分钟 / 知识点卡片 5 分钟。"

根据用户回答确定目标音频时长（分钟）。

0.5.2 **评估口播稿内容量**：计算现有口播稿总字数。中文口播约为 **14-16 字/秒**（TTS 默认语速）。
```
预估时长（秒）= 口播稿总字数 / 15
预估时长（分钟）= 预估时长（秒）/ 60
```

0.5.3 **口播稿内容不足时自动扩展**：如果 `预估时长 < 目标时长 × 80%`（即缺口超过 20%），则自动扩展口播稿：
- 扩展策略：增加案例细节、补充背景说明、延长过渡衔接、加入学员互动引导语
- 每章目标字数 ≈ `(目标时长 × 60 × 15) / 章节数`
- 扩展后再次存档到 `docs/`，**明确告知用户**扩展了哪些内容及预估时长变化

0.5.4 **口播稿超出时主动提示**：如果 `预估时长 > 目标时长 × 120%`，提示用户超长，建议精简聚焦核心知识点。

0.5.5 **汇报最终预估时长**：将目标时长与实际预估时长一同写入开发计划供 Checkpoint Plan 确认。

> **示例**：目标 45 分钟课程，20 章，每章需约 135 秒（~2000 字）。口播稿仅 5000 字（预估 ~5.5 分钟），则需扩展至 ~40000 字后进入开发。

---

## Phase 1 — 逐段开发

### 1.1 脚手架

```bash
bash <path-to-course-forge>/scripts/scaffold.sh ./presentation --theme=<id>
```

删掉 `01-example` demo 章节，然后在 `chapters.ts` 中移除对应 import。

### 1.2-1.N 实现单章

**每章结构**：
```
src/chapters/XX-<id>/
├── <Component>.tsx     # 视觉实现，step >= N 条件渲染
├── <Component>.css     # 独立 CSS 前缀（2-4 字母缩写）
└── narrations.ts       # 每步口播文本数组，长度为该章总步数
```

**画面设计原则**（基于实战优化）：
- **左右宽布局优先**：`display:flex; gap:60px; max-width:1500px`，不要居中拥挤
- **step >= N 渐进揭示**：禁止一次性全展示，每步只展示与当前口播匹配的内容
- **不要文字量过大**：单页最多 3-4 条 bullet，每条不超过一行
- **交互优先**：如果内容适合交互（拖拽旋转、着色切换、选项点击），优先做交互版

**CSS 前缀约定**：每章独立 2-4 字母缩写前缀，避免跨章冲突。例：
- `t5bt-` (t5-black-truck)
- `t4fd-` (t4-fourth-dim)

**画布配置**（已优化，无需修改）：
- stage 内边距：`--stage-pad-x: 56px; --stage-pad-y: 40px`
- viewport margin：`marginX: 32, marginY: 48`
- 字幕字体：28px, line-height: 1.4

**章节 CSS 动画命名**：`{prefix}-{描述}`，如 `t5bt-in`、`t4fd-in`

**双源原则运用**：
- 每章首段从原始文档抽**信息池**（数字/引用/案例/标签）
- 口播稿中的数字翻译成感受（除非是核心冲击数字），但画面中保留原始精确值

### 1.3 注册章节

```typescript
// chapters.ts
import ChapterName from "../chapters/XX-<id>/ChapterName";
import { narrations as chNarr } from "../chapters/XX-<id>/narrations";

export const CHAPTERS: ChapterDef[] = [
  // ... existing entries
  { id: "<id>", title: "<title>", narrations: chNarr, Component: ChapterName },
];
```

### 1.4 更新 course.json

**禁止用文本编辑器的查找替换追加 JSON**（会导致括号错位、导航菜单消失）。

正确做法：
1. 编辑根目录 `course.json`，在对应 section 的 segments 中添加章节条目
2. 运行 `python3 regenerate-course-json.py` 验证 + 同步到 `presentation/public/`

### 1.5 构建验证

```bash
npm run build    # tsc + vite build
npm run extract-narrations   # 提取所有 narrations → audio-segments.json
```

### 1.6 互动组件

课件模板内置 **5 个可复用通用交互组件**，位于 `src/components/interactive/`：

| 组件 | 文件 | 用途 | 使用场景 |
|------|------|------|------|
| `Quiz` | `interactive/Quiz.tsx` | 通用选择题测验 | 随堂弹题、课后测试、知识自检 |
| `Accordion` | `interactive/Accordion.tsx` | 可展开/收起层级卡片 | 降级链、优先级表、操作步骤 |
| `ComparisonPanel` | `interactive/ComparisonPanel.tsx` | 双面板对比 + VS 裁决按钮 | 方案对比、多模态冲突仲裁 |
| `StaggeredList` | `interactive/StaggeredList.tsx` | 逐行动画列表/表格 | 审计清单、风险表、对比表 |
| `CircleStateDiagram` | `interactive/CircleStateDiagram.tsx` | 状态切换圆形图 | 熔断器三态、状态机、流程阶段 |
| `TimeDisplay` | `TimeDisplay.tsx` | 课件时长倒计时 + 进度条 | 右上角剩余时间 -HH:MM:SS，基于 audio/subtitle-timing 数据 |

**使用方式**：在章节 TSX 中直接 import 使用，每个组件接受 `prefix` prop 用于 CSS 命名空间避免跨章冲突。

**完整交互模式分类与设计指南**：见 [references/INTERACTIVE-PATTERNS.md](./references/INTERACTIVE-PATTERNS.md)（10 类交互模式，基于 182 章课件验证）。

**选择题**（type A）：在 TSX 中嵌入选项按钮，按钮带 `data-no-advance` 属性防止误触推进。option 中有一个 `correct` 标记。在 narrations 对应的步骤后设置 `interactiveSteps` 数组。

```tsx
// Example chapter definition
{ id: "quiz", ..., interactiveSteps: [2, 3] }
```

**简答题**（type B，设计规范见 QUIZ-CRAFT.md）：
- 使用 `<textarea>` + submit 按钮
- 答案校验：关键词匹配或 LLM-as-judge
- 持久化到 localStorage

**CSS 3D 探索**（type C）：
- 零依赖方案：`transform-style: preserve-3d` + `translate3d` + pointer events
- 拖拽旋转：`onPointerDown → setPointerCapture → onPointerMove 计算 delta → setRotation`
- 着色切换：按钮组切换颜色映射函数
- 约 200-300 个点可模拟真实场景

---

## Phase 2 — 音频合成与字幕

### 2.1 TTS Provider 抽象（默认 minimax）

TTS runner 是 **provider-agnostic** 的：runner 本身不绑定任何 TTS 后端，每个后端是 `scripts/tts-providers/<name>.sh` 一个文件。

```bash
npm run extract-narrations
npm run synthesize-audio   # skip 已存在
```

| Provider | 默认 | 何时用 |
|---|---|---|
| `minimax` | ✓ | 中文口播首选（要 API key + 选语音 ID） |
| `openai` | —— | 多数 agent 已有 `OPENAI_API_KEY` |
| `edge` | —— | 免费 / 无 key / pip install edge-tts |

**通用 TTS 限流处理**：
- 错误：HTTP 429 / "rate limit exceeded" / 1002 (RPM) / 1039 (TPM)
- 重试：等 **60s** 后重新跑 `npm run synthesize-audio`，脚本自动跳过已合成

### 2.2 音频压缩（可选，推荐）

TTS 合成输出的 MP3 通常码率偏高（MiniMax 平均值 ~388kbps），对纯语音叙述而言严重浪费。推荐在合成后运行压缩：

```bash
bash scripts/compress-audio.sh --preset high    # 64kbps, ↓50%, 语音透明 (推荐)
bash scripts/compress-audio.sh --preset medium  # 48kbps, ↓62%
bash scripts/compress-audio.sh --preset low     # 32kbps, ↓75%
bash scripts/compress-audio.sh --dry-run        # 预览不实际修改
```

**行为**：遍历 `public/audio/*/` 下所有 MP3，目标码率已达标则跳过，压缩后替换原文件。音频时长不变，字幕时序无需重新生成。

**建议工作流位置**：`synthesize-audio` 之后、`subtitle-timing` 之前。

### 2.3 字幕时序生成

**双模式**：默认（快速）用于现有章节，minimax（精确）用于新合成章节。

```bash
# 默认模式：55字句界切分 + ffprobe 实测音频时长（无需重合成）
python3 scripts/subtitle-timing.py

# MiniMax 词级精确模式：逐词 ms 对齐（新合成章节专用）
python3 scripts/subtitle-timing.py --mode minimax
```

| 模式 | 切分方式 | 步级时长 | 精度 | 适用范围 |
|------|---------|---------|:--:|------|
| default | 55字句界切分 | ffprobe 实测 mp3 时长 | ⭐⭐⭐ | 现有章节（单块率 <10%） |
| minimax | 按词级时间戳聚合 | MiniMax API 返回的逐词 ms | ⭐⭐⭐⭐⭐ | 新合成章节 |

**minimax 模式前提**：合成时 `minimax.sh` 自动请求 `subtitle_enable: true, subtitle_type: "word"`，词级时间戳存到 `public/minimax-word-timing/<chapter>/<step>.json`。

### 2.4 浮动字幕 UI

课件模板内置**浮动字幕**（无背景条遮挡画布）：

- 字幕直接浮于画面之上，纯 text-shadow 保证可读性
- 右上角 👁 切换按钮（stage hover 时出现），localStorage 持久化偏好
- 字幕字体 28px，双层 text-shadow：`0 1px 4px rgba(0,0,0,.85), 0 0 16px rgba(0,0,0,.5)`

---

## Phase 3 — 构建与本地验收

课件是一个**独立、自包含的纯前端项目**。构建产物是纯静态文件，无需任何后端服务即可验收。

### 3.1 构建

```bash
cd presentation && npm run build        # tsc + vite build → dist/
```

产出物 `dist/` 包含 `index.html`、`embed.html`、JS/CSS bundle、音频文件和字幕数据。

### 3.2 本地预览与验收

构建完成后立刻可以本地预览，**不需要嵌入任何主项目**：

```bash
# 方式 A：npx serve（最简单）
npx serve dist
# → http://localhost:3000/?auto=1

# 方式 B：Python HTTP Server
python3 -m http.server 3000 --directory dist
# → http://localhost:3000/?auto=1

# 方式 C：已有 Nginx / Caddy
# 将 dist/ 目录配置为静态站点根目录
```

URL 参数：`?auto=1`（自动播放模式）, `?chapter=N`（从第 N 章开始）。

**用户验收**：浏览课件全部章节，确认画面、字幕、音频、互动功能无误后，进入 Phase 4 决定如何部署嵌入。

---

## Phase 4 — 部署与嵌入

验收通过后，根据实际项目技术栈选择部署方式。课件 `dist/` 是纯静态文件，**对部署环境没有框架依赖**。

### 4.1 独立站点部署

模拟 Phase 3 的本地预览，部署到生产环境：

| 平台 | 方式 |
|------|------|
| **Nginx** | 将 `dist/` 配置为 `root` 目录，添加 `/api` 反向代理如需要 |
| **CDN / OSS** | 将 `dist/` 下所有文件上传至云存储桶，开启静态网站托管 |
| **GitHub Pages** | 将 `dist/` 推送到 `gh-pages` 分支 |
| **Docker** | `docker-compose.yml` 中挂载 `dist/` 到 Nginx 容器的 `/usr/share/nginx/html` |
| **rsync** | 直接推送 `dist/` 到 VPS 静态文件目录 |

### 4.2 嵌入已有 Web 应用

**推荐方案：新窗口独立页面**（兼容性最好，已验证）

```tsx
const openChapter = (c: Chapter) => {
  const url = `/${c.base_path}embed.html?auto=1&chapter=${c.start_chapter ?? 0}`;
  window.open(url, '_blank');
};
```

关键参数：`?auto=1`（自动播放模式），`?chapter=N`（起始章节）

详细方案见 [EMBEDDING.md](./references/EMBEDDING.md)

### 4.4 录屏

如需制作视频版本用于分发或预览：

```bash
cd presentation && npm run dev
# 浏览器打开 http://localhost:5173/?auto=1
# 按 SPACE → 全自动播放 → 录屏 → 裁头尾即成片
```

### 4.5 DB 集成模式（可选）

如需将课件嵌入已有 Web 应用的章节管理系统，可通过数据库驱动课程导航：

```sql
-- 课程表结构（通用示例，按实际 schema 调整）
CREATE TABLE IF NOT EXISTS courses (
  id VARCHAR(64) PRIMARY KEY,
  title VARCHAR(256) NOT NULL,
  base_path VARCHAR(256) NOT NULL,     -- e.g. 'courses/ai-trainer/'
  start_chapter INTEGER DEFAULT 0,     -- 该课在 presentation 中的起始章节 index
  sort_order INTEGER DEFAULT 0,
  status VARCHAR(16) DEFAULT 'published'
);

-- 每门课的 start_chapter = 前面所有已发布章节的总数
```

前端嵌入方式参考 [EMBEDDING.md](./references/EMBEDDING.md)。

---

## 硬性约束

1. **course.json 禁手工编辑** — 每次新增章节后运行 `python3 regenerate-course-json.py`
2. **逐段验收 + 时长汇报** — 做完每段必输出步骤数/时长，确保全课在 45-60 分钟区间
3. **双源原则** — 口播定节拍 + 文档定画面密度。用知识深度和广度扩展内容，不用废话凑时长
4. **字幕 0-indexed** — `str(s['step'] - 1)` 对齐 Subtitle 组件；用 `python3 scripts/subtitle-timing.py` 自动生成
5. **STORAGE_KEY bump** — 章节结构变化时 bump `useStepper.ts` 中的版本号

---

## 新技能能力

- 分段式课件开发（Phase 0.2 自动拆分 + 用户确认）
- 互动测验嵌入（选择题 / 简答题 / CSS 3D 探索）
- 柯氏四级评估体系（每节课 S5 嵌入 L1-L4）
- 三种教学方法（视觉化演示 / 极端场景推演 / 案发现场复盘）
- 五种 Web 应用嵌入方案（new-tab / iframe / React / DB 驱动 / URL 参数）
- course.json 自动生成脚本（防止 JSON 损坏）
- Chunk-based 字幕系统（55字切分 / ffprobe 实测时长 / 0-indexed）
- 字幕双模式（default ffprobe + minimax 逐词对齐）
- TTS provider-agnostic 合成（任何 TTS 都可接入）
- 浮动字幕 UI（无背景条 + 👁 切换按钮 + localStorage）
- 语义化配色 token（--accent / --accent-tech / --accent-good / --accent-warn / --accent-deep）
- 画布优化（stage-pad 56/40 + margin 32/48）
- 验收时长统计（每段交付前输出步骤数/字数/时长）
- 5 个可复用通用交互组件（Quiz / Accordion / ComparisonPanel / StaggeredList / CircleStateDiagram）
- 课件时长倒计时（TimeDisplay：-HH:MM:SS 倒计时 + 进度条，基于音频实测时长自动计算）
- DB 自动同步模式（POST /detect 读取 course.json 自动创建章节）

---

## 增补/插入章节到已有课程

当需要在已开发完成的课程中间（如 S5 之后、S6 等）插入新章节时，必须遵循以下规则避免章节编号冲突。

### 编号冲突原理

课程目录 `src/chapters/` 以 `{三位数编号}-{前缀}-{描述}` 命名，例如 `483-f1-scifi-bubble`。章节在课程列表中的**排序由目录名字母顺序决定**，不是由 `course.json` 决定。如果两个课程的章节目录使用了相同的三位数编号，它们在排序后会交叉排列，导致播放顺序错乱。

### 插入步骤

1. **查询目标位置的前后章节目录编号**：确定你要插入在哪两个现有目录编号之间。

2. **检查编号区间是否全部被占用**：在目标区间内执行 `ls {n}-*/ 2>/dev/null` 检查是否存在空闲编号。如果区间全部被占用（如 655-700 全部被其他课程章节占满），则需要：
   - **方案 A：追加到末尾**——使用大于当前最大编号的编号，菜单中仍可在 course.json 中归入正确课程段
   - **方案 B：腾挪编号**——将该区间靠后的一些目录重编号到更大数字，腾出空隙给新章节。重编号后音频目录名（不含编号）保持不变，无需重新合成音频

3. **创建章节目录**：按照 `{编号}-{前缀}-{id}/` 格式创建目录，编写 TSX + CSS + narrations。

4. **验证无编号冲突**：执行 `ls {编号}-*/` 确认只有一个目录匹配该编号。

5. **注册章节**：运行注册脚本生成 `chapters.ts`。

6. **更新 course.json**：在对应 section/segment 中添加新章节条目。

7. **验证顺序**：在注册脚本生成的 chapters.ts 中检查新章节的 filtered index 位置是否正确。

8. **构建 + 音频合成 + 字幕 + 部署**同常规流程。

### 音频目录说明

音频文件存在于 `public/audio/<章节ID>/`，目录名基于章节 ID（而非编号）。因此重编号后无需移动或重新合成音频，只需确保 course.json 和 chapters.ts 中的 ID 不变。

## 相关资源

| 文件 | 内容 |
|------|------|
| `references/COURSE-STRUCTURE.md` | 段/节/章三级架构 + course.json spec + 拆分规则 |
| `references/QUIZ-CRAFT.md` | 互动题设计模式（choice / textarea / 3D） |
| `references/EMBEDDING.md` | Web 应用嵌入方案（5 种） |
| `references/CHAPTER-CRAFT.md` | 章节开发详细指引 |
| `references/INTERACTIVE-PATTERNS.md` | 交互模式分类与设计指南（10 类） |
| `references/SCRIPT-STYLE.md` | 口播稿风格指南 |
| `references/AUDIO.md` | 音频合成完整流程 |
| `scripts/regenerate-course-json.py` | course.json 自动维护 |
| `scripts/subtitle-timing.py` | 字幕时序生成 |
| `scripts/diagnose-tts.sh` | TTS API 诊断 |
