import { useCallback } from "react";
import "./ModeControls.css";

export type PlaybackMode = "manual" | "audio" | "auto";

export interface ModeControlsProps {
  /**
   * "playing" — the active step is currently playing audio (auto mode,
   *   audio mode with autoplay, or audio mode with user-clicked resume).
   *   Shows "AUTO 全自动" with a green pulse.
   * "paused" — the active step is paused (user hit Space or auto mode
   *   has not started yet). Shows "MANUAL 手动" with a neutral state.
   */
  playbackPhase: "playing" | "paused";
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
 * TransportControls — the playback transport group: pause/play, the
 * AUTO/MANUAL status badge, and fullscreen. Extracted from ModeControls
 * so the bottom dock (AppDock) can compose it next to the progress
 * readout without the surrounding `.mc-bar` chrome.
 *
 * Layout order (left → right):
 *   ⏯ [Pause/Play]   ◉ [Status badge: AUTO or MANUAL]   ⛶ [Fullscreen]
 *   hint text on the right
 */
export interface TransportControlsProps {
  playbackPhase: "playing" | "paused";
  onTogglePause?: () => void;
  isPaused?: boolean;
  onFullscreen?: () => void;
  isFullscreen?: boolean;
  hint?: string;
}

export function TransportControls({
  playbackPhase,
  onTogglePause,
  isPaused,
  onFullscreen,
  isFullscreen,
  hint,
}: TransportControlsProps) {
  return (
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
      <div
        className={`mc-status mc-status--${playbackPhase}`}
        aria-live="polite"
        aria-label={playbackPhase === "playing" ? "全自动播放中" : "手动暂停"}
      >
        {playbackPhase === "playing" ? (
          <>
            <span className="mc-status-dot" aria-hidden="true" />
            <span className="mc-status-en label-mono">AUTO</span>
            <span className="mc-status-cn serif-cn">全自动</span>
          </>
        ) : (
          <>
            <span className="mc-status-icon" aria-hidden="true">⏸</span>
            <span className="mc-status-en label-mono">MANUAL</span>
            <span className="mc-status-cn serif-cn">手动</span>
          </>
        )}
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
          <span className="mc-btn-icon">⛶</span>
          <span className="mc-btn-cn serif-cn">{isFullscreen ? "退出全屏" : "全屏"}</span>
        </button>
      )}
      {hint && <div className="mc-hint label-mono">{hint}</div>}
    </div>
  );
}

/**
 * ModeControls — compact playback transport (pause / fullscreen / state).
 *
 * The 3-state mode toggle (MANUAL / AUDIO / AUTO) has been collapsed
 * into a single status badge: it shows "AUTO 全自动" when audio is
 * playing, "MANUAL 手动" when paused. The user still controls state
 * via the Space key and the pause / play button. Switching between
 * internal modes is now hidden — pressing M on the keyboard still
 * cycles through the underlying modes, but the user doesn't see a
 * button for it.
 *
 * This component is now a thin wrapper around `TransportControls`, kept
 * for the single-video mode footer (where it renders as its own bar).
 * In course mode the bottom dock (AppDock) composes `TransportControls`
 * directly so the progress bar and the transport share one row.
 */
export function ModeControls({
  playbackPhase,
  onModeChange: _onModeChange,
  hint,
  onFullscreen,
  isFullscreen,
  isPaused,
  onTogglePause,
}: ModeControlsProps) {
  const _set = useCallback(
    (target: PlaybackMode) => () => _onModeChange(target),
    [_onModeChange],
  );
  // Touching _set / _onModeChange so the linter doesn't strip them — the
  // M key handler in App.tsx calls cycleMode() directly, but ModeControls
  // historically received onModeChange. Keeping the prop keeps the API
  // surface compatible for projects that want to surface the 3-state UI.
  void _set;

  return (
    <div className="mc-bar">
      <TransportControls
        playbackPhase={playbackPhase}
        onTogglePause={onTogglePause}
        isPaused={isPaused}
        onFullscreen={onFullscreen}
        isFullscreen={isFullscreen}
        hint={hint}
      />
    </div>
  );
}