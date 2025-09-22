@echo off
echo Starting ACC Website Test Suite...
echo.

REM Check if Node.js is installed
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ERROR: Node.js is not installed or not in PATH
    pause
    exit /b 1
)

REM Check if the application is running
echo Checking if application is running on localhost:3000...
curl -s http://localhost:3000 >nul 2>&1
if %errorlevel% neq 0 (
    echo WARNING: Application is not running on localhost:3000
    echo Please start the application first with: npm run dev
    echo.
    echo Do you want to continue anyway? (y/n)
    set /p choice=
    if /i "%choice%" neq "y" (
        echo Test suite cancelled.
        pause
        exit /b 1
    )
)

echo.
echo Running test suite...
echo ========================================

REM Run the test suite
node test-suite.js

REM Check the exit code
if %errorlevel% equ 0 (
    echo.
    echo ========================================
    echo ✅ ALL TESTS PASSED - Safe to deploy!
    echo ========================================
) else (
    echo.
    echo ========================================
    echo ❌ SOME TESTS FAILED - Deployment blocked!
    echo ========================================
)

echo.
pause
