#!/usr/bin/env bash
# 同步根目录的课程结构化 JSON 到 public/ (vite 服务的副本)
# 用法:
#   bash <skill-path>/scripts/sync-course-json.sh
#   # 或: 在课件项目根目录跑
#
# 行为:
#   1. 智能探测项目根 (含 src/ 和 public/ 的目录)
#   2. 扫根目录所有 course*.json
#   3. 对每个文件在 public/ 下建立软链 (dev 期实时同步)
#   4. 验证所有 JSON 语法正确
#   5. 输出同步报告
#
# 设计原则:
#   - 软链而非 cp: 一处修改两处生效, 避免 dev 期忘记同步
#   - npm run build 会自动展开软链, 不影响生产部署
#   - 验证 JSON 语法: 任何语法错误立即报错, 不会让 vite 提供损坏的菜单
set -e

# 1. 智能探测项目根目录
# 从脚本所在目录向上找, 找到同时有 src/ 和 public/ 的目录
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
SEARCH_DIR="$SCRIPT_DIR"

# 如果脚本是从 skill 目录跑的, 尝试从调用栈找项目根
# 否则从 SCRIPT_DIR 向上找
PROJECT_ROOT=""

# 优先: 看调用栈 (脚本本身可能在 course-forge/ 里)
# 用户通常会从课件项目根目录跑
if [ -f "$SCRIPT_DIR/../package.json" ] && [ -d "$SCRIPT_DIR/../public" ] && [ -d "$SCRIPT_DIR/../src" ]; then
  PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
fi

# 备选: 当前 cwd
if [ -z "$PROJECT_ROOT" ] && [ -f "package.json" ] && [ -d "public" ] && [ -d "src" ]; then
  PROJECT_ROOT="$(pwd)"
fi

# 备选: 从 SCRIPT_DIR 向上找
if [ -z "$PROJECT_ROOT" ]; then
  CUR="$SCRIPT_DIR"
  while [ "$CUR" != "/" ]; do
    if [ -f "$CUR/package.json" ] && [ -d "$CUR/public" ] && [ -d "$CUR/src" ]; then
      PROJECT_ROOT="$CUR"
      break
    fi
    CUR="$(dirname "$CUR")"
  done
fi

if [ -z "$PROJECT_ROOT" ]; then
  echo "✗ Cannot locate project root (need package.json + public/ + src/)" >&2
  echo "  Run this from a courseware project root, or pass project path as first arg." >&2
  exit 1
fi

PUBLIC_DIR="$PROJECT_ROOT/public"

cd "$PROJECT_ROOT"
echo "→ Project root: $PROJECT_ROOT"
echo ""

# 2. 找所有 course*.json
shopt -s nullglob
COURSE_FILES=(course*.json)

if [ ${#COURSE_FILES[@]} -eq 0 ]; then
  echo "✗ No course*.json found in $PROJECT_ROOT" >&2
  exit 1
fi

echo "→ Found ${#COURSE_FILES[@]} json file(s): ${COURSE_FILES[*]}"
echo ""

# 3. 对每个文件: 验证 JSON + 软链到 public/
SYNCED=0
for f in "${COURSE_FILES[@]}"; do
  # 验证 JSON 语法
  if ! python3 -c "import json; json.load(open('$f'))" 2>/dev/null; then
    echo "✗ JSON SYNTAX ERROR: $f" >&2
    echo "  Fix the JSON syntax before sync." >&2
    exit 2
  fi
  # 软链 (覆盖已有, 幂等)
  ln -sf "../$f" "public/$f"
  echo "  ✓ Linked public/$f -> ../$f"
  SYNCED=$((SYNCED + 1))
done

echo ""
echo "→ Total: $SYNCED json file(s) synced to public/"
echo ""
echo "Verify in dev server:"
echo "  curl -s http://localhost:5174/course.json | python3 -m json.tool | head -5"
