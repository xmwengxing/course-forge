# 画面设计升级方案

> 解决：色彩单一 · 扁平无立体 · 核心知识点不吸睛 · 风格固化
> 基于 2026-07-16 demo 验收反馈 + 教学动画设计原则研究

---

## 一、当前问题回溯（demo 验收发现）

| 问题 | 表现 | 根因（skill） |
|---|---|---|
| 色彩单一 | chalk-garden 只用黄+青两色，其余灰白 | 主题有 5 个 accent 色（黄/青/绿/橙/紫）但 agent 只用 1-2 个，skill 没鼓励多色语义对比 |
| 扁平无立体 | SVG 元素 `fill="var(--accent)"` 纯色块，无 gradient/shadow/glow | ANIMEJS-GUIDE 的 8 材质手法是"参考"非"硬约束"，agent 偷懒用纯色；lint 不检查材质 |
| 核心不吸睛 | 坐标系 0 点/X轴出现时是"瞬间显示"，无 spotlight/缩放/粒子 | CHAPTER-CRAFT 有"内容驱动动画"原则但缺"核心知识点着重渲染"的具体手法库 |
| 风格固化 | agent 照抄示例风格 | EXAMPLES/ + templates/01-example/02-ide 自带固化示例 |

---

## 二、四大支柱（核心方法论）

### 支柱 1 · 视觉焦点单一化
**原则**：每屏一个视觉重心，核心知识点放大 + 居中，背景留白弱化。

- 关键元素放大（1.5-2×）或居中，次要元素缩小/灰化
- 背景留白（安全区 ≥ 80px），不堆砌
- **自检**：关掉所有文字，屏上还有一个明确的视觉重心 → 合格；没有 → 回去补

### 支柱 2 · 对比层次（核心突出）
**原则**：核心用亮 accent + 周围 dim 0.4，多色语义对比。

- 核心 step 激活时，非核心元素 `opacity: 0.4` 弱化（dim），核心满亮
- 多色语义对比：用主题的多个 accent 色表达不同语义
  - `--accent`（主强调，黄）= 当前核心
  - `--accent-tech`（青）= 辅助/对比维度
  - `--accent-good`（绿）= 正确/完成
  - `--accent-warn`（橙）= 警告/待办
  - `--accent-deep`（紫）= 深层/高级
- **禁**全屏单色；核心知识点必用"对比色对"（如黄+青、黄+绿）

### 支柱 3 · 材质立体（升级硬约束）
**原则**：核心视觉元素 ≥ 2 种材质手法叠加，告别纯色 flat。

ANIMEJS-GUIDE §X 的 8 材质手法从"参考"升级为**硬约束**：
1. `linear-gradient` — 金属反光/光照变化
2. `radial-gradient` — 阴影/光晕/发光
3. `box-shadow` 多层 — 卡片立体/物体投影
4. `filter: drop-shadow()` — 远景深度
5. `mix-blend-mode: plus-lighter` — 光晕/烟雾叠加
6. `stroke-dasharray` 描线 + `fill` 渐变 — 路径描线
7. `backdrop-filter: blur()` — 毛玻璃提示卡
8. `backface-visibility: hidden` — 3D 翻转

**判定**：
- 核心元素 ≥ 2 种手法 = 合格
- ≥ 3 种 = 优秀
- 0-1 种纯色 = **FAIL**（lint 拦截）

### 支柱 4 · 动态强调手法库
**原则**：核心知识点出现时必"演"出来，禁瞬间显示。

| 手法 | 适用 | 实现 |
|---|---|---|
| **spotlight 聚光** | 核心元素出现时 | 核心亮 + 径向遮罩 dim 周围（`radial-gradient` 蒙版） |
| **描线自绘** | 轴线/路径/连线 | `stroke-dashoffset` 动画（非瞬间显示） |
| **粒子聚拢** | 核心形成时 | 多点 `transform` 聚合到目标位置（animejs stagger） |
| **缩放脉冲** | 核心数字/结论出现 | `scale` 0→1.2→1 弹跳（outBack easing） |
| **数字递增** | 数据/统计 | count-up（animejs animate 数字属性） |
| **对比切开** | before/after | 中线自绘 + 左右分色高亮 |

**禁**：核心知识点用 `opacity: 0→1` 瞬间淡入（= PPT）；必须伴随至少 1 种动态强调。

---

## 三、配套：删除示例 + 借鉴开源

### 删除项目示例（避免风格固化）
- 删 `references/EXAMPLES/`（example-anime / hook-chapter / list-reveal / example-runner / example-live-editor / case-tech-review）
- 删 `templates/src/chapters/01-example/` + `02-ide/`
- agent 从零设计，不再有"标准答案"可抄

### 借鉴开源（替代自带示例）
CHAPTER-CRAFT / ANIMEJS-GUIDE 引用开源材质范例，而非自带固化示例：
- **animejs 官方示例**（材质层次标杆）：`layered-css-transforms`（gradient+shadow+描线）、`additive-creature`（radial+mix-blend+shadow）、`clock-playback-controls`（gradient+shadow+透视）、`auto-layout/periodic-table`（shadow 多层+gradient）
- **教学动画设计原则**（搜索研究）：
  - 视觉焦点单一化（每屏一个重心，核心放大居中）
  - 对比突出（核心亮色 + 背景弱化 dim）
  - 纵深层次（悬浮/阴影让画面立体）
  - 动态高亮（核心出现时闪烁/脉冲/聚光，其他调暗）
  - 效果服务内容（强调只用在真正重点，不堆砌）

---

## 四、落地清单

| 文件 | 改动 |
|---|---|
| `references/CHAPTER-CRAFT.md` | 新增「视觉焦点与着重渲染」段（四大支柱）+ 移除 EXAMPLES 引用 |
| `references/ANIMEJS-GUIDE.md` | 材质 8 手法从"参考"标注为"硬约束" |
| `templates/scripts/lint-course.py` | 新增材质检查：核心元素 CSS 检测 gradient/shadow 使用率，纯色=FAIL |
| `templates/src/registry/chapters.ts` | 移除 Example/Ide import，CHAPTERS 空数组 + 注释引导从零写 |
| `templates/src/chapters/01-example/` + `02-ide/` | 删除 |
| `references/EXAMPLES/` | 删除整个目录 |
| `SKILL.md` | 移除 EXAMPLES/01-example 引用，文件读取指南更新 |
| `scripts/scaffold.sh` | 移除拷贝 01-example 步骤，改为创建空 chapters 结构 + 注释引导 |

---

## 五、验收标准

升级完成的标志：
- [ ] CHAPTER-CRAFT 有「视觉焦点与着重渲染」段（四大支柱）
- [ ] ANIMEJS-GUIDE 材质手法标注为硬约束
- [ ] lint 检查材质使用率（纯色核心=FAIL）
- [ ] EXAMPLES/ + 01-example + 02-ide 已删除
- [ ] chapters.ts 无示例 import，引导从零写
- [ ] SKILL.md/scaffold.sh 无示例引用
- [ ] demo 重做后核心知识点有 spotlight/材质/动态强调
