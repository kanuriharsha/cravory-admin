@echo off
echo ========================================
echo Cravory Admin - Full Stack Application
echo ========================================
echo.
echo Starting Backend Server...
echo.

cd backend
start cmd /k "npm start"

echo Backend server starting on http://localhost:5000
echo.
echo Waiting 5 seconds for backend to initialize...
timeout /t 5 /nobreak >nul
echo.
echo Now start the frontend with: bun run dev
echo.
echo ========================================
echo Backend is running in a separate window
echo ========================================
pause
