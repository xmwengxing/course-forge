#!/usr/bin/env python3
# ─────────────────────────────────────────────────────────────
# lint-course.py — 课件内容硬规则校验（cross-platform）
#
# 在脚手架生成的课程项目根目录运行：
#   python3 scripts/lint-course.py
#   python3 scripts/lint-course.py --chapters src/chapters
#
# 校验「交互式课程」5 条内容硬规则（见 SKILL.md § 核心不变量 + 课件内容硬规则）：
#   1. 逐步揭示   — 章节用 MaskReveal / Reveal 做逐元素揭示
#   2. 动效必具   — 每章有视觉演示（svg / canvas / animejs / @keyframes / rAF ...）
#   3. 互动密度   — 每 3 章内至少 1 章有真互动（onClick/onChange/拖拽/输入/QuizPanel）
#   4. 禁止纯文字 — 同「动效必具」的另一面：无视觉演示 = 纯文字风险
#   5. 口播对齐   — narrations.ts 长度 == 章节里 max(step === N) + 1
#   6. 模拟实景   — 统计每章命中 § 模拟实景 的哪几类组件（RunnerTrack /
#                  LiveEditor / BlockStack / TypeOut）；emoji 当图标 = warn
#
# 退出码：发现任何 FAIL 返回 1，否则 0（warn 不致命）。
# 这是启发式守卫（静态扫描），不是编译期强制——用来在开发早期拦住反模式。
# ─────────────────────────────────────────────────────────────
import os
import re
import sys

# ---- 检测正则 ----
RE_VISUAL = re.compile(
    r"<svg|</svg|<canvas|canvas|@keyframes|animejs|requestAnimationFrame|"
    r"createDrawable|draggable|\.animate\(|getContext|new\s+Path2D",
    re.IGNORECASE,
)
RE_INTERACTIVE = re.compile(
    r"onClick|onChange|onSubmit|onInput|onDragStart|onDrop|onPointerDown|"
    r"QuizPanel|data-interactive",
)
RE_REVEAL = re.compile(r"MaskReveal|<\s*Reveal\b")
RE_STEP_EQ = re.compile(r"step\s*===\s*(\d+)")
RE_NARRATION_LINE = re.compile(r'^\s*["\'"]')  # 数组里的字符串元素行

# 模拟实景组件（§ 模拟实景 模式库的可拼装实现）。命中即说明该章在
# "把口播演成看得见的事"，而非大字卡片 / emoji 图标。
SCENE_MAP = {
    "RunnerTrack": "执行跑道",
    "LiveEditor": "现场编辑器",
    "BlockStack": "积木堆叠",
    "TypeOut": "终端打字",
}
RE_SCENE = re.compile("|".join(SCENE_MAP.keys()))
# emoji 当图标（反模式）：用实景组件演出来，别拿 emoji 当图标。
# 仅覆盖明显的"图标替代"类 emoji（脸 / 物体 / 手势），故意排除 ➡ ✓ ▶ ⏳
# 等合法排版字形与 ⚠ ⚙ 等可能出现在注释里的符号，避免误伤正常排版。
EMOJI_ICONS = "📱💡🚀🔥🧠👍👎📺🌟⭐💬🤖😀😄😊🤔😎🎮💻📦✨🎯🏆💪🙌👏🔧🔍📌📎✂️"


def scan_chapter(chapter_dir):
    """返回该章的检测结果 dict。"""
    name = os.path.basename(chapter_dir)
    tsx_files = [f for f in os.listdir(chapter_dir) if f.endswith(".tsx")]
    css_files = [f for f in os.listdir(chapter_dir) if f.endswith(".css")]
    narration_file = os.path.join(chapter_dir, "narrations.ts")

    tsx_text = ""
    for f in tsx_files:
        with open(os.path.join(chapter_dir, f), encoding="utf-8") as fh:
            tsx_text += fh.read() + "\n"
    css_text = ""
    for f in css_files:
        with open(os.path.join(chapter_dir, f), encoding="utf-8") as fh:
            css_text += fh.read() + "\n"

    res = {
        "name": name,
        "steps": None,
        "max_step": None,
        "visual": False,
        "interactive": False,
        "reveal": bool(RE_REVEAL.search(tsx_text)),
        "issues": [],
        "warns": [],
    }

    # --- narrations 长度 + step 对齐 ---
    if os.path.exists(narration_file):
        ntext = open(narration_file, encoding="utf-8").read()
        # 取 export const narrations ... = [ ... ]; 区块
        m = re.search(r"narrations[^=]*=\s*\[(.*?)\];", ntext, re.DOTALL)
        if m:
            block = m.group(1)
            # 统计数组元素行（缩进开头的引号字符串，排除注释行）
            count = 0
            for line in block.splitlines():
                s = line.strip()
                if s.startswith("//"):
                    continue
                if RE_NARRATION_LINE.match(line):
                    count += 1
            res["steps"] = count
    steps = res["steps"]

    max_step = -1
    for mm in RE_STEP_EQ.finditer(tsx_text):
        n = int(mm.group(1))
        if n > max_step:
            max_step = n
    res["max_step"] = max_step if max_step >= 0 else None

    if steps is not None and res["max_step"] is not None:
        if steps != res["max_step"] + 1:
            res["issues"].append(
                f"口播对齐 FAIL：narrations 长度={steps}，但章节代码 max(step===N)={res['max_step']}"
                f"（应相等，即长度={res['max_step'] + 1}）"
            )

    # --- 视觉演示 / 禁纯文字 ---
    visual_blob = tsx_text + "\n" + css_text
    res["visual"] = bool(RE_VISUAL.search(visual_blob))
    if not res["visual"]:
        res["issues"].append(
            "禁纯文字 FAIL：未检测到视觉演示（svg/canvas/animejs/@keyframes/rAF/draggable 等）"
        )

    # --- 真互动 ---
    res["interactive"] = bool(RE_INTERACTIVE.search(tsx_text))
    if not res["interactive"]:
        res["warns"].append("无真互动标记：本章未检测到 onClick/onChange/拖拽/输入/QuizPanel")

    # --- 逐步揭示 ---
    if not res["reveal"]:
        res["warns"].append("逐步揭示缺失：未检测到 MaskReveal / Reveal 用法")

    # --- 模拟实景组件检测（§ 模拟实景 模式库） ---
    res["scene_types"] = [label for name, label in SCENE_MAP.items() if name in tsx_text]

    # --- emoji 当图标（反模式） ---
    # 去掉变体选择符（U+FE0F / U+FE0E），避免 ➡️ 这类带选择符的合法字形
    # 误匹配集合里的选择符本身。
    clean = tsx_text.replace("\ufe0f", "").replace("\ufe0e", "")
    emoji_hits = sum(1 for ch in clean if ch in EMOJI_ICONS)
    if emoji_hits:
        res["warns"].append(
            f"emoji 当图标 ×{emoji_hits}：用 § 模拟实景 的 RunnerTrack / LiveEditor / "
            f"BlockStack / TypeOut 等组件演出来，别拿 emoji 当图标"
        )

    return res


def main():
    args = sys.argv[1:]
    chapters_dir = "src/chapters"
    i = 0
    while i < len(args):
        a = args[i]
        if a == "--chapters" and i + 1 < len(args):
            chapters_dir = args[i + 1]
            i += 2
        elif a.startswith("--chapters="):
            chapters_dir = a.split("=", 1)[1]
            i += 1
        else:
            i += 1

    if not os.path.isdir(chapters_dir):
        # 容错：在常见位置找
        for cand in ("src/chapters", "presentation/src/chapters", "chapters"):
            if os.path.isdir(cand):
                chapters_dir = cand
                break
        else:
            print(f"✗ 找不到章节目录：{chapters_dir}")
            sys.exit(1)

    print(f"▸ course-forge lint — 扫描 {chapters_dir}\n")
    chapter_dirs = sorted(
        d for d in (os.path.join(chapters_dir, x) for x in os.listdir(chapters_dir))
        if os.path.isdir(d)
    )

    results = [scan_chapter(d) for d in chapter_dirs]
    total_chapters = len(results)
    interactive_chapters = sum(1 for r in results if r["interactive"])

    fails = 0
    warns = 0
    for r in results:
        tag = "✓" if not r["issues"] else "✗"
        step_info = f"{r['steps']} 步" if r["steps"] is not None else "无 narrations"
        bits = []
        bits.append("视觉✓" if r["visual"] else "视觉✗")
        bits.append("互动✓" if r["interactive"] else "互动—")
        bits.append("揭示✓" if r["reveal"] else "揭示—")
        bits.append("实景:" + (",".join(r["scene_types"]) if r["scene_types"] else "—"))
        line = f"  {tag} {r['name']}（{step_info}）— {' '.join(bits)}"
        print(line)
        for iss in r["issues"]:
            print(f"      ✗ {iss}")
            fails += 1
        for w in r["warns"]:
            print(f"      ⚠ {w}")
            warns += 1

    # 互动密度：每 3 章至少 1 章有真互动
    required = (total_chapters + 2) // 3 if total_chapters else 0
    density_fail = interactive_chapters < required
    if density_fail:
        print(
            f"\n  ✗ 互动密度 FAIL：交互章节 {interactive_chapters}/{total_chapters}"
            f"（要求 ≥ {required}，即每 3 章至少 1 处真互动）"
        )
        fails += 1

    print("\n" + "─" * 52)
    print(f"  章节 {total_chapters} · FAIL {fails} · WARN {warns}")
    if density_fail or interactive_chapters:
        print(f"  互动章节 {interactive_chapters}/{total_chapters}（要求 ≥ {required}）")
    print("─" * 52)

    if fails:
        print("✗ lint 未通过 — 请按上面的 FAIL 修复后再继续。")
        sys.exit(1)
    print("✓ lint 通过（warn 项建议酌情优化）")
    sys.exit(0)


if __name__ == "__main__":
    main()
