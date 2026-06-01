#!/usr/bin/env python3
"""
重建 course.json，确保 JSON 语法永远正确。
用法：python3 regenerate-course-json.py
"""
import json, os

SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
COURSE_JSON = os.path.join(SCRIPT_DIR, "course.json")
PUBLIC_JSON = os.path.join(SCRIPT_DIR, "presentation", "public", "course.json")

# 从现有有效的 course.json 读取（如果已损坏，则回退到最后一个备份）
try:
    with open(COURSE_JSON) as f:
        course = json.load(f)
    print(f"✓ 已读取 course.json ({len(course['sections'])} sections)")
except (json.JSONDecodeError, FileNotFoundError):
    print("⚠ course.json 已损坏，请手动修复后再运行此脚本")
    exit(1)

# 以统一格式重写
with open(COURSE_JSON, "w") as f:
    json.dump(course, f, ensure_ascii=False, indent=2)
    f.write("\n")

with open(PUBLIC_JSON, "w") as f:
    json.dump(course, f, ensure_ascii=False, indent=2)
    f.write("\n")

# 重新验证
json.load(open(COURSE_JSON))
json.load(open(PUBLIC_JSON))
total = sum(len(seg["chapters"]) for s in course["sections"] for seg in s["segments"])
print(f"✓ 重写完成: {len(course['sections'])} sections, {total} chapters")
print(f"  {COURSE_JSON}")
print(f"  {PUBLIC_JSON}")
