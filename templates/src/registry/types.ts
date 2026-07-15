import type { ComponentType } from "react";

export interface ChapterStepProps {
  step: number; // 0..(narrations.length - 1)
}

/**
 * One narration entry — the spoken text for that step.
 *
 * Empty string ("") means "no audio for this step" (e.g. silent transition
 * shot). Auto mode falls back to a short estimate when audio is missing or
 * the text is empty.
 */
export type Narration = string;

export interface ChapterDef {
  id: string;
  title: string;
  /**
   * Per-step narration text. **Length === total steps in this chapter.**
   * This is the single source of truth for step count and audio synthesis.
   */
  narrations: Narration[];
  Component: ComponentType<ChapterStepProps>;
  /**
   * Data-driven interactions (quiz / poll / reflection) for this chapter.
   * Each entry is tagged with the step index at which the QuizPanel should
   * overlay. The runtime renders from this array — there is no hardcoded
   * quiz in App.tsx. See `QuizStep` / `QuizQuestion`.
   */
  quizzes?: QuizStep[];
}

/* ========================================================================
 * Course structure types
 * ========================================================================
 * Canonical model (see SKILL.md § 术语表 / references/COURSE-STRUCTURE.md):
 *   课程(Course) > 大纲·分段(Outline Segment) > 章节(Chapter) > 屏(Screen) > 步(Step).
 *
 * Runtime mapping:
 *   - 课程(Course)      → CourseJson (courseId / title)
 *   - 大纲·分段(Segment) → OutlineSegment (一级导航菜单块, 段数依内容)
 *   - 章节(Chapter)     → CourseChapterRef (二级导航菜单项, 在 chapters.ts 注册)
 *   - 屏(Screen)        → 章节 .tsx 渲染进的 1920×1080 舞台；1 章可 1 屏或多屏
 *   - 步(Step)          → narrations.ts 的一项；1 步 = 1 口播节拍
 *
 * 屏数不手填：由章节结构（屏边界）推导；每章步数 = narrations.length。
 * 导航只到「大纲·分段 → 章节」两级；屏/步是内容颗粒度。
 */

/** A chapter entry inside course.json — references a registered chapter by id. */
export interface CourseChapterRef {
  id: string;        // must match a ChapterDef.id
  title: string;     // human-readable display name
}

/** A 大纲·分段 (Outline Segment) — L1 nav menu block grouping one themed part of the course. */
export interface OutlineSegment {
  id: string;        // e.g. "seg-import", "seg-practice" —段数依内容, 不必是 5
  title: string;
  source?: string;   // optional reference to the original .md file
  chapters: CourseChapterRef[];
}

/** Root shape of course.json. */
export interface CourseJson {
  courseId: string;  // e.g. "kids-coding-ai", "ai-trainer-l4"
  title: string;     // displayed in ChapterMenu header
  outlineSegments: OutlineSegment[];
}

/* ========================================================================
 * Quiz types (data-driven interactions)
 * ========================================================================
 */

export type QuizQuestionType = "single" | "multi" | "text";

export interface QuizOption {
  id: string;
  label: string;
}

export interface QuizQuestion {
  id: string;
  type: QuizQuestionType;
  prompt: string;
  options?: QuizOption[];     // required for single / multi
  correct?: string[];         // option ids (multi) or single id (single)
  placeholder?: string;       // for type="text"
  rationale?: string;         // shown after submit
}

/**
 * A quiz step is just a regular step (entry in narrations) but tagged
 * with a QuizQuestion. The runtime overlays the QuizPanel at that step and
 * (in auto mode) holds auto-advance until the learner submits.
 */
export interface QuizStep {
  /** step index in the chapter's narrations array */
  step: number;
  question: QuizQuestion;
}
