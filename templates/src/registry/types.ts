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
}

/* ========================================================================
 * Course mode types
 * ========================================================================
 * Course structure lives in course.json (loaded at runtime) and forms a
 * 3-tier hierarchy: course → sections → chapters. Each chapter ID must
 * match a registered entry in chapters.ts.
 */

/** A chapter entry inside course.json — references a registered chapter by id. */
export interface CourseChapterRef {
  id: string;        // must match a ChapterDef.id
  title: string;     // human-readable display name
}

/** A segment is a themed block within a section (e.g. 导入 / 精讲 / 案例 / 收官). */
export interface CourseSegment {
  id: string;        // e.g. "S1", "S2"
  title: string;
  chapters: CourseChapterRef[];
}

/** A section is one standalone course in a multi-course catalog. */
export interface CourseSection {
  id: string;        // e.g. "1.1", "1.2"
  title: string;
  source?: string;   // optional reference to the original .md file
  segments: CourseSegment[];
}

/** Root shape of course.json. */
export interface CourseJson {
  courseId: string;  // e.g. "kids-coding", "ai-trainer-l4"
  title: string;     // displayed in ChapterMenu header
  sections: CourseSection[];
}

/* ========================================================================
 * Quiz types (Kirkpatrick L1-L2)
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
 * with a QuizQuestion. The QuizPanel overlays the chapter scene at the
 * appropriate step and pauses auto-advance.
 */
export interface QuizStep {
  /** step index in the chapter's narrations array */
  step: number;
  question: QuizQuestion;
}
