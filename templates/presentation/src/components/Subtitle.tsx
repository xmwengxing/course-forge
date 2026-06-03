import { useEffect, useState, useMemo, useCallback } from "react";
import "./Subtitle.css";

type ChunkTiming = { text: string; ms: number };
type TimingMap = Record<string, Record<string, ChunkTiming[]>>;

interface Props { text: string; chapterId: string; stepIndex: number; timingMap: TimingMap | null; paused?: boolean; }

function ChunkCycle({ chunks, delays, cycleKey, paused }: { chunks: string[]; delays: number[]; cycleKey: string; paused?: boolean }) {
  const [idx, setIdx] = useState(0);
  const cumulative = useMemo(() => {
    const arr: number[] = []; let acc = 0;
    for (const d of delays) { acc += d; arr.push(acc); }
    return arr;
  }, [delays.join(",")]);

  useEffect(() => {
    setIdx(0);
    if (chunks.length <= 1) return;
    if (paused) return;
    const timers: ReturnType<typeof setTimeout>[] = [];
    for (let i = 1; i < chunks.length; i++) {
      timers.push(setTimeout(() => setIdx(i), cumulative[i - 1]));
    }
    return () => timers.forEach(clearTimeout);
  }, [cycleKey, paused]);

  return (
    <span className="sub-text">
      {chunks.map((c, i) => (
        <span key={i} className={`sub-chunk ${i === idx ? "sub-on" : ""}`}>{c}</span>
      ))}
    </span>
  );
}

function readVisibility(): boolean {
  try { return localStorage.getItem("sub-visible") !== "0"; } catch { return true; }
}

export function Subtitle({ text, chapterId, stepIndex, timingMap, paused }: Props) {
  const [visible, setVisible] = useState(readVisibility);

  const toggle = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    setVisible(prev => {
      const next = !prev;
      try { localStorage.setItem("sub-visible", next ? "1" : "0"); } catch {}
      return next;
    });
  }, []);

  const stepTimings = timingMap?.[chapterId]?.[String(stepIndex)] ?? null;
  const { chunks, delays, cycleKey } = useMemo(() => {
    if (stepTimings && stepTimings.length > 0) {
      const c = stepTimings.map(t => t.text);
      const d = stepTimings.map(t => t.ms);
      return { chunks: c, delays: d, cycleKey: `${chapterId}-${stepIndex}-${d.join(",")}` };
    }
    const segments = text.split(/(?<=[。！？，、])/); const raw: string[] = []; let cur = "";
    for (const s of segments) { if ((cur + s).length > 60 && cur) { raw.push(cur); cur = s; } else { cur += s; } } if (cur) raw.push(cur);
    const c = raw.length ? raw : [text]; const totalS = Math.max(text.length / 3, 3); const msPer = Math.round((totalS * 1000) / c.length);
    return { chunks: c, delays: Array(c.length).fill(Math.max(msPer, 2000)), cycleKey: `${chapterId}-${stepIndex}-auto` };
  }, [text, chapterId, stepIndex, stepTimings]);

  if (!text) return null;

  return (
    <div className={`sub-bar${!visible ? " sub-bar--blind" : ""}`}>
      {visible ? (
        <button className="sub-toggle" onClick={toggle} data-no-advance title="隐藏字幕">👁</button>
      ) : (
        <button className="sub-toggle" onClick={toggle} data-no-advance title="显示字幕">👁‍🗨</button>
      )}
      {visible && <ChunkCycle key={cycleKey} chunks={chunks} delays={delays} cycleKey={cycleKey} paused={paused} />}
    </div>
  );
}
