import { useEffect, useState } from "react";
import type { CourseJson, ChapterDef } from "../registry/types";

/**
 * useCourseLoader — fetch a course.json at runtime, derive the flat
 * chapter list to render, and resolve which `courseId` to load from
 * the URL query string.
 *
 * URL contract:
 *   /                       → default course (id="default")
 *   /?course=kids-coding    → loads /course-kids-coding.json
 *   /?course=l4            → loads /course-l4.json
 *
 * Fallback chain when the requested course.json fails to load:
 *   1. /course.json (default) — assumed to exist in every project
 *   2. / (with no course data) — UI shows a "course.json missing" notice
 *
 * In single-video mode, the caller passes `singleVideoChapters` and
 * skips the network fetch entirely (use `mode="single"`).
 */
export type CourseLoadState =
  | { status: "loading" }
  | { status: "ok"; course: CourseJson; chapters: ChapterDef[]; flatChapterIds: string[] }
  | { status: "missing"; message: string }
  | { status: "error"; message: string };

/**
 * Resolve the courseId from the current URL. Falls back to "default"
 * outside a browser.
 */
export function readCourseIdFromUrl(): string {
  if (typeof window === "undefined") return "default";
  const sp = new URLSearchParams(window.location.search);
  return sp.get("course") || "default";
}

interface UseCourseLoaderOptions {
  mode: "single" | "course";
  /** Chapters to use in single mode. */
  singleVideoChapters: ChapterDef[];
}

/**
 * Match a flat `chapters.ts` entry to a `course.json` chapter ref by
 * exact id. We use prefix heuristics as a fallback so that
 * `01-opening` in chapters.ts matches `01-opening` in course.json.
 */
function findChapters(
  course: CourseJson,
  all: ChapterDef[],
): { matched: ChapterDef[]; flatIds: string[]; missing: string[] } {
  const map = new Map(all.map((c) => [c.id, c]));
  const flatIds: string[] = [];
  const matched: ChapterDef[] = [];
  const missing: string[] = [];
  for (const section of course.sections) {
    for (const seg of section.segments) {
      for (const ref of seg.chapters) {
        flatIds.push(ref.id);
        const c = map.get(ref.id);
        if (c) matched.push(c);
        else missing.push(ref.id);
      }
    }
  }
  return { matched, flatIds, missing };
}

export function useCourseLoader({
  mode,
  singleVideoChapters,
}: UseCourseLoaderOptions): CourseLoadState {
  const [state, setState] = useState<CourseLoadState>({ status: "loading" });

  useEffect(() => {
    if (mode === "single") {
      setState({
        status: "ok",
        course: {
          courseId: "single",
          title: "Single Video",
          sections: [
            {
              id: "single",
              title: "Single Video",
              segments: [
                {
                  id: "S1",
                  title: "Main",
                  chapters: singleVideoChapters.map((c) => ({ id: c.id, title: c.title })),
                },
              ],
            },
          ],
        },
        chapters: singleVideoChapters,
        flatChapterIds: singleVideoChapters.map((c) => c.id),
      });
      return;
    }

    const courseId = readCourseIdFromUrl();
    const url = courseId === "default" ? "/course.json" : `/course-${courseId}.json`;

    let cancelled = false;
    (async () => {
      try {
        const res = await fetch(url, { cache: "no-store" });
        if (!res.ok) {
          if (cancelled) return;
          // Fall back to course.json if course-<id>.json 404
          if (courseId !== "default") {
            try {
              const fallback = await fetch("/course.json", { cache: "no-store" });
              if (fallback.ok) {
                const course = (await fallback.json()) as CourseJson;
                const { matched, flatIds, missing } = findChapters(course, singleVideoChapters);
                if (missing.length > 0) {
                  setState({
                    status: "error",
                    message: `course.json 引用了未注册的章节 id: ${missing.join(", ")}`,
                  });
                  return;
                }
                setState({ status: "ok", course, chapters: matched, flatChapterIds: flatIds });
                return;
              }
            } catch {
              /* fall through to missing */
            }
          }
          setState({
            status: "missing",
            message: `未找到 ${url}。请先生成 course.json 或切换到单视频模式。`,
          });
          return;
        }
        const course = (await res.json()) as CourseJson;
        if (cancelled) return;
        const { matched, flatIds, missing } = findChapters(course, singleVideoChapters);
        if (missing.length > 0) {
          setState({
            status: "error",
            message: `course.json 引用了未注册的章节 id: ${missing.join(", ")}`,
          });
          return;
        }
        setState({ status: "ok", course, chapters: matched, flatChapterIds: flatIds });
      } catch (err) {
        if (cancelled) return;
        setState({
          status: "error",
          message: `加载 ${url} 失败: ${err instanceof Error ? err.message : String(err)}`,
        });
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [mode, singleVideoChapters]);

  return state;
}
