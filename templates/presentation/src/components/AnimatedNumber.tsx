import { useEffect, useState, useRef } from "react";

interface Props {
  value: number;
  duration?: number;
  className?: string;
  prefix?: string;
  suffix?: string;
  decimals?: number;
  /** delay in ms before animation starts (used to stagger multiple numbers) */
  delay?: number;
}

/**
 * AnimatedNumber — ease-out number counter that animates 0 → value on mount.
 * Used for hero stats that should "roll up" to a satisfying climax.
 * Decoupled from the chapter's `step` prop; can also be re-triggered
 * by changing `value` to a new target.
 */
export function AnimatedNumber({
  value,
  duration = 1400,
  className,
  prefix = "",
  suffix = "",
  decimals = 0,
  delay = 0,
}: Props) {
  const [n, setN] = useState(0);
  const rafRef = useRef<number | null>(null);
  const startRef = useRef<number | null>(null);

  useEffect(() => {
    if (delay > 0) {
      const t = setTimeout(() => startAnim(), delay);
      return () => clearTimeout(t);
    }
    startAnim();
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value, delay]);

  function startAnim() {
    startRef.current = null;
    const tick = (ts: number) => {
      if (startRef.current === null) startRef.current = ts;
      const elapsed = ts - startRef.current;
      const t = Math.min(1, elapsed / duration);
      // ease-out-quart
      const eased = 1 - Math.pow(1 - t, 4);
      setN(value * eased);
      if (t < 1) rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
  }

  const display = decimals > 0 ? n.toFixed(decimals) : Math.round(n).toString();

  return (
    <span className={className}>
      {prefix}
      {display}
      {suffix}
    </span>
  );
}
