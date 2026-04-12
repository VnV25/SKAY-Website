#!/bin/bash

# 🚀 SKAY DEPLOYMENT VERIFICATION SCRIPT
# This script checks if everything is properly set up for deployment

set -e

echo "=================================="
echo "🚀 SKAY SYSTEM VERIFICATION"
echo "=================================="
echo ""

# Color codes
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Counters
PASS=0
FAIL=0

# Function to test and report
test_feature() {
    local name=$1
    local command=$2
    
    echo -n "🔍 Testing $name... "
    
    if eval "$command" > /dev/null 2>&1; then
        echo -e "${GREEN}✅ PASS${NC}"
        ((PASS++))
    else
        echo -e "${RED}❌ FAIL${NC}"
        ((FAIL++))
    fi
}

# Function to check file exists
check_file() {
    local name=$1
    local file=$2
    
    echo -n "📄 Checking $name... "
    
    if [ -f "$file" ]; then
        echo -e "${GREEN}✅ EXISTS${NC}"
        ((PASS++))
    else
        echo -e "${RED}❌ MISSING${NC}"
        ((FAIL++))
    fi
}

echo "📋 ENVIRONMENT FILES"
echo "==================================="
check_file "Backend .env" "backend/.env"
check_file "Frontend .env.local" "frontend/.env.local"
echo ""

echo "🔧 BACKEND CONFIGURATION"
echo "==================================="

if [ -f "backend/.env" ]; then
    echo -n "  - SUPABASE_URL: "
    if grep -q "SUPABASE_URL=" backend/.env; then
        echo -e "${GREEN}✅${NC}"
    else
        echo -e "${RED}❌${NC}"
    fi
    
    echo -n "  - SUPABASE_SERVICE_ROLE_KEY: "
    if grep -q "SUPABASE_SERVICE_ROLE_KEY=" backend/.env; then
        echo -e "${GREEN}✅${NC}"
    else
        echo -e "${RED}❌${NC}"
    fi
    
    echo -n "  - JWT_SECRET: "
    if grep -q "JWT_SECRET=" backend/.env; then
        echo -e "${GREEN}✅${NC}"
    else
        echo -e "${RED}❌${NC}"
    fi
fi
echo ""

echo "🌐 FRONTEND CONFIGURATION"
echo "==================================="

if [ -f "frontend/.env.local" ]; then
    echo -n "  - VITE_API_URL: "
    if grep -q "VITE_API_URL=" frontend/.env.local; then
        echo -e "${GREEN}✅${NC}"
    else
        echo -e "${RED}❌${NC}"
    fi
    
    echo -n "  - VITE_SUPABASE_URL: "
    if grep -q "VITE_SUPABASE_URL=" frontend/.env.local; then
        echo -e "${GREEN}✅${NC}"
    else
        echo -e "${RED}❌${NC}"
    fi
fi
echo ""

echo "📦 JAVASCRIPT DEPENDENCIES"
echo "==================================="
check_file "Backend package.json" "backend/package.json"
check_file "Backend node_modules (partial)" "backend/node_modules/express/package.json"
check_file "Frontend package.json" "frontend/package.json"
check_file "Frontend node_modules (partial)" "frontend/node_modules/react/package.json"
echo ""

echo "🗄️ DATABASE FILES"
echo "==================================="
check_file "Supabase Schema" "SUPABASE_DATABASE_SCHEMA.sql"
echo ""

echo "📚 DOCUMENTATION FILES"
echo "==================================="
check_file "Complete Deployment Guide" "COMPLETE_DEPLOYMENT_GUIDE.md"
check_file "Integration Testing Guide" "INTEGRATION_TESTING_GUIDE.md"
check_file "Backend Migration Summary" "BACKEND_MIGRATION_SUMMARY.md"
check_file "Route Migration Guide" "ROUTE_MIGRATION_GUIDE.md"
check_file "Supabase Deployment Checklist" "SUPABASE_DEPLOYMENT_CHECKLIST.md"
echo ""

echo "🔌 KEY ROUTES UPDATED"
echo "==================================="
check_file "Auth Routes (Supabase)" "backend/routes/auth-supabase.js"
check_file "Contact Routes (Supabase)" "backend/routes/contact.js"
check_file "Admin Routes (Supabase)" "backend/routes/admin.js"
check_file "Orders Routes (Supabase)" "backend/routes/orders.js"
echo ""

echo "📊 FINAL SUMMARY"
echo "=================================="
TOTAL=$((PASS + FAIL))
echo -e "Tests Passed: ${GREEN}$PASS${NC}/$TOTAL"
echo -e "Tests Failed: ${RED}$FAIL${NC}/$TOTAL"

if [ $FAIL -eq 0 ]; then
    echo ""
    echo -e "${GREEN}✅ ALL CHECKS PASSED!${NC}"
    echo ""
    echo "Next steps:"
    echo "1. Run integration tests: ./run-tests.sh"
    echo "2. Start backend: cd backend && npm run dev"
    echo "3. Start frontend: cd frontend && npm run dev"
    echo "4. Open http://localhost:5173"
    echo "5. Follow COMPLETE_DEPLOYMENT_GUIDE.md for production"
    echo ""
    exit 0
else
    echo ""
    echo -e "${RED}❌ SOME CHECKS FAILED${NC}"
    echo ""
    echo "Issues to fix:"
    echo "- Ensure backend/.env exists and has all Supabase credentials"
    echo "- Ensure frontend/.env.local exists and has correct API URL"
    echo "- Ensure npm install has been run in both directories"
    echo "- Ensure SUPABASE_DATABASE_SCHEMA.sql is in project root"
    echo ""
    exit 1
fi
