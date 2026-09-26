#!/usr/bin/env bash
set -euo pipefail

base="${1:-http://localhost:8080}"
json='Content-Type: application/json'

echo "Cekam na API na $base ..."
for attempt in $(seq 1 60); do
  if curl -fsS "$base/api/ping" >/dev/null 2>&1; then
    break
  fi
  if [ "$attempt" -eq 60 ]; then
    echo "API se nespustilo" >&2
    exit 1
  fi
  sleep 2
done

echo "1) API pres nginx proxy"
curl -fsS "$base/api/ping"
echo

echo "2) Frontend (index.html)"
curl -fsS "$base/" | grep -q '<div id="root">'

echo "3) SPA fallback na klientske trase"
curl -fsS "$base/projects/1" | grep -q '<div id="root">'

echo "4) Registrace"
email="smoke-$(date +%s)@test.cz"
token=$(curl -fsS -X POST "$base/api/auth/register" -H "$json" \
  -d "{\"email\":\"$email\",\"password\":\"heslo1234\"}" \
  | sed -n 's/.*"accessToken":"\([^"]*\)".*/\1/p')
test -n "$token"

echo "5) Chraneny endpoint bez tokenu vraci 401"
status=$(curl -s -o /dev/null -w '%{http_code}' "$base/api/projects")
test "$status" = "401"

echo "6) Zapis a cteni z databaze"
curl -fsS -X POST "$base/api/projects" -H "$json" -H "Authorization: Bearer $token" \
  -d '{"name":"Smoke projekt"}' >/dev/null
curl -fsS "$base/api/projects" -H "Authorization: Bearer $token" | grep -q 'Smoke projekt'

echo "Smoke test v poradku"
