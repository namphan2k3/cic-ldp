#!/usr/bin/env bash
set -euo pipefail

if [ $# -lt 1 ]; then
  echo "Usage: ./restore.sh <path-to-dump-file.dump>"
  exit 1
fi

DUMP_FILE="$1"
if [ ! -f "$DUMP_FILE" ]; then
  echo "Error: Dump file not found: $DUMP_FILE"
  exit 1
fi

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
echo "[1/3] Creating pre-restore safety backup..."
"$SCRIPT_DIR/backup.sh"

echo "[2/3] Copying dump into supabase-db and restoring..."
docker cp "$DUMP_FILE" supabase-db:/tmp/restore_target.dump
docker exec supabase-db pg_restore -U postgres -d postgres --clean --if-exists --no-owner --no-privileges /tmp/restore_target.dump
docker exec supabase-db rm -f /tmp/restore_target.dump

echo "[3/3] Reloading PostgREST schema cache..."
docker exec supabase-db psql -U postgres -d postgres -c "NOTIFY pgrst, 'reload schema';"
echo "Restore completed successfully!"
