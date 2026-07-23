# SCENE-BLUEPRINTS.md

> **Skill 角色定位**：course-forge 的「多阶段场景编排参考」。原子配方在 `ANIMATION-RECIPES.md`；本文件是**教学相关**的多阶段场景模板（意图 → 时长 → 阶段结构 → 用的哪些配方），帮 agent 在"这一屏要讲什么"时快速选一个相位骨架。
>
> **来源**：移植自 `heygen-com/hyperframes` 的 `blueprints/`（GSAP 蓝图改写为 anime.js 编排描述）。**与四大支柱同构**：每个蓝图都服务某个教学角色（Hook / Key_Feature / Problem / 对比 / 数据 / 关系）。
>
> **面向读者**：LLM agent。**不要整段套用**——这是相位骨架，具体元素/文案/时长按本章内容现编（见 CHAPTER-CRAFT 风格固化警告）。**配方实现查 `ANIMATION-RECIPES.md`**。
>
> **课程映射**：课件"屏"≈ hyperframes"scene/clip"；课件 `step` 驱动 ≈ hyperframes 单条 paused 时间线。下面时长按"一屏"估算，课件单屏通常 5–15s（见 COURSE-STRUCTURE 密度约束）。

---

## 1. titlecard-reveal — 章节/小节开场（Hook）

**意图**：标题卡揭幕，副标题随后落入；建立本节主题。
**教学角色**：每章/小节开场；转场。
**时长**：1.5–2.5s（屏常驻更久，揭幕只是入场）。
**阶段结构**：
- S1 标题卡 `scale 1.06→1` + `opacity 0→1` + 左→右 `clipPath` 擦除（`ANIMATION-RECIPES §10`）
- S2 副标题 `opacity 0→1` + `y 12→0`，错开 ~0.5s
- 可选：标题卡背后 `ambient-glow-bloom` 涨光（`§1`）
**rule 映射**：`titlecard-reveal` + `ambient-glow-bloom`

---

## 2. comparison-split — 对比屏（Key_Feature / 对比）

**意图**：两个等权项并排、镜像 3D tilt 入场，内侧 badge 落点——"它们要被放一起称重"，不是顺序讲。
**教学角色**：A/B 对比、X+Y 协同、配对概念。
**时长**：4–6s。
**阶段结构**：
- S1 标题从上方 `slide-down` 落入（与卡成 T 形，不冲突）
- S2 两卡从**相反侧**镜像 `rotateY` tilt 入场（左朝右、右朝左，书展开），scale 0.85→1，重叠 ~0.2s 成一拍
- S3 内侧 badge 弹性落点（唯一点睛 overshoot），随后持稳
- 双侧各一色辉光（`ambient-glow-bloom`）
**rule 映射**：`comparison-split`(§2) + `ambient-glow-bloom`(§1) + `spring-pop-entrance`(§6)

---

## 3. dataviz-countup — 数据论点屏（Problem / Key_Feature / Hook）

**意图**：让数字和图当主角——count-up 数字 + 趋势图/进度环/柱状，相机（或视觉重心）推到 hero 指标。
**教学角色**：量化痛点、亮结果、证特性。
**时长**：4–12s（课件可截成多屏）。
**阶段结构**：
- S1 首个数据仪器居中建立：`stat` 数字 `count-up` + `scale` 长到终态；配图（进度环扫到 pct / 柱状长起）**同一 ease 落位=一拍**
- S2 视觉重心推到下一仪器（课件=焦点切换 + `depth-of-field-blur` 聚焦）；新数字 count-up
- S3 落定 hero 指标卡居中，背后 `ambient-glow-bloom` 涨光，持稳
- 变体：趋势线 `svg-path-draw` 左→右自绘（`§4`）；散点/头像 `spring-pop-entrance` 弹出（`§6`）
**rule 映射**：`stat-bars-and-fills`(§7) + `svg-path-draw`(§4) + `spring-pop-entrance`(§6) + `ambient-glow-bloom`(§1) + `depth-of-field-blur`(§3)

---

## 4. grid-card-assemble — 概念卡墙屏（Key_Feature）

**意图**：N 个带标签瓦片/卡以错开级联**拼**成网格并持稳——"看它包含多少/哪些概念"。
**教学角色**：特性墙、知识点枚举、术语表。
**时长**：3–10s（课件 ~1 项/秒 节奏）。
**阶段结构**：
- S1 空网格建立，瓦片 `opacity+scale+y` 短距错开入槽（低戏剧，stagger 0.05–0.08）
- S2 布局解析为最终网格/竖列，持稳（极轻 parallax/sine 浮动 或 缓推近）
- S3 可选：辉光在瓦片后**一次性扫过**（`ambient-glow-bloom` TRAVELING SWEEP）；或清场到居中结论行
**rule 映射**：`grid-card-assemble`(§9) + `ambient-glow-bloom`(§1)

---

## 5. constellation-hub — 节点 / 关系屏（Hook / 关系网）

**意图**：带标签节点 spring-pop 成环/簇绕中心，再聚焦核心——"万物连到/围绕一个中心"。呼应 course-forge 现有 `NodeGraph` 互动组件。
**教学角色**：系统组成、生态关系、中心概念辐射。
**时长**：5–8s。
**阶段结构**：
- S1 主节点 `spring-pop-entrance`(弹性 ~1.15 overshoot) 成宽环/簇绕中心
- S2 次级节点同弹性错开补位；hub→节点连线 / 轨道环 `svg-path-draw` 自绘
- S3 聚焦核心：相机（课件=缩放+`depth-of-field-blur`）推近中心，外节点 blur 退场，落定持稳
- 变体：中心品牌标记 3D 翻转入；伙伴徽章顺时针公转保持正向
**rule 映射**：`spring-pop-entrance`(§6) + `svg-path-draw`(§4) + `depth-of-field-blur`(§3) + `ambient-glow-bloom`(§1)

---

## 6. typewriter-reveal — 逐字揭示屏（讲解 / 代码）

**意图**：文字/代码逐字（或逐行）打出，光标闪烁，强调"正在生成/正在写"。
**教学角色**：代码演示、公式推导、逐句讲解。
**时长**：按字数，2–6s。
**阶段结构**：
- S1 文本容器定位；首字出现，方波闪烁光标（确定性边界，非随机）
- S2 逐字/逐行追加，已出文字持稳；行尾换行
- S3 完成：光标停或淡出；可选末句 `kinetic-type-beats` 字符级强调（`§8`）
**rule 映射**：`kinetic-type-beats`(§8)（字符级收尾）+ `spring-pop-entrance`（容器入场）

---

## 7. zoom-out-workspace-reveal — 放大揭幕屏（Benefits / Hook）

**意图**：开场满屏特写（图形/小 UI 区）在动，一次指数减速 zoom-out 揭出它在更大的"工作区/画板"里，然后锁帧、元素级收尾。
**教学角色**："看 agent 做了多少 → 这是交付物"；从细节到全局。
**时长**：6.8–11s。
**阶段结构**：
- S1 满屏特写 + 微动（无 chrome）；特写本身在表演
- S2 中间层级：zoom-out 解析出中层级构图（仍在动）
- S3 **一次**减速 zoom-out 到全局，落定锁帧（`expo.out`/`power4.out` 减速到停）
- S4 锁帧后元素级收尾（光标悬停、时间轴 scrub、面板换内容——布局动非相机）
**rule 映射**：`viewport-change`(zoom-out) + `depth-of-field-blur`(模糊转清晰) + `spring-pop-entrance`(行入) + `svg-path-draw`(画布内旋转自绘)
**⚠️ 硬规则**：全屏**只有一次向外 zoom**，无任何 push-in；揭幕减速到停后帧锁死，之后只元素/布局动。

---

## 选型速查

| 本屏要讲 | 用哪个蓝图 |
|---|---|
| 开章/转场定调 | `titlecard-reveal` |
| 两个东西放一起比 | `comparison-split` |
| 用数据说话/量化 | `dataviz-countup` |
| 列一堆概念/特性 | `grid-card-assemble` |
| 系统组成/关系网 | `constellation-hub` |
| 写代码/推公式 | `typewriter-reveal` |
| 从细节揭到全局 | `zoom-out-workspace-reveal` |

> 每个蓝图 = 相位骨架，不是成品。落地时从 `ANIMATION-RECIPES.md` 挑 2–4 条配方组合，按本章内容现编元素、文案、精确时长。详见 CHAPTER-CRAFT「视觉焦点与着重渲染（四大支柱）」。
