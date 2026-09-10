#!/usr/bin/env bash
# ============================================================
# M-Pesa Sandbox Testing Script — Gilani AI
# ============================================================
# IMPORTANT: The script MUST go through /api/mpesa/initiate so the
# payments row is created in Supabase before the callback fires.
# Two modes:
#   1. App mode  — uses your live /api/mpesa/initiate (needs a
#                  Supabase session Bearer token). RECOMMENDED.
#   2. Direct mode — inserts the row via Supabase REST API using
#                    the service role key, then fires Safaricom STK.
# ============================================================

set -euo pipefail

RED='\033[0;31m'; GREEN='\033[0;32m'; YELLOW='\033[1;33m'
CYAN='\033[0;36m'; BOLD='\033[1m'; RESET='\033[0m'

ok()   { echo -e "${GREEN}✅ $*${RESET}"; }
fail() { echo -e "${RED}❌ $*${RESET}"; exit 1; }
info() { echo -e "${CYAN}ℹ  $*${RESET}"; }
warn() { echo -e "${YELLOW}⚠  $*${RESET}"; }
step() { echo -e "\n${BOLD}━━━ $* ━━━${RESET}"; }

# ── Load .env ─────────────────────────────────────────────────
if [ -f ".env" ]; then
  set -a
  source <(grep -v '^\s*#' .env | grep -v '^\s*$')
  set +a
  info "Loaded .env"
else
  warn ".env not found — using environment variables"
fi

# ── Config ────────────────────────────────────────────────────
MPESA_BASE="https://sandbox.safaricom.co.ke"
CONSUMER_KEY="${MPESA_CONSUMER_KEY:-}"
CONSUMER_SECRET="${MPESA_CONSUMER_SECRET:-}"
SHORTCODE="${MPESA_SHORTCODE:-174379}"
PASSKEY="${MPESA_PASSKEY:-bfb279f9aa9bdbcf158e97dd71a467cd2e0c893059b10f78e6b72ada1ed2c919}"
CALLBACK_SECRET="${MPESA_CALLBACK_SECRET:-}"
APP_URL="${APP_URL:-https://gilaniai.site}"
SUPABASE_URL="${SUPABASE_URL:-}"
SUPABASE_SERVICE_ROLE_KEY="${SUPABASE_SERVICE_ROLE_KEY:-}"

# ── Prompt for missing creds ──────────────────────────────────
[ -z "$CONSUMER_KEY" ]    && read -rp  "MPESA_CONSUMER_KEY: "    CONSUMER_KEY
[ -z "$CONSUMER_SECRET" ] && read -rsp "MPESA_CONSUMER_SECRET: " CONSUMER_SECRET && echo
[ -z "$CALLBACK_SECRET" ] && read -rp  "MPESA_CALLBACK_SECRET (the one set in Vercel): " CALLBACK_SECRET

echo ""
echo -e "${BOLD}══════════════════════════════════════════════════${RESET}"
echo -e "${BOLD}     M-Pesa Sandbox → $APP_URL${RESET}"
echo -e "${BOLD}══════════════════════════════════════════════════${RESET}"
echo ""

# ── Mode selection ────────────────────────────────────────────
echo -e "${BOLD}Choose test mode:${RESET}"
echo "  1) App mode     — call /api/mpesa/initiate with a session token (recommended)"
echo "  2) Direct mode  — insert DB row via Supabase service role key, bypass auth"
echo ""
read -rp "Mode [1/2, default 2]: " MODE
MODE="${MODE:-2}"

read -rp "Test phone number [default: 254708374149]: " TEST_PHONE
TEST_PHONE="${TEST_PHONE:-254708374149}"
read -rp "Amount in KES [default: 1]: " TEST_AMOUNT
TEST_AMOUNT="${TEST_AMOUNT:-1}"
read -rp "Plan [pro/topup, default: pro]: " TEST_PLAN
TEST_PLAN="${TEST_PLAN:-pro}"

CHECKOUT_ID=""
USER_ID=""

# ════════════════════════════════════════════════════════════════
# MODE 1: Use the app's /api/mpesa/initiate endpoint
# ════════════════════════════════════════════════════════════════
if [ "$MODE" = "1" ]; then
  step "MODE 1 — Call /api/mpesa/initiate"
  echo ""
  echo "Get your session token from the browser:"
  echo "  → Open DevTools → Application → Local Storage → supabase.auth.token"
  echo "  → Copy the 'access_token' value"
  echo ""
  read -rp "Paste your Supabase session Bearer token: " SESSION_TOKEN

  info "Calling ${APP_URL}/api/mpesa/initiate ..."
  INITIATE_RESPONSE=$(curl -s -X POST "${APP_URL}/api/mpesa/initiate" \
    -H "Authorization: Bearer ${SESSION_TOKEN}" \
    -H "Content-Type: application/json" \
    -d "{\"phone\": \"${TEST_PHONE}\", \"plan\": \"${TEST_PLAN}\", \"amount\": ${TEST_AMOUNT}}")

  echo "Response: $INITIATE_RESPONSE"

  CHECKOUT_ID=$(echo "$INITIATE_RESPONSE" | grep -o '"checkoutRequestId":"[^"]*"' | cut -d'"' -f4)
  if [ -z "$CHECKOUT_ID" ]; then
    fail "initiate failed — no checkoutRequestId in response. Check the error above."
  fi
  ok "Payment row created. CheckoutRequestID: $CHECKOUT_ID"

# ════════════════════════════════════════════════════════════════
# MODE 2: Direct — get Safaricom token, STK push, insert DB row
# ════════════════════════════════════════════════════════════════
else
  step "MODE 2 — Direct Safaricom + Supabase insert"

  # 2a. Get Safaricom OAuth token
  step "2a. Get Safaricom OAuth token"
  AUTH=$(echo -n "$CONSUMER_KEY:$CONSUMER_SECRET" | base64 -w 0)
  TOKEN_RESPONSE=$(curl -s "$MPESA_BASE/oauth/v1/generate?grant_type=client_credentials" \
    -H "Authorization: Basic $AUTH")
  echo "Daraja response: $TOKEN_RESPONSE"
  ACCESS_TOKEN=$(echo "$TOKEN_RESPONSE" | grep -o '"access_token":"[^"]*"' | cut -d'"' -f4)
  [ -z "$ACCESS_TOKEN" ] && fail "Failed to get Daraja token — check Consumer Key/Secret"
  ok "Token: ${ACCESS_TOKEN:0:20}..."

  # 2b. STK Push
  step "2b. STK Push to Safaricom sandbox"
  TIMESTAMP=$(date +"%Y%m%d%H%M%S")
  PASSWORD=$(echo -n "${SHORTCODE}${PASSKEY}${TIMESTAMP}" | base64 -w 0)
  CALLBACK_URL="${APP_URL}/api/mpesa/callback?token=${CALLBACK_SECRET}"

  STK_RESPONSE=$(curl -s -X POST "$MPESA_BASE/mpesa/stkpush/v1/processrequest" \
    -H "Authorization: Bearer $ACCESS_TOKEN" \
    -H "Content-Type: application/json" \
    -d "{
      \"BusinessShortCode\": \"$SHORTCODE\",
      \"Password\": \"$PASSWORD\",
      \"Timestamp\": \"$TIMESTAMP\",
      \"TransactionType\": \"CustomerPayBillOnline\",
      \"Amount\": $TEST_AMOUNT,
      \"PartyA\": \"$TEST_PHONE\",
      \"PartyB\": \"$SHORTCODE\",
      \"PhoneNumber\": \"$TEST_PHONE\",
      \"CallBackURL\": \"$CALLBACK_URL\",
      \"AccountReference\": \"GILANI_${TEST_PLAN^^}_SANDBOX\",
      \"TransactionDesc\": \"Gilani AI ${TEST_PLAN} Plan Test\"
    }")

  echo "STK response: $STK_RESPONSE"
  CHECKOUT_ID=$(echo "$STK_RESPONSE" | grep -o '"CheckoutRequestID":"[^"]*"' | cut -d'"' -f4)
  RESPONSE_CODE=$(echo "$STK_RESPONSE" | grep -o '"ResponseCode":"[^"]*"' | cut -d'"' -f4)
  [ "$RESPONSE_CODE" != "0" ] && fail "STK Push failed — see response above"
  ok "STK accepted. CheckoutRequestID: $CHECKOUT_ID"

  # 2c. Insert pending payment row in Supabase
  step "2c. Insert pending payment row in Supabase"

  if [ -z "$SUPABASE_URL" ] || [ -z "$SUPABASE_SERVICE_ROLE_KEY" ]; then
    echo ""
    warn "SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY not in .env"
    echo "Add them to .env to auto-insert the payments row, OR enter them now:"
    read -rp "SUPABASE_URL (e.g. https://xxx.supabase.co): " SUPABASE_URL
    read -rsp "SUPABASE_SERVICE_ROLE_KEY: " SUPABASE_SERVICE_ROLE_KEY; echo
  fi

  # We need a real user_id. Fetch first user from auth.users via admin API.
  echo ""
  warn "Which user_id should own this test payment?"
  echo "  a) Enter a UUID directly (copy from Supabase → Authentication → Users)"
  echo "  b) Fetch the first user via service role key"
  read -rp "Choice [a/b, default a]: " UID_CHOICE
  UID_CHOICE="${UID_CHOICE:-a}"

  if [ "$UID_CHOICE" = "b" ]; then
    USER_RESP=$(curl -s "${SUPABASE_URL}/auth/v1/admin/users?per_page=1" \
      -H "apikey: ${SUPABASE_SERVICE_ROLE_KEY}" \
      -H "Authorization: Bearer ${SUPABASE_SERVICE_ROLE_KEY}")
    USER_ID=$(echo "$USER_RESP" | grep -o '"id":"[^"]*"' | head -1 | cut -d'"' -f4)
    info "Using user_id: $USER_ID"
  else
    read -rp "Paste user UUID: " USER_ID
  fi

  [ -z "$USER_ID" ] && fail "user_id is required to insert a payment row"

  INSERT_RESP=$(curl -s -o /tmp/sb_insert.txt -w "%{http_code}" \
    -X POST "${SUPABASE_URL}/rest/v1/payments" \
    -H "apikey: ${SUPABASE_SERVICE_ROLE_KEY}" \
    -H "Authorization: Bearer ${SUPABASE_SERVICE_ROLE_KEY}" \
    -H "Content-Type: application/json" \
    -H "Prefer: return=representation" \
    -d "{
      \"user_id\": \"${USER_ID}\",
      \"phone_number\": \"${TEST_PHONE}\",
      \"amount\": ${TEST_AMOUNT},
      \"plan\": \"${TEST_PLAN}\",
      \"checkout_request_id\": \"${CHECKOUT_ID}\",
      \"status\": \"pending\"
    }")

  INSERT_BODY=$(cat /tmp/sb_insert.txt)
  echo "HTTP: $INSERT_RESP | Body: $INSERT_BODY"

  if [[ "$INSERT_RESP" =~ ^2 ]]; then
    ok "Pending payment row inserted in Supabase ✓"
  else
    fail "Failed to insert payment row (HTTP $INSERT_RESP). Check your service role key and Supabase URL."
  fi
fi

# ════════════════════════════════════════════════════════════════
# STEP 3: Simulate Safaricom callback
# ════════════════════════════════════════════════════════════════
step "STEP 3 — Simulate Safaricom callback → ${APP_URL}"

FAKE_RECEIPT="MXX$(date +%s | tail -c 7)"
FAKE_DATE=$(date +%Y%m%d%H%M%S)
CALLBACK_URL="${APP_URL}/api/mpesa/callback?token=${CALLBACK_SECRET}"

CALLBACK_PAYLOAD=$(cat <<EOF
{
  "Body": {
    "stkCallback": {
      "MerchantRequestID": "sandbox-$(date +%s)",
      "CheckoutRequestID": "$CHECKOUT_ID",
      "ResultCode": 0,
      "ResultDesc": "The service request is processed successfully.",
      "CallbackMetadata": {
        "Item": [
          { "Name": "Amount", "Value": $TEST_AMOUNT },
          { "Name": "MpesaReceiptNumber", "Value": "$FAKE_RECEIPT" },
          { "Name": "TransactionDate", "Value": $FAKE_DATE },
          { "Name": "PhoneNumber", "Value": $TEST_PHONE }
        ]
      }
    }
  }
}
EOF
)

echo ""
echo -e "${YELLOW}Payload:${RESET}"
echo "$CALLBACK_PAYLOAD" | python3 -m json.tool 2>/dev/null || echo "$CALLBACK_PAYLOAD"
echo ""

HTTP_CODE=$(curl -s -o /tmp/mpesa_cb_resp.txt -w "%{http_code}" \
  -X POST "$CALLBACK_URL" \
  -H "Content-Type: application/json" \
  -d "$CALLBACK_PAYLOAD")

BODY=$(cat /tmp/mpesa_cb_resp.txt 2>/dev/null || echo "")
echo "HTTP Status : $HTTP_CODE"
echo "Response    : $BODY"

if [ "$HTTP_CODE" = "200" ]; then
  ok "Callback accepted (HTTP 200)"
else
  fail "Unexpected HTTP $HTTP_CODE — check Vercel function logs"
fi

# ════════════════════════════════════════════════════════════════
# STEP 4: Verify in Supabase
# ════════════════════════════════════════════════════════════════
step "STEP 4 — Verify payment row in Supabase"

if [ -n "$SUPABASE_URL" ] && [ -n "$SUPABASE_SERVICE_ROLE_KEY" ]; then
  sleep 1  # give the serverless function a moment
  VERIFY_RESP=$(curl -s \
    "${SUPABASE_URL}/rest/v1/payments?checkout_request_id=eq.${CHECKOUT_ID}&select=id,status,mpesa_receipt,plan,amount" \
    -H "apikey: ${SUPABASE_SERVICE_ROLE_KEY}" \
    -H "Authorization: Bearer ${SUPABASE_SERVICE_ROLE_KEY}")
  echo "Row: $VERIFY_RESP"

  STATUS=$(echo "$VERIFY_RESP" | grep -o '"status":"[^"]*"' | cut -d'"' -f4)
  RECEIPT=$(echo "$VERIFY_RESP" | grep -o '"mpesa_receipt":"[^"]*"' | cut -d'"' -f4)

  if [ "$STATUS" = "completed" ]; then
    ok "Payment row → status=completed, mpesa_receipt=$RECEIPT 🎉"
  elif [ "$STATUS" = "pending" ]; then
    warn "Payment still 'pending' — the callback may have been rejected. Check Vercel logs."
  else
    warn "Unexpected status: '${STATUS}'. Check Vercel logs."
  fi
else
  warn "Skipping DB verify — SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY not set"
  info "Check Supabase manually: payments table, checkout_request_id = $CHECKOUT_ID"
fi

# ════════════════════════════════════════════════════════════════
# Summary
# ════════════════════════════════════════════════════════════════
step "Summary"
echo ""
printf "  %-26s: %s\n" "App URL"             "$APP_URL"
printf "  %-26s: %s\n" "Phone"               "$TEST_PHONE"
printf "  %-26s: KES %s (%s)\n" "Amount"     "$TEST_AMOUNT" "$TEST_PLAN"
printf "  %-26s: %s\n" "CheckoutRequestID"   "$CHECKOUT_ID"
printf "  %-26s: %s\n" "Fake Receipt"        "$FAKE_RECEIPT"
echo ""
info "Vercel logs: https://vercel.com/justolise/gilani/logs"
info "Supabase:    check payments + profiles tables"
echo ""
ok "Done! 🎉"
