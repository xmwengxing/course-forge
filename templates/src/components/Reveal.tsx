import { useEffect, useState, type CSSProperties, type ReactNode } from "react";

export type RevealVariant =
  | "rise" | "scale" | "pop" | "fade"
  | "blur" | "wipe" | "clip" | "slide";

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
  /** 动画进入完成回调（show 变 true 且过渡结束时触发） */
  onEntered?: () => void;
}

/**
 * Generic, element-level progressive reveal.
 *
 * 兜底设计：内联 style 控制 opacity，即使主题的 animations.css 缺
 * `.cf-reveal` 类，元素也能正确显隐（不会永久 opacity:0 不可见）。
 * variant 的 transform 动画仍由 `.cf-reveal--<variant>` 增强（主题按需扩展）。
 *
 * 无障碍：检测 `prefers-reduced-motion`，开启时无过渡直接显隐。
 */
export function Reveal({
  show,
  delay = 0,
  duration,
  variant = "rise",
  className,
  children,
  onEntered,
}: Props) {
  const [reduced, setReduced] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReduced(mq.matches);
    const handler = () => setReduced(mq.matches);
    mq.addEventListener?.("change", handler);
    return () => mq.removeEventListener?.("change", handler);
  }, []);

  const cls = [
    "cf-reveal",
    `cf-reveal--${variant}`,
    show ? "in" : "",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  // 兜底：内联 opacity 保证显隐正确（不依赖 .cf-reveal 类必须存在）
  const style: CSSProperties = reduced
    ? { opacity: show ? 1 : 0, transition: "none" }
    : {
        opacity: show ? 1 : 0,
        transitionDelay: show ? `${delay}ms` : "0ms",
        ...(duration ? { transitionDuration: `${duration}ms` } : null),
      };

  return (
    <div
      className={cls}
      style={style}
      onTransitionEnd={show && onEntered && !reduced ? onEntered : undefined}
    >
      {children}
    </div>
  );
}
