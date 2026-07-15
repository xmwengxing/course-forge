import type { ChapterDef } from "./types";
import ExampleChapter from "../chapters/01-example/Example";
import { narrations as exampleNarrations } from "../chapters/01-example/narrations";
import IdeChapter from "../chapters/02-ide/Ide";
import { narrations as ideNarrations } from "../chapters/02-ide/narrations";

/**
 * Order = order of presentation.
 *
 * Each chapter MUST provide a `narrations: Narration[]` array. Its length
 * is the chapter's step count — there is no `totalSteps` to maintain
 * separately. This guarantees the audio synthesis pipeline, the runtime
 * stepper, and the chapter `.tsx` switch on `step` cannot drift apart.
 *
 * Visual styling (color, fonts) comes entirely from the active theme —
 * chapters never hard-code palette / font names. See THEMES.md.
 */
export const CHAPTERS: ChapterDef[] = [
  {
    id: "example",
    title: "示例章节",
    narrations: exampleNarrations,
    Component: ExampleChapter,
    // Data-driven interaction — the runtime renders QuizPanel at step 2
    // and holds advancement until the learner submits. Replace with your
    // own quizzes; delete this whole `quizzes` field if the chapter has none.
    quizzes: [
      {
        step: 2,
        question: {
          id: "example-check",
          type: "single",
          prompt: "这一节你最有收获的是哪个点?",
          options: [
            { id: "a", label: "每一步独占整屏" },
            { id: "b", label: "主题决定一切视觉" },
            { id: "c", label: "口播对齐字幕与音频" },
          ],
          rationale: "三条都是交互式课件的核心约束。",
        },
      },
    ],
  },
  {
    id: "ide",
    title: "工程师工作台",
    narrations: ideNarrations,
    Component: IdeChapter,
  },
];
