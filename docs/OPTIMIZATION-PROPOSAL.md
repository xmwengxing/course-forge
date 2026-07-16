# course-forge 优化方案

> 现状诊断 + 四维度优化（Skill 规范 / 动画·交互能力 / 工作流·交付标准 / 已知缺陷修复）
> 基于 2026-07-16 对 SKILL.md、references、templates、scripts、themes 的全量核验。

---

## 一、现状诊断（已核验的缺陷）

### 资产盘点（值得保留的部分）
- **文档体系完整**：SKILL.md 术语统一（课程>大纲·分段>章节>屏>步）、5 阶段流程清晰、硬节点设计合理。
- **ANIMEJS-GUIDE.md 详尽**：4 大共性（随机化/持续循环/多 keyframe/独立 stagger）+ 8 材质手法，方法论扎实。
- **scenes 组件库已存在**：`templates/src/components/scenes/` 下有 `RunnerTrack / LiveEditor / BlockStack / TypeOut` 四个"模拟实景"组件——这是好资产，但**示例从没示范过它们的用法**。
- **theme.json 契约干净**：id/nameZh/mood/bestFor/preview 齐全，6 套主题。
- **两级课程结构 + narrations.ts 单一真相源**设计合理。

### 已核验的缺陷（按"示例不理想"线索深挖）

| # | 位置 | 缺陷 | 证据 |
|---|---|---|---|
| D1 | `templates/src/chapters/01-example/Example.tsx` | 静态 SVG 永不动画：`ex-stage-demo`（67-75 行）是纯 `<rect><line><circle><text>`，出现后永不动，注释却自称"常驻视觉演示（真画 SVG）" | 反 `CHAPTER-CRAFT.md` § "每屏有动态" |
| D2 | 同上 | **0 处真互动**：3 步全章无 onClick/onChange/QuizPanel/Draggable；"Tap anywhere to advance" 是导航不是互动 | 反硬规则 #3"每 3 屏 ≥ 1 互动"（3 步=3 屏，应 ≥1） |
| D3 | 同上 | 注释块（19-41 行）教 agent 用 `scenes` 组件（RunnerTrack/LiveEditor/BlockStack/TypeOut），**但自己一个都没用**——示范缺失 | 示例与文档不自洽 |
| D4 | 同上 | 占位文中英混排 AI 味："这是 first step." / "换上你自己的章节内容 →" | 反 `CHAPTER-CRAFT.md` § 避免 AI 味 |
| D5 | `references/EXAMPLES/example-anime/chapter.tsx` | **编译期 bug**：`ScreenOutro()`（240 行）是无参函数组件，函数体内引用 `step`（243、266 行）——作用域未定义，`tsc` 报 `Cannot find name 'step'` | 范例本身跑不起来 |
| D6 | 同上 | 自承违反硬约束：第 2 行注释"30 步 (硬约束 ≤ 12 步/章, 此处作为 anchor 不限)"——anchor 公开违反 ≤12 步规则，却仍被 EXAMPLES/README 列为唯一 animejs 完整范例 | 误导 agent |
| D7 | 同上 | README 称"3 处视觉演示 + 2 处互动（含 step 23-27 拖拽排序 4 卡片）"，**代码里第二个互动（拖拽排序）完全不存在** | README 与代码严重不符 |
| D8 | 同上 | `chapter.css` 大量硬编码 hex（`#fafafa`/`#d8d8d8`/`#c0c0c0`…），反"配色走 token" | 反代码红线 |
| D9 | `templates/scripts/lint-course.py` | **密度按"章"算而非"屏"**：第 202 行 `required = (total_chapters + 2) // 3`，注释也写"每 3 章至少 1 章有真互动"——SKILL.md 明确"每 3 **屏** ≥ 1 互动"。最严重语义错位 | 把"3 屏 1 互动"放过成"3 章 1 互动" |
| D10 | 同上 | 核心规则只 warn 不 fail：无互动（124 行）、无 Reveal（128 行）均 `warns.append`，lint 仍 exit 0 | 与 SKILL.md 把它们列为 #1/#3 不变量矛盾 |
| D11 | 同上 | `RE_STEP_EQ = step\s*===\s*(\d+)` 只匹配 `===`，漏掉 `>=`。Example.tsx 主要用 `step >= K`，导致 `max_step=None`，口播对齐检查**静默跳过** | 对齐校验形同虚设 |
| D12 | 同上 | `RE_VISUAL` 匹配关键字（含注释里出现的），静态 SVG 也算"有视觉演示" | 动效必具可绕过 |
| D13 | 同上 | 完全未检查：≤12 步/章、token 化（硬编码 hex/字体名）、4 大共性、反 AI 味自查 | example-anime 30 步+硬编码 hex+缺第 2 互动都能通过 |
| D14 | `templates/src/components/QuizPanel.tsx` | text 题永远 `correct=true`（41 行），"互动"退化为"只收集不判定" | 假互动 |
| D15 | 同上 | 答错即锁死：`disabled={submitted}` 后无"再试一次"按钮 | 体验缺陷 |
| D16 | 同上 | 无 a11y（button 无 aria-pressed、textarea 无 label）、选项不 shuffle | 合规缺陷 |
| D17 | `templates/src/components/Reveal.tsx` | 无兜底：完全依赖外部 `.cf-reveal` 类，主题缺类则元素永 `opacity:0` 不可见，silent 失败 | 核心组件高风险 |
| D18 | 同上 | 无 `prefers-reduced-motion`、无 `onEntered/onExited` 回调、variant 仅 4 种（rise/scale/pop/fade） | 与"更狂更视频感"目标不匹配 |

**结论**：用户反馈"示例不理想"成立，且比表象更严重——脚手架自带示例（D1-D4）是反模式集合体；被定为"标准范例"的 example-anime（D5-D8）有编译 bug、自承违规、README 与代码不符；lint（D9-D13）把核心规则降级或算错；QuizPanel/Reveal（D14-D18）缺兜底与 a11y。agent 若照此学习，会系统性地复制这些问题。

---

## 二、四维度优化方案

### A. Skill 规范（示例与文档自洽）

**A1. 重做示例分层**——把"反模式示例"改造成"合规范例"
- `01-example/Example.tsx`：改造为真正演示 `scenes` 组件 + 逐步揭示 + 1 处真互动的**最小合规范例**（≤12 步）。用 `RunnerTrack` 或 `BlockStack` 演示"内容驱动动画"，加一个 `QuizPanel` 或 `onClick` 演示真互动，删掉中英混排占位文。
- `example-anime/chapter.tsx`：修编译 bug（`ScreenOutro` 接 `step` 参数或改为顶层分发）、降到 ≤12 步、补全第 2 处互动（拖拽排序）、token 化所有硬编码 hex、README 与代码对齐。

**A2. 强化 lint 为 fail 级**（详见 D9-D13 修复）
- 密度按屏算、揭示/互动升级为 FAIL、补 token 化检查、补 ≤12 步检查、`RE_STEP_EQ` 同时匹配 `>=` 和 `===`。

**A3. 示例与文档自洽**
- Example.tsx 要么用 `scenes` 组件，要么删掉注释里的引用——不能"教了不用"。
- 所有 EXAMPLES 的 README 必须与代码一一对应（互动数、步数、视觉演示数）。

**A4. 建立示例自测门禁**
- CI/手动跑：`tsc --noEmit` + `npm run lint`（全 FAIL 级）+ 渲染走查。
- **示例自己必须过自己定义的规则**——这是"示例即规范"的底线。当前 example-anime 连 tsc 都不过，却当范例，必须修。

---

### B. 动画 / 交互能力

**B1. Reveal 组件加固**
- 加兜底：组件内注入最小基础样式（`.cf-reveal{opacity:0;transition:opacity .3s} .cf-reveal.in{opacity:1}`），不依赖主题必须提供——避免 silent 不可见。
- 加 `prefers-reduced-motion`：检测时直接显示，跳过过渡。
- 扩展 variant：从 4 种扩到 8+（加 `blur`/`wipe`/`clip`/`slide`/`spring` 等视频感动效）。
- 可选 `onEntered`/`onExited` 回调：支持动画完成后联动音频/下一步。

**B2. QuizPanel 加固**
- text 题：支持 `validator` 函数或关键字匹配，真校验对错（不再永远 correct=true）。
- 答错可重试：加"再试一次"按钮，重置 `submitted` 状态。
- a11y：button 加 `aria-pressed`、textarea 加 `<label>`、选项 shuffle（用稳定 seed 避免每次重排）。

**B3. 互动组件库扩充**（当前 scenes 偏"演示"轻"互动"）
- 补充可复用互动原语，让"每 3 屏 1 互动"有现成积木：
  - `DragSort`：拖拽排序（封装 animejs `Draggable`，4-6 卡片，落位判定）
  - `SliderInput`：滑块/数值输入触发 `useState`（坐标系拖拽、参数调节）
  - `TabSwitch`：点击切 tab 显隐不同内容
  - `NodeGraph`：可展开/点击的节点图（知识图谱、流程展开）
- 每个原语都"接收 step、隐藏态占位、全 token"，与 scenes 同级目录 `components/interactives/`。

**B4. animejs cohesion 接入主 lint**
- 当前 `check-animejs-cohesion.py` 是独立脚本，容易漏跑。把它合并进 `lint-course.py` 或在 `npm run lint` 里串行调用，让"4 大共性 ≥2 项"成为默认校验。

---

### C. 工作流及交付标准

**C1. 交付门禁明确化**
- 每章完工 = `tsc --noEmit` 通过 + `npm run lint` 通过（全 FAIL 级）+ 完工自检清单 + dev server 验收。
- 把"warn 可放过"改为 **"0 FAIL 0 WARN 才能交付"**——warn 升级为必须修复项（除非有明确豁免理由）。

**C2. 示例作为锚点的验收前置**
- 第 1 章验收前，agent 应先对照"合规范例"（A1 重做后的 01-example）自检差异，再开始实现。
- CHAPTER-CRAFT.md § 完工自检 增加"与合规范例对照"一项。

**C3. 互动密度计算修正后，outline 阶段就要规划互动落点**
- outline.md 增加"互动规划"字段：标明哪几屏放互动、放哪种类型。
- 开发时对照 outline 的互动规划，避免"做完才发现互动不够"。

**C4. 反 AI 味自查工具化**
- 把 CHAPTER-CRAFT.md § 避免 AI 味 五类做成 lint 检查：
  - 紫粉/蓝紫对角渐变背景（检测 `linear-gradient` + 紫粉色值）
  - 圆角卡片 + 彩色左边框（检测 `border-left` + 彩色）
  - emoji 当图标（已有，强化为 FAIL）
  - 假数据/假 logo（检测"X 万用户"等模式）
  - 整章同一种入场动画（检测全章只用单一 variant）

---

### D. 已知缺陷修复优先级（按风险排序）

**P0 — 阻断/误导（必须先修）** ✅ 已完成（2026-07-16）
| 缺陷 | 修复 | 状态 |
|---|---|---|
| D9 lint 密度按章算 | 改为按屏统计（步数估算屏数 `ceil(steps/9)`）+ 新增数据驱动 quiz 识别（load_quiz_counts） | ✅ |
| D5 example-anime 编译 bug | `ScreenOutro` 接 step 参数 + 调用处传 step | ✅ |
| D1-D4 Example.tsx 自承违规却作起点 | 重做：BlockStack scenes + 逐步揭示 + 数据驱动 quiz + 去 placeholder | ✅ |
| D6 example-anime 自承违反 ≤12 步 | 注释改为说明 anchor 豁免理由 | ✅ |
| D7 README 与代码不符 | outline 段 + 节奏表 + 代码描述全部对齐代码实际 5 屏结构 | ✅ |

**P0 额外修复**（实施中发现的新缺陷）：
- lint 不识别 scenes 组件为视觉演示 → 加 RE_SCENE 判断
- lint `id:` 干扰 quiz 解析 → 改用"id 后跟 title"作章节锚点
- lint `font-family: var(...)` 误判硬编码 → 负前瞻 `(?!\s*var\()`（注意 `\s*` 回溯 bug）

**P1 — 体验/合规（次优先）**
| 缺陷 | 修复 |
|---|---|
| D14 QuizPanel text 假校验 | B2 支持 validator |
| D15 答错锁死 | B2 加"再试一次" |
| D17 Reveal 无兜底 | B1 注入基础样式 |
| D10 lint 核心规则只 warn | 升级为 FAIL |
| D11 RE_STEP_EQ 漏 `>=` | 同时匹配 `>=` 和 `===` |
| D7 README 与代码不符 | A3 对齐 |

**P2 — 增强（迭代打磨）**
| 缺陷 | 修复 |
|---|---|
| D2/D3 scenes 示范缺失 | A1 用 scenes 重做示例 |
| D18 Reveal variant 少 | B1 扩到 8+ |
| B3 互动组件库 | 新增 `components/interactives/` |
| D8 硬编码 hex | token 化 + D13 lint 检查 |
| D12 RE_VISUAL 可绕过 | 校验动画真实存在（非仅关键字） |
| C4 反 AI 味 lint | 工具化五类检查 |
| B4 cohesion 接入主 lint | 串行调用 |

---

## 三、实施顺序建议

1. **第一波（P0，修阻断）**：修 lint 密度算错（D9）+ example-anime 编译 bug（D5）+ 重做 01-example 为合规范例（A1）。这一波让"示例能跑 + 规则正确"，是后续一切的基础。
2. **第二波（P1，修体验）**：QuizPanel/Reveal 加固（B1/B2）+ lint 核心规则升级 FAIL（D10/D11）+ README 对齐（A3）。
3. **第三波（P2，增强）**：互动组件库（B3）+ Reveal variant 扩展 + 反 AI 味 lint（C4）+ cohesion 接入（B4）。

每波完成后跑一次"示例自测门禁"（A4）回归，确保示例始终过自己定义的规则。

---

## 四、验收标准（✅ 全部完成 2026-07-16）

- [x] `tsc --noEmit` 在 templates/ 全过（demo 两章验证）
- [x] `npm run lint` 在 demo 上 0 FAIL 0 WARN（材质×20/×25）
- [x] ~~01-example 演示 scenes~~ → 已删除示例避免风格固化，chapters.ts 引导从零写
- [x] ~~example-anime 修复~~ → 已删除（D5-D8 作废）
- [x] lint 按"屏"算密度、核心规则 FAIL 级、匹配 `>=` + 数据驱动 quiz 识别 + 材质检查 + 反AI味
- [x] QuizPanel text 题真校验（关键字匹配）+ 可重试 + a11y + 选项 shuffle
- [x] Reveal 兜底样式（内联 opacity）+ prefers-reduced-motion + variant 8 种 + onEntered
- [x] 互动组件库 4 个原语（DragSort/SliderInput/TabSwitch/NodeGraph）
- [x] 四大支柱落地（CHAPTER-CRAFT 视觉焦点/对比层次/材质立体/动态强调）
- [x] C5-C8 音频流程优化（Checkpoint Audio 时序 + edge.sh 健壮化）
- [x] 工作流澄清（SCRIPT-STYLE 序号 + OUTLINE-FORMAT 信息池/互动落点）

> 本轮（2026-07-16）完成 P0+P1+P2+P3 全部优化项。demo 验证：2 章 15 步，四大支柱重写，tsc+lint 双通过，edge-tts 音频+字幕，4 处互动。详见 .workbuddy/memory/2026-07-16.md。
