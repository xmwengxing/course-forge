#!/usr/bin/env python3
"""
重建 course.json，确保 JSON 语法永远正确。
用法：python3 regenerate-course-json.py
功能：
  1. 读取当前 course.json
  2. 验证 JSON 合法性
  3. 以统一格式重写
  4. 同步到 presentation/public/course.json
"""
import json, os, sys

SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.dirname(SCRIPT_DIR) if os.path.basename(SCRIPT_DIR) == 'scripts' else SCRIPT_DIR
COURSE_JSON = os.path.join(ROOT, "course.json")
PUBLIC_JSON = os.path.join(ROOT, "presentation", "public", "course.json")

try:
    with open(COURSE_JSON) as f:
        course = json.load(f)
except (json.JSONDecodeError, FileNotFoundError) as e:
    print(f"✗ course.json 损坏或不存在: {e}", file=sys.stderr)
    sys.exit(1)

# 重写
with open(COURSE_JSON, "w") as f:
    json.dump(course, f, ensure_ascii=False, indent=2)
    f.write("\n")

if os.path.exists(os.path.dirname(PUBLIC_JSON)):
    with open(PUBLIC_JSON, "w") as f:
        json.dump(course, f, ensure_ascii=False, indent=2)
        f.write("\n")

# 验证
json.load(open(COURSE_JSON))
json.load(open(PUBLIC_JSON))

total_chapters = sum(len(seg["chapters"]) for s in course["sections"] for seg in s["segments"])
print(f"✓ course.json 重写完成: {len(course['sections'])} sections, {total_chapters} chapters")
print(f"  {COURSE_JSON}")
if os.path.exists(os.path.dirname(PUBLIC_JSON)):
    print(f"  {PUBLIC_JSON}")
