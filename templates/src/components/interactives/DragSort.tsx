import { useState } from "react";
import "./interactives.css";

/* ─────────────────────────────────────────────────────────────
 * DragSort — 拖拽排序（§ 每屏≥1处真互动）
 *
 * 4-6 张卡片打乱显示，用户拖拽（HTML5 pointer / drag 事件）重排，
 * 落位后与 correctOrder 比对逐张判定对错。
 *
 * 用法：
 *   <DragSort items={["写入DB","校验","取输入"]} correctOrder={["取输入","校验","写入DB"]}
 *              step={step} revealAtStep={3} />
 * ───────────────────────────────────────────────────────────── */
export interface DragSortProps {
  /** 打乱后的初始序列（4-6 项）。 */
  items: string[];
  step: number;
  /** 第一张卡片出现的 step。 */
  revealAtStep?: number;
  /** 正确顺序；提供则落位后逐张判定对错。 */
  correctOrder?: string[];
  className?: string;
}

export function DragSort({ items, step, revealAtStep = 0, correctOrder, className }: DragSortProps) {
  const visible = step >= revealAtStep;
  const [order, setOrder] = useState(items);
  const [dragIdx, setDragIdx] = useState<number | null>(null);
  const [touched, setTouched] = useState(false);

  const handleDrop = (targetIdx: number) => {
    if (dragIdx === null || dragIdx === targetIdx) {
      setDragIdx(null);
      return;
    }
    const next = [...order];
    const [moved] = next.splice(dragIdx, 1);
    next.splice(targetIdx, 0, moved);
    setOrder(next);
    setDragIdx(null);
    setTouched(true);
  };

  const judge = (item: string, idx: number) => {
    if (!correctOrder || !touched) return "";
    return correctOrder[idx] === item ? "is-correct" : "is-wrong";
  };

  return (
    <div
      className={`it-root it-ds ${visible ? "" : "is-hidden"} ${className ?? ""}`}
      data-no-advance
    >
      <div className="it-ds-grid">
        {order.map((item, i) => (
          <div
            key={item}
            className={`it-ds-card ${dragIdx === i ? "is-dragging" : ""} ${judge(item, i)}`}
            draggable
            onDragStart={() => setDragIdx(i)}
            onDragOver={(e) => e.preventDefault()}
            onDrop={() => handleDrop(i)}
            onDragEnd={() => setDragIdx(null)}
          >
            <span className="it-ds-grip label-mono">≡</span>
            <span className="it-ds-label serif-cn">{item}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
