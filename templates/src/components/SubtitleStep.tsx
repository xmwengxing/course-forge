import { useEffect, useState } from "react";
import type { ChapterDef } from "../registry/types";
import type { Cursor } from "../hooks/useStepper";
import "./SubtitleStep.css";

export interface SubtitleStepProps {
  chapters: ChapterDef[];
  cursor: Cursor;
}

/**
 * SubtitleStep — render the spoken narration for the current step.
 *
 * Loads `/subtitle-timing.json` (produced by `python3 scripts/
 * subtitle-timing.py`) once and looks up the current (chapter, step)
 * tuple. Renders up to 80 characters per chunk. The full layout sits
 * below the Stage so the user always sees what the narrator is saying
 * without overlapping the visual.
 *
 * **Preview fallback (no-TTS mode):** when `subtitle-timing.json` has no
 * entry for the current (chapter, step) — e.g. the chapter has not been
 * through TTS yet — we fall back to the chapter's `narrations[step]` text
 * (the 口播稿 source of truth). This lets the 口播稿 be reviewed in the
 * player *before* any audio is synthesized, instead of showing an empty
 * "…" placeholder.
 */
export function SubtitleStep({ chapters, cursor }: SubtitleStepProps) {
  const [data, setData] = useState<Record<string, Record<string, SubtitleChunk[]>> | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    fetch("/subtitle-timing.json", { cache: "no-store" })
      .then((r) => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        return r.json();
      })
      .then((j) => {
        if (!cancelled) setData(j as Record<string, Record<string, SubtitleChunk[]>>);
      })
      .catch((e) => {
        if (!cancelled) setError(String(e));
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const chapter = chapters[cursor.chapter];
  const stepKey = String(cursor.step);
  const chunks = data && chapter ? data[chapter.id]?.[stepKey] : undefined;
  const fallbackText = chapter?.narrations?.[cursor.step] ?? "";

  // A load error only matters when we also have no narration to fall back to.
  if (error && !fallbackText) {
    return (
      <div className="ss-bar ss-bar--err">
        <div className="ss-err label-mono">字幕加载失败: {error}</div>
      </div>
    );
  }

  const chunksToShow =
    chunks && chunks.length > 0
      ? chunks
      : fallbackText
        ? [{ text: fallbackText, ms: 0 }]
        : null;

  if (!chunksToShow) {
    return (
      <div className="ss-bar">
        <div className="ss-empty label-mono">…</div>
      </div>
    );
  }

  return (
    <div className="ss-bar">
      {chunksToShow.map((c, i) => (
        <div key={i} className="ss-chunk serif-cn">
          {c.text}
        </div>
      ))}
    </div>
  );
}

interface SubtitleChunk {
  text: string;
  ms: number;
}
