#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PLATFORM_ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"

echo "[1/3] Starting Supabase Self-Host stack..."
docker compose -f "$SCRIPT_DIR/supabase/docker-compose.yml" up -d

echo "[2/3] Waiting for PostgreSQL health check..."
until docker exec supabase-db pg_isready -U postgres -d postgres >/dev/null 2>&1; do
  sleep 2
done

echo "[3/3] Starting CIC Platform Apps (landing-hub, data-hub, sync-worker, nginx)..."
docker compose -f "$SCRIPT_DIR/docker-compose.apps.yml" up -d

echo "All services started!"
