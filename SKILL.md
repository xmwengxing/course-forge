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
   - 每章 ~3-5 步，每步 200-400 字，通过增加知识深度和广度扩展内容
   - 遵循双源原则（口播定节拍 + 画面定密度）
2. **创建目录**：如项目中不存在 `docs/` 目录则自动创建
3. **存档**：口播稿保存为 `docs/<标题>.md`（如 `docs/1.8 复杂场景业务流程分析与优化.md`）
4. **告知路径**：明确告知用户「口播稿已生成：`docs/xxx.md`，请审阅验收后继续」
5. **用户验收**：等用户确认口播稿内容无误（或提出修改意见）后，方可进入 0.3

### 0.3 拆分章节方案

**硬性拆分规则**（基于 97 章生产级课件验证）：

| 文档字数（口播稿） | 拆分方案 | 每段章节数 | 预估时长 |
|---------|:-------:|:--------:|:-------:|
| ≤ 1,000 字 | 不拆，直接做 | 4-6 | ~10-15 min |
| 1,000-2,500 字 | 3 段 (S1/S2+S3/S4+S5) | 4-7/段 | ~25-35 min |
| 2,500-4,000 字 | 5 段 (S1-S5) | 4-7/段 | ~45 min |
| > 4,000 字 | **先建议用户精简到 4,000 字** | — | — |

> 4,000 字口播稿经扩展后约对应 45 分钟（含互动和画面停留时间），恰好是标准课时上限。字数按口播稿纯文本计，不含教学设计描述。

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

0.5.2 **评估口播稿内容量**：计算现有口播稿总字数。中文 TTS 含停顿的有效语速约为 **5-6 字/秒**（纯语速约 14-16 字/秒，但标点、句间停顿大幅拉低实际速率）。
```
预估时长（秒）= 口播稿总字数 / 5.3
预估时长（分钟）= 预估时长（秒）/ 60
```

0.5.3 **口播稿内容不足时自动扩展**：如果 `预估时长 < 目标时长 × 60%`（即缺口超过 40%），则自动扩展口播稿：
- 扩展策略：增加案例细节、补充背景说明、延长过渡衔接、加入学员互动引导语。**不可用重复性废话凑字数**
- 每章目标字数 ≈ `(目标时长 × 60 × 5.3) / 章节数`
- 每章建议 3-5 步，每步 200-400 字
- 扩展后再次存档到 `docs/`，**明确告知用户**扩展了哪些内容及预估时长变化

0.5.4 **口播稿超出时主动提示**：如果 `预估时长 > 目标时长 × 120%`，提示用户超长，建议精简聚焦核心知识点。

0.5.5 **逐段汇报时长**：每开发完一段（S1-S5 中的一段），汇报该段预估时长和累计时长，让用户判断节奏是否合适。最终汇入 Checkpoint Plan 确认。

> **示例**：目标 45 分钟课程，20 章，每章需约 255 秒（~1350 字）。口播稿仅 2000 字（预估 ~6.3 分钟），则需扩展至 ~12000 字后进入开发。

### 0.5.6 单步口播过长时的处理方案

按 ~5.3 字/秒 估算，单步停留超过 20 秒（约 100 字）时画面不应保持静态。

**口播时长阈值判断表**：
| 每步字数 | 预估语音时长 | 推荐处理方案 |
|:--:|:--:|:--|
| ≤ 100 字 | ≤ 20 秒 | 单画面 + 1 个动画揭示（卡片滑入/淡入） |
| 100-160 字 | 20-30 秒 | 步内动效（数字递增、自动轮播、颜色渐变） |
| 160-280 字 | 30-50 秒 | 增加扩展画面区域（口播对应内容的下方演示区） |
| ≥ 280 字 | ≥ 50 秒 | **必须拆分步数**，不得单步停留超 50 秒 |

**处理方案**（由简到繁）：
1. **拆分布数**：将长步按口播的自然段落拆分为 2 步或更多，每步配独立画面
2. **步内动效**：不拆步，但在步内增加 CSS 自动动画（循环、渐变、移动）
3. **扩展画面**：主内容保持简洁，下方或侧方增加补充演示区，用不同内容填充口播时长
4. **交互操作**：学员通过点击/拖动触发画面变化，与口播节奏配合

> 优先采用方案 1（拆分布数），因为最直观且画面最干净。方案 2/3 适合无法拆分的长段落。

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

### 字号底线（满足移动端全屏可读）
| 用途 | 最小值 |
|:--|:--:|
| 正文字体 / .txt | **16px** |
| 标题 / .title | **28px** |
| 副标题 / .sub | **18px** |
| 标签 / 徽标 / 时间码 | **14px** |
| 代码 / .code / .row | **14px** |

任何 `font-size` 不得低于 14px。

### 禁止脚本批量生成
每一章的 TSX + CSS + narrations 必须**逐章手写**，不得使用循环脚本或模板一次性生成多章。每章应有独立的交互设计和视觉风格，避免多章共用同一套布局结构。

### 上下左右边距规范
- layout 底部必须预留 **60-80px** 空间，避免字幕（浮动在底部）与画面内容重叠
- 卡片内边距：水平 **32-40px**，垂直 **28-36px**
- 段间距（gap）：**36-48px**
- 卡片间距（gap）：**20-24px**
- 容器宽度：**1200-1600px**，充分利用画布横向空间

### step >= N 渐进揭示
- **禁止一次性展示全部内容**，每步只展示与当前口播匹配的画面
- `step >= 0`：显示基础框架（标题、导航信息）
- `step >= 1`：揭示第一组内容
- `step >= 2`：揭示第二组内容，依此类推
- 每步对应的音频 = `narrations[step]`，音频播放时该步画面可见
- 口播列表项需逐项揭示：每项独立占一步，讲完一项再讲下一项

### 左右宽布局优先
- 内容存在对比/对照关系时使用左右分栏：`display:flex; gap:60px; max-width:1500px`
- gap 至少 24px

### 交互优先
- 如果内容适合交互（点击揭示、状态切换、选项选择），优先做交互版
- 所有交互按钮必须加 `data-no-advance` 属性

**CSS 前缀约定**：每章独立 2-4 字母缩写前缀，避免跨章冲突。例：
- `t5bt-` (t5-black-truck)
- `t4fd-` (t4-fourth-dim)

**画布配置**（参考值，可按需调整）：
- stage 内边距：`--stage-pad-x: 96px; --stage-pad-y: 80px`
- viewport margin：`marginX: 32, marginY: 48`
- 字幕字体：28px, line-height: 1.4

**章节 CSS 动画命名**：`{prefix}-{描述}`，如 `t5bt-in`、`t4fd-in`

**双源原则运用**：
- 每章首段从原始文档抽**信息池**（数字/引用/案例/标签）
- 口播稿中的数字翻译成感受（除非是核心冲击数字），但画面中保留原始精确值

### 口播稿与画面交互的关联设计

口播稿中每个"信息块"应在画面上有对应的视觉呈现。撰写口播稿时应同步规划画面布局。

**对应关系**：
| 口播节奏 | 画面设计 | 示例 |
|:--|:--|:--|
| 提出概念 | 标题 + 核心图示 | "编程是坐标+指令" → 坐标网格演示 |
| 列举项目 | 卡片逐项揭示 | "第一是A，第二是B" → step≥1显示A，step≥2显示B |
| 对比差异 | 左右分栏切换 | "消费者 vs 创造者" → 🎮 vs 💻 对比卡 |
| 演示操作 | 动画/交互演示 | "点击按钮角色移动" → 四个方向按钮 + 坐标更新 |
| 案例展示 | 卡片/分栏展示 | "Scratch作品" → 🚗 AI寻路车 vs 🗣️ 翻译机 |

**操作规范**：
- 口播稿中每个 `**强调内容**` 应至少有 1 个视觉元素对应
- 列表项（"第一/第二/第三"）必须逐项揭示，不得一次性展示全部
- 超过 3 项的列表应拆分为多步或分组展示
- 口播时长超过 20 秒的画面必须有动态变化（动画/交互/自动轮播）

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
npm run synthesize-audio   # 不加 --force，跳过已有的 mp3
```

| Provider | 默认 | 何时用 |
|---|---|---|
| `minimax` | ✓ | 中文口播首选（要 API key + 选语音 ID） |
| `openai` | —— | 多数 agent 已有 `OPENAI_API_KEY` |
| `edge` | —— | 免费 / 无 key / pip install edge-tts |

**重新合成旧课件音频**：当口播稿内容变化（narrations.ts 已更新）而音频文件仍为旧版时，必须先删除对应 mp3 文件，再运行合成脚本（不加 `--force`），脚本会自动为缺失文件合成新音频：
```bash
rm -f public/audio/<章节ID>/*.mp3     # 删除旧音频
npm run synthesize-audio              # 自动合成缺失文件
```

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

**推荐方案（精度优先）：MiniMax 词级时间戳模式**

新合成章节使用 MiniMax API 返回的逐词时间戳，实现字级别对齐（精度 ⭐⭐⭐⭐⭐）：
```bash
python3 scripts/subtitle-timing.py --mode minimax
```
**前提**：合成时 `minimax.sh` 自动请求 `subtitle_enable: true, subtitle_type: "word"`，词级时间戳存到 `public/minimax-word-timing/<chapter>/<step>.json`。

**备选方案（快速，用于存量章节）**：55 字符句界均分 + ffprobe 实测时长（精度 ⭐⭐⭐）：
```bash
python3 scripts/subtitle-timing.py
```

| 模式 | 切分方式 | 步级时长 | 精度 | 适用范围 |
|------|---------|---------|:--:|------|
| minimax（推荐） | 按词级时间戳聚合 | MiniMax API 逐词 ms | ⭐⭐⭐⭐⭐ | 新合成章节 |
| default | 55字句界切分 | ffprobe 实测 mp3 时长 | ⭐⭐⭐ | 存量章节 |

**对比说明**：default 模式将步长按字数均分到各个字幕块，无法反映真实语音节奏（前快后慢或前慢后快）。MiniMax 词级模式精确到每个字的起止时间，字幕同步更准确。

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
2. **逐段验收 + 时长汇报** — 做完每段必输出步骤数/时长，按 ~5.3 字/秒 估算后续段时长
3. **双源原则** — 口播定节拍 + 文档定画面密度。用知识深度和广度扩展内容，不用废话凑时长
4. **字幕 0-indexed** — `str(s['step'] - 1)` 对齐 Subtitle 组件；新合成章节优先使用 `--mode minimax`
5. **STORAGE_KEY bump** — 章节结构变化时 bump `useStepper.ts` 中的版本号
6. **逐章手写，禁止脚本批量生成** — TSX + CSS + narrations 每章独立手写，不得用循环脚本一次性生成
7. **最小字号 14px** — 除装饰性标签外，任何 font-size 不得低于 14px
8. **底部留空 60-80px** — layout 底部必须预留字幕空间
9. **JSX 文本内容禁止 `\u` 转义** — JSX 标签间的文本按 HTML 解析，`\u` 无效。直接写实际 UTF-8 字符或用 `{'\u...'}` 表达式。引号内 JS 字符串不受限。

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

### 编号原理

章节目录 `src/chapters/` 以 `{编号}-{前缀}-{描述}` 命名（如 `483-f1-scifi-bubble`）。章节在课程列表中的**排序由目录名字母顺序决定**，而非 `course.json`。编号只需保证在目录名排序中的位置正确即可，不必是纯数字。

### 插入步骤

1. **确定目标排序位置**：找到新章节应该位于哪两个现有目录之间。

2. **选择编号方案**：
   - **方案 A（有空隙）**：如果目标位置前后编号之间有数字间隙，直接使用间隙内的编号
   - **方案 B（无空隙，加字母后缀）**：在目标位置的前一个编号后加字母后缀作为新编号。例如 `10-` 和 `11-` 之间无法插入数字，但 `10a-` 在字符串排序中位于 `10-` 之后、`11-` 之前，因此可以使用 `10a-`、`10b-`、`10c-` 等。此方案不需要改动任何现有目录
   - **方案 C（区间已满）**：将区间末尾目录重编号到更大数字，腾出空隙

3. **创建章节目录**：按照 `{编号}-{前缀}-{id}/` 格式创建目录，编写 TSX + CSS + narrations。

4. **验证无编号冲突**：`ls {编号}-*/` 确认新编号唯一。

5. **注册章节**：运行注册脚本生成 `chapters.ts`。

6. **更新 course.json**：在对应 section/segment 中添加新章节条目。

7. **验证顺序**：在 chapters.ts 中检查新章节的 filtered index 位置是否正确。

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
