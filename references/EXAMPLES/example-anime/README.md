# Anchor: example-anime (4 大共性综合示范)

> **何时读**: 你写完章节基础内容 (skeleton + narrations), 现在要加"有灵魂"的动画, 需要看完整 4 大共性综合范例。**不读** 也能写, 但你大概率会写出"线条+形状"死板套路。
> **何时不读**: 你的章节只是"普通入场/出场", 动画不超过 5 个 `animate()` 调用 — 用 ANIMEJS-GUIDE.md §4 基础 5 封装 + onScroll 即可。
> **完整使用指南**: `../ANIMEJS-GUIDE.md` (4 大共性 + 3D + 流体 + 字符级 详细分模式)

## 4 大共性 (硬约束 #6 lint 必查)

LLM agent 写动画时, 必须满足至少 2/4 项:

| 共性 | 含义 | 关键 API |
|---|---|---|
| **1. 随机化** | 每个元素用 `utils.random()` 起始位置/旋转/缩放, 不要全场统一 | `utils.random()`, `utils.randomPick([eases])` |
| **2. 持续循环** | `onComplete: () => animate()` 链式, 永远在动, 不用 `loop: true` | `createTimeline({ onComplete: () => animate() })` |
| **3. 多 keyframe** | 5+ keyframe 串成"弹入-回弹-就位"完整节奏, 不用简单 [0, 1] | `keyframes: [{to, duration, ease}, {to, duration, ease}, ...]` |
| **4. 独立 stagger** | 每个元素从不同时间点开始入场, 配合 `from: 'center' | 'last' | 'random'` | `stagger(N, { from: 'center', grid: [rows, cols] })` |

**反例** (满足 0-1 项 = 死板):
- `animate('.node', { opacity: [0, 1], y: [20, 0], delay: 0 })` (1 项 stagger, 其他都统一)
- `loop: true` 配固定动画 (0 持续循环, 每次循环都一模一样)
- `keyframes: [{to: 1}]` 单 keyframe (0 多 keyframe)
- 所有元素同时入场 (0 独立 stagger)

**合格** (满足 2-3 项): 至少 2 个元素 + 随机化 + 持续循环
**优秀** (满足 4 项): 字符级 v4 logo 范式 / 流体 layered-css-transforms 范式

## 文件结构

```
example-anime/
├── README.md       ← 本文件 (4 大共性指南 + 何时读)
├── chapter.tsx     ← 完整章节示例 — 4 大共性综合示范
└── chapter.css     ← 配套 CSS (fallback, 主体动画用 animejs)
```

## 假设的 outline.md 章节段 (抽象, 30 步)

```markdown
## 3. example-anime — <章节标题> (30 steps · ~140s)

- **step 1-3** (~15s) — 报头 + kicker + 承上
- **step 4-7** (~20s) — ★ 视觉演示 #1: 字符级 stagger (4 大共性 #2+#3+#4)
- **step 8-11** (~20s) — ★ 视觉演示 #2: SVG 描线 (4 大共性 #2 持续循环)
- **step 12-17** (~30s) — ★ 互动 1: 拖拽节点到 drop zone
- **step 18-22** (~25s) — ★ 视觉演示 #3: 流体循环装饰 (4 大共性 #1+#2+#4)
- **step 23-27** (~25s) — ★ 互动 2: 拖拽排序 4 张卡片
- **step 28-30** (~15s) — 收尾 + IP 署名
```

## 关键节奏决策

| step | 节奏意图 | 4 大共性 | 视觉 |
|---|---|---|---|
| 4-7 | 字符级入场 (从中心 stagger 弹入, 弹-回-就位) | #2 (5+ keyframe 时间线) + #3 (多 keyframe) + #4 (from: 'center') | 1 行 keyframes + stagger |
| 8-11 | SVG 路径描线 (持续循环) | #2 (循环链式) | `svg.createDrawable` |
| 12-17 | 拖拽到 drop zone | #4 (从中心 stagger 抖动) | `Draggable` + onDrop |
| 18-22 | 流体循环装饰背景 | #1 (随机) + #2 (onComplete 链式) + #4 (stagger 启动时机) | 6 形状持续漂动 |
| 23-27 | 拖拽排序 4 张卡片 | #4 (stagger 1 错开延迟 1ms) | `Draggable` + releaseEase |

## 为什么每屏都用 `useEffect([step])` 启动动画

animejs 是**命令式库** (`animate()` 即播放), 但 course-forge 是 **step 驱动** (React `if (step >= N)`)。

**关键**:
- 在 `useEffect([step])` 里启动, 离开 step 时 `revert()`
- 不 `revert()` → 动画**累积到下一屏**, 导致"这一屏的图还没说完就接着动下一屏" = 灾难

## 完整章节代码 (4 大共性综合)

> **关键**: 30 步 1 章 5 屏. 每屏 1 个核心视觉演示, 全部满足 4 大共性中至少 2 项.
> 字符级入场 (4-7), SVG 描线循环 (8-11), 流体背景 (18-22) 是 3 个核心示范.
> 拖拽互动 (12-17, 23-27) 复用 §4 基础封装.

### 屏 2: 字符级 stagger (4-7 步)

```tsx
// 字符拆解
function wrapInSpan(target: HTMLElement) {
  let wrappedText = '';
  for (const char of target.textContent) {
    wrappedText += `<span>${char === ' ' ? '&nbsp;' : char}</span>`;
  }
  target.innerHTML = wrappedText;
}

// 5 段 keyframe 时间线 (★ 4 大共性 #2 #3 #4)
useEffect(() => {
  if (step !== 4) return;
  const tl = createTimeline({ defaults: { ease: 'inOutQuint', duration: 600 } });
  tl.add('.exa-chars span', {
    translateY: [
      { to: [35, -80], duration: 190, ease: 'outQuad' },
      { to: 4, duration: 120, delay: 20, ease: 'inQuad' },
      { to: 0, duration: 120, ease: 'outQuad' }
    ],
    scaleX: [
      { to: [.25, .85], duration: 190, ease: 'outQuad' },
      { to: 1.08, duration: 120, delay: 85, ease: 'inOutSine' },
      { to: 1, duration: 260, delay: 25, ease: 'outQuad' }
    ],
    scaleY: [
      { to: [.4, 1.5], duration: 120, ease: 'outSine' },
      { to: .6, duration: 120, delay: 180, ease: 'inOutSine' },
      { to: 1.2, duration: 180, delay: 25, ease: 'outQuad' },
      { to: 1, duration: 190, delay: 15, ease: 'outQuad' }
    ],
    duration: 400,
    ease: 'outSine',
  }, stagger(80, { from: 'center' }))  // ★ 共性 #4
  .init();
  return () => tl.revert();
}, [step]);
```

### 屏 3: SVG 描线持续循环 (8-11 步)

```tsx
// SVG 描线 + onComplete 链式循环 (★ 共性 #2)
useEffect(() => {
  if (step !== 8) return;
  const drawable = svg.createDrawable('.exa-line', 0, 1200);
  const anim = animate(drawable, {
    draw: '0 1',
    duration: 1200,
    ease: 'inOutQuart',
    onComplete: () => {
      // 链式再启动 — 持续循环
      drawable.draw(0);
      anim.restart();
    },
  });
  return () => anim.revert();
}, [step]);
```

### 屏 5: 流体循环装饰 (18-22 步)

```tsx
// 6 形状 100 keyframes 永久循环 (★ 共性 #1 #2 #4)
useEffect(() => {
  if (step !== 18) return;
  const shapes = document.querySelectorAll('.exa-fluid-shape');
  shapes.forEach((el) => animateShape(el as HTMLElement));
  return () => {
    shapes.forEach((el) => {
      // 链式循环没法干净 revert, 用 stop
      utils.set(el, { translateX: 0, translateY: 0, rotate: 0 });
    });
  };
}, [step]);

function animateShape(el: HTMLElement) {
  const anim = createTimeline({
    onComplete: () => animateShape(el),  // ★ 共性 #2 链式
  })
  .add(el, {
    translateX: createKeyframes(() => utils.random(-40, 40)),  // ★ 共性 #1 随机
    translateY: createKeyframes(() => utils.random(-40, 40)),
    rotate: createKeyframes(() => utils.random(-180, 180)),
  }, 0)
  .init();
}

function createKeyframes(value: () => number) {
  const eases = ['inOutQuad', 'inOutCirc', 'inOutSine', createSpring()];  // ★ 多种 easing
  const keyframes = [];
  for (let i = 0; i < 100; i++) {
    keyframes.push({
      to: value(),
      ease: utils.randomPick(eases),
      duration: utils.random(300, 1600),  // ★ 共性 #1 随机时长
    });
  }
  return keyframes;
}
```

## 字符级 stagger 模式怎么配 .i4xxx 风格 class

| 模式 | 用什么 CSS | 用什么 animejs |
|---|---|---|
| 报头标题入场 | `font-size: 64px; font-weight: 700;` | `wrapInSpan` + 5 keyframe timeline + `stagger(80, { from: 'center' })` |
| 数字滚动 | `<span>` 内单数字 | 同上, scaleY 关键 |
| 词组拆解 | `<span>` 内单词 | 同上, translateX 更强 |
| 路径描线 | `<path stroke-dasharray="N">` | `svg.createDrawable(path)` + onComplete 链式 |
| 流体背景 | `<div>` 6+ 个小形状 | `createKeyframes` + `onComplete: animateShape` 链式 |

## 关键 token 保留

- 颜色/字体仍走 `var(--accent)` / `var(--font-display-cn)`
- animejs 动画**只动 transform / opacity / scale / stroke-dashoffset / filter** (不直接动颜色)
- 主题切换时动画不崩溃

## 完工自检 (写完每章**强制**执行)

### 硬约束 (自动 lint)

跑 `bash scripts/check-animejs-cohesion.py` (在 course-forge/scripts/), 检查 4 大共性中至少 2 项:

- [ ] 至少一个 `utils.random(...)` / `utils.randomPick(...)` 调用 (随机化)
- [ ] 至少一个 `onComplete: () => animate(...)` 或 `loop: true` 或 `alternate: true` (持续循环)
- [ ] 至少一个 `keyframes: [...]` 多 keyframe 时间线 (多 keyframe)
- [ ] 至少一个 `stagger(N, { from: 'center' | 'last' | 'random' })` (独立 stagger)

### 视觉自检

- [ ] 节点滚动、字符入场、SVG 描线**都动了** (不是静态)
- [ ] 拖拽节点**真的能拖**, 松手后回弹 + 吸附
- [ ] `?auto=1` 录屏模式动画照常播放
- [ ] 离开 step 时**动画清理干净** (不会"上一屏的图还在动")
- [ ] `narrations.ts` 存在且 `narrations.length` 严格 1:1 对应 `useChapterProgress(step, N)`
- [ ] `npx tsc --noEmit` 通过
- [ ] CSS 前缀 `.exa-` 独立 (不与本项目其他章冲突)
- [ ] token 仍走主题 (不硬编码 hex / 字体名)

### 4 大共性自检 (LLM agent 必查)

- [ ] 满足 2/4 项 = 合格 — 可继续
- [ ] 满足 3-4 项 = 优秀 — 范例级
- [ ] 0-1 项 = 退回 ANIMEJS-GUIDE.md §0 决策树, 重新选模式

## 不在 EXAMPLES 里出现的章节类型

- 数字型 hero ("+47%" → "几乎快了一倍") — 简单 CSS 即可
- 对比型 (前后对照 / 双柱图) — 简单 CSS 切换即可
- 链接卡片收尾 — 静态布局
- 章节报头/页脚印章 — 单一 `svg.createDrawable` 描线即可

→ 这些场景的视觉原语已在 `../CHAPTER-CRAFT.md` § 字体 / 配色 / 动画 / 留白 —— 视频演示基本审美 (CSS / SVG / Canvas / JS 全栈) 里覆盖.

## 下一步

- 真 3D 立体 → 看 `onscroll-sticky` + `auto-layout/periodic-table` (ANIMEJS-EXAMPLES-INDEX.md §1)
- 字符级范式 → 看 `animejs-v4-logo-animation` (ANIMEJS-EXAMPLES-INDEX.md §2)
- 流体循环 → 看 `layered-css-transforms` (ANIMEJS-EXAMPLES-INDEX.md §3)
- Three.js 集成 (不推荐) → 详见 ANIMEJS-GUIDE.md §6
