import { Children, type ReactNode } from "react";

interface Props {
  /** base delay between siblings (ms) */
  stagger?: number;
  /** initial delay before first child (ms) */
  initialDelay?: number;
  /** if true, also slides in from below (defaults true) */
  slideIn?: boolean;
  className?: string;
  children: ReactNode;
}

/**
 * StaggeredAppear — wraps children, fades + slides them in one by one.
 * Each child gets `animation-delay: i * stagger + initialDelay`.
 * Used in S1 / S2 to "assemble" a scene progressively (e.g. building a
 * 4-symbol BPMN grid card by card as 翁老师 explains each symbol).
 */
export function StaggeredAppear({
  stagger = 200,
  initialDelay = 0,
  slideIn = true,
  className,
  children,
}: Props) {
  const arr = Children.toArray(children);
  return (
    <div className={`staggered-appear ${slideIn ? "is-slide" : ""} ${className ?? ""}`}>
      {arr.map((child, i) => (
        <div
          key={i}
          className="staggered-item"
          style={{
            animationDelay: `${initialDelay + i * stagger}ms`,
          }}
        >
          {child}
        </div>
      ))}
    </div>
  );
}
