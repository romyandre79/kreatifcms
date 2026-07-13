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
echo "[7/9] Building assets (npm run build)..."
npm run build

echo
echo "[8/9] Fixing permissions..."
# Auto-fix Laravel writable directories
chmod -R 775 storage bootstrap/cache 2>/dev/null || true
# Jika deploy.sh ada dan user adalah root, jalankan full permission fix
if [ "$EUID" -eq 0 ] && [ -f "./deploy.sh" ]; then
    echo "Running full server permission fix (deploy.sh)..."
    bash ./deploy.sh "$(pwd)"
    echo "Permission fix complete!"
else
    echo "Basic permission fix applied (storage & bootstrap/cache)."
    echo "Untuk fix lengkap di server, jalankan: sudo ./deploy.sh"
fi

echo
echo "[9/9] Starting development server (php artisan serve)..."
echo "Preparation complete! Starting server..."
php artisan serve
