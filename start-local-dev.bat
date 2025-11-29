@echo off
echo ========================================
echo Grandson Project - Mode Développement Local
echo ========================================
echo.

echo Démarrage du serveur backend local...
start "Backend Local" cmd /k "cd backend && node local-server.js"

timeout /t 3 /nobreak >nul

echo Démarrage du serveur frontend...
start "Frontend" cmd /k "cd frontend && npm run dev"

echo.
echo ========================================
echo Serveurs démarrés en mode local !
echo.
echo Backend:  http://localhost:3001
echo Frontend: http://localhost:3000
echo Admin:    http://localhost:3000/admin/login
echo.
echo Identifiants admin:
echo   Username: admin
echo   Password: admin123
echo.
echo Appuyez sur une touche pour arrêter...
echo ========================================
pause >nul

REM Arrêter les processus
taskkill /FI "WindowTitle eq Backend Local*" /T /F >nul 2>nul
taskkill /FI "WindowTitle eq Frontend*" /T /F >nul 2>nul

echo.
echo Serveurs arrêtés.
pause