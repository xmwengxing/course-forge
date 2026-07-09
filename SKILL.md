---
name: course-forge
description: 把一篇文章或口播稿，做成"看起来像视频"的点击驱动 16:9 网页演示，可选合成口播音频。流程：原始文章 → 一次产出口播稿 + outline 开发计划 → 用户一次对齐 5 件事（稿子 / outline / 主题 / 素材 / 开发模式）→ 网页开发（逐章 / 顺序 / 并行）→ 可选音频合成（provider-agnostic：内置 MiniMax + OpenAI TTS，可换 ElevenLabs / edge-tts / Azure / 自带 TTS）。outline 只规划节奏与信息密度，不规划动画 —— 动画由章节开发时按 PART 0 原则即时设计。每一步独占整屏，进度条悬浮才出现。适用场景：用网页做视频、动态 PPT、口播稿 / 文章变成可交互的解说、为 B 站 / YouTube 录屏教程、做有电影感的产品 demo。本 Skill 沉淀的是设计方法论 + 协作流程 —— 不绑定任何特定样式 / 字体 / 颜色 —— 能复用到任意主题与美学。
---

# Course Forge — Interactive Courseware Builder

把一篇文章或口播稿，一步步做成可录屏的"伪装成视频的网页"，可选合成
口播音频。产出物 = Vite + React + TS 项目 + 按章节切分的音频。

---

## 适用场景

- "我有口播稿 / 一篇文章，帮我做成视频" —— 口播驱动的内容
- 动态 PPT / 课程 / 课件开发
- 16:9 横屏录屏，大字、留白、每屏都要有动效
- 教学 / 产品演示 / keynote 想要电影感
- B 站 / YouTube / 抖音视频内容

本 Skill **以方法论 + 协作流程为核心**。脚手架模板提供 token 和原语，
但每个美学决策（配色、字型、动效气质）都应该针对你的主题重新设计 ——
不要照搬。

---

## 工作流总览

```
Phase 0   **模式判断** (新流程第一步, 不能跳过)
   0.1  源文档清单 + 章节号识别 (1.x / S1 / Lesson X)
   0.2  回答 3 个问题 → 决定 [单视频模式] 或 [课程模式]
        (详见 references/COURSE-MODE.md § 模式判断 checklist)
   ▼
Phase 1   内容编写
   1.1  识别用户输入
   1.2  一次产出 script.md + outline.md
        （口播稿 + 开发计划）
   ▼
[Checkpoint Plan]      ← 必须停。一次对齐 5 件事：
                         稿子 / outline / 主题 / 素材 / 开发模式
   ▼
Phase 2   网页开发
   2.1  脚手架（按选定主题）
   2.2  第 1 章 = 主线程 + 完整版本（强制 anchor）
        ▼
        [硬节点] 用户验收第 1 章 ← 不可跳过
        ▼
   2.3  第 2~N 章（按选定模式：A 逐章 / B 顺序 / C 并行）
   ▼
[Checkpoint Audio]     ← 必须停。是否合成音频
   ▼
Phase 3   音频合成与字幕（可选）
   ▼
Phase 4   部署嵌入 / 录屏 + 后期
```

> ⚠️ **Phase 0 是新增的必做前置**。原流程把"模式判断"隐式塞进 Checkpoint Plan,
> 但实操中 agent 经常**直接走单视频**而忽略"用户的源文档其实是某课程的某个章节"。
> 现在改成显式 Phase 0: 先判断, 再产出。
>
> 默认规则: **源文档含 `1.x`/`S1`/`Lesson X` 等章节号 + 兄弟文件 ≥ 2 份 → 课程模式**。

---

## 文件读取指南

**长会话里 agent 容易遗忘原则**，特别是 Phase 2.4 的"实现单章"会重复 N 次。
按下方表只读必需文件。

| 阶段 | 必读（每次都看） | 一次性看完 / 按需查 |
|---|---|---|
| Phase 0 模式判断 | [`references/COURSE-MODE.md`](references/COURSE-MODE.md) § 模式判断 checklist (3 个问题) | —— |
| Phase 1.1-1.2 内容编写 | [`references/SCRIPT-STYLE.md`](references/SCRIPT-STYLE.md) + [`references/OUTLINE-FORMAT.md`](references/OUTLINE-FORMAT.md) + `article.md`（用户原文，如有） | —— |
| **Checkpoint Plan 选主题** | —— | `themes/*/theme.json`（动态读全部，列清单 + `bestFor` 推荐 + `descriptionZh`）；`references/THEMES.md`（用户想了解主题系统时）；`references/COURSE-MODE.md`（课程结构 / chrome 反模式 / 多课程管理 —— 课程模式时必读） |
| Phase 2.1 脚手架 | —— | SKILL.md 本节看一次 |
| **Phase 2.4 实现单章（×N 次）** | **[`references/CHAPTER-CRAFT.md`](references/CHAPTER-CRAFT.md)** 单一入口（`## 这是视频，不是 PPT` / `## 必须用 CSS / SVG / Canvas / JS 大胆绘制视觉演示 + 提供交互` / `## 逐步揭示，禁止一次全展示` / `## 视觉中心：舞台中心 ≠ 元素居中` / `## 内容取舍：抓重点，不要原文搬运` / `## 双源：节奏跟口播稿，细节回原文章` / `## 字体 / 配色 / 动画 / 留白 —— 视频演示基本审美` / `## 避免 AI 味` / `## 代码层最小约束` / `## 完工自检` / `## L. 动画升级（animejs v4 实战）`）+ 当前主题的 `themes/<id>/theme.json` + 当前章节的 outline.md 段落 + `article.md` 本章对应段落 + 素材清单 | `references/EXAMPLES/`（结构示意，不是抄袭模板）；`references/THEMES.md` 完整 token 契约 |
| Phase 3 音频合成 | [`references/AUDIO.md`](references/AUDIO.md)（含 narrations.ts → segments.json → 任意 provider 流程） | `templates/scripts/tts-providers/README.md`（换 provider / 自带 TTS 时） |
| Phase 4 录屏 + 后期 | [`references/RECORDING.md`](references/RECORDING.md) + [`references/DEPLOYMENT.md`](references/DEPLOYMENT.md)（分发嵌入方案） | —— |
| 选 / 造 / 切主题 | —— | `references/THEMES.md` |

> **写章节时只读一份 `CHAPTER-CRAFT.md`**。十条原则 / 开工 self-prompting /
> 决策树 / 反 AI 味反模式 / 完工自检全部并入这一份单一入口。
>
> ⚠️ **课程模式必读 `templates/src/App.tsx` 的 CourseView 内部视图**（不是默认的简单 App.tsx）+
> `templates/src/hooks/useCourseLoader.ts` 头注释 + `references/COURSE-MODE.md` § 多课程管理。
> **不读 App.tsx CourseView = 不会写课程模式**——会自动退化为"单视频写法"（直接读 chapters 数组、忽略 course.json、不渲染 ChapterMenu、不调 useCourseLoader）。
> 课程模式写完必须验证：1) `?course=<id>` 路由可切多课；2) 左侧 ChapterMenu 渲染三级结构；3) 顶/底 ModeControls 三态按钮可见；4) localStorage key 含 `courseId` 命名空间。

---

## 硬性自检协议

每个产物（`script.md` / `outline.md` / 单章）完成后**必须**走：
**自检 → 修复 → 汇报**。直接汇报原始结论 = 违规。

| 产物 | 自检清单出处 |
|---|---|
| `script.md` | [`references/SCRIPT-STYLE.md`](references/SCRIPT-STYLE.md) 三层自检 |
| `outline.md` | [`references/OUTLINE-FORMAT.md`](references/OUTLINE-FORMAT.md) 自检 |
| 单章实现完成 | [`references/CHAPTER-CRAFT.md`](references/CHAPTER-CRAFT.md) § 完工自检 |

**执行方式**（按能力降级，**优先用更隔离的方式**）：

1. **Agent Teams**：开独立 reviewer agent，给它产物路径 + 对应清单 + 关键上下文，让它逐项核查并出结论
2. **subAgent**：开 subagent 走同样流程
3. **自检**：自己严格逐项核查，不允许目测一遍就放行

---

## 各阶段产出文件

agent 在用户当前目录下创建 / 编辑：

```
my-course/
├── article.md          # 用户给原文时必有 —— 不删！开发阶段画面信息源
├── script.md           # 必有：保持原文语言的平台化口播稿（决定节拍）
├── outline.md          # 必有：开发计划（章节切分 + 每步内容 + 信息池）
└── presentation/       # 脚手架产出的 Vite + React + TS 项目
    ├── src/chapters/<NN>-<id>/
    │   ├── <Chapter>.tsx     # 视觉实现
    │   ├── <Chapter>.css
    │   └── narrations.ts     # ★ step 数 + 口播文本的唯一真相源
    ├── src/registry/chapters.ts    # 章节注册
    ├── course.json                 # 课程模式专属菜单（单视频模式可删）
    ├── course-<id>.json            # 多课程时多份
    ├── public/course*.json         # vite 服务的副本（dev 期用 regenerate-course-json.py 同步）
    ├── scripts/
    │   ├── extract-narrations.ts   # 扫所有 narrations.ts → audio-segments.json
    │   ├── synthesize-audio.sh     # provider-agnostic runner（循环 segments）
    │   ├── subtitle-timing.py      # --chapters 可过滤
    │   ├── regenerate-course-json.py  # 校验 + 格式化 + 同步 course*.json
    │   └── tts-providers/          # 每 provider 一个 .sh（内置 2 个）
    │       ├── README.md           # 三函数契约 + 5 段现成代码片段
    │       ├── minimax.sh          # 默认 provider
    │       └── openai.sh           # 内置 OpenAI TTS
    ├── audio-segments.json         # extract 产出（合成前 review）
    └── public/audio/<id>/<N>.mp3   # 可选：合成的音频
```

> **关键**：`narrations.ts` 是 step 数和音频合成的**唯一真相源**。
> 章节 `.tsx` 里的 `if (step === N)` 出现的最大 N + 1 必须等于
> `narrations.length`。这保证 5 处地方（script / outline / 章节代码 /
> chapters.ts / 音频文件）永远不会漂。

---

## Phase 1 —— 内容编写

### 1.1 识别用户输入

| 用户给的东西 | 该做的 |
|---|---|
| 原始文章（书面语 / 公众号 / 论文 / 博客） | 一次产出 `script.md` + `outline.md`（1.2），过 Checkpoint Plan |
| 直接的口播稿 / 视频脚本 | 落盘成 `script.md`，一次产出 `outline.md`（1.2 简化版），过 Checkpoint Plan |
| 啥都没有，只说"帮我做个 X 主题的视频" | **反问**：先给一段素材或大纲。Skill 不替用户构思内容 |

### 1.2 一次产出 script.md + outline.md

**两份产出物在一次思考中完成**：

1. **生成 `script.md`**：按 [`references/SCRIPT-STYLE.md`](references/SCRIPT-STYLE.md)
   的规则把 article 转成保持原文语言的平台化口播稿。**保留 `article.md` 不删**——它是
   outline 写信息池和章节实现画面时的细节源（双源原则）。
2. **生成 `outline.md`**：按 [`references/OUTLINE-FORMAT.md`](references/OUTLINE-FORMAT.md)
   规则切章节 + 切 step + 每章首段抽**信息池**。

**outline 的边界**（关键）：

| outline 必须写 | outline 不要写 |
|---|---|
| 章节切分 / 每章 step 数 / 估时 | 具体动画类型（blur clear / wipe / 弹簧） |
| 每步屏幕内容（hero / 数据 / 标语 / 列表项） | CSS 实现手段（filter / SVG / clip-path） |
| 章节级**信息池**：从 article 抽的数字 / 引用 / 案例 / 标签 | 时长数值（不写 ~2.5s / 80~120ms） |
| 步级关系名前缀（"反差对照" / "递进列表" / "金句" 等可选 hint） | 持续微动 / 错峰量等微观节奏 |

> outline 不写动画的理由 + 双源原则 + 信息池展开，详见
> [`references/CHAPTER-CRAFT.md`](references/CHAPTER-CRAFT.md) § 这是视频，不是 PPT / § 双源：节奏跟口播稿，细节回原文章。

**落盘后必须先走自检再进 Checkpoint Plan**：按上文「硬性自检协议」分别
对 `script.md` / `outline.md` 执行，按结论修复完成后再进入 Checkpoint Plan。

---

## Checkpoint Plan —— 5 件事一次对齐（**硬节点**）

`script.md` + `outline.md` 写完后必须停下来。**用户在这一个节点同时确认
5 件事**：

1. 稿子（script.md）
2. 开发计划（outline.md）
3. 主题（从 `themes/*/theme.json` 读出，按 `bestFor` 智能推荐 2~3 套）
4. 素材（Checkpoint Plan 列粗略清单 → a) 我帮你挑 b) 你提供 c) 全 placeholder）
5. 开发模式（A 逐章 / B 顺序 / C 并行）

**agent 预备工作**：
- 动态读所有 `themes/*/theme.json`（**不要硬编码清单**）
- 按 `script.md` 内容/关键词/语气主动挑 2~3 套**最匹配**的（`bestFor` 命中）
- 扫 `outline.md` 末尾"素材清单"

**模式说明**：

| 模式 | 节奏 | 何时用 |
|---|---|---|
| **A · 逐章确认（默认）** | 每章做完 → 暂停验收 → OK → 下一章 | 用户不明确选模式时默认走这个 |
| B · 第 1 章后顺序开发 | 第 2~N 章主线程顺序做完，最后统一验收 | agent 不支持并行任务的环境 |
| C · 第 1 章后并行开发（subagent） | 用 subagent 把第 2~N 章并行做，最大并行数由用户控制 | 最快，但风格各章会有差异 |

**第 1 章无论哪种模式都必须主线程做完 + 用户验收**（强制 anchor）。

收到反馈后：
- 稿子 / outline 要改：直接编辑文件
- **主题必须明确**才进入 Phase 2。用户说"主题你帮我选" → 取你推荐第 1 个，**告诉用户你选了什么、为什么**，给反悔机会
- 模式选定 → 进 Phase 2

---

## Phase 2 —— 网页开发

### 2.1 脚手架

```bash
bash <path-to-course-forge>/scripts/scaffold.sh ./presentation --theme=<id>
bash <path-to-course-forge>/scripts/scaffold.sh --list-themes
```

> ⚠️ **`course.json` 单一源**：放在**项目根**（`./course.json`），**不要**拷到
> `public/course.json`。`useCourseLoader` 走 vite **静态 import**（+ 多课程
> 走 `import.meta.glob`），不发起网络请求。手动拷到 `public/` 后，源文件改动
> 不会同步，UI 会显示旧版。CI 阶段跑
> [`scripts/check-course-json-sync.sh`](scripts/check-course-json-sync.sh)
> 会自动检测这个错。

> 自定义主题 → 先按 [`references/THEMES.md`](references/THEMES.md)
> "创作新主题"流程做一个 `themes/<my-theme>/`，再 `--theme=<my-theme>`。

脚手架带一个 `01-example` demo。在写第一章真实内容前**删掉**：

```bash
rm -rf presentation/src/chapters/01-example
```

并把 `presentation/src/registry/chapters.ts` 里 `ExampleChapter` 的
import 和 `CHAPTERS` 数组里的示例项移除。

### 2.2 第 1 章 —— 主线程 + 强制验收

**核心**：第 1 章 = 完整版本一次到位（节奏 + 视觉 + 真素材齐全）。
**没有"骨架版"概念** —— 第一章就要做出**用户能直接验收**的样板。

为什么第 1 章必须主线程：

- 它是 [`references/CHAPTER-CRAFT.md`](references/CHAPTER-CRAFT.md) 在**当前
  主题 + 当前题材**下的第一次落地
- 如果指引有盲区 / 主题颜色 / 字体 token 不够用，第 1 章一定会暴露 ——
  这时候有人类反馈就能修指引 / 调主题，**早改成本最低**
- 后续章节（无论顺序 / 并行）都要参考第 1 章的代码模式

**做完第 1 章后必须停下来**等用户验收，并给出 dev server 链接（默认 `http://localhost:5174/`，多课程用 `?course=<id>`，录屏模式 `&auto=1`）。

**验收重点**：
- □ 视觉气质对不对？符合当前主题的预期吗？
- □ 节奏对不对？某些步太快 / 太慢 / 信息太薄？
- □ 内容驱动动画是否到位？还是有几步是无脑入场动画？
- □ 双源原则：屏幕画面有没有"口播没念但 article 能挂"的细节？
- □ **逐步揭示检查**：除开场 hook 屏外，**每屏独立槽位 ≥ 2**？ 屏内仅 1 个独立信息（不论卡上有多少文字）= **反模式，回去拆**（参见原则 #8）
- □ **交互点检查**（每 3 章内必须含 ≥ 1 处真交互）：onClick / onChange / drag / 切换 tab 触发 `useState` 状态变化 = 合格。**hover 动画 / transition / 闪烁 ≠ 交互**。**章节屏"看完点 → 下一屏"是导航，不算交互**。无交互 = **回去加**
- □ 反 AI 味检查（视觉层）：紫粉渐变 / 圆角彩色边框 / 假插画 / emoji 是否有？
- □ 反 AI 味检查（内容层）：假共情 / 万能模板 / 自我标榜 / 排比堆砌是否出现？参考 [`references/SCRIPT-STYLE.md`](references/SCRIPT-STYLE.md) § 去 AI 味五类
- □ **DevTools Responsive 切 1920×1080 / 1280×720 两个视口看**：内容完整不被裁切

### 2.3 第 2~N 章 —— 按选定模式

详见 [`references/CHAPTER-CRAFT.md`](references/CHAPTER-CRAFT.md) ——
**单一必读入口**，覆盖：视觉演示要求 / 逐步揭示 / 内容取舍 / 双源原则
/ 视频演示基本审美 / 反 AI 味 / 代码红线 / 完工自检。

**所有模式下的共同规则**：每章独立按 `CHAPTER-CRAFT.md` 开发。
**风格不强求章节间完全一致** —— 主题颜色 / 字体 token 兜底视觉
统一，动画 / 节奏 / 视觉演示由章节自由发挥是设计预期。

### 2.4 实现单章（每章必走）

详细指引见 [`references/CHAPTER-CRAFT.md`](references/CHAPTER-CRAFT.md) ——
**单一必读入口**。

**核心要点**：

- **每章必须有 CSS / SVG / Canvas / JS 视觉演示**，禁纯文字章节
- **逐步揭示**：清单 / 列表必须 1 项 = 1 step，禁一次全展示
- **双源原则**：节奏跟口播稿（顺序不能乱），细节回原文章抽（信息池 +
  本章 article 段落）
- **完工自检逐项过**，不达标回去改 —— 按上文「硬性自检协议」执行，
  **改完再向用户汇报本章交付**

### 2.5 大改后 bump STORAGE_KEY

改动 `chapters.ts`（增加 / 删除 / 重排章节，或某章 `narrations.ts`
长度变化）后，**bump** `presentation/src/hooks/useStepper.ts` 的
`STORAGE_KEY`（如 `v4` → `v5`），避免持久化游标落到不存在的 step 上。

---

## Checkpoint Audio —— 是否合成音频（**硬节点**）

Phase 2 结束后必须停下来，问用户是否合成音频做"自动播放录屏"。

- **合成** → Phase 3
- **不合成** → 直接 Phase 4（手动录屏 + 后期配音）

---

## Phase 3 —— 音频合成与字幕（可选）

详细流程见 [`references/AUDIO.md`](references/AUDIO.md)。

---

## Phase 4 —— 部署嵌入 / 录屏 + 后期

课件 `dist/` 是纯静态文件。两种分发方式任选其一或同时使用：

- **嵌入 Web 应用** —— 见 [`references/DEPLOYMENT.md`](references/DEPLOYMENT.md)
- **录制为 MP4 视频** —— 见 [`references/RECORDING.md`](references/RECORDING.md)

---

## 十条原则（一句话清单）

完整展开见 [`references/CHAPTER-CRAFT.md`](references/CHAPTER-CRAFT.md) § 这是视频，不是 PPT —— **写章节时回那里查**，下面只是索引。

| # | 原则 | 一句话 |
|---|---|---|
| 1 | 16:9 固定舞台 | 内容 1920×1080 + transform scale，没���响应式 |
| 2 | 全局 step 计数器 | 章节是 step 的纯函数，无定时器 |
| 3 | 每步独占整屏 | `if (step === N) return <FullScene />` |
| 4 | 口播节拍 = step | 一节拍 = 一 step = 一聚焦想法 |
| 5 | 隐藏的边角控件 | 进度条 / 翻页器默认 opacity 0 |
| 6 | 舞台无 chrome | 没有 header / footer / 页码 / 品牌条 |
| 7 | **内容驱动动画** | 先找内在动作，找不到才入场动画兜底；持续微动慎用 |
| 8 | **逐步揭示（同屏多槽位 + 步推进逐项亮）** | 1 项 = 1 step = 1 屏 = 该项在屏内**某个槽位**被激活。**除开场 hook 屏外，每屏必须有 ≥ 2 个独立槽位**（术语卡、坐标箭头、积木块、按钮等），步 N 推进 = 第 N 个槽位激活，其他槽位**灰化保留作上下文**。**屏内仅 1 个独立信息 = 反模式**。"1 屏 1 焦点"是错解——正确的是"1 屏多槽位、步推进逐项亮"。**判定方法**：关掉所有 `pointer-events: none`，屏上是否有 ≥ 2 个可独立激活/灰化的元素？有 = 合格。**反例**：1 屏只放 1 张完整卡（不论卡上有多少文字）= 反模式。**正例**：1 屏放 4 槽位术语卡，步 0 只亮卡 1，其他 3 张灰态；步 1 亮卡 1+2，灰态卡 3+4；...；步 3 全部亮。**与"每章 3-8 步"协同**：3-8 屏章节里**每屏至少 2 槽位、步推进逐项亮**——两条规则同源，不交叉阅读必踩坑。详见 references/CHAPTER-CRAFT.md § 逐步揭示 + § 完工自检。 |
| 9 | 整片同一主题 | 章节间不翻表面色；**颜色 / 字体走 token**，其它尺度章节自由 |
| 10 | 双源原则 | script 定节拍，**article 定画面密度**（落到信息池） |

---

## 相关资源

按"何时读"标注，避免一次性全读：

| 文件 | 何时读 |
|---|---|
| [`references/SCRIPT-STYLE.md`](references/SCRIPT-STYLE.md) | Phase 1.2 必读 — 文章 → 口播稿规则、平台变体 |
| [`references/OUTLINE-FORMAT.md`](references/OUTLINE-FORMAT.md) | Phase 1.2 必读 — outline.md 字段 spec、命名约定、章节切分、信息池 |
| [`references/CHAPTER-CRAFT.md`](references/CHAPTER-CRAFT.md) | **Phase 2.4 每章单一必读入口** — 十条原则 / 视觉演示要求 / 逐步揭示 / 内容取舍 / 双源原则 / 视频演示审美 / 避免 AI 味 / 代码层最小约束 / 完工自检 / 附录 L: animejs 升级 |
| [`references/ANIMEJS-GUIDE.md`](references/ANIMEJS-GUIDE.md) | 写章节需要"真正动画"或"物理级拖拽"时 |
| [`references/COURSE-MODE.md`](references/COURSE-MODE.md) | 课程模式（明确要求时）— S1-S5 灵活骨架 / 互动测验 / 多课程管理 |
| [`references/THEMES.md`](references/THEMES.md) | 选 / 造 / 切主题时 — 完整 token 契约 + 内置主题清单 + 创作流程 |
| [`references/AUDIO.md`](references/AUDIO.md) | Phase 3 才读 — provider-agnostic 音频合成流程、故障排查 |
| [`references/RECORDING.md`](references/RECORDING.md) | Phase 4 才读 — 录屏工具 + 后期合成 |
| [`references/DEPLOYMENT.md`](references/DEPLOYMENT.md) | Phase 4 才读 — 部署嵌入决策树 + 7 方案精简范本 |
| [`themes/`](themes) | Checkpoint Plan / Phase 1.2 时翻 — 内置主题（每个含 `theme.json` + `tokens.css`） |
| [`scripts/scaffold.sh`](scripts/scaffold.sh) | Phase 2.1 跑一次 — 一键项目脚手架 |