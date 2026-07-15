import type { ReactNode } from "react";
import { TransportControls } from "./ModeControls";
import "./AppDock.css";

export interface AppDockProps {
  /**
   * Progress fill percentage (0–100) for the rail that sits at the very
   * top edge of the dock — it doubles as the divider between the canvas
   * and the control area, so the dock reclaims the vertical space the
   * old separate progress bar used to occupy.
   */
  railPct: number;
  /** Left-side readout (e.g. the Ch/Step/% group). */
  readout: ReactNode;
  /** Transport controls (passed straight to `TransportControls`). */
  playbackPhase: "playing" | "paused";
  isPaused?: boolean;
  onTogglePause?: () => void;
  onFullscreen?: () => void;
  isFullscreen?: boolean;
  hint?: string;
}

/**
 * AppDock — the single bottom control region for course mode.
 *
 * Layout (top → bottom):
 *   1. `.dock-rail` — a full-width hairline that fills `railPct`. This is
 *      the **top edge** of the dock and replaces the old standalone
 *      progress bar, so the canvas gains vertical space.
 *   2. `.dock-row` — one compact row: `readout` on the left, the transport
 *      controls (pause / status / fullscreen) on the right.
 *
 * This merges what used to be two stacked bars (`CourseProgress` +
 * `ModeControls`, ~92px) into one ~44px region.
 */
export function AppDock({
  railPct,
  readout,
  playbackPhase,
  isPaused,
  onTogglePause,
  onFullscreen,
  isFullscreen,
  hint,
}: AppDockProps) {
  return (
    <footer className="app-dock" data-no-advance>
      <div className="dock-rail" aria-hidden="true">
        <div className="dock-rail-fill" style={{ width: `${railPct}%` }} />
      </div>
      <div className="dock-row">
        <div className="dock-readout">{readout}</div>
        <TransportControls
          playbackPhase={playbackPhase}
          isPaused={isPaused}
          onTogglePause={onTogglePause}
          onFullscreen={onFullscreen}
          isFullscreen={isFullscreen}
          hint={hint}
        />
      </div>
    </footer>
  );
}
