@echo off
chcp 65001 >nul
title Tensi-Bot Setup & Launcher
color 0A

echo.
echo  ╔══════════════════════════════════════════════════════════╗
echo  ║          TENSI-BOT — Setup ^& Launcher                  ║
echo  ║          Teman Kendali Hipertensi berbasis AI           ║
echo  ╚══════════════════════════════════════════════════════════╝
echo.

:: ─── Check Node.js ───────────────────────────────────────────────────────────
node --version >nul 2>&1
if %errorlevel% neq 0 (
    color 0C
    echo  [ERROR] Node.js tidak ditemukan!
    echo.
    echo  Silakan download dan install Node.js dari:
    echo  https://nodejs.org  (pilih versi LTS)
    echo.
    pause
    exit /b 1
)
for /f "tokens=*" %%v in ('node --version') do set NODE_VER=%%v
echo  [OK] Node.js %NODE_VER% ditemukan
echo.

:: ─── Cek apakah sudah punya .env ─────────────────────────────────────────────
set BACKEND_ENV=backend\.env
set FRONTEND_ENV=frontend\.env.local
set NEED_SETUP=0

if not exist "%BACKEND_ENV%" set NEED_SETUP=1
if not exist "%FRONTEND_ENV%" set NEED_SETUP=1

if "%NEED_SETUP%"=="0" (
    echo  [INFO] File .env sudah ada. Melewati konfigurasi...
    goto INSTALL
)

:: ─── Konfigurasi Environment ──────────────────────────────────────────────────
echo  ════════════════════════════════════════════════════════════
echo   KONFIGURASI AWAL (isi sesuai data Anda)
echo  ════════════════════════════════════════════════════════════
echo.
echo  Anda memerlukan:
echo  1. Firebase project (console.firebase.google.com)
echo     - Buat project baru → Enable Firestore →
echo     - Project Settings → Service Accounts → Generate new private key
echo  2. Anthropic API key (console.anthropic.com)
echo.
echo  ────────────────────────────────────────────────────────────
echo   FIREBASE CONFIGURATION
echo  ────────────────────────────────────────────────────────────
echo.
set /p FB_PROJECT="  Firebase Project ID (contoh: tensibot-abc12): "
set /p FB_EMAIL="  Firebase Client Email (dari service account JSON): "
echo.
echo  Firebase Private Key — paste seluruh isi private_key dari JSON
echo  (dimulai dengan -----BEGIN PRIVATE KEY-----)
echo  Tekan ENTER dua kali setelah selesai:
set FB_KEY=
:KEY_LOOP
set /p KEY_LINE="  > "
if "%KEY_LINE%"=="" (
    if not "%FB_KEY%"=="" goto KEY_DONE
    goto KEY_LOOP
)
if "%FB_KEY%"=="" (
    set FB_KEY=%KEY_LINE%
) else (
    set FB_KEY=%FB_KEY%\n%KEY_LINE%
)
goto KEY_LOOP
:KEY_DONE

echo.
echo  ────────────────────────────────────────────────────────────
echo   JWT SECRETS (tekan Enter untuk generate otomatis)
echo  ────────────────────────────────────────────────────────────
echo.
set /p JWT_SECRET="  JWT Secret (min 32 karakter, Enter=auto-generate): "
if "%JWT_SECRET%"=="" (
    :: Generate random 48-char string using PowerShell
    for /f "tokens=*" %%s in ('powershell -Command "[System.Convert]::ToBase64String([System.Security.Cryptography.RandomNumberGenerator]::GetBytes(36))"') do set JWT_SECRET=%%s
    echo  [OK] JWT Secret di-generate: %JWT_SECRET%
)
set /p JWT_REFRESH="  JWT Refresh Secret (Enter=auto-generate): "
if "%JWT_REFRESH%"=="" (
    for /f "tokens=*" %%s in ('powershell -Command "[System.Convert]::ToBase64String([System.Security.Cryptography.RandomNumberGenerator]::GetBytes(36))"') do set JWT_REFRESH=%%s
    echo  [OK] JWT Refresh Secret di-generate: %JWT_REFRESH%
)

echo.
echo  ────────────────────────────────────────────────────────────
echo   ANTHROPIC API KEY
echo  ────────────────────────────────────────────────────────────
echo.
set /p ANTHROPIC_KEY="  Anthropic API Key (sk-ant-...): "

echo.
echo  ────────────────────────────────────────────────────────────
echo   PORT CONFIGURATION (Enter = default)
echo  ────────────────────────────────────────────────────────────
echo.
set /p BACKEND_PORT="  Backend port (Enter=4000): "
if "%BACKEND_PORT%"=="" set BACKEND_PORT=4000
set /p FRONTEND_PORT_INPUT="  Frontend port (Enter=3000): "
if "%FRONTEND_PORT_INPUT%"=="" set FRONTEND_PORT_INPUT=3000

:: ─── Tulis backend/.env ───────────────────────────────────────────────────────
echo.
echo  [..] Membuat file backend\.env ...

(
echo NODE_ENV=development
echo PORT=%BACKEND_PORT%
echo.
echo # Firebase
echo FIREBASE_PROJECT_ID=%FB_PROJECT%
echo FIREBASE_CLIENT_EMAIL=%FB_EMAIL%
echo FIREBASE_PRIVATE_KEY=%FB_KEY%
echo.
echo # JWT
echo JWT_SECRET=%JWT_SECRET%
echo JWT_REFRESH_SECRET=%JWT_REFRESH%
echo JWT_EXPIRES_IN=1h
echo JWT_REFRESH_EXPIRES_IN=30d
echo.
echo # Claude AI
echo ANTHROPIC_API_KEY=%ANTHROPIC_KEY%
echo CLAUDE_MODEL=claude-sonnet-4-6
echo.
echo # App
echo FRONTEND_URL=http://localhost:%FRONTEND_PORT_INPUT%
) > "%BACKEND_ENV%"

echo  [OK] backend\.env berhasil dibuat

:: ─── Tulis frontend/.env.local ────────────────────────────────────────────────
(
echo NEXT_PUBLIC_API_URL=http://localhost:%BACKEND_PORT%/api
echo NEXT_PUBLIC_APP_NAME=Tensi-Bot
) > "%FRONTEND_ENV%"

echo  [OK] frontend\.env.local berhasil dibuat
echo.

:: ─── Install Dependencies ─────────────────────────────────────────────────────
:INSTALL
echo  ════════════════════════════════════════════════════════════
echo   INSTALL DEPENDENCIES
echo  ════════════════════════════════════════════════════════════
echo.

if not exist "backend\node_modules" (
    echo  [..] Menginstall backend dependencies...
    cd backend
    call npm install --silent
    if %errorlevel% neq 0 (
        color 0C
        echo  [ERROR] Gagal install backend dependencies!
        cd ..
        pause
        exit /b 1
    )
    cd ..
    echo  [OK] Backend dependencies terinstall
) else (
    echo  [OK] Backend node_modules sudah ada, skip install
)

if not exist "frontend\node_modules" (
    echo  [..] Menginstall frontend dependencies ^(bisa 1-2 menit^)...
    cd frontend
    call npm install --silent
    if %errorlevel% neq 0 (
        color 0C
        echo  [ERROR] Gagal install frontend dependencies!
        cd ..
        pause
        exit /b 1
    )
    cd ..
    echo  [OK] Frontend dependencies terinstall
) else (
    echo  [OK] Frontend node_modules sudah ada, skip install
)

echo.

:: ─── Launch App ───────────────────────────────────────────────────────────────
echo  ════════════════════════════════════════════════════════════
echo   MENJALANKAN TENSI-BOT
echo  ════════════════════════════════════════════════════════════
echo.
echo  [..] Membuka server backend di jendela terpisah...

:: Baca PORT dari .env jika ada
for /f "tokens=2 delims==" %%p in ('findstr /i "^PORT=" "%BACKEND_ENV%" 2^>nul') do set BACKEND_PORT=%%p
if "%BACKEND_PORT%"=="" set BACKEND_PORT=4000

for /f "tokens=2 delims==" %%p in ('findstr /i "^NEXT_PUBLIC_API_URL=" "%FRONTEND_ENV%" 2^>nul') do set API_URL=%%p

start "Tensi-Bot Backend :4000" cmd /k "color 0B && title Tensi-Bot Backend && cd /d "%~dp0backend" && echo. && echo  [BACKEND] Starting on port %BACKEND_PORT%... && echo. && npm run dev"

timeout /t 3 /nobreak >nul

echo  [..] Membuka server frontend di jendela terpisah...
start "Tensi-Bot Frontend :3000" cmd /k "color 0E && title Tensi-Bot Frontend && cd /d "%~dp0frontend" && echo. && echo  [FRONTEND] Starting Next.js... && echo. && npm run dev"

timeout /t 5 /nobreak >nul

echo.
echo  ════════════════════════════════════════════════════════════
echo   TENSI-BOT SEDANG BERJALAN!
echo  ════════════════════════════════════════════════════════════
echo.
echo   Frontend  :  http://localhost:3000
echo   Backend   :  http://localhost:%BACKEND_PORT%
echo   API Docs  :  http://localhost:%BACKEND_PORT%/api/health
echo.
echo   Membuka browser dalam 3 detik...
echo.

timeout /t 3 /nobreak >nul
start "" "http://localhost:3000"

echo  ════════════════════════════════════════════════════════════
echo.
echo  Jendela ini bisa ditutup. App berjalan di 2 jendela CMD lain.
echo  Untuk menghentikan app: tutup jendela Backend dan Frontend.
echo.
pause
