#!/bin/bash

# KreatifCMS Manual Installation Script
# For Linux and macOS

set -e

echo "======================================================"
echo " KreatifCMS Manual Installation Script"
echo "======================================================"
echo

echo "[1/7] Installing NPM dependencies (npm i)..."
npm install

echo
echo "[2/7] Installing Composer dependencies (composer i)..."
composer install

echo
echo "[3/7] Fixing NPM vulnerabilities (npm audit fix)..."
npm audit fix

echo
echo "[4/7] Linking storage (php artisan storage:link)..."
php artisan storage:link

echo
echo "[5/7] Running database migrations (php artisan migrate)..."
php artisan migrate

echo
echo "[6/7] Building assets (npm run build)..."
npm run build

echo
echo "[7/7] Starting development server (php artisan serve)..."
echo "Preparation complete! Starting server..."
php artisan serve
