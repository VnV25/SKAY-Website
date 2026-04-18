param(
    [int]$Port = 5001
)

$ErrorActionPreference = 'Stop'
$backendPath = Join-Path $PSScriptRoot 'backend'

Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "SKAY Backend Server Launcher" -ForegroundColor Cyan
Write-Host "========================================`n" -ForegroundColor Cyan

if (-not (Test-Path $backendPath)) {
    throw "Backend folder not found at: $backendPath"
}

if (-not (Get-Command node -ErrorAction SilentlyContinue)) {
    throw "Node.js is not installed or not available in PATH."
}

Write-Host "Checking for processes on port $Port..." -ForegroundColor Yellow
$owningProcessIds = Get-NetTCPConnection -LocalPort $Port -ErrorAction SilentlyContinue |
    Select-Object -ExpandProperty OwningProcess -Unique

if ($owningProcessIds) {
    foreach ($owningProcessId in $owningProcessIds) {
        Write-Host "Stopping process PID: $owningProcessId" -ForegroundColor Yellow
        Stop-Process -Id $owningProcessId -Force -ErrorAction SilentlyContinue
    }

    Start-Sleep -Seconds 2
    Write-Host "Port $Port is clear.`n" -ForegroundColor Green
} else {
    Write-Host "No process found on port $Port. Proceeding...`n" -ForegroundColor Green
}

Write-Host "Starting SKAY Backend Server..." -ForegroundColor Cyan
Write-Host "Port: $Port" -ForegroundColor White
Write-Host "Health check: http://localhost:$Port/api/health`n" -ForegroundColor White

Push-Location $backendPath
try {
    $env:PORT = $Port
    node server.js
} finally {
    Pop-Location
}
