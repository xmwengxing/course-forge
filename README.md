# Course Forge

Turn a knowledge document or narration script into an **interactive course / lesson** — a click-driven 16:9 web presentation with chapter navigation, subtitles, audio, playback controls, and per-chapter progress. Optional TTS audio and optional video recording are supported.

[English](./README.md) · [中文文档](./README.zh-CN.md) · [SKILL entry](./SKILL.md)

---

## What it does

You provide an article or script. The skill walks an agent through:

1. Writing narration (`script.md`) and a per-chapter build plan (`outline.md`)
2. Aligning with you on the script, outline, theme, source assets, and dev mode
3. Scaffolding a Vite + React + TS project, then building chapters one-by-one (chapter 1 is always built in the main thread as the anchor)
4. Optionally synthesizing audio via pluggable TTS (MiniMax / OpenAI / Edge / custom)
5. Embedding into a web app, or optionally recording as video (MP4)

Output is a static `dist/` — deployable anywhere.

---

## Install

```bash
# Recommended (OpenCode-style registry) — skills CLI
npx skills add xmwengxing/course-forge

# Or — manual clone (works for any runtime)
git clone https://github.com/xmwengxing/course-forge.git
#  OpenCode / Claude Code / Cursor / Codex:
cp -r course-forge /your-project/.opencode/skills/   # adjust per runtime, see Compatibility
#  WorkBuddy / CodeBuddy:
cp -r course-forge /your-project/.workbuddy/skills/
```

- **OpenCode / Claude Code**: also available via plugin marketplace — `/plugin marketplace add xmwengxing/course-forge`.
- **WorkBuddy / CodeBuddy**: install through the in-app skill marketplace, or place the folder at `.workbuddy/skills/course-forge/` (manual clone above). `npx skills add` is an OpenCode-style registry command and does not apply here.

---

## Quick start

```bash
# 1. Install (see above)

# 2. Scaffold a courseware project
bash .opencode/skills/course-forge/scripts/scaffold.sh ./my-course --theme=chalk-garden

# 3. Hand the source document to your agent and say:
#    "Create a course from docs/my-knowledge-doc.md using course-forge"
```

The agent will produce `script.md` + `outline.md`, walk you through the 5-point checkpoint, then build chapters. See [`SKILL.md`](./SKILL.md) for the full workflow.

---

## Built-in themes

Six themes, each a distinct design DNA — not just color swaps. Pick by mood, or copy one as the starting point for your own:

| midnight-press | chalk-garden | paper-press | newsroom | blueprint | bauhaus-bold |
|:--:|:--:|:--:|:--:|:--:|:--:|
| dark cinematic | handwritten chalk | light editorial | print/serif | tech blueprint | modernist |

Full signatures, design tokens, and a "create your own" walkthrough live in [`references/THEMES.md`](references/THEMES.md).

---

## Workflow at a glance

```
Phase 1  Content       →  script.md + outline.md
                          [Checkpoint Plan]  align 5 things
Phase 2  Web build     →  scaffold + chapters (chapter 1 = anchor)
                          [User review]      anchor must be approved
                          →  chapters 2..N   (per-chapter / sequential / parallel)
Phase 3  Audio (opt.)  →  TTS synthesis + chunk-based subtitles
Phase 4  Deploy        →  embed (new-tab / iframe / DB)  ·  optional: record as MP4
```

Hard stops are the `[]` lines — the agent must pause for human review at every one. For phase details and what to read at each stage, see [`SKILL.md`](./SKILL.md) § "File reading guide".

---

## Course hierarchy

Canonical model: **课程(Course) > 大纲·分段(Outline Segment, 原 S1~S5, 段数可变) > 章节(Chapter) > 屏(Screen/画面) > 步(Step)**. 屏是画框容器（1 章可 1 屏或多屏），步是屏内原子揭示单元（1 步 = 1 口播节拍）。

```
Course   — single domain or full-length curriculum (e.g. "Intro to X")
Segment  — themed block (导入/精讲/案例/收官…); L1 nav menu; count varies by content, not always 5
Chapter  — a lesson; L2 nav menu unit (e.g. "1.1 Hello, digital world!")
Screen   — a 1920×1080 canvas inside a chapter; a chapter = 1 screen or multiple
Step     — atomic reveal unit inside a screen: 1 step = 1 narration beat = 1 subtitle window = 1 audio segment
```

This skill builds **one kind of output**: interactive courseware. Video recording is an
optional extra (see [`references/RECORDING.md`](references/RECORDING.md)), not a separate mode.
Course structure details: [`references/COURSE-STRUCTURE.md`](references/COURSE-STRUCTURE.md).

---

## Architecture: the invariants

Three things hold the whole system together. Break any one and chapters, audio, and chapter menu break with it.

1. **`narrations.ts` is the single source of truth** — array length must equal `max(if (step === N)) + 1` in the chapter's `.tsx`. Five artifacts stay aligned by obeying this one rule: `script.md`, `outline.md`, chapter code, `chapters.ts` registry, and audio files.
2. **Theme = CSS tokens + JSON metadata** — switching themes means copying `themes/<id>/tokens.css` over `<project>/src/styles/tokens.css`. Components never import theme-specific values.
3. **Each chapter renders into a fixed 1920×1080 stage** — CSS `transform: scale()` via `useStageScale`. Author inside that coordinate system, not viewport pixels.

---

## When to use it

| Good fit | Less ideal |
|---|---|
| Standardized training at scale (1000+ learners) | Content where the human instructor's presence carries the message |
| Content that needs frequent small updates | Physical/lab/hands-on demonstrations |
| Quiz / decision-tree / drag-and-drop exercises | Live Q&A that needs real-time adaptation |
| Cost-sensitive delivery (zero marginal cost per learner) | Brand-new content where the script needs many drafts |
| Searchable, indexable, analytics-rich content | Offline-on-a-phone-only delivery (works, but MP4 is simpler) |

---

## Compatibility

| Runtime | Skill location |
|---|---|
| OpenCode | `.opencode/skills/<name>/` |
| Claude Code | `.claude/skills/<name>/` or plugin marketplace |
| Cursor | `.agents/skills/<name>/` |
| Codex CLI | `.codex/skills/<name>/` |
| WorkBuddy / CodeBuddy | `.workbuddy/skills/<name>/` |

Requires Node 20+ for scaffolded projects. TTS requires network access to whichever provider you pick.

## Platform notes (Windows / cross-platform)

- **Shell scripts (`scripts/*.sh`)** use Bash and call `curl` / `npm` / `python3`. On **Windows** they do **not** run in `cmd.exe` or PowerShell — use **Git Bash** (bundled with Git for Windows) or **WSL**. Example: `bash scripts/scaffold.sh ./my-course --theme=chalk-garden`.
- **Python scripts (`scripts/*.py`)** run natively with `python` / `python3` on any OS. If your Windows Python is only available as `python` (no `python3`), run `alias python3=python` in Git Bash, or invoke the script directly with `python script.py`.
- **Node 20+** is required for scaffolded projects (the `npm create vite` step). TTS providers additionally need network access to the chosen endpoint.

## Upgrading from a previous version

> ⚠️ **If you upgrade from a version before `course.json` static import was
> introduced**: delete any `public/course.json` (or `public/course-*.json`)
> in your scaffolded project. The current `useCourseLoader` imports
> `course.json` directly from the project root, so the `public/` copy is
> dead weight and can drift out of sync. After deleting, run
> `npm run build` once to verify.

The first time you pull a new version of this skill, in your scaffolded
project run:

```bash
npm install       # or: pnpm install / yarn install
bash scripts/check-course-json-sync.sh   # exit 0 = clean
```

---

## Documentation map

| File | Read when |
|---|---|
| [`SKILL.md`](./SKILL.md) | **Always first** — workflow overview + per-phase reading guide |
| [`references/CHAPTER-CRAFT.md`](references/CHAPTER-CRAFT.md) | Writing each chapter — single source of truth for what makes a chapter pass review |
| [`references/SCRIPT-STYLE.md`](references/SCRIPT-STYLE.md) | Phase 1 — turning an article into narration |
| [`references/OUTLINE-FORMAT.md`](references/OUTLINE-FORMAT.md) | Phase 1 — the `outline.md` schema and chapter-split rules |
| [`references/COURSE-STRUCTURE.md`](references/COURSE-STRUCTURE.md) | Course structure — 课程>章节>屏, density rules, chrome |
| [`references/THEMES.md`](references/THEMES.md) | Checkpoint Plan / any time you pick or change a theme |
| [`references/AUDIO.md`](references/AUDIO.md) | Phase 3 — TTS pipeline, providers, subtitle timing |
| [`references/RECORDING.md`](references/RECORDING.md) | Phase 4 — auto-record the running site as MP4; **also the formal autoplay policy & audio/subtitle fallback contract** |
| [`references/DEPLOYMENT.md`](references/DEPLOYMENT.md) | Phase 4 — embed into an existing web app |
| [`references/ANIMEJS-GUIDE.md`](references/ANIMEJS-GUIDE.md) | Writing a chapter that needs real animation or physics-style drag |

---

## License

[MIT](./LICENSE) © course-forge contributors