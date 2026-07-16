import { useState } from "react";
import "./interactives.css";

/* ─────────────────────────────────────────────────────────────
 * NodeGraph — 可点击节点图（§ 每屏≥1处真互动）
 *
 * 点击带子节点的根节点展开 / 折叠子节点（useState expanded Set）。
 * 节点用 radial-gradient + box-shadow 材质立体。
 *
 * 用法：
 *   <NodeGraph nodes={[
 *       { id:"api", label:"API 层", children:[
 *           { id:"auth", label:"鉴权" }, { id:"route", label:"路由" },
 *       ]},
 *       { id:"db", label:"数据层" },
 *     ]} step={step} revealAtStep={3} />
 * ───────────────────────────────────────────────────────────── */
export interface GraphChild {
  id: string;
  label: string;
}
export interface GraphNode {
  id: string;
  label: string;
  children?: GraphChild[];
}

export interface NodeGraphProps {
  nodes: GraphNode[];
  step: number;
  revealAtStep?: number;
  className?: string;
}

export function NodeGraph({ nodes, step, revealAtStep = 0, className }: NodeGraphProps) {
  const visible = step >= revealAtStep;
  const [expanded, setExpanded] = useState<Set<string>>(new Set());

  const toggle = (id: string) => {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  return (
    <div
      className={`it-root it-ng ${visible ? "" : "is-hidden"} ${className ?? ""}`}
      data-no-advance
    >
      <div className="it-ng-board">
        {nodes.map((n) => {
          const isOpen = expanded.has(n.id);
          const hasChildren = !!n.children?.length;
          return (
            <div key={n.id} className="it-ng-group">
              <button
                className={`it-ng-node ${isOpen ? "is-open" : ""}`}
                onClick={() => hasChildren && toggle(n.id)}
              >
                <span className="it-ng-label serif-cn">{n.label}</span>
                {hasChildren && (
                  <span className="it-ng-mark label-mono">{isOpen ? "−" : "+"}</span>
                )}
              </button>
              {hasChildren && isOpen && (
                <div className="it-ng-children">
                  {n.children!.map((c) => (
                    <div key={c.id} className="it-ng-child">
                      <span className="it-ng-dot" />
                      <span>{c.label}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
