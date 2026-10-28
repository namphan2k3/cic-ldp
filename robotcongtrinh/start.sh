#!/usr/bin/env bash
set -e
if [ ! -f ".env" ] && [ -f ".env.example" ]; then
  cp .env.example .env
fi
if [ ! -f "apps/landing-hub/.env" ] && [ -f "apps/landing-hub/.env.example" ]; then
  cp apps/landing-hub/.env.example apps/landing-hub/.env
fi
echo "=== [1/3] Kiểm tra thư viện hệ thống ==="
if [ ! -d "node_modules" ]; then
  npm install
fi
echo "=== [2/3] Tự động khởi tạo & nạp dữ liệu vào Database (Auto-Seed) ==="
node seed/auto-seed.mjs
if [ ! -d "apps/landing-hub/.next" ]; then
  echo "=== [2.5/3] Biên dịch gói giao diện Production ==="
  npm --workspace @cic/landing-hub run build
fi
echo "=== [3/3] Khởi chạy máy chủ (robotcongtrinh - cổng ${PORT:-3006}) ==="
cd apps/landing-hub && npx next start -p ${PORT:-3006}
