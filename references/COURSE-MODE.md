# Course Mode — 课程模式增量

本文件记录 Course Forge **相较于单视频模式的增量能力**：
S1-S5 课程结构、互动评估、部署嵌入、编号方案。

---

## S1-S5 课程段体系

### 标准模板

| 段 | 类型 | 内容 | 教学方法 | 章节数 |
|:--|:--|:--|:--|:--:|
| S1 导入 | 场景 | 事故案例/冲突场景/角色定位 | 案发现场复盘 | 3-6 |
| S2 知识精讲 | 理论 | 核心概念/体系框架/技术原理 | 视觉化演示 | 4-8 |
| S3 案例演示 | 实战 | 真实数据/操作步骤/before-after | 极端场景推演 | 4-8 |
| S4 难点攻克 | 进阶 | 边界案例/常见陷阱/专家判断 | 启发式设问 | 3-6 |
| S5 总结通关 | 评估 | 复盘/弹题/SOP 作业/下节预告 | 柯氏四级评估 | 3-6 |
| *S6+ | 扩展 | 知识深化/新增知识点/插片 | 任意 | 任意 |

### course.json 结构

```json
{
  "courseId": "my-course",
  "sections": [{
    "id": "1.1",
    "title": "章节标题",
    "segments": [
      { "id": "S1", "title": "导入", "chapters": [{"id":"xx","title":"xx"},...] },
      { "id": "S2", "title": "知识精讲", "chapters": [...] }
    ]
  }]
}
```

---

## 互动测验

### 选择题（类型 A）

```tsx
// 选项按钮带 data-no-advance + correct 标记
{step >= 1 && (
  <div className="quiz-options">
    <button className="quiz-opt" data-no-advance
      onClick={() => setSelected(0)}>A. 选项一</button>
    <button className="quiz-opt" data-no-advance
      onClick={() => setSelected(1)}>B. 选项二 ✓</button>
  </div>
)}
```

- 在 `chapters.ts` 中标记 `interactiveSteps: [1, 2]`
- Auto 模式在 interactiveSteps 步骤自动暂停，等用户点击
- 多题章节：Q1 在 step 1、Q2 在 step 2

### 简答题（类型 B）

```tsx
<textarea className="quiz-input" placeholder="输入你的答案..." />
<button className="quiz-submit" data-no-advance>提交</button>
```

答案校验：关键词匹配或 LLM-as-judge。持久化到 localStorage。

### CSS 3D 探索（类型 C）

零依赖方案：`transform-style: preserve-3d` + pointer events。
拖拽旋转 / 着色切换 / 约 200-300 个点模拟真实场景。

---

## 柯氏四级评估

每节课 S5 嵌入 L1-L4 评估：

| 层级 | 含义 | S5 嵌入方式 |
|:--|:--|:--|
| L1 反应层 | 学员满意度 | 弹题中加"你觉得本节难易度如何？" |
| L2 学习层 | 知识掌握 | 随堂选择题 + 通关代码截图 |
| L3 行为层 | 实际应用 | 课后挑战（如"极限测试X/Y坐标边界"） |
| L4 结果层 | 业务效果 | 追踪项目指标改善比例（长期） |

---

## 部署嵌入

### 方案 A：新窗口打开（推荐）

```tsx
window.open(`/courses/<your-project>/embed.html?auto=1&chapter=0`, '_blank');
```

零兼容性问题，全屏体验最佳。

### 方案 B：iframe 嵌入

```html
<iframe src="/courses/<your-project>/embed.html?auto=1&chapter=30"
  style="width:100%;height:100%;border:none" allowFullScreen />
```

需 nginx 配置：`location /courses/ { add_header X-Frame-Options "SAMEORIGIN"; }`

### 方案 C：宿主应用部署脚本

遵循宿主应用自身的构建→部署流程，将课件 dist/ 部署到 Web 服务器即可。

---

## 章节编号方案

章节目录 `src/chapters/{编号}-{前缀}-{id}/`，排序由目录名字母序决定。

### 插入章节时避免编号冲突

| 方案 | 方法 | 用于 |
|:--|:--|:--|
| 有空隙 | 直接使用间隙编号 | 前后有数字空档 |
| **加字母后缀** | 前编号后加字母 (`674a-`, `674b-`...) | 无空隙时 |
| 移末尾 | 用曲线顺序的大编号 | 区间已满 |

```bash
# 验证无冲突
ls {编号}-*/ | sort
```

> 音频目录基于章节 ID（非编号），重编号无需移动音频。

---

## 多课程管理

一个 presentation 项目可以承载多门课程，通过 URL 参数 `?course=<id>` 区分。

### 文件关系

| 文件 | 作用 | 何时存在 |
|:--|:--|:--|
| `course.json` | 默认课程的结构化目录 | 始终存在 |
| `course-{id}.json` | 某门特定课程的结构化目录 | 每新增一门课就多一个 |
| `src/registry/chapters.ts` | **全部课程的章节平铺注册表** | 始终存在 · 目录名自动生成 |

### 两套注册机制

- **`chapters.ts`** — 全局平铺的章节注册表。所有课程的章节按目录名字母序排列，`course-*.json` 通过章节 ID 引用其中的条目。**这是什么？** 一个巨大的线性列表。
- **`course-*.json`** — 结构化课程目录。定义每门课的 `课 → 段 → 章` 层级，驱动导航菜单。**这是什么？** 课程的大纲/目录。

> **关键**：新增/删除章节 → 两个地方都要一致。章节目录创建后自动注册到 `chapters.ts`，`course-*.json` 需手工添加对应条目。`course.json` 不可删除——导航菜单依赖它渲染。

### App.tsx 中的路由规则

前端通过两层过滤决定展示哪些章节：

1. **`filterChapters`** — 按章节 ID 前缀筛选，只把属于当前课程的章节从 `chapters.ts` 中挑出来
2. **`jsonMap`** — `?course=<id>` 映射到对应的 `course-<id>.json` 文件，提供结构化菜单

### 新增一门课程

1. 创建 `course-{id}.json`，定义各课/段/章的层级
2. 在 `App.tsx` 的 `filterChapters` 中追加新课程的章节 ID 前缀过滤规则
3. 在 `App.tsx` 的 `jsonMap` 中追加 `"{id}": "course-{id}.json"` 映射
4. 章节目录按字母后缀法分配编号，避免与已有课程的编号区间重叠
5. 验证：启动后访问 `?course={id}`，确认导航菜单正常显示

## 增补/插入章节到已有课程

编号原理：目录 `{编号}-{前缀}-{id}`，排序由目录名字母序决定。

| 方案 | 方法 | 示例 |
|:--|:--|:--|
| 有空隙 | 使用空隙内编号 | 674→680 间可用 675-679 |
| **加字母后缀** | 前编号后加字母 | `10a-` 在 `10-` 后、`11-` 前 |
| 区间已满 | 用更大编号 | 挪到末尾 |

```bash
# 验证无冲突
ls {编号}-*/ | sort
```

音频目录基于章节 ID（非编号），重编号后无需移动音频。

### 注意事项

- `course.json` 是项目的默认课程文件，不要删除
- 不同课程的章节 ID 前缀必须互斥——通过 `filterChapters` 的过滤规则保证菜单不混淆
- 音频目录基于章节 ID（非编号），重编号无需移动音频文件


---

## 逐段验收报告模板

```
S{X} 开发完成：
  - {N} 章 / {M} 步 / {C} 字 / ~{T} 秒 (~{Tmin} 分钟)
  - 累计 S1~S{X}: {total} 字 / ~{total_min} 分钟

本段使用的布局模式：{mode1}, {mode2}, ...
交互元素数：{count}
步内动态策略使用率：{pct}%
```

---

## 素材目录

课件开发中口播提到的真实场景截图、模板文件、参考图片等素材
统一存放在项目 `docs/materials/` 目录下。

### 开发时调用

Checkpoint Plan 阶段向用户确认素材文件名后，在章节 TSX 中以
相对路径引用：

```html
<img src="docs/materials/factory-screenshot.png" />
```

### 多模态模型接入

当接入多模态视觉模型时，Phase 2 开发前先将素材目录中的图片
传给模型识别内容，再将识别结果融入画面设计。
此时 `docs/materials/` 即为多模态模型的图片输入源。
