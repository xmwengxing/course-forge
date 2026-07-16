#!/usr/bin/env python3
# ─────────────────────────────────────────────────────────────
# lint-course.py — 课件内容硬规则校验（cross-platform）
#
# 在脚手架生成的课程项目根目录运行：
#   python3 scripts/lint-course.py
#   python3 scripts/lint-course.py --chapters src/chapters
#
# 校验「交互式课程」5 条内容硬规则（见 SKILL.md § 核心不变量 + 课件内容硬规则）：
#   1. 逐步揭示   — 章节用 MaskReveal / Reveal 做逐元素揭示（FAIL）
#   2. 动效必具   — 每章有视觉演示（svg / canvas / animejs / @keyframes / rAF ...）（FAIL）
#   3. 互动密度   — 每 ~3 屏（按步数估算屏数）至少 1 处真互动（FAIL）
#   4. 禁止纯文字 — 同「动效必具」的另一面：无视觉演示 = 纯文字风险（FAIL）
#   5. 口播对齐   — narrations.ts 长度 == 章节里 max(step >= N 或 step === N) + 1（FAIL）
#
# 建议（WARN，不致命，为 P2 优化铺垫）：
#   - 每章 ≤ 12 步（步数过多易让单章臃肿）
#   - 配色/字体走 token（检测硬编码 hex / 字体名）
#
# 退出码：发现任何 FAIL 返回 1，否则 0（WARN 不致命）。
# 这是启发式守卫（静态扫描），不是编译期强制——用来在开发早期拦住反模式。
# ─────────────────────────────────────────────────────────────
import math
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
# D11 修复：同时匹配 `step === N` 与 `step >= N`（以及 `step > N`），
# 取最大 N 作为该章步数上界。旧版只匹配 `===`，对用 `step >= K` 的章节静默跳过对齐检查。
RE_STEP_BOUND = re.compile(r"step\s*(?:===|>=|>)\s*(\d+)")
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

# D13 铺垫：硬编码 hex / 字体名（WARN，建议 token 化）
RE_HEX = re.compile(r"#[0-9a-fA-F]{3,8}\b")
# 排除 var(...) 引用：font-family: var(--font-mono) 是合规的 token 用法
# 负前瞻允许 : 与 var( 之间有空白，避免 \s* 回溯绕过
RE_FONT_LITERAL = re.compile(r"font-family\s*:\s*(?!\s*var\()[^;]*;", re.IGNORECASE)

# 支柱3 材质立体：检测 gradient/shadow/glow 等材质手法（核心元素 ≥2 种，0 种=WARN）
RE_MATERIAL = re.compile(
    r"linear-gradient|radial-gradient|box-shadow|drop-shadow|"
    r"backdrop-filter|mix-blend-mode|text-shadow|filter\s*:\s*blur",
    re.IGNORECASE,
)
# 反 AI 味：紫粉/蓝紫对角渐变背景（CHAPTER-CRAFT § 避免 AI 味，WARN）
RE_AI_GRADIENT = re.compile(
    r"linear-gradient\([^)]*(?:purple|pink|magenta|violet|indigo|fuchsia|lavender|#[89a-f][0-9a-f]{2,5})",
    re.IGNORECASE,
)

# 单章步数建议上限（WARN，非硬约束）
STEPS_SOFT_CAP = 12
# 互动密度：平均 3 步/屏 估算屏数，每 3 屏 ≥ 1 互动 → 每 9 步 ≥ 1 互动
STEPS_PER_SCREEN = 3
SCREENS_PER_INTERACTION = 3


def strip_comments(text):
    """去除 // 行注释与 /* */ 块注释，避免注释里的关键字误判为真实现（D12）。"""
    text = re.sub(r"/\*.*?\*/", "", text, flags=re.DOTALL)
    text = re.sub(r"//.*", "", text)
    return text


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

    # D12：去注释后再匹配视觉/互动，避免注释里的关键字误判
    tsx_code = strip_comments(tsx_text)
    css_code = strip_comments(css_text)

    res = {
        "name": name,
        "steps": None,
        "max_step": None,
        "visual": False,
        "interactive_count": 0,
        "reveal": bool(RE_REVEAL.search(tsx_code)),
        "scene_types": [],
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

    # D11：匹配 === 与 >= / >，取最大 N
    max_step = -1
    for mm in RE_STEP_BOUND.finditer(tsx_code):
        n = int(mm.group(1))
        if n > max_step:
            max_step = n
    res["max_step"] = max_step if max_step >= 0 else None

    if steps is not None and res["max_step"] is not None:
        if steps != res["max_step"] + 1:
            res["issues"].append(
                f"口播对齐 FAIL：narrations 长度={steps}，但章节代码 max(step>=N / step===N)={res['max_step']}"
                f"（应相等，即长度={res['max_step'] + 1}）"
            )
    elif steps is None and res["max_step"] is not None:
        res["warns"].append(
            f"无 narrations.ts：无法校验口播对齐（代码用到 max step={res['max_step']}）"
        )

    # --- 视觉演示 / 禁纯文字 ---
    # scenes 组件（BlockStack/RunnerTrack/LiveEditor/TypeOut）是封装好的视觉演示，
    # 引用它们也算"有视觉演示"——不只认 <svg/canvas/keyframes 关键字。
    visual_blob = tsx_code + "\n" + css_code
    has_scene = bool(RE_SCENE.search(tsx_code))
    res["visual"] = bool(RE_VISUAL.search(visual_blob)) or has_scene
    if not res["visual"]:
        res["issues"].append(
            "禁纯文字 FAIL：未检测到视觉演示（svg/canvas/animejs/@keyframes/rAF/draggable 或 scenes 组件）"
        )

    # --- 真互动（数量 + 密度）---
    interactive_hits = RE_INTERACTIVE.findall(tsx_code)
    res["interactive_count"] = len(interactive_hits)

    # --- 逐步揭示（D10：升 FAIL）---
    if not res["reveal"]:
        res["issues"].append(
            "逐步揭示 FAIL：未检测到 MaskReveal / Reveal 用法（每屏内容必须随 step 逐元素揭示）"
        )

    # --- 模拟实景组件检测（§ 模拟实景 模式库） ---
    res["scene_types"] = [label for n, label in SCENE_MAP.items() if n in tsx_code]

    # --- emoji 当图标（反模式，WARN） ---
    # 去掉变体选择符（U+FE0F / U+FE0E），避免 ➡️ 这类带选择符的合法字形
    # 误匹配集合里的选择符本身。
    clean = tsx_text.replace("\ufe0f", "").replace("\ufe0e", "")
    emoji_hits = sum(1 for ch in clean if ch in EMOJI_ICONS)
    if emoji_hits:
        res["warns"].append(
            f"emoji 当图标 ×{emoji_hits}：用 § 模拟实景 的 RunnerTrack / LiveEditor / "
            f"BlockStack / TypeOut 等组件演出来，别拿 emoji 当图标"
        )

    # --- D13 铺垫：token 化检查（WARN）---
    hex_hits = RE_HEX.findall(css_code)
    if hex_hits:
        res["warns"].append(
            f"硬编码颜色 ×{len(hex_hits)}：检测到 hex 色值，建议改用主题 token（--accent / --text 等）"
        )
    font_hits = RE_FONT_LITERAL.findall(css_code)
    if font_hits:
        res["warns"].append(
            f"硬编码字体 ×{len(font_hits)}：检测到 font-family 字面量，建议改用 token（--font-display-cn 等）"
        )

    # --- 步数建议（WARN）---
    if steps is not None and steps > STEPS_SOFT_CAP:
        res["warns"].append(
            f"步数偏多：本章 {steps} 步（建议 ≤ {STEPS_SOFT_CAP}，单章过臃肿可拆分）"
        )

    # --- 支柱3 材质立体（WARN）：检测 gradient/shadow/glow 使用率 ---
    material_blob = tsx_code + "\n" + css_code
    material_hits = len(RE_MATERIAL.findall(material_blob))
    res["material_count"] = material_hits
    if material_hits == 0:
        res["warns"].append(
            "材质缺失：未检测到 gradient/shadow/glow 等材质手法，核心元素建议 ≥2 种材质叠加（支柱3，告别纯色 flat）"
        )

    # --- 反 AI 味（WARN）：紫粉/蓝紫渐变背景 ---
    ai_gradient_hits = RE_AI_GRADIENT.findall(css_code)
    if ai_gradient_hits:
        res["warns"].append(
            f"AI 味渐变 ×{len(ai_gradient_hits)}：检测到紫粉/蓝紫系渐变（CHAPTER-CRAFT § 避免 AI 味），换主题 accent 色"
        )

    return res


def load_quiz_counts(chapters_dir):
    """从 registry/chapters.ts 解析每章数据驱动的 quiz 数量。

    互动不止写在章节 .tsx 里——数据驱动的 QuizPanel 通过 chapters.ts 的
    `quizzes` 字段声明（运行时统一渲染）。只扫 .tsx 会漏判这类真互动，
    误报"无互动"。本函数把 chapters.ts 里每章的 quiz 数量读出来，供密度计算合并。

    注意：chapters.ts 里 `id:` 多处出现（章节 id / question id / option id）。
    只把"id 后紧跟 title"的当作章节边界，避免被 option/question 的 id 干扰。
    """
    registry_path = os.path.join(os.path.dirname(chapters_dir), "registry", "chapters.ts")
    if not os.path.exists(registry_path):
        return {}
    text = open(registry_path, encoding="utf-8").read()
    text = strip_comments(text)
    counts = {}
    # 章节块特征：id: "xxx", title: ...（option id 后跟 label，question id 后跟 type）
    marks = [
        (m.start(), m.group(1))
        for m in re.finditer(r'id\s*:\s*"([^"]+)"\s*,\s*\n?\s*title', text)
    ]
    for i, (start, cid) in enumerate(marks):
        end = marks[i + 1][0] if i + 1 < len(marks) else len(text)
        block = text[start:end]
        if "quizzes" in block:
            quiz_block = re.search(r"quizzes\s*:\s*\[(.*?)\]", block, re.DOTALL)
            if quiz_block:
                n = len(re.findall(r"step\s*:", quiz_block.group(1)))
                if n:
                    counts[cid] = counts.get(cid, 0) + n
    return counts


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

    # 合并数据驱动 quiz（来自 registry/chapters.ts）到各章互动计数。
    # 互动不只写在章节 .tsx 里——QuizPanel 通过 chapters.ts 的 quizzes 字段
    # 数据驱动渲染，只扫 .tsx 会漏判这类真互动。
    quiz_counts = load_quiz_counts(chapters_dir)
    if quiz_counts:
        print(f"  （检测到数据驱动 quiz：{quiz_counts}）")
    for r in results:
        cid = r["name"].split("-", 1)[1] if "-" in r["name"] else r["name"]
        if cid in quiz_counts:
            r["interactive_count"] += quiz_counts[cid]

    fails = 0
    warns = 0
    for r in results:
        tag = "✓" if not r["issues"] else "✗"
        step_info = f"{r['steps']} 步" if r["steps"] is not None else "无 narrations"
        bits = []
        bits.append("视觉✓" if r["visual"] else "视觉✗")
        bits.append(f"互动×{r['interactive_count']}")
        bits.append("揭示✓" if r["reveal"] else "揭示✗")
        bits.append("实景:" + (",".join(r["scene_types"]) if r["scene_types"] else "—"))
        bits.append(f"材质×{r.get('material_count', 0)}")
        line = f"  {tag} {r['name']}（{step_info}）— {' '.join(bits)}"
        print(line)
        for iss in r["issues"]:
            print(f"      ✗ {iss}")
            fails += 1
        for w in r["warns"]:
            print(f"      ⚠ {w}")
            warns += 1

    # D9 修复：互动密度按「屏」算（每章内部，按步数估算屏数）。
    # 旧版 `(total_chapters + 2) // 3` 按「章」算，把「每 3 屏 1 互动」
    # 错放过成「每 3 章 1 互动」——最严重的语义错位。
    print("\n  互动密度（按屏估算，每 3 屏 ≥ 1 处真互动）：")
    density_fail = False
    for r in results:
        steps = r["steps"]
        if steps is None or steps <= 0:
            steps = 1
        # 估算屏数：平均 STEPS_PER_SCREEN 步/屏；每 SCREENS_PER_INTERACTION 屏 ≥ 1 互动
        estimated_screens = max(1, round(steps / STEPS_PER_SCREEN))
        required = max(1, math.ceil(estimated_screens / SCREENS_PER_INTERACTION))
        actual = r["interactive_count"]
        status = "✓" if actual >= required else "✗"
        detail = f"≈{estimated_screens}屏 → 需≥{required}互动，实际 {actual}"
        print(f"    {status} {r['name']}：{detail}")
        if actual < required:
            r["issues"].append(
                f"互动密度 FAIL：估算 ≈{estimated_screens} 屏，需 ≥{required} 处真互动，"
                f"实际 {actual}（每 3 屏 ≥ 1 处真互动）"
            )
            fails += 1
            density_fail = True

    print("\n" + "─" * 52)
    print(f"  章节 {total_chapters} · FAIL {fails} · WARN {warns}")
    print("─" * 52)

    if fails:
        print("✗ lint 未通过 — 请按上面的 FAIL 修复后再继续。")
        sys.exit(1)
    # animejs cohesion 提示：章节若用 animejs，建议补跑 4 大共性检查
    has_animejs = False
    for d in chapter_dirs:
        for f in os.listdir(d):
            if f.endswith(".tsx"):
                try:
                    if "animejs" in open(os.path.join(d, f), encoding="utf-8").read().lower():
                        has_animejs = True
                except OSError:
                    pass
    if has_animejs:
        cohesion = os.path.join(os.path.dirname(chapters_dir) or ".", "scripts", "check-animejs-cohesion.py")
        if os.path.exists(cohesion):
            print(f"\n▸ 检测到 animejs，补跑 4 大共性 cohesion 检查：")
            import subprocess
            subprocess.run([sys.executable, cohesion, "--chapters", chapters_dir])
        else:
            print("\n⚠ 检测到 animejs 用法，建议跑 check-animejs-cohesion.py 检查 4 大共性（随机化/持续循环/多keyframe/独立stagger）")
    print("✓ lint 通过（warn 项建议酌情优化）")
    sys.exit(0)


if __name__ == "__main__":
    main()
