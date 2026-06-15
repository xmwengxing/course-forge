# ANIMEJS-EXAMPLES-INDEX.md

> **Skill 角色定位**: animejs 官方 25 个示例的索引表, 按"你要做什么效果"反向查找。
> **面向读者**: LLM agent。
> **来源**: `github.com/juliangarnier/anime/blob/master/examples/`
> **License**: MIT (Julian Garnier) — 公共仓库引用, 不复制完整文件, 仅给定位 + 适用场景。
> **何时读**: 你正在为 chapter 选动画模式, 需要看真实运行效果 / 想抄核心代码片段时, 查本表。
> **何时不读**: 你只写"普通入场/出场/状态切换"动画, 用 SKILL.md + CHAPTER-CRAFT.md + ANIMEJS-GUIDE.md §4 基础 5 封装足够, 不必读本表。

---

## 0. 用法

按**效果关键词**反向查 (例如"我想做卡片 3D 翻转" → 看 "卡片堆/3D 立体" 行 → 点开对应示例目录看 `index.html` + `index.js` 源码)。

每行格式:
```
示例名 | 核心 API | 适用场景 | 源码行数
```

---

## 1. CSS 3D 立体 (perspective + preserve-3d + rotateY/X/Z)

| 示例 | 核心 API | 适用场景 | JS 行数 |
|---|---|---|---|
| `onscroll-sticky` | 3D 卡片堆 (`rotateY: [-180, 0]` 翻转入场 + `rotateZ` 持续旋转 + 鼠标 hover translateY) | 卡片堆叠翻转 / 多层卡片展示 | 55 |
| `onscroll-responsive-scope` | 响应式 3D 卡片 (orientation media query 切换布局) | 响应式设备 3D 卡片 | 49 |
| `clock-playback-controls` | 3D 钟面 (12 数字 + 3 指针, 弹性 easing 控制时间) | 钟面 / 仪表盘 / 3D 圆盘 | 106 |
| `draggable-playground` | 3D 拖拽物理 (`Draggable` + 3D `rotateX/Y`) | 物理拖拽 + 3D 翻转 | 360 |
| `auto-layout/periodic-table` | `createLayout` 切换 sphere/helix/grid 3D 布局 | 元素 3D 球面/螺旋/网格分布 | 317 |
| `auto-layout/planets` | 球面 3D 布局 (类似 periodic-table) | 球面元素 | 200 |
| `auto-layout/cards` | 3D 卡片切换布局 | 卡片 3D 切换 | 37 |
| `additive-creature` | 13×13 粒子网格 + `mix-blend-mode: plus-lighter` 光晕 | 光晕/烟雾/云朵生物 | 104 |
| `additive-fireflies` | 萤火虫粒子跟随鼠标 + `mix-blend-mode` | 装饰性粒子跟随 | 60 |
| `clock-playback-controls` | 3D 钟面 + playback control | 时间/播放控制可视化 | 171 HTML |

**对应 ANIMEJS-GUIDE.md**: §1 CSS 3D 立体路径

**速选**:
- 卡片堆 → `onscroll-sticky`
- 卡片旋转 → `onscroll-responsive-scope`
- 钟面/仪表 → `clock-playback-controls`
- 球面布局 → `auto-layout/periodic-table` 或 `auto-layout/planets`
- 粒子光晕 → `additive-creature` 或 `additive-fireflies`
- 拖拽物理 → `draggable-playground`

---

## 2. 字符级 stagger (按字符/词入场)

| 示例 | 核心 API | 适用场景 | JS 行数 |
|---|---|---|---|
| `animejs-v4-logo-animation` | SVG 字符独立 stagger + 5 段 timeline (FALL→WIGGLE→POP→SWEECH→OUTRO) + 自定义 splashCurve + svg.morphTo | 标题字符入场 / 数字翻滚 / 词组拆解 | 260 |
| `text/hover-effects` | 字符级 hover 效果 + `splitText` API | 文本悬停效果 | (子目录) |
| `text/scramble` | 字符随机扰动解密 (`scrambleText` API) | 数字/字符加密感 | (子目录) |
| `text/split-effects` | 字符/词/行拆解 + 多 keyframe 弹入 | 标题多种入场效果 | (子目录) |
| `text/split-playground` | `splitText` API playground | 调试字符拆解 | (子目录) |
| `irregular-playback-typewriter` | 不规则播放打字机效果 | 打字机/输入效果 | 31 |

**对应 ANIMEJS-GUIDE.md**: §2 字符级 stagger 路径

**速选**:
- 标题字符入场 → `animejs-v4-logo-animation` (5 段 timeline 范式)
- 文本悬停 → `text/hover-effects`
- 字符解密 → `text/scramble`
- 打字机 → `irregular-playback-typewriter`

---

## 3. 流体循环 (持续在动, 无固定终点)

| 示例 | 核心 API | 适用场景 | JS 行数 |
|---|---|---|---|
| `layered-css-transforms` | 6 形状 100+ keyframe 随机 + `onComplete` 链式永久循环 + `utils.randomPick([eases])` + `createSpring()` 混合 | 流体/漂浮/装饰持续动 | 63 |
| `additive-creature` | 169 粒子网格 + `composition: 'blend'` 复合 | 粒子烟雾/光晕 | 104 |
| `additive-fireflies` | 萤火虫粒子 + 鼠标交互 | 鼠标交互装饰 | 60 |
| `canvas-2d` | Canvas 2D + 4000 粒子 + RAF + animejs 驱动 JS Object 属性 | 大量粒子 | 77 |
| `timeline-stress-test` | `composition` 复合测试 | 性能压测 | 29 |
| `timeline-seamless-loop` | 无缝循环 timeline | 循环动画 | 60 |

**对应 ANIMEJS-GUIDE.md**: §3 流体循环路径

**速选**:
- 6 形状持续漂动 → `layered-css-transforms` (核心范式)
- 100+ 粒子网格 → `additive-creature`
- Canvas 2D 大量粒子 → `canvas-2d`

---

## 4. SVG 描线与变形

| 示例 | 核心 API | 适用场景 | JS 行数 |
|---|---|---|---|
| `svg-line-drawing` | `svg.createDrawable()` 路径描线 | 雷达扫描/地图连线/对勾绿 | 79 |
| `svg-graph` | SVG mask + 路径 + `svg.createDrawable` 组合 | 数据图/折线图动画 | 39 |

**对应 ANIMEJS-GUIDE.md**: §4.3 `svg.createDrawable()` / §4.5 数据图

**速选**:
- 路径描线 → `svg-line-drawing`
- 数据图动画 → `svg-graph`

---

## 5. Stagger 错开 (基础)

| 示例 | 核心 API | 适用场景 | JS 行数 |
|---|---|---|---|
| `stagger` | 1000 dots 随机位置 + `stagger([0, 2000], { grid: true, from: 'center' })` 网格 stagger | 节点滚动/批量入场 | 32 |
| `advanced-grid-staggering` | 网格 stagger + grid 起始点切换 | 网格扫描/游标跟随 | 76 |

**对应 ANIMEJS-GUIDE.md**: §4.2 `stagger()`

**速选**:
- 节点滚动 → `stagger`
- 网格扫描 → `advanced-grid-staggering`

---

## 6. Timeline / onScroll / 状态机

| 示例 | 核心 API | 适用场景 | JS 行数 |
|---|---|---|---|
| `timeline-50K-stars` | 50K 粒子 + `createTimeline` + `composition: 'blend'` + `progress` 驱动 | 性能/状态机 | 146 |
| `timeline-refresh-starlings` | `timeline.refresh()` 动态重排 | 动态重排 | 59 |
| `timeline-stress-test` | `composition` 压力测试 | 性能优化 | 29 |
| `easings-visualizer` | 完整 11 种 easing 可视化对比 | 调试/选 easing | 304 |
| `animatable-follow-cursor` | `createAnimatable` 跟随鼠标 | 鼠标跟随 | 47 |
| `auto-layout/todo-list` | `createLayout` 增删改排序 | 增删改/排序 | - |
| `auto-layout/accordion` | 展开/折叠 | FAQ/手风琴 | 13 |
| `auto-layout/onscroll` | scroll 驱动 layout 切换 | 滚动联动布局 | - |

**对应 ANIMEJS-GUIDE.md**: §4.5 `onScroll` + 状态机相关

**速选**:
- 状态机/多阶段 → `timeline-50K-stars`
- 选 easing → `easings-visualizer`
- 鼠标跟随 → `animatable-follow-cursor`
- 增删改/排序 → `auto-layout/todo-list` + `draggable-infinite-auto-carousel`

---

## 7. 拖拽交互

| 示例 | 核心 API | 适用场景 | JS 行数 |
|---|---|---|---|
| `draggable-infinite-auto-carousel` | `Draggable` 无限滚动 carousel | 横向轮播/拖拽 | 69 |
| `draggable-mouse-scroll-snap-carousel` | `Draggable` + 滚轮 + snap | 拖拽+滚轮 | 100 |
| `draggable-playground` | 拖拽 3D 物理 playground | 完整拖拽参考 | 360 |

**对应 ANIMEJS-GUIDE.md**: §4.4 `Draggable`

**速选**:
- 拖拽排序 → `draggable-mouse-scroll-snap-carousel`
- 3D 拖拽 → `draggable-playground`
- 无限轮播 → `draggable-infinite-auto-carousel`

---

## 8. 总览: 25 个示例速查表 (按 JS 行数排序)

| 行数 | 示例 | 类型 |
|---|---|---|
| 13 | `auto-layout/accordion` | 折叠 |
| 29 | `timeline-stress-test` | 性能 |
| 31 | `irregular-playback-typewriter` | 文本 |
| 32 | `stagger` | 基础 stagger |
| 37 | `auto-layout/cards` | 3D 卡片 |
| 39 | `svg-graph` | SVG |
| 47 | `animatable-follow-cursor` | 鼠标跟随 |
| 48 | `onscroll-responsive-scope` | 3D 卡片 |
| 55 | `onscroll-sticky` | 3D 卡片 |
| 60 | `additive-fireflies` | 粒子 |
| 60 | `timeline-seamless-loop` | 循环 |
| 63 | `layered-css-transforms` | 流体 |
| 69 | `draggable-infinite-auto-carousel` | 拖拽 |
| 76 | `advanced-grid-staggering` | 网格 |
| 77 | `canvas-2d` | Canvas 粒子 |
| 79 | `svg-line-drawing` | SVG |
| 100 | `draggable-mouse-scroll-snap-carousel` | 拖拽 |
| 104 | `additive-creature` | 粒子 |
| 106 | `clock-playback-controls` | 3D 钟 |
| 146 | `timeline-50K-stars` | 状态机 |
| 200 | `auto-layout/planets` | 球面 |
| 260 | `animejs-v4-logo-animation` | 字符级 |
| 304 | `easings-visualizer` | 调试 |
| 317 | `auto-layout/periodic-table` | 球面 |
| 360 | `draggable-playground` | 3D 拖拽 |

---

## 9. 常见问题 → 跳到哪

| 需求 | 跳到 |
|---|---|
| 我想做"卡片堆 3D 翻转入场" | §1 `onscroll-sticky` |
| 我想做"标题字符逐字入场, 弹入-回弹-就位" | §2 `animejs-v4-logo-animation` (5 段 timeline) |
| 我想做"持续在动的装饰背景" | §3 `layered-css-transforms` |
| 我想做"1000 节点滚动揭示" | §5 `stagger` |
| 我想做"路径描线 (雷达扫描/对勾绿)" | §4 `svg-line-drawing` |
| 我想做"折线图/柱状图 grow" | §4 `svg-graph` |
| 我想做"3D 球面/螺旋布局" | §1 `auto-layout/periodic-table` |
| 我想做"鼠标跟随粒子" | §6 `animatable-follow-cursor` |
| 我想做"拖拽+吸附" | §7 `draggable-mouse-scroll-snap-carousel` |
| 我想做"Canvas 2D 大量粒子 (4000+)" | §3 `canvas-2d` |
| 我想做"3D 拖拽物理" | §1 `draggable-playground` |
| 我想做"自动布局切换" | §6 `auto-layout/todo-list` |
| 我想用 Three.js 做真 3D | **不要用, 改 §1 CSS 3D 替代** — 详见 ANIMEJS-GUIDE.md §6 |
| **我想画有质感的物体 (车/立方体/卡片)** | **§10 质感技法索引** |

---

## 10. 质感技法索引 (按"想要什么质感"反向查)

> **何时用**: 你画任何具体物体 (车/立方体/卡片/人形), 需要"有光影/有金属感/有毛玻璃/有描边"。**至少 1-2 种质感手法叠加, 不做单色 flat**。
> **完整指南**: 详见 ANIMEJS-GUIDE.md §X (5 大共性含材质) + §X.3 质感基础套件 (CSS 套件直接套)。

**8 种质感手法** (按"想要什么"反向查):

| 想要什么 | 用什么手法 | animejs 官方例 | 关键 CSS |
|---|---|---|---|
| **金属反光** (车体/工具/立方体) | `linear-gradient(180deg, 浅 → 中 → 深)` | `clock-playback-controls` | `background: linear-gradient(180deg, #fafafa 0%, #d8d8d8 50%, #c0c0c0 100%);` |
| **光晕/灯泡发光** (尾灯/光点) | `radial-gradient` + `box-shadow: 0 0 20px` | `additive-creature` | `background: radial-gradient(circle, rgba(255,200,100,0.8) 0%, transparent 70%); box-shadow: 0 0 20px rgba(255,200,100,0.6);` |
| **卡片投影** (3D 卡片/工具卡) | `box-shadow` 多层 (近 + 远) | `onscroll-sticky`, `auto-layout/periodic-table` | `box-shadow: 0 1px 2px rgba(0,0,0,.3), 0 8px 16px rgba(0,0,0,.15), inset 0 1px 0 rgba(255,255,255,.6);` |
| **远景物体深度** (车/树/远景) | `filter: drop-shadow()` | `onscroll-sticky` | `filter: drop-shadow(0 4px 8px rgba(0, 0, 0, 0.2));` |
| **粒子光晕融合** (萤火虫/烟雾) | `mix-blend-mode: plus-lighter` | `additive-fireflies` | `mix-blend-mode: plus-lighter; background: var(--red);` |
| **路径描线 + 渐变填充** (雷达扫描/对勾绿) | `stroke-dasharray` + `fill: url(#gradient)` | `layered-css-transforms`, `svg-graph` | `stroke-dasharray: 600;` + `<linearGradient id="g">` |
| **毛玻璃** (提示卡/弹出卡) | `backdrop-filter: blur()` + 半透明背景 | `onscroll-responsive-scope` | `background: rgba(20, 20, 40, 0.85); backdrop-filter: blur(8px);` |
| **3D 卡片翻转** (物理演示卡) | `backface-visibility: hidden` + `rotateY(180deg)` | `onscroll-sticky` | `.front { backface-visibility: hidden; } .back { backface-visibility: hidden; transform: rotateY(180deg); }` |

**8 种手法 ↔ 8 个 animejs 官方例 反向查**:

| 想要什么 | 看哪个示例 | 关键文件 |
|---|---|---|
| 我想画**金属车体** | `clock-playback-controls` (3D 钟面) | `index.html` 钟面金属 gradient |
| 我想画**光晕/烟雾** | `additive-creature` (13×13 网格) | `index.html` mix-blend-mode + 径向渐变 |
| 我想画**3D 卡片堆** | `onscroll-sticky` (17 张卡片) | `index.html` 多层 box-shadow + backface-visibility |
| 我想画**3D 旋转物体** | `onscroll-responsive-scope` (12 卡片) | `index.html` 多层 box-shadow + backdrop-filter |
| 我想画**粒子萤火虫** | `additive-fireflies` (60 粒子) | `index.js` + `index.html` mix-blend-mode |
| 我想画**路径描线 + 渐变** | `svg-graph` (折线图) | `index.html` linearGradient + mask |
| 我想画**粒子 3D 网格** | `auto-layout/periodic-table` (sphere/helix) | `index.js` 200 行 + CSS box-shadow + 圆角 |
| 我想画**钟面指针/旋转** | `clock-playback-controls` (3D 钟) | `index.html` 3D rotate + 透视 |

**核心原则**:
- **≥ 2 种手法叠加 = 有质感** (硬约束 #7 lint 必查)
- **≥ 3 种手法叠加 = 优秀** (范例级)
- **0-1 种 = 警告, 课件美感单薄**
- 详见 ANIMEJS-GUIDE.md §X 完整指南 (含基础套件 CSS 8 块)

---

## 11. License 与引用规范

## 10. License 与引用规范

- animejs 官方 License: **MIT** (允许自由使用 + 修改 + 商用, 需保留版权)
- 本索引**仅引用**示例位置 + 适用场景, **不复制**完整代码到本仓库
- LLM agent 需要看完整源码时, 通过 `github.com/juliangarnier/anime/blob/master/examples/<name>/index.js` 链接
- LLM agent 写自己的章节时, **不要直接复制** animejs 官方代码 — 而是按"看完官方代码学范式" → 写自己的版本

---

*索引版本 v1.0 — 25 个 animejs 官方示例, 按 8 大类 (CSS 3D / 字符级 / 流体 / SVG / Stagger / Timeline / 拖拽 / 其他) 分类速查。*
