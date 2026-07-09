import type { ChapterDef } from "../registry/types";
import type { Cursor } from "../hooks/useStepper";
import "./CourseProgress.css";

export interface CourseProgressProps {
  chapters: ChapterDef[];
  cursor: Cursor;
}

/**
 * CourseProgress — per-chapter step bar.
 *
 * The bar's **total length is the current chapter's step count**, not
 * the entire course. The rail fill = (cursor.step + 1) / chapterTotalSteps.
 * When the user advances to the next chapter the bar resets to 0%.
 *
 * The chapter readout on the left (Ch 02/06 · Step 04/06) still gives
 * the user a sense of where they are in the course overall; the rail
 * itself only depicts the *current* chapter.
 *
 * Why per-chapter and not per-course: a single course can have very
 * many chapters, and a progress bar that fills over 30+ chapters
 * moves too slowly to feel responsive. The user can see their overall
 * position in the ChapterMenu (left) — the rail here is for
 * "how much of *this chapter* is left".
 */
export function CourseProgress({ chapters, cursor }: CourseProgressProps) {
  const totalChapters = chapters.length;
  const currentChapterIdx = cursor.chapter;
  const currentChapter = chapters[currentChapterIdx];
  const chapterTotalSteps = currentChapter?.narrations.length ?? 1;
  // Cap at chapterTotalSteps in case persisted cursor was on a removed
  // step (e.g. older storage key from a previous chapter layout).
  const safeStep = Math.min(cursor.step, chapterTotalSteps - 1);
  const stepPct = Math.round(((safeStep + 1) / chapterTotalSteps) * 100);

  return (
    <div className="cp-bar" aria-label="当前章节进度">
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