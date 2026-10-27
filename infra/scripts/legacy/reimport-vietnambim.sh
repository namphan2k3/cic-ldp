#!/bin/sh
# Re-import vietnambim: strip literal DEFAULT on TEXT/BLOB columns (MySQL 8 rejects them)
set -e
sed -E "s/^([[:space:]]*\`[^\`]+\`[[:space:]]+(tiny|medium|long)?(text|blob)[^,']*) DEFAULT ('[^']*'|NULL)/\1/I" /tmp/vietnambim.sql > /tmp/vietnambim.fixed.sql
mysql -uroot -pstaging_root -e "DROP DATABASE IF EXISTS vietnambim; CREATE DATABASE vietnambim CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"
mysql -uroot -pstaging_root --default-character-set=utf8mb4 vietnambim < /tmp/vietnambim.fixed.sql
mysql -uroot -pstaging_root -N -e "SELECT COUNT(*) FROM information_schema.tables WHERE table_schema='vietnambim'"
