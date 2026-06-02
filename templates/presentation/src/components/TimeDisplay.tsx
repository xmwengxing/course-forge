import "./TimeDisplay.css";

interface Props {
  remainingMs: number;
  totalMs: number;
}

function formatHMS(ms: number): string {
  if (ms <= 0) return "00:00:00";
  const sign = ms < 0 ? "-" : "";
  const abs = Math.abs(ms);
  const h = Math.floor(abs / 3600000);
  const m = Math.floor((abs % 3600000) / 60000);
  const s = Math.floor((abs % 60000) / 1000);
  return `${sign}${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

export function TimeDisplay({ remainingMs, totalMs }: Props) {
  if (totalMs <= 0) return null;
  const pct = Math.min(100, Math.max(0, ((totalMs - remainingMs) / totalMs) * 100));

  return (
    <div className="td-root" data-no-advance>
      <div className="td-time">
        <span className="td-label">剩余</span>
        <span className="td-countdown">{formatHMS(remainingMs)}</span>
      </div>
      <div className="td-track">
        <div className="td-fill" style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}
