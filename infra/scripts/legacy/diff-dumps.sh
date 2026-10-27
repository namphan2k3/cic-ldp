#!/bin/sh
# Dùng trong container: so sánh HTML đã dump giữa MySQL (/tmp/dump-my) và Postgres (/tmp/dump-pg)
# sh /tmp/diff-dumps.sh file1.html file2.html ...   (JSON có \r\n được tách dòng trước khi so sánh)
for f in "$@"; do
  echo "== $f"
  sed 's/\\r\\n/\n/g; s/\\n/\n/g' "/tmp/dump-my/$f" > /tmp/_a
  sed 's/\\r\\n/\n/g; s/\\n/\n/g' "/tmp/dump-pg/$f" > /tmp/_b
  diff /tmp/_a /tmp/_b | cut -c1-300 | head -${DIFF_LINES:-10}
done
