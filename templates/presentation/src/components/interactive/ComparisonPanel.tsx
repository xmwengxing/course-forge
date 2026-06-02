import { useState, type ReactNode } from "react";
import "./ComparisonPanel.css";

export interface PanelSide {
  label: string;
  quote?: string;
  stats: { label: string; value: string; highlight?: boolean }[];
  result: string;
  riskNote?: string;
}

interface ComparisonPanelProps {
  left: PanelSide;
  right: PanelSide;
  /** 是否启用点击选择 */
  interactive?: boolean;
  /** 是否启用 VS 裁决按钮 */
  showVerdict?: boolean;
  /** 外部控制的裁决状态 */
  verdict?: boolean;
  /** VS 按钮被点击 */
  onVerdict?: () => void;
  /** 基础 CSS 前缀，默认 "cp" */
  prefix?: string;
}

export default function ComparisonPanel({
  left, right,
  interactive = true,
  showVerdict = true,
  verdict: externalVerdict = false,
  onVerdict,
  prefix = "cp",
}: ComparisonPanelProps) {
  const [internSelected, setInternSelected] = useState<"left" | "right" | null>(null);
  const [internVerdict, setInternVerdict] = useState(false);
  const selected = internSelected;
  const v = showVerdict ? externalVerdict || internVerdict : false;

  const handleSelect = (side: "left" | "right") => {
    if (!interactive) return;
    setInternSelected(side);
    if (showVerdict) setInternVerdict(true);
  };

  const handleVerdict = () => {
    setInternVerdict(true);
    onVerdict?.();
  };

  const renderPanel = (side: PanelSide, which: "left" | "right") => {
    const isSelected = selected === which;
    const isRejected = v && !isSelected && selected !== null;
    const isApproved = v && isSelected;
    return (
      <button
        className={`${prefix}-panel ${prefix}-panel--${which} ${isSelected ? `${prefix}-panel--selected` : ""} ${isRejected ? `${prefix}-panel--rejected` : ""} ${isApproved ? `${prefix}-panel--approved` : ""} ${!isSelected && v ? `${prefix}-panel--dim` : ""}`}
        onClick={() => handleSelect(which)}
        data-no-advance
      >
        <div className={`${prefix}-panel-head`}>
          <span className={`${prefix}-panel-label`}>{side.label}</span>
          {isRejected && <span className={`${prefix}-verdict ${prefix}-verdict--no`}>✕ 否决</span>}
          {isApproved && <span className={`${prefix}-verdict ${prefix}-verdict--yes`}>✓ 生效</span>}
        </div>
        {side.quote && <div className={`${prefix}-panel-quote`}>{side.quote}</div>}
        <div className={`${prefix}-panel-stats`}>
          {side.stats.map((s, i) => (
            <span key={i} className={`${prefix}-stat ${s.highlight ? `${prefix}-stat--hi` : ""}`}>{s.label}: {s.value}</span>
          ))}
        </div>
        <div className={`${prefix}-panel-result`}>{side.result}</div>
        {side.riskNote && <div className={`${prefix}-panel-risk`}>{side.riskNote}</div>}
      </button>
    );
  };

  return (
    <div className={`${prefix}-root`}>
      <div className={`${prefix}-layout`}>
        {renderPanel(left, "left")}
        {showVerdict && (
          <button className={`${prefix}-vs ${!v ? `${prefix}-vs--pulse` : ""}`} onClick={handleVerdict} data-no-advance>
            <span className={`${prefix}-vs-text`}>VS</span>
            {!v && <span className={`${prefix}-vs-hint`}>点击仲裁</span>}
            {v && <span className={`${prefix}-vs-done`}>裁决结果 ↓</span>}
          </button>
        )}
        {renderPanel(right, "right")}
      </div>
      {v && (
        <div className={`${prefix}-banner`}>
          <span className={`${prefix}-banner-title`}>仲裁铁律</span>
          <span className={`${prefix}-banner-text`}>危急值标记 → 一票否决 → 直接路由</span>
        </div>
      )}
    </div>
  );
}
