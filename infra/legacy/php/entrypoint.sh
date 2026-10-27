#!/bin/sh
# Chuáº©n bá»‹ Laravel trÆ°á»›c khi cháº¡y Apache:
#  - xoĂ¡ config cache cÅ© (náº¿u cĂ³) Ä‘á»ƒ nháº­n biáº¿n mĂ´i trÆ°á»ng DB_* má»›i
#  - Ä‘áº£m báº£o thÆ° má»¥c storage/ vĂ  bootstrap/cache ghi Ä‘Æ°á»£c
set -e
cd /var/www/html

rm -f bootstrap/cache/config.php bootstrap/cache/routes*.php

mkdir -p storage/framework/cache/data storage/framework/sessions storage/framework/views storage/logs bootstrap/cache
chown -R www-data:www-data storage bootstrap/cache 2>/dev/null || true
chmod -R ug+rwX storage bootstrap/cache 2>/dev/null || true

exec docker-php-entrypoint "$@"
