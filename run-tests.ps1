# ACC Website Test Suite Runner
# PowerShell version for Windows

Write-Host "Starting ACC Website Test Suite..." -ForegroundColor Green
Write-Host ""

# Check if Node.js is installed
try {
    $nodeVersion = node --version
    Write-Host "Node.js version: $nodeVersion" -ForegroundColor Cyan
} catch {
    Write-Host "ERROR: Node.js is not installed or not in PATH" -ForegroundColor Red
    Read-Host "Press Enter to exit"
    exit 1
}

# Check if the application is running
Write-Host "Checking if application is running on localhost:3000..." -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "http://localhost:3000" -TimeoutSec 5 -UseBasicParsing
    Write-Host "✅ Application is running" -ForegroundColor Green
} catch {
    Write-Host "⚠️  WARNING: Application is not running on localhost:3000" -ForegroundColor Yellow
    Write-Host "Please start the application first with: npm run dev" -ForegroundColor Yellow
    Write-Host ""
    $choice = Read-Host "Do you want to continue anyway? (y/n)"
    if ($choice -ne "y" -and $choice -ne "Y") {
        Write-Host "Test suite cancelled." -ForegroundColor Red
        Read-Host "Press Enter to exit"
        exit 1
    }
}

Write-Host ""
Write-Host "Running test suite..." -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Cyan

# Run the test suite
try {
    node test-suite.js
    $exitCode = $LASTEXITCODE
    
    Write-Host ""
    Write-Host "========================================" -ForegroundColor Cyan
    
    if ($exitCode -eq 0) {
        Write-Host "✅ ALL TESTS PASSED - Safe to deploy!" -ForegroundColor Green
        Write-Host "========================================" -ForegroundColor Green
    } else {
        Write-Host "❌ SOME TESTS FAILED - Deployment blocked!" -ForegroundColor Red
        Write-Host "========================================" -ForegroundColor Red
    }
} catch {
    Write-Host "❌ Test suite crashed: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host "========================================" -ForegroundColor Red
}

Write-Host ""
Read-Host "Press Enter to exit"
