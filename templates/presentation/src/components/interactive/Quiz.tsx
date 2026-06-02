import { useState } from "react";
import "./Quiz.css";

export interface QuizQuestion {
  title: string;
  opts: string[];
  correct: number;
  feedback: { right: string; wrong: string };
}

interface QuizProps {
  questions: QuizQuestion[];
  /** step 用于逐步展示每题。step >= qi+1 展示第 qi 题 */
  step: number;
  /** 基础 CSS 前缀，默认 "qz" */
  prefix?: string;
}

export default function Quiz({ questions, step, prefix = "qz" }: QuizProps) {
  const [picks, setPicks] = useState<(number | null)[]>(Array(questions.length).fill(null));

  return (
    <div className={`${prefix}-root`}>
      {questions.map((q, qi) =>
        step >= qi + 1 ? (
          <div key={qi} className={`${prefix}-q ${prefix}-q--in`}>
            <div className={`${prefix}-q-title`}>{q.title}</div>
            <div className={`${prefix}-opts`}>
              {q.opts.map((opt, oi) => {
                const cls =
                  picks[qi] === oi
                    ? oi === q.correct
                      ? `${prefix}-opt--right`
                      : `${prefix}-opt--wrong`
                    : "";
                return (
                  <button
                    key={oi}
                    className={`${prefix}-opt ${cls}`}
                    onClick={() => {
                      const next = [...picks];
                      next[qi] = oi;
                      setPicks(next);
                    }}
                    data-no-advance
                  >
                    {opt}
                  </button>
                );
              })}
            </div>
            {picks[qi] !== null && (
              <div
                className={`${prefix}-fb ${picks[qi] === q.correct ? `${prefix}-fb--right` : `${prefix}-fb--wrong}`}
              >
                {picks[qi] === q.correct ? q.feedback.right : q.feedback.wrong}
              </div>
            )}
          </div>
        ) : null
      )}
    </div>
  );
}
