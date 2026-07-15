import { useEffect, useState } from "react";
import type { CourseJson } from "../registry/types";
import "./ChapterMenu.css";

/**
 * ChapterMenu — left-side **collapsible** tree navigation.
 *
 * Hierarchy (target model): 课程 > 大纲·分段(Outline Segment) > 章节(Chapter).
 * The menu renders **two levels**: outline segments (L1) → chapters (L2).
 * 屏/步 are content granularity and do not appear in the nav.
 *
 * Default state: the segment containing the currently active chapter is
 * **expanded**; everything else is collapsed. This keeps the menu compact
 * when a course has many segments, while keeping the active chapter visible
 * without manual expansion.
 *
 * Click a segment header to expand/collapse. Click a chapter to jump to it.
 */
export interface ChapterMenuProps {
  course: CourseJson;
  currentChapterId: string;
  jumpTo: (chapterIndex: number, step?: number) => void;
  /**
   * When the parent implements a hover/auto-show pattern, it can pass
   * these to keep the menu open while the cursor is over the menu itself.
   * Without them, the menu is still fully usable — these handlers just
   * prevent the auto-hide timer from firing while the user is interacting
   * with the menu.
   */
  onMouseEnter?: () => void;
  onMouseLeave?: () => void;
}

export function ChapterMenu({
  course,
  currentChapterId,
  jumpTo,
  onMouseEnter,
  onMouseLeave,
}: ChapterMenuProps) {
  // Walk the course once: count global chapter index, find the active
  // segment, and seed the initial expanded set with that segment id.
  // Both ids are stable strings from course.json so they make good React keys.
  const flat: Array<{
    chapterId: string;
    title: string;
    segmentId: string;
    segmentTitle: string;
    isCurrent: boolean;
    globalIndex: number;
  }> = [];
  const initialOpen = new Set<string>();
  let idx = 0;
  for (const seg of course.outlineSegments) {
    for (const ch of seg.chapters) {
      const isCurrent = ch.id === currentChapterId;
      flat.push({
        chapterId: ch.id,
        title: ch.title,
        segmentId: seg.id,
        segmentTitle: seg.title,
        isCurrent,
        globalIndex: idx,
      });
      if (isCurrent) initialOpen.add(seg.id);
      idx++;
    }
  }

  const [open, setOpen] = useState<Set<string>>(initialOpen);

  // Auto-expand to the current chapter whenever the cursor moves.
  useEffect(() => {
    setOpen((prev) => {
      const next = new Set(prev);
      for (const seg of course.outlineSegments) {
        for (const ch of seg.chapters) {
          if (ch.id === currentChapterId) next.add(seg.id);
        }
      }
      return next;
    });
  }, [currentChapterId, course.outlineSegments]);

  function toggle(key: string) {
    setOpen((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  }

  // Group flat rows back into segments → chapters for tree render.
  type ChapterRow = (typeof flat)[number];
  const segments = new Map<
    string,
    { id: string; title: string; chapters: ChapterRow[] }
  >();
  for (const row of flat) {
    let seg = segments.get(row.segmentId);
    if (!seg) {
      seg = { id: row.segmentId, title: row.segmentTitle, chapters: [] };
      segments.set(row.segmentId, seg);
    }
    seg.chapters.push(row);
  }

  return (
    <aside
      className="cm-aside"
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
    >
      <div className="cm-header">
        <div className="cm-course-title serif-cn">{course.title}</div>
        <div className="cm-course-id label-mono">{course.courseId}</div>
      </div>
      <nav className="cm-nav" aria-label="Course navigation">
        {Array.from(segments.values()).map((seg) => {
          const segOpen = open.has(seg.id);
          return (
            <div key={seg.id} className="cm-seg">
              <button
                type="button"
                className="cm-seg-header"
                aria-expanded={segOpen}
                onClick={() => toggle(seg.id)}
              >
                <span className={`cm-caret ${segOpen ? "cm-caret--open" : ""}`}>▸</span>
                <span className="cm-seg-id label-mono">{seg.id}</span>
                <span className="cm-seg-title serif-cn">{seg.title}</span>
              </button>
              {segOpen && (
                <div className="cm-seg-body">
                  {seg.chapters.map((c) => (
                    <button
                      key={c.chapterId}
                      type="button"
                      className={`cm-chapter-btn ${c.isCurrent ? "cm-chapter-btn--active" : ""}`}
                      onClick={() => jumpTo(c.globalIndex)}
                      aria-current={c.isCurrent ? "page" : undefined}
                    >
                      <span className="cm-chapter-num label-mono">
                        {String(c.globalIndex + 1).padStart(2, "0")}
                      </span>
                      <span className="cm-chapter-title serif-cn">{c.title}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </nav>
    </aside>
  );
}