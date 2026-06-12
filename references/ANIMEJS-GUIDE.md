# Anime.js v4 实战指南（Course Forge 动画库）

> **什么时候读**：你准备给章节加"真正动画"或"物理级拖拽"时
> **适用版本**：`animejs ^4.4.1`
> **替代**：手写 CSS `@keyframes`（繁琐）、手写 Pointer Events（容易出 bug）
> **状态**：v1.0（基于 5.4 课件 S1-S5 段 14 个 CSS keyframes + 6 处互动的实战落地总结）

---

## 1. 为什么用 animejs

| 痛点 | 手写 CSS keyframes | animejs |
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
animate('.i4xxx-elem', { opacity: [0, 1], duration: 400 });

// 50 个节点错开揭示（替代 50 行 nth-child）
animate('.i4xxx-nodes', {
  opacity: [0, 1],
  scale: [0, 1],
  delay: stagger(50),                 // 每个错开 50ms
  duration: 300,
  ease: 'outBack',                    // 带回弹的缓动
});

// 循环闪烁（红 X 提醒）
animate('.i4xxx-trap-x', {
  opacity: [1, 0.3, 1],
  scale: [1, 0.85, 1],
  duration: 1500,
  loop: true,
  ease: 'inOutSine',
});
```

### 3.2 时间线 — `timeline()`

```ts
import { timeline } from 'animejs';

const tl = timeline({ loop: false });
tl.add('.i4xxx-trap-1', { opacity: [0, 1], translateY: [20, 0] }, 0)
  .add('.i4xxx-trap-2', { opacity: [0, 1], translateY: [20, 0] }, 300)
  .add('.i4xxx-trap-3', { opacity: [0, 1], translateY: [20, 0] }, 600);
```

### 3.3 物理级拖拽 — `draggable()`

```ts
import { draggable } from 'animejs';

const drag = draggable('.i4xxx-card', {
  container: '.i4xxx-stage',              // 拖拽范围
  releaseEase: 'outElastic(1, .8)',       // 释放后 spring 回弹
  dragSpeed: 1,
  onDrag: () => { /* 拖动中回调 */ },
  onRelease: () => { /* 释放回调(可判定 drop zone) */ },
});

// 离开 step 时清理
drag.disable();
```

### 3.4 SVG 路径动画 — `createDrawable()` / `createMotionPath()`

```ts
import { svg } from 'animejs';

// 路径描线（5.4 全段地图连线、雷达扫描、对勾绿都用这个）
const drawable = svg.createDrawable('.i4xxx-line', 0, 600);
drawable.draw(0, '100%');  // 0ms 起点 → 600ms 终点

// 沿路径运动（激光穿透、3D 旋转）
const mp = svg.createMotionPath('.i4xxx-path');
animate('.i4xxx-laser', {
  ...mp,
  duration: 1500,
  loop: true,
  ease: 'inOutSine',
});
```

### 3.5 错开延迟 — `stagger()`

```ts
import { stagger } from 'animejs';

animate('.i4xxx-list > *', {
  y: [20, 0],
  opacity: [0, 1],
  delay: stagger(100),                // 100ms 错开
  duration: 400,
});

// 从中心向外错开
animate('.i4xxx-radial', {
  scale: [0, 1],
  delay: stagger(50, { from: 'center' }),
});

// 反向错开
animate('.i4xxx-list', {
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
import { animate, stagger } from 'animejs';
import { useChapterProgress } from '../../hooks/useChapterProgress';

export default function MyChapter({ step }: { step: number }) {
  useChapterProgress(step, 30);
  
  // ★ 节点滚动：步 8-13 期间启动，离开时 revert
  useEffect(() => {
    if (step >= 8 && step <= 13) {
      const anim = animate('.i4xxx-nodes', {
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
      svg.createDrawable('.i4xxx-line', 0, 1500);
    }
  }, [step]);
  
  // ★ 拖拽：步 20-26 期间挂载，离开时 disable
  useEffect(() => {
    if (step === 20) {
      const drag = draggable('.i4xxx-card', {
        container: '.i4xxx-stage',
        releaseEase: 'outElastic(1, .8)',
      });
      return () => drag.disable();
    }
  }, [step]);
  
  return (
    <div className="i4xxx-root">
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
animate('.i4xxx-bar', {
  height: '100%',
  backgroundColor: getComputedStyle(document.documentElement)
    .getPropertyValue('--accent').trim(),
});

// 方式 2：CSS 写样式，animejs 只动 transform / opacity / scale（最稳）
// CSS:
//   .i4xxx-bar { background: var(--accent); height: 0; }
//   .i4xxx-bar.grew { height: 100%; }
// TS:
//   animate('.i4xxx-bar', { height: [0, '100%'] });
```

**推荐方式 2**：主题切换时动画不崩溃，token 永远从 CSS 来。

---

## 6. subagent prompt 模板

章节 subagent 接到任务时，prompt 里加这一段（已自动注入到 5.4 课件 S5 段 subagent prompt）：

```
【动画升级选项】
本章如需"真正 CSS keyframe 动画"（节点滚动、柱状图 grow、闪烁、SVG 描线等），
用 animejs v4（已装）替代手写 @keyframes：
  - import { animate, stagger, createDrawable, draggable, svg, utils } from 'animejs'
  - 在 useEffect([step]) 里启动动画，离开 step 时 revert（不累积）
  - 复杂时序用 timeline() 链式
  - 拖拽用 draggable() 替代手写 Pointer Events
  - SVG 描线用 svg.createDrawable() 替代手算 stroke-dashoffset
  - 不破坏 .i4xxx- 独立 CSS 前缀
  - 仍保留 token 主题 + newsroom 风格
【/动画升级选项】
```

---

## 7. 不要做的事

- ❌ **不要用 animejs 动章节里所有元素**（步进揭示 `step >= N` 仍是主要机制，animejs 只在需要"真正动画"时用）
- ❌ **不要在每屏都加 stagger 错开**（会显得碎；只在"批量元素同时入场"时用）
- ❌ **不要在 auto 模式禁用动画**（用户看 `?auto=1` 录屏时也要看到动画）
- ❌ **不要把 animejs 引入 SSR**（Vite 已配 client-only，但 React `useEffect` 里要确认）
- ❌ **不要用 `loop: true` 永久循环**（除闪烁/激光等视觉演示外，长时间循环动画会喧宾夺主）
- ❌ **不要在每章都用 animejs**（小章节 / 纯文字章节不需要，留给有视觉演示的章节）

---

## 8. 与现有模式对应

| 原 INTERACTIVE-PATTERNS 分类 | animejs 替代 | 备注 |
|---|---|---|
| G. 步进揭示 | **保留** | 仍用 `step >= N`，animejs 不替代基础机制 |
| C. 对比裁决 | animate + scale 动画 | 替代纯 CSS 切换 |
| D. 可展开链 | animate + height transition | 替代纯 CSS 高度 |
| E. 拖拽操纵 | **draggable()** | 替代手写 Pointer Events，**最值得用** |
| I. 脉冲动画 | animate + loop | 替代 `@keyframes pulse` |
| K. 直接操控演示 | draggable + range input | 替代 input range |
| **新：批量错开** | **stagger()** | animejs 独家 |
| **新：SVG 描线** | **createDrawable()** | animejs 独家，5.4 地图连线已用 |
| **新：物理回弹** | **releaseEase: 'outElastic'** | animejs 独家，5.4 拖拽已用 |
| **新：路径运动** | **createMotionPath()** | 激光穿透 / 3D 旋转 |
| **新：时间线** | **timeline()** | 多元素时序编排 |

---

## 9. 性能与可访问性

- **性能**：animejs v4 用 WAAPI 后端，比手写 CSS 动画更省 CPU；批量 stagger 时浏览器自动合并图层
- **可访问性**：尊重 `prefers-reduced-motion`：
  ```ts
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reduced) {
    // 直接设为终态，不放动画
    document.querySelectorAll('.i4xxx-nodes').forEach(el => el.style.opacity = '1');
  } else {
    animate('.i4xxx-nodes', { opacity: [0, 1], delay: stagger(50) });
  }
  ```
- **录制模式**：`?auto=1` 录屏时 animejs 动画照常播放（动画时长与 TTS 时长自动协调：口播结束 → step++ → 动画到一半就跳，但 reveal 不强制等动画跑完）

---

## 10. 完整范例

见 `references/EXAMPLES/example-anime.tsx`（30 步完整章节，3 处真视觉演示全部用 animejs）。

也参考 5.4 课件 S5 段实际生产落地：
- `presentation/src/chapters/840-i4-node-explode/` — 4 个 `@keyframes`（`nodeGrow` / `barGrow` / `shaveMove` / `show-in`）手写 + E. 拖拽自写；可用 animejs 完全替代
- `presentation/src/chapters/841-i4-bg-mislabel/` — 5 个 `@keyframes`（`trapBlink` / `laserFire` / `trapReveal` / `bubblePop` / `show-in`）手写 + A. 点击热区自写
- `presentation/src/chapters/842-i4-recap-mission/` — 5 个 `@keyframes`（`ruleCardIn` / `nodePop` / `lineDraw` / `checkmarkDraw` / `wrongShake`）手写 + F. 拖拽排序自写

S5 段 14 个手写 keyframes + 6 处自写互动，**全部可用 animejs 1-3 行替代**（约 200+ 行代码 → 约 30 行）。**未来新章节优先用 animejs**。

---

## 11. 升级路径（已上线 → 未来）

| 状态 | 课件 | 处理 |
|---|---|---|
| 已完成 | 5.4 课件 S1-S5（21 章） | **不重做**（迁移 ROI 低 + 已 tsc 0 error + 已 TTS 同步） |
| 未来 | 5.5 / 6.x 课件 | 优先用 animejs（subagent prompt 已加模板段） |
| 模板 | `templates/package.json` | 加 `animejs: ^4.4.1` 依赖 |
| Scaffold | `scripts/scaffold.sh` | 追加 `npm install animejs` |

---

## 12. 故障排查

| 症状 | 原因 | 解决 |
|---|---|---|
| 动画不播放 | `useEffect` 没在 `step >= N` 时启动 | 检查 step 条件 |
| 动画累积到下一屏 | 离开时没 `revert()` | 在 `useEffect` 返回 `() => anim.revert()` |
| `?auto=1` 模式动画不完整 | 动画时长 > 口播时长 | 让 step 自动推进（不等动画）；如必要调短动画 |
| 颜色动画主题切换时崩溃 | 直接动 CSS 变量值 | 改为只动 `transform / opacity / scale` |
| 拖拽到边界外卡住 | 容器太小 | 调 `containerFriction: 0.9` 加摩擦 |
| 报错 `animate is not a function` | 装错版本（v3 改 v4 API） | 卸载 `npm uninstall animejs` → 装 `npm install animejs@^4.4.1` |

---

*文档版本 v1.0 — 基于 5.4 课件 S1-S5 段 14 个 CSS keyframes + 6 处互动的实战落地总结。如有 animejs v5 升级或新封装需求，PR 到此文档。*
