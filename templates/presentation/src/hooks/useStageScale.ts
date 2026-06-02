import { useEffect, useState } from "react";

function responsiveMargins(w: number, h: number): [number, number] {
  let mx: number, my: number;
  if (h > 800) { mx = 32; my = 48; }
  else if (h > 500) { mx = 24; my = 32; }
  else { mx = 8; my = 12; }
  return [mx, my];
}

/**
 * Compute the scale needed to fit a 1920x1080 stage inside the current
 * viewport. Margins shrink on small screens (mobile fullscreen).
 */
export function useStageScale(
  baseW = 1920,
  baseH = 1080,
) {
  const [scale, setScale] = useState(1);

  useEffect(() => {
    function update() {
      const [marginX, marginY] = responsiveMargins(window.innerWidth, window.innerHeight);
      const usefulW = Math.max(320, window.innerWidth - marginX * 2);
      const usefulH = Math.max(180, window.innerHeight - marginY * 2);
      setScale(Math.min(usefulW / baseW, usefulH / baseH));
    }
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, [baseW, baseH]);

  return scale;
}
