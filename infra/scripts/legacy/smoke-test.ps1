# Smoke test các web Laravel cũ chạy trên Postgres
#  - Lấy trang chủ local, gom link nội bộ (tối đa -MaxPages), gọi từng link
#  - So sánh <title> và mã HTTP với web thật đang chạy (nếu có mạng)
#  - Liệt kê lỗi SQL trong storage/logs/laravel*.log phát sinh trong lần chạy
# Dùng: powershell -File infra/scripts/legacy/smoke-test.ps1 [-Site nghenoithat] [-MaxPages 60]
param(
  [string]$Site = 'all',
  [int]$MaxPages = 60
)
$ErrorActionPreference = 'Continue'
$root = Split-Path -Parent (Split-Path -Parent (Split-Path -Parent $PSScriptRoot))
$sites = @(
  @{ name = 'nghenoithat'; local = 'http://localhost:4310'; live = 'https://nghenoithat.vn' },
  @{ name = 'vietnambim';  local = 'http://localhost:4311'; live = 'http://vietnambim.com' },
  @{ name = 'netzero-app'; local = 'http://localhost:4312'; live = 'https://app.netzero2050.vn' }
) | Where-Object { $Site -eq 'all' -or $_.name -eq $Site }

function Get-Page([string]$url) {
  try {
    $r = Invoke-WebRequest -Uri $url -UseBasicParsing -TimeoutSec 30 -MaximumRedirection 5
    return @{ code = [int]$r.StatusCode; html = $r.Content }
  } catch {
    $code = 0
    if ($_.Exception.Response) { $code = [int]$_.Exception.Response.StatusCode }
    return @{ code = $code; html = '' }
  }
}
function Get-Title([string]$html) {
  $m = [regex]::Match($html, '<title[^>]*>(.*?)</title>', 'Singleline,IgnoreCase')
  if ($m.Success) { return ([System.Net.WebUtility]::HtmlDecode($m.Groups[1].Value) -replace '\s+', ' ').Trim() } else { return '' }
}

$overallFail = 0
foreach ($s in $sites) {
  $logDir = Join-Path $root "legacy-apps\$($s.name)\storage\logs"
  $logBefore = @{}
  Get-ChildItem $logDir -Filter 'laravel*.log' -ErrorAction SilentlyContinue | ForEach-Object { $logBefore[$_.Name] = $_.Length }

  Write-Host "`n===== $($s.name)  ($($s.local))"
  $homePage = Get-Page "$($s.local)/"
  $paths = New-Object System.Collections.Generic.List[string]
  $paths.Add('/')
  foreach ($m in [regex]::Matches($homePage.html, 'href="([^"#]+)"')) {
    $livePat = '^https?://(localhost:\d+|[^/]*' + [regex]::Escape(($s.live -replace '^https?://', '')) + ')'
    $h = $m.Groups[1].Value -replace $livePat, ''
    if ($h -match '^/(?!/)' -and $h -notmatch '\.(css|js|png|jpe?g|gif|svg|ico|webp|pdf|zip|rar|docx?|xlsx?|mp4)(\?|$)' -and -not $paths.Contains($h)) {
      $paths.Add($h)
    }
    if ($paths.Count -ge $MaxPages) { break }
  }

  $fail = 0
  foreach ($p in $paths) {
    $l = Get-Page "$($s.local)$p"
    $v = Get-Page "$($s.live)$p"
    $lt = Get-Title $l.html; $vt = Get-Title $v.html
    $ok = ($l.code -eq 200 -or ($l.code -eq $v.code -and $l.code -ne 0 -and $l.code -lt 500))
    $titleNote = if ($v.code -eq 200 -and $lt -ne $vt) { "  title khác: local='$lt' live='$vt'" } else { '' }
    if (-not $ok) { $fail++ }
    $flag = if ($ok) { 'OK ' } else { 'ERR' }
    Write-Host ("[{0}] local={1,3} live={2,3}  {3}{4}" -f $flag, $l.code, $v.code, $p, $titleNote)
  }

  # Lỗi SQL mới phát sinh
  Get-ChildItem $logDir -Filter 'laravel*.log' -ErrorAction SilentlyContinue | ForEach-Object {
    $start = if ($logBefore.ContainsKey($_.Name)) { $logBefore[$_.Name] } else { 0 }
    if ($_.Length -gt $start) {
      $fs = [IO.File]::Open($_.FullName, 'Open', 'Read', 'ReadWrite'); $fs.Seek($start, 'Begin') | Out-Null
      $txt = (New-Object IO.StreamReader($fs)).ReadToEnd(); $fs.Close()
      $errs = [regex]::Matches($txt, '(SQLSTATE\[[^\]]+\][^\r\n]{0,260})') | ForEach-Object { $_.Groups[1].Value } | Select-Object -Unique
      foreach ($e in $errs) { Write-Host "  [SQL] $e" -ForegroundColor Yellow; $fail++ }
    }
  }
  Write-Host ("----- {0}: {1} trang, {2} lỗi" -f $s.name, $paths.Count, $fail)
  $overallFail += $fail
}
if ($overallFail -gt 0) { exit 1 }
