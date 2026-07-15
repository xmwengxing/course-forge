import type { ChapterDef, CourseJson } from "../registry/types";
import type { Cursor } from "../hooks/useStepper";
import "./CourseProgress.css";

export interface CourseProgressProps {
  chapters: ChapterDef[];
  cursor: Cursor;
  course: CourseJson;
}

export interface SegmentProgress {
  stepPct: number;
  currentChapterIdx: number;
  totalChapters: number;
  chapterTotalSteps: number;
  safeStep: number;
}

const pad2 = (n: number) => String(n).padStart(2, "0");

/**
 * Compute the *current 大纲·分段 (Outline Segment)* progress percentage
 * and readout fields. The bar's total length is the active segment's step
 * count (sum of steps across every chapter in the segment the cursor is
 * in), not the whole course and not a single chapter.
 *
 * Exported so the bottom dock (AppDock) can render the progress rail and
 * the readout from a single source of truth.
 */
export function computeSegmentProgress(
  chapters: ChapterDef[],
  cursor: Cursor,
  course: CourseJson,
): SegmentProgress {
  const totalChapters = chapters.length;
  const currentChapterIdx = cursor.chapter;
  const currentChapter = chapters[currentChapterIdx];

  // Walk course.outlineSegments → chapters in flat order; the bar's
  // total = the active segment's chapter list.
  const flat: ChapterDef[] = [];
  for (const seg of course.outlineSegments) {
    for (const ref of seg.chapters) {
      const c = chapters.find((x) => x.id === ref.id);
      if (c) flat.push(c);
    }
  }

  // Map every chapter index (in the flat loader order) to its
  // owning segment id so we can group by segment.
  const segmentOfChapter = new Map<number, string>();
  let globalIdx = 0;
  for (const seg of course.outlineSegments) {
    for (const ref of seg.chapters) {
      if (chapters.find((x) => x.id === ref.id)) {
        segmentOfChapter.set(globalIdx, seg.id);
        globalIdx++;
      }
    }
  }

  const currentSegmentId = segmentOfChapter.get(currentChapterIdx) ?? "";

  // Sum steps across all chapters in the current segment.
  let segmentTotalSteps = 0;
  let segmentStepsCovered = 0; // steps from previous chapters in the segment
  for (let i = 0; i < flat.length; i++) {
    const segId = segmentOfChapter.get(i) ?? "";
    if (segId !== currentSegmentId) continue;
    const steps = flat[i]?.narrations.length ?? 0;
    if (i < currentChapterIdx) segmentStepsCovered += steps;
    segmentTotalSteps += steps;
  }

  // Sanity cap: persisted cursor may be on a removed step.
  const chapterTotalSteps = currentChapter?.narrations.length ?? 1;
  const safeStep = Math.min(cursor.step, chapterTotalSteps - 1);
  const stepPct = Math.round(
    ((segmentStepsCovered + safeStep + 1) / Math.max(1, segmentTotalSteps)) * 100,
  );

  return { stepPct, currentChapterIdx, totalChapters, chapterTotalSteps, safeStep };
}

/**
 * CourseProgressReadout — just the "Ch x/y · Step a/b · p%" text group
 * (no rail, no border). Composed inside AppDock so the progress bar and
 * the transport share one row.
 */
export function CourseProgressReadout({
  chapters,
  cursor,
  course,
}: CourseProgressProps) {
  const { currentChapterIdx, totalChapters, chapterTotalSteps, safeStep, stepPct } =
    computeSegmentProgress(chapters, cursor, course);
  return (
    <div className="cp-readout">
      <span className="cp-frac label-mono">
        Ch {pad2(currentChapterIdx + 1)} / {pad2(totalChapters)}
      </span>
      <span className="cp-sep" aria-hidden="true">·</span>
      <span className="cp-step label-mono">
        Step {pad2(safeStep + 1)} / {pad2(chapterTotalSteps)}
      </span>
      <span className="cp-sep" aria-hidden="true">·</span>
      <span className="cp-pct label-mono">{stepPct}%</span>
    </div>
  );
}

/**
 * CourseProgress — per-大纲·分段 (Outline Segment) step bar.
 *
 * The bar's **total length is the current segment's step count** (i.e.
 * the sum of steps across every chapter in the segment the user is
 * currently in), not the entire course and not a single chapter.
 *
 * When the user advances chapter by chapter, the bar fills smoothly
 * toward 100% — only when they leave the segment entirely does the
 * bar reset (next segment → 0%, then fills up again).
 *
 * Standalone variant: renders the readout + the progress rail. In
 * course mode the bottom dock (AppDock) composes `CourseProgressReadout`
 * (readout only) with its own top-edge rail instead.
 */
export function CourseProgress({ chapters, cursor, course }: CourseProgressProps) {
  const { stepPct } = computeSegmentProgress(chapters, cursor, course);
  return (
    <div className="cp-bar" aria-label="当前课时进度">
      <CourseProgressReadout chapters={chapters} cursor={cursor} course={course} />
      <div className="cp-rail" aria-hidden="true">
        <div className="cp-rail-fill" style={{ width: `${stepPct}%` }} />
      </div>
    </div>
  );
}