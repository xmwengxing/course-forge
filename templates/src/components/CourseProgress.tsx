import type { ChapterDef, CourseJson } from "../registry/types";
import type { Cursor } from "../hooks/useStepper";
import "./CourseProgress.css";

export interface CourseProgressProps {
  chapters: ChapterDef[];
  cursor: Cursor;
  course: CourseJson;
}

/**
 * CourseProgress — per-section (课时) step bar.
 *
 * The bar's **total length is the current section's step count** (i.e.
 * the sum of steps across every chapter in the section the user is
 * currently in), not the entire course and not a single chapter.
 *
 * When the user advances chapter by chapter, the bar fills smoothly
 * toward 100% — only when they leave the section entirely does the
 * bar reset (next section → 0%, then fills up again).
 *
 * Course  → 1.0 大纲 (section A) → 1.1 (section B) → 1.2 (section C) ...
 * Each section has segments → chapters → steps. The bar is keyed by
 * the section the cursor is in, not by a single chapter.
 */
export function CourseProgress({ chapters, cursor, course }: CourseProgressProps) {
  const totalChapters = chapters.length;
  const currentChapterIdx = cursor.chapter;
  const currentChapter = chapters[currentChapterIdx];

  // Locate the section containing the current chapter. We walk
  // course.sections → segments → chapters in flat order and stop at
  // currentChapterIdx. The bar's total = the section's chapter list.
  const flat: ChapterDef[] = [];
  for (const section of course.sections) {
    for (const seg of section.segments) {
      for (const ref of seg.chapters) {
        const c = chapters.find((x) => x.id === ref.id);
        if (c) flat.push(c);
      }
    }
  }

  // Map every chapter index (in the flat loader order) to its
  // owning section id so we can group by section.
  const sectionOfChapter = new Map<number, string>();
  let globalIdx = 0;
  for (const section of course.sections) {
    for (const seg of section.segments) {
      for (const ref of seg.chapters) {
        if (chapters.find((x) => x.id === ref.id)) {
          sectionOfChapter.set(globalIdx, section.id);
          globalIdx++;
        }
      }
    }
  }

  const currentSectionId = sectionOfChapter.get(currentChapterIdx) ?? "";

  // Sum steps across all chapters in the current section.
  let sectionTotalSteps = 0;
  let sectionStepsCovered = 0; // steps from previous chapters in the section
  for (let i = 0; i < flat.length; i++) {
    const secId = sectionOfChapter.get(i) ?? "";
    if (secId !== currentSectionId) continue;
    const steps = flat[i]?.narrations.length ?? 0;
    if (i < currentChapterIdx) sectionStepsCovered += steps;
    sectionTotalSteps += steps;
  }

  // Sanity cap: persisted cursor may be on a removed step.
  const chapterTotalSteps = currentChapter?.narrations.length ?? 1;
  const safeStep = Math.min(cursor.step, chapterTotalSteps - 1);
  const stepPct = Math.round(
    ((sectionStepsCovered + safeStep + 1) / Math.max(1, sectionTotalSteps)) * 100,
  );

  return (
    <div className="cp-bar" aria-label="当前课时进度">
      <div className="cp-readout">
        <span className="cp-frac label-mono">
          Ch {String(currentChapterIdx + 1).padStart(2, "0")} / {String(totalChapters).padStart(2, "0")}
        </span>
        <span className="cp-sep" aria-hidden="true">·</span>
        <span className="cp-step label-mono">
          Step {String(safeStep + 1).padStart(2, "0")} / {String(chapterTotalSteps).padStart(2, "0")}
        </span>
        <span className="cp-sep" aria-hidden="true">·</span>
        <span className="cp-pct label-mono">{stepPct}%</span>
      </div>
      <div className="cp-rail" aria-hidden="true">
        <div className="cp-rail-fill" style={{ width: `${stepPct}%` }} />
      </div>
    </div>
  );
}