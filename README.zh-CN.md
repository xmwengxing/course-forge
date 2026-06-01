# Course Forge · 课件锻造台

**将知识文档转化为分段式互动课件 — 带旁白配音、测验题、3D探索和嵌入式评估。**

[English](./README.md) · [中文文档](./README.zh-CN.md)

---

`course-forge` 构建可用于录屏的 Vite + React + TypeScript 互动式课件。从一份知识文档或口播稿开始，技能会引导你完成章节规划、互动章节开发、TTS 语音合成、字幕时序生成和部署——每个关键节点都有硬性的人工确认。

**源于 97+ 章的生产级课件开发**，为人工智能训练师三级职业技能认证制作，涵盖文本、视频、语音、点云四大模态的数据处理课程。

---

## 安装

### 方式 A · `skills` CLI (npx) — 推荐

```bash
# 完整安装（模板 + 主题 + 脚本）
npx skills add xmwengxing/course-forge

# 最小安装（仅 SKILL.md + references + scripts）
npx skills add xmwengxing/course-forge -s course-forge --minimal
```

### 方式 B · 手动复制

```bash
git clone https://github.com/xmwengxing/course-forge.git
cp -r course-forge /你的项目/.opencode/skills/
```

---

## 快速开始

```bash
npx skills add xmwengxing/course-forge
bash .opencode/skills/course-forge/scripts/scaffold.sh ./my-course --theme=chalk-garden
```

然后对 AI 说："用 course-forge 从 docs/xxx.md 创建课件"

---

## 与原技能的差异

| 能力 | web-video-presentation | course-forge |
|---|---|---|
| 产出物 | 单个视频 | **多章节完整课程 (S1-S5)** |
| 交互能力 | 无 | **选择题、简答题、CSS 3D 探索** |
| 章节管理 | 手动 chapters.ts | **course.json 三级架构 + 自动生成脚本** |
| 字幕系统 | 简单切分 | **字数占比分配 ms、60字阈值、0-indexed 对齐** |
| 评估体系 | 无 | **柯氏四级评估 (L1-L4 嵌入每个 S5)** |
| 嵌入方案 | 无 | **5 种 Web 应用集成策略** |
| 画布优化 | 默认内边距 | **缩小 stage-pad/margin，可用面积提升 18%** |

---

## 课程结构

```
course/
├── course.json              # 段/节/章 三级架构
├── presentation/
│   ├── src/chapters/        # 每章一个目录 (TSX+CSS+narrations.ts)
│   ├── public/audio/        # TTS 合成音频 (gitignored)
│   └── public/subtitle-timing.json
└── regenerate-course-json.py
```

## 主题

继承 web-video-presentation 的 23 个内置主题，每个有独立的设计签名、字体和动效风格。

---

## 许可证

[MIT](./LICENSE) © [xmwengxing](https://github.com/shijingtian)
