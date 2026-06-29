#!/bin/sh
set -e

cd /app

if [ "$(id -u)" = "0" ]; then
  mkdir -p /app/storage
  chown -R nextjs:nodejs /app/storage
  exec su-exec nextjs "$0"
fi

RUNTIME_ENV_FILE="/app/storage/.runtime-env"

if [ -f "$RUNTIME_ENV_FILE" ]; then
  # shellcheck disable=SC1090
  . "$RUNTIME_ENV_FILE"
  export NEXTAUTH_SECRET STORAGE_ENCRYPTION_KEY
fi

persist_runtime_env() {
  mkdir -p /app/storage
  {
    printf 'NEXTAUTH_SECRET=%s\n' "$NEXTAUTH_SECRET"
    printf 'STORAGE_ENCRYPTION_KEY=%s\n' "$STORAGE_ENCRYPTION_KEY"
  } > "$RUNTIME_ENV_FILE"
  chmod 600 "$RUNTIME_ENV_FILE"
}

if [ -z "$NEXTAUTH_SECRET" ]; then
  export NEXTAUTH_SECRET="$(openssl rand -base64 32)"
fi

if [ -z "$STORAGE_ENCRYPTION_KEY" ]; then
  if [ -n "$STORAGE_ENCRYPTION_KEY_SEED" ]; then
    export STORAGE_ENCRYPTION_KEY="$(printf '%s' "$STORAGE_ENCRYPTION_KEY_SEED" | openssl dgst -sha256 -binary | openssl base64 -A)"
  else
    export STORAGE_ENCRYPTION_KEY="$(openssl rand -base64 32)"
  fi
fi

export NEXTAUTH_SECRET STORAGE_ENCRYPTION_KEY
persist_runtime_env

if [ -z "$NEXTAUTH_URL" ] && [ -n "$LAZYCAT_APP_PUBLIC_URL" ]; then
  export NEXTAUTH_URL="$LAZYCAT_APP_PUBLIC_URL"
fi

echo "[lawlink] Running database migrations..."
npx prisma migrate deploy

if [ "${SEED_ON_START:-1}" = "1" ]; then
  echo "[lawlink] Seeding database (idempotent)..."
  npx prisma db seed || echo "[lawlink] Seed skipped or partial (may already exist)"
fi

echo "[lawlink] Starting Next.js..."
exec npm run start
