# So sánh kết quả GHI/SỬA/XOÁ dữ liệu (model-write-test.php) giữa MySQL gốc và Postgres.
# Lỗi xuất hiện ở CẢ HAI là lỗi sẵn có của code/bài test (không do chuyển DB) -> chỉ báo lỗi riêng của Postgres.
param([string]$App = 'all')
$apps = @(
  @{ name = 'nghenoithat'; container = 'cic-legacy-nghenoithat'; mysqlDb = 'nghenoithat' },
  @{ name = 'vietnambim';  container = 'cic-legacy-vietnambim';  mysqlDb = 'vietnambim' },
  @{ name = 'netzero-app'; container = 'cic-legacy-netzero-app'; mysqlDb = 'netzero' }
) | Where-Object { $App -eq 'all' -or $_.name -eq $App }
$script = Join-Path $PSScriptRoot 'model-write-test.php'
$fail = 0
foreach ($a in $apps) {
  docker cp $script "$($a.container):/tmp/model-write-test.php" | Out-Null
  $pg = docker exec -u www-data $a.container php /tmp/model-write-test.php /var/www/html 2>&1
  $my = docker exec -u www-data -e DB_CONNECTION=mysql -e DB_HOST=host.docker.internal -e DB_PORT=33306 `
        -e DB_DATABASE=$($a.mysqlDb) -e DB_USERNAME=root -e DB_PASSWORD=staging_root `
        $a.container php /tmp/model-write-test.php /var/www/html 2>&1
  $key = { param($l) if ($l -match '^\[(OK|ERR)\]\s+(\S+)') { $Matches[2] } }
  $pgErr = @{}; $myErr = @{}; $okCount = 0
  foreach ($l in $pg) { $k = & $key $l; if ($k) { if ($l -like '`[ERR`]*') { $pgErr[$k] = $l } else { $okCount++ } } }
  foreach ($l in $my) { $k = & $key $l; if ($k -and $l -like '`[ERR`]*') { $myErr[$k] = $l } }
  $onlyPg = @($pgErr.Keys | Where-Object { -not $myErr.ContainsKey($_) })
  Write-Host ("===== {0}: {1} bảng ghi/sửa/xoá OK trên Postgres; {2} lỗi chung với MySQL (lỗi sẵn có); {3} lỗi CHỈ có trên Postgres" -f $a.name, $okCount, ($pgErr.Count - $onlyPg.Count), $onlyPg.Count)
  foreach ($k in $onlyPg) { Write-Host "  $($pgErr[$k])" -ForegroundColor Yellow }
  $fail += $onlyPg.Count
}
if ($fail -gt 0) { exit 1 }
