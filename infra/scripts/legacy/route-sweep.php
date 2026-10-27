<?php
/**
 * Route sweep: gọi nội bộ toàn bộ route GET của 1 app Laravel (kể cả trang admin)
 * với user đăng nhập sẵn (không cần mật khẩu, KHÔNG ghi dữ liệu - chỉ GET).
 * Tham số route {id}/{blog}/{slug}... được điền bằng bản ghi đầu tiên của bảng tương ứng.
 *
 * Chạy trong container:  php /tmp/route-sweep.php /var/www/html [filter]
 * In ra: mã HTTP + lỗi (exception) của từng route.
 */
$base = rtrim($argv[1] ?? '/var/www/html', '/');
$filter = $argv[2] ?? ''; if ($filter === '-') $filter = '';
$exclude = array_filter(explode(',', $argv[3] ?? ''), fn($x) => $x !== '-');
ini_set('default_socket_timeout', '10');
$GLOBALS['__current'] = '';
register_shutdown_function(function () {
    if (!empty($GLOBALS['__current'])) fwrite(STDOUT, PHP_EOL . "[EXIT] script bị dừng giữa chừng tại route: " . $GLOBALS['__current'] . " (route tự gọi exit/echo - thêm vào danh sách bỏ qua)" . PHP_EOL);
});
require $base . '/vendor/autoload.php';
$app = require $base . '/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Http\Kernel::class);

// Bootstrap bằng 1 request giả để nạp config/route
$kernel->handle(Illuminate\Http\Request::create('/__sweep_boot__', 'GET'));
$app['config']->set('app.debug', true);

use Illuminate\Support\Str;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

$db = DB::connection();
$tables = array_map(fn($r) => $r->tablename, $db->select($db->getDriverName() === 'pgsql' ? "select tablename from pg_tables where schemaname = current_schema()" : "select table_name as tablename from information_schema.tables where table_schema = database()"));
$tableSet = array_flip($tables);

function guessValue(string $param, array $tableSet, $db) {
    $p = rtrim($param, '?');
    $cands = [Str::plural(Str::snake($p)), Str::snake($p), Str::plural($p), $p,
              Str::plural(str_replace(['_id', 'Id'], '', Str::snake($p)))];
    if (in_array($p, ['id', 'slug'])) return null; // xử lý theo prefix route
    foreach ($cands as $t) {
        if (isset($tableSet[$t])) {
            $col = Str::contains($p, 'slug') ? 'slug' : 'id';
            try { $v = $db->table($t)->orderBy('id')->value($col); } catch (\Throwable $e) { $v = null; }
            if ($v !== null) return $v;
        }
    }
    return null;
}

function tableFromUri(string $uri, array $tableSet): ?string {
    foreach (array_reverse(explode('/', $uri)) as $seg) {
        if ($seg === '' || $seg[0] === '{') continue;
        foreach ([Str::snake(str_replace('-', '_', $seg)), Str::plural(Str::snake(str_replace('-', '_', $seg)))] as $t) {
            if (isset($tableSet[$t])) return $t;
        }
    }
    return null;
}

// Đăng nhập sẵn mọi guard session bằng bản ghi đầu tiên (ưu tiên user có role admin nếu có)
$loggedIn = [];
foreach (config('auth.guards') as $name => $g) {
    if (($g['driver'] ?? '') !== 'session') continue;
    $provider = config('auth.providers.' . ($g['provider'] ?? ''));
    $model = $provider['model'] ?? null;
    if (!$model || !class_exists($model)) continue;
    try {
        $user = $model::query()->orderBy((new $model)->getKeyName())->first();
        if ($user) { auth()->guard($name)->login($user); $loggedIn[] = "$name#" . $user->getKey(); }
    } catch (\Throwable $e) { $loggedIn[] = "$name: " . $e->getMessage(); }
}
fwrite(STDOUT, "Guards: " . implode(', ', $loggedIn) . PHP_EOL);

$skip = '#(logout|telescope|_debugbar|_ignition|horizon|sanctum|oauth|install|clear|cache|migrate|optimize|delete|destroy|remove|restore|export|download|sitemap|captcha|livewire)#i';
$ok = 0; $bad = 0; $skipped = 0; $rows = [];
foreach (app('router')->getRoutes() as $route) {
    if (!in_array('GET', $route->methods())) continue;
    $uri = $route->uri();
    if ($filter && !Str::contains($uri, $filter)) continue;
    if (preg_match($skip, $uri . ' ' . ($route->getName() ?? ''))) { $skipped++; continue; }

    $path = $uri;
    $unresolved = false;
    if (preg_match_all('/\{([^}]+)\}/', $uri, $m)) {
        foreach ($m[1] as $param) {
            $v = guessValue($param, $tableSet, $db);
            if ($v === null && in_array(rtrim($param, '?'), ['id', 'slug'])) {
                $t = tableFromUri($uri, $tableSet);
                if ($t) { try { $v = $db->table($t)->orderBy('id')->value(rtrim($param, '?')); } catch (\Throwable $e) { $v = null; } }
            }
            if ($v === null && Str::endsWith($param, '?')) { $path = str_replace('{' . $param . '}', '', $path); continue; }
            if ($v === null) { $unresolved = true; break; }
            $path = str_replace('{' . $param . '}', rawurlencode((string) $v), $path);
        }
    }
    if ($unresolved) { $skipped++; continue; }
    if (in_array($uri, $exclude)) { $skipped++; continue; }
    $path = '/' . trim(preg_replace('#/+#', '/', $path), '/');

    $GLOBALS['__current'] = $path;
    if (getenv('SWEEP_TRACE')) fwrite(STDERR, "-> $path" . PHP_EOL);
    ob_start();
    try {
        $req = Illuminate\Http\Request::create($path, 'GET');
        $res = $kernel->handle($req);
        $code = $res->getStatusCode();
        $body = method_exists($res, 'getContent') ? (string) $res->getContent() : '';
        $norm = preg_replace(['/(name="_token"[^>]*value=")[^"]*"/', '/(csrf-token"\s+content=")[^"]*"/', '/"csrfToken":"[^"]*"/', '/csrf[_-]?token[^\n]{0,80}/i', '/\b\d{10,13}\b/', '/(_token=)[A-Za-z0-9]{40}/', '#\d\d/\d\d/\d{4} \d\d:\d\d( ?[ap]m)?#i', '/\d{4}-\d\d-\d\d[ T]\d\d:\d\d:\d\d/'], '', $body);
        if ($d = getenv('SWEEP_DUMP')) { @mkdir($d, 0777, true); file_put_contents($d . '/' . trim(preg_replace('/[^a-z0-9]+/i', '_', $path), '_') . '.html', $norm); }
        $hash = substr(md5($norm), 0, 10) . ':' . strlen($norm);
        $err = isset($res->exception) && $res->exception ? (get_class($res->exception) . ': ' . Str::limit(str_replace("\n", ' ', $res->exception->getMessage()), 300)) : '';
    } catch (\Throwable $e) {
        $code = 'EXC'; $hash = '-'; $err = get_class($e) . ': ' . Str::limit(str_replace("\n", ' ', $e->getMessage()), 300);
    }
    ob_end_clean();
    $GLOBALS['__current'] = '';
    $isBad = ($code === 'EXC' || $code >= 500);
    $isBad ? $bad++ : $ok++;
    if (getenv('SWEEP_HASH')) $rows[] = sprintf("%s %s %s", $path, $code, $hash);
    elseif ($isBad || getenv('SWEEP_VERBOSE')) $rows[] = sprintf("[%s] %s %s", $code, $path, $err);
}
foreach ($rows as $r) fwrite(STDOUT, $r . PHP_EOL);
fwrite(STDOUT, sprintf("TỔNG: %d route OK, %d lỗi 5xx, %d bỏ qua (thao tác ghi/xoá hoặc thiếu tham số)%s", $ok, $bad, $skipped, PHP_EOL));
exit($bad > 0 ? 1 : 0);
