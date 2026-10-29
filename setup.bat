@echo off
echo.
echo ====================================================
echo  RAAZ AI — Quick Setup Script
echo ====================================================
echo.

REM Check for Node.js
node --version >nul 2>&1
IF %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Node.js is not installed or not on PATH.
    echo.
    echo Please install Node.js from: https://nodejs.org
    echo Then re-run this script.
    echo.
    pause
    exit /b 1
)

echo [OK] Node.js found:
node --version
echo.

REM Check for .env.local
IF NOT EXIST ".env.local" (
    echo [INFO] Creating .env.local from .env.example...
    copy .env.example .env.local >nul
    echo.
    echo [ACTION REQUIRED] Open .env.local and add your GEMINI_API_KEY.
    echo Get a free key at: https://aistudio.google.com/app/apikey
    echo.
    notepad .env.local
    echo.
    echo After saving .env.local, press any key to continue...
    pause >nul
) ELSE (
    echo [OK] .env.local already exists.
)

echo.
echo [INFO] Installing dependencies...
npm install

echo.
echo [INFO] Starting development server...
echo [INFO] Open http://localhost:3000 in your browser.
echo.
npm run dev
