@echo off
REM 🚀 SKAY DEPLOYMENT VERIFICATION SCRIPT (Windows)
REM This script checks if everything is properly set up for deployment

setlocal enabledelayedexpansion

echo ==================================
echo 🚀 SKAY SYSTEM VERIFICATION
echo ==================================
echo.

set PASS=0
set FAIL=0

REM Function to check file exists
echo 📋 ENVIRONMENT FILES
echo ===================================

if exist "backend\.env" (
    echo ✅ Backend .env EXISTS
    set /a PASS+=1
) else (
    echo ❌ Backend .env MISSING
    set /a FAIL+=1
)

if exist "frontend\.env.local" (
    echo ✅ Frontend .env.local EXISTS
    set /a PASS+=1
) else (
    echo ❌ Frontend .env.local MISSING
    set /a FAIL+=1
)
echo.

echo 🔧 BACKEND CONFIGURATION
echo ===================================

if exist "backend\.env" (
    findstr /M "SUPABASE_URL" backend\.env > nul
    if !errorlevel! equ 0 (
        echo   - SUPABASE_URL: ✅
        set /a PASS+=1
    ) else (
        echo   - SUPABASE_URL: ❌
        set /a FAIL+=1
    )
    
    findstr /M "SUPABASE_SERVICE_ROLE_KEY" backend\.env > nul
    if !errorlevel! equ 0 (
        echo   - SUPABASE_SERVICE_ROLE_KEY: ✅
        set /a PASS+=1
    ) else (
        echo   - SUPABASE_SERVICE_ROLE_KEY: ❌
        set /a FAIL+=1
    )
    
    findstr /M "JWT_SECRET" backend\.env > nul
    if !errorlevel! equ 0 (
        echo   - JWT_SECRET: ✅
        set /a PASS+=1
    ) else (
        echo   - JWT_SECRET: ❌
        set /a FAIL+=1
    )
)
echo.

echo 🌐 FRONTEND CONFIGURATION
echo ===================================

if exist "frontend\.env.local" (
    findstr /M "VITE_API_URL" frontend\.env.local > nul
    if !errorlevel! equ 0 (
        echo   - VITE_API_URL: ✅
        set /a PASS+=1
    ) else (
        echo   - VITE_API_URL: ❌
        set /a FAIL+=1
    )
    
    findstr /M "VITE_SUPABASE_URL" frontend\.env.local > nul
    if !errorlevel! equ 0 (
        echo   - VITE_SUPABASE_URL: ✅
        set /a PASS+=1
    ) else (
        echo   - VITE_SUPABASE_URL: ❌
        set /a FAIL+=1
    )
)
echo.

echo 📦 JAVASCRIPT DEPENDENCIES
echo ===================================

if exist "backend\package.json" (
    echo ✅ Backend package.json EXISTS
    set /a PASS+=1
) else (
    echo ❌ Backend package.json MISSING
    set /a FAIL+=1
)

if exist "backend\node_modules\express\package.json" (
    echo ✅ Backend node_modules EXISTS
    set /a PASS+=1
) else (
    echo ❌ Backend node_modules MISSING (run: cd backend && npm install)
    set /a FAIL+=1
)

if exist "frontend\package.json" (
    echo ✅ Frontend package.json EXISTS
    set /a PASS+=1
) else (
    echo ❌ Frontend package.json MISSING
    set /a FAIL+=1
)

if exist "frontend\node_modules\react\package.json" (
    echo ✅ Frontend node_modules EXISTS
    set /a PASS+=1
) else (
    echo ❌ Frontend node_modules MISSING (run: cd frontend && npm install)
    set /a FAIL+=1
)
echo.

echo 🗄️ DATABASE FILES
echo ===================================

if exist "SUPABASE_DATABASE_SCHEMA.sql" (
    echo ✅ Supabase Schema EXISTS
    set /a PASS+=1
) else (
    echo ❌ Supabase Schema MISSING
    set /a FAIL+=1
)
echo.

echo 📚 DOCUMENTATION FILES
echo ===================================

if exist "COMPLETE_DEPLOYMENT_GUIDE.md" (
    echo ✅ Deployment Guide EXISTS
    set /a PASS+=1
) else (
    echo ❌ Deployment Guide MISSING
    set /a FAIL+=1
)

if exist "INTEGRATION_TESTING_GUIDE.md" (
    echo ✅ Testing Guide EXISTS
    set /a PASS+=1
) else (
    echo ❌ Testing Guide MISSING
    set /a FAIL+=1
)

if exist "BACKEND_MIGRATION_SUMMARY.md" (
    echo ✅ Migration Summary EXISTS
    set /a PASS+=1
) else (
    echo ❌ Migration Summary MISSING
    set /a FAIL+=1
)
echo.

echo 🔌 KEY ROUTES UPDATED
echo ===================================

if exist "backend\routes\auth-supabase.js" (
    echo ✅ Auth Routes (Supabase) EXISTS
    set /a PASS+=1
) else (
    echo ❌ Auth Routes (Supabase) MISSING
    set /a FAIL+=1
)

if exist "backend\routes\contact.js" (
    echo ✅ Contact Routes EXISTS
    set /a PASS+=1
) else (
    echo ❌ Contact Routes MISSING
    set /a FAIL+=1
)

if exist "backend\routes\admin.js" (
    echo ✅ Admin Routes EXISTS
    set /a PASS+=1
) else (
    echo ❌ Admin Routes MISSING
    set /a FAIL+=1
)

if exist "backend\routes\orders.js" (
    echo ✅ Orders Routes EXISTS
    set /a PASS+=1
) else (
    echo ❌ Orders Routes MISSING
    set /a FAIL+=1
)
echo.

echo 📊 FINAL SUMMARY
echo ==================================
set /a TOTAL=%PASS%+%FAIL%
echo Tests Passed: %PASS%/%TOTAL%
echo Tests Failed: %FAIL%/%TOTAL%
echo.

if %FAIL% equ 0 (
    echo ✅ ALL CHECKS PASSED!
    echo.
    echo Next steps:
    echo 1. Start backend:   cd backend ^&^& npm run dev
    echo 2. Start frontend:  cd frontend ^&^ npm run dev  
    echo 3. Open website:    http://localhost:5173
    echo 4. Read:            COMPLETE_DEPLOYMENT_GUIDE.md
    echo.
    exit /b 0
) else (
    echo ❌ SOME CHECKS FAILED
    echo.
    echo Issues to fix:
    echo - Ensure backend\.env exists and has all Supabase credentials
    echo - Ensure frontend\.env.local exists and has correct API URL
    echo - Ensure npm install has been run in both directories
    echo - Ensure SUPABASE_DATABASE_SCHEMA.sql is in project root
    echo.
    exit /b 1
)
