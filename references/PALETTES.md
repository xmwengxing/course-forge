# PALETTES.md

> **Skill 角色定位**：course-forge 的「配色速查」。当某章/某屏需要特定情绪时，从 9 种 mood palette 里挑一个，再把它的代表色映射到 course-forge 的 theme token（`tokens.css` 的 `--accent` / `--accent-tech` / `--surface` / `--text` 等）。
>
> **来源**：移植自 `heygen-com/hyperframes` 的 `skills/hyperframes-creative/palettes/`（9 套工业级配色）。course-forge 自带 6 个 theme（midnight-press / chalk-garden / paper-press / blueprint / newsroom / bauhaus-bold）；本文件帮你在**已有 theme 之上**按章节情绪微调强调色，而不是推翻 theme。
>
> **面向读者**：LLM agent。**用法**：定情绪 → 选 mood → 取代表色 → 映射到 token；保持同屏色彩家族一致（见 CHAPTER-CRAFT 支柱 2 对比层次：焦点色唯一、辅色服务）。

---

## 映射约定

course-forge `tokens.css` 关键 token（以 dark theme 为例）：

| token | 角色 | 本文件怎么填 |
|---|---|---|
| `--accent` | 主强调（核心知识点/CTA） | 取 mood 的**高饱和主色** |
| `--accent-tech` | 次强调（技术/数据/点缀） | 取 mood 的**冷调或对比色** |
| `--accent-good` / `--accent-warn` | 状态色 | 绿/橙，跨 mood 基本不动 |
| `--surface` / `--surface-2` | 卡片/次级面 | 取 mood 的**底色家族** |
| `--text` / `--text-2` | 正文/次级 | 取 mood 的**浅色或深色文本** |

> 改色只动 `--accent*` 与少量 surface，**不要动字体/排版/圆角签名**（那是 theme 身份，见各 theme 的 character knobs）。改完跑 lint（材质/反 AI 味校验不反对合理配色）。

---

## 1. bold-energetic — 大胆 / 高能

**适用**：产品发布、官宣、启动课、游戏化/竞技章节。
**代表色**：`#FF006E` `#FB5607` `#FFBE0B` `#3A86FF` `#8338EC`
**映射**：`--accent: #FF006E`（品红炸场）；`--accent-tech: #3A86FF`；底色保持 theme 深色，靠 accent 提能。
**注意**：高能但别全屏高饱和；焦点用 1 个，其余降饱和。

## 2. clean-corporate — 干净 / 商务

**适用**：讲解类、教程、专业内容、企业培训课。
**代表色**：`#EB5E28` `#3D5A80` `#98C1D9` `#293241` `#EE6C4D`
**映射**：`--accent: #EB5E28`（暖橙点睛）；`--accent-tech: #3D5A80`（沉静蓝）；surface 偏 `#F2E9E4` 暖白（light theme 适用）。
**注意**：克制为主，强调色只点睛，留白多。

## 3. dark-premium — 暗 / 高端

**适用**：科技、金融、奢侈品、电影感章节（course-forge 多数 dark theme 天然契合）。
**代表色**：`#FCA311` `#FFC300` `#E5E5E5` `#14213D` `#0D1B2A`
**映射**：`--accent: #FCA311`（金）；`--accent-tech: #48BFE3` 类冷青；surface `#0D1B2A`/`#14213D`。
**注意**：暗底+金/青 = 高级；避免过多彩色，靠材质（glow/渐变）提质感。

## 4. jewel-rich — 珠宝 / 浓烈

**适用**：高端活动、精致内容、强调"珍贵/重要"的章节。
**代表色**：`#5A189A` `#7B2CBF` `#9A031E` `#FB8B24` `#0F4C5C`
**映射**：`--accent: #7B2CBF`（紫宝石）；`--accent-tech: #0F4C5C`（深青）；底色深 `#10002B`/`#240046`。
**注意**：浓色需更深底衬托；焦点 1 个宝石色足够。

## 5. monochrome — 单色 / 戏剧

**适用**：以排版为主、严肃、强调"留白与结构"的章节。
**代表色**：`#212529`→`#ADB5BD` 灰阶；或 `#001233`→`#0466C8` 深蓝阶。
**映射**：`--accent: #0466C8`（唯一蓝点睛于灰阶）；surface/text 走灰阶；其余全单色。
**注意**：极致克制；靠**对比层次**（支柱 2）而非彩色制造焦点——最适合"概念抽象"屏。

## 6. nature-earth — 自然 / 大地

**适用**：可持续、户外、有机、健康、生活类章节。
**代表色**：`#606C38` `#BC6C25` `#DDA15E` `#283618` `#A7C957`
**映射**：`--accent: #BC6C25`（赭石橙）；`--accent-tech: #606C38`（橄榄绿）；surface `#FEFAE0` 米白（light theme）。
**注意**：暖土色治愈；避免荧光，保持有机低饱和。

## 7. neon-electric — 霓虹 / 电光

**适用**：游戏、科技、夜生活、Gen Z、AI/未来感章节。
**代表色**：`#F72585` `#7209B7` `#4CC9F0` `#3A0CA3` `#56CFE0`
**映射**：`--accent: #F72585`（霓粉）；`--accent-tech: #4CC9F0`（电青）；深底 `#0B132B`/`#1C2541` + glow 材质（见 ANIMATION-RECIPES §1）。
**注意**：霓虹**必须配 glow 材质**才成立（否则死亮）；暗底+辉光 = 电光感，正是四大支柱材质立体场景。

## 8. pastel-soft — 柔和 / 粉彩

**适用**：时尚、美妆、生活方式、低龄/治愈、轻量入门章节。
**代表色**：`#CDB4DB` `#A2D2FF` `#BDE0FE` `#FFAFCC` `#FFC8DD`
**映射**：`--accent: #FFAFCC`（粉）；`--accent-tech: #A2D2FF`（蓝）；surface 近白 `#FAEDCD`。
**注意**：粉彩需更深的文本对比（支柱 2）；别全屏浅，焦点色略提饱和。

## 9. warm-editorial — 暖 / 编辑

**适用**：叙事、纪录片、案例研究、故事化章节（适合课程"引入/案例"屏）。
**代表色**：`#264653` `#2A9D8F` `#E9C46A` `#F4A261` `#E76F51`
**映射**：`--accent: #E76F51`（陶土橙）；`--accent-tech: #2A9D8F`（松绿）；surface `#F4F1DE` 暖纸（light theme）。
**注意**：暖编辑调性叙事感强；案例/引入屏首选，避免全程（正文屏回到主题 theme）。

---

## 选型速查

| 章节情绪 | mood | 典型课程场景 |
|---|---|---|
| 炸场/发布/竞技 | bold-energetic | 开营、挑战发布 |
| 专业/讲解 | clean-corporate | 概念讲解、教程 |
| 科技/金融/电影感 | dark-premium | 多数 dark theme 章节 |
| 珍贵/重要 | jewel-rich | 核心结论、里程碑 |
| 抽象/严肃 | monochrome | 概念抽象屏 |
| 自然/健康 | nature-earth | 生物、环境、生活 |
| 游戏/AI/未来 | neon-electric | AI 方向、游戏化 |
| 低龄/治愈 | pastel-soft | 入门、儿童编程 |
| 叙事/案例 | warm-editorial | 引入、案例研究 |

> 配色是 mood 工具，**不是每屏换色**。一个 theme 内，章节间保持主色家族；只用 mood 在"引入/高潮/案例"等少数节点做强调色微调。改色后跑 lint，确保仍满足材质（支柱 3）与反 AI 味（避免千篇一律渐变）约束。
