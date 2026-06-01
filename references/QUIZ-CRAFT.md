# 互动题设计模式

## 选择题（Choice Quiz）

### 实现方式

在章节 TSX 中嵌入选项按钮组，使用 `data-no-advance` 属性防止误触推进。

```tsx
// 示例：t2-quiz
export default function Quiz({ step }: ChapterStepProps) {
  return (
    <div className="qz-root scene-pad">
      {step >= 1 && (
        <div className="qz-question">
          <span className="qz-q-text">以下哪项不属于五步流水线？</span>
          <div className="qz-options">
            <button className="qz-opt" data-no-advance>A. 采集</button>
            <button className="qz-opt qz-opt-right" data-no-advance>B. 标注 ✓</button>
            <button className="qz-opt" data-no-advance>C. 清洗</button>
          </div>
        </div>
      )}
    </div>
  );
}
```

### 注册为交互步骤

在 `chapters.ts` 中标记 `interactiveSteps`：

```typescript
{ id: "t2-quiz", ..., interactiveSteps: [1, 2] }
```

Auto 模式下，当 step 进入 `interactiveSteps` 中列出的索引时自动暂停，等待用户点击选项。

### 多题章节

如果一章有多道题（如 Q1 + Q2），分别放在不同 step：
- step 1: Q1 显示
- step 2: Q2 显示
- `interactiveSteps: [1, 2]`

---

## 简答题（Short Answer）

### 设计规范（尚未在生产课件中使用，先作为设计规范）

使用 `<textarea>` + submit 按钮，答题结果持久化到 localStorage。

```tsx
export default function ShortAnswer({ step }: ChapterStepProps) {
  const [answer, setAnswer] = useState("");
  const [submitted, setSubmitted] = useState(false);

  if (step < 2) return <div>...</div>;

  return (
    <div className="sa-root scene-pad">
      <span className="sa-question">请简述标注指南的三要素</span>
      <textarea
        className="sa-input"
        value={answer}
        onChange={e => setAnswer(e.target.value)}
        data-no-advance
        placeholder="请输入你的答案..."
        rows={5}
      />
      <button
        className="sa-submit"
        data-no-advance
        onClick={() => {
          if (answer.trim().length < 10) return;
          setSubmitted(true);
          localStorage.setItem(`sa-${chapterId}`, answer);
        }}
      >
        {submitted ? "✓ 已提交" : "提交答案"}
      </button>
    </div>
  );
}
```

### 答案校验方案

| 方案 | 适用场景 | 实现 |
|------|---------|------|
| 关键词匹配 | 有明确答案要点的题 | `answer.includes("标注指南") && answer.includes("Golden Samples")` |
| 字数门槛 | 开放性问题 | `answer.trim().length >= 20` |
| LLM-as-judge | 需要语义理解 | 调用 LLM API 比对参考答案，成本高 |

### 交互步骤标记

```typescript
{ id: "short-answer", ..., interactiveSteps: [2] }
```

---

## CSS 3D 探索场景（Experimental）
- 零依赖方案：`transform-style: preserve-3d` + `translate3d` + pointer events。
```tsx
const [rotation, setRotation] = useState({ x: -25, y: 15 });
const [colorMode, setColorMode] = useState<'height' | 'intensity'>('height');

// Pointer events for drag-to-rotate
onPointerDown → setPointerCapture → onPointerMove (delta → rotation) → onPointerUp

// 点云生成：250 个点，每个点 = <div> + translate3d + color
{points.map((p, i) => (
  <div style={{ transform: `translate3d(${p.x}px, ${p.y}px, ${p.z}px)`, background: getColor(p) }} />
))}
```
这种方案适用于需要学员亲手操作的三维数据（如点云、分子结构、地理信息），代码量约 200 行，零额外依赖。

---

## 倒计时暂停思考（Pause & Think）

> 适用于 S4 实战找茬 / S3 案例演练 / 任何"翁老师先抛问题 → 学员思考 → 再讲"的场景。
> 比传统"一句话旁白"更能调动学员参与感。

### 实现方式

`useState` + `setTimeout` 实现的 60s 倒计时（数字实时更新）：

```tsx
import { useEffect, useState } from "react";
import type { ChapterStepProps } from "../../registry/types";
import "./PauseThink.css";

const COUNTDOWN_SECONDS = 60;

export default function PauseThink({ step }: ChapterStepProps) {
  const [secondsLeft, setSecondsLeft] = useState(COUNTDOWN_SECONDS);
  const [running, setRunning] = useState(false);

  // 仅在 step === 3 启动倒计时
  useEffect(() => {
    if (step < 3) {
      setSecondsLeft(COUNTDOWN_SECONDS);
      setRunning(false);
      return;
    }
    if (step === 3) {
      setSecondsLeft(COUNTDOWN_SECONDS);
      setRunning(true);
    }
  }, [step]);

  // 每秒递减
  useEffect(() => {
    if (!running) return;
    if (secondsLeft <= 0) {
      setRunning(false);
      return;
    }
    const t = setTimeout(() => setSecondsLeft((s) => s - 1), 1000);
    return () => clearTimeout(t);
  }, [running, secondsLeft]);

  const progress = secondsLeft / COUNTDOWN_SECONDS;

  return (
    <div className="pt-root scene-pad">
      <div className="pt-stage">
        <span className="pt-eyebrow">⏸ 暂停思考 · 60s</span>

        {step === 3 && (
          <div
            className="pt-countdown"
            style={{ ["--progress" as string]: progress.toFixed(3) } as React.CSSProperties}
          >
            <div className="pt-countdown-ring" />
            <div className="pt-countdown-inner">
              <span className="pt-countdown-num">{secondsLeft}</span>
              <span className="pt-countdown-unit">SECONDS</span>
            </div>
          </div>
        )}

        {step >= 4 && (
          <div className="pt-done">
            <span>✅</span>
            <span>时间到</span>
          </div>
        )}
      </div>
    </div>
  );
}
```

### 倒计时圆环 CSS

```css
.pt-countdown {
  position: relative;
  width: 280px; height: 280px;
  display: flex; align-items: center; justify-content: center;
}
.pt-countdown-ring {
  position: absolute; inset: 0;
  border-radius: 50%;
  background: conic-gradient(
    var(--accent) calc(var(--progress, 1) * 360deg),
    var(--surface-3) 0
  );
  box-shadow: 0 0 32px var(--accent-glow);
  transition: background 1s linear;
}
.pt-countdown-inner {
  position: absolute; inset: 12px;
  background: var(--surface-2);
  border-radius: 50%;
  display: flex; flex-direction: column; align-items: center; justify-content: center;
  border: 1px solid var(--rule);
}
.pt-countdown-num {
  font-family: var(--font-display-en);
  font-size: 96px; line-height: 1;
  color: var(--accent);
  text-shadow: 0 0 18px var(--accent-glow);
  font-variant-numeric: tabular-nums;
}
```

### 注册为交互步骤

Auto 模式会在 step 3 自动暂停等用户思考（不会硬推进）。

```typescript
{ id: "pause-think", ..., interactiveSteps: [3] }
```

> **关键设计**：用 `useEffect` 监听 `step` 变化启动计时器，不要用 `setInterval` —— 后者在组件卸载后会泄漏。

---

## 通用约定

- 所有可点击元素加 `data-no-advance` 或 `onClick` 中 `e.stopPropagation()`，防止触发全局 step 推进
- 交互章节在 `chapters.ts` 中标记 `interactiveSteps` 数组
- Auto 模式自动在 `interactiveSteps` 处暂停
- Manual 模式下用户可以自由点选
