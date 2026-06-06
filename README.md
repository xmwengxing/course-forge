# Course Forge

**Turn knowledge documents into interactive, section-based courseware — with narration, quizzes, 3D exploration, and embedded assessment.**

[![License: MIT](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
[![Skills count](https://img.shields.io/badge/skills-1-orange)]()

[English](./README.md) · [中文文档](./README.zh-CN.md)

---

`course-forge` builds record-ready Vite + React + TypeScript interactive courseware that behaves like a professional e-learning production surface. Start from a single knowledge document or prepared narration script, and the skill guides you through section planning, interactive chapter development, TTS audio synthesis, subtitle timing, and deployment — all with hard checkpoints for human approval.

**Born from 280+ chapters of production courseware** across text, video, speech, and point-cloud data processing domains.

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

`course-forge` is designed for full-course development with interactive assessments. Compared to single-video tools, it adds:

| Capability | course-forge |
|:--|:--|
| Output | **Multi-section course (S1-S5)** |
| Source intake | Knowledge doc + teaching design plan |
| Interaction | **Choice quizzes, short-answer questions, CSS 3D exploration** |
| Chapter management | **`course.json` 3-tier architecture + auto-generation script** |
| Subtitle system | Character-proportional ms allocation, 60-char threshold, 0-indexed alignment |
| Assessment framework | **Kirkpatrick 4-level evaluation (L1-L4 embedded per S5)** |
| Embedding guide | **5 integration strategies (new-tab, iframe, React/Vue, DB-driven)** |
| Canvas optimization | Reduced stage padding + margin for 18% more usable area |
| Teaching design | **3-method pedagogy: visual demo, edge-case deduction, incident review** |

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

---

## Workflow

The skill follows a structured pipeline with human checkpoints at critical decision points:

```
  User provides knowledge doc / outline / narration script
                 │
  ┌──────────────┴──────────────┐
  │ Phase 0 — Input & Content ▼ │
  │  0.1  Identify input type   │
  │  0.2  Generate narration    │        User reviews narration at docs/xxx.md
  │       (if not provided)      │
  │  0.3  Propose S1-S5 split   │        User confirms chapter plan + duration
  │  0.4  Select theme          │
  └──────────────┬──────────────┘
                 ▼
  ┌──────────────┴──────────────┐
  │ Phase 1 — Build (per seg)   │
  │  1.1  Scaffold project      │
  │  1.2  Build S1 → review     │◄── Segment-by-segment verification
  │  ...  Build S2 → review     │    with duration reporting
  │  1.N  Build S5 → review     │
  └──────────────┬──────────────┘
                 ▼
  ┌──────────────┴──────────────┐
  │ Phase 2 — Audio & Subtitles │
  │  2.1  Synthesize narration  │    TTS (MiniMax / OpenAI / Edge)
  │  2.2  Compress audio (opt)  │    64kbps → 50% size reduction
  │  2.3  Generate subtitle     │    ffprobe-measured chunk timing
  │       timing                 │
  └──────────────┬──────────────┘
                 ▼
  ┌──────────────┴──────────────┐
  │ Phase 3 — Build & Verify    │
  │  3.1  npm run build → dist/ │    Self-contained static files
  │  3.2  Local preview         │    npx serve dist → user verifies
  └──────────────┬──────────────┘
                 ▼
  ┌──────────────┴──────────────┐
  │ Phase 4 — Deploy & Embed    │
  │  4.1  Deploy standalone     │    Nginx / CDN / Docker / GitHub Pages
  │  4.2  Embed in web app      │    new-tab / iframe / DB-driven
  └─────────────────────────────┘
```

### Imperative: What You Control

| Step | What You Decide | AI Does |
|------|:--:|------|
| Narration script | Approve or request edits | Generates from source doc |
| S1-S5 split | Approve chapter count × duration | Proposes optimal breakdown |
| Theme | Choose (chalk-garden recommended) | Shows theme options |
| Each segment (S1-S5) | Review visuals + timing | Builds chapters + runs audio pipeline |
| Audio synthesis | Confirm before running | TTS + compress + subtitles |

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

> **Full 23-theme gallery with live 16:9 previews, design signatures, and best-for tags:** [open in REAMDE.md](https://github.com/xmwengxing/course-forge#theme-gallery)

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

## AI Interactive Courseware vs. Human-Recorded Video

A side-by-side comparison across key dimensions, based on 280+ chapters of production courseware development.

| Dimension | AI Interactive Courseware (`course-forge`) | Human-Recorded Video |
|---|---|---|
| **Storage Footprint** | 🟢 160 KB per chapter (TSX + CSS + compressed 64kbps MP3); full 23-chapter course ≈ 3.5 MB | 🔴 720p MP4 averages 50-200 MB per 45-min lesson; multi-course library easily exceeds 10 GB |
| **Interactive Elements** | 🟢 Full spectrum: click-to-reveal annotations, drag-to-rotate 3D scenes, ranking quizzes, decision tree walkthroughs, accordion expand/collapse, comparison panels with verdict buttons, live metric calculators | 🔴 None — passive linear playback only. Quizzes require a separate LMS platform |
| **Partial Adjustments** | 🟢 Edit a single chapter's `narrations.ts` → rebuild → deploy. No re-recording needed. Fix a typo or add a chapter in minutes | 🔴 Requires re-recording the entire video segment, re-editing the timeline, and re-exporting. A 30-second fix can take 2+ hours |
| **Cross-Platform Compatibility** | 🟡 Renders in any modern browser (Chrome/Firefox/Safari/Edge). Responsive stage scaling adapts to desktop, tablet, and mobile. Fullscreen API + orientation lock for mobile landscape mode | 🟢 MP4 plays virtually everywhere — browsers, media players, smart TVs, embedded in slides. Slightly better legacy device support |
| **Access Control & Copyright** | 🟢 Full control via web server auth middleware, token-gated access, domain whitelisting, or paywall integration. Source code (TSX/CSS/narrations) easily protected by back-end routing | 🔴 Once the MP4 file is downloaded, it can be freely copied, re-uploaded, or pirated. DRM solutions are expensive and easily bypassed |
| **Theme Richness & Extensibility** | 🟢 23 built-in themes with independent design signatures (font pairing, color palette, animation curves). 5 semantic color tokens (`--accent`, `--accent-tech`, `--accent-good`, `--accent-warn`, `--accent-deep`). New themes added via CSS variable overrides | 🟡 Visual style is locked at recording time — backgrounds, overlays, lower-thirds are "baked in." Re-styling requires a full re-shoot or video post-production |
| **Voice-Over Flexibility** | 🟢 Provider-agnostic TTS pipeline: MiniMax (Chinese-optimized), OpenAI, Edge-TTS, or custom providers. Re-synthesize any single chapter independently. Change voice, speed, or language per segment | 🔴 Requires a human narrator. Re-recording means booking studio/voice talent, matching tone consistency with existing segments, and re-syncing. Expensive and slow |
| **Development Efficiency** | 🟡 Initial development: ~2-4 hours per 45-min course (narration scripting + TSX layout + CSS + audio synthesis). After first course, common components accelerate subsequent courses. **60 chapters developed in one session (3 courses)** is feasible with AI assistance | 🔴 Typical production pipeline: script writing → rehearsal → studio recording → editing → post-production → export. A polished 45-min video often takes 2-5 working days end-to-end |
| **Offline Usage** | 🟡 Works offline after initial page load (static Vite build). Audio is preloaded as MP3 assets. Service worker caching can enable full offline PWA mode | 🟢 MP4 file can be downloaded and played offline on any device with zero technical setup |
| **Content Searchability** | 🟢 Chapter titles, narration text, and interactive prompts are all in plain text (TypeScript) — fully searchable and indexable by search engines when deployed as static HTML | 🔴 Video content is opaque — requires manual transcription or auto-generated captions for searchability. Captions often lag behind content updates |
| **Learner Analytics** | 🟢 Built-in: step-by-step progress tracking, quiz answer logging, completion rates, time spent per chapter, interactive engagement metrics. Data feeds directly into the Kirkpatrick L1-L4 evaluation model | 🔴 Requires an external LMS (Learning Management System) or video hosting platform with analytics add-ons. Often limited to play/pause/completion events |
| **Human Presence** | 🔴 No real human face, body language, or live energy. Relies on visual design quality and interactivity to maintain engagement | 🟢 Human instructor's expressions, gestures, and vocal nuances create a personal connection. Body language aids comprehension |
| **Physical Demonstration** | 🔴 Limited to 2D/3D simulated visualizations. Cannot show real-world physical operations, lab experiments, or hands-on tool usage | 🟢 Can show real-world operations, physical demonstrations, whiteboard sketching, and tool walkthroughs |
| **Real-Time Adaptability** | 🔴 Pre-authored logic — cannot dynamically respond to an individual learner's questions or adjust pacing based on live audience feedback | 🟡 In live-stream or classroom settings, the instructor can pause for Q&A, adapt examples on the fly, and read the room |

### When to Choose Which

| Scenario | Recommendation |
|---|---|
| Large-scale standardized training (1000+ learners) | **AI Interactive** — consistent quality, zero marginal delivery cost |
| Rapid iteration and frequent content updates | **AI Interactive** — edit a chapter in minutes |
| Quizzes, hands-on exercises, decision-making practice | **AI Interactive** — built-in interactivity |
| Leadership/keynote/inspirational content | **Human Video** — personal presence matters |
| Physical skills training (lab, workshop, sports) | **Human Video** — real demonstration needed |
| Learner analytics and compliance tracking | **AI Interactive** — native data collection |
| Quick MVP for a new course concept | **AI Interactive** — develop and iterate in hours |
| High-stakes certification exam prep | **Hybrid** — AI interactive for content + human proctoring |

`course-forge` — interactive courseware builder for 45-60 minute courses with assessments, 3D exploration, and multi-modal data processing.

---

## License

[MIT](./LICENSE) © [xmwengxing](https://github.com/shijingtian)
