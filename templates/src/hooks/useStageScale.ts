import { useEffect, useState } from "react";

/**
 * Compute the scale needed to fit a 1920x1080 stage inside the available
 * area, leaving `marginX` / `marginY` of breathing room around it.
 *
 * When `getContainer` is supplied the scale is measured against that
 * element's real box (the `.stage-embedded` / `.app-stage-area` in course
 * mode), so the canvas grows when the surrounding chrome shrinks — it is
 * NOT pinned to the whole window. When omitted it falls back to the
 * viewport, preserving the old behaviour for full-screen single mode.
 */
export function useStageScale(
  opts: {
    baseW?: number;
    baseH?: number;
    marginX?: number;
    marginY?: number;
    getContainer?: () => HTMLElement | null;
  } = {},
) {
  const {
    baseW = 1920,
    baseH = 1080,
    marginX = 32,
    marginY = 24,
    getContainer,
  } = opts;
  const [scale, setScale] = useState(1);

  useEffect(() => {
    function update() {
      const el = getContainer?.();
      const cw = el ? el.clientWidth : window.innerWidth;
      const ch = el ? el.clientHeight : window.innerHeight;
      const usefulW = Math.max(320, cw - marginX * 2);
      const usefulH = Math.max(180, ch - marginY * 2);
      setScale(Math.min(usefulW / baseW, usefulH / baseH));
    }
    update();
    window.addEventListener("resize", update);
    let ro: ResizeObserver | undefined;
    const el = getContainer?.();
    if (el && typeof ResizeObserver !== "undefined") {
      ro = new ResizeObserver(update);
      ro.observe(el);
    }
    return () => {
      window.removeEventListener("resize", update);
      ro?.disconnect();
    };
  }, [baseW, baseH, marginX, marginY, getContainer]);

  return scale;
}
