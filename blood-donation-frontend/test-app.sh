#!/bin/bash
echo "🧪 Testing Application Setup..."

echo "1. Checking main files:"
ls -la | grep -E "(index.html|vite.config.js)"

echo "2. Checking App.jsx routing:"
grep -E "(Router|Routes|Route)" src/App.jsx && echo "✅ Routing found" || echo "❌ No routing found"

echo "3. Checking AuthContext:"
grep -E "(login|logout|user)" src/context/AuthContext.jsx && echo "✅ Auth functions found" || echo "❌ Auth functions missing"

echo "4. Checking Dashboard:"
ls -la src/pages/Dashboard/Dashboard.jsx && echo "✅ Dashboard exists" || echo "❌ Dashboard missing"

echo ""
echo "🎯 Next: Open http://localhost:3000 and test login!"
