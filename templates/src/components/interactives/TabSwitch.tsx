import { useState } from "react";
import type { ReactNode } from "react";
import "./interactives.css";

/* ─────────────────────────────────────────────────────────────
 * TabSwitch — 点击切 tab（§ 每屏≥1处真互动）
 *
 * 点击 tab 头切换面板内容（useState activeTab）。
 * tab 用 box-shadow + active 态 accent 描线。
 *
 * 用法：
 *   <TabSwitch tabs={[
 *       { id:"a", label:"方案A", content:<p>说明 A</p> },
 *       { id:"b", label:"方案B", content:<p>说明 B</p> },
 *     ]} step={step} revealAtStep={3} />
 * ───────────────────────────────────────────────────────────── */
export interface TabItem {
  id: string;
  label: string;
  content: ReactNode;
}

export interface TabSwitchProps {
  tabs: TabItem[];
  step: number;
  revealAtStep?: number;
  className?: string;
}

export function TabSwitch({ tabs, step, revealAtStep = 0, className }: TabSwitchProps) {
  const visible = step >= revealAtStep;
  const [active, setActive] = useState(tabs[0]?.id ?? "");
  const activeTab = tabs.find((t) => t.id === active);

  return (
    <div
      className={`it-root it-ts ${visible ? "" : "is-hidden"} ${className ?? ""}`}
      data-no-advance
    >
      <div className="it-ts-bar">
        {tabs.map((t) => (
          <button
            key={t.id}
            className={`it-ts-tab label-mono ${active === t.id ? "is-active" : ""}`}
            onClick={() => setActive(t.id)}
          >
            {t.label}
          </button>
        ))}
      </div>
      <div className="it-ts-panel">{activeTab?.content}</div>
    </div>
  );
}
