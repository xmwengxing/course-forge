import { useEffect, useState } from "react";
import "./TypeOut.css";

/* ─────────────────────────────────────────────────────────────
 * TypeOut — 终端打字机（§ 模拟实景 · 终端打字）
 *
 * 揭示时逐字符"写"出代码/口播，配闪烁光标，让 IDE / 终端"活"起来。
 * 受控：由 `step >= revealAtStep` 触发打字，隐藏态仍占位（opacity:0），
 * 不回流、不溢出。颜色 / 字体全走主题 token。
 *
 * 用法：
 *   <Reveal show={step >= 3}>
 *     <TypeOut text={"移到 x: -100  y: 0"} step={step} revealAtStep={3} />
 *   </Reveal>
 * ───────────────────────────────────────────────────────────── */
export interface TypeOutProps {
  /** 要逐字打出的文本（通常是脚本 / 命令）。 */
  text: string;
  /** 当前全局 step。 */
  step: number;
  /** 当 step >= 该值才开始打字。 */
  revealAtStep?: number;
  /** 每个字符间隔（ms）。 */
  speed?: number;
  className?: string;
}

export function TypeOut({ text, step, revealAtStep = 0, speed = 45, className }: TypeOutProps) {
  const [count, setCount] = useState(0);
  const active = step >= revealAtStep;

  useEffect(() => {
    if (!active) {
      setCount(0);
      return;
    }
    setCount(0);
    let i = 0;
    const id = window.setInterval(() => {
      i += 1;
      setCount(i);
      if (i >= text.length) window.clearInterval(id);
    }, speed);
    return () => window.clearInterval(id);
  }, [active, text, speed]);

  return (
    <pre className={`cf-typeout mono ${className ?? ""}`} aria-label={text}>
      {text.slice(0, count)}
      {active && count < text.length && <span className="cf-typeout-caret" aria-hidden="true" />}
    </pre>
  );
}
