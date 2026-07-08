import type { CourseJson } from "../registry/types";
import "./ChapterMenu.css";

/**
 * ChapterMenu — left-side 3-tier navigation (course → section → segment → chapter).
 *
 * Receives the parsed `CourseJson` and the currently active (section, segment, chapter)
 * id tuple, plus a `jumpTo` callback that takes a global step index.
 *
 * In single-video mode the parent passes a synthetic CourseJson with one
 * section / one segment / N chapters, so the menu is still usable
 * (just less deep).
 */
export interface ChapterMenuProps {
  course: CourseJson;
  currentChapterId: string;
  jumpTo: (chapterIndex: number, step?: number) => void;
}

export function ChapterMenu({
  course,
  currentChapterId,
  jumpTo,
}: ChapterMenuProps) {
  // Flatten sections into a single ordered list of chapters with their
  // (sectionLabel, segmentLabel) breadcrumbs, so we can render either a
  // tree (3-tier) or a flat list (1-tier single-video mode).
  const rows: Array<{
    chapterId: string;
    title: string;
    sectionLabel: string;
    segmentLabel: string;
    isCurrent: boolean;
    globalIndex: number;
  }> = [];
  let idx = 0;
  for (const section of course.sections) {
    for (const seg of section.segments) {
      for (const ch of seg.chapters) {
        rows.push({
          chapterId: ch.id,
          title: ch.title,
          sectionLabel: section.title,
          segmentLabel: seg.title,
          isCurrent: ch.id === currentChapterId,
          globalIndex: idx,
        });
        idx++;
      }
    }
  }

  return (
    <aside className="cm-aside">
      <div className="cm-header">
        <div className="cm-course-title serif-cn">{course.title}</div>
        <div className="cm-course-id label-mono">{course.courseId}</div>
      </div>
      <nav className="cm-nav">
        {rows.map((r) => (
          <button
            key={r.chapterId}
            type="button"
            className={`cm-chapter-btn ${r.isCurrent ? "cm-chapter-btn--active" : ""}`}
            onClick={() => jumpTo(r.globalIndex)}
            aria-current={r.isCurrent ? "page" : undefined}
          >
            <div className="cm-chapter-meta label-mono">
              {r.sectionLabel} · {r.segmentLabel}
            </div>
            <div className="cm-chapter-title serif-cn">{r.title}</div>
          </button>
        ))}
      </nav>
    </aside>
  );
}
