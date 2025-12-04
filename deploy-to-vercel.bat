@echo off
echo ========================================
echo   DEPLOIEMENT VERCEL - GRANDSON PROJECT
echo ========================================
echo.

echo Etape 1: Connexion a Vercel...
vercel login

echo.
echo Etape 2: Deploiement en production...
cd frontend
vercel --prod

echo.
echo ========================================
echo   DEPLOIEMENT TERMINE!
echo ========================================
echo.
echo Verifiez votre deploiement sur:
echo https://vercel.com/dashboard
echo.
pause
