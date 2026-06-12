@echo off
chcp 65001 >nul
title Tensi-Bot
color 0A

echo.
echo  ╔══════════════════════════════════════════╗
echo  ║     TENSI-BOT — Starting App...         ║
echo  ╚══════════════════════════════════════════╝
echo.

:: Cek .env
if not exist "backend\.env" (
    color 0E
    echo  [!] File backend\.env tidak ditemukan.
    echo  Jalankan setup.bat terlebih dahulu!
    echo.
    pause
    start "" setup.bat
    exit /b
)

:: Baca PORT
set BACKEND_PORT=4000
for /f "tokens=2 delims==" %%p in ('findstr /i "^PORT=" "backend\.env" 2^>nul') do set BACKEND_PORT=%%p

echo  [..] Menjalankan Backend (port %BACKEND_PORT%)...
start "Tensi-Bot Backend" cmd /k "color 0B && title Tensi-Bot Backend && cd /d "%~dp0backend" && npm run dev"

timeout /t 3 /nobreak >nul

echo  [..] Menjalankan Frontend (port 3000)...
start "Tensi-Bot Frontend" cmd /k "color 0E && title Tensi-Bot Frontend && cd /d "%~dp0frontend" && npm run dev"

timeout /t 4 /nobreak >nul

echo.
echo  [OK] Membuka http://localhost:3000 ...
echo.
start "" "http://localhost:3000"

timeout /t 2 /nobreak >nul
exit
