@echo off
REM Script de déploiement Vercel pour Windows
REM Usage: deploy-vercel.bat

echo.
echo ========================================
echo   DEPLOIEMENT VERCEL
echo ========================================
echo.

REM Vérifier que Vercel CLI est installé
where vercel >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo ❌ Vercel CLI n'est pas installé
    echo Installation: npm install -g vercel
    pause
    exit /b 1
)

REM Vérifier la branche actuelle
for /f %%i in ('git rev-parse --abbrev-ref HEAD') do set CURRENT_BRANCH=%%i
if not "%CURRENT_BRANCH%"=="main" (
    echo ⚠️  Vous êtes sur la branche %CURRENT_BRANCH%, pas main
    echo Basculez sur main: git checkout main
    pause
    exit /b 1
)

REM Vérifier qu'il n'y a pas de changements non commités
git diff-index --quiet HEAD --
if %ERRORLEVEL% NEQ 0 (
    echo ⚠️  Il y a des changements non commités
    echo Commitez d'abord: git add -A ^&^& git commit -m "message"
    pause
    exit /b 1
)

echo ✅ Vérifications réussies
echo.

REM Déployer en production
echo 📦 Déploiement en production...
echo.
vercel --prod

if %ERRORLEVEL% EQU 0 (
    echo.
    echo ✅ Déploiement réussi !
    echo.
    echo 📍 Votre site est maintenant en ligne
    echo 🔗 Vérifiez: https://vercel.com/dashboard
    echo.
) else (
    echo.
    echo ❌ Erreur lors du déploiement
    pause
    exit /b 1
)

pause
