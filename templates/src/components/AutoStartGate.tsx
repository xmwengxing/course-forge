import "./AutoStartGate.css";

interface Props {
  visible: boolean;
  onStart(): void;
}

/**
 * Full-screen overlay shown ONCE when `?auto=1` is loaded. Browsers block
 * audio playback until the page receives a user gesture, so we show this
 * gate and let the user click to release auto playback.
 *
 * **We do NOT own the Space key.** The parent <App> owns Space exclusively
 * (capture-phase listener) and routes to "start auto" when the gate is
 * visible. This avoids double-fire / race conditions between two listeners.
 *
 * After the user starts, the gate is hidden for the rest of the session.
 */
export function AutoStartGate({ visible, onStart }: Props) {
  if (!visible) return null;
  return (
    <div className="auto-gate" data-no-advance onClick={onStart}>
      <div className="auto-gate-card">
        <div className="auto-gate-kicker">AUTO PLAYBACK</div>
        <div className="auto-gate-title">Click or press SPACE to start</div>
        <div className="auto-gate-sub">
          Audio plays per step and advances automatically.
          <br />
          Press <kbd>M</kbd> any time to switch modes.
        </div>
      </div>
    </div>
  );
}