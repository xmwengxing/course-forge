import { useEffect, useState } from "react";
import type { CourseJson } from "../registry/types";
import "./ChapterMenu.css";

/**
 * ChapterMenu — left-side **collapsible** tree navigation.
 *
 * Hierarchy: course → section → segment → chapter.
 *
 * Default state: the (section, segment) containing the currently active
 * chapter is **expanded**; everything else is collapsed. This keeps the
 * menu compact when a course has many sections, while keeping the active
 * chapter visible without manual expansion.
 *
 * Click a section/segment header to expand/collapse. Click a chapter
 * to jump to it.
 *
 * In single-video mode the parent passes a synthetic CourseJson with one
 * section / one segment / N chapters, so the menu still works (just less
 * depth).
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
  // (sectionId, segmentId), and seed the initial expanded set with that
  // pair. Both ids are stable strings from course.json so they make good
  // React keys.
  const flat: Array<{
    chapterId: string;
    title: string;
    sectionId: string;
    sectionTitle: string;
    segmentId: string;
    segmentTitle: string;
    isCurrent: boolean;
    globalIndex: number;
  }> = [];
  const initialOpen = new Set<string>();
  let idx = 0;
  for (const section of course.sections) {
    for (const seg of section.segments) {
      for (const ch of seg.chapters) {
        const isCurrent = ch.id === currentChapterId;
        flat.push({
          chapterId: ch.id,
          title: ch.title,
          sectionId: section.id,
          sectionTitle: section.title,
          segmentId: seg.id,
          segmentTitle: seg.title,
          isCurrent,
          globalIndex: idx,
        });
        if (isCurrent) {
          initialOpen.add(section.id);
          initialOpen.add(`${section.id}::${seg.id}`);
        }
        idx++;
      }
    }
  }

  const [open, setOpen] = useState<Set<string>>(initialOpen);

  // Auto-expand to the current chapter whenever the cursor moves.
  useEffect(() => {
    setOpen((prev) => {
      const next = new Set(prev);
      for (const section of course.sections) {
        for (const seg of section.segments) {
          for (const ch of seg.chapters) {
            if (ch.id === currentChapterId) {
              next.add(section.id);
              next.add(`${section.id}::${seg.id}`);
            }
          }
        }
      }
      return next;
    });
  }, [currentChapterId, course.sections]);

  function toggle(key: string) {
    setOpen((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  }

  // Group flat rows back into sections → segments → chapters for tree render.
  type ChapterRow = (typeof flat)[number];
  const sections = new Map<
    string,
    { id: string; title: string; segments: Map<string, { id: string; title: string; chapters: ChapterRow[] }> }
  >();
  for (const row of flat) {
    let sec = sections.get(row.sectionId);
    if (!sec) {
      sec = { id: row.sectionId, title: row.sectionTitle, segments: new Map() };
      sections.set(row.sectionId, sec);
    }
    let seg = sec.segments.get(row.segmentId);
    if (!seg) {
      seg = { id: row.segmentId, title: row.segmentTitle, chapters: [] };
      sec.segments.set(row.segmentId, seg);
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
        {Array.from(sections.values()).map((sec) => {
          const secOpen = open.has(sec.id);
          return (
            <div key={sec.id} className="cm-sec">
              <button
                type="button"
                className="cm-sec-header"
                aria-expanded={secOpen}
                onClick={() => toggle(sec.id)}
              >
                <span className={`cm-caret ${secOpen ? "cm-caret--open" : ""}`}>▸</span>
                <span className="cm-sec-id label-mono">{sec.id}</span>
                <span className="cm-sec-title serif-cn">{sec.title}</span>
              </button>
              {secOpen && (
                <div className="cm-sec-body">
                  {Array.from(sec.segments.values()).map((seg) => {
                    const segKey = `${sec.id}::${seg.id}`;
                    const segOpen = open.has(segKey);
                    const hasChapters = seg.chapters.length > 0;
                    return (
                      <div key={seg.id} className="cm-seg">
                        {hasChapters && (
                          <button
                            type="button"
                            className="cm-seg-header"
                            aria-expanded={segOpen}
                            onClick={() => toggle(segKey)}
                          >
                            <span className={`cm-caret ${segOpen ? "cm-caret--open" : ""}`}>▸</span>
                            <span className="cm-seg-id label-mono">{seg.id}</span>
                            <span className="cm-seg-title serif-cn">{seg.title}</span>
                          </button>
                        )}
                        {(!hasChapters || segOpen) && (
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
                </div>
              )}
            </div>
          );
        })}
      </nav>
    </aside>
  );
}