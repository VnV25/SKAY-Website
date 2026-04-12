@echo off
echo.
echo ========================================
echo SKAY Backend Server Launcher
echo ========================================
echo.
echo Killing any existing Node processes on port 5000...
netstat -ano | findstr :5000 >nul
if errorlevel 1 (
    echo No process found on port 5000
) else (
    for /f "tokens=5" %%a in ('netstat -ano ^| findstr :5000') do (
        echo Killing process PID %%a...
        taskkill /PID %%a /F 2>nul
    )
)

echo.
echo Starting SKAY Backend Server on port 5000...
echo.
cd /d "%~dp0backend"
node server.js

pause
