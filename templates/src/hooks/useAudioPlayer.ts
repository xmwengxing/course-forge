import { useEffect, useRef } from "react";

export type PlaybackMode = "manual" | "audio" | "auto";

interface Options {
  /** Audio file path. `null` = no audio for this step (silent). */
  src: string | null;
  /** `manual` = no playback. `audio` = play but don't auto-advance.
   *  `auto` = play and auto-advance when finished. */
  mode: PlaybackMode;
  /** Small breathing pad (ms) after audio finishes before advancing,
   *  in `auto` mode. Default 200ms. Set to 0 if mp3 already has trailing
   *  silence. */
  trailMs?: number;
  /** Fallback duration (ms) for `auto` mode when the audio file is missing
   *  or fails to play. Typically computed from text length. */
  estimateFallbackMs?: number;
  /** Called when `auto` mode determines the step is finished. */
  onAutoAdvance: () => void;
  /** Has the user started auto playback? (Browsers block autoplay until
   *  the page receives a user gesture; the AutoStartGate flips this.) */
  autoStarted: boolean;
  /** Pause the audio (and, in auto mode, hold auto-advance). The parent
   *  also gates `onAutoAdvance` so auto-advance never fires while paused. */
  paused?: boolean;
}

/**
 * Per-step audio playback for the presentation.
 *
 * Manages a single hidden `<audio>` element. Switches `src` whenever the
 * current step changes.
 *
 * In `auto` mode:
 *   • Audio file present → advance `trailMs` after the audio's `ended` event.
 *   • Audio file missing / blocked / src = null → advance after
 *     `estimateFallbackMs` (so previews and silent steps still work).
 *
 * Audio playback is the sole driver of step duration — there is intentionally
 * no "minimum hold" knob. If a chapter's visual animation needs more time,
 * the chapter should write longer narration, split the step, or speed the
 * animation up. This keeps Auto-mode behavior trivially predictable.
 *
 * The `paused` flag is honored by (a) pausing the audio element when it
 * transitions to true, and (b) not firing the auto-advance timer when
 * the user has paused. The parent still gates `onAutoAdvance` so manual
 * click + Stage tap also stop advancing while paused.
 */
export function useAudioPlayer({
  src,
  mode,
  trailMs = 200,
  estimateFallbackMs = 1500,
  onAutoAdvance,
  autoStarted,
  paused = false,
}: Options) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  // Latest callback ref so timers don't capture stale closures.
  const onAdvanceRef = useRef(onAutoAdvance);
  onAdvanceRef.current = onAutoAdvance;
  const pausedRef = useRef(paused);
  pausedRef.current = paused;

  // Pause / resume the live audio element whenever the flag flips.
  // We don't re-create the element — just pause it so resuming
  // continues from the same position.
  useEffect(() => {
    const a = audioRef.current;
    if (!a) return;
    if (paused) {
      a.pause();
    } else {
      a.play().catch(() => {
        /* autoplay may be blocked — AutoStartGate handles user-gesture */
      });
    }
  }, [paused]);

  useEffect(() => {
    const prev = audioRef.current;
    if (prev) {
      prev.pause();
      prev.removeAttribute("src");
      prev.load();
      audioRef.current = null;
    }

    if (mode === "manual") return;
    if (mode === "auto" && !autoStarted) return;

    let advanced = false;
    let timer: number | null = null;

    const advanceAfter = (ms: number) => {
      if (mode !== "auto" || advanced) return;
      if (pausedRef.current) return; // honor pause
      timer = window.setTimeout(() => {
        if (advanced || pausedRef.current) return;
        advanced = true;
        onAdvanceRef.current();
      }, Math.max(0, ms));
    };

    if (src) {
      const audio = new Audio(src);
      audioRef.current = audio;
      audio.preload = "auto";

      audio.addEventListener("ended", () => advanceAfter(trailMs));
      audio.addEventListener("error", () => {
        // Audio file missing or undecodable — fall back to estimate.
        if (mode === "auto") advanceAfter(estimateFallbackMs);
      });

      if (!pausedRef.current) {
        audio.play().catch((err) => {
          // Autoplay blocked (rare, AutoStartGate should prevent this) or
          // file missing — fall back to estimate in auto mode.
          console.warn("audio play failed:", err);
          if (mode === "auto") advanceAfter(estimateFallbackMs);
        });
      }
    } else if (mode === "auto") {
      // No audio for this step (silent / empty narration) — use estimate.
      advanceAfter(estimateFallbackMs);
    }

    return () => {
      advanced = true;
      if (timer != null) clearTimeout(timer);
      const a = audioRef.current;
      if (a) {
        a.pause();
        a.removeAttribute("src");
        a.load();
        audioRef.current = null;
      }
    };
  }, [src, mode, trailMs, estimateFallbackMs, autoStarted]);
}