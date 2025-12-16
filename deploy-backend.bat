@echo off
echo 🚀 Backend Deployment Script
echo.
echo This script will help you deploy the backend to Render
echo.

REM Check if git is installed
git --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Git is not installed. Please install Git first.
    pause
    exit /b 1
)

REM Check if we're in a git repository
git rev-parse --git-dir >nul 2>&1
if errorlevel 1 (
    echo ❌ Not in a git repository. Please run this from the project root.
    pause
    exit /b 1
)

echo ✅ Git is installed and we're in a repository
echo.

REM Build the backend
echo 📦 Building backend...
cd backend
call npm run build
if errorlevel 1 (
    echo ❌ Build failed!
    pause
    exit /b 1
)
cd ..
echo ✅ Build successful!
echo.

REM Commit changes
echo 📝 Committing changes...
git add .
git commit -m "Deploy backend - $(date /t)"
if errorlevel 1 (
    echo ⚠️ Nothing to commit or commit failed
)
echo.

REM Push to GitHub
echo 🚀 Pushing to GitHub...
git push origin main
if errorlevel 1 (
    echo ❌ Push failed!
    pause
    exit /b 1
)
echo ✅ Push successful!
echo.

echo 🎉 Deployment initiated!
echo.
echo Next steps:
echo 1. Go to https://dashboard.render.com
echo 2. Check the deployment status
echo 3. Wait for the build to complete
echo 4. Test the backend at https://grandson-backend.onrender.com/health
echo.
pause
