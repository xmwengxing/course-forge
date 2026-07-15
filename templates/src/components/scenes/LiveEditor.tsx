import "./LiveEditor.css";

/* ─────────────────────────────────────────────────────────────
 * LiveEditor — 现场改 Bug 编辑器（§ 模拟实景 · 现场编辑器）
 *
 * 模拟真实调试：bug 行红波浪线 + 放大镜扫过；进入 fixedStep 后该行变绿、
 * 控制台从红色 Error 翻成绿色 Pass。受控：由 step 推导 fixed / showBug，
 * 无内部状态，切步即可重演。颜色全走主题 token（warn=红 / good=绿）。
 *
 * 用法：
 *   <LiveEditor
 *     fileName="main.js"
 *     code={[{ text: "function startGame() {", status: "normal" },
 *             { text: "  score = 0;  // 未声明就被使用", status: "bug" },
 *             { text: "  spawnPlayer();", status: "normal" },
 *             { text: "}", status: "normal" }]}
 *     step={step} bugStep={4} fixedStep={5}
 *     errorMsg='ReferenceError: score 未初始化'
 *     okMsg="全部测试通过 · 0 个未捕获异常" />
 * ───────────────────────────────────────────────────────────── */
export interface EditorLine {
  text: string;
  /** "bug" 行在修复前标红波浪线；修复后变绿。 */
  status?: "bug" | "normal";
}
export interface LiveEditorProps {
  fileName?: string;
  code: EditorLine[];
  step: number;
  /** bug 行出现的 step。 */
  bugStep: number;
  /** bug 被修复、控制台变绿的 step。 */
  fixedStep: number;
  errorMsg?: string;
  okMsg?: string;
  className?: string;
}

export function LiveEditor({
  fileName = "main.js",
  code,
  step,
  bugStep,
  fixedStep,
  errorMsg = "ReferenceError: 变量未初始化",
  okMsg = "全部测试通过 · 0 个未捕获异常",
  className,
}: LiveEditorProps) {
  const fixed = step >= fixedStep;
  const showBug = step >= bugStep && !fixed;

  return (
    <div className={`cf-editor ${className ?? ""}`}>
      <div className="cf-editor-bar">
        <span className="cf-dot" />
        <span className="cf-dot" />
        <span className="cf-dot" />
        <span className="cf-file label-mono">{fileName}</span>
      </div>
      <div className="cf-editor-code">
        {code.map((ln, i) => (
          <div
            key={i}
            className={`cf-code-line ${ln.status === "bug" ? (fixed ? "is-fixed" : "is-bug") : ""}`}
          >
            <span className="cf-ln label-mono">{i + 1}</span>
            <span className="cf-code-text mono">{ln.text}</span>
          </div>
        ))}
        {showBug && (
          <svg className="cf-editor-sweep" viewBox="0 0 360 150" aria-hidden="true">
            <circle cx="120" cy="60" r="22" className="cf-lens" />
            <line x1="138" y1="78" x2="162" y2="102" className="cf-lens-h" />
          </svg>
        )}
      </div>
      <div className={`cf-editor-console ${fixed ? "is-ok" : "is-err"}`}>
        <span className="cf-console-dot" />
        {fixed ? okMsg : showBug ? errorMsg : "等待运行…"}
      </div>
    </div>
  );
}
