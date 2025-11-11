#!/usr/bin/env bash
set -euo pipefail

# Usage:
#   chmod +x scripts/curl/get_stripe_payment_intents.sh
#   SUPABASE_ANON_KEY=ey... ./scripts/curl/get_stripe_payment_intents.sh [limit]
# or
#   VITE_SUPABASE_ANON_KEY=ey... ./scripts/curl/get_stripe_payment_intents.sh [limit]
#
# Default limit = 5

SUPABASE_URL=${SUPABASE_URL:-https://ngnybwsovjignsflrhyr.supabase.co}
APIKEY=${VITE_SUPABASE_ANON_KEY:-${SUPABASE_ANON_KEY:-}}
LIMIT=${1:-5}

if [ -z "${APIKEY}" ]; then
  echo "Missing anon key. Export VITE_SUPABASE_ANON_KEY or SUPABASE_ANON_KEY and retry." >&2
  exit 1
fi

curl -s "${SUPABASE_URL}/rest/v1/stripe_payment_intents?select=*&order=created_at.desc&limit=${LIMIT}" \
  -H "apikey: ${APIKEY}" \
  -H "Authorization: Bearer ${APIKEY}" | ${JQ_BIN:-jq} '.' 2>/dev/null || true
