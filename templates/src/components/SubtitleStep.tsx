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

  if (error) {
    return (
      <div className="ss-bar ss-bar--err">
        <div className="ss-err label-mono">字幕加载失败: {error}</div>
      </div>
    );
  }

  if (!chunks || chunks.length === 0) {
    return (
      <div className="ss-bar">
        <div className="ss-empty label-mono">…</div>
      </div>
    );
  }

  return (
    <div className="ss-bar">
      {chunks.map((c, i) => (
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
