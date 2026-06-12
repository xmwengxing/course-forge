// example-anime/chapter.tsx
// Anchor: animejs v4 实战章节
// 30 步原生 step 范式 + 真视觉演示 3 处 + 互动 2 处
// 真视觉演示与拖拽全部由 animejs v4 驱动（替代手写 CSS keyframes + Pointer Events）
// 详见 references/ANIMEJS-GUIDE.md

import { useEffect, useRef } from "react";
import { animate, stagger, draggable, svg } from "animejs";
import { useChapterProgress } from "../../hooks/useChapterProgress";
import "./chapter.css";

// 正确顺序（互动 2 的"对"答案）
const CORRECT_ORDER = ["遮挡统一加记录", "截断打标签不超框", "小目标点框分水岭", "背景物理实体原则"];

export default function ExampleAnime({ step }: { step: number }) {
  useChapterProgress(step, 30);
  const stageRef = useRef<HTMLDivElement>(null);

  // 视觉演示 1:节点滚动（步 4-7）
  useEffect(() => {
    if (step >= 4 && step <= 7) {
      const anim = animate(".exa-nodes circle", {
        opacity: [0, 1],
        scale: [0, 1],
        delay: stagger(50),
        duration: 300,
        ease: "outBack",
      });
      return () => anim.revert();
    }
  }, [step]);

  // 视觉演示 2:柱状图 grow（步 8-11）
  useEffect(() => {
    if (step >= 8 && step <= 11) {
      // SVG 描线作为主动画
      svg.createDrawable(".exa-bar-fill", 0, 1500);
      // CSS height transition 兜底
      const bars = document.querySelectorAll<HTMLElement>(".exa-bar-fill");
      bars.forEach((bar, i) => {
        bar.animate(
          [{ height: "0%" }, { height: "100%" }],
          { duration: 1500, delay: i * 100, fill: "forwards" },
        );
      });
    }
  }, [step]);

  // 互动 1:拖拽节点到 drop zone（步 12-17）
  useEffect(() => {
    if (step !== 12) return;
    const drag = draggable(".exa-drag-node", {
      container: ".exa-stage",
      releaseEase: "outElastic(1, .8)",
      onRelease: (self: any) => {
        const dropZone = document.querySelector(".exa-drop-zone");
        if (!dropZone) return;
        const dzRect = dropZone.getBoundingClientRect();
        const trRect = self.$target.getBoundingClientRect();
        const cx = trRect.left + trRect.width / 2;
        const cy = trRect.top + trRect.height / 2;
        if (cx > dzRect.left && cx < dzRect.right && cy > dzRect.top && cy < dzRect.bottom) {
          self.$target.style.opacity = "0";
          self.$target.style.transform = "scale(0)";
        }
      },
    });
    return () => drag.disable();
  }, [step]);

  // 视觉演示 3:SVG 描线（步 18-22）
  useEffect(() => {
    if (step >= 18 && step <= 22) {
      const drawable = svg.createDrawable(".exa-path-line", 0, 1200);
      drawable.draw(0, "100%");
    }
  }, [step]);

  // 互动 2:拖拽排序 4 张卡片（步 23-27）
  useEffect(() => {
    if (step !== 23) return;
    const cards = document.querySelectorAll<HTMLElement>(".exa-sort-card");
    const drag = draggable(".exa-sort-card", {
      container: ".exa-stage",
      releaseEase: "outElastic(1, .8)",
      onDrop: (self: any) => {
        // 判定卡片落在哪个槽位，根据文本对比 CORRECT_ORDER
        const cardText = self.$target.textContent || "";
        const correctIdx = CORRECT_ORDER.findIndex((c) => c === cardText);
        if (correctIdx >= 0) {
          self.$target.classList.add("correct");
        }
      },
    });
    return () => drag.disable();
  }, [step]);

  return (
    <div className="exa-root" ref={stageRef}>
      <div className="exa-stage">
        {step === 0 && <Screen0Masthead />}
        {step >= 1 && step <= 3 && <ScreenIntro step={step} />}
        {step >= 4 && step <= 7 && <ScreenNodes />}
        {step >= 8 && step <= 11 && <ScreenBars />}
        {step >= 12 && step <= 17 && <ScreenDrag />}
        {step >= 18 && step <= 22 && <ScreenDraw />}
        {step >= 23 && step <= 27 && <ScreenSort />}
        {step >= 28 && step <= 29 && <ScreenOutro step={step} />}
      </div>
    </div>
  );
}

function Screen0Masthead() {
  return (
    <div className="exa-masthead">
      <div className="exa-masthead-num">EX</div>
      <div className="exa-masthead-title">animejs 实战</div>
      <div className="exa-masthead-rule" />
    </div>
  );
}

function ScreenIntro({ step }: { step: number }) {
  return (
    <div className="exa-intro">
      {step >= 1 && <h2 className="exa-intro-h">这一节,我们要看三个真正动起来的图。</h2>}
      {step >= 2 && <p className="exa-intro-d">节点滚动 / 柱状图生长 / SVG 路径描线 —— 都用 animejs v4 替代手写 keyframes。</p>}
      {step >= 3 && <p className="exa-intro-d">两处互动:拖拽节点到删除区,拖拽排序 4 张作业指导书铁律。</p>}
    </div>
  );
}

function ScreenNodes() {
  // 50 个节点 SVG circle（步 4-7 期间由 animejs 错开 50ms 依次 opacity 0→1 + scale 0→1）
  const circles = Array.from({ length: 50 }, (_, i) => (
    <circle key={i} cx={100 + (i % 10) * 80} cy={150 + Math.floor(i / 10) * 60} r={20} fill="var(--accent)" />
  ));
  return (
    <svg className="exa-nodes" viewBox="0 0 900 500">
      {circles}
    </svg>
  );
}

function ScreenBars() {
  // 柱状图 grow（步 8-11 期间由 createDrawable + height animation 同时驱动）
  return (
    <div className="exa-bars">
      <div className="exa-bar-row">
        <div className="exa-bar-label">文本</div>
        <div className="exa-bar-track"><div className="exa-bar-fill" style={{ width: "100%" }} /></div>
      </div>
      <div className="exa-bar-row">
        <div className="exa-bar-label">语音</div>
        <div className="exa-bar-track"><div className="exa-bar-fill" style={{ width: "70%" }} /></div>
      </div>
      <div className="exa-bar-row">
        <div className="exa-bar-label">像素</div>
        <div className="exa-bar-track"><div className="exa-bar-fill" style={{ width: "30%" }} /></div>
      </div>
    </div>
  );
}

function ScreenDrag() {
  // 5 个节点 + 右侧 drop zone（步 12-17 期间可拖拽）
  return (
    <div className="exa-drag-stage">
      <div className="exa-drag-hint">把 5 个错误节点拖到右侧"删除区"</div>
      <div className="exa-drag-nodes">
        {Array.from({ length: 5 }, (_, i) => (
          <div key={i} className="exa-drag-node" data-no-advance>
            {i + 1}
          </div>
        ))}
      </div>
      <div className="exa-drop-zone">删除区</div>
    </div>
  );
}

function ScreenDraw() {
  // SVG 描线（步 18-22 期间由 createDrawable 驱动）
  return (
    <svg className="exa-svg-stage" viewBox="0 0 1000 500">
      <path
        className="exa-path-line"
        d="M 100 250 Q 250 100 400 250 T 700 250 T 900 250"
        strokeDasharray="1200"
      />
    </svg>
  );
}

function ScreenSort() {
  // 4 张铁律卡片（步 23-27 期间可拖拽排序）
  const cards = [
    "截断打标签不超框",
    "背景物理实体原则",
    "小目标点框分水岭",
    "遮挡统一加记录",
  ];
  return (
    <div className="exa-sort-stage">
      <h2 className="exa-sort-h">把 4 张铁律拖到正确顺序</h2>
      <div className="exa-sort-cards">
        {cards.map((c, i) => (
          <div key={i} className="exa-sort-card" data-no-advance>
            {c}
          </div>
        ))}
      </div>
      <div className="exa-sort-slots">
        <div className="exa-sort-slot">1</div>
        <div className="exa-sort-slot">2</div>
        <div className="exa-sort-slot">3</div>
        <div className="exa-sort-slot">4</div>
      </div>
    </div>
  );
}

function ScreenOutro({ step }: { step: number }) {
  return (
    <div className="exa-outro">
      <div className="exa-outro-rule" />
      {step >= 28 && <h2 className="exa-outro-h">animejs v4 —— 真正动画 + 物理级拖拽</h2>}
      {step >= 29 && <div className="exa-outro-by">— 替代手写 keyframes + Pointer Events</div>}
    </div>
  );
}
