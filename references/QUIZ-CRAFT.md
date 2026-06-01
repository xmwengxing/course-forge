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

零依赖方案：`transform-style: preserve-3d` + `translate3d` + pointer events。

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

## 通用约定

- 所有可点击元素加 `data-no-advance` 或 `onClick` 中 `e.stopPropagation()`，防止触发全局 step 推进
- 交互章节在 `chapters.ts` 中标记 `interactiveSteps` 数组
- Auto 模式自动在 `interactiveSteps` 处暂停
- Manual 模式下用户可以自由点选
