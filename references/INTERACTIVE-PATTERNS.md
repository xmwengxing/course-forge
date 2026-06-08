# 交互模式分类与设计指南 (Interactive Pattern Catalog)

> 基于 182 章生产级课件（ExamMaster ai-trainer-course）验证的交互设计模式。
> 本文档供 AI 课件开发时选用，分类汇总各种交互形式的设计理念、技术方案和使用场景。

---

## 一、分类总览

| 类别 | 英文 | 核心理念 | 典型场景 | 已验证章节数 |
|------|------|----------|---------|:--:|
| A. 点击揭示 | Click-to-Reveal | 点击元素 → 显示/隐藏注解 | 风险标注、展开详情、开关切换 | 4 |
| B. 状态切换 | State Toggle | 多状态循环切换 | 路径对比、着色模式、视图切换 | 3 |
| C. 对比裁决 | Comparison & Verdict | 双面板并排 + 裁决按钮 | 多模态冲突、方案对比、路径抉择 | 2 |
| D. 可展开链 | Expandable Chain | 逐层展开 → 递进揭示 | 降级链、优先级表、流程步骤 | 3 |
| E. 拖拽操纵 | Drag Manipulation | 指针拖拽 → 实时变换 | 3D旋转、连接线、排序 | 1 |
| F. 交互测验 | Interactive Quiz | 选项点击 + 即时反馈 | 弹题、知识检测、课后测验 | 5 |
| G. 步进揭示 | Progressive Reveal | step >= N 逐步展示 | 所有章节的基础模式 | 182 |
| H. 表格动画 | Animated Table | 逐行动画进入 + 条件高亮 | 审计清单、优先级表、对比表 | 4 |
| I. 脉冲动画 | Pulse Animation | 周期性脉冲引导注意 | 可点击元素提示、紧急警告 | 4 |
| J. 未来探索 | Future Explorations | 尚未实现但可验证的方案 | 拖拽连线、画布标注、语音交互 | 0 |

---

## 二、各类详解

### A. 点击揭示 (Click-to-Reveal)

**设计理念**：学员主动点击"探测"隐藏信息，把被动听讲转化为主动探索。

**技术方案**：
```tsx
const [revealed, setRevealed] = useState<number | null>(null);
const handleClick = (id: number) => {
  setRevealed(revealed === id ? null : id); // 点击切换
};

<button onClick={() => handleClick(id)} data-no-advance>
  点击探测
  {revealed === id && <Popover>{info}</Popover>}
</button>
```

**关键约束**：
- 所有交互元素必须加 `data-no-advance`，防止误触推进到下一步
- 气泡/弹出内容使用 `animation: bubble-in .3s` 缩放动画
- 弹出内容不能遮挡父元素之外的姐妹元素

**已验案例**：
- `t8-swimlane-interact` — 点击泳道边界线，弹出风险气泡（4个边界，高/中/低风险分级）
- `t8-fallback-chain` — 点击每级降级节点，展开技术方案详情

**适用场景**：风险审计图、流程注释、隐藏提示、知识卡片翻转

---

### B. 状态切换 (State Toggle)

**设计理念**：同一区域在不同状态下展示不同信息，学员通过按钮切换观察变化。

**技术方案**：
```tsx
const [mode, setMode] = useState<"A" | "B">("A");

<div className="view" data-mode={mode}>{/* content changes with mode */}</div>
<button onClick={() => setMode("A")} data-no-advance>A模式</button>
<button onClick={() => setMode("B")} data-no-advance>B模式</button>
```

**关键约束**：
- 切换必须发生在同一视觉位置，避免页面跳动
- 活跃按钮高亮（`--active` class），非活跃半透明
- CSS transition 平滑过渡，不要瞬间闪现

**已验案例**：
- `t5-3d-explore` — 高度着色 vs 反射率着色（`height` / `intensity`）
- `t8-circuit-breaker` — 熔断器三态切换（关闭→打开→半开，step 推进式展示）

**适用场景**：着色模式切换、视角切换、版本对比、Before/After

---

### C. 对比裁决 (Comparison & Verdict)

**设计理念**：两个对立的方案/路径并排展示，学员先分别点击探索，再触发"裁决"看最终结论。

**技术方案**：
```tsx
const [selected, setSelected] = useState<"left" | "right" | null>(null);
const [verdict, setVerdict] = useState(false);

<div style={{ display: "flex", gap: 30 }}>
  <Panel side="left" selected={selected === "left"} verdict={verdict} />
  <button onClick={() => setVerdict(true)} data-no-advance>VS</button>
  <Panel side="right" selected={selected === "right"} verdict={verdict} />
</div>
{verdict && <VerdictBanner>{result}</VerdictBanner>}
```

**关键约束**：
- 未选中路径 `opacity: 0.4` — 视觉上明确指示"未被采纳"
- 被否决路径加删除线或红色叉号覆盖
- VS 按钮使用脉冲动画引导学员点击
- 裁决结果区域用高对比色渲染

**已验案例**：
- `t8-arbitration-court` — 文本路径 vs 化验单路径 → 点击 VS 触发仲裁 → 否决/生效动画
- `t8-modal-conflict` — 纯展示版对比（无裁决交互）

**适用场景**：多模态冲突裁决、方案A/B对比、架构演进Before/After

---

### D. 可展开链 (Expandable Chain)

**设计理念**：垂直方向串联多个节点，点击展开详情。每层设计动机比公式更重要。

**技术方案**：
```tsx
const [expanded, setExpanded] = useState<string | null>(null);

<div className="chain">
  {levels.map((lvl) => (
    <div key={lvl.id}>
      <button onClick={() => setExpanded(expanded === lvl.id ? null : lvl.id)} data-no-advance>
        <span className="level-id">L{lvl.id}</span>
        <span className="level-label">{lvl.label}</span>
        <span className="level-tech">{lvl.tech}</span>
        <span className="toggle">{expanded === lvl.id ? "▲" : "▶"}</span>
      </button>
      {expanded === lvl.id && <div className="detail">{lvl.detail}</div>}
    </div>
  ))}
</div>
```

**关键约束**：
- 每层之间用 `▼` 或 `→` 连接，明确层级递进关系
- 颜色从顶到底逐步变化（从 `--accent-tech` 到 `--accent-good` 到 `--accent-warn`）
- 展开内容用虚线边框区分于标题

**已验案例**：
- `t8-fallback-chain` — 三级降级链（L1本地引擎 → L2静态页 → L3人工绿通）
- `t8-life-blood-veto` — 优先级规则表（逐行动画进入）
- `t8-expose-boundary` — 脆弱边界审计清单（逐行动画 + 条件高亮）

**适用场景**：降级链、优先级规则、操作步骤、层级分类

---

### E. 拖拽操纵 (Drag Manipulation)

**设计理念**：Pointer Events API 实现零依赖拖拽旋转/移动/连线。

**技术方案**：
```tsx
const [dragging, setDragging] = useState(false);
const [lastPos, setLastPos] = useState({ x: 0, y: 0 });
const [rotation, setRotation] = useState({ rx: 0, ry: 0 });

const onPointerDown = useCallback((e: PointerEvent) => {
  (e.target as HTMLElement).setPointerCapture(e.pointerId);
  setDragging(true);
  setLastPos({ x: e.clientX, y: e.clientY });
}, []);

const onPointerMove = useCallback((e: PointerEvent) => {
  if (!dragging) return;
  const dx = e.clientX - lastPos.x;
  const dy = e.clientY - lastPos.y;
  setLastPos({ x: e.clientX, y: e.clientY });
  setRotation(r => ({ rx: clamp(r.rx - dy * 0.4, -70, 10), ry: r.ry + dx * 0.4 }));
}, [dragging, lastPos]);
```

**关键约束**：
- 必须使用 `setPointerCapture` 确保鼠标移出元素后仍能跟踪
- 方向敏感：Y 轴反向（-dy），X 轴正向（+dx）
- 角度 clamp 防止翻转倒挂
- 容器加 `user-select: none` 防止拖拽时选中文字
- 拖拽区域加 `data-no-advance`

**已验案例**：
- `t5-3d-explore` — 拖拽旋转 3D 点云场景（~300 个点，Y轴反向 + X轴正向）

**扩展方向**（未实现）：
- 拖拽连线：拖拽源节点到目标节点画连接线
- 排序拖拽：拖拽列表项重新排序
- 缩放拖拽：双指或鼠标滚轮缩放

---

### F. 交互测验 (Interactive Quiz)

**设计理念**：即时反馈的选项点击测验，答对绿色高亮、答错红色高亮 + 显示解析。

**技术方案**：
```tsx
const [picks, setPicks] = useState<(number | null)[]>(Array(N).fill(null));

{questions.map((q, qi) => (
  <div key={qi} className={`q ${step >= qi + 1 ? "in" : ""}`}>
    <div className="q-title">{q.title}</div>
    {q.opts.map((opt, oi) => (
      <button
        key={oi}
        className={`opt ${picks[qi] === oi ? (oi === q.correct ? "right" : "wrong") : ""}`}
        onClick={() => { const n = [...picks]; n[qi] = oi; setPicks(n); }}
        data-no-advance
      >{opt}</button>
    ))}
    {picks[qi] !== null && <div className="feedback">{...}</div>}
  </div>
))}
```

**关键约束**：
- 每题 `step >= qi+1` 渐进展示，不要一次性全出
- 正确选项绿色边框 + 绿色背景，错误选项红色
- 反馈文字显示解析，不仅仅是"对/错"
- 按钮加 `className` 而非内联 style（更流畅的过渡）

**已验案例**：
- `t4-quiz` — 2题：采样率 + 声道处理
- `t8-final-quiz` — 2题：仲裁庭规则 + 降级设计
- `t5-point-quiz` — 2题：反射率 + LiDAR遮挡
- `t2-quiz`, `t3-quiz` — 各章节弹题

**适用场景**：过程性评价、课后测验、知识点自检

---

### G. 步进揭示 (Progressive Reveal)

**设计理念**：每步只展示当前口播对应的画面内容，避免信息过载。

**技术方案**：
```tsx
{step >= 0 && <ElementA className="anim-in" />}
{step >= 1 && <ElementB className="anim-in" />}
{step >= 2 && <ElementC className="anim-in" />}
```

**关键约束**：
- 每个新出现的元素使用 `fadeIn + translateY(12px→0)` 动画
- 动画时长 0.4-0.6s，使用 `var(--ease-quart)` 缓动
- 不同步的元素可以错开 0.1-0.2s 的 animation-delay
- 避免在某一步展示超过 3 个新元素（保持画面清爽）

**适用范围**：这是所有 182 章的基础机制，所有新章节都必须遵循。

---

### H. 表格动画 (Animated Table)

**设计理念**：表格行逐行动画进入，配合条件高亮展示风险/优先级等级。

**技术方案**：
```tsx
const rows = [/* data */];

<div className="table">
  {rows.map((r, i) => (
    <div key={r.id} className={`row ${i <= visible ? "row--visible" : ""}`}>
      {/* cells */}
    </div>
  ))}
</div>

// CSS:
.row { opacity: 0; }
.row--visible { animation: row-in .5s var(--ease-quart) both; }
.row:nth-child(2).row--visible { animation-delay: 0s; }
.row:nth-child(3).row--visible { animation-delay: .15s; }
```

**关键约束**：
- 每行 animation-delay 递增 0.15s（视觉流速感）
- 表头行始终可见，不受 step 控制
- 高优先行用 `--accent-deep` / `--accent-warn` 颜色区分

**已验案例**：
- `t8-expose-boundary` — 脆弱边界审计清单（4行，3个动画步进）
- `t8-life-blood-veto` — 优先级规则表（3行，逐行动画）

**适用场景**：风险清单、优先级表、对比表、检查列表

---

### I. 脉冲动画 (Pulse Animation)

**设计理念**：通过周期性脉冲动画引导学员注意力到可交互元素。

**技术方案**：
```css
@keyframes pulse {
  from { box-shadow: 0 0 4px var(--color); }
  to { box-shadow: 0 0 24px var(--color); }
}
.clickable { animation: pulse 1.5s ease infinite alternate; }
```

**关键约束**：
- 脉冲周期 1-2s，太短视觉疲劳
- 仅对一个核心交互元素使用——不要满屏都在闪
- 脉冲色与元素语义匹配（警告用橙，危险用红）

**已验案例**：
- `t8-snow-scenario` — API超时故障闪烁
- `t8-arbitration-court` — VS 按钮脉冲引导点击
- `t8-greentunnel` — 红色按钮呼吸灯
- `t8-fallback-chain` — 故障节点闪烁

**适用场景**：可点击提示、紧急警告、进行中状态

---

## 三、设计原则总结

| 原则 | 说明 |
|------|------|
| **自主探索 > 被动观看** | 让学员点击/拖拽来发现信息，比直接展示更有记忆深度 |
| **一次只做一件事** | 同一个 step 中交互元素不超过 2 个，避免选择困难 |
| **反馈必须即时** | 点击后立刻看到变化（< 100ms），不要有延迟动画 |
| **非破坏性操作** | 学员的所有操作（点错、拖错）都可以撤销，不要永久改变状态 |
| **data-no-advance 安全网** | 所有交互元素必须加此属性，防止误触推进到下一章 |
| **渐进复杂度** | 简单场景用点击揭示（A类），进阶用状态切换（B类），高阶用对比裁决（C类） |
| **颜色语义** | 用 `--accent-tech`（技术）、`--accent-good`（正确/安全）、`--accent-warn`（风险）、`--accent-deep`（严重/否决）保持语义一致 |

---

## 四、快速选型表

| 你想要... | 推荐模式 | 复用组件 |
|-----------|:------:|:------:|
| 学员点一下看注释 | A. 点击揭示 | — |
| 切换两种视图/模式 | B. 状态切换 | — |
| 两种方案对比+谁赢 | C. 对比裁决 | `ComparisonPanel` |
| 多级递进展开 | D. 可展开链 | `Accordion` |
| 拖拽旋转物体 | E. 拖拽操纵 | — |
| 随堂选择题 | F. 交互测验 | `Quiz` |
| 表格逐行出现 | H. 表格动画 | `StaggeredList` |
| 引导点击注意力 | I. 脉冲动画 | CSS class 引用 |
| 多状态切换图 | B + G | `CircleStateDiagram` |

---

## 五、创新方向（待验证）

### 5.1 拖拽连线 (Drag-to-Connect)
- 拖拽源节点到目标节点，绘制连线
- 使用 SVG `<line>` 或 Canvas 绘制路径
- 适用场景：流程图补全、依赖关系学习、连线题

### 5.2 画布标注 (Canvas Annotation)
- 学员在图片/图表上点击添加标注点
- 每个标注点显示文字注释
- 适用场景：架构图标注练习、错误定位

### 5.3 滑块演算 (Slider Demonstration)
- 拖动滑块改变参数，实时看结果变化
- 适用场景：阈值调整、模型参数影响、时间线推进

### 5.4 拖拽排序 (Drag-to-Sort)
- 拖放列表项重新排序
- 适用场景：流程步骤排序、优先级排序、SOP 步骤顺序

### 5.5 语音/按键响应 (Voice/Key Response)
- 配合 `?auto=1` 模式的 SPACE 一键推进自动播放
- 可在 step 中间插入"按任意键继续"的暂停点
- 适用场景：启发式设问、学员自定节奏

---

## K. 直接操控演示（Direct Manipulation Demo）

**设计理念**：学员通过按钮/控件直接驱动画面元素的行为，实时看到操控结果。不是"看演示"，而是"亲手操控演示"——通过体验式操作建立对抽象概念的直觉理解。儿童编程课程优先使用此模式。

**技术方案**：
```tsx
const [pos, setPos] = useState({ x: 0, y: 0 });
const [speed, setSpeed] = useState(1);

// D-pad 式 — 增量操控（每次 ±固定值）
<button onClick={()=>setPos(p=>({...p, x: p.x+10}))} data-no-advance>→ 向右</button>

// 预设按钮式 — 离散跳转（直接到指定值）
{[0, 100, -100, 200, -200].map(v =>
  <button onClick={()=>setPos({x:v, y:0})} data-no-advance>X: {v}</button>
)}

// 滑块式 — 连续调参
<input type="range" min={0} max={7} value={speed} onChange={e=>setSpeed(+e.target.value)} data-no-advance />

// 视觉反馈 — 元素实时跟随 state
<div style={{ left: pos.x, top: pos.y, transition:'all .4s var(--ease-overshoot)' }}>🐱</div>
```

**关键约束**：
- 操控按钮/滑块必须加 `data-no-advance`，防止误触推进 step
- 操作结果**即时可见**（CSS transition 或 instant update）
- 每种操控只绑定一个核心概念（坐标 / 颜色 / 方向 / 速度），不堆砌
- 可选：加数值显示面板，让学员看到"操控动作 → 数值变化 → 视觉反馈"的量化链路

**已验证案例**：
- 坐标网格 + D-pad 方向按钮 → 理解坐标与指令的对应关系
- 预设坐标按钮 → 小猫瞬移到指定位置 → 理解绝对坐标
- 速度滑块 → 猫的走路动画速度实时变化 → 理解 CPU 速度差异
- 钢琴键盘按钮 → 按下键即发音 → 理解键盘事件与音符播放

**适用场景**：抽象概念需要"亲手操控才能建立直觉"时使用——坐标系统、
参数调谐、速度变化、颜色合成、物理过程演示。

---

*初代版本 v1.0 — 基于 ExamMaster 182 章课件验证。持续开发中积累新模式后改进。*
