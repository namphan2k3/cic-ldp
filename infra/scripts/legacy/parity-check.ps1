# So sánh từng route GET khi chạy trên MySQL gốc và trên Postgres (cùng code, cùng dữ liệu):
#   - mã HTTP phải giống nhau
#   - nội dung HTML (đã bỏ CSRF token, timestamp) phải giống nhau
# Cần container cic-mysql-staging đang chạy với dữ liệu gốc.
# Dùng: powershell -File infra/scripts/legacy/parity-check.ps1 [-App nghenoithat]
param([string]$App = 'all')
$apps = @(
  @{ name = 'nghenoithat'; container = 'cic-legacy-nghenoithat'; mysqlDb = 'nghenoithat'; exclude = 'admin/notification/getlist' },
  @{ name = 'vietnambim';  container = 'cic-legacy-vietnambim';  mysqlDb = 'vietnambim';  exclude = 'admin/notification/getlist' },
  @{ name = 'netzero-app'; container = 'cic-legacy-netzero-app'; mysqlDb = 'netzero';     exclude = '-' }
) | Where-Object { $App -eq 'all' -or $_.name -eq $App }

$sweep = Join-Path $PSScriptRoot 'route-sweep.php'
$fail = 0
foreach ($a in $apps) {
  docker cp $sweep "$($a.container):/tmp/route-sweep.php" | Out-Null
  $pg = docker exec -u www-data -e SWEEP_HASH=1 $a.container php -d memory_limit=1G /tmp/route-sweep.php /var/www/html - $a.exclude 2>$null
  $my = docker exec -u www-data -e SWEEP_HASH=1 -e DB_CONNECTION=mysql -e DB_HOST=host.docker.internal -e DB_PORT=33306 `
        -e DB_DATABASE=$($a.mysqlDb) -e DB_USERNAME=root -e DB_PASSWORD=staging_root `
        $a.container php -d memory_limit=1G /tmp/route-sweep.php /var/www/html - $a.exclude 2>$null
  $toMap = { param($lines) $m = [ordered]@{}; foreach ($l in $lines) { if ($l -match '^(/\S*) (\S+) (\S+)$') { $m[$Matches[1]] = "$($Matches[2]) $($Matches[3])" } }; $m }
  $pgM = & $toMap $pg; $myM = & $toMap $my
  $same = 0; $diff = @()
  foreach ($k in $myM.Keys) {
    if ($pgM[$k] -eq $myM[$k]) { $same++ } else { $diff += "  $k  mysql=[$($myM[$k])]  postgres=[$($pgM[$k])]" }
  }
  Write-Host ("===== {0}: {1}/{2} route giống hệt MySQL" -f $a.name, $same, $myM.Count)
  $diff | ForEach-Object { Write-Host $_ -ForegroundColor Yellow }
  $fail += $diff.Count
}
if ($fail -gt 0) { exit 1 }
