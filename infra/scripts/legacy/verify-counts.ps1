# So sĂ¡nh sá»‘ dĂ²ng tá»«ng báº£ng: MySQL staging <-> Postgres (schema legacy)
# DĂ¹ng: powershell -File infra/scripts/legacy/verify-counts.ps1
$ErrorActionPreference = 'Continue'
$map = @(
  @{ mysql = 'nghenoithat'; pg = 'nghenoithat' },
  @{ mysql = 'vietnambim';  pg = 'vietnambim' },
  @{ mysql = 'netzero';     pg = 'netzero_app' }
)
$allOk = $true
foreach ($m in $map) {
  $tables = docker exec -e MYSQL_PWD=staging_root cic-mysql-staging mysql -uroot -N -e "SELECT table_name FROM information_schema.tables WHERE table_schema='$($m.mysql)' AND table_type='BASE TABLE' ORDER BY 1" 2>$null
  $mysqlSql = ($tables | ForEach-Object { "SELECT '$_', COUNT(*) FROM ``$($m.mysql)``.``$_``" }) -join ' UNION ALL '
  $my = @{}
  docker exec -e MYSQL_PWD=staging_root cic-mysql-staging mysql -uroot -N -e "$mysqlSql" 2>$null | ForEach-Object { $k, $v = $_ -split "`t"; $my[$k] = [int]$v }

  $pgSql = ($tables | ForEach-Object { "SELECT '$_', COUNT(*) FROM $($m.pg).""$_""" }) -join ' UNION ALL '
  $pg = @{}
  docker exec supabase-db psql -U postgres -d postgres -At -F "`t" -c "$pgSql" | ForEach-Object { $k, $v = $_ -split "`t"; $pg[$k] = [int]$v }

  $diff = @($tables | Where-Object { $my[$_] -ne $pg[$_] })
  $total = ($my.Values | Measure-Object -Sum).Sum
  if ($diff.Count -eq 0) {
    Write-Host ("[OK]   {0,-12} {1,3} báº£ng, {2,6} dĂ²ng khá»›p 100%" -f $m.pg, $tables.Count, $total)
  } else {
    $allOk = $false
    Write-Host ("[Lá»†CH] {0}: {1}" -f $m.pg, (($diff | ForEach-Object { "$_ mysql=$($my[$_]) pg=$($pg[$_])" }) -join '; '))
  }
}
if (-not $allOk) { exit 1 }
