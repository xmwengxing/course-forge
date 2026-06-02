---
name: course-forge
description: 把知识文档或口播稿，做成带旁白配音、互动测验、3D探索和嵌入式评估的分段式互动课件。产出物 = Vite + React + TS 项目 + course.json 三级课程架构 + 按章节切分的音频 + 字幕时序。工作流：知识文档 → 分段拆分(S1-S5) → 逐段开发(每段3-8章) → 互动组件嵌入(选择题/简答题/CSS 3D探索) → 音频合成(TTS provider-agnostic) → 字幕生成(字数占比分配ms) → 录屏部署。适合职业教育、企业培训、技能认证等场景。
---

# Course Forge — Interactive Courseware Builder

把一份知识文档或口播稿，一步步做成可录屏的分段式互动课件。产出物 = Vite + React + TS 项目 + course.json 三级架构 + 按章节切分的音频 + 互动测验组件 + CSS 3D 探索场景。

---

## 工作流总览

```
Phase 0   结构规划
   0.1   识别用户输入（知识文档 / 口播稿）
   0.2   拆分章节方案：S1-S5 段 → 用户确认
   ▼
[Checkpoint Split]   ← 硬节点。确认 S1-S5 拆分 + 主题
   ▼
Phase 1   内容准备
   1.1   生成 script.md（口播稿） + outline.md（开发计划 + 信息池）
   1.2   主题选定（chalk-garden 推荐用于教学）
   ▼
[Checkpoint Plan]    ← 硬节点。确认稿子/outline/主题/模式
   ▼
Phase 2   逐段开发（S1→S2→S3→S4→S5）
   2.1   脚手架
   2.2-2.N  每段 3-6 章，逐章制作 TSX+CSS+narrations，逐段验收
   ▼
[Checkpoint Audio]   ← 硬节点。是否合成音频
   ▼
Phase 3   音频合成（可选）
Phase 4   录屏 + 后期
```

## 何时不使用（降级为 web-video-presentation）

- 用户要求"做个视频"而非"做门课"
- 没有教学评估需求
- 不需要互动测验或 3D 交互
- 不需要将课件嵌入其他 Web 应用

---

## Phase 0 — 结构规划

### 0.1 识别用户输入

| 用户给 | 操作 |
|--------|------|
| 知识文档（含教学设计、口播稿） | 解析为 S1-S5 段，在 0.2 拆分 |
| 直接的口播稿 / 视频脚本 | 使用已有 script.md，仍需做 S1-S5 拆分 |
| "帮我做门 X 主题的课" | **反问**：先给素材或大纲 |

### 0.2 拆分章节方案

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

---

## Phase 1 — 内容准备

### 1.1 口播稿生成原则

1. **避免制造废话**：不要为凑时长写空泛的排比句。通过增加知识深度（具体数值、技术原理、行业背景）和广度（案例对比、应用场景延伸）来扩展内容
2. **双源原则**：口播稿 script 定节拍（每步对应一个想法），原始文档 article 定画面密度（哪些信息要挂到屏幕上）
3. **口播稿自检**：每步 ~80-130 字，300ms/字语速为基准。单步过多则拆分，过少则合并
4. **章节标题**在 narrations.ts 开头或 TSX 组件中体现，口播中不念"接下来讲第X章"

### 1.2 主题选择

**教学场景推荐 `chalk-garden`**（暗石板底+粉笔黄+手写字体，教室感）

其他可选：`blueprint`（技术架构）、`bold-signal`（醒目的）、`midnight-press`（正式学术）

---

## Phase 2 — 逐段开发

### 2.1 脚手架

```bash
bash <path-to-course-forge>/scripts/scaffold.sh ./presentation --theme=<id>
```

删掉 `01-example` demo 章节，然后在 `chapters.ts` 中移除对应 import。

### 2.2-2.N 实现单章

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

### 2.3 注册章节

```typescript
// chapters.ts
import ChapterName from "../chapters/XX-<id>/ChapterName";
import { narrations as chNarr } from "../chapters/XX-<id>/narrations";

export const CHAPTERS: ChapterDef[] = [
  // ... existing entries
  { id: "<id>", title: "<title>", narrations: chNarr, Component: ChapterName },
];
```

### 2.4 更新 course.json

**禁止用文本编辑器的查找替换追加 JSON**（会导致括号错位、导航菜单消失）。

正确做法：
1. 编辑根目录 `course.json`，在对应 section 的 segments 中添加章节条目
2. 运行 `python3 regenerate-course-json.py` 验证 + 同步到 `presentation/public/`

### 2.5 构建验证

```bash
npm run build    # tsc + vite build
npm run extract-narrations   # 提取所有 narrations → audio-segments.json
```

### 2.6 互动组件

课件模板内置 **5 个可复用通用交互组件**，位于 `src/components/interactive/`：

| 组件 | 文件 | 用途 | 使用场景 |
|------|------|------|------|
| `Quiz` | `interactive/Quiz.tsx` | 通用选择题测验 | 随堂弹题、课后测试、知识自检 |
| `Accordion` | `interactive/Accordion.tsx` | 可展开/收起层级卡片 | 降级链、优先级表、操作步骤 |
| `ComparisonPanel` | `interactive/ComparisonPanel.tsx` | 双面板对比 + VS 裁决按钮 | 方案对比、多模态冲突仲裁 |
| `StaggeredList` | `interactive/StaggeredList.tsx` | 逐行动画列表/表格 | 审计清单、风险表、对比表 |
| `CircleStateDiagram` | `interactive/CircleStateDiagram.tsx` | 状态切换圆形图 | 熔断器三态、状态机、流程阶段 |

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

## Phase 3 — 音频合成

### 3.1 TTS Provider 抽象（默认 minimax）

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

### 3.2 字幕时序生成

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

### 3.3 浮动字幕 UI

课件模板内置**浮动字幕**（无背景条遮挡画布）：

- 字幕直接浮于画面之上，纯 text-shadow 保证可读性
- 右上角 👁 切换按钮（stage hover 时出现），localStorage 持久化偏好
- 字幕字体 28px，双层 text-shadow：`0 1px 4px rgba(0,0,0,.85), 0 0 16px rgba(0,0,0,.5)`

---

## Phase 4 — 录屏与部署

### 录屏

```bash
# 启动 dev server
cd presentation && npm run dev
# 浏览器打开 http://localhost:5173/?auto=1
# 按 SPACE → 全自动播放 → 录屏 → 裁头尾即成片
```

### 嵌入 Web 应用

**推荐方案：新窗口独立页面**（兼容性最好，已验证）

```tsx
const openChapter = (c: Chapter) => {
  const url = `/${c.base_path}embed.html?auto=1&chapter=${c.start_chapter ?? 0}`;
  window.open(url, '_blank');
};
```

关键参数：`?auto=1`（自动播放模式），`?chapter=N`（起始章节）

详细方案见 [EMBEDDING.md](./references/EMBEDDING.md)

### DB 集成模式

如需要将课件嵌入已有 Web 应用的章节管理系统（如 ExamMaster 模式）：

```sql
ALTER TABLE interactive_courses ADD COLUMN start_chapter INTEGER DEFAULT 0;
-- 1.1 → start_chapter=0, 1.2 → start_chapter=30, ...
```

每节课的 `start_chapter` 对应其在 presentation 中的起始章节 index。

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
- DB 自动同步模式（POST /detect 读取 course.json 自动创建章节）

---

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
