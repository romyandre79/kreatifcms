#!/bin/bash

# KreatifCMS Manual Installation Script
# For Linux and macOS

set -e

echo "======================================================"
echo " KreatifCMS Manual Installation Script"
echo "======================================================"
echo

echo "[1/8] Installing NPM dependencies (npm i)..."
npm install

echo
echo "[2/8] Installing Composer dependencies (composer i)..."
composer install

echo
echo "[3/8] Fixing NPM vulnerabilities (npm audit fix)..."
npm audit fix

echo
echo "[4/8] Linking storage (php artisan storage:link)..."
php artisan storage:link

echo
echo "[5/8] Setting up environment file (.env)..."
if [ ! -f .env ]; then
    echo "Creating .env from .env.example..."
    cp .env.example .env
else
    echo ".env already exists, skipping copy."
fi

echo "Opening .env for editing..."
if [[ "$OSTYPE" == "darwin"* ]]; then
    open .env
elif command -v xdg-open > /dev/null; then
    xdg-open .env
else
    nano .env
fi

echo
echo "IMPORTANT: Please update your database credentials in .env and SAVE the file."
read -p "After you have saved the file, press [Enter] to continue to migrations..."

echo
echo "[6/8] Running database migrations (php artisan migrate)..."
php artisan migrate

echo
echo "[7/8] Building assets (npm run build)..."
npm run build

echo
echo "[8/8] Starting development server (php artisan serve)..."
echo "Preparation complete! Starting server..."
php artisan serve
