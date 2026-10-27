#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
BACKUP_DIR="${BACKUP_STORAGE_DIR:-$SCRIPT_DIR/../supabase/backups/db}"
mkdir -p "$BACKUP_DIR"

TIMESTAMP="$(date +%Y%m%d_%H%M%S)"
OUT_FILE="$BACKUP_DIR/cic_postgres_${TIMESTAMP}.dump"

echo "Creating full PostgreSQL custom-format dump at $OUT_FILE ..."
docker exec supabase-db pg_dump -U postgres -d postgres -Fc -f "/tmp/cic_postgres_${TIMESTAMP}.dump"
docker cp "supabase-db:/tmp/cic_postgres_${TIMESTAMP}.dump" "$OUT_FILE"
docker exec supabase-db rm -f "/tmp/cic_postgres_${TIMESTAMP}.dump"

SHA256="$(sha256sum "$OUT_FILE" | awk '{print $1}')"
echo "Backup complete: $OUT_FILE (SHA256: $SHA256)"
