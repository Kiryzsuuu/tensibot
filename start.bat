@echo off
chcp 65001 >nul
title Tensi-Bot
color 0A

echo.
echo  ╔══════════════════════════════════════════╗
echo  ║          TENSI-BOT LAUNCHER             ║
echo  ╚══════════════════════════════════════════╝
echo.
echo  Pilih mode yang ingin dijalankan:
echo.
echo    [1]  Web   (Frontend + Backend)
echo    [2]  Mobile (Expo + Backend)
echo    [3]  Semua (Web + Mobile + Backend)
echo    [4]  Backend saja
echo    [0]  Keluar
echo.
set /p PILIHAN=  Pilihan (0-4):

if "%PILIHAN%"=="0" exit /b
if "%PILIHAN%"=="1" goto WEB
if "%PILIHAN%"=="2" goto MOBILE
if "%PILIHAN%"=="3" goto SEMUA
if "%PILIHAN%"=="4" goto BACKEND_ONLY

echo  [!] Pilihan tidak valid.
pause
exit /b

:: ─── Cek .env ─────────────────────────────────────────────────────────────────
:CEK_ENV
if not exist "backend\.env" (
    color 0E
    echo.
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
goto %KEMBALI%

:: ─── Web ──────────────────────────────────────────────────────────────────────
:WEB
set KEMBALI=WEB_START
goto CEK_ENV
:WEB_START
echo.
echo  [1/2] Menjalankan Backend (port %BACKEND_PORT%)...
start "Tensi-Bot Backend" cmd /k "color 0B && title Tensi-Bot Backend && cd /d "%~dp0backend" && npm run dev"
timeout /t 3 /nobreak >nul

echo  [2/2] Menjalankan Frontend (port 3000)...
start "Tensi-Bot Frontend" cmd /k "color 0E && title Tensi-Bot Frontend && cd /d "%~dp0frontend" && npm run dev"
timeout /t 4 /nobreak >nul

echo.
echo  [OK] Membuka http://localhost:3000 ...
start "" "http://localhost:3000"
timeout /t 2 /nobreak >nul
exit

:: ─── Mobile ───────────────────────────────────────────────────────────────────
:MOBILE
set KEMBALI=MOBILE_START
goto CEK_ENV
:MOBILE_START
echo.
echo  [1/2] Menjalankan Backend (port %BACKEND_PORT%)...
start "Tensi-Bot Backend" cmd /k "color 0B && title Tensi-Bot Backend && cd /d "%~dp0backend" && npm run dev"
timeout /t 4 /nobreak >nul

echo  [2/2] Menjalankan Expo (Mobile)...
echo.
echo  Setelah Metro bundler siap:
echo    - Tekan A  = buka di Android Emulator
echo    - Tekan W  = buka di browser
echo    - Scan QR  = buka di HP via Expo Go
echo.
start "Tensi-Bot Mobile (Expo)" cmd /k "color 0E && title Tensi-Bot Mobile (Expo) && cd /d "%~dp0mobile" && npx expo start"
timeout /t 2 /nobreak >nul
exit

:: ─── Semua ────────────────────────────────────────────────────────────────────
:SEMUA
set KEMBALI=SEMUA_START
goto CEK_ENV
:SEMUA_START
echo.
echo  [1/3] Menjalankan Backend (port %BACKEND_PORT%)...
start "Tensi-Bot Backend" cmd /k "color 0B && title Tensi-Bot Backend && cd /d "%~dp0backend" && npm run dev"
timeout /t 3 /nobreak >nul

echo  [2/3] Menjalankan Frontend (port 3000)...
start "Tensi-Bot Frontend" cmd /k "color 0E && title Tensi-Bot Frontend && cd /d "%~dp0frontend" && npm run dev"
timeout /t 3 /nobreak >nul

echo  [3/3] Menjalankan Expo (Mobile)...
start "Tensi-Bot Mobile (Expo)" cmd /k "color 0D && title Tensi-Bot Mobile (Expo) && cd /d "%~dp0mobile" && npx expo start"
timeout /t 4 /nobreak >nul

echo.
echo  [OK] Membuka http://localhost:3000 ...
start "" "http://localhost:3000"
timeout /t 2 /nobreak >nul
exit

:: ─── Backend Only ─────────────────────────────────────────────────────────────
:BACKEND_ONLY
set KEMBALI=BACKEND_ONLY_START
goto CEK_ENV
:BACKEND_ONLY_START
echo.
echo  [..] Menjalankan Backend saja (port %BACKEND_PORT%)...
start "Tensi-Bot Backend" cmd /k "color 0B && title Tensi-Bot Backend && cd /d "%~dp0backend" && npm run dev"
timeout /t 2 /nobreak >nul
exit
