@echo off
echo Killing existing node processes...
taskkill /f /im node.exe 2>nul
timeout /t 2 /nobreak >nul
echo Starting backend server...
cd /d "c:\Users\parde\OneDrive\Desktop\Veena\SKAY (Copy)\backend"
node server.js