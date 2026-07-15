# example-runner — 执行跑道讲算法

> **结构 anchor**（与题材无关）：用 [`../../components/scenes/RunnerTrack`](../../components/scenes/RunnerTrack.tsx)
> 把「算法 / 流程执行」演成看得见的事。配套 `chapter.tsx` + `chapter.css`。

## 这一章在示范什么

- **一屏单构图**：左 = 数组可视化（mid 指针随执行移动），右 = 执行跑道，**两者常驻同一屏**。
- **就地揭示**：`<Reveal show={step >= 2}>` 把左数组、右跑道各自在预留位淡入；已出现的内容不被推动。
- **拼装而非手画**：核心演示直接 `<RunnerTrack lines={...} step={step} startStep={2} sayingStep={6} />`，
  机器人滑动、脚本高亮、对话气泡全部由组件内部按 step 推导——你只传 `lines` 和 step 边界。
- **每屏动**：揭示方式本身是动态；跑道上机器人随 step 滑到对应位置，比「逐行念代码」直观得多。

## step 切分

| step | 屏上发生 |
|---|---|
| 0-1 | 标题 + 引入（这一章把 step 2 当作「运行开始」） |
| 2   | 数组出现，跑道出现，第 1 行脚本高亮，机器人滑到起点 |
| 3-5 | 逐行高亮，mid 指针随之移动，机器人沿跑道前进 |
| 6   | `sayingStep` 触发，机器人冒出「命中」气泡 |

> `RunnerTrack` 的 `activeLine = clamp(step - startStep + 1, 0..lines.length)`，
> 机器人 x 坐标在 `[110, 330]` 间线性插值——**纯 step 驱动，无内部时序状态**，切步即可重演。

## 换主题

只换 `tokens.css`，`RunnerTrack` 内部全部走 `var(--accent)` / `var(--accent-glow)` / `var(--elev-*)`
等 token，结构、step 切分、字号关系一律不动。
