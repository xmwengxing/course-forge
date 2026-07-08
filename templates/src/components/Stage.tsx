import type { CSSProperties, ReactNode } from "react";
import { useStageScale } from "../hooks/useStageScale";

interface Props {
  onAdvance(): void;
  children: ReactNode;
  /**
   * "viewport" (default) = full-screen fixed (`.app-shell`), used by
   *   single-video mode where Stage owns the entire screen.
   * "embedded" = normal flow (no `.app-shell`), used by course mode where
   *   ChapterMenu + ModeControls + SubtitleStep share the screen with
   *   Stage. The fitter is still 1920×1080 scaled, but `.app-stage-area`
   *   above centers it within the main column.
   */
  layout?: "viewport" | "embedded";
}

/**
 * The 16:9 stage. Click anywhere except interactive children = advance.
 *
 * Layout structure (3 nested elements):
 *   .app-shell    ← full viewport, flex-centers the fitter
 *   .stage-fitter ← sized to ACTUAL VISIBLE px (1920*scale × 1080*scale)
 *                   so the layout system honestly sees what's on screen
 *                   and centers it bulletproof on every viewport / DPR.
 *   .stage-frame  ← raw 1920×1080 box, scaled from top-left into the fitter.
 *
 * Surface colors come from the active theme's CSS custom properties
 * (var(--shell), var(--surface)) — see themes/<id>/tokens.css.
 */
export function Stage({ onAdvance, children, layout = "viewport" }: Props) {
  const scale = useStageScale();
  const fitterStyle: CSSProperties = {
    width: 1920 * scale,
    height: 1080 * scale,
  };
  const frameStyle: CSSProperties = {
    transform: `scale(${scale})`,
  };
  return (
    <div className={layout === "embedded" ? "stage-embedded" : "app-shell"}>
      <div className="stage-fitter" style={fitterStyle}>
        <div
          className="stage-frame"
          style={frameStyle}
          onClick={(e) => {
            const t = e.target as HTMLElement;
            if (t.closest("button, a, input, [data-no-advance]")) return;
            onAdvance();
          }}
        >
          {children}
        </div>
      </div>
    </div>
  );
}
