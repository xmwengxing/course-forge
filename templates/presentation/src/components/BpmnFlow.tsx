

export interface FlowNode {
  id: string;
  label: string;
  kind?: "start" | "task" | "decision" | "end";
  /** if true, node is highlighted (active step revealed it) */
  active?: boolean;
  /** if true, node is "banned" / to be removed (red strike) */
  killed?: boolean;
}

interface Props {
  nodes: FlowNode[];
  /** ids in order they should "light up" as steps advance */
  revealOrder?: string[];
  /** current step (used to drive reveal) */
  step: number;
  /** id of currently focused node (e.g. when 翁老师 is explaining it) */
  focusedId?: string;
  className?: string;
}

/**
 * BpmnFlow — simple horizontal BPMN flow with shape variants.
 * Nodes are revealed by step (0-indexed). Active = accent-glow. Killed =
 * red strike-through. Focused = extra-emphasized.
 *
 * Used in S1 (流程图) and S2 (As-Is, To-Be). For complex flow charts
 * with branches, use a more advanced component (TODO: BpmnFlowAdvanced).
 */
export function BpmnFlow({ nodes, revealOrder, step, focusedId, className }: Props) {
  const visibleSet = new Set<string>();
  if (revealOrder) {
    for (let i = 0; i <= step && i < revealOrder.length; i++) {
      visibleSet.add(revealOrder[i]);
    }
  }

  return (
    <div className={`bpmn-flow ${className ?? ""}`}>
      {nodes.map((n, i) => {
        const visible = !revealOrder || visibleSet.has(n.id);
        const active = visible && (n.active || focusedId === n.id);
        const killed = n.killed ?? false;
        const isFocused = focusedId === n.id;
        return (
          <div key={n.id} className="bpmn-flow-row" data-no-advance>
            {visible ? (
              <>
                <FlowShape node={n} active={active} killed={killed} focused={isFocused} />
                {i < nodes.length - 1 && (
                  <span className={`bpmn-flow-arrow ${active ? "is-active" : ""}`}>→</span>
                )}
              </>
            ) : (
              <span className="bpmn-flow-placeholder">…</span>
            )}
          </div>
        );
      })}
    </div>
  );
}

function FlowShape({
  node,
  active,
  killed,
  focused,
}: {
  node: FlowNode;
  active: boolean;
  killed: boolean;
  focused: boolean;
}) {
  const cls = [
    "bpmn-flow-node",
    `bpmn-flow-node--${node.kind ?? "task"}`,
    active ? "is-active" : "",
    killed ? "is-killed" : "",
    focused ? "is-focused" : "",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div className={cls}>
      <span className="bpmn-flow-node-label">{node.label}</span>
    </div>
  );
}
