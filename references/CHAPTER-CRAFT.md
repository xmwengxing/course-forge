# 章节开发指引（每章开发必读）

---

## 这是视频，不是 PPT

正在做的是**视频网页** —— 讲者点击 + 口播 + 录屏发出去给观众看。
判断每一步做对没有，标准非常朴素：

- **不像 PPT** —— 观众感觉是在看视频，不是在看翻页幻灯（页面中不得包含页眉页脚，突出主视觉元素）
- **看起来舒服** —— 配色、字体、节奏都让人放松，不得出现大量的纯文字、不得出现字体太小的文字
- **有视觉冲击** —— 画面在演事情，不只是文字堆砌，不得一次性全部罗列所有元素，关键元素随进度逐步推进展现

---

## 必须用 CSS / SVG / Canvas / JS 大胆绘制视觉演示

> **这是底线。**
>
> 每一章都至少要有 1~2 处"动起来的图 / 演示元素"。
> **整章只有纯文字 = 验收不过 = 回去重做。**

视频感最强的来源 —— 用户**看见**了被讲解的东西在屏幕上演给他看：

- 数字在递增 / 横条在生长 / 排名在交换
- 流程节点依次点亮 / 连线自绘
- 对比被一刀切开 / 聚光灯扫过 / 形状在变形
- 粒子聚拢成形 / 噪声背景流动 / 字符雨下落
- 模拟终端交互
- 模拟 AI 对话窗口
- 模拟文件目录树

**怎么组合发挥都行 —— 但每章必须用，不允许整章纯文字。**

---

## 逐步揭示，禁止一次全展示

整页内容由**全局 `step` 计数器**驱动 —— 点击空白处或按 → 键推进
一步。设计每一步时心里要默念：**这一步演什么，下一步演什么**。

**最重要的一条**：

> 当口播在说"第一是 X、第二是 Y、第三是 Z"这种**清单 / 列表**时，
> **严禁**一个 step 把 X / Y / Z 全部 stagger 上来。

正确做法：

- 一项 = 一个 step
- X 只在它自己的 step 里独自亮起
- 讲到 Y 时，X 灰化保留作上下文 + Y 亮起
- 讲到 Z 时，X / Y 都灰化 + Z 亮起

**判断标准**：讲者会一个一个念出来吗？会 → 必须逐个揭示。

---

## 内容取舍：抓重点，不要原文搬运

视频是**音 + 画**：

- **口播**负责把信息线性讲清楚
- **画面**负责把节拍重点放大、节奏感拉出来

每个 step 屏幕上只挂这个节拍**最值得放大的 1~3 个东西** —— 一个
hero 标语 / 一个数字 / 一组对比 + 必要的视觉演示。

不要试图把原文每个字都搬上去。那是论文阅读，不是视频。

---

## 双源：节奏跟口播稿，细节回原文章

> **节奏 / 顺序 / 节拍切分** 跟 **`script.md` 口播稿** —— **关键顺序不能乱**。
> **画面细节 / 数据 / 引用 / 案例** 回 **`article.md` 原文章**抽。

`outline.md` 已经在每章首段抽了「信息池」做参考。但**实现章节时
也必须回去翻 `article.md` 本章对应段落** —— 那里有比口播稿多得多的
细节（具体数字、引用原话、案例维度、出处时间）。把这些挂到画面上，
让**画面信息密度 > 口播信息密度**。

> **如果你只用了口播稿的内容做章节** —— 屏幕等于把口播打字打了一遍
> —— 那就是 PPT，不是视频。
>
> 章节实现一定要回原始文章抽细节，不要嫌麻烦。

---

## 字体 / 配色 / 动画 / 留白 —— 视频演示基本审美

视频观众离屏幕远、注意力浮动，所以：

- **字号要大** —— hero 文字至少 80px 起，远观也能看清
- **留白要多** —— 舞台四边都要让出大留白，画面不要塞满
- **配色要舒服** —— **颜色和字体家族必须用主题 token**（保证换主题不破）；
  字号 / 间距 / 时长这些章节按内容自由发挥（详见下方「代码层最小约束」）
- **动画要舒服 + 炫酷** —— 出现得干净利落，停下来不抢戏；炫酷靠
  **设计巧思**（内容驱动的演示动画），不靠**速度暴力**或**密集闪烁**

---

## 避免 AI 味

AI 生成的网页有几种共有的"视觉指纹"，**全部不要**：

- 紫粉 / 蓝紫对角渐变背景
- 圆角卡片 + 彩色左边框装饰
- 渐变按钮 + 大圆角药丸
- emoji 当图标用
- 假数据 / 假 logo / 假"X 万用户"
- 整章 N 步用同一种入场动画（全场 fade / 全场 blur）
- 每步都挂 ken burns / 光晕呼吸 / 持续闪烁
- 每屏右下角都挂 mono 角标 / 序号

缺的东西**承认缺** —— 用 placeholder 占位卡（一张写着"image · 16:9
描述"的卡片，按真实比例留位）。**不要**用 emoji 凑、不要找无关图凑、
不要编数字。**没有就承认没有**，比 fake 强一百倍。

---

## 框架已经搭好的部分（理解就好，不需重写）

- **16:9 固定舞台**：内容设计在 1920×1080 上，外层 transform scale
  缩到任何视口，外围 letterbox 留黑 —— **没有响应式断点**
- **舞台居中 + 大留白**：上下左右四边都让出至少 80px 的安全区
- **隐形进度条**：屏幕底部默认完全透明，鼠标悬到底部边缘才出现，
  支持点击跳转章节（录屏时摄像头看不到任何 chrome 控件）
- **全局 step 驱动**：点击舞台空白处 / 键盘 ←/→ 推进；章节是 `step`
  的纯函数，没有定时器、没有命令式状态

---

## 代码层最小约束

不能踩的红线，其它怎么写都行：

### 必须用 token（换主题不破的底线）

- **颜色**：`--shell` / `--surface` / `--surface-2` / `--surface-3` /
  `--text` / `--text-2` / `--text-mute` / `--text-faint` / `--rule` /
  `--accent` / `--accent-soft` / `--accent-glow` ——
  **禁硬编码 hex / rgb / 颜色名**
- **字体家族**：`--font-display-cn` / `--font-display-en` / `--font-body`
  / `--font-mono` —— **禁硬编码字体名**
- **主题性格签名**通过 primitive class 自动接入，**不要在章节 CSS 里
  重定义它们**：
  - `.hero-num`（hero 数字风格 —— 主题决定衬线 / 等宽 / 粗黑）
  - `.rule`（分割线 —— 主题决定 1px 实线 / 4px 实线 / 2px 虚线）
  - `.card`（卡片 —— 主题决定圆角 + 阴影性格）
  - `.stage-frame`（舞台底色 / 圆角 / 阴影 / 装饰图案 / vignette
    全自动，章节什么都不用做）

### 可硬编码 / 可 token，按内容自由（解锁章节自由设计）

- **字号**：想要 80px 就写 80px，想用 `var(--t-h1)` 也行
- **间距 / padding / margin**：按画面节奏写具体值
- **动画时长 / 缓动 / keyframe**：按动画意图写具体值
  （**节奏气质**参考 `theme.json` 的 `mood` —— 慢主题别写 200ms 的快动画）
- **边框宽度 / 非性格圆角 / 字距**：随手写
- **gap / grid 布局尺寸**：按画面构图写

### 其它工程红线

- **JSX 文本内容禁止 `\u` 转义** — JSX 将标签之间（`<span>...</span>`）的内容按 HTML 文本解析，`\u` 不会被解释为 Unicode，而是逐字渲染为 `\u00B7` 等乱码。
  - 正确：`<span>·</span>`（直接写实际 UTF-8 字符）
  - 正确：`<span>{'\u00B7'}</span>`（花括号包裹的 JS 表达式）
  - 错误：`<span>\u00B7</span>`（渲染为文本）
  - 注：引号内的 JS 字符串不受此限，如 `const s = "\u00B7"` 正常工作
  - 注：`\u` 在 `.narrations.ts` 的字符串中也可正常使用（那是 JS 字符串，非 JSX 文本）

- 不用 `setTimeout` / `setInterval` 驱动动画 —— 用 CSS keyframes
- 章节内的可交互元素（按钮 / 自定义控件）加 `data-no-advance`，
  否则点了会被舞台误推进 step
- 章节代码物理隔离：每章独立文件夹、独立 CSS 类前缀，不跨章 import
- **每章必须有 `narrations.ts`**（与 `<Chapter>.tsx` 同目录）：
  - 数组长度 **=** 章节代码里 `if (step === N)` 出现的最大 N + 1
  - 每个元素 = 一个 string，该 step 要播的口播文本（来自 `script.md`
    对应段，**语义一致**——可微调标点 / 断句以适配 TTS，但不能漏关键短语）
  - 完全无音频的过场 step 用空串 `""`，Auto 模式会按字数估时撑过
  - 这是**音频合成 + Auto 模式自动推进的唯一真相源**，写错或漏写
    会让录屏对不上嘴
- **动画时长必须 ≤ 该 step 的口播时长**——Auto 模式严格按音频结束推进，
  没有"等动画跑完"的兜底。动画太长 → 三选一：**写更长口播 / 拆 step
  / 调动画速度**。详细机制见 [`AUDIO.md`](AUDIO.md)

---

## 完工自检（写完每章**强制**执行，不可跳过）

> ⚠️ **硬性流程**：章节实现完成后**必须**走完下面的自检 → 修复 → 汇报
> 三步。**禁止**"实现完成 → 直接汇报给用户"。
>
> **执行方式**（按能力降级）：
>
> 1. **优先 Agent Teams**：开一个独立的 reviewer agent，传入本章代码路径
>    + 本文件 Part「完工自检」清单，让它**逐项核查 + 出结论**（哪几条
>    pass / 哪几条 fail + 证据）。
> 2. **其次 subAgent**：当前 agent 没有 Teams 能力但能开 subagent，用 subagent
>    走同样的流程。
> 3. **都没有**：当前 agent 自己**严格逐项**核查，不允许目测一遍就放行。
>
> **拿到自检结论后**：先按 fail 项**改完代码**，然后再向用户汇报"做完
> 了 + 自检结论 + 改了什么"。**直接拿原始结论汇报但不修复 = 违规**。

写完一章 + 在浏览器点完一遍后逐项过：

- [ ] **每章至少 1~2 处 CSS / SVG / Canvas / JS 视觉演示** —— 没有 = 回去补
- [ ] **不同 step 的主导动作不一样** —— 全章一种动画 = 回去重做
- [ ] 字号大、留白舒服、配色舒服
- [ ] 清单 / 列表逐个揭示，**1 项 = 1 step**
- [ ] 画面信息比口播稿多（回了原文章抽细节挂上来）
- [ ] 没有紫粉渐变 / 圆角彩色边框 / emoji / 假数据 / 假 logo
- [ ] 缺的素材用 placeholder，不是 fake
- [ ] **颜色和字体家族全部走 token**（无硬编码 hex / 字体名）；hero 数字
      / 卡片 / 分割线 / 舞台用 primitive class 接入主题性格 —— 这两条不
      达标 = 换主题就破
- [ ] 章节交付时**主动告诉用户**："本章还缺这些素材"
- [ ] 禁止出现小号字体，大量纯文字（出现后必须回去改）
- [ ] 禁止出现任何形式的页眉页脚，仅展示关键内容（出现后必须回去改）
- [ ] **`npx tsc --noEmit` 通过** —— 不通过禁止汇报"做完了"
- [ ] 章节代码物理隔离：独立 CSS 类前缀（`.cd-` / `.mg-` / ...），
      未跨章 import，未修改 `chapters.ts` 之外的共享文件
- [ ] **`narrations.ts` 存在**且 `narrations.length` === 章节代码里
      `if (step === N)` 用到的最大 N + 1（不一致 = Auto 模式录屏会错位）
- [ ] **每条 narration 文本与 `script.md` 对应段落语义一致**（关键短语 /
      数字 / 引用全部保留，可为 TTS 微调标点断句）—— 录屏画外音应当能被
      观众听成同一段稿子
- [ ] **每个 step 的视觉动画时长 ≤ 口播时长**（口播 `字数 ÷ 4` ≈ 秒数）—— 
      超出会被 Auto 模式当场切断，动画演到一半就跳下一步

任一未过 → 回去改。**不要**"先放着以后修"。

---

## 附录 A：5 维画面-口播对位自检（每章完成后强制走一遍）

口播稿是节奏，画面是视觉冲击，两者必须**逐项对得上**。否则录屏时观众会感觉"看到的和听到的不一样"。

每章 TSX 写完后**强制**逐项核查，任一不过回去改：

- [ ] **数字对位**：口播"7 天"画面有"7"；口播"200 亿"画面有"200 亿"
- [ ] **专名对位**：口播"ECRS"画面有"ECRS"；口播"翁老师"画面有人物图/卡
- [ ] **形状对位**：口播"矩形"画面有矩形；口播"椭圆"画面有椭圆
- [ ] **对比对位**：口播"旧 vs 新"画面有双卡片或左右对比布局
- [ ] **时序对位**：口播"先 A 再 B"画面动画按 A→B 顺序揭示（不是 B 先 A 后）

> 失败案例：1.6 S2-1 t6-bpmn-symbols 第一版，narrations 扩到 10 步但 TSX 仍按 6 步分支做——口播说"矩形"时画面已在讲其他话题。

---

## 附录 B：5 类画面动态来源（每屏至少 2 类）

用户原话"单一画面内也没有任何动态效果，非常呆板"——单画面如果只有 fade-in + translateY 一组入场就**不算合格**。每屏**必须**从以下 5 类里挑 ≥ 1 类（建议 2-3 类）：

1. **数字滚动** — `AnimatedNumber` 从 0 滚到目标（峰值时刻用："80% 的失败案例"）
2. **序列入场** — `StaggeredAppear` 让多元素分批出现（清单/列表/网格场景）
3. **微动效** — 元素出场后做小幅度脉动 / 浮动 / 旋转（避免静止呆板）
4. **互动组件** — `TabSwitcher` / `FlippableCard` 让用户点击触发（教学场景标配）
5. **路径绘制** — 流程图节点用 `stroke-dasharray` 动画（流程图场景）

> **反面教材**：1.6 S1 第一版大量"虚线框 + 一段文字"画面，静态呆板，被批"毫无动态效果"。
> **正面教材**：1.6 S3 t6-eliminate 单页 5 步内混合 3 类（数字滚动 + 节点高亮 + 路径绘制）。

---

## 附录 B2（增补）：单步口播 > 10s 时的画面设计策略

当某 step 的口播文本超过 150 字（~10s）时，仅靠入场动画远远不够——画面会在语音播放的大部分时间里静止不动。此时**必须**在步内叠加以下策略，保证画面全程动态：

### B2.1 过程模拟动画

用 CSS keyframes 模拟口播描述的实际物理过程，让画面"演出来"而非"说出来"：

| 口播内容 | 画面模拟 | CSS 手段 |
|:--|:--|:--|
| "电梯关门→下降→开门" | 电梯门关闭动画 → 轿厢下移 → 楼层数字跳动 → 门开 | `@keyframes` 多阶段动画，12s 单周期 |
| "红灯30s→绿灯30s→黄灯3s" | 红绿灯三色循环切换 + 倒计时数字 | `animation-delay` + 分段 keyframe |
| "扫描条码→查价格→累加" | 扫描线上下移动 → 商品行逐条滑入 → 总价弹出 | 序列 `animation-delay` |
| "for 循环执行 N 次" | 循环计数器滚动 + 每次迭代高亮不同元素 | 无限 `animation` 配合 `nth-child` |

**关键约束**：动画总时长必须 ≈ 口播音轨时长（`字数 ÷ 15` 秒），可在 `animation-duration` 中精确匹配。步内动画结束后保持最终状态（`animation-fill-mode: forwards`）。

### B2.2 焦点放大 + 上下文收缩

当口播逐项介绍多个事物（"第一是 A，第二是 B，第三是 C"）时：

- 每项占用一个 step，而非全部摊开
- 当前讲述项**放大到画面主体**，其余收缩为缩略图或 de-emphasize
- 在放大状态下叠加 B2.1 的过程模拟动画
- step 推进后，上一项回到缩略图，下一项放大

```tsx
// 模式示例：step === 1 时电梯放大并启动动画，step === 2 时红绿灯放大
{step === 1 && <ElevatorDemo />}
{step === 2 && <TrafficLightDemo />}
```

**禁止**：`step >= 1` 一次性展示全部三项，然后用高亮/选中来区分——那意味着非当前项也在屏幕上分散注意力。

### B2.3 文字关键词随口播逐词高亮（Text-Reveal）

用于口播在总结/归纳时刻（如"输入加处理加输出"），画面上的关键词随口播逐个亮起：

```css
@keyframes reveal-word { from { opacity:0.2; transform:translateY(4px); } to { opacity:1; transform:translateY(0); } }
.word { animation: reveal-word 400ms ease both; }
.word:nth-child(1) { animation-delay: 0s; }
.word:nth-child(2) { animation-delay: 1.2s; }
.word:nth-child(3) { animation-delay: 2.4s; }
```

### B2.4 循环/重复动画填充静默时段

当口播持续 12s+ 且画面核心动作完成后仍有剩余时间（如口播在解释背景，画面已展示完核心流程）：

- 在画面边缘叠加重复脉冲 / 扫描线 / 呼吸光晕（不影响主体阅读）
- 用 `infinite` 循环动画填充，但`必须是非干扰性的`（低 opacity、小幅度）

### B2.5 自检清单追加项

在完工自检（附录 A）中追加：

- [ ] 口播 > 150 字的 step，画面是否用了 ≥1 种步内动态策略（B2.1-B2.4）
- [ ] 步内动画总时长是否 ≈ 口播时长（超出会被 Auto 模式切断）
- [ ] 逐项介绍的 step 是否各自独占全屏（焦点放大），而非全部摊开

---

## 附录 C：5 个公共组件（src/components/，templates 已含）

> 1.6 课件开发**自然沉淀**出 5 个通用构建积木，零外部依赖，跨主题/跨领域复用。
> 全部加 `data-no-advance` 防误触推进。

### C.1 AnimatedNumber — 数字 ease-out-quart 滚动入场

```tsx
import { AnimatedNumber } from "../../components/AnimatedNumber";

<AnimatedNumber value={200} suffix="亿" />
<AnimatedNumber value={60} suffix="%" />
<AnimatedNumber value={1.5} decimals={1} />
```

| Prop | 类型 | 默认 | 说明 |
|------|------|------|------|
| `value` | number | (必填) | 目标数字 |
| `duration` | number | 1400 | 动画时长 ms |
| `prefix` / `suffix` | string | "" | 前缀/后缀（"亿" / "%" / " 天"） |
| `decimals` | number | 0 | 小数位数 |
| `delay` | number | 0 | 启动延迟（多数字 stagger 时用） |

### C.2 BpmnFlow — 流程图节点（reveal 顺序 + killed 划线 + focused 高亮）

```tsx
import { BpmnFlow, FlowNode } from "../../components/BpmnFlow";

<BpmnFlow
  nodes={[
    { id: "A", label: "客户报案", kind: "start" },
    { id: "B", label: "人工派单", kind: "task" },
    { id: "C", label: "金额判断", kind: "decision" },
    { id: "D", label: "AI 审批", kind: "task", killed: true },
  ] as FlowNode[]}
  revealOrder={["A", "B", "C"]}
  step={currentStep}
  focusedId="B"
/>
```

| Prop | 类型 | 说明 |
|------|------|------|
| `nodes` | `FlowNode[]` | 节点数组（id / label / kind / active / killed） |
| `revealOrder` | string[] | 按 step 揭示的 id 顺序 |
| `step` | number | 当前 step（驱动 reveal） |
| `focusedId` | string | 当前讲解的节点 id（高亮） |

**注意**：横向布局。复杂分支需 BpmnFlowAdvanced（待开发）。

### C.3 FlippableCard — 3D 翻转卡片

```tsx
import { FlippableCard } from "../../components/FlippableCard";

<FlippableCard
  front={<div className="front">正面：问题</div>}
  back={<div className="back">背面：答案</div>}
/>
```

典型场景：闪卡 / 单词记忆 / 测验 / 概念对位。

### C.4 StaggeredAppear — 序列入场（stagger delay 控制）

```tsx
import { StaggeredAppear } from "../../components/StaggeredAppear";

<StaggeredAppear stagger={200} initialDelay={100}>
  <CardA />
  <CardB />
  <CardC />
</StaggeredAppear>
```

| Prop | 类型 | 默认 | 说明 |
|------|------|------|------|
| `stagger` | number | 200 | 子元素间隔 ms |
| `initialDelay` | number | 0 | 首个子元素延迟 ms |
| `slideIn` | boolean | true | 是否滑入（false = 仅淡入） |

### C.5 TabSwitcher — 标签页切换

```tsx
import { TabSwitcher } from "../../components/TabSwitcher";

<TabSwitcher
  tabs={[
    { id: "A", label: "定义", content: <div>...</div> },
    { id: "B", label: "案例", content: <div>...</div> },
  ]}
  defaultActiveId="A"
/>
```

**注意**：所有 panel 同 DOM 渲染（CSS 切显隐），所以动画状态不会重置。

---

## 附录 D：验收时长统计脚本

`scripts/chapter-stats.py` 自动从 `audio-segments.json` 算出每章 / 每段时长。**每次验收前必跑**。

```bash
# 整课统计
python3 scripts/chapter-stats.py --file presentation/audio-segments.json

# 只看某段
python3 scripts/chapter-stats.py --file presentation/audio-segments.json --section S1

# 只看某课程前缀（如 t6）
python3 scripts/chapter-stats.py --file presentation/audio-segments.json --section t6

# JSON 输出（供其他脚本消费）
python3 scripts/chapter-stats.py --file presentation/audio-segments.json --json
```

| 参数 | 默认 | 说明 |
|------|------|------|
| `--file` | `presentation/audio-segments.json` | segments 文件路径 |
| `--section` | (无) | 过滤段名（S1-S5）或课程前缀（t6/t2） |
| `--audio-ms` | 380 | 每字毫秒（翁老师录音语速） |
| `--visual-s` | 1.5 | 每步视觉过渡秒数 |
| `--json` | false | 输出 JSON |

**验收报告必含**（参考 `IMPROVEMENT-NOTES.md` C3）：
- 本段 narrations 总数
- 总字数（中文）
- 纯朗读时长（380ms/字）
- 视频估算时长（+ 视觉过渡 1.5s/步）
- 5 维对位自检结果（附录 A）
- 已修复 bug 清单
