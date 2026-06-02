# 改善笔记 (Improvement Notes)

> 记录在生产级课件开发（ExamMaster ai-trainer-course）过程中发现的问题、优化方案和技术决策。
> 本文档供技能开发和维护参考。

---

## 1. 浮动字幕系统

**日期**: 2026-06-02

### 问题
原有字幕使用黑色背景条（`rgba(0,0,0,.78) + backdrop-filter`），在画布底部形成一条显著的遮挡区域，干扰了画面内容（尤其是 S3 算账对比的表格底行、S4 数据打架的对比画面）。

### 方案
- **移除背景条**：删除 `.sub-bar` 的 `background`、`backdrop-filter`、`border-radius`
- **双层 text-shadow**：`0 1px 4px rgba(0,0,0,.85), 0 0 16px rgba(0,0,0,.5)` 保证浅/深背景均可读
- **隐藏按钮**：右上角 👁 图标，stage 区域 hover 时出现，click 切换显示/隐藏
- **localStorage 持久化**：key `sub-visible`，用户偏好跨章节保持
- **data-no-advance**：点击按钮不触发全局 step 推进

### 改动文件
- `presentation/src/components/Subtitle.tsx`：新增 `visible` state + toggle button + localStorage
- `presentation/src/components/Subtitle.css`：无背景条 + 增强 text-shadow + `.sub-toggle` 按钮样式

---

## 2. 字幕-音频同步优化

**日期**: 2026-06-02

### 问题
原有字幕使用纯字数估算：
```
total_ms = max(4000, 字数 × 300)  # 假设 300ms/字
chunk_ms = total_ms × (块字数 ÷ 步总字数)  # 块内按比例
```

MiniMax TTS 实际语速因句子长度、标点位置而波动，导致字幕块边界与音频字边界漂移。尤其是 1.5 S4-S5 和 1.6 重写叙述后，漂移严重。

### 方案

**方案 A：MiniMax 词级时间戳（新章节推荐）**
- minimax.sh 合成时请求 `subtitle_enable: true, subtitle_type: "word"`
- MiniMax 返回每词 `start_ms`/`end_ms`
- 存储到 `public/minimax-word-timing/<chapter>/<step>.json`
- subtitle-timing.py `--mode minimax` 模式从词级时间戳构建字幕块（逐词 ms 对齐）
- **需要重合成音频**，适用于新开发章节

**方案 B+C：ffprobe + 大块切分（现有章节修复）**
- 用 `ffprobe` 读取每个 mp3 的实际时长，替代字数估算（步级精确对齐）
- 将切分阈值从 60 字提高到 80 字（减少切分次数 → 减少块间漂移）
- **无需重合成音频**，适用于已完成章节

### 字幕生成双模式

```bash
# 默认：80 字切分 + ffprobe 实测时长（现有章节）
python3 scripts/subtitle-timing.py

# MiniMax 词级：逐词 ms 对齐（未来新章）
python3 scripts/subtitle-timing.py --mode minimax
python3 scripts/subtitle-timing.py --mode minimax --chapters t6-bill-gate,t6-role-shift
```

### 参数对比

| 版本 | max_chars | 时长来源 | 精度 | 128 章效果 |
|------|:--:|------|:--:|------|
| 旧版 | 60 | 字数×300ms | ⭐⭐ | 1091 块，ffprobe 0% |
| 现行 | 80 | ffprobe 实测 | ⭐⭐⭐ | 832 块（-24%），ffprobe 100% |
| minimax | 80 | MiniMax word ms | ⭐⭐⭐⭐⭐ | 待未来合成使用 |

### 改动文件
- `scripts/subtitle-timing.py`：双模式（default / minimax），命令行参数，--chapters 过滤
- `scripts/tts-providers/minimax.sh`：合成时请求 + 提取 word 级时间戳
- `presentation/public/subtitle-timing.json`：运行 subtitle-timing.py 生成

---

## 3. 多色方案

**日期**: 2026-06-01

### 问题
全课件只使用单一黄色（`--accent: #facc15`），长时间观看造成视觉疲劳。不同教学情境（技术细节、警告风险、正向结论、深度进阶）应使用语义化色彩区分。

### 方案
在 `tokens.css` 中增加四色副强调变量：

```css
--accent:       #facc15;  /* 黄色 - 主强调、核心概念 */
--accent-tech:  #22d3ee;  /* 青色 - 技术元素、代码、工具 */
--accent-good:  #4ade80;  /* 绿色 - 正向结论、最佳实践、成功 */
--accent-warn:  #fb923c;  /* 橙色 - 警告、风险、红线 */
--accent-deep:  #a78bfa;  /* 紫色 - 深度、进阶、理论 */
```

### 应用规则
- S2 技术选型/代码示例 → `--accent-tech`
- S3 成本节省/优化结果 → `--accent-good`
- S4 数据冲突/风险警告 → `--accent-warn`
- 进阶理论知识 → `--accent-deep`
- 不破坏 chalk-garden 主题基调，仅增加语义化色彩层

### 改动文件
- `presentation/src/styles/tokens.css`：新增 4 个 CSS 变量
- 各章节 `.tsx` 中根据需要引用 `var(--accent-tech)` 等

---

## 4. Token Plan 与 API 限流

**日期**: 2026-05-28~06-02

### 发现
- MiniMax Token Plan Starter 初始显示 `0/0 used`（额度未分配）
- 错误码 `2056`，每周一（凌晨 0:00）重置
- `.chat` 域 key 有效，`.io` 域返回 `2049 invalid key`
- API Rate Limit 约 3 RPM，串行合成约 25s 间隔可避免

### 诊断工具
`scripts/diagnose-tts.sh` — 一键检测端点、key、Token Plan、Rate Limit

---

## 5. 字幕框溢出预防

**日期**: 2026-05-28

### 问题
早期字幕切分阈值 34 字导致平均 3.7 块/步 → 字幕溢出框外。后改 60 字降至 1.9 块/步。

### 现行标准
- 55 字切分阈值（28px 字体下 ≈ 1.5 行，单块率 < 10%）
- 最小块停留时间 2000ms（确保可读性）
- ffprobe 实测 MP3 时长替代字数估算

---

## 6. DB 自动同步模式

**日期**: 2026-06-02

### 问题
每开发完一门新课，需手动计算 start_chapter、手写 SQL 录入 interactive_courses 表。步骤繁琐且易出错——start_chapter 算错会导致点击章节卡片跳到错误章节。

### 方案
后端新增 `POST /api/interactive-courses/detect` 端点：
1. 读取 `dist/courses/<course>/course.json`
2. 遍历 sections，计算每个 section 的 start_chapter（累计前面章节数）
3. 对比 DB 已有记录，自动 INSERT 缺失条目（title/start_chapter/sort_order 全部自动填入）
4. 返回 `{ created: [...], message }` 供前端展示

前端管理面板增加「同步课件章节」按钮，选中课程组后一键检测并添加。

### 关键实现
- 服务层：`detectAndCreateChapters(db, groupId)` — 读取 course.json → 对比 DB → INSERT
- Docker 容器需挂载 `dist` 目录（`docker-compose.yml` 增加 `- ./dist:/app/dist:ro`）
