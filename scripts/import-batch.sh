#!/bin/bash
# Bulk-import 1688 listings, paced so the anti-bot flag does not trip.
#
# 1688 rate-limits by IP after a burst of requests and the flag can take 45+
# minutes to clear, so this waits for a clear signal before starting and leaves
# a gap between listings rather than hammering.
#
#   scripts/import-batch.sh urls.txt
set -u
cd "$(dirname "$0")/.."

URLS_FILE="${1:?usage: import-batch.sh <file with one url per line>}"
GAP="${GAP:-75}"
UA="Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0 Safari/537.36"
PROBE="https://detail.1688.com/offer/1057887564978.html"

clear_to_go() {
  local sz
  sz=$(curl -s -A "$UA" -H "Accept-Language: zh-CN,zh;q=0.9" \
       -H "Referer: https://www.1688.com/" --max-time 25 -o /tmp/probe.html -w "%{size_download}" "$PROBE")
  [ "${sz:-0}" -gt 50000 ]
}

wait_until_clear() {
  local n=0
  until clear_to_go; do
    n=$((n + 1))
    [ $((n % 4)) -eq 0 ] && echo "  …still rate limited after $((n * 60))s"
    [ "$n" -ge 60 ] && { echo "  gave up waiting after an hour"; return 1; }
    sleep 60
  done
  return 0
}

# macOS ships bash 3.2, which has no mapfile — read the list portably.
URLS=""
while IFS= read -r line; do
  case "$line" in ""|\#*) continue ;; esac
  URLS="$URLS$line
"
done < "$URLS_FILE"
TOTAL=$(printf "%s" "$URLS" | grep -c .)
echo "$TOTAL listings to import"
echo

ok=0; failed=0; i=0
FAILURES=""
while IFS= read -r url; do
  [ -z "$url" ] && continue
  i=$((i + 1))
  echo "[$i/$TOTAL] $url"

  if ! wait_until_clear; then FAILURES="$FAILURES  rate limited: $url
"; failed=$((failed + 1)); continue; fi

  if out=$(npm run import --silent -- "$url" --model j7 --category interior 2>&1); then
    echo "$out" | grep -E "^\s+¥|Saved as|warning:" | sed 's/^/    /'
    ok=$((ok + 1))
  else
    echo "    FAILED"
    echo "$out" | tail -3 | sed 's/^/    /'
    FAILURES="$FAILURES  failed: $url
"
    failed=$((failed + 1))
  fi

  [ "$i" -lt "$TOTAL" ] && { echo "    pausing ${GAP}s"; sleep "$GAP"; }
  echo
done <<EOF
$URLS
EOF

echo "──────────────────────────────"
echo "imported: $ok    failed: $failed"
[ -n "$FAILURES" ] && printf "%s" "$FAILURES"
