@echo off
if not exist ".env" if exist ".env.example" copy /Y ".env.example" ".env" >nul
if not exist "apps\landing-hub\.env" if exist "apps\landing-hub\.env.example" copy /Y "apps\landing-hub\.env.example" "apps\landing-hub\.env" >nul
echo === [1/3] Kiem tra thu vien he thong ===
if not exist "node_modules" (
  call npm install
)
echo === [2/3] Tu dong khoi tao va nap du lieu vao Database (Auto-Seed) ===
node seed/auto-seed.mjs
if %ERRORLEVEL% neq 0 exit /b %ERRORLEVEL%
if not exist "apps\landing-hub\.next" (
  echo === [2.5/3] Bien dich goi giao dien Production ===
  call npm --workspace @cic/landing-hub run build
)
echo === [3/3] Khoi chay may chu (allplan - cong 3007) ===
cd apps\landing-hub
npx next start -p 3007
