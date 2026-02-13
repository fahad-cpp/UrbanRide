@echo off
setlocal
where npm >nul 2>nul
if errorlevel 1 (
    echo Error: npm not installed
    exit /b 1
)

if not exist node_modules (
    echo Installing dependencies...
    start npm install
    timeout /t 20
)

start npm run dev
timeout /t 3
start "" "http://localhost:3000"
endlocal