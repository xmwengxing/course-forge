import { useState } from "react";
import type { ChapterStepProps } from "../../registry/types";
import { Reveal } from "../../components/Reveal";
import "./Ide.css";

/**
 * Chapter 02 — 工程师工作台
 *
 * 6 步:
 *  - step 0 自我介绍 (hook)
 *  - step 1-3 三大区同屏 3 槽位 + 步 N 推进激活第 N 个
 *  - step 4 绿旗红圈 (启动/停止 2 状态动效焦点, **真交互** —— 点 toggle 切 state)
 *  - step 5 积木→指令双轨 (同屏 2 元素映射)
 *
 * 真视觉：每屏都画真实的 IDE 界面模拟（用 SVG + 几何块），
 * 不是文字卡片。导师真画一个 IDE，让"小极客"看到真工作台长啥样。
 *
 * 真交互（章节内必须有，遵循 CHAPTER-CRAFT.md § 必须用交互）：
 *   step 4 FlagsPanel —— 点击 RUN/STOP 按钮切 useState(running)，按钮颜色 + 提示文本同步变。
 *   data-no-advance 防止按钮被 Stage 的全局 click 抢走推进。
 */
const REGIONS = [
  {
    id: "stage",
    cn: "运行环境",
    en: "Runtime",
    role: "所有指令最终在这里执行",
    svg: (
      <svg viewBox="0 0 100 80" aria-hidden="true" className="ide-region-svg">
        <rect x="4" y="4" width="92" height="72" stroke="currentColor" strokeWidth="1.5" fill="none" />
        <line x1="4" y1="14" x2="96" y2="14" stroke="currentColor" strokeWidth="1" opacity="0.4" />
        <line x1="0" y1="40" x2="100" y2="40" stroke="currentColor" strokeWidth="0.5" opacity="0.2" strokeDasharray="2 2" />
        <line x1="50" y1="14" x2="50" y2="76" stroke="currentColor" strokeWidth="0.5" opacity="0.2" strokeDasharray="2 2" />
        <text x="50" y="46" textAnchor="middle" fontSize="14" fill="currentColor" fontFamily="monospace">●</text>
        <text x="6" y="11" fontSize="6" fill="currentColor" fontFamily="monospace">x:-120 y:80</text>
        <text x="78" y="11" fontSize="6" fill="currentColor" fontFamily="monospace">x:120 y:-80</text>
      </svg>
    ),
  },
  {
    id: "sprite",
    cn: "资源管理器",
    en: "Sprite Manager",
    role: "所有角色和素材都登记在这里",
    svg: (
      <svg viewBox="0 0 100 80" aria-hidden="true" className="ide-region-svg">
        <rect x="4" y="4" width="92" height="72" stroke="currentColor" strokeWidth="1.5" fill="none" />
        <line x1="4" y1="14" x2="96" y2="14" stroke="currentColor" strokeWidth="1" opacity="0.4" />
        <text x="6" y="11" fontSize="6" fill="currentColor" fontFamily="monospace">SPRITES</text>
        {/* 4 sprite thumbnails */}
        {[
          [10, 22],
          [36, 22],
          [62, 22],
          [88, 22],
        ].map(([cx, cy], i) => (
          <g key={i}>
            <rect x={cx - 8} y={cy - 8} width="16" height="16" stroke="currentColor" strokeWidth="1" fill="none" />
            <circle cx={cx} cy={cy} r="3" fill="currentColor" />
          </g>
        ))}
        <line x1="4" y1="42" x2="96" y2="42" stroke="currentColor" strokeWidth="1" opacity="0.3" />
        <text x="6" y="52" fontSize="6" fill="currentColor" fontFamily="monospace">cat</text>
        <text x="6" y="62" fontSize="6" fill="currentColor" fontFamily="monospace">dog</text>
        <text x="6" y="72" fontSize="6" fill="currentColor" fontFamily="monospace">ball</text>
      </svg>
    ),
  },
  {
    id: "script",
    cn: "脚本编辑器",
    en: "Script Editor",
    role: "我们在这里把指令拼成积木再交给电脑执行",
    svg: (
      <svg viewBox="0 0 100 80" aria-hidden="true" className="ide-region-svg">
        <rect x="4" y="4" width="92" height="72" stroke="currentColor" strokeWidth="1.5" fill="none" />
        <line x1="4" y1="14" x2="96" y2="14" stroke="currentColor" strokeWidth="1" opacity="0.4" />
        <text x="6" y="11" fontSize="6" fill="currentColor" fontFamily="monospace">SCRIPT</text>
        {/* Scratch block shapes (3 stacked) */}
        {[
          { y: 18, color: "var(--accent-warn)", label: "on start" },
          { y: 32, color: "var(--accent-tech)", label: "move 10" },
          { y: 46, color: "var(--accent-good)", label: "say hi" },
        ].map((b, i) => (
          <g key={i}>
            <rect x="8" y={b.y} width="42" height="10" fill="currentColor" />
            <rect x="12" y={b.y + 2} width="34" height="6" fill="var(--surface)" />
            <text x="29" y={b.y + 8} textAnchor="middle" fontSize="5" fill="currentColor" fontFamily="monospace">{b.label}</text>
          </g>
        ))}
        <circle cx="6" cy="23" r="2" fill="currentColor" />
        <circle cx="6" cy="37" r="2" fill="currentColor" />
        <circle cx="6" cy="51" r="2" fill="currentColor" />
        <line x1="60" y1="22" x2="92" y2="22" stroke="currentColor" strokeWidth="0.5" opacity="0.3" />
        <line x1="60" y1="36" x2="92" y2="36" stroke="currentColor" strokeWidth="0.5" opacity="0.3" />
        <line x1="60" y1="50" x2="92" y2="50" stroke="currentColor" strokeWidth="0.5" opacity="0.3" />
      </svg>
    ),
  },
];

export default function Ide({ step }: ChapterStepProps) {
  /* Step 0 — 自我介绍 (hook) */
  if (step === 0) {
    return (
      <div className="ide-scene scene-pad ide-hook">
        <div className="kicker">02 · 工程师工作台</div>
        <div className="ide-intro">
          <Reveal show variant="scale">
            <div className="ide-intro-cn serif-cn">开工</div>
          </Reveal>
          <div className="ide-intro-en label-mono">Day 01 · IDE</div>
        </div>
      </div>
    );
  }

  /* Steps 1-3 — 三大区同屏 3 槽位 + 步 N 推进激活第 N 个 */
  if (step >= 1 && step <= 3) {
    const activeIdx = step - 1;
    return (
      <div className="ide-scene scene-pad ide-regions-screen">
        <div className="kicker">02 · 工程师工作台 · {String(step).padStart(2, "0")}/03</div>
        <div className="ide-frame">
          {REGIONS.map((r, i) => {
            const isActive = i === activeIdx;
            return (
              <div
                key={r.id}
                className={`ide-region ide-region--${r.id} ${isActive ? "ide-region--active" : "ide-region--dim"}`}
              >
                <div className="ide-region-svg-wrap">{r.svg}</div>
                <Reveal show={isActive} variant="rise">
                  <div className="ide-region-cn serif-cn">{r.cn}</div>
                </Reveal>
                <div className="ide-region-en label-mono">{r.en}</div>
                <Reveal show={isActive} variant="fade">
                  <div className="ide-region-role serif-cn">{r.role}</div>
                </Reveal>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  /* Step 4 — 绿旗红圈 (2 状态动效焦点 + 真交互 toggle) */
  if (step === 4) {
    return (
      <div className="ide-scene scene-pad ide-flags">
        <div className="kicker">02 · IDE 控制 · RUN / STOP</div>
        <FlagsPanel />
        <div className="ide-flag-line serif-cn">绿旗启动，红圈停止。一按开始，再按结束。</div>
      </div>
    );
  }

  /* Step 5 — 积木 → 指令 双轨 (2 元素映射, 真画积木 vs 代码) */
  if (step === 5) {
    return (
      <div className="ide-scene scene-pad ide-mapping-screen">
        <div className="kicker">02 · 术语映射 · Block → Instruction</div>
        <div className="ide-mapping">
          <div className="ide-mapping-cell ide-mapping-cell--block">
            <div className="ide-mapping-icon ide-mapping-icon--block">
              <svg viewBox="0 0 80 80" width="80" height="80" aria-hidden="true">
                {/* Scratch-style block */}
                <rect x="8" y="20" width="64" height="40" stroke="currentColor" strokeWidth="2" fill="currentColor" opacity="0.15" />
                <rect x="2" y="34" width="10" height="12" fill="currentColor" />
                <rect x="68" y="34" width="10" height="12" fill="currentColor" />
                <text x="40" y="46" textAnchor="middle" fontSize="14" fill="currentColor" fontFamily="monospace">move 10</text>
              </svg>
            </div>
            <div className="ide-mapping-cn serif-cn">积木</div>
            <div className="ide-mapping-en label-mono">Block · Scratch</div>
          </div>
          <div className="ide-mapping-arrow serif-cn">⇒</div>
          <div className="ide-mapping-cell ide-mapping-cell--inst">
            <div className="ide-mapping-icon ide-mapping-icon--inst">
              <svg viewBox="0 0 120 60" width="120" height="60" aria-hidden="true">
                <rect x="0" y="0" width="120" height="60" stroke="currentColor" strokeWidth="2" fill="none" />
                <text x="8" y="22" fontSize="11" fill="currentColor" fontFamily="monospace">cat.</text>
                <text x="38" y="22" fontSize="11" fill="currentColor" fontFamily="monospace">move</text>
                <text x="68" y="22" fontSize="11" fill="currentColor" fontFamily="monospace">(</text>
                <text x="76" y="22" fontSize="11" fill="currentColor" fontFamily="monospace">10</text>
                <text x="92" y="22" fontSize="11" fill="currentColor" fontFamily="monospace">)</text>
                <line x1="0" y1="40" x2="120" y2="40" stroke="currentColor" strokeWidth="0.5" opacity="0.3" />
                <text x="8" y="54" fontSize="8" fill="currentColor" opacity="0.6" fontFamily="monospace"># 角色.方法(参数)</text>
              </svg>
            </div>
            <div className="ide-mapping-cn serif-cn">指令</div>
            <div className="ide-mapping-en label-mono">Instruction · Python</div>
          </div>
        </div>
        <div className="ide-mapping-line serif-cn">积木 = 指令，只是表达方式不同</div>
      </div>
    );
  }

  return null;
}

/* ========================================================================
 * FlagsPanel — 真交互 (onClick + useState)
 *
 * 点 RUN 切到 running=true：绿旗高亮 + 状态文本 "运行中" + 出现进度条
 * 点 STOP 切回 running=false：红圈高亮 + 状态文本 "已停止"
 *
 * data-no-advance 让 Stage 的全局 click 不会把这一步推进掉。
 * ========================================================================
 */
function FlagsPanel() {
  const [running, setRunning] = useState(false);

  return (
    <div className="ide-flag-row">
      <button
        type="button"
        className={`ide-flag ide-flag--go ${running ? "ide-flag--go-active" : ""}`}
        onClick={() => setRunning(true)}
        data-no-advance
        aria-pressed={running}
      >
        <svg viewBox="0 0 80 80" width="80" height="80" aria-hidden="true">
          <circle cx="40" cy="40" r="36" stroke="currentColor" strokeWidth="3" fill="none" />
          <polygon points="32,22 32,58 60,40" fill="currentColor" />
        </svg>
        <div className="ide-flag-cn serif-cn">绿旗</div>
        <div className="ide-flag-en label-mono">RUN</div>
      </button>

      <div className="ide-flag-status">
        {running ? (
          <>
            <div className="ide-flag-status-dot ide-flag-status-dot--run" />
            <div className="ide-flag-status-text serif-cn">运行中…</div>
            <div className="ide-flag-progress">
              <div className="ide-flag-progress-bar ide-flag-progress-bar--run" />
            </div>
          </>
        ) : (
          <>
            <div className="ide-flag-status-dot ide-flag-status-dot--stop" />
            <div className="ide-flag-status-text serif-cn">已停止</div>
            <div className="ide-flag-progress">
              <div className="ide-flag-progress-bar ide-flag-progress-bar--stop" />
            </div>
          </>
        )}
      </div>

      <button
        type="button"
        className={`ide-flag ide-flag--stop ${!running ? "ide-flag--stop-active" : ""}`}
        onClick={() => setRunning(false)}
        data-no-advance
        aria-pressed={!running}
      >
        <svg viewBox="0 0 80 80" width="80" height="80" aria-hidden="true">
          <circle cx="40" cy="40" r="36" stroke="currentColor" strokeWidth="3" fill="none" />
          <rect x="28" y="28" width="24" height="24" fill="currentColor" />
        </svg>
        <div className="ide-flag-cn serif-cn">红圈</div>
        <div className="ide-flag-en label-mono">STOP</div>
      </button>
    </div>
  );
}
