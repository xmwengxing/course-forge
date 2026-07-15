// 模拟实景组件库（§ 模拟实景 模式库的可拼装实现）
// agent 建章时直接 import 这些受控组件，而非每次从零手画 SVG/CSS。
//
//   import { RunnerTrack, LiveEditor, BlockStack, TypeOut }
//     from "../../components/scenes";
//
// 所有组件都「接收 step」——由 step 推导内部展示状态，无内部时序状态，
// 切步即可重演；隐藏态保留布局槽位（opacity:0，无 display:none），
// 颜色 / 字体全走主题 token。
export { TypeOut } from "./TypeOut";
export type { TypeOutProps } from "./TypeOut";
export { BlockStack } from "./BlockStack";
export type { BlockStackProps } from "./BlockStack";
export { RunnerTrack } from "./RunnerTrack";
export type { RunnerTrackProps } from "./RunnerTrack";
export { LiveEditor } from "./LiveEditor";
export type { LiveEditorProps, EditorLine } from "./LiveEditor";
