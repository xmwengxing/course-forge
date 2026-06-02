import { useState } from "react";
import "./Accordion.css";

export interface AccordionItem {
  id: string | number;
  label: string;
  tech?: string;
  detail: string;
  /** 级别标识（如 L1 / L2） */
  level?: string;
}

interface AccordionProps {
  items: AccordionItem[];
  /** 是否可见（控制整体入场动画） */
  visible?: boolean;
  /** 基础 CSS 前缀，默认 "acc" */
  prefix?: string;
  /** 层级间连接文字，默认 "▼ 如果还失败 ▼" */
  chainText?: string;
}

export default function Accordion({ items, visible = true, prefix = "acc", chainText }: AccordionProps) {
  const [expanded, setExpanded] = useState<string | number | null>(null);

  if (!visible) return null;

  return (
    <div className={`${prefix}-root`}>
      {items.map((item, i) => (
        <div key={item.id} className={`${prefix}-group`}>
          {i > 0 && chainText && <span className={`${prefix}-chain`}>{chainText}</span>}
          <button
            className={`${prefix}-level ${expanded === item.id ? `${prefix}-level--active` : ""} ${prefix}--in`}`}
            onClick={() => setExpanded(expanded === item.id ? null : item.id)}
            data-no-advance
          >
            {item.level && <span className={`${prefix}-level-id`}>{item.level}</span>}
            <div className={`${prefix}-level-info`}>
              <span className={`${prefix}-level-label`}>{item.label}</span>
              {item.tech && <span className={`${prefix}-level-tech`}>{item.tech}</span>}
            </div>
            <span className={`${prefix}-level-toggle`}>{expanded === item.id ? "▲" : "▶"}</span>
          </button>
          {expanded === item.id && (
            <div className={`${prefix}-detail`}>
              <span className={`${prefix}-detail-text`}>{item.detail}</span>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
