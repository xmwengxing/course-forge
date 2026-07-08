import { useCallback } from "react";
import "./ModeControls.css";

export type PlaybackMode = "manual" | "audio" | "auto";

export interface ModeControlsProps {
  mode: PlaybackMode;
  onModeChange: (m: PlaybackMode) => void;
  /** "space → start auto" hint text shown next to the button. */
  hint?: string;
  onFullscreen?: () => void;
  isFullscreen?: boolean;
}

/**
 * ModeControls — explicit 3-state playback mode toggle.
 *
 * Modes (in order of "amount of automation"):
 *   manual  — no audio, click/keyboard only
 *   audio   — plays each step's audio, but you click/keyboard to advance
 *   auto    — plays audio + auto-advances on `audio.ended` (for recording)
 *
 * Pressing M on the keyboard cycles through these.
 */
export function ModeControls({ mode, onModeChange, hint, onFullscreen, isFullscreen }: ModeControlsProps) {
  const set = useCallback(
    (target: PlaybackMode) => () => onModeChange(target),
    [onModeChange],
  );

  return (
    <div className="mc-bar">
      <div className="mc-group" role="radiogroup" aria-label="播放模式">
        {(["manual", "audio", "auto"] as const).map((m) => (
          <button
            key={m}
            type="button"
            className={`mc-btn ${mode === m ? "mc-btn--active" : ""}`}
            onClick={set(m)}
            aria-pressed={mode === m}
            role="radio"
            aria-checked={mode === m}
          >
            <span className="mc-btn-en label-mono">{m.toUpperCase()}</span>
            <span className="mc-btn-cn serif-cn">
              {m === "manual" && "手动"}
              {m === "audio" && "半自动"}
              {m === "auto" && "全自动"}
            </span>
          </button>
        ))}
        {onFullscreen && (
          <button
            type="button"
            className="mc-btn mc-btn--fs"
            onClick={onFullscreen}
            aria-pressed={!!isFullscreen}
            title="F"
          >
            <span className="mc-btn-en label-mono">FS</span>
            <span className="mc-btn-cn serif-cn">{isFullscreen ? "退出全屏" : "全屏"}</span>
          </button>
        )}
      </div>
      {hint && <div className="mc-hint label-mono">{hint}</div>}
    </div>
  );
}
