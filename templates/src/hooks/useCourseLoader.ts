import { useMemo } from "react";
import type { CourseJson, ChapterDef } from "../registry/types";
import defaultCourseJson from "../../course.json";

/**
 * useCourseLoader — load a course.json at module load time, derive the
 * flat chapter list to render, and resolve which `courseId` to use
 * from the URL query string.
 *
 * **Single source of truth**: `course.json` lives in the project root
 * (`./course.json` from this hook). It is imported directly — vite/TS
 * bundle it as a static module. There is **no** `public/course.json`
 * copy and **no** runtime fetch, so the two-file sync bug is gone.
 *
 * URL contract:
 *   /                       → default course (the imported one)
 *   /?course=kids-coding    → loads /course-kids-coding.json (one of the
 *                             glob-discovered courses below)
 *   /?course=l4            → loads /course-l4.json
 *
 * `import.meta.glob` is vite's eager-import pattern: it bundles every
 * file matching the glob into the JS output at build time. So adding a
 * new `course-<id>.json` in the project root requires **no** code change
 * here — vite picks it up automatically and we look it up at runtime
 * by `id`.
 *
 * In single-video mode the caller passes `singleVideoChapters` and
 * skips the JSON entirely (synthesizes a fake course from the
 * registered chapters).
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

/**
 * Discover all available course files at build time. Vite's
 * `import.meta.glob('../../course*.json', { eager: true })` bundles
 * every matching file into the JS output. Keys are the import paths
 * (e.g. "../../course-kids-coding.json"), values are the parsed JSON.
 *
 * The default course (./course.json) is imported statically above;
 * additional named courses come from the glob below. Map both into
 * a single `courseId → CourseJson` registry.
 */
type CourseJsonModules = Record<string, CourseJson>;
const defaultCourse: CourseJson = defaultCourseJson as CourseJson;
// eslint-disable-next-line @typescript-eslint/consistent-type-assertions
const allCourses: CourseJsonModules = (import.meta.glob("../../course*.json", {
  eager: true,
}) as unknown) as CourseJsonModules;

function findCourseById(courseId: string): CourseJson | undefined {
  if (courseId === "default") return defaultCourse;
  // Strip the leading "../../" and ".json" from glob keys.
  for (const [path, course] of Object.entries(allCourses)) {
    const m = path.match(/course-([^/]+)\.json$/);
    if (m && m[1] === courseId) return course;
  }
  return undefined;
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
  return useMemo<CourseLoadState>(() => {
    if (mode === "single") {
      return {
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
      };
    }

    // Course mode: resolve the courseId from URL and look it up in the
    // eager-imported map. No network fetch, no public/ copy.
    const courseId = readCourseIdFromUrl();
    const course = findCourseById(courseId);
    if (!course) {
      const available = Object.keys(allCourses)
        .map((p) => p.match(/course-([^/]+)\.json$/)?.[1])
        .filter((x): x is string => Boolean(x));
      return {
        status: "missing",
        message: `未找到 ?course=${courseId}。可用的课程: ${
          available.length ? available.join(", ") : "(仅默认 course.json)"
        }`,
      };
    }
    const { matched, flatIds, missing } = findChapters(course, singleVideoChapters);
    if (missing.length > 0) {
      return {
        status: "error",
        message: `course.json 引用了未注册的章节 id: ${missing.join(", ")}`,
      };
    }
    return { status: "ok", course, chapters: matched, flatChapterIds: flatIds };
  }, [mode, singleVideoChapters]);
}
