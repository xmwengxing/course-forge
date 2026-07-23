# ANIMATION-RECIPES.md

> **Skill 角色定位**：course-forge 的「动画词汇补强层」。SKILL.md / CHAPTER-CRAFT.md（四大支柱）/ ANIMEJS-GUIDE.md 定义核心行为与基础 API；本文件只补充**可组合的原子动画配方**——当你要为某屏加「材质 / 对比 / 动态强调」但现有 8 手法不够用时，来这里挑 2–4 条组合。
>
> **来源**：移植自 `heygen-com/hyperframes` 的 motion 库（`skills/hyperframes-animation/rules/`、`blueprints/`）。原库用 GSAP，本文件**全部改写为 anime.js v4.4.1** 语义（见 ANIMEJS-GUIDE.md），不引入 GSAP。
>
> **面向读者**：LLM agent，不是人。**每条 = 触发/适用 → anime.js 最小片段 → 取值表 → 约束 → 映射支柱**。
>
> **⚠️ 风格固化红线（来自 CHAPTER-CRAFT 警告）**：本文件是**词汇与技法**字典，**不是场景模板**。每屏按内容现编，从下面挑 2–4 条搭配；**禁止整段复制某条配方当整屏**——曾有项目因照抄固定套路导致所有章节动画风格固化、效果变差。参考 API 用法、参考 step 驱动 + useEffect revert 清理模式、参考 token 主题隔离，其他按内容现编。

---

## 0. 调用约定（anime.js v4.4.1）

```js
import { animate, createTimeline, stagger, utils, createSpring, svg } from 'animejs';

// ① 单条动画（step 驱动）
animate('.mark', { opacity: [0, 1], duration: 400 });

// ② 时间线（autoplay:false → 由 course-forge 的 step 时钟驱动；revert 用 tl.revert()）
const tl = createTimeline({ autoplay: false, defaults: { ease: 'outQuad' } });
tl.add('#a', { x: 280, rotate: '1turn', duration: 1200 }, 0)        // 位置 = 第 3 参数(ms / '+=N' / '<' / '>')
  .add('#b', { scaleX: [0, 1], duration: 450 }, 250);

// ③ 错开：delay: stagger(N, { from: 'first' | 'center' | 'last' })
animate('.item', { opacity: [0,1], delay: stagger(80, { from: 'center' }) });

// ④ 弹性/回弹：createSpring()（project 已用，见 ANIMEJS-GUIDE §X）
animate('.pop', { scale: [0, 1], ease: createSpring() });
```

**缓动命名**（与项目一致）：`outQuad` `outExpo` `outSine` `inOutQuad` `inOutSine` `inOutQuint` `linear`；弹性用 `createSpring()`，勿用 `back.out` 卡通回弹（除非明确 playful 章节）。

**step 驱动清理**：所有动画在章节 `useEffect` 内创建，依赖变化时 `tl.revert()` / `animate(...).revert()`，避免跨 step 残留（见 CHAPTER-CRAFT「完工自检」）。

---

## 1. ambient-glow-bloom — 辉光 / 材质（支柱 3）

**触发**：核心元素落位时，背后涨起一团柔光给它"存在感"；或一束高光在表面扫过一次。**不**点不说话——它自己 blooming。
**映射**：支柱 3 材质立体（glow 层）、支柱 4 动态强调。

```js
// 辉光层在 hero 背后 (z-index:1)，hero 在前 (z-index:2)；glow 色比 hero 更深更饱和
const tl = createTimeline({ autoplay: false });
// ① HERO BLOOM — 与 hero 落位同一拍
tl.add('#bloom-glow',
  { opacity: [0, GLOW_PEAK], scale: [GLOW_START_SCALE, 1], duration: BLOOM_DUR, ease: 'outQuad' },
  BLOOM_START);
// ② BOUNDED BREATHE — 有限 driver 推 proxy，onUpdate 微调；非 yoyo 循环
const phase = { p: 0 };
tl.add(phase,
  { p: Math.PI * 2 * BREATHE_CYCLES, duration: BREATHE_DUR, ease: 'linear',
    onUpdate: () => {
      const s = Math.sin(phase.p);
      glow.style.opacity = String(GLOW_PEAK + s * OPACITY_AMP);
      glow.style.transform = `scale(${1 + s * SCALE_AMP})`;
    } },
  BLOOM_START + BLOOM_DUR);
// ③ TRAVELING SWEEP — 一次性扫过（高光带 overflow:hidden 裁剪）
tl.add('#sweep',
  { translateX: [SWEEP_START_X, SWEEP_END_X], opacity: [0, SWEEP_PEAK], duration: SWEEP_DUR, ease: 'linear' },
  SWEEP_START);
```

| token | 范围 / 默认 | 注意 |
|---|---|---|
| GLOW_PEAK | 0.15 → 0.30（默认）→ **0.45 硬上限** | 超过就糊屏； conscious 才注意到 = 太强 |
| GLOW_START_SCALE | 0.80–1.0 | ≤1，涨入而非缩入 |
| BLOOM_DUR / START | 0.6–1.4s | START+DUR ≈ hero 落位帧 |
| OPACITY_AMP / SCALE_AMP | 0.02–0.05 / 0.01–0.03 | PEAK+AMP ≤ 0.45 |
| SWEEP_DUR | 0.8–1.6s | 一次从容扫过，像光非 shimmer |

**约束**：辉光在 hero **背后**、hero 在前；辉光色更深更饱和；落位与辉光同一拍（前后=两件事）；breathe 有界、sweep 一次过；**不要把 boxShadow 辉光叠在同元素上**（两者打架发糊）。

---

## 2. comparison-split — 镜像对比（支柱 2）

**触发**：两个等权项需**并排同时**比较（A/B、X+Y、配对概念），不是顺序步骤。**映射**：支柱 2 对比层次（核心突出）。

```js
// 父级 perspective: 1000px; transform-style: preserve-3d；两侧 50% 对称轴，各拥一色身份
const tl = createTimeline({ autoplay: false });
tl.add('#left-card',
  { translateX: [-OFF, 0], rotateY: [TILT, 0], scale: [0.85, 1], opacity: [0, 1],
    duration: 900, ease: 'outExpo' }, 0);
tl.add('#right-card',
  { translateX: [OFF, 0], rotateY: [-TILT, 0], scale: [0.85, 1], opacity: [0, 1],
    duration: 900, ease: 'outExpo' }, 200);
// 内侧 badge 弹性落点（唯一点睛 overshoot）
tl.add('#badge-left',  { scale: [0, 1], opacity: [0, 1], duration: 450, ease: createSpring() }, 1700);
tl.add('#badge-right', { scale: [0, 1], opacity: [0, 1], duration: 450, ease: createSpring() }, 2000);
```

**约束**：两张卡镜像 `rotateY`（左朝右、右朝左，如书展开），落地 scale 0.85→1；阴影随 tilt 向外（左影右、右影左）；badge 落内侧、重叠 ~15%；**静态相机**——对称本身就是主体，移动会破平衡。可与 `ambient-glow-bloom` 双侧辉光同用（每侧一色）。

---

## 3. depth-of-field-blur — 景深聚焦 / spotlight（支柱 2 / 4）

**触发**：把视线拉到一个焦点，其余模糊+轻微变暗；或两深度面之间 rack-focus。**映射**：支柱 2 对比层次（聚焦突出）、支柱 4 动态强调（spotlight）。

```js
// 每层带 --dof(px)，filter: blur(var(--dof))；焦点层 --dof:0 且 z-index 最高
const tl = createTimeline({ autoplay: false });
tl.add('.ctx',
  { '--dof': (el) => `${BLUR_PER_DEPTH * Number(el.dataset.depth || 1)}px`,
    opacity: DIM_LEVEL, duration: FOCUS_DUR, ease: 'inOutQuad' },
  FOCUS_START);
```

| token | 范围 | 注意 |
|---|---|---|
| BLUR_PER_DEPTH | 3–6 px / 深度档 | 3 层叠顶 ~9–18px |
| MAX_BLUR | 8 柔 → 16 默认 → 24 重 | >24px 改为缩小/分组图层 |
| GRID_BLUR | 6–12 px | 推远卡片但不失网格形状 |
| DIM_LEVEL | 0.4–0.7 | 变暗非消失 |

**约束**：焦点层 `--dof:0` 且 `z-index` 高于模糊层（否则清晰边缘像渗进雾里）；blur 用 CSS 变量驱动（paint-only，可确定性 seek）；rack-focus 两平面在**同一 position+时长**交叉，保证手感连续。

---

## 4. svg-path-draw — 自绘描线（支柱 4）

**触发**：核心图形/图标/连线像被笔"画"出来——logo 描边、节点连线、进度环。**映射**：支柱 4 动态强调（course-forge 已在用，这里给标准配方）。

```js
// 测量真实长度，绝不用魔法数字；fill:none 否则填充会抢戏
document.querySelectorAll('.draw-path').forEach((p) => {
  const len = p.getTotalLength();
  p.style.strokeDasharray = `${len}`;
  p.style.strokeDashoffset = `${len}`;
});
animate('.draw-path',
  { strokeDashoffset: 0, duration: SEG_DUR, ease: 'outQuad',
    delay: stagger(SEG_GAP, { from: 'first' }) });   // 每段在上段 ~70-80% 处接续
// 环从 12 点起：<circle> 在 CSS 里 transform: rotate(-90deg); transform-origin: 中心
```

**约束**：`fill: none`（描边才像在画）；`stroke-linecap/linejoin: round` 更柔；线性匀速用 `ease: 'linear'`（"真笔"感）；画完再 `fillOpacity: 0→1`（如需要）。与 `spring-pop-entrance` 的节点连用 = 节点弹出后连线自绘（见 `constellation-hub` 蓝图）。

---

## 5. particle-burst — 粒子迸发（支柱 4）

**触发**：一次性庆祝/标点事件——彩纸向上迸再下落、文字背后光点辐射、字形碎成粒子散开。**映射**：支柱 4 动态强调（点睛 punctuation，非布局）。

```js
// 确定性粒子池：setup 时建一次；每粒 i 由纯函数 prand(i) 派生 angle/speed/size/color
const prand = (n) => { const x = Math.sin(n * 127.1 + 311.7) * 43758.5453; return x - Math.floor(x); };
const parts = [];
for (let i = 0; i < COUNT; i++) {
  const el = document.createElement('div'); el.className = 'particle';
  el.style.background = palette[i % palette.length]; field.appendChild(el);
  const a = -Math.PI/2 + (prand(i*5+2)*2 - 1) * CONE;   // 向上锥
  const s = SPEED_MIN + prand(i*7+3) * (SPEED_MAX - SPEED_MIN);
  parts.push({ el, vx: Math.cos(a)*s, vy: Math.sin(a)*s });
}
// 弹道 driver：ease:'linear' 是载重属性（重力在公式里，不在曲线里）
const T = { t: 0 };
animate(T, { t: 1, duration: FLIGHT_DUR, ease: 'linear',
  onUpdate: () => {
    const time = T.t * FLIGHT_DUR;
    parts.forEach((p, i) => {
      const x = p.vx * time;
      const y = p.vy * time + 0.5 * G * time * time;   // 重力给起-减速-落弧
      p.el.style.transform = `translate(${x}px, ${y}px) rotate(${p.spin*time}deg)`;
      p.el.style.opacity = T.t > 1 - FADE_FRAC ? (1 - (T.t - (1-FADE_FRAC))/FADE_FRAC) : 1;
    });
  } });
```

**约束**：粒子瞬态装饰，born from a beat → fly → gone，**永不成布局**；位置是 T 的纯函数（确定性 seek，任意帧正确）；`ease:'linear'` 不可改（改了重力就假）；收尾 opacity 拖尾或末端瞬缩至 0，保持不可见。

---

## 6. spring-pop-entrance — 弹性入场（通用入场）

**触发**：元素（或错开组）从 `scale:0` 平滑落位——**arrival 非 reaction**。**映射**：通用入场（卡片/图标/要点）。

```js
const tl = createTimeline({ autoplay: false });
tl.add('#hero', { scale: [0, 1], opacity: [0, 1], duration: POP_DUR, ease: 'outExpo' }, ENTRY_AT);
tl.add('.pop-item',
  { scale: [0, 1], opacity: [0, 1], y: [Y_RISE, 0], duration: POP_DUR, ease: 'outExpo',
    delay: stagger(STAGGER, { from: 'first' }) },            // 整组 = 一个到达拍
  GROUP_ENTRY_AT);
// playful 变体（仅消费/童趣章节）：ease: createSpring()
```

| token | 范围 | 注意 |
|---|---|---|
| EASE | `outExpo` 默认；`createSpring()` playful | `back.out` 卡通回弹 = 雷区，几乎从不做好 |
| POP_DUR | 0.4–0.7s | hero 须在 t≤0.5s 可见 |
| Y_RISE | 0（premium）→ 24px（默认） | scale 增长是载重，y 是点缀 |

**约束**：`fromTo`（显式起态）保证 step 驱动下 t=0 正确；**不要手 key `scale:1.1` 中段**（与曲线双弹）；落位后**持稳不循环**；需要活气交给 `depth-of-field-blur` 同屏或下一元素 VO 入。

---

## 7. stat-bars-and-fills — 数据条 / 进度环 + count-up（支柱 4 + 数据）

**触发**：给数字配可视化分量——柱状图、进度条/环、星级擦除。**映射**：支柱 4 动态强调；数据类屏首选。

```js
// ① 增长柱（scaleY，origin 底部；高度写 CSS，绝不动画 height）
animate('.bar', { scaleY: [0, 1], duration: 700, ease: 'outQuad', delay: stagger(80) });
// ② 进度条（scaleX，origin 左侧；fill 必须 width:100% 否则 scaleX(0) 仍 0）
animate('.fill', { scaleX: PCT, duration: 1000, ease: 'outQuad', transformOrigin: 'left center' });
// ③ 进度环（测量 + 描线，见 §4）
const L = ring.getTotalLength(); ring.style.strokeDasharray = L; ring.style.strokeDashoffset = L;
animate(ring, { strokeDashoffset: L * (1 - PCT), duration: 1100, ease: 'outQuad' });
// ④ count-up 数字（proxy + onUpdate 取整）
const n = { v: 0 };
animate(n, { v: END, duration: 1100, ease: 'outQuad',
  onUpdate: () => { numEl.textContent = Math.round(n.v).toLocaleString(); } });
```

**约束**：同屏所有 stat 用**同一种**布局（单焦点居中 / 左右分栏），别混；数字与图形**同一 ease 落位=一拍**；柱状 `transform-origin: bottom`（从基线长起）；进度条 fill 必须 `width:100%`。与 `spring-pop-entrance` 组 = 数据卡弹出。

---

## 8. kinetic-type-beats — 字符级入场（支柱 4）

**触发**：标题/关键词逐字符弹入（非整体淡入）——冲击力来自 stagger 节奏。**映射**：支柱 4 动态强调。

```js
// 文本需拆成 .letter span（demo 用 .letter-stagger > .letter 并设 --i）
animate('.letter', {
  keyframes: [
    { y: [35, -80], scale: [1, 1.2], duration: 190, ease: 'outQuad' },  // 弹起
    { y: 0, scale: 1, duration: 260, ease: 'outQuad' },                 // 就位
  ],
  delay: stagger(70, { from: 'center' }),   // 字符级 stagger
});
// 加强：字符弹入时加 text-shadow 模拟光晕（见 §1），标题立刻有冲击
```

**约束**：字符**整体 fade-in 无 stagger** = 像 PPT，死板；只 1 段 keyframe 的 stagger = 整齐无弹入-回弹节奏；`from: 'center'` 让中间先动，更有"炸开"感。详细见 ANIMEJS-GUIDE §2。

---

## 9. grid-card-assemble — 卡片组装（通用入场）

**触发**：N 个瓦片/卡/要点以错开级联**拼**成网格或竖列并持稳——"看它做了多少/有哪些"的枚举拍。**映射**：通用入场（概念卡屏、特性墙）。

```js
// 每项 淡入+短距滑/缩入槽位（低戏剧：无散射、无大弹；stagger 0.05–0.08）
animate('.tile',
  { opacity: [0, 1], scale: [0.9, 1], y: [24, 0], duration: 520, ease: 'outQuad',
    delay: stagger(70, { from: 'center' }) });
// 持稳期轻微浮动（有界，loop 允许但幅度小）
animate('.tile', { y: [0, -6], duration: 2600, ease: 'inOutSine', loop: true, alternate: true,
  delay: stagger(120) });
```

**约束**：低戏剧组装（弹簧 overshoot 只留给强调标记，见 §6）；组装完**持稳**（可加极轻 parallax/sine 浮动或缓推近）；可选辉光在瓦片后**一次性扫过**（见 §1 TRAVELING SWEEP）；别混"中心爆发"和"直接入槽"两种布局。竖列变体 ~1 项/秒。

---

## 10. titlecard-reveal — 标题卡揭幕（通用入场）

**触发**：章节标题卡以缩放/遮罩揭幕，副标题随后落入。**映射**：通用入场（章节开场/小节转场）。

```js
const tl = createTimeline({ autoplay: false });
tl.add('.title-card',
  { scale: [1.06, 1], opacity: [0, 1],
    clipPath: ['inset(0 100% 0 0)', 'inset(0 0% 0 0)'],   // 左→右擦除（起止同结构可动画）
    duration: 700, ease: 'outExpo' }, 0)
  .add('.subtitle', { opacity: [0, 1], y: [12, 0], duration: 420, ease: 'outQuad' }, 500);
```

**约束**：擦除式揭幕用 `clipPath` 需起止字符串**同结构**（anime.js 才能插值）；如不想赌 clip-path 插值，改用遮罩层 `translateX` 或 `scaleX` 擦除；标题与副标题错开 0.4–0.5s = 一个呼吸。可与 §1 辉光同屏（标题卡背后涨光）。

---

## 附：组合示例（每屏 2–4 条）

- **核心概念揭幕屏**：`titlecard-reveal`(标题) + `ambient-glow-bloom`(背后涨光) + `svg-path-draw`(图标自绘) → 满足 支柱3+4
- **A/B 对比屏**：`comparison-split`(镜像卡) + `ambient-glow-bloom`(双侧辉光) + `spring-pop-entrance`(badge) → 满足 支柱2
- **数据论点屏**：`stat-bars-and-fills`(柱+环+count-up) + `depth-of-field-blur`(聚焦 hero 指标) → 满足 支柱2+4
- **概念卡墙屏**：`grid-card-assemble`(拼装) + `ambient-glow-bloom`(辉光扫过) → 满足 支柱3
- **节点/关系屏**：`spring-pop-entrance`(节点弹出) + `svg-path-draw`(连线自绘) + `depth-of-field-blur`(聚焦核心) → 见 `constellation-hub` 蓝图

> 选型原则：每屏**一个视觉重心**（支柱 1）；核心知识点至少配 **≥1 条动态强调**（支柱 4）+ **≥2 种材质手法叠加**（支柱 3：glow/渐变/阴影/描线选其 2）。详见 CHAPTER-CRAFT「视觉焦点与着重渲染（四大支柱）」与 `SCENE-BLUEPRINTS.md`。
