# Skill: course-forge

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

### 3.1 MiniMax TTS（默认）

```bash
# .env
MINIMAX_API_KEY=sk-cp-...

# 提取音频段 → 合成
npm run extract-narrations
npm run synthesize-audio   # 默认 minimax provider, skip 已存在
```

**已知踩坑**：
- API 端点 `api.minimax.chat`（非 `.io`），Token Plan key 才有效
- 错误码 2056 = Token Plan 额度未分配，联系 MiniMax 客服
- 限流：每 ~25s 调用一次，否则 RPM rate limit

### 3.2 其他 Provider

```bash
PRESENTATION_TTS=openai npm run synthesize-audio   # 需要 OPENAI_API_KEY
PRESENTATION_TTS=edge npm run synthesize-audio     # 免费，需要 edge-tts
```

### 3.3 字幕时序生成

```bash
python3 << 'EOF'
# ... 完整脚本见 scripts/subtitle-timing.py
EOF
```

参数：`max_chars=60`，`300ms/char`，`min_ms=2500`，`0-indexed keys`。

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

1. **course.json 绝对禁止手工 edit 追加**：每次新增章节后运行 `regenerate-course-json.py`
2. **每段验收**：做完 S1 停一次，做完 S2 停一次，不允许整课一口气开发
3. **字幕 0-indexed**：`str(s['step'] - 1)` 对齐 Subtitle 组件的 `stepIndex` 参数
4. **STORAGE_KEY bump**：章节结构变化时 bump `useStepper.ts` 中的版本号
5. **双源原则**：每步画面不能只念口播，要从原始文档抽信息池挂到屏幕上
6. **不要废话**：用知识点深度和广度扩展内容，不用排比句凑时长

---

## 新技能能力

- 分段式课件开发（Phase 0.2 自动拆分 + 用户确认）
- 互动测验嵌入（选择题 / 简答题 / CSS 3D 探索）
- 柯氏四级评估体系（每节课 S5 嵌入 L1-L4）
- 三种教学方法（视觉化演示 / 极端场景推演 / 案发现场复盘）
- 五种 Web 应用嵌入方案（new-tab / iframe / React / DB 驱动 / URL 参数）
- course.json 自动生成脚本（防止 JSON 损坏）
- Chunk-based 字幕系统（60 字阈值 / 字数占比分配 ms / 0-indexed）
- TTS 限流处理（25s 间隔 + 诊断脚本）
- 画布优化（stage-pad 56/40 + margin 32/48）

---

## 相关资源

| 文件 | 内容 |
|------|------|
| `references/COURSE-STRUCTURE.md` | 段/节/章三级架构 + course.json spec + 拆分规则 |
| `references/QUIZ-CRAFT.md` | 互动题设计模式（choice / textarea / 3D） |
| `references/EMBEDDING.md` | Web 应用嵌入方案（5 种） |
| `references/CHAPTER-CRAFT.md` | 章节开发详细指引 |
| `references/SCRIPT-STYLE.md` | 口播稿风格指南 |
| `references/AUDIO.md` | 音频合成完整流程 |
| `scripts/regenerate-course-json.py` | course.json 自动维护 |
| `scripts/subtitle-timing.py` | 字幕时序生成 |
| `scripts/diagnose-tts.sh` | TTS API 诊断 |
