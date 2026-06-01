# Course Forge

**Turn knowledge documents into interactive, section-based courseware — with narration, quizzes, 3D exploration, and embedded assessment.**

[![License: MIT](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
[![Skills count](https://img.shields.io/badge/skills-1-orange)]()

[English](./README.md) · [中文文档](./README.zh-CN.md)

---

`course-forge` builds record-ready Vite + React + TypeScript interactive courseware that behaves like a professional e-learning production surface. Start from a single knowledge document or prepared narration script, and the skill guides you through section planning, interactive chapter development, TTS audio synthesis, subtitle timing, and deployment — all with hard checkpoints for human approval.

**Born from 97+ chapters of production courseware** across text, video, speech, and point-cloud data processing domains.

---

## Table of Contents

- [What Makes It Different](#what-makes-it-different)
- [Install](#install)
- [Quick Start](#quick-start)
- [Course Structure](#course-structure)
- [Theme Gallery](#theme-gallery)
- [Key Features](#key-features)
- [Compatibility](#compatibility)
- [License](#license)

---

## What Makes It Different

`course-forge` is a **fork and total rewrite** of [web-video-presentation](https://github.com/ConardLi/garden-skills#web-video-presentation), reimagined for full-course development rather than single-video production. Key additions:

| Capability | web-video-presentation | course-forge |
|---|---|---|
| Output | Single video | **Multi-section course (S1-S5)** |
| Source intake | Article/script | Knowledge doc + teaching design plan |
| Interaction | None | **Choice quizzes, short-answer questions, CSS 3D exploration** |
| Chapter management | Manual `chapters.ts` | **`course.json` 3-tier architecture + auto-generation script** |
| Subtitle system | Simple split | **Character-proportional ms allocation, 60-char threshold, 0-indexed alignment** |
| Assessment framework | None | **Kirkpatrick 4-level evaluation (L1-L4 embedded per S5)** |
| Embedding guide | None | **5 integration strategies (new-tab, iframe, React/Vue, DB-driven)** |
| Canvas optimization | Default padding | **Reduced stage padding + margin for 18% more usable area** |
| Teaching design | None | **3-method pedagogy: visual demo, edge-case deduction, incident review** |

### Course Layout

![Course Layout Diagram](./assets/layout-diagram.svg)

---

## Install

### Option A · `skills` CLI (npx) — Recommended

```bash
# Full install (templates + themes + scripts)
npx skills add xmwengxing/course-forge

# Minimal install (SKILL.md + references + scripts only, ~50KB)
npx skills add xmwengxing/course-forge -s course-forge --minimal
```

### Option B · Claude Code Plugin Marketplace

```bash
/plugin marketplace add xmwengxing/course-forge
/plugin install course-forge@course-forge
```

### Option C · Pinned `.zip` from Releases

```bash
VERSION=1.0.0
curl -fsSL -o course-forge.zip \
  "https://github.com/xmwengxing/course-forge/releases/download/v${VERSION}/course-forge-${VERSION}.zip"
unzip -q course-forge.zip -d .claude/skills/
```

### Option D · Manual Copy

```bash
git clone https://github.com/xmwengxing/course-forge.git
cp -r course-forge /your-project/.opencode/skills/
```

### Option E · Git Submodule

```bash
git submodule add https://github.com/xmwengxing/course-forge.git vendor/course-forge
ln -s ../../vendor/course-forge .opencode/skills/course-forge
```

---

## Quick Start

```bash
# 1. Install
npx skills add xmwengxing/course-forge

# 2. Scaffold a new course
bash .opencode/skills/course-forge/scripts/scaffold.sh ./my-course --theme=chalk-garden

# 3. Tell the agent to build it
# "Create a course from docs/my-knowledge-doc.md using course-forge"
```

The agent will:
1. Analyze your document and propose a 5-segment (S1-S5) section plan
2. Ask you to confirm the split and choose a theme
3. Build S1 first (3-5 chapters), let you review, then continue
4. Generate audio narration (MiniMax TTS or pluggable provider)
5. Create chunk-based subtitles with auto-timing
6. Embed interactive quizzes or 3D exploration where appropriate

---

## Course Structure

Every course-forge project follows a three-tier hierarchy:

```
course/
├── course.json              # 3-tier structure (section > segment > chapter)
├── presentation/
│   ├── src/chapters/        # One folder per chapter
│   │   ├── 01-opening/      # TSX + CSS + narrations.ts
│   │   └── ...
│   ├── public/
│   │   ├── audio/           # Synthesized TTS audio (gitignored)
│   │   └── subtitle-timing.json
│   └── scripts/
│       └── tts-providers/   # Pluggable TTS backends
└── regenerate-course-json.py  # Auto-generates valid course.json
```

### Section Split Threshold

| Document Size | Recommended Split | Chapters | Target Duration |
|---|---|---|---|
| ≤ 2,000 chars | No split, direct build | 4-6 | ~10-15 min |
| 2,000-5,000 chars | 3 segments | 12-18 | ~25-35 min |
| 5,000-8,000 chars | 5 segments (S1-S5) | 20-30 | ~45 min |
| > 8,000 chars | Suggest condensing first | — | — |

> 8,000 chars is the golden duration — roughly 45 minutes of expanded narration, the optimal length for recorded courseware.

---

## Theme Gallery

Select a theme during checkpoint phase, or browse all 23:

| creative-voltage | blueprint | swiss-ikb | chalk-garden |
|:--:|:--:|:--:|:--:|
| creative talks | tech architecture | data reports | popular science |

> **Full 23-theme gallery with live 16:9 previews, design signatures, and best-for tags:** [open in original project](https://github.com/ConardLi/garden-skills/blob/main/skills/web-video-presentation/README.md#theme-gallery)

---

## Key Features

### Section-Based Development
Large knowledge documents are automatically split into 5 segments (S1 Import → S2 Lecture → S3 Case Study → S4 Deep Dive → S5 Assessment). Each segment is developed and reviewed independently before proceeding.

### Interactive Components
- **Choice Quiz**: `{step >= N && <Quiz options={[...]} correct={0} />}` — auto-pauses narration
- **Short Answer**: Textarea with validation (described in QUIZ-CRAFT.md)
- **3D Exploration**: Pure CSS 3D transforms + pointer events — zero dependencies, ~200 lines

### Kirkpatrick 4-Level Evaluation
Every course S5 embeds L1-L4 assessment:
- **L1 Reaction**: Completion rate + quiz accuracy
- **L2 Learning**: SOP template submission (process + result evaluation)
- **L3 Behavior**: Supervisor observation of on-job application
- **L4 Results**: Business metric tracking (e.g., Bad Case reduction rate)

### Chunk-Based Subtitle System
Subtitle timing is computed by character-count proportion, not hardcoded. Each chunk ≤ 60 Chinese characters, 300ms per character at instructor speech pace. Keys are 0-indexed to match the stepper component. A standalone Python script (`subtitle-timing.py`) handles regeneration after audio synthesis.

### Embedding in Web Applications
Five verified integration strategies documented in [EMBEDDING.md](./references/EMBEDDING.md):
1. **Standalone new-tab** (recommended, best compatibility)
2. `<iframe>` with X-Frame-Options override
3. React lazy-load with dynamic import
4. Database-driven chapter routing via `start_chapter` field
5. URL parameter control (`?chapter=N&auto=1`)

### Pluggable TTS
Provider-agnostic audio runner with two built-in backends:
- **MiniMax** (speech-2.8-hd, Chinese optimized)
- **OpenAI TTS** (curl-based)
- Contract for custom providers in `scripts/tts-providers/README.md`
- Rate-limit handling with automatic retry + 25s cooldown
- Built-in diagnostic script (`diagnose-tts.sh`)

### Dual-Source Principle
Every chapter uses two sources: the narration script sets the **beat** (step sequence), the original knowledge document sets the **visual density** (what info to surface on screen beyond the spoken words). This prevents chapters from becoming just "talking head with bullet points."

### Three Teaching Methods
- **Visual Demonstration**: Waveform diagrams, 3D point clouds, comparison tables
- **Edge-Case Deduction**: Accident reconstruction, irreversible consequence walkthroughs
- **Incident Review**: Real case backtracking, root cause analysis from actual project data

---

## Compatibility

| Agent / Runtime | Skill Location | Status |
|---|---|---|
| **OpenCode** | `.opencode/skills/<name>/` | ✅ Tested (primary) |
| **Claude Code** | `.claude/skills/<name>/` or plugin marketplace | ✅ Supported |
| **Cursor** | `.agents/skills/<name>/` | ✅ Supported |
| **Codex CLI** | `.codex/skills/<name>/` | ✅ Supported |

---

## Acknowledgments

Built on the foundation of [**web-video-presentation**](https://github.com/ConardLi/garden-skills) by [ConardLi](https://github.com/ConardLi) — the original skill that pioneered the 16:9 fixed-stage web presentation paradigm. `course-forge` extends it from single-video production to full-course development with interactive assessments, 3D exploration, and multi-modal data processing.

---

## License

[MIT](./LICENSE) © [xmwengxing](https://github.com/shijingtian)
