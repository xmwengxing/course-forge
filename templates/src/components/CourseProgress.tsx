import type { ChapterDef } from "../registry/types";
import type { Cursor } from "../hooks/useStepper";
import "./CourseProgress.css";

export interface CourseProgressProps {
  chapters: ChapterDef[];
  cursor: Cursor;
}

/**
 * CourseProgress — thin "chapter N / M" bar shown only in course mode.
 *
 * Sits between the subtitle bar and the ModeControls. The full chapter
 * list lives in the ChapterMenu (left side, collapsible); this is just a
 * compact readout of where the user is in the course + a per-chapter
 * mini-bar showing step position.
 */
export function CourseProgress({ chapters, cursor }: CourseProgressProps) {
  const totalChapters = chapters.length;
  const currentChapterIdx = cursor.chapter;
  const currentChapter = chapters[currentChapterIdx];
  const chapterTotalSteps = currentChapter?.narrations.length ?? 1;
  const stepPct = Math.round(
    (Math.min(cursor.step + 1, chapterTotalSteps) / chapterTotalSteps) * 100,
  );
  const coursePct = Math.round(
    ((Math.min(currentChapterIdx + 1, totalChapters) +
      Math.min(cursor.step + 1, chapterTotalSteps) / chapterTotalSteps) /
      totalChapters) *
      100,
  );

  return (
    <div className="cp-bar" aria-label="课程进度">
      <div className="cp-readout">
        <span className="cp-frac label-mono">
          Ch {String(currentChapterIdx + 1).padStart(2, "0")} / {String(totalChapters).padStart(2, "0")}
        </span>
        <span className="cp-sep" aria-hidden="true">·</span>
        <span className="cp-step label-mono">
          Step {String(cursor.step + 1).padStart(2, "0")} / {String(chapterTotalSteps).padStart(2, "0")}
        </span>
        <span className="cp-sep" aria-hidden="true">·</span>
        <span className="cp-pct label-mono">{coursePct}%</span>
      </div>
      <div className="cp-rail" aria-hidden="true">
        <div className="cp-rail-fill" style={{ width: `${coursePct}%` }} />
        <div
          className="cp-rail-chapter"
          style={{ left: `${stepPct}%` }}
        />
      </div>
    </div>
  );
}