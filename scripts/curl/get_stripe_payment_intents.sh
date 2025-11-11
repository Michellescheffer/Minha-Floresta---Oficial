#!/usr/bin/env bash
set -euo pipefail

# Usage:
#   chmod +x scripts/curl/get_stripe_payment_intents.sh
#   ./scripts/curl/get_stripe_payment_intents.sh [limit]
#
# It will try to read env from:
#   1) existing environment variables
#   2) .env.local, .env, or config/env/dev.supabase.stripe.env
#
# Default limit = 5

LIMIT=${1:-5}

# Try to load from environment first
APIKEY=${VITE_SUPABASE_ANON_KEY:-${SUPABASE_ANON_KEY:-}}
SB_URL_ENV=${SUPABASE_URL:-}
VITE_SB_URL_ENV=${VITE_SUPABASE_URL:-}

# If not present, try to read from local env files
if [ -z "${APIKEY}" ] || [ -z "${SB_URL_ENV}${VITE_SB_URL_ENV}" ]; then
  for f in ".env.local" ".env" "config/env/dev.supabase.stripe.env"; do
    if [ -f "$f" ]; then
      if [ -z "${APIKEY}" ]; then
        APIKEY=$(grep -E '^VITE_SUPABASE_ANON_KEY=' "$f" | tail -n1 | cut -d'=' -f2- | tr -d '"' || true)
      fi
      if [ -z "${VITE_SB_URL_ENV}" ]; then
        VITE_SB_URL_ENV=$(grep -E '^VITE_SUPABASE_URL=' "$f" | tail -n1 | cut -d'=' -f2- | tr -d '"' || true)
      fi
      if [ -z "${SB_URL_ENV}" ]; then
        SB_URL_ENV=$(grep -E '^SUPABASE_URL=' "$f" | tail -n1 | cut -d'=' -f2- | tr -d '"' || true)
      fi
    fi
  done
fi

# Decide final Supabase URL (prefer explicit SUPABASE_URL, then VITE_SUPABASE_URL, fallback to project URL)
SUPABASE_URL=${SB_URL_ENV:-${VITE_SB_URL_ENV:-https://ngnybwsovjignsflrhyr.supabase.co}}

if [ -z "${APIKEY}" ]; then
  echo "Missing anon key. Set VITE_SUPABASE_ANON_KEY/SUPABASE_ANON_KEY in env or .env.local/.env/config/env/dev.supabase.stripe.env" >&2
  exit 1
fi

curl -s "${SUPABASE_URL}/rest/v1/stripe_payment_intents?select=*&order=created_at.desc&limit=${LIMIT}" \
  -H "apikey: ${APIKEY}" \
  -H "Authorization: Bearer ${APIKEY}" | ${JQ_BIN:-jq} '.' 2>/dev/null || true
