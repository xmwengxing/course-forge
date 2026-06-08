---
name: course-forge
description: 把知识点或口播稿做成带旁白配音、互动测验和嵌入式评估的分段式互动课件。产出 = Vite+React+TS 项目 + course.json 三级课程架构 + 音频 + 字幕。当用户提到"开发课件""制作课程""做门课""互动课件""课程开发""S1-S5拆分""口播稿生成""逐段开发""章节拆分""课件部署""课件画面""课件音频"时使用此技能。适用：职业教育/企业培训/编程教育/儿童编程/技能认证的 45-60 分钟录播课。单视频无评估场景请选择其他工具。
---

# Course Forge — Interactive Courseware Builder

把知识点或口播稿，做成带旁白配音、全场景交互的分段式互动课件。支持 5 分钟微课到完整课程。

---

## 使用场景

用户说出以下关键词或类似表述时触发：

| 用户说什么 | 场景 |
|:--|:--|
| "开发一门课件/课程" "帮我做一个互动课件" | 新课程从零开始 |
| "把这篇文档/口播稿做成课件" | 有素材→做成带交互的课程 |
| "继续开发 S2/S3" "扩展 X 段" "插入一章" | 已有课件，增补或扩展 |
| "合成音频" "生成字幕" "部署课件" | 课件开发后期步骤 |
| "优化这节课的画面" "重设计 XX 章节" | 课件视觉改进 |

---

## 工作流总览

```
Phase 1   内容准备
   1.1  识别用户输入 + S1-S5 拆分方案
   1.2  口播稿生成 + archive → 用户验收
   ▼
[Checkpoint Plan]   ← 硬节点。确认口播稿 + S1-S5 拆分 + 主题
   ▼
Phase 2   逐段开发（S1→S2→S3→S4→S5）
   2.1  脚手架
   2.2-2.N  每段 3-8 章，逐章制作 TSX+CSS+narrations，逐段验收
   ▼
[Checkpoint Audio]   ← 硬节点。是否合成音频
   ▼
Phase 3   音频合成与字幕（可选）
   ▼
Phase 4   部署嵌入 / 录制成视频
```

工作目录结构：
```
my-course/
├── docs/<标题>.md                  # 口播稿存档
├── presentation/
│   ├── src/chapters/<NN>-<id>/
│   │   ├── index.tsx               # 视觉实现
│   │   ├── index.css               # 独立 CSS 前缀
│   │   └── narrations.ts           # ★ step + 口播文本唯一真相源
│   ├── src/registry/chapters.ts    # 章节注册
│   ├── course.json                 # 课程结构（Section → Segment → Chapter）
│   ├── scripts/
│   │   ├── extract-narrations.ts
│   │   ├── synthesize-audio.sh     # --chapters 可过滤
│   │   └── subtitle-timing.py
│   └── public/audio/<id>/<N>.mp3
```

> **narrations.ts** 是 step 数和音频合成的唯一真相源。

---

## Phase 1 —— 内容准备

### 1.1 识别用户输入 + S1-S5 拆分

| 用户输入 | 行为 |
|:--|:--|
| 知识文档 + 口播稿 | 已有完整材料，直接拆分 |
| 知识文档，无口播稿 | 询问是否生成口播稿 → 是则 1.2 |
| 仅主题/大纲/知识点列表 | 先生成大纲 → 口播稿 → 拆分 |
| 一句话需求 | 反问：主题？素材？请先提供内容 |

**S1-S5 标准模板**：

| 段 | 类型 | 内容 | 教学方法 |
|:--|:--|:--|:--|
| S1 导入 | 场景 | 事故案例/冲突场景/角色定位 | 案发现场复盘 |
| S2 知识精讲 | 理论 | 核心概念/体系框架/技术原理 | 视觉化演示 |
| S3 案例演示 | 实战 | 真实数据/操作步骤/before-after | 极端场景推演 |
| S4 难点攻克 | 进阶 | 边界案例/常见陷阱/专家判断 | 启发式设问 |
| S5 总结通关 | 评估 | 复盘/弹题/SOP 作业/下节预告 | 柯氏四级评估 |

### 1.2 口播稿生成 + 存档

根据文档 + S1-S5 模板生成口播稿，存档到 `docs/<标题>.md`。每章 3-5 步，每步 200-400 字。等用户确认后进入 Checkpoint Plan。

---

## Checkpoint Plan —— 硬节点

```
口播稿已生成：docs/xxx.md

章节拆分方案：
  S1 导入 (~X min): N 章 — <概要>
  S2 精讲 (~X min): N 章 — <概要>
  S3 案例 (~X min): N 章 — <概要>
  S4 难点 (~X min): N 章 — <概要>
  S5 通关 (~X min): N 章 — <概要>

一次对齐：
  1. 口播稿要改吗？
  2. 拆分方案 OK？
  3. 选哪个主题？(chalk-garden/blueprint/newsroom 等)
   4. 素材来源？课件里提到哪些真实场景/截图/模板？请放 `docs/materials/` 目录下
   5. 开发模式？A 逐章验收 / B 顺序 / C 并行
```

---

## Phase 2 —— 逐段开发

### 2.1 脚手架

```bash
bash <path-to-course-forge>/scripts/scaffold.sh ./presentation --theme=<id>
```

删掉 `01-example`，并在 `chapters.ts` 移除对应 import。

### 2.2-2.N 实现单章

每章结构：`{NN}-{prefix}-{id}/` 含 `index.tsx` + `index.css` + `narrations.ts`。

**每章开发前必须读两份**：
- `references/CHAPTER-CRAFT.md` — 原则 / 表现力 / 布局速查 / 步策略 / 自检
- `references/DESIGN-SYSTEM.md` — 字体栈 / 色彩约束 / 反 AI slop 底线

**关键规则**：
- step >= N 渐进揭示，每步演一步
- 内容驱动动画——先找内在动作，找不到才入场兜底
- 每章独立 CSS 前缀，禁 `\u` 在 JSX 文本
- 交互元素加 `data-no-advance`
- 逐段验收汇报时长

### 2.3 注册章节 + 更新 course.json

```python
# 自动注册脚本：扫描 src/chapters/ → 生成 chapters.ts
# 超过 50 章时 Component 使用 React.lazy 按需加载
# course.json 记录 S1-S5 分段结构
```

### 2.4 交互模式速查表

纯 React + CSS 可实现以下 10 类交互。每章至少使用 1 种（步进揭示 G 为默认基础，不单独计数）。**连续两章不得使用同一交互模式。**

| 类别 | 核心做法 | key |
|:--|:--|:--|
| A. 点击揭示 | `useState` → 点击元素显示/隐藏注解 | `onClick + conditional render` |
| B. 状态切换 | 多状态循环切换（着色/视角/路径） | `useState(mode)` + data-attr |
| C. 对比裁决 | 双面板并排 + VS 按钮 | `flex-direction:row` + `useState` |
| D. 可展开链 | 逐层 accordion 展开 → 递进 | `max-height` transition |
| E. 拖拽操控 | 指针拖拽 → 实时变换（旋转/排序） | `onPointerDown/Move` + `transform` |
| F. 交互测验 | 选项点击 + 即时对错反馈 | `data-no-advance` + `correct` 标记 |
| G. 步进揭示 | step >= N 逐步展示 | 所有章节的基础，不单独计数 |
| H. 表格动画 | 逐行 stagger 入场 + 条件高亮 | `animation-delay` + `nth-child` |
| I. 脉冲动画 | 周期性 pulse 引导注意 | `@keyframes pulse` + infinite |
| J. 过程模拟 | CSS keyframes 模拟物理/流程 | 多阶段 `@keyframes` |

> 详见 `references/INTERACTIVE-PATTERNS.md`。

---

## Phase 3 —— 音频合成与字幕（可选）

```bash
npm run extract-narrations                           # → audio-segments.json
npm run synthesize-audio                              # 默认 minimax，增量
npm run synthesize-audio -- --chapters=id1,id2        # 仅合成指定章节
# 字幕 — 三种模式（2 种现用 + 1 种未来可选）：
python3 scripts/subtitle-timing.py                                          # 默认：80字句界 + 字数占比分配 + ffprobe
python3 scripts/subtitle-timing.py --mode minimax                           # ★ 推荐：MiniMax 逐词 ms 对齐
python3 scripts/subtitle-timing.py --mode minimax --chapters id1 id2        # 仅处理指定章节
```

| 模式 | 原理 | 精度 | 何时用 |
|:--|:--|:--:|:--|
| default | 80 字句界切分 → 块时长 = mp3总时长 × (块字数 / 步总字数) → ffprobe 测总长 | ⭐⭐⭐ | 存量音频 / minimax 无词级数据时 |
| minimax | MiniMax API 逐词 ms 时间戳聚合 | ⭐⭐⭐⭐⭐ | 新合成章节（默认推荐） |

> ★ `--mode minimax` 依赖 MiniMax TTS 合成时自动返回的逐词时间戳（`subtitle_enable: True, subtitle_type: "word"`）。若 MiniMax 未返回词级数据（`speech-2.8-hd` 偶发），脚本降级为 warning 而非报错——此时回退到 default 模式即可。

按 provider 文档配置 TTS（MiniMax/OpenAI/edge-tts 等），详见 `references/AUDIO.md`。

---

## Phase 4 —— 部署嵌入 / 录制成视频

课件 `dist/` 是纯静态文件。两种分发方式任选其一或同时使用：

### 嵌入 Web 应用

```tsx
window.open(`/courses/ai-trainer/embed.html?auto=1&chapter=0`, '_blank');
```

### 录制为 MP4 视频

```bash
bash scripts/record.sh             # 默认录制。依赖: ffmpeg + Chrome/Chromium
bash scripts/record.sh --headless  # 无头模式 (CI/server)
```

自动开启 `?auto=1` 自动播放模式，无需手动点击推进。详见 `references/COURSE-MODE.md`。

### DB 集成模式

通过 `course_param` 列区分课程，启用 discoverCourses 自动发现新课件。

---

## 硬性约束

1. **course.json 禁手工编辑** — 用脚本生成
2. **逐段验收 + 时长汇报** — 每段输出步骤/字数/时长
3. **双源原则** — 口播定节拍，文章定画面密度
4. **字幕 0-indexed** — `str(s['step']-1)` 对齐 Subtitle 组件
5. **STORAGE_KEY bump** — 章节结构变化时 bump 版本号
6. **逐章手写，禁止脚本批量生成**
7. **最小字号 14px**
8. **上下留空 + 垂直居中** — 顶部最小 50-70px，底部最小 60-80px（字幕空间）。内容需在可用空间内垂直居中（`justify-content: center`），不得贴顶部排列致下半画布空白。禁 `padding` 缩写覆盖 scene-pad
9. **JSX 文本禁 `\u` 转义** — 直接写 UTF-8 字符
10. **建议布局多样性** — 连续两章不建议使用同一布局模式，每段至少尝试 3 种

---

## 增补/插入章节到已有课程

编号原理：目录 `{编号}-{前缀}-{id}`，排序由目录名字母序决定。

| 方案 | 方法 | 示例 |
|:--|:--|:--|
| 有空隙 | 使用空隙内编号 | 674→680 间可用 675-679 |
| **加字母后缀** | 前编号后加字母 | `10a-` 在 `10-` 后、`11-` 前 |
| 区间已满 | 用更大编号 | 挪到末尾 |

```bash
# 验证无冲突
ls {编号}-*/ | sort
```

音频目录基于章节 ID（非编号），重编号后无需移动音频。

---

## 相关资源

| 文件 | 内容 | 何时读 |
|:--|:--|:--|
| `references/CHAPTER-CRAFT.md` | **每章单一必读**：原则/表现力/布局速查/步策略/自检 | Phase 2 每次写章 |
| `references/COURSE-MODE.md` | 课程模式：S1-S5/互动测验/评估/嵌入/编号方案/多课程管理 | 课程模式专属 |
| `references/SCRIPT-STYLE.md` | 口播稿风格指南 | Phase 1 |
| `references/AUDIO.md` | 音频合成 + --chapters 过滤 | Phase 3 |
| `references/DESIGN-SYSTEM.md` | 字体栈/色彩约束/反 AI slop 底线 | **Phase 2 每次写章必读** |
| `references/INTERACTIVE-PATTERNS.md` | 10 类交互模式详解 | 设计交互时 |
| `references/THEMES.md` | 主题系统 + token 契约 | 选主题时 |
| `scripts/subtitle-timing.py` | 字幕时序生成 | Phase 3 |

Base directory for this skill: `~/.agents/skills/course-forge`
