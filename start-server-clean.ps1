# SKAY Backend Server Launcher (PowerShell)
Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "SKAY Backend Server Launcher" -ForegroundColor Cyan
Write-Host "========================================`n" -ForegroundColor Cyan

# Kill any process using port 5000
Write-Host "Checking for processes on port 5000..." -ForegroundColor Yellow
$portProcess = Get-NetTCPConnection -LocalPort 5000 -ErrorAction SilentlyContinue
if ($portProcess) {
    $pid = $portProcess.OwningProcess
    Write-Host "Found process PID: $pid" -ForegroundColor Yellow
    Write-Host "Killing process..." -ForegroundColor Yellow
    Stop-Process -Id $pid -Force -ErrorAction SilentlyContinue
    Start-Sleep -Seconds 2
    Write-Host "Process killed successfully!`n" -ForegroundColor Green
} else {
    Write-Host "No process found on port 5000. Proceeding...`n" -ForegroundColor Green
}

# Start the backend server
Write-Host "Starting SKAY Backend Server..." -ForegroundColor Cyan
Write-Host "Port: 5000" -ForegroundColor White
Write-Host "Health check: http://localhost:5000/api/health`n" -ForegroundColor White

Set-Location "$PSScriptRoot\backend"
node server.js
