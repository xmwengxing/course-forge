import "./interactives.css";

/* ─────────────────────────────────────────────────────────────
 * SliderInput — 滑块输入（§ 每屏≥1处真互动）
 *
 * 受控滑块：拖动触发 onChange，实时显示当前数值。
 * 由父级持有 value 状态，可在口播中联动其他视觉。
 *
 * 用法：
 *   const [v, setV] = useState(50);
 *   <SliderInput min={0} max={100} value={v} onChange={setV}
 *                step={step} revealAtStep={3} label="阈值" />
 * ───────────────────────────────────────────────────────────── */
export interface SliderInputProps {
  min: number;
  max: number;
  value: number;
  onChange: (v: number) => void;
  /** 全局章节 step（用于揭示控制，非滑块步长）。 */
  step: number;
  revealAtStep?: number;
  label?: string;
  className?: string;
}

export function SliderInput({
  min,
  max,
  value,
  onChange,
  step,
  revealAtStep = 0,
  label,
  className,
}: SliderInputProps) {
  const visible = step >= revealAtStep;
  return (
    <div
      className={`it-root it-sl ${visible ? "" : "is-hidden"} ${className ?? ""}`}
      data-no-advance
    >
      {label && <div className="it-sl-label label-mono">{label}</div>}
      <div className="it-sl-row">
        <input
          type="range"
          className="it-sl-input"
          min={min}
          max={max}
          value={value}
          onChange={(e) => onChange(Number(e.target.value))}
        />
        <span className="it-sl-val mono">{value}</span>
      </div>
    </div>
  );
}
