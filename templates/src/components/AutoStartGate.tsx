import { useEffect } from "react";
import "./AutoStartGate.css";

interface Props {
  visible: boolean;
  onStart(): void;
}

/**
 * Full-screen overlay shown ONCE when `?auto=1` is loaded. Browsers block
 * audio playback until the page receives a user gesture, so we show this
 * gate and let the user press Space (or click) to release auto playback.
 *
 * After the user starts, the gate is hidden for the rest of the session.
 *
 * NOTE: We **do NOT** put `role="button" tabIndex={0}` on the gate. The
 * browser's default behavior is to fire a button's click handler when
 * Space is pressed on a focused button — that would double-fire with
 * App.tsx's window-level keydown listener. Instead, the gate registers
 * its own keydown listener (on the gate element) for Space, so it
 * gets the event with stopPropagation preventing the App.tsx handler
 * from also toggling pause. After the gate dismisses, App.tsx owns
 * Space exclusively.
 */
export function AutoStartGate({ visible, onStart }: Props) {
  useEffect(() => {
    if (!visible) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === " " || e.code === "Space") {
        e.preventDefault();
        e.stopPropagation();
        onStart();
      }
    };
    // Capture phase so we run before the App.tsx bubble-phase listener.
    window.addEventListener("keydown", onKey, true);
    return () => window.removeEventListener("keydown", onKey, true);
  }, [visible, onStart]);

  if (!visible) return null;
  return (
    <div className="auto-gate" data-no-advance onClick={onStart}>
      <div className="auto-gate-card">
        <div className="auto-gate-kicker">AUTO PLAYBACK</div>
        <div className="auto-gate-title">Press SPACE to start</div>
        <div className="auto-gate-sub">
          Audio plays per step and advances automatically.
          <br />
          Press <kbd>M</kbd> any time to switch modes.
        </div>
      </div>
    </div>
  );
}