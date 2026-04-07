@echo off
echo ======================================================
echo  KreatifCMS Manual Installation Script
echo ======================================================
echo.

echo [1/7] Installing NPM dependencies (npm i)...
call npm install
if %ERRORLEVEL% neq 0 (
    echo Error: npm install failed.
    exit /b %ERRORLEVEL%
)

echo.
echo [2/7] Installing Composer dependencies (composer i)...
call composer install
if %ERRORLEVEL% neq 0 (
    echo Error: composer install failed.
    exit /b %ERRORLEVEL%
)

echo.
echo [3/7] Fixing NPM vulnerabilities (npm audit fix)...
call npm audit fix

echo.
echo [4/7] Linking storage (php artisan storage:link)...
call php artisan storage:link

echo.
echo [5/7] Running database migrations (php artisan migrate)...
call php artisan migrate
if %ERRORLEVEL% neq 0 (
    echo Error: php artisan migrate failed.
    exit /b %ERRORLEVEL%
)

echo.
echo [6/7] Building assets (npm run build)...
call npm run build
if %ERRORLEVEL% neq 0 (
    echo Error: npm run build failed.
    exit /b %ERRORLEVEL%
)

echo.
echo [7/7] Starting development server (php artisan serve)...
echo Preparation complete! Starting server...
call php artisan serve
