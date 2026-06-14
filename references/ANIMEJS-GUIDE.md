# Anime.js v4 基本应用技巧

> **什么时候读**：你准备给章节加"真正动画"或"物理级拖拽"时
> **适用版本**：`animejs ^4.4.1`
> **本文档性质**：animejs v4 API 用法 + step 驱动清理模式 + token 主题隔离 + 性能与可访问性
> **不包含**：具体动画设计套路（"节点滚动 / 柱状图 grow / 描线排序" 等是某一项目的设计选择，**不构成标准答案**；按你的内容自由设计）

---

## 1. 为什么用 animejs

| 痛点 | 手写 CSS keyframes / Pointer Events | animejs |
|---|---|---|
| 50 个节点依次揭示 | 50 行 `nth-child` 错开 delay | 1 行 `delay: stagger(50)` |
| SVG 路径描线 | 手算 `stroke-dashoffset` + keyframe | 1 行 `createDrawable()` |
| 拖拽带 spring 回弹 | 80 行 Pointer Events + 物理公式 | 1 行 `draggable(target, { releaseEase: 'outElastic(1, .8)' })` |
| 动画 pause/revert | 难 | `animation.revert()` / `.pause()` |
| 错开延迟计算 | `nth-child(n) { animation-delay: calc(n * 50ms) }` | `stagger(50, { from: 'center' })` |
| 沿路径运动 | 手算 SVG path 多个点 + setTimeout 链 | `createMotionPath()` 自动 |
| 颜色 / SVG / JS Object | 写 3 套 keyframes | 同一套 API |

**性能**：animejs v4 用 **WAAPI（Web Animations API）** 后端，浏览器原生加速，比 CSS 动画更省 CPU。

**包大小**：`animejs` ~80KB gzip，一次性 cost。

---

## 2. 安装与初始化

### 2.1 自动安装（推荐）

`scripts/scaffold.sh` 已自动在 Vite scaffold 后追加 `npm install animejs`。**新课件项目零配置**。

### 2.2 手动安装

```bash
cd <project>
npm install animejs
```

### 2.3 TypeScript 类型

animejs v4 自带完整 TypeScript 类型。无需 `@types/animejs`。

---

## 3. 5 大常用封装

### 3.1 元素级动画 — `animate()`

```ts
import { animate } from 'animejs';

// 单个元素：透明度 0→1 渐显
animate('.chapter-elem', { opacity: [0, 1], duration: 400 });

// 多个节点错开揭示（替代 50 行 nth-child）
animate('.chapter-nodes', {
  opacity: [0, 1],
  scale: [0, 1],
  delay: stagger(50),
  duration: 300,
  ease: 'outBack',
});
```

### 3.2 时间线编排 — `timeline()`

```ts
import { animate, createTimeline } from 'animejs';

const tl = createTimeline({ defaults: { duration: 600 } });
tl.add('.chapter-a', { x: [-100, 0], opacity: [0, 1] });
tl.add('.chapter-b', { x: [-100, 0], opacity: [0, 1] }, '-=300');  // 提前 300ms 接续
tl.add('.chapter-c', { x: [-100, 0], opacity: [0, 1] }, '-=300');
```

### 3.3 拖拽 — `draggable()`

```ts
import { Draggable } from 'animejs';

const drag = Draggable.create('.chapter-card', {
  container: '.chapter-stage',
  releaseEase: 'outElastic(1, .8)',   // 松手 spring 回弹
  onRelease: (self) => { /* 落到正确位置判定 */ },
});

// 离开 step 时清理
drag[0].disable();
```

### 3.4 SVG 路径动画 — `svg.createDrawable()` / `svg.createMotionPath()`

```ts
import { animate, svg } from 'animejs';

// 路径描线（任何"线"动画的通用解法）
const drawable = svg.createDrawable('.chapter-line', 0, 600);
drawable.draw(0, '100%');  // 0ms 起点 → 600ms 终点

// 沿路径运动（任何"沿轨道动"动画的通用解法）
const mp = svg.createMotionPath('.chapter-path');
animate('.chapter-mover', {
  ...mp,
  duration: 1500,
  loop: true,
  ease: 'inOutSine',
});
```

### 3.5 错开延迟 — `stagger()`

```ts
import { animate, stagger } from 'animejs';

animate('.chapter-list > *', {
  y: [20, 0],
  opacity: [0, 1],
  delay: stagger(100),                // 100ms 错开
  duration: 400,
});

// 从中心向外错开
animate('.chapter-radial', {
  scale: [0, 1],
  delay: stagger(50, { from: 'center' }),
});

// 反向错开
animate('.chapter-list', {
  y: [0, -20],
  delay: stagger(80, { from: 'last' }),
});
```

---

## 4. 与 course-forge step 驱动配合

animejs 是**命令式库**（调用 `animate()` 即播放），但 course-forge 是 **step 驱动**（React `if (step >= N)` 模式）。

**关键模式**：在 `useEffect` 里启动动画，依赖 `[step]`，**离开 step 时 revert**（避免动画累积到下一屏）。

```tsx
import { useEffect, useRef } from 'react';
import { animate, stagger, svg, Draggable } from 'animejs';
import { useChapterProgress } from '../../hooks/useChapterProgress';

export default function MyChapter({ step }: { step: number }) {
  useChapterProgress(step, 30);

  // ★ 节点滚动：步 8-13 期间启动，离开时 revert
  useEffect(() => {
    if (step >= 8 && step <= 13) {
      const anim = animate('.chapter-nodes', {
        opacity: [0, 1],
        scale: [0, 1],
        delay: stagger(50),
        duration: 300,
        ease: 'outBack',
      });
      return () => anim.revert();  // ★ 关键：离开 step 时清理
    }
  }, [step]);

  // ★ SVG 描线：步 14 触发
  useEffect(() => {
    if (step === 14) {
      svg.createDrawable('.chapter-line', 0, 1500);
    }
  }, [step]);

  // ★ 拖拽：步 20-26 期间挂载，离开时 disable
  useEffect(() => {
    if (step === 20) {
      const drag = Draggable.create('.chapter-card', {
        container: '.chapter-stage',
        releaseEase: 'outElastic(1, .8)',
      });
      return () => drag[0].disable();
    }
  }, [step]);

  return (
    <div className="chapter-root">
      {step === 0 && <Screen0Masthead />}
      {step >= 8 && step <= 13 && <ScreenNodes />}
      {/* ... */}
    </div>
  );
}
```

**重要**：`anim.revert()` 会把所有动画影响的属性**恢复到初始值**——这是清理动画的"正确"姿势，比手动 `style.opacity = ''` 干净 100 倍。

---

## 5. 与 token 主题配合

animejs 动画可以用 CSS 变量名，**但要保证变量在动画启动时已加载**：

```ts
// 方式 1：JS 读取 token（稳）
animate('.chapter-bar', {
  height: '100%',
  backgroundColor: getComputedStyle(document.documentElement)
    .getPropertyValue('--accent').trim(),
});

// 方式 2：CSS 写样式，animejs 只动 transform / opacity / scale（最稳）
// CSS:
//   .chapter-bar { background: var(--accent); height: 0; }
//   .chapter-bar.grew { height: 100%; }
// TS:
//   animate('.chapter-bar', { height: [0, '100%'] });
```

**推荐方式 2**：主题切换时动画不崩溃，token 永远从 CSS 来。

---

## 6. 性能与可访问性

- **性能**：animejs v4 用 WAAPI 后端，比手写 CSS 动画更省 CPU；批量 stagger 时浏览器自动合并图层
- **可访问性**：尊重 `prefers-reduced-motion`：
  ```ts
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reduced) {
    // 直接设为终态，不放动画
    document.querySelectorAll('.chapter-nodes').forEach(el => el.style.opacity = '1');
  } else {
    animate('.chapter-nodes', { opacity: [0, 1], delay: stagger(50) });
  }
  ```
- **录制模式**：`?auto=1` 录屏时 animejs 动画照常播放（动画时长与 TTS 时长自动协调：口播结束 → step++ → 动画到一半就跳，但 reveal 不强制等动画跑完）

---

## 7. 不要做的事

- ❌ **不要用 animejs 动章节里所有元素**（步进揭示 `step >= N` 仍是主要机制，animejs 只在需要"真正动画"时用）
- ❌ **不要在每屏都加 stagger 错开**（会显得碎；只在"批量元素同时入场"时用）
- ❌ **不要在 auto 模式禁用动画**（用户看 `?auto=1` 录屏时也要看到动画）
- ❌ **不要把 animejs 引入 SSR**（Vite 已配 client-only，但 React `useEffect` 里要确认）
- ❌ **不要用 `loop: true` 永久循环**（除闪烁/激光等视觉演示外，长时间循环动画会喧宾夺主）
- ❌ **不要在每章都用 animejs**（小章节 / 纯文字章节不需要，留给有视觉演示的章节）
- ❌ **不要照抄"线条 + 形状 + 物体"的固定套路**（节点滚动 / 柱状图 / 描线 / 排序只是某一项目的设计选择；按你的内容设计最贴切的视觉原语——"视频感最强的来源"是"动作语义匹配内容"，不是"线条 + 描线" 模板）

---

## 8. 故障排查

| 症状 | 原因 | 解决 |
|---|---|---|
| 动画不播放 | `useEffect` 没在 `step >= N` 时启动 | 检查 step 条件 |
| 动画累积到下一屏 | 离开时没 `revert()` | 在 `useEffect` 返回 `() => anim.revert()` |
| `?auto=1` 模式动画不完整 | 动画时长 > 口播时长 | 让 step 自动推进（不等动画）；如必要调短动画 |
| 颜色动画主题切换时崩溃 | 直接动 CSS 变量值 | 改为只动 `transform / opacity / scale` |
| 拖拽到边界外卡住 | 容器太小 | 调 `containerFriction: 0.9` 加摩擦 |
| 报错 `animate is not a function` | 装错版本（v3 改 v4 API） | 卸载 `npm uninstall animejs` → 装 `npm install animejs@^4.4.1` |

---

*文档版本 v1.0 — animejs v4 基本应用技巧（API + step 驱动 + token 主题 + 性能可访问性 + 故障排查）。不绑定任何具体项目的动画设计套路。*
