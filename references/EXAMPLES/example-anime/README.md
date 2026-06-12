# Anchor: example-anime（animejs v4 实战章节）

> ⚠️ **这是结构示意，不是抄袭模板**。先走 [`../../CHAPTER-CRAFT.md`](../../CHAPTER-CRAFT.md)
> Part 0 五问。本 anchor 给的是"用 animejs v4 实现真正动画与物理级拖拽"的结构骨架——**替代手写 CSS keyframes + 手写 Pointer Events**。你要保留它的 step 切分逻辑、用 animejs 的封装方式、动画时序原则，**按本项目的主题 + 内容换动作选型**。

> **完整使用指南**：见 [`../../ANIMEJS-GUIDE.md`](../../ANIMEJS-GUIDE.md)（animejs v4 实战指南）

## 定位

任何"需要真正动画"或"需要物理级拖拽"的章节：

- **节点滚动揭示**（50 个圆点依次出现）
- **柱状图 grow**（数字滚动 + 高度生长）
- **SVG 路径描线**（雷达扫描、地图连线、对勾绿）
- **闪烁循环**（红 X 提醒、激光穿透）
- **拖拽带 spring 回弹**（物理级手感的卡片 / 节点）
- **拖拽排序**（4 张卡片按正确顺序排好）
- **拖拽到 drop zone**（节点拖到删除区）

**vs 手写 keyframes 的优势**：

| 指标 | 手写 CSS | animejs |
|---|---|---|
| 50 个节点依次揭示 | 50 行 nth-child delay | 1 行 `stagger(50)` |
| SVG 描线 | 10 行 stroke-dashoffset | 1 行 `createDrawable()` |
| 拖拽 spring 回弹 | 80 行 Pointer Events | 1 行 `draggable()` |
| 离开 step 清理 | 难 | `anim.revert()` |

## 假设的 outline.md 章节段（抽象，30 步）

```markdown
## 3. example-anime — <章节标题>（30 steps · ~140s）

- **step 1-3** (~15s) — 报头 + kicker + 承上
- **step 4-7** (~20s) — ★ 视觉演示 #1:节点滚动（用 stagger 错开）
- **step 8-11** (~20s) — ★ 视觉演示 #2:柱状图 grow（用 createDrawable + scaleY）
- **step 12-17** (~30s) — ★ 互动 1:拖拽节点到 drop zone
- **step 18-22** (~25s) — ★ 视觉演示 #3:SVG 描线（用 createDrawable + stroke-dashoffset）
- **step 23-27** (~25s) — ★ 互动 2:拖拽排序（用 draggable + releaseEase + onDrop）
- **step 28-30** (~15s) — 收尾 + IP 署名
```

## 关键节奏决策

| step | 节奏意图 | 视觉 |
|---|---|---|
| 4-7 | 节点滚动揭示（替代 50 行 nth-child） | 1 行 `delay: stagger(50)` |
| 8-11 | 柱状图 grow | SVG 描线 + CSS height transition 双保险 |
| 12-17 | 拖拽节点到 drop zone | `draggable()` + `onDrop` 判定 |
| 18-22 | SVG 描线（5.4 全段地图用这种） | `svg.createDrawable()` |
| 23-27 | 拖拽排序（4 张卡片按顺序） | `draggable()` + `releaseEase: 'outElastic'` |

## 为什么每屏都用 `useEffect([step])` 启动动画

animejs 是**命令式库**（`animate()` 即播放），但 course-forge 是 **step 驱动**（React `if (step >= N)`）。

**关键**：
- 在 `useEffect([step])` 里启动，离开 step 时 `revert()`
- 不 `revert()` → 动画**累积到下一屏**，导致"这一屏的图还没说完就接着动下一屏" = 灾难
- 5.4 课件 S5 段 14 个手写 keyframes 没踩这个坑是因为 CSS keyframes 触发条件是 `className` 是否包含 `grew`，离开 step 时 `className` 切走，动画自动结束

## 文件结构

```
example-anime/
├── README.md       ← 本文件
├── chapter.tsx     ← 完整章节示例 —— animejs v4 实战
└── chapter.css     ← 配套 CSS（仅作 fallback，主体动画用 animejs）
```

## 完整章节代码

```tsx
// chapter.tsx
import { useEffect, useRef } from 'react';
import { animate, stagger, draggable, svg } from 'animejs';
import { useChapterProgress } from '../../hooks/useChapterProgress';
import './chapter.css';

// 30 步原生 step 范式
// 真视觉演示 3 处（每处用 animejs 替代手写 keyframes）：
//   1. 节点滚动（步 4-7，stagger 错开）
//   2. 柱状图 grow（步 8-11，createDrawable + scaleY）
//   3. SVG 描线（步 18-22，createDrawable）
// 互动 2 处（皆装饰式不阻塞 auto）：
//   互动 1: 拖拽节点到 drop zone（步 12-17）
//   互动 2: 拖拽排序 4 张卡片（步 23-27）

export default function ExampleAnime({ step }: { step: number }) {
  useChapterProgress(step, 30);
  const stageRef = useRef<HTMLDivElement>(null);

  // 视觉演示 1：节点滚动（步 4-7 期间启动，离开时 revert）
  useEffect(() => {
    if (step >= 4 && step <= 7) {
      const anim = animate('.exa-nodes circle', {
        opacity: [0, 1],
        scale: [0, 1],
        delay: stagger(50),                    // 替代 50 行 nth-child
        duration: 300,
        ease: 'outBack',
      });
      return () => anim.revert();
    }
  }, [step]);

  // 视觉演示 2：柱状图 grow（步 8-11）
  useEffect(() => {
    if (step >= 8 && step <= 11) {
      // SVG 描线（左→右）
      svg.createDrawable('.exa-bar-fill', 0, 1500);
      // CSS height transition 兜底（确保主题切换不崩）
      const bars = document.querySelectorAll<HTMLElement>('.exa-bar-fill');
      bars.forEach((bar, i) => {
        bar.animate(
          [{ height: '0%' }, { height: '100%' }],
          { duration: 1500, delay: i * 100, fill: 'forwards' },
        );
      });
    }
  }, [step]);

  // 互动 1：拖拽节点到 drop zone（步 12-17）
  useEffect(() => {
    if (step === 12) {
      const drag = draggable('.exa-drag-node', {
        container: '.exa-stage',
        releaseEase: 'outElastic(1, .8)',
        onRelease: (self) => {
          const dropZone = document.querySelector('.exa-drop-zone');
          if (dropZone && isInBounds(self, dropZone)) {
            // 节点被吃掉，触发删除
            self.$target.style.opacity = '0';
            self.$target.style.transform = 'scale(0)';
          } else {
            // 回到原位（spring 已在 releaseEase 处理）
          }
        },
      });
      return () => drag.disable();
    }
  }, [step]);

  // 视觉演示 3：SVG 描线（步 18-22）
  useEffect(() => {
    if (step >= 18 && step <= 22) {
      const drawable = svg.createDrawable('.exa-path-line', 0, 1200);
      drawable.draw(0, '100%');
    }
  }, [step]);

  // 互动 2：拖拽排序 4 张卡片（步 23-27）
  useEffect(() => {
    if (step === 23) {
      const drag = draggable('.exa-sort-card', {
        container: '.exa-stage',
        releaseEase: 'outElastic(1, .8)',
        snap: 200,                              // 200px 网格吸附
        onDrop: (self) => {
          // 判定卡片落在哪个槽位
          // ... (5.4 课件 842-i4-recap-mission 有完整实现可参考)
        },
      });
      return () => drag.disable();
    }
  }, [step]);

  return (
    <div className="exa-root" ref={stageRef}>
      <div className="exa-stage">
        {step === 0 && <Screen0Masthead />}
        {step >= 1 && step <= 3 && <ScreenIntro step={step} />}
        {step >= 4 && step <= 7 && <ScreenNodes />}
        {step >= 8 && step <= 11 && <ScreenBars />}
        {step >= 12 && step <= 17 && <ScreenDrag />}
        {step >= 18 && step <= 22 && <ScreenDraw />}
        {step >= 23 && step <= 27 && <ScreenSort />}
        {step >= 28 && step <= 29 && <ScreenOutro step={step} />}
      </div>
    </div>
  );
}

// 屏组件省略（同 5.4 课件其他章节）
// 详见 5.4 课件 840-i4-node-explode（互动 1）和 842-i4-recap-mission（互动 2）实际生产代码
```

## 关键手段（地板线）

| 维度 | 这个 anchor 怎么实现 |
|---|---|
| 节点滚动 | `animate('.exa-nodes circle', { opacity: [0, 1], scale: [0, 1], delay: stagger(50) })` |
| 柱状图 grow | `svg.createDrawable()` + `el.animate([{height:'0%'},{height:'100%'}], {duration: 1500, fill: 'forwards'})` 双保险 |
| SVG 描线 | `svg.createDrawable('.exa-path-line', 0, 1200).draw(0, '100%')` |
| 拖拽到 drop zone | `draggable()` + `onRelease` 判定 + `releaseEase: 'outElastic'` |
| 拖拽排序 | `draggable({ snap: 200 })` + onDrop 判定 + 对勾绿 `createDrawable` |
| 离开清理 | `useEffect` return `() => anim.revert()` / `drag.disable()` |

## 关键 token 保留

- 颜色/字体仍走 `var(--accent)` / `var(--font-display-cn)`
- animejs 动画**只动 transform / opacity / scale / stroke-dashoffset**（不直接动颜色）
- 主题切换时动画不崩溃

## 与 5.4 实际生产对照

5.4 课件 S5 段（840/841/842 三章）当前用**手写 CSS @keyframes**（共 14 个 keyframes）+ **手写 Pointer Events**（共 6 处自写互动）。**全部可用 animejs 1-3 行替代**。

| 5.4 实际手写代码 | 替代后 animejs 代码 | 行数对比 |
|---|---|---|
| 840 `nodeGrow` keyframe (40 行) | `animate(..., { opacity: [0,1], scale: [0,1], delay: stagger(50) })` | 40 → 3 |
| 841 `laserFire` SVG animate (15 行) | `svg.createMotionPath()` | 15 → 3 |
| 842 `lineDraw` keyframe (12 行) | `svg.createDrawable()` | 12 → 1 |
| 840 拖拽 5 节点到删除区 (80 行 Pointer Events) | `draggable()` (3 行) | 80 → 3 |
| 842 拖拽排序 4 张卡 (90 行 Pointer Events) | `draggable({ snap: 200 })` (3 行) | 90 → 3 |
| 842 `checkmarkDraw` keyframe (10 行) | `svg.createDrawable()` (1 行) | 10 → 1 |

**5.4 S5 段 200+ 行手写代码可压缩到 14 行**。**未来新章节优先用 animejs**（5.4 已完成不重做，迁移 ROI 低）。

## 完工自检（在浏览器点完一遍后逐项过）

- [ ] 节点滚动、柱状图 grow、SVG 描线**都动了**（不是静态）
- [ ] 拖拽节点**真的能拖**，松手后回弹 + 吸附
- [ ] 拖拽排序**4 张卡按正确顺序**显示对勾绿
- [ ] `?auto=1` 录屏模式动画照常播放（即使动画时长 > 口播时长也能跳到下一步）
- [ ] 离开 step 时**动画清理干净**（不会"上一屏的图还在动"）
- [ ] **narrations.ts 存在**且 `narrations.length` 严格 1:1 对应 `useChapterProgress(step, N)`
- [ ] **npx tsc --noEmit 通过**
- [ ] **CSS 前缀 `.exa-` 独立**（不与本项目其他章冲突）
- [ ] **token 仍走主题**（不硬编码 hex / 字体名）
- [ ] 章节交付时**主动告诉用户**："本章用了 animejs v4 真实动画，如主题切换请保留 transform / opacity 动画"

## 不在 EXAMPLES 里出现的章节类型

- 数字型 hero（"+47%" → "几乎快了一倍"）—— 5.4 已用 CSS keyframe 实现，无需 animejs
- 对比型（前后对照 / 双柱图）—— 简单 CSS 切换即可
- 链接卡片收尾—— 静态布局

→ 这些场景的视觉原语已在 [`../../CHAPTER-CRAFT.md`](../../CHAPTER-CRAFT.md) Part 3 视觉工具箱（CSS / SVG / Canvas / JS 全栈）里覆盖。
