@echo off
echo 🚀 Starting Supabase Development Environment...
echo.

REM Check if Node.js is installed
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Node.js is not installed or not in PATH
    echo Please install Node.js from https://nodejs.org/
    pause
    exit /b 1
)

REM Check if .env file exists in backend
if not exist "backend\.env" (
    echo ❌ Missing backend/.env file
    echo Please create backend/.env with your Supabase configuration:
    echo SUPABASE_URL=your_supabase_url
    echo SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
    echo JWT_SECRET=your_jwt_secret
    pause
    exit /b 1
)

echo 📦 Installing dependencies...
cd backend
call npm install
if %errorlevel% neq 0 (
    echo ❌ Failed to install backend dependencies
    pause
    exit /b 1
)

cd ../frontend
call npm install
if %errorlevel% neq 0 (
    echo ❌ Failed to install frontend dependencies
    pause
    exit /b 1
)

cd ..

echo.
echo 🔧 Starting Supabase Backend Server...
start "Supabase Backend" cmd /k "cd backend && node supabase-server.js"

echo ⏳ Waiting for backend to start...
timeout /t 3 /nobreak >nul

echo 🎨 Starting Frontend Development Server...
start "Frontend Dev" cmd /k "cd frontend && npm run dev"

echo.
echo ✅ Development environment started!
echo 📱 Frontend: http://localhost:3000
echo 🔧 Backend: http://localhost:3001
echo 💾 Database: Supabase (no test data)
echo.
echo Press any key to stop all servers...
pause >nul

echo 🛑 Stopping servers...
taskkill /f /im node.exe >nul 2>&1
echo ✅ All servers stopped.
pause