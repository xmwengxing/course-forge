# `course.json` 格式 spec

课件项目的数据结构定义文件。定义了段（Section）→ 节（Segment）→ 章（Chapter）三级架构。

## JSON 结构

```json
{
  "courseId": "ai-trainer-3",
  "title": "人工智能训练师三级课件",
  "sections": [
    {
      "id": "1.1",
      "title": "通用业务流程和业务数据",
      "source": "1.1业务流程设计.md",
      "segments": [
        {
          "id": "S1",
          "title": "导入",
          "chapters": [
            { "id": "opening", "title": "开幕：翁老师问候" },
            ...
          ]
        },
        ...
      ]
    }
  ]
}
```

## 字段约定

| 层级 | 字段 | 必填 | 说明 |
|------|------|:--:|------|
| Root | `courseId` | ✓ | 课程唯一标识 |
| Root | `title` | ✓ | 课程名称（显示在 ChapterMenu 顶部） |
| Root | `sections` | ✓ | Section 数组 |
| Section | `id` | ✓ | 如 "1.1", "1.2"，小写+数字+连字符 |
| Section | `title` | ✓ | 给人看的中文标题 |
| Section | `source` | | 关联的原始文档文件名 |
| Section | `segments` | ✓ | Segment 数组 |
| Segment | `id` | ✓ | "S1"~"S5" |
| Segment | `title` | ✓ | 如 "导入", "知识精讲" |
| Segment | `chapters` | ✓ | 章节 ID+Title 数组 |
| Chapter | `id` | ✓ | 必须在 chapters.ts 中注册 |
| Chapter | `title` | ✓ | 显示在 ChapterMenu 中 |

## 拆分规则

| 文档字数 | 拆分方案 | 预估总时长 |
|---------|:-------:|:--------:|
| ≤ 2,000 | 不拆 | ~10-15 min |
| 2,000-5,000 | 3 段 | ~25-35 min |
| 5,000-8,000 | 5 段 (S1-S5) | ~45 min |
| > 8,000 | 建议先精简 | — |

## course.json 维护

**禁止手工编辑 course.json 追加 JSON**。每次新增章节后：

1. 编辑 `course.json`（在对应 segment 的 chapters 数组中添加条目）
2. 运行 `python3 regenerate-course-json.py` 自动验证 + 格式化 + 同步到 `presentation/public/course.json`

如果 course.json 已损坏（左侧导航菜单消失），运行 `regenerate-course-json.py` 自动修复。

## ChapterMenu 依赖

ChapterMenu 组件从 `course.json` 读取数据渲染三级导航。如果 course.json 格式错误（JSON parse 失败），`courseDef` 为 null，导航菜单不渲染。日志无报错，仅表现为空白——这是最常被忽略的 bug 来源。
