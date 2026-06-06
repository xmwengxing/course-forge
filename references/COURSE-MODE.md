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
  "courseId": "l4",
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

### 内容量估算

| 口播稿字数 | 拆分方案 | 预估总时长 |
|:--|:--|:--|
| ≤ 1,000 字 | 不拆 | ~10-15 min |
| 1,000-2,500 字 | 3 段 | ~25-35 min |
| 2,500-4,000 字 | 5 段 (S1-S5) | ~45 min |
| > 4,000 字 | 建议精简 | — |

中文 TTS 含停顿约 5.3 字/秒。

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
window.open(`/courses/ai-trainer/embed.html?auto=1&chapter=0`, '_blank');
```

零兼容性问题，全屏体验最佳。

### 方案 B：iframe 嵌入

```html
<iframe src="/courses/ai-trainer/embed.html?auto=1&chapter=30"
  style="width:100%;height:100%;border:none" allowFullScreen />
```

需 nginx 配置：`location /courses/ { add_header X-Frame-Options "SAMEORIGIN"; }`

### 方案 C：DB 驱动路由

```sql
-- 课程表
courses(id, title, base_path, start_chapter, course_param, status)
-- course_param: 区分同课件下不同课程 (e.g. 'l4', 'kids')
```

前端通过 `InteractiveCourseViewer` 读取 `course_param`，构建带 `?course=l4` 的 embed URL。

### 方案 D：deploy-courses.sh 脚本

```bash
python3 deploy-courses.sh --course ai-trainer        # 增量部署
python3 deploy-courses.sh --course ai-trainer --full-sync  # 全量
```

自动执行：构建 → 复制到 dist/ → rsync 上传到生产服务器。

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

## 逐段验收报告模板

```
S{X} 开发完成：
  - {N} 章 / {M} 步 / {C} 字 / ~{T} 秒 (~{Tmin} 分钟)
  - 累计 S1~S{X}: {total} 字 / ~{total_min} 分钟

本段使用的布局模式：{mode1}, {mode2}, ...
交互元素数：{count}
步内动态策略使用率：{pct}%
```
