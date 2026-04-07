@echo off
echo ======================================================
echo  KreatifCMS Manual Installation Script
echo ======================================================
echo.

echo [1/8] Installing NPM dependencies (npm i)...
call npm install
if %ERRORLEVEL% neq 0 (
    echo Error: npm install failed.
    exit /b %ERRORLEVEL%
)

echo.
echo [2/8] Installing Composer dependencies (composer i)...
call composer install
if %ERRORLEVEL% neq 0 (
    echo Error: composer install failed.
    exit /b %ERRORLEVEL%
)

echo.
echo [3/8] Fixing NPM vulnerabilities (npm audit fix)...
call npm audit fix

echo.
echo [4/8] Linking storage (php artisan storage:link)...
call php artisan storage:link

echo.
echo [5/8] Setting up environment file (.env)...
if not exist .env (
    echo Creating .env from .env.example...
    copy .env.example .env
) else (
    echo .env already exists, skipping copy.
)
echo Opening .env for editing...
start notepad .env
echo.
echo IMPORTANT: Please update your database credentials in .env and SAVE the file.
echo After you have saved and closed the editor, press any key to continue to migrations.
pause

echo.
echo [6/8] Running database migrations (php artisan migrate)...
call php artisan migrate
if %ERRORLEVEL% neq 0 (
    echo Error: php artisan migrate failed.
    exit /b %ERRORLEVEL%
)

echo.
echo [7/8] Building assets (npm run build)...
call npm run build
if %ERRORLEVEL% neq 0 (
    echo Error: npm run build failed.
    exit /b %ERRORLEVEL%
)

echo.
echo [8/8] Starting development server (php artisan serve)...
echo Preparation complete! Starting server...
call php artisan serve
