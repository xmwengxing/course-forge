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
  /**
   * Independent of playback mode: when true the audio is paused and
   * auto-advance is held. The button renders ⏸/▶ and toggles between
   * the two states via `onTogglePause`. Default false.
   */
  isPaused?: boolean;
  onTogglePause?: () => void;
}

/**
 * ModeControls — explicit playback-mode + transport controls.
 *
 * Three mode buttons (manual / audio / auto), one play-pause button, and
 * an optional fullscreen toggle. Pressing M on the keyboard cycles
 * playback mode; Space toggles play/pause; F toggles fullscreen.
 *
 * Layout order (left → right):
 *   ⏯ [Pause/Play]   MANUAL | AUDIO | AUTO   ⛶ [Fullscreen]
 *   hint text on the right
 */
export function ModeControls({
  mode,
  onModeChange,
  hint,
  onFullscreen,
  isFullscreen,
  isPaused,
  onTogglePause,
}: ModeControlsProps) {
  const set = useCallback(
    (target: PlaybackMode) => () => onModeChange(target),
    [onModeChange],
  );

  return (
    <div className="mc-bar">
      <div className="mc-group" role="group" aria-label="播放控制">
        {onTogglePause && (
          <button
            type="button"
            className={`mc-btn mc-btn--pause ${isPaused ? "mc-btn--pause-active" : ""}`}
            onClick={onTogglePause}
            aria-pressed={!!isPaused}
            title="Space"
            data-no-advance
          >
            <span className="mc-btn-icon">
              {isPaused ? "▶" : "⏸"}
            </span>
            <span className="mc-btn-cn serif-cn">{isPaused ? "播放" : "暂停"}</span>
          </button>
        )}
        <div className="mc-divider" aria-hidden="true" />
        <div className="mc-mode-group" role="radiogroup" aria-label="播放模式">
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
        </div>
        <div className="mc-divider" aria-hidden="true" />
        {onFullscreen && (
          <button
            type="button"
            className={`mc-btn mc-btn--fs ${isFullscreen ? "mc-btn--fs-active" : ""}`}
            onClick={onFullscreen}
            aria-pressed={!!isFullscreen}
            title="F"
            data-no-advance
          >
            <span className="mc-btn-icon">{isFullscreen ? "⛶" : "⛶"}</span>
            <span className="mc-btn-cn serif-cn">{isFullscreen ? "退出全屏" : "全屏"}</span>
          </button>
        )}
      </div>
      {hint && <div className="mc-hint label-mono">{hint}</div>}
    </div>
  );
}