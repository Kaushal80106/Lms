@echo off
echo ========================================
echo Starting LMS Development Servers
echo ========================================
echo.

echo Starting Backend Server...
start "Backend Server" cmd /k "cd server && npm run server"

echo Waiting 3 seconds for backend to start...
timeout /t 3 /nobreak > nul

echo Starting Frontend Server...
start "Frontend Server" cmd /k "cd client && npm run dev"

echo.
echo ========================================
echo Both servers are starting...
echo Backend: http://localhost:5000
echo Frontend: http://localhost:5173
echo ========================================
echo.
echo Press any key to close this window...
pause > nul
