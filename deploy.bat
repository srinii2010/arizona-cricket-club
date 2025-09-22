@echo off
REM ACC Website Deployment Script for Windows
REM This script ensures tests pass before deploying to Vercel

echo 🚀 Starting ACC Website Deployment Process
echo ==========================================

REM Check if Node.js is installed
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Node.js is not installed. Please install Node.js first.
    pause
    exit /b 1
)

REM Check if npm is installed
npm --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ npm is not installed. Please install npm first.
    pause
    exit /b 1
)

echo ✅ Prerequisites check passed
echo.

REM Install dependencies
echo 📦 Installing dependencies...
npm ci
if %errorlevel% neq 0 (
    echo ❌ Failed to install dependencies
    pause
    exit /b 1
)

REM Run linting
echo 🔍 Running linting...
npm run lint
if %errorlevel% neq 0 (
    echo ❌ Linting failed. Please fix linting errors before deploying.
    pause
    exit /b 1
)

REM Run tests
echo 🧪 Running test suite...
npm run test
if %errorlevel% neq 0 (
    echo ❌ Tests failed. Please fix failing tests before deploying.
    pause
    exit /b 1
)

REM Build application
echo 🔨 Building application...
npm run build
if %errorlevel% neq 0 (
    echo ❌ Build failed. Please fix build errors before deploying.
    pause
    exit /b 1
)

echo ✅ All checks passed! Proceeding with deployment...
echo.

REM Deploy to Vercel
echo 🚀 Deploying to Vercel...
vercel --prod

if %errorlevel% equ 0 (
    echo.
    echo 🎉 Deployment successful!
    echo ✅ Your ACC website has been deployed to Vercel
    echo 🌐 Check your Vercel dashboard for the deployment URL
) else (
    echo ❌ Deployment failed. Please check the error messages above.
    pause
    exit /b 1
)

pause
