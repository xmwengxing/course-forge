# Course Forge · 课件锻造台

把一份知识文档或口播稿，做成可录屏的 16:9 点击驱动网页演示——可选 TTS 配音、按句切分字幕，最后嵌入 Web 应用或导出 MP4。

[English](./README.md) · [中文文档](./README.zh-CN.md) · [技能入口](./SKILL.md)

---

## 它做什么

你提供一篇文章或口播稿。技能引导 agent 走完：

1. 写口播稿 (`script.md`) 和章节开发计划 (`outline.md`)
2. 跟你对齐 5 件事：稿子 / outline / 主题 / 素材 / 开发模式
3. 脚手架一个 Vite + React + TS 项目，逐章实现（**第 1 章必须在主线程作为锚点**）
4. 可选地用可插拔 TTS（MiniMax / OpenAI / Edge / 自带）合成音频
5. 嵌入 Web 应用，或自动录屏为 MP4

产出是纯静态的 `dist/`，可以部署到任何地方。

---

## 安装

```bash
# 推荐 — skills CLI
npx skills add xmwengxing/course-forge

# 或手动克隆
git clone https://github.com/xmwengxing/course-forge.git
cp -r course-forge /��的项目/.opencode/skills/
```

Claude Code 还可以走插件市场：`/plugin marketplace add xmwengxing/course-forge`。

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
Phase 1  内容编写    →  script.md + outline.md
                       [Checkpoint Plan]  对齐 5 件事
Phase 2  网页开发    →  脚手架 + 章节（第 1 章 = 锚点）
                       [用户验收]        锚点必须先通过
                       →  第 2..N 章    （逐章 / 顺序 / 并行）
Phase 3  音频（可选）→  TTS 合成 + 按句切分字幕
Phase 4  部署        →  嵌入（新窗口 / iframe / DB）  OR  录屏为 MP4
```

`[]` 行是硬节点——agent 必须在每个节点暂停等人审。每个阶段的读文件指引见 [`SKILL.md`](./SKILL.md) § 文件读取指南。

---

## 课程层级（课程模式）

```
Course   — 单门领域或完整课程（如"X 入门"）
Segment  — S1..SN，课内的主题块（导入 / 精讲 / 案例 / 收官 / ...）
Chapter  — 30~60s 屏 = N 步，技能实际构建的最小单元
Step     — 单个口播节拍 = 一屏整画内容
```

**单视频模式（最常见）跳过 Course 和 Segment 两级**——`course.json` 可删。详见 [`references/COURSE-MODE.md`](references/COURSE-MODE.md)。

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

脚手架出来的项目要 Node 20+。TTS 视所选 provider 需要对应网络。

---

## 文档地图

| 文件 | 何时读 |
|---|---|
| [`SKILL.md`](./SKILL.md) | **始终先读** —— 工作流总览 + 各阶段读文件指引 |
| [`references/CHAPTER-CRAFT.md`](references/CHAPTER-CRAFT.md) | 写每章时 —— 单章能否通过验收的唯一标准 |
| [`references/SCRIPT-STYLE.md`](references/SCRIPT-STYLE.md) | Phase 1 —— 文章转口播稿 |
| [`references/OUTLINE-FORMAT.md`](references/OUTLINE-FORMAT.md) | Phase 1 —— `outline.md` 字段规范和章节切分规则 |
| [`references/COURSE-MODE.md`](references/COURSE-MODE.md) | Phase 1/2 —— 仅在做多段课程时读 |
| [`references/THEMES.md`](references/THEMES.md) | Checkpoint Plan / 任何选换主题时刻 |
| [`references/AUDIO.md`](references/AUDIO.md) | Phase 3 —— TTS pipeline / provider / 字幕时序 |
| [`references/RECORDING.md`](references/RECORDING.md) | Phase 4 —— 自动录屏为 MP4 |
| [`references/DEPLOYMENT.md`](references/DEPLOYMENT.md) | Phase 4 —— 嵌入已有 Web 应用 |
| [`references/ANIMEJS-GUIDE.md`](references/ANIMEJS-GUIDE.md) | 写需要真动画 / 物理级拖拽的章节时 |

---

## 许可

[MIT](./LICENSE) © course-forge contributors