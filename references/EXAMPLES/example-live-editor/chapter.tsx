// example-live-editor · 用 LiveEditor 把「调试」演成看得见的事
//
// 示范要点（对照 § 模拟实景 · 现场编辑器）：
//   • 一屏单构图：上=现场代码编辑器，下=修复结论，常驻同一屏。
//   • bug 行红波浪线 + 放大镜扫过（step >= bugStep 且未修复）；
//     进入 fixedStep 后该行变绿、控制台从红色 Error 翻成绿色 Pass。
//   • 核心演示直接拼装 <LiveEditor />，不手画编辑器 / 控制台。
//   • LiveEditor 接收 step：bugStep / fixedStep 推导 fixed 与 showBug。
//
// 保留「上编辑器 + 下结论」的形，换你的 bug 即可。

import { Reveal } from "../../components/Reveal";
import { LiveEditor } from "../../components/scenes/LiveEditor";
import "./chapter.css";

const CODE = [
  { text: "function getUser(id) {", status: "normal" },
  { text: "  const u = db.find(id);", status: "normal" },
  { text: "  return u.name;  // u 可能为空", status: "bug" },
  { text: "}", status: "normal" },
];

export default function ExampleLiveEditor({ step }: { step: number }) {
  return (
    <div className="exle-root scene-pad">
      <header className="exle-hd">
        <span className="kicker label-mono">DEBUG · 空引用</span>
        <h1 className="serif-cn">改 Bug，要让人看见</h1>
      </header>

      <div className="exle-body">
        {/* 上：现场代码编辑器（核心——拼装组件） */}
        <Reveal show={step >= 1} className="exle-editor-wrap">
          <LiveEditor
            fileName="user.ts"
            code={CODE}
            step={step}
            bugStep={1}
            fixedStep={3}
            errorMsg="TypeError: Cannot read properties of null (reading 'name')"
            okMsg="全部测试通过 · 0 个未捕获异常"
          />
        </Reveal>

        {/* 下：修复结论（step >= 3 揭示） */}
        <Reveal show={step >= 3} variant="rise" className="exle-note serif-cn">
          修一行：先判空再取值——Bug 从红变绿，控制台从 Error 到 Pass。
        </Reveal>
      </div>
    </div>
  );
}
