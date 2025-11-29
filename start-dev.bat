@echo off
echo ========================================
echo Grandson Project E-commerce
echo Starting Development Servers
echo ========================================
echo.

REM Check if Node.js is installed
where node >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo ERROR: Node.js is not installed or not in PATH
    echo Please install Node.js from https://nodejs.org/
    pause
    exit /b 1
)

echo Node.js version:
node --version
echo.

REM Check if dependencies are installed
if not exist "backend\node_modules" (
    echo Installing backend dependencies...
    cd backend
    call npm install
    cd ..
    echo.
)

if not exist "frontend\node_modules" (
    echo Installing frontend dependencies...
    cd frontend
    call npm install
    cd ..
    echo.
)

REM Check if Supabase is configured
echo Checking Supabase configuration...
echo Make sure your Supabase database is set up with the schema
echo Run the SQL script in backend/supabase-schema.sql in your Supabase dashboard
echo.

echo Starting backend server...
start "Grandson Backend" cmd /k "cd backend && node hybrid-server.js"

timeout /t 3 /nobreak >nul

echo Starting frontend server...
start "Grandson Frontend" cmd /k "cd frontend && npm run dev"

echo.
echo ========================================
echo Servers are starting...
echo.
echo Backend:  http://localhost:3001
echo Frontend: http://localhost:3000
echo Admin:    http://localhost:3000/admin/login
echo.
echo Default admin credentials:
echo   Username: admin
echo   Password: admin123
echo.
echo Press any key to stop all servers...
echo ========================================
pause >nul

REM Kill the server processes
taskkill /FI "WindowTitle eq Grandson Backend*" /T /F >nul 2>nul
taskkill /FI "WindowTitle eq Grandson Frontend*" /T /F >nul 2>nul

echo.
echo Servers stopped.
pause
