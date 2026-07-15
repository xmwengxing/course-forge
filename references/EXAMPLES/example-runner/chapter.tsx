// example-runner · 用 RunnerTrack 把「算法执行」演成看得见的事
//
// 示范要点（对照 § 模拟实景 · 执行跑道）：
//   • 一屏单构图：左=数组可视化，右=执行跑道，二者常驻同一屏。
//   • 屏内元素随 step 就地揭示（Reveal show={step >= K}），不回流。
//   • 核心演示直接拼装 <RunnerTrack />，不手画机器人 / 跑道。
//   • RunnerTrack 接收 step：startStep=2 起逐行高亮，sayingStep 冒气泡。
//
// 这不是照搬模板——保留「左数组 + 右跑道」的形，换你的内容即可。

import { Reveal } from "../../components/Reveal";
import { RunnerTrack } from "../../components/scenes/RunnerTrack";
import "./chapter.css";

const LINES = [
  "lo = 0 ; hi = n - 1",
  "mid = (lo + hi) / 2",
  "a[mid] == target ? 命中",
  "a[mid] < target ? lo = mid + 1",
  "else hi = mid - 1",
];
const ARRAY = [2, 5, 8, 13, 21, 34, 55, 89];
// 示意 mid 轨迹（按当前执行到的行取一个下标），仅作演示
const MID_TRAIL = [3, 5, 6, 2, 7];

export default function ExampleRunner({ step }: { step: number }) {
  const activeLine = Math.max(0, Math.min(LINES.length, step - 2 + 1)); // startStep = 2
  const mid = step >= 2 ? MID_TRAIL[Math.min(activeLine - 1, MID_TRAIL.length - 1)] : -1;

  return (
    <div className="exr-root scene-pad">
      <header className="exr-hd">
        <span className="kicker label-mono">ALGORITHM · 二分查找</span>
        <h1 className="serif-cn">把算法演出来，而不是念出来</h1>
      </header>

      <div className="exr-body">
        {/* 左：数组可视化（随 step 高亮当前 mid） */}
        <Reveal show={step >= 2} className="exr-array-wrap">
          <div className="exr-array">
            {ARRAY.map((v, i) => (
              <div key={i} className={`exr-cell ${i === mid ? "is-mid" : ""}`}>
                {v}
              </div>
            ))}
          </div>
          <div className="exr-array-cap label-mono">mid 指针随执行移动</div>
        </Reveal>

        {/* 右：执行跑道（核心——拼装组件，不手画） */}
        <Reveal show={step >= 2} className="exr-runner-wrap">
          <RunnerTrack lines={LINES} step={step} startStep={2} sayingStep={6} />
        </Reveal>
      </div>
    </div>
  );
}
