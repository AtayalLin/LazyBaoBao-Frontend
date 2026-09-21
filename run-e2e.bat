@echo off
chcp 65001 >nul
cd /d "%~dp0"

echo.
echo ========================================
echo   LazyBaoBao Playwright E2E Test
echo ========================================
echo.

echo [1/2] Starting automated tests...
echo.

call npx playwright test --project="Google Chrome"

if errorlevel 1 (
    echo.
    echo ========================================
    echo   TEST FAILED
    echo ========================================
    echo.
    echo Opening Playwright report...
    call npx playwright show-report
    exit /b 1
)

echo.
echo ========================================
echo   ALL TESTS PASSED
echo ========================================
echo.
echo Opening Playwright report...
call npx playwright show-report