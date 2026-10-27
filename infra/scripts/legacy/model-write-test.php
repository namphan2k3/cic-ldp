<?php
/**
 * Kiểm tra GHI dữ liệu (INSERT / UPDATE / DELETE) cho mọi Eloquent model của app,
 * trong 1 transaction rồi ROLLBACK -> không để lại dữ liệu.
 *  - Nhân bản bản ghi đầu tiên (replicate) -> save()  : kiểm tra kiểu cột, sequence id, NOT NULL...
 *  - Sửa 1 cột chữ -> save()                         : kiểm tra UPDATE
 *  - delete()                                        : kiểm tra DELETE / soft delete
 * Chạy:  php /tmp/model-write-test.php /var/www/html
 */
$base = rtrim($argv[1] ?? '/var/www/html', '/');
require $base . '/vendor/autoload.php';
$app = require $base . '/bootstrap/app.php';
$app->make(Illuminate\Contracts\Console\Kernel::class)->bootstrap();

use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Illuminate\Database\Eloquent\Model;

Model::unguard();
Model::unsetEventDispatcher(); // không bắn event (gửi mail, ghi log...) khi test
$it = new RecursiveIteratorIterator(new RecursiveDirectoryIterator($base . '/app'));
$classes = [];
foreach ($it as $file) {
    if ($file->getExtension() !== 'php') continue;
    $src = file_get_contents($file->getPathname());
    if (!preg_match('/^namespace\s+([^;]+);/m', $src, $ns) || !preg_match('/^(?:abstract\s+|final\s+)?class\s+(\w+)/m', $src, $cl)) continue;
    if (stripos($src, 'abstract class') !== false) continue;
    $fqcn = $ns[1] . '\\' . $cl[1];
    try {
        if (class_exists($fqcn) && is_subclass_of($fqcn, Model::class) && !(new ReflectionClass($fqcn))->isAbstract()) $classes[$fqcn] = true;
    } catch (\Throwable $e) {}
}
ksort($classes);

$ok = 0; $bad = 0; $skip = 0; $seenTables = [];
foreach (array_keys($classes) as $cls) {
    try { $model = new $cls; $table = $model->getTable(); } catch (\Throwable $e) { $skip++; continue; }
    if (isset($seenTables[$table])) { $skip++; continue; }
    $seenTables[$table] = true;
    $step = 'select';
    DB::beginTransaction();
    try {
        $first = $cls::query()->withoutGlobalScopes()->first();
        if (!$first) { DB::rollBack(); $skip++; continue; }
        $step = 'insert';
        $copy = $first->replicate();
        foreach ($copy->getAttributes() as $k => $v) {
            if (is_string($v) && preg_match('/(slug|email|name|title|code|user_name|username|key)$/i', $k)) {
                $copy->setAttribute($k, Str::limit($v, 150, '') . '-cictest' . mt_rand(1000, 9999));
            }
        }
        $copy->save();
        $step = 'update';
        foreach ($copy->getAttributes() as $k => $v) {
            if (is_string($v) && !in_array($k, [$copy->getKeyName(), 'password', 'remember_token']) && !preg_match('/_at$|_id$|^id$/', $k)) {
                $copy->setAttribute($k, $v . ' ');
                break;
            }
        }
        $copy->save();
        $step = 'delete';
        $copy->delete();
        $ok++;
        echo "[OK]  $table ($cls)" . PHP_EOL;
    } catch (\Throwable $e) {
        $bad++;
        echo "[ERR] $table ($cls) bước $step: " . Str::limit(str_replace("\n", ' ', $e->getMessage()), 400) . PHP_EOL;
    }
    DB::rollBack();
}
echo "TỔNG: $ok bảng ghi/sửa/xoá OK, $bad lỗi, $skip bỏ qua (bảng rỗng/trùng)" . PHP_EOL;
