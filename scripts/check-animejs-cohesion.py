#!/usr/bin/env python3
"""
check-animejs-cohesion.py
==========================

硬约束 #6 lint: 检查章节是否满足 animejs "4 大共性" 中至少 2 项.

4 大共性 (硬约束, 动画"动得对"):
  1. 随机化:     utils.random() / utils.randomPick()
  2. 持续循环:   onComplete: () => animate(...) / loop: true / alternate: true
  3. 多 keyframe: keyframes: [{...}, {...}, ...] (3+ 个 keyframe)
  4. 独立 stagger: stagger(N, { from: 'center' | 'last' | 'random' })

第 5 共性 (材质叠加) 是参考, 不是门槛 — 见 ANIMEJS-GUIDE.md §X.1
按内容按需加 linear-gradient / box-shadow / drop-shadow / mix-blend-mode 等.

判定:
  0-1 项 (4 大共性) = 死板 (退回 ANIMEJS-GUIDE.md §0 决策树)
  2-3 项 (4 大共性) = 合格 — 动得对
  ≥ 3 项 (4 大共性) = 优秀 — 动得对 + 有节奏

用法:
  python3 scripts/check-animejs-cohesion.py              # 扫所有章节
  python3 scripts/check-animejs-cohesion.py 860-i6-ghost-brake  # 扫单章
  python3 scripts/check-animejs-cohesion.py --strict    # 必须 3+ 项才算合格
  python3 scripts/check-animejs-cohesion.py --report    # 输出参考报告 (含材质叠加, 不强制)
"""
import os
import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
CHAPTERS = ROOT / "presentation" / "src" / "chapters"

COHESION_PATTERNS = {
    "随机化": r"utils\.random|utils\.randomPick",
    "持续循环": r"onComplete\s*[:=]\s*(\(\)\s*=>|function).*animate|loop\s*:\s*true|alternate\s*:\s*true",
    "多 keyframe": r"keyframes\s*:\s*\[",
    "独立 stagger": r"stagger\s*\(",
}

# 第 5 共性 (参考, 不强制): 材质叠加
TEXTURE_PATTERNS = {
    "linear-gradient": r"linear-gradient\s*\(",
    "radial-gradient": r"radial-gradient\s*\(",
    "box-shadow 多层": r"box-shadow\s*:[^;]*,[^;]*,",
    "drop-shadow": r"drop-shadow\s*\(",
    "mix-blend-mode": r"mix-blend-mode\s*[:=]",
    "backdrop-filter": r"backdrop-filter\s*[:=]",
    "text-shadow": r"text-shadow\s*[:=]",
    "stroke-dasharray": r"stroke-dasharray\s*[:=]",
}


def check_chapter(chap_dir: Path) -> dict:
    """扫一章, 返回每项命中数和总分"""
    tsx = chap_dir / "index.tsx"
    css = chap_dir / "index.css"
    if not tsx.exists():
        return None
    text = tsx.read_text()
    hits = {name: bool(re.search(pat, text)) for name, pat in COHESION_PATTERNS.items()}
    score = sum(hits.values())

    texture_hits = {name: False for name in TEXTURE_PATTERNS}
    if css.exists():
        css_text = css.read_text()
        for name, pat in TEXTURE_PATTERNS.items():
            texture_hits[name] = bool(re.search(pat, css_text))
    texture_score = sum(texture_hits.values())

    return {
        "name": chap_dir.name,
        "hits": hits,
        "score": score,
        "texture_hits": texture_hits,
        "texture_score": texture_score,
    }


def main():
    targets = sys.argv[1:]
    strict = "--strict" in targets
    report = "--report" in targets
    targets = [t for t in targets if not t.startswith("--")]

    if targets:
        chap_dirs = [CHAPTERS / t for t in targets]
    else:
        chap_dirs = sorted([d for d in CHAPTERS.iterdir() if d.is_dir()])

    results = []
    for d in chap_dirs:
        r = check_chapter(d)
        if r:
            results.append(r)

    if not results:
        print("未找到任何章节")
        sys.exit(1)

    pass_threshold = 3 if strict else 2

    if report:
        # 报告模式: 含材质叠加参考, 不强制
        print(f"\n=== 硬约束 #6 + 参考报告 ({len(results)} 章) ===\n")
        print(f"4 大共性判定阈值: {pass_threshold}+ 项为合格 (硬约束)")
        print(f"材质叠加: 参考, 不强制 (见 ANIMEJS-GUIDE.md §X.1)\n")

        failed = []
        for r in results:
            marks = " ".join(f"★{n}" if h else f" {n}" for n, h in r["hits"].items())
            ok = "✓" if r["score"] >= pass_threshold else "✗"
            tex_note = f"  材质: {r['texture_score']}/{len(TEXTURE_PATTERNS)} (参考)"
            print(f"  {ok} {r['name']:40s} {r['score']}/4  {marks}{tex_note}")
            if r["score"] < pass_threshold:
                failed.append(r["name"])
    else:
        # 默认模式: 硬约束 #6 4 大共性
        print(f"\n=== 硬约束 #6: animejs 4 大共性 lint ({len(results)} 章) ===\n")
        print(f"判定阈值: {pass_threshold}+ 项为合格 (硬约束)\n")

        failed = []
        for r in results:
            marks = " ".join(f"★{n}" if h else f" {n}" for n, h in r["hits"].items())
            ok = "✓" if r["score"] >= pass_threshold else "✗"
            print(f"  {ok} {r['name']:40s} {r['score']}/4  {marks}")
            if r["score"] < pass_threshold:
                failed.append(r["name"])

    print(f"\n汇总: {len(results) - len(failed)}/{len(results)} 合格")
    if failed:
        print(f"未达标: {', '.join(failed)}")
        print(f"\n→ 回退 ANIMEJS-GUIDE.md §0 决策树, 重新选模式")
        sys.exit(1)
    else:
        print(f"\n✓ 所有章节达到硬约束 #6 阈值 (4 大共性 ≥ {pass_threshold})")
        if not report:
            print(f"提示: 跑 --report 看参考报告 (含材质叠加, 不强制)")
        sys.exit(0)


if __name__ == "__main__":
    main()
