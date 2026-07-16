import type { ChapterDef } from "./types";

/**
 * Order = order of presentation.
 *
 * Each chapter MUST provide a `narrations: Narration[]` array. Its length
 * is the chapter's step count — there is no `totalSteps` to maintain
 * separately. This guarantees the audio synthesis pipeline, the runtime
 * stepper, and the chapter `.tsx` switch on `step` cannot drift apart.
 *
 * Visual styling (color, fonts) comes entirely from the active theme —
 * chapters never hard-code palette / font names. See THEMES.md.
 *
 * 本模板不再自带示例章节（避免风格固化）。从零创建你的第一章：
 *   1. mkdir src/chapters/01-<id>
 *   2. 写 <Chapter>.tsx + <Chapter>.css + narrations.ts（见 references/CHAPTER-CRAFT.md）
 *   3. 在此处 import 并注册到 CHAPTERS 数组
 *   4. 在 course.json 的 outlineSegments.chapters 加 { id, title }
 *   5. 视觉设计遵循 CHAPTER-CRAFT.md「视觉焦点与着重渲染」四大支柱
 */
export const CHAPTERS: ChapterDef[] = [
  // { id: "your-first-chapter", title: "...", narrations: yourNarrations, Component: YourChapter },
];
