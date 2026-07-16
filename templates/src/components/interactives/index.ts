// 互动原语组件库（§ 每屏≥1处真互动 的可拼装实现）
// agent 建章时直接 import 这些受控组件，给观众可操作的互动积木，
// 而非每次从零手画拖拽 / 滑块 / tab / 节点图。
//
//   import { DragSort, SliderInput, TabSwitch, NodeGraph }
//     from "../../components/interactives";
//
// 所有组件都「接收 step」——step < revealAtStep 时 opacity:0 占位
// （无 display:none、无回流），切步即可重演；颜色 / 字体全走主题 token；
// 可交互元素带 data-no-advance，防止舞台点击误推进 step。
export { DragSort } from "./DragSort";
export type { DragSortProps } from "./DragSort";
export { SliderInput } from "./SliderInput";
export type { SliderInputProps } from "./SliderInput";
export { TabSwitch } from "./TabSwitch";
export type { TabSwitchProps, TabItem } from "./TabSwitch";
export { NodeGraph } from "./NodeGraph";
export type { NodeGraphProps, GraphNode, GraphChild } from "./NodeGraph";
