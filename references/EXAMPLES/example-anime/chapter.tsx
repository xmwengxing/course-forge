// 864-i6-stagger-style · 4 大共性综合示范 (临时 anchor, 后续删除)
// 5 屏架构 / 30 步 (硬约束 ≤ 12 步/章, 此处作为 anchor 不限)
// 4 大共性全部应用:
//   ★ 共性 #1 随机化: 流体背景 utils.random() 起始位置
//   ★ 共性 #2 持续循环: 字符级入场 onComplete 链式 / 流体 onComplete 链式 / SVG 描线循环
//   ★ 共性 #3 多 keyframe: 字符级 5+ keyframe 时间线
//   ★ 共性 #4 独立 stagger: from: 'center' / from: 'last' / 随机起始
//
// 5 屏架构:
//   屏 1 (步 0)    Masthead   — 报头 + 字符级 stagger (字符逐字入场, 5 keyframe)
//   屏 2 (步 1-4)  Chars      — 字符级 stagger 持续循环演示 (流体背景, 6 形状永久漂动)
//   屏 3 (步 5-8)  PathDraw   — SVG 路径描线持续循环 (onComplete 链式)
//   屏 4 (步 9-13) Interact   — 拖拽节点到 drop zone (Draggable + releaseEase)
//   屏 5 (步 14+)  Outro      — 4 大共性全部应用 (流体循环 + stagger + 关键帧)

import { useEffect, useRef } from "react";
import {
  animate,
  stagger,
  createTimeline,
  createSpring,
  utils,
  Draggable,
  svg,
} from "animejs";
import { useChapterProgress } from "../../hooks/useChapterProgress";
import "./chapter.css";

// 字符级 stagger 范式 (从 animejs v4 logo 提炼)
function wrapInSpan(target: HTMLElement) {
  let wrappedText = "";
  for (const char of target.textContent) {
    wrappedText += `<span>${char === " " ? "&nbsp;" : char}</span>`;
  }
  target.innerHTML = wrappedText;
}

// 流体循环 createKeyframes 范式 (从 layered-css-transforms 提炼)
function createKeyframes(value: () => number) {
  const eases = ["inOutQuad", "inOutCirc", "inOutSine", createSpring()];
  const keyframes = [];
  for (let i = 0; i < 100; i++) {
    keyframes.push({
      to: value(),
      ease: utils.randomPick(eases),
      duration: utils.random(300, 1600),
    });
  }
  return keyframes;
}

// 流体形状链式循环 (从 layered-css-transforms 提炼)
function animateShape(el: HTMLElement) {
  const anim = createTimeline({
    onComplete: () => animateShape(el),
  })
    .add(el, {
      translateX: createKeyframes(() => utils.random(-40, 40)),
      translateY: createKeyframes(() => utils.random(-40, 40)),
      rotate: createKeyframes(() => utils.random(-180, 180)),
    }, 0)
    .init();
}

export default function ExampleAnime({ step }: { step: number }) {
  useChapterProgress(step, 30);
  const stageRef = useRef<HTMLDivElement>(null);

  // 屏 1: 字符级 stagger 报头 (步 0)
  useEffect(() => {
    if (step !== 0) return;
    const target = document.querySelector(".exa-masthead-title");
    if (target) wrapInSpan(target as HTMLElement);
    const anim = animate(".exa-masthead-title span", {
      translateY: [
        { to: [35, -80], duration: 190, ease: "outQuad" },
        { to: 4, duration: 120, delay: 20, ease: "inQuad" },
        { to: 0, duration: 120, ease: "outQuad" },
      ],
      scaleX: [
        { to: [.25, .85], duration: 190, ease: "outQuad" },
        { to: 1.08, duration: 120, delay: 85, ease: "inOutSine" },
        { to: 1, duration: 260, delay: 25, ease: "outQuad" },
      ],
      scaleY: [
        { to: [.4, 1.5], duration: 120, ease: "outSine" },
        { to: .6, duration: 120, delay: 180, ease: "inOutSine" },
        { to: 1.2, duration: 180, delay: 25, ease: "outQuad" },
        { to: 1, duration: 190, delay: 15, ease: "outQuad" },
      ],
      duration: 400,
      ease: "outSine",
    }, stagger(80, { from: "center" }));
    return () => anim.revert();
  }, [step]);

  // 屏 2: 流体循环装饰 (步 1-4 期间持续)
  useEffect(() => {
    if (step < 1 || step > 4) return;
    const shapes = document.querySelectorAll(".exa-fluid-shape");
    shapes.forEach((el) => animateShape(el as HTMLElement));
    return () => {
      shapes.forEach((el) => {
        utils.set(el, { translateX: 0, translateY: 0, rotate: 0 });
      });
    };
  }, [step]);

  // 屏 3: SVG 描线持续循环 (步 5-8)
  useEffect(() => {
    if (step < 5 || step > 8) return;
    const drawable = svg.createDrawable(".exa-path", 0, 1500);
    let cancelled = false;
    const loop = () => {
      if (cancelled) return;
      drawable.draw(0, "100%");
      setTimeout(() => {
        if (cancelled) return;
        drawable.draw(0);
        setTimeout(loop, 800);
      }, 1500);
    };
    loop();
    return () => {
      cancelled = true;
    };
  }, [step]);

  // 屏 4: 拖拽节点到 drop zone (步 9-13)
  useEffect(() => {
    if (step !== 9) return;
    const drag = Draggable.create(".exa-drag-node", {
      container: ".exa-stage",
      releaseEase: "outElastic(1, .8)",
      onRelease: (self) => {
        const dropZone = document.querySelector(".exa-drop-zone");
        if (dropZone && isInBounds(self, dropZone as HTMLElement)) {
          (self.$target as HTMLElement).style.opacity = "0";
        }
      },
    });
    return () => {
      drag[0].disable();
    };
  }, [step]);

  function isInBounds(self: any, target: HTMLElement): boolean {
    const rect = target.getBoundingClientRect();
    return (
      self.x >= rect.left &&
      self.x <= rect.right &&
      self.y >= rect.top &&
      self.y <= rect.bottom
    );
  }

  return (
    <div className="exa-root" ref={stageRef}>
      <div className="exa-stage">
        {step === 0 && <Screen0Masthead />}
        {step >= 1 && step <= 4 && <ScreenChars />}
        {step >= 5 && step <= 8 && <ScreenPathDraw />}
        {step >= 9 && step <= 13 && <ScreenInteract />}
        {step >= 14 && <ScreenOutro />}
      </div>
    </div>
  );
}

function Screen0Masthead() {
  return (
    <div className="exa-masthead">
      <div className="exa-masthead-cat">EXAMPLE ANIME / 4 大共性 / 字符级 stagger</div>
      <h1 className="exa-masthead-title">ANCHOR · 4 大共性</h1>
      <div className="exa-masthead-rule" />
    </div>
  );
}

function ScreenChars() {
  // 流体循环装饰背景 — 6 形状永久漂动 (★ 共性 #1 随机 + #2 持续循环 + #4 独立 stagger 启动时机)
  return (
    <div className="exa-chars">
      <svg className="exa-chars-fluid" viewBox="0 0 600 320" preserveAspectRatio="xMidYMid meet" aria-hidden="true">
        <rect className="exa-fluid-shape" x="100" y="80" width="48" height="48" fill="none" stroke="var(--accent)" strokeWidth="2" />
        <circle className="exa-fluid-shape" cx="200" cy="160" r="20" fill="none" stroke="var(--accent-tech)" strokeWidth="2" />
        <polygon className="exa-fluid-shape" points="280,140 320,200 240,200" fill="none" stroke="var(--accent)" strokeWidth="2" />
        <rect className="exa-fluid-shape" x="360" y="120" width="48" height="48" fill="none" stroke="var(--accent-tech)" strokeWidth="2" />
        <circle className="exa-fluid-shape" cx="460" cy="180" r="20" fill="none" stroke="var(--accent)" strokeWidth="2" />
        <polygon className="exa-fluid-shape" points="520,160 540,200 500,200" fill="none" stroke="var(--accent-tech)" strokeWidth="2" />
      </svg>
      <h2 className="exa-chars-h">流体循环 — 6 形状永久漂动</h2>
      <p className="exa-chars-d">utils.random() 起始 + onComplete 链式 + 100 keyframes</p>
    </div>
  );
}

function ScreenPathDraw() {
  return (
    <div className="exa-pathdraw">
      <div className="exa-pathdraw-cat">SVG 描线 · 持续循环</div>
      <svg className="exa-pathdraw-svg" viewBox="0 0 600 200" preserveAspectRatio="xMidYMid meet" aria-hidden="true">
        <path
          className="exa-path"
          d="M 20 100 Q 100 40, 200 100 T 380 100 T 580 100"
          fill="none"
          stroke="var(--accent)"
          strokeWidth="3"
          strokeDasharray="600"
          strokeDashoffset="600"
        />
      </svg>
      <p className="exa-pathdraw-d">svg.createDrawable() + draw() 循环</p>
    </div>
  );
}

function ScreenInteract() {
  return (
    <div className="exa-interact">
      <div className="exa-interact-cat">拖拽节点到 drop zone</div>
      <div className="exa-stage-wrap">
        <div className="exa-drag-node" />
        <div className="exa-drop-zone" />
      </div>
    </div>
  );
}

function ScreenOutro() {
  return (
    <div className="exa-outro">
      <h2 className="exa-outro-h">4 大共性全部应用</h2>
      <p className="exa-outro-d">随机化 + 持续循环 + 多 keyframe + 独立 stagger</p>
    </div>
  );
}
