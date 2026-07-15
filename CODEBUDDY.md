# CODEBUDDY.md

This file provides guidance to CodeBuddy Code when working with code in this repository.

---

## What this repository is

`course-forge` is **not an application** — it is an **agent skill package** distributed to multiple AI runtimes (OpenCode, Claude Code, Cursor, Codex CLI, WorkBuddy / CodeBuddy). It teaches an agent how to build **interactive courseware** as a Vite + React + TypeScript project, with optional TTS narration, chunk-based subtitles, and optional video recording.

Two layers of code live here:

1. **The skill itself** — instructional markdown (`SKILL.md`, `references/`), executable helper scripts (`scripts/`), project templates (`templates/`), and 6 design themes (`themes/`).
2. **Generated courseware projects** — created by running `scripts/scaffold.sh` into a target directory. Those live downstream and follow normal Vite/React conventions.

When you `cd` into a scaffolded `presentation/` directory, that becomes a normal Vite project and most of this file's guidance stops applying — follow Vite/React/TS conventions there instead.

---

## Repository layout

```
course-forge/
├── SKILL.md                  # Primary instruction file agents read first
├── README.md / README.zh-CN.md
├── manifest.json             # Skill metadata (name, version, keywords, entry)
├── .gitignore                # Excludes DEV.md, node_modules, .env, *.mp3
├── references/               # Long-form guidance consulted per phase
│   ├── SCRIPT-STYLE.md       #   Narration writing rules (script.md)
│   ├── SCRIPT-WRITING.md     #   口播稿撰写核心能力：立项→逐章剧本(子代理并行)→画面；字数/时长公式；course-bible 跨章衔接
│   ├── OUTLINE-FORMAT.md     #   outline.md structure
│   ├── CHAPTER-CRAFT.md      #   ★ Single entry for chapter implementation (read this every chapter)
│   ├── COURSE-STRUCTURE.md   #   课程结构：课程>章节>屏 / 密度约束 / chrome 组件
│   ├── AUDIO.md              #   TTS pipeline
│   ├── THEMES.md             #   Theme system contracts
│   ├── RECORDING.md          #   Auto-record via ?auto=1
│   ├── DEPLOYMENT.md         #   Distribution + embedding
│   ├── DESIGN-SYSTEM.md
│   ├── ANIMEJS-GUIDE.md, ANIMEJS-EXAMPLES-INDEX.md
│   └── EXAMPLES/             #   Anchor chapters (look up structure, do not copy)
├── scripts/
│   ├── scaffold.sh           #   Generate a new presentation project (copies scripts + tts-providers from templates/ into the project)
│   ├── subtitle-timing.py    #   Generate subtitle-timing.json from audio
│   ├── diagnose-tts.sh       #   Check TTS API / key / endpoint
│   ├── chapter-stats.py      #   Estimate chapter duration from narrations
│   ├── check-animejs-cohesion.py  #   Lint animejs usage for consistency
│   ├── check-course-json-sync.sh  #   CI guard: fail if a stale public/course.json exists
│   ├── record.sh / record.js #   Optional: auto-record the running presentation as video
│   └── tts-providers/        #   Pluggable TTS backends (minimax.sh, openai.sh, README.md contract)
├── templates/
│   ├── index.html
│   ├── vite.config.ts        #   Port 5174, fs.allow [".."]
│   └── presentation/src/
│       ├── chapters/01-example/    #   Reference chapter (TSX + CSS + narrations.ts)
│       ├── components/             #   Reusable building blocks
│       ├── hooks/                  #   useStepper, useAudioPlayer, useStageScale, useAutoMode
│       ├── registry/chapters.ts, types.ts
│       └── styles/                 #   tokens.css, base.css, fonts.css, animations.css
└── themes/                   # 6 themes, each = theme.json + tokens.css
    ├── midnight-press/      #   Default theme
    ├── chalk-garden, paper-press, blueprint, newsroom, bauhaus-bold
```

Each theme's `theme.json` exposes: `id`, `name`, `nameZh`, `descriptionZh`, `mood[]`, `bestFor[]`, `preview{shell,surface,text,accent}`.

---

## Skill workflow (5 phases, with hard checkpoints)

```
Phase 0 — Brief / intake (required when course is large)
  0.1  Confirm lesson count (how many lessons) + avg lesson duration
  0.2  Produce brief.md (L1 = lesson, L2 = sub-section) → user confirms & freezes
        (see references/SCRIPT-WRITING.md)
Phase 1 — Narration / screenplay
  1.1  Identify input (article | script | topic-only → must ask user for source)
  1.2  Short course: produce script.md + outline.md together
       Large course: per-chapter "screenplay" (script/NN-id.md, sub-agents in parallel,
       course-bible for cross-chapter continuity) — references/SCRIPT-WRITING.md
  → [Checkpoint Plan] HARD STOP — align 5 things: script / outline / theme / assets / dev mode
Phase 2 — Web build
  2.1  Scaffold project (scaffold.sh)
  2.2  Build Chapter 1 as anchor (full version)
  → [User review] HARD STOP — chapter 1 must be approved before continuing
  2.3  Build chapters 2..N (modes: per-chapter / sequential / parallel)
Phase 3 — Audio & subtitles (optional)
  3.1  Extract narrations → audio-segments.json
  3.2  Synthesize via provider (MiniMax T2A v2 or OpenAI TTS, pluggable)
  3.3  Compress to 64kbps (50% size reduction)
  3.4  Generate subtitle timing (subtitle-timing.py, 60-char chunks, 300ms/char)
Phase 4 — Deploy / record
  4.1  npm run build → dist/ (static)
  4.2  Preview with `npx serve dist`
  4.3a Embed (new-tab / iframe / DB-driven)  OR  4.3b Auto-record (bash scripts/record.sh → ?auto=1)
```

**Mandatory self-check protocol** — after producing `script.md`, `outline.md`, or any single chapter, run the corresponding checklist **before** reporting done. Priority order: Agent Teams reviewer → subagent → self-review. Never report raw findings without fixing the fails first. Source of each checklist:
- `script.md` → `references/SCRIPT-STYLE.md` (form / voice / spoken-aloud tests)
- `outline.md` → `references/OUTLINE-FORMAT.md`
- chapter completion → `references/CHAPTER-CRAFT.md` § 完工自检

---

## Operating conventions (how the agent develops with this skill)

- **逐节开发是默认流程**：除非用户明确要求「多节」或「全部」，每次只开发 / 渲染 / 验证**一个小节**（= 二级章节）。用户显式点名多个小节（如「开发 01 和 02」）才是多节请求，才一次性做多个。这样改动范围小、易审查、可逐步回滚。
- **每次 skill 优化必须落地到 skill 目录文件（即可调用目录），不能只停留在对话上下文**：course-forge 的「可调用目录」就是本仓库 `E:/workspace/course-forge`（WorkBuddy 从这里加载 `SKILL.md` / `references/` / `templates/`）。任何对玩法、术语、脚本、模板的修改都要**直接写入对应文件**，不能只留在对话里——否则会话上下文溢出后，新代理读到的还是旧版 skill。`templates/` 与 `demo/` 里若有同一脚本的引用副本（如 `extract-narrations.ts`、`subtitle-timing.py`），改一处要同步另一处。
- **验证用 demo，不污染 skill 源**：端到端验证产物放 `demo/`（已在 `.gitignore`），不要放进 `course-forge/` 根目录。

## Commands commonly used in this repo

### Listing and inspecting the skill itself

```bash
# List all 6 available themes with zh name + description
bash scripts/scaffold.sh --list-themes

# Show a single theme's contract
cat themes/<theme-id>/theme.json
cat themes/<theme-id>/tokens.css
```

### Scaffolding a new courseware project

```bash
# Default theme (midnight-press)
bash scripts/scaffold.sh ./my-course

# Specific theme
bash scripts/scaffold.sh ./my-course --theme=chalk-garden

# After scaffolding: switch theme by copying tokens only
cp themes/<new-id>/tokens.css my-course/src/styles/tokens.css
```

### Inside a scaffolded project (`my-course/`)

```bash
npm install
npm run dev               # http://localhost:5174
npm run build             # → dist/  (static, deploy anywhere)
npx tsc --noEmit          # type-check only

# Audio pipeline (after chapters + narrations.ts are written)
npm run extract-narrations              # → audio-segments.json (review before synthesizing)
source .env && npm run synthesize-audio # TTS via current provider
python3 scripts/subtitle-timing.py      # → public/subtitle-timing.json

# Validate / fix course.json (NEVER hand-edit JSON; always run this script)
python3 regenerate-course-json.py
```

### Recording a course as video

```bash
# Run the built site with auto-advance enabled, then drive a headless recorder
bash scripts/record.sh           # uses ?auto=1 query param
# See references/RECORDING.md for full pipeline (Playwright/Puppeteer driven)
```

### TTS diagnosis

```bash
bash scripts/diagnose-tts.sh     # checks endpoint, key validity, Token Plan status
```

---

## Architecture notes (big picture)

### `narrations.ts` is the single source of truth

Every chapter has a `narrations.ts` exporting an array of strings. The number of `if (step === N)` branches in the chapter's `.tsx` must equal `narrations.length`. This invariant keeps **five artifacts** aligned: `script.md`, `outline.md`, chapter code, `chapters.ts` registry, and audio files. Never bypass it by hardcoding steps elsewhere.

### Course hierarchy

Canonical model (see `SKILL.md` § 术语表): **课程(Course) > 大纲·分段(Outline Segment) > 章节(Chapter/课) > 屏(Screen/画面) > 步(Step)**. 屏是画框容器（1 章可 1 屏或多屏），步是屏内原子揭示单元（1 步 = 1 口播节拍）。

Runtime model (已落地，两级): 模板 `course.json` 即 **课程 > 大纲·分段(outlineSegments) > 章节(chapters)** 两级；`ChapterMenu` 渲染「大纲·分段 → 章节」两级菜单；屏/步是内容粒度。`narrations.ts` 长度 = 该章节的总步数（口播节拍），屏数由各章结构推导。现在写文档/产出一律用 课程/大纲·分段/章节/屏/步 术语。

Scale note: 同一套两级结构承载两种尺度（见 `references/COURSE-STRUCTURE.md` § 1.1）：默认短视频（一级=内容主题块，二级=30~60s 微单元）；**长课**（一节课数十分钟）重映射为 一级=一节课 Lesson、二级=小节主题（1 屏或多屏）。口播稿撰写 / 子代理逐章剧本流程见 `references/SCRIPT-WRITING.md`。开发/验收的增量单元说"逐小节"（= 二级），"分段"一词专指一级。

### Theme = CSS tokens + JSON metadata

Switching themes only requires copying `themes/<id>/tokens.css` over the scaffolded project's `src/styles/tokens.css`. Themes are data, not code — the React components read CSS variables (`--accent`, `--accent-tech`, `--accent-good`, `--accent-warn`, `--accent-deep`) and never import theme-specific values.

### TTS providers are pluggable

`synthesize-audio.sh` is the provider-agnostic runner. Each provider under `scripts/tts-providers/<name>.sh` must implement a 3-function contract (documented in `scripts/tts-providers/README.md`); 5 starter snippets are included (ElevenLabs / edge-tts / say / Azure / gcloud) plus two working backends (`minimax.sh` default, `openai.sh`). Rate-limit handling: 25-second cooldown between calls. Most MiniMax failures are rate limits (codes 1002 / 1039) — wait and retry. Use `diagnose-tts.sh` to confirm the failure mode.

### Stage canvas

Every chapter renders into a fixed **1920×1080 stage** with CSS `transform: scale()` via `useStageScale`. Author inside that coordinate system; do not rely on viewport pixels. Padding tokens: `--stage-pad-x: 56`, `--stage-pad-y: 40`, content area marginX/Y `32/48`. Subtitle font: 28px / line-height 1.4.

### Subtitle timing (chunk-based)

`subtitle-timing.py` splits narration at `。!?` (only sentence-final punctuation), caps chunks at ~60 chars, allocates milliseconds proportional to character count × 300ms/char. **Audio-segments is 1-indexed; subtitle component keys are 0-indexed** — keep this translation in mind when debugging sync issues.

### Embedding (5 methods, ranked by compatibility)

1. `window.open(url, '_blank')` — recommended, zero X-Frame-Options friction
2. iframe + nginx `location`-scoped `X-Frame-Options` override
3. React lazy/dynamic import in SPA
4. DB-driven `start_chapter` field routing
5. URL parameters (`?chapter=N&auto=1`)

Avoid setting `X-Frame-Options` at nginx server level — the inheritance will override any location-level setting and break iframe mode.

---

## Things agents commonly get wrong

- **Outline should not specify animation.** Outline = rhythm + information density only. Animation is decided per chapter by `CHAPTER-CRAFT.md` decision tree. Writing "blur clear" / "wipe" / "spring" in outline = chapter agent turns into a translator.
- **Scaffold first, then theme via tokens.css only.** Do not edit React components to "match" a theme — the design system guarantees decoupling.
- **Hand-editing `course.json` causes bracket corruption** (3 historical incidents per `DEV.md`). Always run `regenerate-course-json.py`.
- **MiniMax TTS quota errors ≠ invalid key.** Most failures are rate limits (1002 RPM / 1039 TPM) — wait 60s and retry. Use `diagnose-tts.sh` to confirm the failure mode before changing the API key.
- **DEV.md is gitignored.** It's internal-only. Do not commit or reference it in user-facing docs.
- **Don't use the term "PPT"** when describing the output — even though the workflow resembles a slide deck, the project's identity is "click-driven 16:9 web presentation that behaves like video". README and SKILL.md deliberately avoid "PPT".
- **`chapters.ts` registry name is historical** — it registers chapters (each = a teaching unit of 1+ screens; a screen holds multiple steps/口播节拍, the main unit the skill builds). Don't rename it.

---

## Where to look first, by task

| Goal | Read first |
|---|---|
| Add a new chapter | `references/CHAPTER-CRAFT.md` (single entry) + current theme's `theme.json` |
| Add a new theme | `references/THEMES.md` + copy an existing theme as scaffold |
| Debug audio sync | `references/AUDIO.md` → `scripts/diagnose-tts.sh` |
| Fix course menu / chapter list disappearing | `python3 regenerate-course-json.py` |
| Debug subtitle desync | check `subtitle-timing.json` step keys are 0-indexed |
| Add a TTS provider | `scripts/tts-providers/README.md` (3-function contract + 5 starter snippets) |
| Embed into an existing web app | `references/DEPLOYMENT.md` (5 ranked methods) |
| Record as MP4 | `references/RECORDING.md` |