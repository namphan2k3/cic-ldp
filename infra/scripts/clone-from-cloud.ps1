$ErrorActionPreference = "Stop"

$cicWebEnvLocal = "d:\web-data\cic-web\.env.local"
$cicWebEnvCloud = "d:\web-data\cic-web\.env.cloud"
$backupDir = "d:\web-data\cic-platform\infra\supabase\backups"

if (-not (Test-Path $backupDir)) {
    New-Item -ItemType Directory -Path $backupDir -Force | Out-Null
}

# Preserve cloud .env backup if not already saved
if (-not (Test-Path $cicWebEnvCloud) -and (Test-Path $cicWebEnvLocal)) {
    $localContent = Get-Content $cicWebEnvLocal -Raw -Encoding UTF8
    if ($localContent -match "supabase\.co") {
        Copy-Item $cicWebEnvLocal $cicWebEnvCloud -Force
        Write-Host "[OK] Backed up cloud configuration to $cicWebEnvCloud"
    }
}

$sourceEnvFile = if (Test-Path $cicWebEnvCloud) { $cicWebEnvCloud } else { $cicWebEnvLocal }
$dbLine = Get-Content $sourceEnvFile | Where-Object { $_ -match '^\s*DATABASE_URL\s*=' } | Select-Object -First 1
if (-not $dbLine) {
    throw "DATABASE_URL not found in $sourceEnvFile"
}
$cloudUrl = ($dbLine -replace '^\s*DATABASE_URL\s*=\s*', '').Trim().Trim('"').Trim("'")

Write-Host "[1/4] Dumping auth.users from Supabase Cloud..."
$authSqlFile = Join-Path $backupDir "cloud_auth_users.sql"
$authQuery = @"
SELECT format(
  'INSERT INTO auth.users (id, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, role, created_at, updated_at) VALUES (%L, %L, %L, %L, %L::jsonb, %L::jsonb, %L, %L, %L) ON CONFLICT (id) DO UPDATE SET email = EXCLUDED.email, encrypted_password = EXCLUDED.encrypted_password, raw_app_meta_data = EXCLUDED.raw_app_meta_data, raw_user_meta_data = EXCLUDED.raw_user_meta_data;',
  id, email, encrypted_password, email_confirmed_at, raw_app_meta_data::text, raw_user_meta_data::text, role, created_at, updated_at
) FROM auth.users;
"@
psql "$cloudUrl" -At -c $authQuery | Set-Content -Path $authSqlFile -Encoding UTF8
Get-Content $authSqlFile -Raw -Encoding UTF8 | docker exec -i supabase-db psql -U postgres -d postgres -v ON_ERROR_STOP=1 | Out-Null

Write-Host "[2/4] Dumping public schema (89 tables + data) from Supabase Cloud..."
$rawDumpFile = Join-Path $backupDir "cloud_public_raw.sql"
$cleanDumpFile = Join-Path $backupDir "cloud_public_clean.sql"

pg_dump "$cloudUrl" --schema=public --no-owner --no-privileges --clean --if-exists -f $rawDumpFile
if ($LASTEXITCODE -ne 0) {
    throw "pg_dump from cloud failed with exit code $LASTEXITCODE"
}

# Normalize PG17/18 specific SET statements for Postgres 15 compatibility
$dumpText = [System.IO.File]::ReadAllText($rawDumpFile, [System.Text.Encoding]::UTF8)
$dumpText = $dumpText -replace '(?m)^SET transaction_timeout = .*;\r?\n?', ''
$dumpText = $dumpText -replace '(?m)^DROP SCHEMA IF EXISTS public;\r?\n?', ''
$dumpText = $dumpText -replace '(?m)^CREATE SCHEMA public;\r?\n?', 'CREATE SCHEMA IF NOT EXISTS public;'
[System.IO.File]::WriteAllText($cleanDumpFile, $dumpText, (New-Object System.Text.UTF8Encoding($false)))

Write-Host "[3/4] Restoring public schema & data into local self-hosted supabase-db..."
docker cp $cleanDumpFile supabase-db:/tmp/cloud_public_clean.sql
docker exec supabase-db psql -U postgres -d postgres -v ON_ERROR_STOP=1 -f /tmp/cloud_public_clean.sql | Out-Null
if ($LASTEXITCODE -ne 0) {
    throw "psql restore into local supabase-db failed"
}

$grantSql = @"
GRANT USAGE ON SCHEMA public TO postgres, anon, authenticated, service_role, supabase_admin;
GRANT ALL ON ALL TABLES IN SCHEMA public TO postgres, service_role, supabase_admin;
GRANT SELECT ON ALL TABLES IN SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO postgres, anon, authenticated, service_role, supabase_admin;
GRANT ALL ON ALL FUNCTIONS IN SCHEMA public TO postgres, anon, authenticated, service_role, supabase_admin;
NOTIFY pgrst, 'reload schema';
"@
$grantSql | docker exec -i supabase-db psql -U postgres -d postgres -v ON_ERROR_STOP=1 | Out-Null

Write-Host "[4/4] Verifying table count and key row counts on local self-host..."
$tableCount = docker exec supabase-db psql -U postgres -d postgres -At -c "SELECT count(*) FROM information_schema.tables WHERE table_schema='public' AND table_type='BASE TABLE';"
$authCount = docker exec supabase-db psql -U postgres -d postgres -At -c "SELECT count(*) FROM auth.users;"
$summary = docker exec supabase-db psql -U postgres -d postgres -At -c "SELECT 'cic_products='||count(*) FROM cic_products UNION ALL SELECT 'cic_news='||count(*) FROM cic_news UNION ALL SELECT 'cic_forms='||count(*) FROM cic_forms UNION ALL SELECT 'cic_users='||count(*) FROM cic_users;"

Write-Host "=========================================="
Write-Host "Public tables cloned : $tableCount"
Write-Host "auth.users cloned    : $authCount"
Write-Host ($summary -join " | ")
Write-Host "=========================================="
