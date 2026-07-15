import "./BlockStack.css";

/* ─────────────────────────────────────────────────────────────
 * BlockStack — 积木逐个堆叠（§ 模拟实景 · 积木堆叠）
 *
 * 接收 step：每块在预留好的固定槽位里就地淡入上叠，已出现的块不被推动
 * （隐藏块用 opacity:0 + 固定 top 占位，无 display:none、无回流）。
 * 适合表达"逐块搭建 / 逐层拼装"的口播。
 *
 * 用法：
 *   <BlockStack blocks={["取得输入", "校验格式", "写入数据库"]}
 *              step={step} revealFromStep={5} />
 * ───────────────────────────────────────────────────────────── */
export interface BlockStackProps {
  /** 每块积木的标签。 */
  blocks: string[];
  step: number;
  /** 第 0 块出现的 step。 */
  revealFromStep?: number;
  /** 可选标题。 */
  caption?: string;
  className?: string;
}

export function BlockStack({ blocks, step, revealFromStep = 0, caption, className }: BlockStackProps) {
  const revealed = Math.max(0, step - revealFromStep + 1);
  const slot = 60; // 每个槽位的像素高度（含间距）

  return (
    <div className={`cf-blockstack ${className ?? ""}`}>
      {caption && <div className="cf-bs-cap label-mono">{caption}</div>}
      <div className="cf-bs-stage" style={{ height: blocks.length * slot }}>
        {blocks.map((b, i) => (
          <div
            key={i}
            className={`cf-bs-block cf-bs-block--${(i % 3) + 1} ${i < revealed ? "is-in" : ""}`}
            style={{ top: i * slot }}
          >
            <span className="cf-bs-idx label-mono">{i + 1}</span>
            <span className="cf-bs-label serif-cn">{b}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
