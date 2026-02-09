@echo off
echo ===============================================
echo  OnSpot Admin Portal - Quick Start
echo ===============================================
echo.

echo Checking if backend is running on port 3000...
netstat -ano | findstr :3000 >nul
if %errorlevel%==0 (
    echo [OK] Backend is running on port 3000
) else (
    echo [WARNING] Backend is NOT running!
    echo.
    echo To start the backend, open a new terminal and run:
    echo    cd apps\backend
    echo    npm start
    echo.
    pause
    exit /b 1
)

echo.
echo [INFO] Starting Admin Portal on port 3001...
echo.

cd apps\admin
npm run dev
