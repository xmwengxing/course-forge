#!/usr/bin/env bash
# diagnose-tts.sh — MiniMax TTS API diagnostic tool
# 用法: source .env && bash diagnose-tts.sh
# 测试: 端点连通性、API key 有效性、Token Plan 额度、Rate Limit 状态

set -euo pipefail

API_KEY="${MINIMAX_API_KEY:-}"
if [ -z "$API_KEY" ]; then
  echo "✗ MINIMAX_API_KEY not set. source .env first." >&2
  exit 1
fi

TEST_TEXT="端点诊断测试"
API_URL="${1:-https://api.minimax.chat/v1/t2a_v2}"

echo "=== MiniMax TTS API Diagnostic ==="
echo "Endpoint: $API_URL"
echo "Key prefix: ${API_KEY:0:20}..."
echo ""

# Test 1: Connectivity
echo "[1/3] Testing endpoint connectivity..."
HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" -X POST "$API_URL" \
  -H "Authorization: Bearer $API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"model":"speech-2.8-hd","text":"'"$TEST_TEXT"'","voice_setting":{"voice_id":"Chinese_casual_instructor_vv2"}}' \
  --connect-timeout 10 --max-time 30 2>/dev/null || echo "000")
echo "  HTTP status: $HTTP_CODE"

# Test 2: API response
echo "[2/3] Testing API response..."
RESP=$(curl -s -X POST "$API_URL" \
  -H "Authorization: Bearer $API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"model":"speech-2.8-hd","text":"'"$TEST_TEXT"'","voice_setting":{"voice_id":"Chinese_casual_instructor_vv2"}}' \
  --connect-timeout 10 --max-time 30 2>/dev/null)

STATUS_CODE=$(echo "$RESP" | python3 -c "import json,sys; d=json.load(sys.stdin); print(d.get('base_resp',{}).get('status_code','unknown'))" 2>/dev/null || echo "parse_error")
STATUS_MSG=$(echo "$RESP" | python3 -c "import json,sys; d=json.load(sys.stdin); print(d.get('base_resp',{}).get('status_msg','unknown'))" 2>/dev/null || echo "parse_error")

echo "  Status code: $STATUS_CODE"
echo "  Status msg:  $STATUS_MSG"

# Test 3: Interpretation
echo "[3/3] Interpretation:"
case "$STATUS_CODE" in
  0)    echo "  ✓ 一切正常，可正常调用" ;;
  1002) echo "  ⚠ RPM rate limit — 每分钟请求超限，等待60秒后重试" ;;
  1039) echo "  ⚠ TPM rate limit — 每分钟 token 超限" ;;
  1004) echo "  ✗ API key 无效 — 请检查 MINIMAX_API_KEY" ;;
  2049) echo "  ✗ API key 无效（域名不匹配）— 尝试切换 .chat ↔ .io" ;;
  2056) echo "  ✗ Token Plan 额度已用尽或未分配 — 联系 MiniMax 客服" ;;
  2013) echo "  ✗ 参数错误 — 检查 model/voice_id" ;;
  *)    echo "  ? 未知错误码" ;;
esac
