import { MaskReveal } from "../../components/MaskReveal";
import { Reveal } from "../../components/Reveal";
import type { ChapterStepProps } from "../../registry/types";
import "./Example.css";

/**
 * Reference chapter — replace with your own.
 *
 * 本模板示范 skill 核心强制规则「一屏多步 · 逐步揭示」的标准写法：
 *   • 一屏 = 一个稳定的最终构图（标题 + 视觉演示 + 要点 + CTA 同属一屏）。
 *   • 「多步」= 把这一屏**自己的元素**拆开，随 step 逐个就地揭示——
 *     绝不是把「下一屏」摞到「这一屏」下面（那会溢出、排版乱）。
 *   • 每个元素是一个 <Reveal show={step >= K}>；未揭示时保持 opacity:0
 *     **仍占位**（预留最终布局），出现时就地淡入，不推走已揭示内容。
 *   • 屏与屏之间才用 `if (step <= N) return …` 按屏切换（每屏跨多步）；
 *     绝不用 `if (step === N)` 按步整屏替换（那会退化成 PPT 翻页）。
 * 配色 / 字体全部走主题 token，换主题不破。
 *
 * ── 纯文字屏 → 用「模拟实景」组件演出来（见 CHAPTER-CRAFT.md § 模拟实景）──
 * 不要写大字卡片 / emoji 图标。直接拼装受控组件（都「接收 step」、隐藏态
 * 占位、全 token），把口播演成看得见的事：
 *
 *   import { RunnerTrack, LiveEditor, BlockStack, TypeOut }
 *     from "../../components/scenes";
 *
 *   // 执行跑道：lines 逐行高亮，机器人按 step 滑到对应位置
 *   <RunnerTrack lines={["移到 x:-100 y:0", "移到 x:100 y:0", "说「你好」2 秒"]}
 *                step={step} startStep={7} sayingStep={9} />
 *
 *   // 现场改 Bug 编辑器：bugStep 标红波浪线，fixedStep 后变绿、控制台 Pass
 *   <LiveEditor fileName="main.js" code={[{text:"function f(){",status:"normal"},
 *     {text:"  score = 0;",status:"bug"},{text:"}",status:"normal"}]}
 *     step={step} bugStep={4} fixedStep={5} />
 *
 *   // 积木逐个堆叠（隐藏块 opacity:0 占位，已出现的不被推动）
 *   <BlockStack blocks={["取得输入","校验格式","写入数据库"]}
 *               step={step} revealFromStep={5} />
 *
 *   // 终端打字机：揭示时逐字符写出
 *   <TypeOut text={"移到 x: -100  y: 0"} step={step} revealAtStep={3} />
 */
export default function ExampleChapter({ step }: ChapterStepProps) {
  // 整屏在 step 0-2 常驻（narrations 长度 = 3）。三步走同一块屏，逐步叠加。
  return (
    <div className="ex-scene ex-screen scene-pad">
      <header className="ex-masthead">
        <span className="brand">Your Presentation</span>
        <span className="issue">Issue · 01 — Replace this</span>
      </header>

      {/* step 0：主标题（MaskReveal 逐字揭示） */}
      <Reveal show={step >= 0} className="ex-headline">
        <h1 className="ex-cover-h">
          <MaskReveal show duration={900}>
            <span className="serif-cn">这是&nbsp;</span>
          </MaskReveal>
          <MaskReveal show delay={300} duration={900}>
            <span className="serif-it ex-em">first&nbsp;step</span>
          </MaskReveal>
          <MaskReveal show delay={650} duration={900}>
            <span className="serif-cn">.</span>
          </MaskReveal>
        </h1>
      </Reveal>

      {/* 常驻视觉演示（真画 SVG）：一块舞台 = 一屏承载多步 */}
      <div className="ex-visual" aria-hidden="true">
        <svg className="ex-stage-demo" viewBox="0 0 120 68">
          <rect x="2" y="2" width="116" height="64" rx="3" stroke="currentColor" strokeWidth="1.5" fill="none" />
          <line x1="60" y1="2" x2="60" y2="66" stroke="currentColor" strokeWidth="0.5" opacity="0.25" strokeDasharray="2 2" />
          <line x1="2" y1="34" x2="118" y2="34" stroke="currentColor" strokeWidth="0.5" opacity="0.25" strokeDasharray="2 2" />
          <circle cx="88" cy="22" r="4" fill="currentColor" />
          <text x="6" y="12" fontSize="6" fontFamily="monospace" fill="currentColor">STAGE 1920×1080 · 1 screen / N steps</text>
        </svg>
      </div>

      {/* step 1：在同一屏上累积揭示要点（step0 内容保留作上下文） */}
      <Reveal show={step >= 1} variant="rise" className="ex-points">
        <div className="kicker">每一步</div>
        <ul className="ex-point-list">
          <li>同一块屏幕跨多个 step 常驻，不整屏替换</li>
          <li>新内容用 Reveal show={"{step >= K}"} 累积出现</li>
          <li>前面的内容保留作上下文，节奏像视频而非 PPT</li>
        </ul>
      </Reveal>

      {/* step 2：在同一屏上累积揭示收尾 CTA */}
      <Reveal show={step >= 2} variant="fade" className="ex-cta">
        <div className="ex-cta-line serif-cn">换上你自己的章节内容 →</div>
        <div className="ex-cover-foot label-mono">
          <span className="dot-accent" />&nbsp;Tap anywhere to advance
        </div>
      </Reveal>
    </div>
  );
}
