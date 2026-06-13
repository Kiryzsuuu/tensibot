@echo off
chcp 65001 >nul
title Tensi-Bot Mobile
color 0B

echo.
echo  ╔══════════════════════════════════════════╗
echo  ║   TENSI-BOT MOBILE — Starting App...    ║
echo  ╚══════════════════════════════════════════╝
echo.

:: Cek .env backend
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

echo  [1/2] Menjalankan Backend (port %BACKEND_PORT%)...
start "Tensi-Bot Backend" cmd /k "color 0B && title Tensi-Bot Backend && cd /d "%~dp0backend" && npm run dev"

timeout /t 4 /nobreak >nul

echo  [2/2] Menjalankan Expo (Mobile)...
echo.
echo  Setelah Metro bundler siap:
echo    - Tekan A  = buka di Android Emulator
echo    - Tekan W  = buka di browser (web)
echo    - Scan QR  = buka di HP via Expo Go
echo.
start "Tensi-Bot Mobile (Expo)" cmd /k "color 0E && title Tensi-Bot Mobile (Expo) && cd /d "%~dp0mobile" && npx expo start"

timeout /t 2 /nobreak >nul
exit
