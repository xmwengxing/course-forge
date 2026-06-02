import "./CircleStateDiagram.css";

export interface CircleState {
  id: string;
  label: string;
  desc: string;
  /** CSS 颜色变量名或直接颜色值 */
  color: string;
  /** 状态图标（● / ✕ / ◎） */
  icon?: string;
}

interface CircleStateDiagramProps {
  states: CircleState[];
  /** step 控制可见状态数（0 表示全隐藏，1 表示显示第一个，以此类推） */
  visibleCount: number;
  /** 状态间的过渡文字，如 ["失败率 > 阈值", "超时后试探", "试探成功"] */
  transitions?: string[];
  /** 基础 CSS 前缀，默认 "csd" */
  prefix?: string;
  /** 底部提示文字 */
  footnote?: string;
}

export default function CircleStateDiagram({
  states, visibleCount, transitions, prefix = "csd", footnote,
}: CircleStateDiagramProps) {
  return (
    <div className={`${prefix}-root`}>
      <div className={`${prefix}-states`}>
        {states.map((s, i) => (
          <div key={s.id} className={`${prefix}-state ${i < visibleCount ? `${prefix}-state--visible` : ""}`}>
            <div className={`${prefix}-circle`} style={{ borderColor: s.color, boxShadow: i < visibleCount ? `0 0 16px ${s.color}22` : "none" }}>
              {i < visibleCount && s.icon && (
                <span className={`${prefix}-icon`} style={{ color: s.color }}>{s.icon}</span>
              )}
            </div>
            <span className={`${prefix}-label`}>{s.label}</span>
            <span className={`${prefix}-desc`}>{s.desc}</span>
          </div>
        ))}
      </div>
      {transitions && (
        <div className={`${prefix}-arrows`}>
          {transitions.map((t, i) => (
            <div key={i} className={`${prefix}-arrow-group ${i < visibleCount - 1 ? `${prefix}-arrow-group--visible` : ""}`}>
              <span className={`${prefix}-arrow-text`}>{t}</span>
              <span className={`${prefix}-arrow`}>→</span>
            </div>
          ))}
        </div>
      )}
      {footnote && (
        <div className={`${prefix}-footnote`}>
          <span className={`${prefix}-footnote-text`}>{footnote}</span>
        </div>
      )}
    </div>
  );
}
