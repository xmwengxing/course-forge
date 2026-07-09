# Course Mode — 课程模式

> ⚠️ **本文件默认要读**。SKILL.md 流程总图 Phase 0 是新加的"模式判断"步骤——
> 读本文件后, 决定走 [单视频] 还是 [课程模式]。**默认"课程模式"** (除非用户
> 明确说"只做单视频")。

---

## 1. 模式判断 checklist (Phase 0 必走)

读完源文档路径, 用 3 个问题判断走哪种模式。**任意一个 = 课程模式**。

| # | 问题 | 命中规则 |
|---|---|---|
| 1 | 源文档**文件名**或**目录名**含章节号? | `1.x` / `S1` / `Lesson X` / `第 N 章` / `Chapter N` / `Unit N` 等任一前缀 |
| 2 | 源文档**同一目录下有兄弟文件**? | `1.0 大纲.md` + `1.1 ...md` + `1.2 ...md` 等并列 |
| 3 | 用户**口述**含课件/课程/章节词? | "做课件" / "做课程" / "多章节" / "我讲一下整个 X" 等 |

如果 ≥ 1 命中 → **课程模式**, 必做 (见 § 2)。
如果 0 命中 → **单视频模式**, 走 SKILL.md 主流程即可。

> **反例警告**: 早期版本第一句写"主模式单视频, 本文件默认不读",
> 实际效果 = agent 把"用户给完整课程某章节"误判为"单视频"。
> 现在改"默认课程模式 + Phase 0 显式判断"——避免重复踩坑。

---

## 2. 课程模式必做 (Phase 2 启动前清单)

1. 生成 `public/course.json` 三级结构 (课 / 段 / 章)
2. `App.tsx` **必须**走 `<CourseView>` (templates/App.tsx 内部视图)，不是默认的简单 App.tsx
3. `useCourseLoader` 读 `?course=<id>` 路由，匹配 `/course-<id>.json` 或 fallback `/course.json`
4. 启用 `ChapterMenu`（左侧 3-tier 导航）/ `ModeControls`（播放/暂停 + 状态徽章 + 全屏）/ `CourseProgress`（按章节进度条）/ `SubtitleStep`（拉 subtitle-timing.json）/ `QuizPanel`（末段柯氏 L1）
5. 末段加柯氏 L1 + L2 评估
6. **`npx tsc --noEmit` 通过** — 不通过禁止汇报"做完了"

> **不读 App.tsx CourseView = 不会写课程模式**——会自动退化为单视频（直接
> 读 chapters 数组、忽略 course.json、不渲染 ChapterMenu、不调 useCourseLoader）。
> 详见 `templates/src/App.tsx` CourseView 内部实现。

---

## 3. 课程结构 (course.json 形态)

```jsonc
{
  "courseId": "kids-coding",
  "title": "未来创造者：儿童 AI 编程启蒙",
  "sections": [
    {
      "id": "1.1",
      "title": "第1课 你好，数字世界",
      "segments": [
        { "id": "S1", "title": "导入", "chapters": [
          { "id": "01-opening", "title": "从玩家到创造者" },
          { "id": "02-ide",     "title": "工程师工作台" }
        ]},
        { "id": "S2", "title": "核心概念", "chapters": [...] },
        { "id": "S3", "title": "复盘",     "chapters": [...] }
      ]
    },
    { "id": "1.2", "title": "第2课 …", "segments": [...] }
  ]
}
```

**层级**：section（课时）→ segment（段：导入/精讲/复盘）→ chapter（章节）。
**chapter.id 必须** 与 `chapters.ts` 里的 `ChapterDef.id` 一一对应。

---

## 4. 章节密度约束 (课程级)

| 约束 | 阈值 | 修法 |
|---|---|---|
| 真交互密度 | 每 **3** 章必须含 ≥ **1** 处真交互 | 缺 → 在该屏加 `useState` + `onClick` |
| 视觉演示 | 每章 ≥ 1-2 处 SVG/Canvas/CSS 动画 | 缺 → 详见 [`CHAPTER-CRAFT.md`](CHAPTER-CRAFT.md) § 必须用 CSS / SVG |
| 字幕 | 每步 1 段 narration → mp3 + subtitle-timing.json | 缺 → `npm run extract-narrations` → `synthesize-audio` → `subtitle-timing.py` |
| 真交互标准 (单章内) | 全部满足 | (详见 [`CHAPTER-CRAFT.md`](CHAPTER-CRAFT.md) § 必须用交互 的 3 项标准) |

> **为什么 3 章**：实验值 — 低于 3 章出现 1 次交互太密集（> 33% 屏带交互会
> 打断叙述节奏），高于 5 章又太松（用户 5 屏没机会动手，遗忘率高）。
> 3 章 / 1 互动 = 33% 屏带交互 + 用户每 2 分钟可点一次。

---

## 5. chrome 反模式教训 (必修避免)

下面 6 个反模式是 demo_test 跑出来的真实坑，**写课程时必看必避**。

### 5.1 ModeControls 不要 3 按钮

**反例**：放 MANUAL / AUDIO / AUTO 三个按钮让用户"选模式"。
**问题**：用户不知道自己该选什么，半自动按钮的"音频不自动推进"听感差。
**正例**：**只放 1 个不可点的状态徽章**——根据 `isPaused` 显示：
- 播放中 → 绿色脉冲 "AUTO 全自动"
- 暂停中 → 橙色 "MANUAL 手动"
**保留**：Space / 播放按钮 仍可触发；M 键循环 mode（高级用户用，UI 不暴露）。

### 5.2 进度条按章节（不按课程）

**反例**：进度条 = 整个课程总步数。
**问题**：30 章节的课程下进度条移动极慢，百分比跳到 80%+ 视觉上"溢出"。
**正例**：进度条 = **当前章节总步数**（`chapterTotalSteps`），
切章重置 0%。

### 5.3 课程模式不渲染 ProgressBar

**反例**：复用单视频的 ProgressBar（hover 弹章节列表 + 跳章节）。
**问题**：底部列表弹出遮挡 ModeControls 按钮，导致按钮无法点。
**正例**：课程模式用 `CourseProgress`（紧凑"Ch 02/06 · Step 04/06"读数 +
细进度条），单视频模式才用 `ProgressBar`。判断：`course.courseId === "single"`
走 ProgressBar，否则走 CourseProgress。

### 5.4 键盘单一权威

**反例**：AutoStartGate / useAutoMode / App.tsx 各监听 Space。
**问题**：多个 listener 同一时间触发 = 状态来回切 + 提前推进。
**正例**：**App.tsx 是 keyboard 单一权威**。AutoStartGate 不监听键（避免抢
Space + 触发 button.click()），只响应 click。Space handler 用 **capture 阶段**
+ `stopPropagation`，浏览器 button 焦点态的 Space 也被先拦截。

### 5.5 AutoStartGate 不要 `role="button" tabIndex={0}"

**反例**：AutoStartGate 整个 div 设 `role="button" tabIndex={0}`。
**问题**：浏览器原生行为是 button 焦点上按 Space 触发 click——双触发。
**正例**：AutoStartGate 只是 div，**不**加 role/tabIndex。Space 完全归 App.tsx
根据 `gateVisible` 状态决定行为（启动 / 暂停 / 恢复三态）。

### 5.6 chrome 通用 token (`--ui-*`)

**反例**：chrome 组件直接用主题 token (`var(--accent)`, `var(--surface)` 等)。
**问题**：主题 token 是为**内容**服务的；chrome 直接用会"夺戏"（如
midnight-press 荧光青菜单刺眼）。
**正例**：chrome 组件 CSS 用 `--ui-*` token。`base.css` 映射：
```css
:root {
  --ui-accent: var(--accent);
  --ui-surface: var(--surface);
  --ui-text: var(--text);
  /* ... 完整映射见 templates/src/styles/base.css § Generic UI token */
}
```
主题可以**可选**覆盖 `--ui-*`（per-theme override），fallback 够用。
详见 [`THEMES.md`](THEMES.md) § 通用 UI Token。

---

## 6. 多课程管理 (?course= 路由)

- `?course=kids-coding` → `useCourseLoader` 拉 `/course-kids-coding.json`
- 无 `?course=` → fallback `/course.json`（默认课）
- `useStepper` 的 localStorage key 含 `courseId` 命名空间
  （`cf-cursor-<courseId>-v4`），两课不互相覆盖
- 多课共享 `templates/src/` 里的 chrome 组件 + 主题，每个 `public/course-<id>.json`
  是数据文件

---

## 7. 故障自检 (跑课程时遇到问题)

| 现象 | 根因 | 修法 |
|---|---|---|
| 左侧 ChapterMenu 不可见 | Stage `position: fixed` 覆盖全屏 | Stage 加 `layout="embedded"` prop |
| 字幕没显示 | 没接 subtitle-timing.json | 加 `<SubtitleStep>` 组件 |
| 全屏按钮缺失 | ModeControls 没全屏入口 | ModeControls 接 `onFullscreen` + `isFullscreen` |
| 切到下一章节卡死 | chapter.id 不在 `chapters.ts` | 检查 `course.json` 里 chapter.id 与 `chapters.ts` 一致 |
| Space 同时暂停+推进 | 多 listener 抢 Space | App.tsx 单一权威 + capture 阶段 |
| Space 在 ?auto=1 启动 auto 后立刻暂停 | 上一版的 useAutoMode 自带 handler | 删 useAutoMode 自带 keyboard handler |
| 进度条右侧溢出 | 进度条总长 = 课程 | 改 `stepPct = (step + 1) / chapterTotalSteps` |
| 播放按钮凹陷全黑 | CSS 引用 `--ui-accent-warn` 但 base.css 没定义 | base.css 加完整 `--ui-accent-*` 映射 |
| 进度条右侧溢出切到 S3 段 | 同上 (旧版用全课程) | 改 per-chapter |

---

## 8. chrome 组件清单 (课程模式 6 件套)

> **chrome = 围绕内容的非内容 UI**。以下 6 个组件已包含在 `templates/src/components/`
> 里，scaffold.sh 同步拷到新项目。课程模式必启用前 4 个，后 2 个按需。
> 详细 props 看文件，**文档不复制 API**（避免与代码脱节——代码是权威）。

| 组件 | 文件 | 主要 props | 用途 |
|---|---|---|---|
| **ChapterMenu** | `components/ChapterMenu.tsx` | `course, currentChapterId, jumpTo` | 左侧 3-tier 树状导航（course/segment/chapter） |
| **ModeControls** | `components/ModeControls.tsx` | `playbackPhase, onTogglePause, isPaused, onFullscreen, isFullscreen, hint` | 底部三件套：播放/暂停 + 状态徽章 + 全屏 |
| **CourseProgress** | `components/CourseProgress.tsx` | `chapters, cursor` | 底部细进度条（**按章节**总长，**不**按课程） |
| **SubtitleStep** | `components/SubtitleStep.tsx` | `chapters, cursor` | 拉 `/subtitle-timing.json`，按 (chapter, step) 渲染字幕 |
| **QuizPanel** | `components/QuizPanel.tsx` | `question, onSubmit, blocking` | 末段柯氏 L1+L2 弹题（单选/多选/简答） |
| **AutoStartGate** | `components/AutoStartGate.tsx` | `visible, onStart` | `?auto=1` 进入时全屏 gate，**只响应 click 不监听键**（§ 5.4） |

**hooks**（同样在 `templates/src/hooks/`）：

| hook | 用途 |
|---|---|
| `useCourseLoader` | 读 `?course=<id>` → 拉 `/course-<id>.json` 或 fallback `/course.json` |
| `useStepper(chapters, courseId)` | 步进器，localStorage key 含 courseId 命名空间 |
| `useAudioPlayer` | 音频 + auto-advance |
| `useAutoMode` | mode 状态（**不含 keyboard handler**，全归 App.tsx） |

---

## 9. chrome 改法 (token 驱动 + 不动 React 业务)

> **chrome 改样式永远走 CSS token，不动 React 业务代码**。

### 9.1 改 chrome 颜色 / 间距

只动对应组件的 `.css` 文件 + `--ui-*` token：

```css
/* 例：菜单背景从 dark surface 改成 light neutral */
.ChapterMenu.css { background: var(--ui-surface); }
/* 或彻底覆盖 chrome 风格：在 themes/<id>/tokens.css 末尾加 */
:root {
  --ui-accent: #4f46e5;   /* 锁定为靛蓝 */
  --ui-surface: #fafafa;  /* 锁定为近白 */
}
```

完整 `--ui-*` 列表见 [`THEMES.md`](THEMES.md) § 通用 UI Token。

### 9.2 改 chrome 行为 / 文案 / 新增 props

- 改 `components/<Name>.tsx` 内的 JSX（**只**该文件）
- 不动 `App.tsx` 之外的业务代码
- props 改完同步更新 § 8 表格（不复制 API，但**记录用途变了**）

### 9.3 新增 chrome 组件

1. `templates/src/components/<Name>.tsx` 写实现
2. `templates/src/components/<Name>.css` 写样式（用 `--ui-*` token）
3. `templates/src/App.tsx` CourseView 调它
4. `scaffold.sh` 同步拷到新项目
5. **更新 § 8 表格**（新增一行）

### 9.4 通用脚本说明

**没有专门的"chrome 生成脚本"**——chrome 是 React 组件 + CSS token。

`scaffold.sh` 做的事：脚手架时**自动拷贝 6 个 chrome 组件**到新项目，不需要额外
flag。**改 chrome 不需要跑脚本**——直接改源码，HMR 自动应用。

未来如需"按主题定制 chrome 范围"（如 `scaffold.sh --chrome=minimal`），见
`scripts/scaffold.sh` 头部（**当前未实现**，按需扩展）。
