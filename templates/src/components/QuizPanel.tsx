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

/** 稳定 shuffle（基于 seed，避免每次渲染重排选项） */
function stableShuffle<T>(arr: T[], seedStr: string): T[] {
  const out = [...arr];
  let seed = seedStr.split("").reduce((a, c) => a + c.charCodeAt(0), 0) || 1;
  for (let i = out.length - 1; i > 0; i--) {
    seed = (seed * 9301 + 49297) % 233280;
    const j = Math.floor((seed / 233280) * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

export function QuizPanel({ question, onSubmit, blocking = true }: QuizPanelProps) {
  const [selected, setSelected] = useState<string[]>([]);
  const [text, setText] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [submittedCorrect, setSubmittedCorrect] = useState(false);

  // 选项 shuffle（稳定，基于 question.id，不每次重排）
  const options = question.options
    ? stableShuffle(question.options, question.id)
    : [];

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
    if (question.type === "text") {
      // text 题有 correct = 关键字匹配（输入含任一关键字即对）
      if (question.correct && question.correct.length > 0) {
        const lower = text.toLowerCase();
        return question.correct.some((kw) => lower.includes(kw.toLowerCase()));
      }
      // text 题无 correct = 主观题，提交即过（标"需人工确认"）
      return true;
    }
    if (!question.correct) return false;
    const correct = new Set(question.correct);
    if (selected.length !== correct.size) return false;
    return selected.every((s) => correct.has(s));
  }

  function handleSubmit() {
    if (submitted) return;
    const correct = isCorrect();
    setSubmittedCorrect(correct);
    setSubmitted(true);
    onSubmit({ correct, selected, text });
  }

  function handleRetry() {
    setSubmitted(false);
    setSubmittedCorrect(false);
    setSelected([]);
    setText("");
  }

  const isTextSubjective = question.type === "text" && (!question.correct || question.correct.length === 0);

  return (
    <div className={`qp-panel ${blocking ? "qp-panel--blocking" : ""}`}>
      <div className="qp-prompt serif-cn">{question.prompt}</div>

      {question.type !== "text" && (
        <div className="qp-options" role="group" aria-label={question.prompt}>
          {options.map((opt) => {
            const isSel = selected.includes(opt.id);
            const isCorrectOpt = question.correct?.includes(opt.id) ?? false;
            const showResult = submitted;
            return (
              <button
                key={opt.id}
                type="button"
                aria-pressed={isSel}
                className={[
                  "qp-opt",
                  isSel ? "qp-opt--sel" : "",
                  showResult && isCorrectOpt ? "qp-opt--correct" : "",
                  showResult && isSel && !isCorrectOpt ? "qp-opt--wrong" : "",
                ]
                  .filter(Boolean)
                  .join(" ")}
                onClick={() => toggleOption(opt.id)}
                disabled={submitted && submittedCorrect}
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
          aria-label={question.prompt}
          placeholder={question.placeholder || "输入你的答案..."}
          value={text}
          onChange={(e) => setText(e.target.value)}
          disabled={submitted && submittedCorrect}
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

      {/* 答错可重试 */}
      {submitted && !submittedCorrect && (
        <button type="button" className="qp-retry" onClick={handleRetry}>
          再试一次
        </button>
      )}

      {submitted && isTextSubjective && (
        <div className="qp-subjective label-mono">主观题，已提交（需人工确认）</div>
      )}

      {submitted && question.rationale && (
        <div className="qp-rationale">
          <div className="qp-rationale-kicker label-mono">
            {submittedCorrect ? "✓ 正确" : "✗ 再想想"} · 解析
          </div>
          <div className="qp-rationale-body serif-cn">{question.rationale}</div>
        </div>
      )}
    </div>
  );
}
