# Course Forge · 课件锻造台

把一份知识文档或口播稿，做成**可交互的课程 / 课件**——16:9 点击驱动的网页演示，带章节导航、字幕、音频、播放控制与章节进度条。可选 TTS 配音、可选录制成视频。

[English](./README.md) · [中文文档](./README.zh-CN.md) · [技能入口](./SKILL.md)

---

## 它做什么

你提供一篇文章或口播稿。技能引导 agent 走完：

1. 写口播稿 (`script.md`) 和章节开发计划 (`outline.md`)
2. 跟你对齐 5 件事：稿子 / outline / 主题 / 素材 / 开发模式
3. 脚手架一个 Vite + React + TS 项目，逐章实现（**第 1 章必须在主线程作为锚点**）
4. 可选地用可插拔 TTS（MiniMax / OpenAI / Edge / 自带）合成音频
5. 嵌入 Web 应用，或可选录制成视频（MP4）

产出是纯静态的 `dist/`，可以部署到任何地方。

---

## 安装

```bash
# 推荐（OpenCode 风格注册表）— skills CLI
npx skills add xmwengxing/course-forge

# 或手动克隆（适用于任意运行时）
git clone https://github.com/xmwengxing/course-forge.git
#  OpenCode / Claude Code / Cursor / Codex：
cp -r course-forge /你的项目/.opencode/skills/   # 按运行时调整，见「兼容性」
#  WorkBuddy / CodeBuddy：
cp -r course-forge /你的项目/.workbuddy/skills/
```

- **OpenCode / Claude Code**：也可走插件市场 —— `/plugin marketplace add xmwengxing/course-forge`。
- **WorkBuddy / CodeBuddy**：通过应用内技能市场安装，或把文件夹放到 `.workbuddy/skills/course-forge/`（即上面的手动克隆）。`npx skills add` 是 OpenCode 风格注册表命令，在此不适用。

---

## 快速开始

```bash
# 1. 安装（见上）

# 2. 脚手架一个课件项目
bash .opencode/skills/course-forge/scripts/scaffold.sh ./my-course --theme=chalk-garden

# 3. 把原文交给 agent，说：
#    "用 course-forge 从 docs/my-knowledge-doc.md 创建课件"
```

agent 会产出 `script.md` + `outline.md`，走完 5 件事对齐节点，然后逐章实现。完整工作流见 [`SKILL.md`](./SKILL.md)。

---

## 内置主题

6 套主题，每套独立的设计 DNA——不是简单的换色。按情绪挑，或复制一份作为你自己的起点：

| midnight-press | chalk-garden | paper-press | newsroom | blueprint | bauhaus-bold |
|:--:|:--:|:--:|:--:|:--:|:--:|
| 暗色电影感 | 手写粉笔 | 浅色编辑级 | 报刊衬线 | 技术蓝图 | 现代主义 |

完整设计签名、token 契约和"自创主题"流程见 [`references/THEMES.md`](references/THEMES.md)。

---

## 工作流速览

```
Phase 0  立项（大课时）→  brief.md（一级=课、二级=小节）· 用户确认冻结
Phase 1  口播稿撰写  →  短视频：script.md + outline.md
                       大课：逐章剧本（子代理并行，course-bible 衔接）
                       [Checkpoint Plan]  对齐 5 件事
Phase 2  网页开发    →  脚手架 + 章节（第 1 章 = 锚点）
                       [用户验收]        锚点必须先通过
                       →  第 2..N 章    （逐章 / 顺序 / 并行）
Phase 3  音频（可选）→  TTS 合成 + 按句切分字幕
Phase 4  部署        →  嵌入（新窗口 / iframe / DB）  ·  可选：录屏为 MP4
```

`[]` 行是硬节点——agent 必须在每个节点暂停等人审。每个阶段的读文件指引见 [`SKILL.md`](./SKILL.md) § 文件读取指南。

---

## 课程层级

统一模型：**课程(Course) > 大纲·分段(Outline Segment, 原 S1~S5, 段数可变) > 章节(Chapter) > 屏(Screen/画面) > 步(Step)**。屏是画框容器（1 章可 1 屏或多屏），步是屏内原子揭示单元（1 步 = 1 口播节拍）。

```
Course   — 单门领域或完整课程（如"X 入门"）
Segment  — 一级导航菜单；两种尺度：短视频=主题块（导入/精讲/案例/收官），长课=一节课 Lesson
Chapter  — 二级导航菜单单元；两种尺度：短视频=30~60s 微单元，长课=小节主题（1 屏或多屏，如"1.1 你好，数字世界！"）
Screen   — 章节内的 1920×1080 画框；一个章节可由 1 屏或多屏组成
Step     — 屏内原子揭示单元：1 步 = 1 口播节拍 = 1 字幕窗 = 1 音频段
```

> 长课尺度下：1 节课 = 1 个一级 `大纲·分段`，1 个小节 = 1 个二级 `章节`；口播稿"细分主题"= 二级导航项。开发/验收说"逐小节"（= 二级），"分段"专指一级。详见 [`references/SCRIPT-WRITING.md`](references/SCRIPT-WRITING.md)。

本 skill 只产出**一种东西：可交互课件**。视频录制是可选项（见 [`references/RECORDING.md`](references/RECORDING.md)），不是另一种模式。
课程结构细节：[`references/COURSE-STRUCTURE.md`](references/COURSE-STRUCTURE.md)。

---

## 架构不变量

三件事撑起整个系统。破坏任何一件，章节、音频、章节菜单都会跟着崩：

1. **`narrations.ts` 是单一真相源** —— 数组长度必须等于章节 `.tsx` 里 `if (step === N)` 出现的最大 N + 1。守住这一条规则，5 个产物（`script.md` / `outline.md` / 章节代码 / `chapters.ts` / 音频）永远不会漂
2. **主题 = CSS token + JSON 元数据** —— 切换主题就是把 `themes/<id>/tokens.css` 覆盖到 `<project>/src/styles/tokens.css`。组件永远不引入主题专属的值
3. **每章渲染进固定 1920×1080 舞台** —— 通过 `useStageScale` 用 CSS `transform: scale()` 缩放。在那个坐标系里写，不要用视口像素

---

## 何时用它

| 适合 | 不太适合 |
|---|---|
| 千人规模标准化培训 | 真人出镜才传神的内容（领导讲话 / 励志） |
| 内容需要频繁小修 | 物理/实验/手工演示 |
| 测验 / 决策树 / 拖拽练习 | 需要现场答疑 |
| 零边际交付成本敏感 | 还在大量改稿阶段的新内容 |
| 需要可搜索 + 数据分析 | 离线手机播放（能跑，但 MP4 更省心） |

---

## 兼容性

| 运行时 | skill 路径 |
|---|---|
| OpenCode | `.opencode/skills/<name>/` |
| Claude Code | `.claude/skills/<name>/` 或插件市场 |
| Cursor | `.agents/skills/<name>/` |
| Codex CLI | `.codex/skills/<name>/` |
| WorkBuddy / CodeBuddy | `.workbuddy/skills/<name>/` |

脚手架出来的项目要 Node 20+。TTS 视所选 provider 需要对应网络。

## 平台说明（Windows / 跨平台）

- **Shell 脚本（`scripts/*.sh`）**使用 Bash，并调用 `curl` / `npm` / `python3`。在 **Windows** 上它们**不能**在 `cmd.exe` 或 PowerShell 里直接运行——请使用 **Git Bash**（随 Git for Windows 一同安装）或 **WSL**。示例：`bash scripts/scaffold.sh ./my-course --theme=chalk-garden`。
- **Python 脚本（`scripts/*.py`）**在任意系统上用 `python` / `python3` 原生运行。若你的 Windows 上 Python 只叫 `python`（没有 `python3`），可在 Git Bash 里 `alias python3=python`，或直接用 `python script.py` 调用。
- 脚手架出来的项目需要 **Node 20+**（含 `npm create vite` 步骤）。TTS 还需对应 provider 的网络访问。


---

## 运行时契约：自动播放与降级（正式）

> 本契约是运行时行为的**正式定义**。任何"开场没声音""字幕条报加载失败"
> 的反馈，先对照本契约确认是否属预期，再决定是否算缺陷。完整版见
> [`references/RECORDING.md`](references/RECORDING.md)。

### 浏览器自动播放策略（为什么开场是静止的）

主流浏览器（Chrome / Edge / Safari / Firefox）**禁止在无用户手势前自动
播放带声音的音频**，这是强制策略、无法绕过。因此带 `?auto=1` 打开的页面
**首屏一定是静止的**，直到用户点击或首次按 Space（`AutoStartGate` 蒙层）
给出手势——这正是设计，不是 bug。

### 三种播放模式

| 触发 | 模式 | 行为 |
|---|---|---|
| 默认（无参数） | `manual` | 静音；点击 / ←→ 推进 |
| `?audio=1` 或按 `M` | `audio` | 每步自动播音频，但手动点击推进 |
| `?auto=1` 或再按 `M` | `auto` | 每步自动播音频 **且** 自动推进（录制用） |

### 音频缺失 / 失败降级（auto 模式）

Auto 模式由"音频播完"驱动推进；音频缺失 / 失败 / `src` 为空时，改用
**字数估时**优雅降级：`estimateFallbackMs = max(1500, 口播字数 × 250)` 毫秒
（中文 ≈ 4 字/秒）。该估算**仅在音频缺失 / 失败时使用**，音频正常时完全由
`ended` 事件驱动。因此未合成 / 合成中断的预览每一步都会按口播字数自动推进，
**不会卡住**。切换步时旧 `<audio>` 被拆除产生的 `AbortError` 已静默，算正常噪声。

### 字幕缺失降级

`SubtitleStep` 拉取 `/subtitle-timing.json`：拉取失败且无 `narrations` → 字幕条
降级为红条"字幕加载失败: …"但**课程照常播放**；当前步无字幕块但章节有
`narrations[step]` → **回退显示口播稿原文（预览模式）**；两者皆无 → 显示"…"占位；
均不报错。字幕是纯观感辅助，其有无永远不阻塞播放。

> **口播稿预览**：无 TTS 时字幕会回退到 `narrations.ts` 口播文本，可在播放器里逐句
> 审核口播稿，是口播稿撰写能力的核心验证路径。

### 判定清单（复现"问题"时先过一遍）

- 开场没声音 / 不推进 → 是否带 `?auto=1` 且**还没按过 Space**？是 → 预期。
- 字幕条显示"字幕加载失败" → 是否没跑 `subtitle-timing.py`？是 → 预期降级。
- 某步卡住不动 → 是否该步音频正常播完却没推进？才可能是缺陷。
- console 出现 `AbortError` → 切换步的正常噪声，已静默，**不报**。

---

## 文档地图

| 文件 | 何时读 |
|---|---|
| [`SKILL.md`](./SKILL.md) | **始终先读** —— 工作流总览 + 各阶段读文件指引 |
| [`references/CHAPTER-CRAFT.md`](references/CHAPTER-CRAFT.md) | 写每章时 —— 单章能否通过验收的唯一标准 |
| [`references/SCRIPT-STYLE.md`](references/SCRIPT-STYLE.md) | Phase 1 —— 文章转口播稿 |
| [`references/SCRIPT-WRITING.md`](references/SCRIPT-WRITING.md) | 大课 / 需分工 —— 立项 + 逐章剧本(子代理并行) + 字数/时长公式 + course-bible 衔接 |
| [`references/OUTLINE-FORMAT.md`](references/OUTLINE-FORMAT.md) | Phase 1 —— `outline.md` 字段规范和章节切分规则 |
| [`references/COURSE-STRUCTURE.md`](references/COURSE-STRUCTURE.md) | 课程结构 —— 课程>章节>屏、密度规则、chrome |
| [`references/THEMES.md`](references/THEMES.md) | Checkpoint Plan / 任何选换主题时刻 |
| [`references/AUDIO.md`](references/AUDIO.md) | Phase 3 —— TTS pipeline / provider / 字幕时序 |
| [`references/RECORDING.md`](references/RECORDING.md) | Phase 4 —— 自动录屏为 MP4；含**自动播放策略与音频/字幕降级契约** |
| [`references/DEPLOYMENT.md`](references/DEPLOYMENT.md) | Phase 4 —— 嵌入已有 Web 应用 |
| [`references/ANIMEJS-GUIDE.md`](references/ANIMEJS-GUIDE.md) | 写需要真动画 / 物理级拖拽的章节时 |

---

## 许可

[MIT](./LICENSE) © course-forge contributors