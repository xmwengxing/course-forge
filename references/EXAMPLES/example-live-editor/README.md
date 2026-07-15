# example-live-editor — 现场改 Bug 讲调试

> **结构 anchor**（与题材无关）：用 [`../../components/scenes/LiveEditor`](../../components/scenes/LiveEditor.tsx)
> 把「调试」演成看得见的事。配套 `chapter.tsx` + `chapter.css`。

## 这一章在示范什么

- **一屏单构图**：上 = 现场代码编辑器，下 = 修复结论，常驻同一屏。
- **就地揭示**：编辑器在 `step >= 1` 淡入；结论在 `step >= 3`（已修复）才出现。
- **拼装而非手画**：`<LiveEditor code={...} step={step} bugStep={1} fixedStep={3} />`，
  bug 行红波浪线 + 放大镜扫过、修复后变绿、控制台 Error→Pass，全部由组件按 step 推导。
- **每屏动**：放大镜 `cf-sweep-move` 持续扫过 + 红→绿翻转，比「念一段调试日志」直观。

## step 切分

| step | 屏上发生 |
|---|---|
| 0   | 标题 + 引入 |
| 1-2 | 编辑器出现，bug 行标红波浪线 + 放大镜扫过，控制台红 Error |
| 3   | `fixedStep` 触发：bug 行变绿，控制台翻成绿色 Pass，下结论揭示 |

> `LiveEditor` 的 `fixed = step >= fixedStep`、`showBug = step >= bugStep && !fixed`——
> **纯 step 驱动，无内部时序状态**，切步即可重演「从坏到好」。

## 换主题

只换 `tokens.css`，`LiveEditor` 内部走 `var(--accent-warn)`（红）/ `var(--accent-good)`（绿）/
`var(--elev-*)` 等 token，结构、step 切分、字号关系一律不动。
