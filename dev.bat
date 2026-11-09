@echo off
setlocal

cd /d "%~dp0"

echo ============================================
echo   Personal AI Memory - Dev Launcher
echo ============================================
echo.

where npm >nul 2>nul
if errorlevel 1 (
    echo [ERROR] npm not found. Please install Node.js first.
    pause
    exit /b 1
)

if not exist "node_modules" (
    echo [INFO] node_modules not found, installing dependencies...
    call npm install
    if errorlevel 1 (
        echo [ERROR] npm install failed.
        pause
        exit /b 1
    )
)

echo [INFO] Starting dev server at http://localhost:3000
echo [INFO] Press Ctrl+C to stop.
echo.

start "" http://localhost:3000
call npm run dev

pause
endlocal
