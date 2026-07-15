# Course Structure — 课程结构（单一模式）

> 本 skill 只有**一种模式：交互式课程 / 课件**。不再区分「单视频模式」与「课程模式」——
> 所有产出都是带章节导航、字幕、音频、互动的课程。视频录制只是可选的后期分发方式
> （见 `references/RECORDING.md`），不再影响主流程。

---

## 1. 术语（唯一口径，全仓统一）

| 术语 | 含义 | 运行时对应 |
|---|---|---|
| **课程 Course** | 一次交付的完整课件，可是一门课或一整套体系 | `course.json` 根（`courseId` / `title`） |
| **大纲·分段 Outline Segment（原 S1~S5）** | 一级导航菜单项；按内容主题划分的块（导入/精讲/案例/收官…），**段数依内容而定，不必是 5 段** | `course.json` 的 segment 条目（目标模型） |
| **章节 Chapter（章 / 课）** | 二级导航菜单项，一个独立教学单元/知识点，如「1.1 你好，数字世界！」。一个章节由 1 屏或多屏组成 | `course.json` 章节条目 + `chapters.ts` 注册 |
| **屏 Screen（画面）** | 章节内的 1920×1080 视觉画框（容器），承载多个步；1 章 = 1 屏 或 多屏讲完 | 章节 `.tsx` 内按屏切换的视图 |
| **步 Step** | 屏内**原子揭示单元**：**1 步 = 1 口播节拍 = 1 字幕窗 = 1 音频段**；逐步揭示 = 一屏内逐个点亮各步 | 章节 `.tsx` 的 `step` + `narrations.ts` 的一项 |

辅助词（**不是**结构单元，别混用）：
- **Stage** = 固定 1920×1080 的画框（容器）
- **Canvas** = 一种渲染技法（非单元）
- **卡片** = 内容元素（非单元）

🚫 **禁用同义词**：`slide` / `PPT`。**屏 ≠ 步**：屏是画框容器，步是屏内揭示节拍，
不要把「段 / segment」当平级单元。历史上 `section` / `segment` / `chapter` / `屏` / `步`
混用造成大量 agent 误判，现已统一为 **课程 > 大纲·分段 > 章节 > 屏 > 步** 概念
（导航只到「大纲·分段 → 章节」两级；屏/步是内容颗粒度，详见 `SKILL.md` § 术语表）。

> ✅ **运行时已落地**：模板 `course.json` 即为 **课程 > 大纲·分段(outlineSegments) > 章节(chapters)** 两级结构；
> `ChapterMenu` 渲染「大纲·分段 → 章节」两级菜单；屏 / 步是内容颗粒度（屏 = 1920×1080 舞台，步 = narrations 一项）。
> 不要再使用旧的 `sections → segments → chapters` 三级写法。

---

## 2. course.json（5 层模型运行时形态）

```jsonc
{
  "courseId": "kids-coding-ai",
  "title": "儿童编程基础（AI方向）",
  "outlineSegments": [                 // 大纲·分段（一级导航菜单块，段数依内容）
    {
      "id": "seg-import",              // 如 导入 / 精讲 / 案例 / 收官，不必是 5 段
      "title": "导入篇",
      "chapters": [                    // 章节（二级导航菜单项）
        { "id": "01-opening", "title": "开场" },
        { "id": "01-scratch", "title": "认识 Scratch 界面" }
        // 每章的屏数由该章 narrations.ts 长度推导，1 章可 1 屏或多屏，绝不在此手填
      ]
    }
  ]
}
```

- `chapter.id` 必须与 `chapters.ts` 的 `ChapterDef.id` 一一对应。
- 每章的**步数 = 该章 `narrations.ts` 数组长度**；**屏数由各章结构（屏边界）推导，不手填**。
- 互动（测验 / 拖拽 / 选择）通过章节 `quizzes` 字段声明（见 § 4 / § 5），运行时统一渲染。
- 多课程：用 `?course=<id>` 路由切换，见 § 6。

---

## 3. 章节密度约束（课程级硬规则）

| 约束 | 阈值 | 修法 |
|---|---|---|
| **真互动密度** | 每 **3 屏** 内至少 ≥ **1** 处真互动 | 缺 → 在该屏加 `useState` + `onClick` / `onChange` / drag / 输入 |
| **视觉演示** | 每屏 ≥ 1 处 SVG / Canvas / CSS 动画或动态元素 | 缺 → 见 `CHAPTER-CRAFT.md` § 必须用 CSS / SVG |
| **禁止纯文字** | 每屏不得仅为文字 | 缺 → 加图形 / 媒体 / 可视化 |
| **口播对齐** | 口播 = 屏元素 = 字幕 = 音频（若合成） | 缺 → 守住 `narrations.ts` 不变量 |
| **字幕** | 每屏 1 段 narration → mp3 + `subtitle-timing.json` | 缺 → `extract-narrations` → `synthesize-audio` → `subtitle-timing.py` |

> **真互动标准**：触发 `useState` 状态变化（点击 / 选择 / 拖拽 / 输入）才算；
> `hover` / `transition` / 「看完点下一屏」的导航 **≠ 互动**。
>
> **为什么按「屏」而不是「章」计密度**：互动要嵌进叙事节奏里，按屏约束才能让学员
> 每隔几屏就动手一次，而不是一整章看完才遇到一个题。

---

## 4. chrome 组件清单（课程 6 件套）

> **chrome = 围绕内容的非内容 UI**。以下组件已包含在 `templates/src/components/`，
> `scaffold.sh` 自动拷到新项目。文档不复制 API（代码是权威），此处只记用途。

| 组件 | 文件 | 用途 |
|---|---|---|
| **ChapterMenu** | `ChapterMenu.tsx` | 左侧导航树（大纲·分段 → 章节，两级） |
| **ModeControls** | `ModeControls.tsx` | 底部：播放 / 暂停 + 状态徽章 + 全屏 |
| **CourseProgress** | `CourseProgress.tsx` | 底部细进度条（**按章节**总长，不按课程） |
| **SubtitleStep** | `SubtitleStep.tsx` | 按（章节, 屏）渲染字幕 |
| **QuizPanel** | `QuizPanel.tsx` | 互动题弹层（单选 / 多选 / 简答），**数据驱动（已实现）**：章节 `quizzes` 字段声明，运行时统一渲染，答题前阻断推进 |
| **AutoStartGate** | `AutoStartGate.tsx` | 进入全屏播放时的启动 gate，只响应 click 不监听键 |

**hooks**（`templates/src/hooks/`）：`useCourseLoader`（读 `?course=<id>`）、`useStepper`、
`useAudioPlayer`、`useStageScale`、`useAutoMode`。

> ✅ **QuizPanel 数据驱动已实现**：交互（测验 / 拖拽 / 选择）通过章节 `quizzes` 字段声明
> （`ChapterDef.quizzes: QuizStep[]`），运行时统一渲染，并自动在答题前阻断自动 / 手动推进。
> `App.tsx` 里**不再有硬编码 demo**。详见 `templates/src/components/QuizPanel.tsx` 与 `types.ts`。

---

## 5. chrome 反模式教训（必修避免）

真实项目踩过的坑，写课程时必看必避：

- **进度条按章节，不按课程**：进度条 = 当前章节总屏数，切章重置 0%；用课程总步数会慢到溢出。
- **统一用 `CourseProgress`**：不要回退到旧的 `ProgressBar` 组件（`courseId === "single"` 的单课直出才允许走 `ProgressBar`）。
- **键盘单一权威**：`App.tsx` 是唯一 Space 监听者（capture 阶段 + `stopPropagation`），`AutoStartGate` / `useAutoMode` 不各自监听，避免双触发。
- **AutoStartGate 不加 `role="button" tabIndex`**：只做 div，Space 全归 App.tsx 按 `gateVisible` 决定行为。
- **chrome 用 `--ui-*` token，不用主题 token**：`--accent` 等是给内容服务的，chrome 直接用会「夺戏」；`base.css` 已做 `--ui-*` 映射（见 `THEMES.md` § 通用 UI Token）。
- **ModeControls 不要 3 按钮**：只放 1 个不可点的状态徽章（播放中 / 暂停中），M 键循环 mode 不暴露给 UI。

---

## 6. 多课程管理（`?course=` 路由）

- `?course=kids-coding-ai` → `useCourseLoader` 拉 `/course-kids-coding-ai.json`
- 无 `?course=` → fallback `/course.json`（默认课）
- `useStepper` 的 localStorage key 含 `courseId` 命名空间（`cf-cursor-<courseId>-v4`），多课不互覆盖
- 多课共享 `templates/src/` 的 chrome 组件 + 主题，每个 `course-<id>.json` 是数据文件

---

## 7. 故障自检（跑课程时）

| 现象 | 根因 | 修法 |
|---|---|---|
| 左侧 ChapterMenu 不可见 | Stage `position: fixed` 覆盖全屏 | Stage 加 `layout="embedded"` |
| 字幕没显示 | 没接 `subtitle-timing.json` | 加 `<SubtitleStep>` |
| 全屏按钮缺失 | ModeControls 没全屏入口 | 接 `onFullscreen` / `isFullscreen` |
| 切到下一章节卡死 | chapter.id 不在 `chapters.ts` | 检查 `course.json` 与 `chapters.ts` 一致 |
| Space 同时暂停 + 推进 | 多 listener 抢 Space | App.tsx 单一权威 + capture 阶段 |
| 进度条右侧溢出 | 进度条总长 = 课程 | 改 `stepPct = (step + 1) / chapterTotalSteps` |
| 播放按钮凹陷全黑 | CSS 引用未定义的 `--ui-*` | `base.css` 补完整 `--ui-accent-*` 映射 |

---

## 8. chrome 改法（token 驱动，不动 React 业务）

- **改颜色 / 间距**：只动组件 `.css` + `--ui-*` token；或主题 `tokens.css` 末尾覆盖 `--ui-*`。
- **改行为 / 文案 / props**：只改 `components/<Name>.tsx` 内 JSX，不动 `App.tsx` 之外业务代码。
- **新增组件**：`templates/src/components/<Name>.tsx` + `.css`（用 `--ui-*`）→ `App.tsx` 调 → `scaffold.sh` 同步 → 更新本表。
- chrome 是 React 组件 + CSS token，**没有专属生成脚本**；改完 HMR 自动生效。
