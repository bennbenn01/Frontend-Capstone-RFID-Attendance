#!/bin/bash
set -euo pipefail

count=0
ENVIRONMENTS=("production")  # you can add more: preview, development, etc.

echo "🚀 Syncing .env variables to Vercel..."

while IFS= read -r line || [ -n "$line" ]; do
  [[ -z "$line" || "$line" =~ ^# ]] && continue

  key="${line%%=*}"
  value="${line#*=}"
  clean_value=$(echo "$value" | sed 's/^"\(.*\)"$/\1/')

  echo "🔄 Syncing $key=***hidden***"

  for env in "${ENVIRONMENTS[@]}"; do
    existing_keys=$(vercel env ls "$env" | tail -n +3 | awk '{print $1}')

    if echo "$existing_keys" | grep -qx "$key"; then
      vercel env rm "$key" "$env" --yes >/dev/null
      printf "%s" "$clean_value" | vercel env add "$key" "$env" >/dev/null
      echo "✅ Updated $key in $env"
    else
      printf "%s" "$clean_value" | vercel env add "$key" "$env" >/dev/null
      echo "✅ Added $key to $env"
    fi
  done

  ((count++))
done < .env.production

echo ""
echo "🎉 Done! Synced $count environment variables to all Vercel environments."
exit 0