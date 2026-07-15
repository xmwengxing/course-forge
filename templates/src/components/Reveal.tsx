import type { CSSProperties, ReactNode } from "react";

export type RevealVariant = "rise" | "scale" | "pop" | "fade";

interface Props {
  /** Whether the element is revealed. Drive this from the current `step`. */
  show: boolean;
  /** Stagger delay in ms (e.g. 120, 240...) — use to cascade siblings. */
  delay?: number;
  /** Override the theme default duration (ms). */
  duration?: number;
  /** Visual variant. Defaults to "rise". */
  variant?: RevealVariant;
  className?: string;
  children: ReactNode;
}

/**
 * Generic, element-level progressive reveal.
 *
 * Unlike `MaskReveal` (which is a clip-path text wipe for inline text),
 * `Reveal` wraps **any** element — cards, SVG groups, images, buttons —
 * and animates it in via transform + opacity when `show` flips true.
 * This is the building block for "每屏内容逐步揭示" when the reveal
 * target is not pure text.
 *
 * Pair with `.cf-reveal` / `.cf-reveal--<variant>` / `.in` from
 * animations.css. The motion uses theme tokens (`--dur-base`,
 * `--ease-quart`) so it stays theme-aware.
 */
export function Reveal({
  show,
  delay = 0,
  duration,
  variant = "rise",
  className,
  children,
}: Props) {
  const cls = [
    "cf-reveal",
    `cf-reveal--${variant}`,
    show ? "in" : "",
    className,
  ]
    .filter(Boolean)
    .join(" ");
  const style: CSSProperties = {
    transitionDelay: show ? `${delay}ms` : "0ms",
    ...(duration ? { transitionDuration: `${duration}ms` } : null),
  };
  return (
    <div className={cls} style={style}>
      {children}
    </div>
  );
}
