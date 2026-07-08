import { useState } from "react";
import type { QuizQuestion } from "../registry/types";
import "./QuizPanel.css";

export interface QuizPanelProps {
  question: QuizQuestion;
  /**
   * Called when the user submits an answer. The parent decides
   * whether to advance, show rationale, or block auto-mode.
   */
  onSubmit: (result: { correct: boolean; selected: string[]; text: string }) => void;
  /**
   * If true, the panel is non-modal but the user must submit before
   * auto-mode can advance past this step.
   */
  blocking?: boolean;
}

export function QuizPanel({ question, onSubmit, blocking = true }: QuizPanelProps) {
  const [selected, setSelected] = useState<string[]>([]);
  const [text, setText] = useState("");
  const [submitted, setSubmitted] = useState(false);

  function toggleOption(id: string) {
    if (submitted) return;
    if (question.type === "single") {
      setSelected([id]);
    } else if (question.type === "multi") {
      setSelected((prev) =>
        prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
      );
    }
  }

  function isCorrect(): boolean {
    if (!question.correct) return false;
    if (question.type === "text") {
      // Text answers are not auto-graded — treat as correct on submit
      // so the parent can decide what to do. The L1 reaction layer
      // tracks submissions separately.
      return true;
    }
    const correct = new Set(question.correct);
    if (selected.length !== correct.size) return false;
    return selected.every((s) => correct.has(s));
  }

  function handleSubmit() {
    if (submitted) return;
    setSubmitted(true);
    onSubmit({ correct: isCorrect(), selected, text });
  }

  return (
    <div className={`qp-panel ${blocking ? "qp-panel--blocking" : ""}`}>
      <div className="qp-prompt serif-cn">{question.prompt}</div>

      {question.type !== "text" && question.options && (
        <div className="qp-options">
          {question.options.map((opt) => {
            const isSel = selected.includes(opt.id);
            const isCorrectOpt = question.correct?.includes(opt.id) ?? false;
            const showResult = submitted;
            return (
              <button
                key={opt.id}
                type="button"
                className={[
                  "qp-opt",
                  isSel ? "qp-opt--sel" : "",
                  showResult && isCorrectOpt ? "qp-opt--correct" : "",
                  showResult && isSel && !isCorrectOpt ? "qp-opt--wrong" : "",
                ]
                  .filter(Boolean)
                  .join(" ")}
                onClick={() => toggleOption(opt.id)}
                disabled={submitted}
              >
                <span className="qp-opt-id label-mono">{opt.id.toUpperCase()}</span>
                <span className="qp-opt-label serif-cn">{opt.label}</span>
              </button>
            );
          })}
        </div>
      )}

      {question.type === "text" && (
        <textarea
          className="qp-text"
          placeholder={question.placeholder || "输入你的答案..."}
          value={text}
          onChange={(e) => setText(e.target.value)}
          disabled={submitted}
          rows={3}
        />
      )}

      {!submitted && (
        <button
          type="button"
          className="qp-submit"
          onClick={handleSubmit}
          disabled={
            (question.type !== "text" && selected.length === 0) ||
            (question.type === "text" && text.trim().length === 0)
          }
        >
          提交
        </button>
      )}

      {submitted && question.rationale && (
        <div className="qp-rationale">
          <div className="qp-rationale-kicker label-mono">解析</div>
          <div className="qp-rationale-body serif-cn">{question.rationale}</div>
        </div>
      )}
    </div>
  );
}
