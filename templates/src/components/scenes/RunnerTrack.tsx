import "./RunnerTrack.css";

/* ─────────────────────────────────────────────────────────────
 * RunnerTrack — 执行跑道（§ 模拟实景 · 执行跑道）
 *
 * 把"程序顺序执行"演成看得见的事：左侧脚本逐行高亮，右侧小机器人在
 * 跑道上按当前行滑到对应位置，到指定 step 还会冒出对话气泡。
 * 受控：由 step 推导 activeLine / 机器人位置 / 是否说话。无内部状态，
 * 切步即可重演。颜色 / 字体全走主题 token。
 *
 * 用法：
 *   <RunnerTrack
 *     lines={["移到 x:-100 y:0", "移到 x:100 y:0", "说「你好」2 秒"]}
 *     step={step} startStep={7} sayingStep={9} />
 * ───────────────────────────────────────────────────────────── */
export interface RunnerTrackProps {
  /** 脚本行（一行 = 一步执行单元）。 */
  lines: string[];
  step: number;
  /** 第 0 行变为 active 的 step（"运行"开始）。 */
  startStep: number;
  /** 可选：机器人说出台词的 step。 */
  sayingStep?: number;
  startLabel?: string;
  endLabel?: string;
  className?: string;
}

export function RunnerTrack({
  lines,
  step,
  startStep,
  sayingStep,
  startLabel = "起点",
  endLabel = "终点",
  className,
}: RunnerTrackProps) {
  const activeLine = Math.max(0, Math.min(lines.length, step - startStep + 1));
  const denom = Math.max(1, lines.length - 1);
  const t = Math.min(Math.max(activeLine - 1, 0), lines.length - 1) / denom;
  const pos = 110 + t * 220; // 跑道 viewBox 内的 x 坐标（110=起点 → 330=终点）
  const saying = sayingStep != null && step >= sayingStep;

  return (
    <div className={`cf-runner ${className ?? ""}`}>
      <div className="cf-runner-script">
        {lines.map((ln, i) => (
          <div key={i} className={`cf-run-line ${i < activeLine ? "is-run" : ""}`}>
            <span className="cf-run-n label-mono">{i + 1}</span>
            <span className="cf-run-text mono">{ln}</span>
          </div>
        ))}
      </div>

      <svg className="cf-runner-track" viewBox="0 0 440 220" role="img" aria-label="执行跑道：机器人按脚本逐行移动">
        <line x1="40" y1="176" x2="400" y2="176" className="cf-run-rail" />
        <g className="cf-run-target cf-run-target--a">
          <circle cx="110" cy="176" r="9" />
          <text x="110" y="204" className="cf-run-target-label label-mono">{startLabel}</text>
        </g>
        <g className="cf-run-target cf-run-target--b">
          <circle cx="330" cy="176" r="9" />
          <text x="330" y="204" className="cf-run-target-label label-mono">{endLabel}</text>
        </g>
        <g className="cf-runner-bot" transform={`translate(${pos} 138)`}
          style={{ transition: "transform 0.55s var(--ease-quart)" }}>
          <rect x="-22" y="-46" width="44" height="42" rx="11" className="cf-runner-body" />
          <circle cx="0" cy="-54" r="16" className="cf-runner-head" />
          <circle cx="-6" cy="-54" r="3" className="cf-runner-eye" />
          <circle cx="6" cy="-54" r="3" className="cf-runner-eye" />
          <rect x="-12" y="-40" width="24" height="6" rx="3" className="cf-runner-mouth" />
          {saying && (
            <g transform="translate(22 -72)">
              <rect x="0" y="0" width="92" height="40" rx="10" className="cf-runner-bubble" />
              <text x="46" y="26" className="cf-runner-bubble-text label-mono">你好！</text>
            </g>
          )}
        </g>
      </svg>
    </div>
  );
}
