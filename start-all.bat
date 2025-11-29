@echo off
echo 🚀 Démarrage de Grandson Project - Mode Guinéenne Authentique
echo.

echo 📦 Démarrage du serveur backend...
start "Backend Server" cmd /k "cd backend && node hybrid-server.js"

timeout /t 3 /nobreak >nul

echo 🌐 Démarrage du serveur frontend...
start "Frontend Server" cmd /k "cd frontend && npm run dev"

echo.
echo ✅ Les serveurs sont en cours de démarrage...
echo 📱 Frontend: http://localhost:3000
echo 🔧 Backend: http://localhost:3001
echo 👑 Admin: http://localhost:3000/admin/login
echo.
echo 🔑 Identifiants admin:
echo    Username: admin
echo    Password: admin123
echo.
pause