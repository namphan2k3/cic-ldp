<?php
function loadMerged(string $baseDir, string $locale): array {
    $langFile = "$baseDir/lang/$locale/landing.php";
    $base = file_exists($langFile) ? require($langFile) : [];
    $pubFile = "$baseDir/storage/app/private/cms/published/$locale.json";
    if (!file_exists($pubFile)) {
        $revs = glob("$baseDir/storage/app/private/cms/revisions/*/$locale.json");
        if ($revs) {
            sort($revs);
            $pubFile = end($revs);
        }
    }
    $over = file_exists($pubFile) ? json_decode(file_get_contents($pubFile), true) : [];
    return array_replace_recursive($base, is_array($over) ? $over : []);
}

$out = [
    'cms-intellicad' => [
        'vi' => loadMerged('D:/web-data/landing-pages/cms-intellicad/cmsintellicad.vn', 'vi'),
        'en' => loadMerged('D:/web-data/landing-pages/cms-intellicad/cmsintellicad.vn', 'en'),
    ],
    'robot-cong-trinh' => [
        'vi' => loadMerged('D:/web-data/landing-pages/robot-cong-trinh/robotcongtrinh.vn', 'vi'),
    ],
];

file_put_contents(
    __DIR__ . '/migrated-cms-content.json',
    json_encode($out, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE)
);

echo 'cms-intellicad vi sections: ' . implode(', ', array_keys($out['cms-intellicad']['vi'])) . PHP_EOL;
echo 'robot-cong-trinh vi sections: ' . implode(', ', array_keys($out['robot-cong-trinh']['vi'])) . PHP_EOL;
