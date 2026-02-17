@echo off
echo ===========================================
echo       Starting Carbon OS (Local)
echo ===========================================
echo.
echo Launching local server...
echo Access at: http://localhost:4173
echo.
echo Press Ctrl+C to stop the server
echo.

:: Check if build exists, if not build it
if not exist "dist" (
    echo Building application...
    call npm run build
)

:: Run the preview server
npm run preview -- --host
