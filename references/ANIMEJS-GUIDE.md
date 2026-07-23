# ANIMEJS-GUIDE.md

> **Skill 角色定位**: 这是 course-forge 的"动画增量能力"层。SKILL.md / CHAPTER-CRAFT.md / COURSE-STRUCTURE.md 定义核心行为 (剧本、节奏、内容取舍), 本文档只覆盖"真正动画"那一层 — 当你准备给章节加 animejs 动画时读这一份。
> **面向读者**: LLM agent, 不是人。**结构按"先判断 → 再选模式 → 后实施"渐进式披露**; 代码块只放最小可运行片段, 不堆叙事; 每个原则单独可执行, 不依赖其他章节。
> **适用版本**: `animejs ^4.4.1`
> **包大小**: 80KB gzip, 一次性 cost; WAAPI 后端, 浏览器原生加速。
> **读完这一份 LLM 应该能为**: 卡片堆/球面/钟面 3D 旋转 (§1); 标题/数字字符级入场 (§2); 装饰流体持续动 (§3); 简单入场/拖拽 (§4); 车/立方体/物体的有质感视觉 (§X 5 大共性含材质)。

---

## 0. 决策树: 你要做什么?

LLM agent 接到"加动画"需求时, 按以下顺序判断 (互斥, 只走一条):

```
Q1: 你要做真 3D 立体感的物体 / 卡片堆 / 球面?
  → 轻量 3D (卡片堆 / 立方体 / 静态透视): 走 §1 CSS 3D 路径
  → 真 3D 场景 (光照 / 材质 / 后处理, v4.5.0+): 走 §6 Three.js adapter
  → v4.4.1 项目: 只能走 §1 CSS 3D, 升 v4.5.0 后可用 §6
  → NO:  Q2

Q2: 你的内容是字符 / 文本 / 单词级别的入场?
  → YES: 走 §2 字符级 stagger 路径 (animejs v4 logo 范式)
  → NO:  Q3

Q3: 你的画面是"批量元素 + 持续在动 (无固定终点)"?
  → YES: 走 §3 流体循环路径 (layered-css-transforms 范式)
  → NO:  Q4

Q4: 你的画面是简单入场 / 出场 / 状态切换?
  → 走 §4 基础 5 封装 (animate / stagger / svg / Draggable / onScroll)
  →  仍想做"有质感的物体" → 走 §X 5 大共性 (含材质) 单独看
```

> **动画词汇不够用？** 需要 glow 辉光 / 镜像对比 / 景深聚焦 / 自绘描线 / 粒子 / 弹性入场 / count-up / 字符级 / 卡片组装 等现成配方 → 见 [`ANIMATION-RECIPES.md`](ANIMATION-RECIPES.md)（已从 heygen-com/hyperframes 移植为 anime.js v4.4.1，每条映射四大支柱）。多阶段场景编排骨架见 [`SCENE-BLUEPRINTS.md`](SCENE-BLUEPRINTS.md)；按章节情绪选配色见 [`PALETTES.md`](PALETTES.md)。

**v4.4.1 项目禁止直接 `animate(threeObj, ...)`** (实测抛 `str.includes is not a function`); **v4.5.0+ 项目可走 §6 Three.js adapter** (内置支持)。详见 §0.5 + §6。

---

## 0.5 anime.js 版本边界 (v4.4.1 vs v4.5.0+)

> **必读**: 不同 anime.js 版本支持的路径差异极大, 直接决定 §1-§6 章节是否适用。

| 版本 | 关键能力 | 影响章节 |
|---|---|---|
| **v4.0 - v4.4.1** | CSS / SVG / DOM 属性动画; `stagger` / `keyframes` / `createTimeline`; Draggable; onScroll | §1-§5 全部适用, §6 Three.js **不适用** |
| **v4.5.0+ (2026-06-22)** | 新增 `registerAdapter()` API; **内置 Three.js adapter** (`animejs/adapters/three`); Stagger 3D (x/y/z + jitter + seed); Color pseudo-linear 混合 | §6 整段重写: Three.js **支持** (内置 adapter) |

**v4.5.0 Three.js adapter 用法**:
```js
import "animejs/adapters/three"; // 副作用导入, 扩展 animate() 到 Three.js 对象
import { animate, createTimeline } from "animejs";

animate(cube.position, { x: 100, y: 0, z: 0, duration: 1000 });
animate(mesh.material, { color: 0xff0000, duration: 1000 });
animate(camera.position, { z: 500, duration: 1000 });
```

支持的 Three.js 类型: Object3D / materials / lights / cameras / audio nodes / UniformNode (TSL) / instanced meshes。

**v4.4.1 → v4.5.0 迁移决策**:
- 你的项目如果用 `animejs ^4.4.1` (package.json), **先升 ^4.5.0** 再用 §6 Three.js adapter
- §1 CSS 3D 路径仍然适用 — **轻量 3D (卡片堆 / 简单旋转) 仍用 CSS 3D**, **真 3D 场景 (光照/材质/后处理) 才用 Three.js adapter**

---

## X. 5 大共性 (含质感) — 让物体"画得好看"

> **5 大共性是参考, 不是门槛** — 前 4 大共性 (随机化 / 持续循环 / 多 keyframe / 独立 stagger) 是 lint 硬约束, 第 5 共性 (材质) 是按内容按需选用。硬约束见 §0 + §X.1, 8 材质手法见 §X.2, 基础套件见 §X.3。
> **何时读**: 你画任何具体物体 (车/立方体/卡片/人形), 都要读这一段。
> **何时不读**: 你的画面只是文字 + 简单几何 (比如章节报头), 不需要"物体"。

### X.1 4 大共性 (动, 硬约束) + 1 附加共性 (材质, 参考)

| # | 共性 | 类别 | 含义 | 关键手法 |
|---|---|---|---|---|
| 1 | 随机化 | **硬约束** | 起始位置/旋转/缩放随机, 不全场统一 | `utils.random()` |
| 2 | 持续循环 | **硬约束** | `onComplete` 链式, 永远在动 | `createTimeline({ onComplete: () => animate() })` |
| 3 | 多 keyframe | **硬约束** | 5+ keyframe 弹入-回弹-就位 | `keyframes: [{to, duration, ease}, ...]` |
| 4 | 独立 stagger | **硬约束** | 每元素不同时间点入场 | `stagger(N, { from: 'center' | 'last' })` |
| **5** | **材质叠加** | **参考** | **物体有质感/光影/曲线, 不是单色 flat** | **linearGradient + box-shadow 多层 + drop-shadow + mix-blend-mode + 描边 + 毛玻璃** |

**判定 (硬约束 #6)**:
- 4 大共性 (1-4) 满足 ≥ 2 项 = 合格 (动得对)
- 4 大共性 (1-4) 满足 ≥ 3 项 = 优秀 (动得对 + 有节奏)
- 4 大共性 + 材质叠加 满足 ≥ 3 项 = 范例级 (5.4 课件前车之鉴的反面)

**反例 (5.4 课件前车之鉴)**:
```tsx
// ❌ 0 材质 — 车辆看起来像纸片
<rect x="0" y={CAR_Y} width="80" height="32" fill="var(--text)" />
<circle cx="18" cy={CAR_Y + 34} r="8" fill="var(--text)" />

// ❌ 1 材质 (单 box-shadow) — 还是单薄
<rect fill="var(--text)" style={{ boxShadow: "0 2px 4px #000" }} />
```

**正例 (质感叠加)**:
```tsx
// ✓ 3+ 材质叠加 — 车有金属感 + 投影 + 高光
<div className="chapter-car">
  {/* linearGradient 模拟金属反光 */}
  <div className="chapter-car-body" />
  {/* 多层 box-shadow 投影 (近距 1, 远距 2) */}
  <div className="chapter-car-shadow" />
  {/* filter: drop-shadow 远景 */}
  <div className="chapter-car-far" />
</div>
```
```css
.chapter-car-body {
  background: linear-gradient(180deg, #fafafa 0%, #d8d8d8 50%, #c0c0c0 100%);  /* 金属反光 */
  border-radius: 8px 8px 4px 4px;
  box-shadow:
    0 1px 2px rgba(0, 0, 0, 0.3),     /* 近距深阴影 */
    0 8px 16px rgba(0, 0, 0, 0.15),   /* 远距浅阴影 */
    inset 0 1px 0 rgba(255, 255, 255, 0.6);  /* 顶部高光 (光照) */
}
.chapter-car-shadow {
  background: radial-gradient(ellipse, rgba(0, 0, 0, 0.4) 0%, transparent 70%);
  filter: blur(4px);
  transform: scaleY(0.3);  /* 压扁的椭圆投影 */
}
.chapter-car-far {
  filter: drop-shadow(0 4px 8px rgba(0, 0, 0, 0.2));
}
```

### X.2 质感 8 手法 (animejs 官方实战汇总)

| # | 手法 | 适用 | animejs 官方例 | 范式代码片段 |
|---|---|---|---|---|
| 1 | **`linear-gradient`** | 模拟金属反光 / 天空 / 路面光照变化 | clock-playback-controls | `background: linear-gradient(180deg, #fafafa 0%, #d8d8d8 50%, #c0c0c0 100%);` |
| 2 | **`radial-gradient`** | 阴影 / 光晕 / 灯泡发光 | additive-creature | `background: radial-gradient(circle, rgba(255,200,100,0.4) 0%, transparent 70%);` |
| 3 | **`box-shadow` 多层** | 卡片立体 / 物体投影 | periodic-table (3-4 层叠加) | `box-shadow: 0 1px 2px rgba(0,0,0,.3), 0 8px 16px rgba(0,0,0,.15), inset 0 1px 0 rgba(255,255,255,.6);` |
| 4 | **`filter: drop-shadow()`** | 远景物体 / 整体深度 | onscroll-sticky | `filter: drop-shadow(0 4px 8px rgba(0, 0, 0, 0.2));` |
| 5 | **`mix-blend-mode: plus-lighter`** | 光晕 / 烟雾 / 萤火虫 | additive-creature, additive-fireflies | `mix-blend-mode: plus-lighter; background: var(--red);` |
| 6 | **`stroke-dasharray` 描线 + `fill` 渐变** | 路径描线 (雷达扫描/对勾绿) | layered-css-transforms, svg-graph | `stroke-dasharray: 600; stroke-dashoffset: 600;` + `fill: url(#gradient-id);` |
| 7 | **`backdrop-filter: blur()`** | 毛玻璃卡片 / 提示卡 | onscroll-responsive-scope | `backdrop-filter: blur(8px); background: rgba(20, 20, 40, 0.85);` |
| 8 | **`backface-visibility: hidden`** | 3D 卡片翻转时不显示背面 | onscroll-sticky | `backface-visibility: hidden;` + `.back { transform: rotateY(180deg); }` |

**核心原则**:
- **≥ 2 种手法叠加 = 有质感** (硬约束 #7 lint 必查)
- **≥ 3 种手法叠加 = 优秀** (范例级)
- **0-1 种 = 警告, 课件美感单薄, 回退补**
- 手法 1-5 (gradient + shadow) 是基础; 手法 6 (描线) 适合 SVG; 手法 7-8 (毛玻璃/3D) 适合卡片/立体

### X.3 质感基础套件 (LLM agent 直接套用)

```css
/* ★ 质感基础套件 — 任何物体都至少套 1-2 个 */

/* 1. 立体卡片 (3D 卡片堆/小方块/工具卡) */
.chapter-card-3d {
  background: linear-gradient(180deg, var(--surface-2) 0%, var(--surface-3) 100%);
  border-radius: 8px;
  box-shadow:
    0 1px 2px rgba(0, 0, 0, 0.3),     /* 近距 */
    0 8px 16px rgba(0, 0, 0, 0.15),   /* 远距 */
    inset 0 1px 0 rgba(255, 255, 255, 0.6);  /* 顶部高光 */
}

/* 2. 金属物体 (车/立方体/工具) */
.chapter-metal {
  background: linear-gradient(180deg, #fafafa 0%, #d8d8d8 50%, #c0c0c0 100%);
  border-radius: 4px;
  box-shadow:
    0 2px 4px rgba(0, 0, 0, 0.2),
    inset 0 1px 0 rgba(255, 255, 255, 0.8);  /* 顶部高光强 */
}

/* 3. 灯光物体 (灯泡/尾灯/光点) */
.chapter-glow {
  background: radial-gradient(circle, rgba(255, 200, 100, 0.8) 0%, rgba(255, 200, 100, 0) 70%);
  box-shadow: 0 0 20px rgba(255, 200, 100, 0.6);
}

/* 4. 阴影 (车/物体投在地面) */
.chapter-shadow {
  background: radial-gradient(ellipse, rgba(0, 0, 0, 0.4) 0%, transparent 70%);
  filter: blur(4px);
  transform: scaleY(0.3);  /* 压扁的椭圆 */
}

/* 5. 玻璃物体 (车窗/护目镜) */
.chapter-glass {
  background: linear-gradient(180deg, #aaccdd 0%, #88aabb 100%);
  opacity: 0.6;
  border-radius: 2px;
  box-shadow: inset 0 0 6px rgba(255, 255, 255, 0.4);
}

/* 6. 描边 (线条/路径/印章边框) */
.chapter-stroke {
  fill: none;
  stroke: currentColor;
  stroke-width: 1.5;
  stroke-linecap: round;  /* 圆头, 软和 */
  stroke-linejoin: round;
}

/* 7. 毛玻璃 (提示卡/弹出卡) */
.chapter-glass-card {
  background: rgba(20, 20, 40, 0.85);
  backdrop-filter: blur(8px);
  border-radius: 4px;
  border-left: 4px solid var(--accent);
}

/* 8. 3D 卡片翻转 (物理演示卡) */
.chapter-flip-card-front {
  backface-visibility: hidden;
  background: var(--surface-2);
}
.chapter-flip-card-back {
  backface-visibility: hidden;
  background: var(--surface-3);
  transform: rotateY(180deg);
}
```

### X.4 真实参考源码 (animejs 官方)

| 示例 | 用了哪些质感手法 | JS 行数 |
|---|---|---|
| `additive-creature` | #2 radial-gradient + #5 mix-blend-mode + #3 box-shadow 多层 | 104 |
| `additive-fireflies` | #5 mix-blend-mode + #1 linear-gradient | 60 |
| `layered-css-transforms` | #1 linear-gradient + #3 box-shadow + #6 stroke 描边 | 63 |
| `onscroll-sticky` | #3 box-shadow 多层 + #8 backface-visibility + #7 backdrop-filter | 55 |
| `clock-playback-controls` | #1 linear-gradient + #3 box-shadow + 透视 | 106 |
| `auto-layout/periodic-table` | #3 box-shadow 多层 + #1 linear-gradient + 阴影 + 圆角 | 317 |
| `onscroll-responsive-scope` | #3 box-shadow 多层 + #7 backdrop-filter + #8 backface-visibility | 49 |
| `svg-graph` | #1 linear-gradient + #2 radial-gradient + mask | 39 |

详见 `ANIMEJS-EXAMPLES-INDEX.md` §"质感技法索引"。

### X.5 5.4 课件前车之鉴 (避免重蹈)

| 5.4 错误做法 | 看起来 | 正确做法 | 看起来 |
|---|---|---|---|
| 车辆 = 4 个 `<rect>` 拼 (车身 + 车顶 + 2 车轮) | 像纸片剪纸 | 车身 linear-gradient (金属反光) + box-shadow (投影) + drop-shadow (远景) | 像真车 |
| 柱状图 = `<div>` 高度拉伸 | 像扁平方块 | bar linear-gradient (底部深顶部浅) + box-shadow (3D 凸起) | 像真柱 |
| 节点滚动 = `<div>` opacity 0→1 | 像 PPT 入场 | 节点 radial-gradient (径向光晕) + box-shadow (节点投影) + drop-shadow (远景) | 像真粒子 |
| 路径描线 = `<path stroke>` | 简单线条 | 描线 + 渐变填充 + 流光动画 | 高级感 |

### X.6 与其他 § 的关系

- **Q1 走 §1 CSS 3D 路径** → 加 §X 质感 8 手法, 卡片堆立刻有立体感
- **Q2 走 §2 字符级 stagger 路径** → 加 §X 质感, 字符弹入时加 text-shadow 模拟光晕, 标题立刻有冲击感
- **Q3 走 §3 流体循环路径** → 加 §X 质感, 流体元素用 radial-gradient + mix-blend-mode, 立刻"发光"
- **Q4 走 §4 基础 5 封装** → 加 §X 质感, 简单入场元素加 box-shadow / linearGradient, 不再是 flat

---

## 1. CSS 3D 立体路径 (Q1, 轻量 3D 推荐, v4.5.0+ 可选 Three.js adapter)

> **何时用 CSS 3D**: 卡片堆 / 简单立方体 / 静态透视场景 / 轻量 3D 旋转 — 浏览器原生支持, 0 依赖。
> **何时改用 Three.js adapter (§6 v4.5.0+)**: 需要真 3D 光照 / 材质 / 后处理 / 复杂网格 / 物理引擎 — CSS 3D 表达不了。

### 1.1 何时用

- 卡片堆 (onscroll-sticky)
- 卡片 3D 旋转 (onscroll-responsive-scope)
- 钟面 / 立方体 (clock-playback-controls)
- 球面 / 螺旋 / 3D 网格布局 (auto-layout/periodic-table)
- 任何"有透视、有 Z 排序、有立体旋转"的物体

### 1.2 三件套 CSS

```css
.stage {
  perspective: 1000px;             /* 视点距离, 数值越小透视越强 */
  perspective-origin: 50% 50%;     /* 视点位置, 默认中心 */
}
.stack {
  transform-style: preserve-3d;    /* 容器声明 — 让子元素保留 3D */
  perspective: 1000px;             /* 视点可双声明 (容器/场景) */
}
.card {
  transform-style: preserve-3d;    /* 子元素也要声明, 否则 3D 失效 */
  transform: rotateY(180deg) translateZ(40px);  /* Z 轴 4 种基本动作 */
  will-change: transform;           /* 性能提示 */
}
```

### 1.3 animejs 驱动 (纯 CSS transform)

```ts
import { animate, utils, createTimeline, stagger } from 'animejs';

// 步 5: 卡片堆 3D 翻转入场
animate('.card', {
  rotateY: [-180, 0],
  rotateZ: { to: stagger([0, -360], { from: 'last' }), ease: 'inOut(2)' },
  translateY: { to: '-60%', duration: 400 },
  transformOrigin: ['50% 100%', '50% 50%'],
  delay: stagger(1, { from: 'first' }),
  ease: 'in(2)',
});
```

### 1.4 反例

| 反例 | 后果 |
|---|---|
| 漏 `transform-style: preserve-3d` | 子元素塌成 2D, 看起来只是 rect 旋转 |
| `perspective` 写错位置 (写在子元素而非父容器) | 透视只作用自己, 兄弟元素不在同一空间 |
| 写 `transform: rotate3d(x, y, z, ...)` 但父容器没 `preserve-3d` | 同上, 退化成 2D |
| 尝试用 Three.js + animejs 同步属性 | animejs 内部对 Vector3 调用失败, 抛 `str.includes is not a function` |

### 1.5 真实参考源码 (animejs 官方)

- `onscroll-sticky/index.html` + `index.js` (55 行 JS, 完整卡片堆 3D 翻转)
- `onscroll-responsive-scope/index.js` (49 行, 响应式 3D 卡片)
- `clock-playback-controls/index.html` (171 行, 3D 钟面 + 弹性 easing)
- `auto-layout/periodic-table/index.js` (76 行, sphere/helix/grid 3D 布局)

详见 `ANIMEJS-EXAMPLES-INDEX.md` 行 30-60。

---

## 2. 字符级 stagger 路径 (Q2)

### 2.1 何时用

- 标题逐字入场 (animejs v4 logo animation)
- 单词 / 数字 / 段落的字符拆解
- 任何"按字符/按词"逐步揭示的文本

### 2.2 范式结构 (从 animejs v4 logo 提炼)

```ts
// 1. 字符拆解: 把文本切成 N 个 <span>/SVG 字符
function wrapInSpan(target: HTMLElement) {
  let wrappedText = '';
  for (const char of target.textContent) {
    wrappedText += `<span>${char === ' ' ? '&nbsp;' : char}</span>`;
  }
  target.innerHTML = wrappedText;
}

// 2. 多 keyframe 时间线 (5 个 keyframe 串成"弹入-回弹-就位"完整节奏)
const tl = createTimeline({ defaults: { ease: 'inOutQuint', duration: 800 } });
tl.add('.chapter-chars', {
  translateY: [
    { to: [35, -80], duration: 190, ease: 'splashCurve' },  // 弹起
    { to: 4, duration: 120, delay: 20, ease: 'inQuad' },   // 回落小
    { to: 0, duration: 120, ease: 'outQuad' }              // 就位
  ],
  scaleX: [
    { to: [.25, .85], duration: 190, ease: 'outQuad' },     // 压扁
    { to: 1.08, duration: 120, delay: 85, ease: 'inOutSine' },  // 反弹
    { to: 1, duration: 260, delay: 25, ease: 'outQuad' }    // 就位
  ],
  scaleY: [
    { to: [.4, 1.5], duration: 120, ease: 'outSine' },
    { to: .6, duration: 120, delay: 180, ease: 'inOutSine' },
    { to: 1.2, duration: 180, delay: 25, ease: 'outQuad' },
    { to: 1, duration: 190, delay: 15, ease: 'outQuad' }
  ],
  duration: 400,
  ease: 'outSine',
}, stagger(80, { from: 'center' }))  // 字符级 stagger
.init();
```

### 2.3 关键技巧

- **不要用简单 [0, 1]**: 字符级动画的"活感"来自 **5+ keyframe 串成的弹入-回弹-就位完整节奏**
- **`from: 'center'`**: 字符从中心向外依次入场, 比 left/right 更有节奏
- **弹性 easing**: `outElastic(1, .8)`, `cubicBezier(.225, 1, .915, .980)` (animejs v4 logo 自定义 splashCurve)
- **transformOrigin 关键**: 字符入场时 `transformOrigin: '50% 100% 0px'` 决定"从底部弹起"还是"从顶部落下"

### 2.4 反例

| 反例 | 后果 |
|---|---|
| 字符整体 fade-in, 没 stagger | 像 PPT 入场, 死板 |
| 用 `delay: stagger(50)` 但 keyframe 只有 1 段 | 字符整齐入场, 无弹入-回弹节奏 |
| `transformOrigin: 'center center'` (默认) | 字符从中心缩放, 显得"压缩" |
| 字符用 opacity: 0 起始 + 单一 translateY | 没有"被压扁再弹回"的物理感 |

### 2.5 真实参考源码

- `animejs-v4-logo-animation/index.js` (260 行, 完整 5 段 timeline: FALL → WIGGLE → POP → SWEECH → OUTRO)
- 关键片段 line 73-93 (POP 段, 字符逐字入场)

详见 `ANIMEJS-EXAMPLES-INDEX.md` 行 80-100。

---

## 3. 流体循环路径 (Q3)

### 3.1 何时用

- "持续在动"的环境效果 (粒子、流体、漂浮物)
- 没有任何特定 step 终点的持续动画
- 装饰性背景

### 3.2 范式 (从 layered-css-transforms 提炼)

```ts
import { animate, createTimeline, utils, createSpring } from 'animejs';

// 关键: 动画完成后立即"再启动", 形成永久循环
function animateShape(el: HTMLElement) {
  const animation = createTimeline({
    onComplete: () => animateShape(el),  // 链式 — 永远在动
  })
  .add(el, {
    translateX: createKeyframes(() => utils.random(-40, 40)),  // 随机
    translateY: createKeyframes(() => utils.random(-40, 40)),
    rotate: createKeyframes(() => utils.random(-180, 180)),
  }, 0);
  // ...更多部件
  animation.init();
}

// createKeyframes: 100 个随机值的 keyframe 串
function createKeyframes(value: () => number) {
  const keyframes = [];
  for (let i = 0; i < 100; i++) {
    keyframes.push({
      to: value(),
      ease: utils.randomPick(['inOutQuad', 'inOutCirc', 'inOutSine', createSpring()]),
      duration: utils.random(300, 1600),
    });
  }
  return keyframes;
}

// 启动 N 个元素的独立流体
for (let i = 0; i < 6; i++) {
  animateShape(document.querySelectorAll('.shape')[i]);
}
```

### 3.3 关键技巧

- **`onComplete` 链式 ≠ `loop: true`**: 链式是"完成后再启动", 每次 keyframe 不同, 看起来真随机; `loop: true` 是"重复同一段", 看起来机械循环
- **`utils.randomPick([eases])`**: 每个 keyframe 用不同 easing, 整体节奏不机械
- **100+ keyframes**: 不是夸张, 流体效果需要足够多随机值才能"不重复"
- **弹性混合**: `createSpring()` 加入 keyframe 数组, 弹簧 + 缓动混合, 节奏更自然

### 3.4 反例

| 反例 | 后果 |
|---|---|
| 用 `loop: true` 配固定动画 | 每次循环都一模一样, 1 秒就腻 |
| 单一 easing 配多 keyframe | 节奏机械, 像机械表 |
| 不用 `onComplete` 链式, 用 `loop: true` | 动画结束就停, 死的 |
| 部件数 < 3 | 看起来像抖动而不是流体 |

### 3.5 真实参考源码

- `layered-css-transforms/index.js` (63 行, 6 个形状永久流体循环)
- `additive-creature/index.js` (104 行, 13×13 = 169 粒子 + grid stagger)
- `additive-fireflies/index.js` (60 行, 萤火虫粒子跟随鼠标)
- `canvas-2d/index.js` (77 行, 4000 粒子 + Canvas 2D)

详见 `ANIMEJS-EXAMPLES-INDEX.md` 行 110-150。

---

## 4. 基础 5 封装 (Q4)

**仅当 Q1/Q2/Q3 都不适用时使用**。如果你的动画"看起来像 PPT", 说明你该重新走 §0 决策树, 而不是用基础封装硬堆。

### 4.1 `animate()` 元素级

```ts
import { animate } from 'animejs';
animate('.chapter-elem', { opacity: [0, 1], duration: 400 });
```

### 4.2 `stagger()` 错开延迟

```ts
animate('.chapter-list > *', {
  y: [20, 0],
  opacity: [0, 1],
  delay: stagger(100),                              // 100ms 错开
  duration: 400,
});
// 从中心向外错开
animate('.chapter-radial', { scale: [0, 1], delay: stagger(50, { from: 'center' }) });
// 反向错开
animate('.chapter-list', { y: [0, -20], delay: stagger(80, { from: 'last' }) });
```

### 4.3 `svg.createDrawable()` / `svg.createMotionPath()`

```ts
// 路径描线 (任何"线"动画的通用解法)
const drawable = svg.createDrawable('.chapter-line', 0, 600);
drawable.draw(0, '100%');

// 沿路径运动 (任何"沿轨道动"动画)
const mp = svg.createMotionPath('.chapter-path');
animate('.chapter-mover', { ...mp, duration: 1500, loop: true, ease: 'inOutSine' });
```

### 4.4 `Draggable` 拖拽

```ts
import { Draggable } from 'animejs';
const drag = Draggable.create('.chapter-card', {
  container: '.chapter-stage',
  releaseEase: 'outElastic(1, .8)',
  onRelease: (self) => { /* 落到正确位置判定 */ },
});
// 离开 step 时清理
drag[0].disable();
```

### 4.5 `onScroll` 滚动联动

```ts
import { animate, onScroll, createScope, stagger } from 'animejs';
const anim = animate('.card', { rotate: { to: stagger([-30, 30]) }, x: ['-60vw', stagger(['-20%', '20%'])], duration: 750 });
onScroll({ target: '.sticky-container', sync: .1 }).link(anim);
```

---

## 5. 与 course-forge step 驱动配合 (硬约束)

animejs 是**命令式库** (调用 `animate()` 即播放), 但 course-forge 是 **step 驱动** (React `if (step >= N)`)。**两套机制必须严格转换**:

```tsx
// ★ 关键模式: useEffect([step]) 启动 + cleanup revert
useEffect(() => {
  if (step >= 8 && step <= 13) {
    const anim = animate('.chapter-nodes', {
      opacity: [0, 1],
      scale: [0, 1],
      delay: stagger(50),
      duration: 300,
      ease: 'outBack',
    });
    return () => anim.revert();  // ★ 关键: 离开 step 时清理
  }
}, [step]);
```

**硬约束**:

- `useEffect` 必须依赖 `[step]`, 不依赖 `[]` (否则只跑一次)
- 必须 `return () => anim.revert()`, 否则动画累积到下一屏
- `loop: true` 动画离开 step 时记得 `.pause()` 而非 `.revert()` (revert 会重置进度)
- `?auto=1` 录屏时不需要特殊处理, 动画照常播放 (动画时长与 TTS 自动协调: 口播结束 → step++ → 动画到一半就跳)

---

## 6. Three.js 集成 (v4.5.0+ 内置 adapter)

> **v4.5.0 重大变化** (2026-06-22 release): animejs 官方内置 Three.js adapter, 通过副作用导入扩展 `animate()` / `utils.set()` 到 Three.js 对象。**v4.4.1 仍不支持** (会抛 `str.includes is not a function`)。

### 6.1 用法 (v4.5.0+)

```js
import * as THREE from "three";
import { animate, createTimeline, utils } from "animejs";
// ★ 关键: 副作用导入, 扩展 animate() 支持 Three.js 对象
import "animejs/adapters/three";

// Object3D (位置 / 旋转 / 缩放)
const cube = new THREE.Mesh(geo, mat);
animate(cube.position, { x: 100, y: 0, z: 0, duration: 1000, ease: "outBounce" });
animate(cube.rotation, { x: Math.PI, y: Math.PI / 2, duration: 2000 });
animate(cube.scale, { x: 2, y: 2, z: 2, duration: 800 });

// Materials (color / opacity / emissive)
animate(mesh.material, {
  color: 0xff0000,
  emissive: 0x440000,
  opacity: 0.8,
  duration: 1500,
});

// Lights
animate(light, { intensity: 2.5, distance: 100, duration: 1000 });

// Cameras
animate(camera.position, { z: 500, y: 50, duration: 2000, ease: "inOutQuad" });
animate(camera, { fov: 60, duration: 1000 });

// InstancedMesh
animate(instancedMesh, { count: 1000, duration: 1500 });

// TSL UniformNode (WebGPU)
animate(uniformNode.value, { x: 10, duration: 1000 });
```

### 6.2 v4.4.1 兼容方案

如果项目锁 v4.4.1 (或更早), **直接 `animate(threeObj, ...)` 必抛 `str.includes is not a function`**。

**替代方案**:
1. **CSS 3D 替代 (推荐)**: 见 §1。卡片堆 / 简单立方体 / 静态透视 — 0 依赖, 25 个官方 examples 全用此方式。
2. **registerAdapter() 自定义**: v4.5.0+ 新 API。如果项目必须 v4.4.1, 升级到 v4.5.0 是最简路径。
3. **Three.js + RAF 自驱**: Three.js 内部用 RAF 跑循环, 不需要 animejs。animejs 驱动 UI 层 (HTML/CSS 覆盖), 互不干扰。

### 6.3 CSS 3D vs Three.js 决策表

| 场景 | 推荐 | 原因 |
|---|---|---|
| 卡片堆 (3-20 张) | **CSS 3D** | 0 依赖, 性能足够 |
| 简单立方体 (1-6 个) | **CSS 3D** | 浏览器原生反走样 |
| 复杂网格 (>100 面) | **Three.js adapter** | CSS 性能下降 |
| 真光照 / PBR 材质 / 阴影 | **Three.js adapter** | CSS 表达不了 |
| 后处理 (bloom / blur) | **Three.js adapter** | CSS 后处理性能差 |
| 物理模拟 (碰撞 / 重力) | **Three.js + 物理引擎** | CSS 表达不了 |
| 文字 + 卡片小元素 | **CSS 3D** | 轻量场景 |

### 6.4 何时用 §1 vs §6

- **§1 CSS 3D**: 95% 课件场景 (5.4 / 5.5 / 5.6 现有 60+ 章节, 演示章 482a, 5.6 S1 段 860-862 重做后)
- **§6 Three.js adapter**: 复杂 3D 场景才考虑 (5.6 段 S3-S5 段未来可能涉及)

**禁止**: v4.4.1 项目直接 `animate(threeObj, ...)` — 必崩, 升级 v4.5.0 或用 §1 CSS 3D。

---

## 7. token 主题配合

animejs 动画可以用 CSS 变量名, **但要保证变量在动画启动时已加载**:

```ts
// 方式 1: JS 读取 token (稳)
animate('.chapter-bar', {
  height: '100%',
  backgroundColor: getComputedStyle(document.documentElement).getPropertyValue('--accent').trim(),
});

// 方式 2: CSS 写样式, animejs 只动 transform/opacity (最稳)
// CSS:   .chapter-bar { background: var(--accent); height: 0; }
//        .chapter-bar.grew { height: 100%; }
// TS:    animate('.chapter-bar', { height: [0, '100%'] });
```

**推荐方式 2**: 主题切换时动画不崩溃, token 永远从 CSS 来。

---

## 8. 性能与可访问性

- **性能**: animejs v4 用 WAAPI 后端, 比手写 CSS 动画省 CPU; 批量 stagger 时浏览器自动合并图层
- **可访问性**: 尊重 `prefers-reduced-motion`:
  ```ts
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reduced) {
    document.querySelectorAll('.chapter-nodes').forEach(el => el.style.opacity = '1');
  } else {
    animate('.chapter-nodes', { opacity: [0, 1], delay: stagger(50) });
  }
  ```
- **录制模式**: `?auto=1` 录屏时 animejs 动画照常播放

---

## 9. 硬约束 #6: 4 大共性 lint 检查

LLM agent 写完一章动画后, **必须** 跑静态 lint 脚本 (`scripts/check-animejs-cohesion.py`):

```python
# 检查 4 大共性中至少满足 2 项
import re, sys
from pathlib import Path

REQUIRED = {
    "随机化": r"utils\.random|random\(\d|randomPick",
    "持续循环": r"onComplete.*animate|loop:\s*true|alternate:\s*true",
    "多 keyframe": r"keyframes:\s*\[",
    "独立 stagger": r"stagger\(\d+|stagger\(",
}

# 单个 animate() 调用至少命中 2 项才算合格
# (animejs 4 大共性, 满足 2 项 = 风格鲜明)
```

**判定标准**: 0-1 项 = 死板 (退回 §4 基础用法); 2-3 项 = 合格; 4 项 = 优秀。

---

## 10. 故障排查

| 症状 | 原因 | 解决 |
|---|---|---|
| 动画不播放 | `useEffect` 没在 `step >= N` 时启动 | 检查 step 条件 |
| 动画累积到下一屏 | 离开时没 `revert()` | `useEffect` 返回 `() => anim.revert()` |
| `?auto=1` 模式动画不完整 | 动画时长 > 口播时长 | 让 step 自动推进 |
| 颜色动画主题切换时崩溃 | 直接动 CSS 变量值 | 改为只动 `transform/opacity/scale` |
| 报错 `str.includes is not a function` | 用 animejs 直接动画 `THREE.Group` / `THREE.Vector3` | 改用 §6 替代方案 |
| 拖拽到边界外卡住 | 容器太小 | 调 `containerFriction: 0.9` |
| 报错 `animate is not a function` | 装错版本 (v3 改 v4 API) | `npm install animejs@^4.4.1` |
| 字符级 stagger 看起来机械 | 用 `loop: true` 而非 `onComplete` 链式 | 改用 §3 流体循环 |
| 3D 卡片看起来是 2D | 漏 `transform-style: preserve-3d` | 加到父容器 + 子元素 |

---

## 11. 与其他 references 文档的关系

- **SKILL.md** — skill 主入口, 定义核心行为 (剧本/节奏/内容取舍); 本文档**不重复**核心, 只在动画层增量
- **CHAPTER-CRAFT.md** — 单章开发全流程, 包含"动画升级"段; 本文档**配合**而非替代, LLM agent 写动画时**只读本文**
- **COURSE-STRUCTURE.md** — 课程结构 / 多课程管理; 动画配置**不涉及**课程级, 本文档不重复
- **ANIMEJS-EXAMPLES-INDEX.md** — animejs 官方 25 个示例索引, 详细看哪个示例做哪种效果（材质范例见 §X.4）

**渐进式披露**:
- 写普通章节 → 只读 SKILL.md + CHAPTER-CRAFT.md
- 写需要动画的章节 → 加读 ANIMEJS-GUIDE.md (本文) + ANIMEJS-EXAMPLES-INDEX.md
- 写需要参考官方范例的章节 → 加读 ANIMEJS-EXAMPLES-INDEX.md
- 写需要 3D 立体感的章节 → 优先看 §1 (CSS 3D), 而不是用 Three.js

---

*文档版本 v2.0 — 重写自 v1.0, 加入 4 大共性 (随机化/持续循环/多 keyframe/独立 stagger) + 3D CSS 立体路径 + 字符级 stagger 路径 + 流体循环路径 + Three.js 明确不支持声明。面向 LLM agent 渐进式披露。*
