#!/bin/bash

# ============================================================
#  KreatifCMS - Server Deploy & Permission Fix Script
#  Jalankan sebagai root atau dengan sudo
# ============================================================

set -e

# ---- Konfigurasi (Sesuaikan jika perlu) ----
APP_DIR="${1:-$(pwd)}"
WEB_USER="${2:-}"
PHP_VERSION="${3:-}"

# ---- Warna output ----
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

print_step() {
    echo -e "\n${CYAN}[$1]${NC} $2"
}

print_ok() {
    echo -e "  ${GREEN}✓${NC} $1"
}

print_warn() {
    echo -e "  ${YELLOW}⚠${NC} $1"
}

print_error() {
    echo -e "  ${RED}✗${NC} $1"
}

# ---- Cek root ----
if [ "$EUID" -ne 0 ]; then
    echo -e "${RED}Error: Script ini harus dijalankan sebagai root atau dengan sudo.${NC}"
    echo "Usage: sudo ./deploy.sh [APP_DIR] [WEB_USER] [PHP_VERSION]"
    echo ""
    echo "Contoh:"
    echo "  sudo ./deploy.sh /home/vmdemo/cms"
    echo "  sudo ./deploy.sh /home/vmdemo/cms www-data 8.3"
    exit 1
fi

echo "============================================================"
echo " KreatifCMS - Server Deploy & Permission Fix"
echo "============================================================"

# ---- Resolve APP_DIR ke absolute path ----
APP_DIR=$(realpath "$APP_DIR")
print_step "0/8" "Aplikasi di: ${APP_DIR}"

if [ ! -f "$APP_DIR/artisan" ]; then
    print_error "File artisan tidak ditemukan di $APP_DIR"
    print_error "Pastikan path menunjuk ke root project Laravel."
    exit 1
fi

# ---- Auto-detect web server user ----
if [ -z "$WEB_USER" ]; then
    if id "www-data" &>/dev/null; then
        WEB_USER="www-data"
    elif id "nginx" &>/dev/null; then
        WEB_USER="nginx"
    elif id "apache" &>/dev/null; then
        WEB_USER="apache"
    elif id "http" &>/dev/null; then
        WEB_USER="http"
    else
        print_error "Web server user tidak terdeteksi. Jalankan dengan parameter:"
        echo "  sudo ./deploy.sh $APP_DIR <WEB_USER>"
        exit 1
    fi
fi
print_ok "Web server user: ${WEB_USER}"

# ---- Auto-detect PHP-FPM version ----
if [ -z "$PHP_VERSION" ]; then
    PHP_VERSION=$(php -r 'echo PHP_MAJOR_VERSION.".".PHP_MINOR_VERSION;' 2>/dev/null || echo "")
fi

if [ -n "$PHP_VERSION" ]; then
    print_ok "PHP Version: ${PHP_VERSION}"
fi

# ============================================================
#  STEP 1: Fix Home Directory Permission (Penyebab error 13)
# ============================================================
print_step "1/8" "Fixing home directory permission..."

# Ambil home directory dari path (misal: /home/vmdemo/cms → /home/vmdemo)
HOME_DIR=$(echo "$APP_DIR" | grep -oP '^/home/[^/]+' || echo "")

if [ -n "$HOME_DIR" ] && [ -d "$HOME_DIR" ]; then
    CURRENT_PERM=$(stat -c '%a' "$HOME_DIR")
    if [ "$CURRENT_PERM" = "700" ] || [ "$CURRENT_PERM" = "750" ]; then
        chmod 711 "$HOME_DIR"
        print_ok "Home directory $HOME_DIR diubah dari $CURRENT_PERM → 711"
    else
        print_ok "Home directory $HOME_DIR sudah OK (permission: $CURRENT_PERM)"
    fi
else
    print_warn "Aplikasi tidak di /home/*, skip home directory fix."
fi

# ============================================================
#  STEP 2: Fix Ownership
# ============================================================
print_step "2/8" "Fixing file ownership..."

chown -R "${WEB_USER}:${WEB_USER}" "$APP_DIR"
print_ok "Ownership diubah ke ${WEB_USER}:${WEB_USER}"

# ============================================================
#  STEP 3: Fix File & Directory Permissions
# ============================================================
print_step "3/8" "Fixing file & directory permissions..."

# Direktori: 755 (rwxr-xr-x)
find "$APP_DIR" -type d -exec chmod 755 {} \;
print_ok "Semua direktori → 755"

# File: 644 (rw-r--r--)
find "$APP_DIR" -type f -exec chmod 644 {} \;
print_ok "Semua file → 644"

# Artisan & script harus executable
chmod 755 "$APP_DIR/artisan"
[ -f "$APP_DIR/install.sh" ] && chmod 755 "$APP_DIR/install.sh"
[ -f "$APP_DIR/deploy.sh" ] && chmod 755 "$APP_DIR/deploy.sh"
print_ok "Script artisan, install.sh, deploy.sh → 755"

# ============================================================
#  STEP 4: Fix Laravel Storage & Cache (Writable)
# ============================================================
print_step "4/8" "Fixing Laravel storage & cache permissions..."

WRITABLE_DIRS=(
    "$APP_DIR/storage"
    "$APP_DIR/storage/app"
    "$APP_DIR/storage/app/public"
    "$APP_DIR/storage/framework"
    "$APP_DIR/storage/framework/cache"
    "$APP_DIR/storage/framework/sessions"
    "$APP_DIR/storage/framework/views"
    "$APP_DIR/storage/logs"
    "$APP_DIR/bootstrap/cache"
)

for dir in "${WRITABLE_DIRS[@]}"; do
    if [ ! -d "$dir" ]; then
        mkdir -p "$dir"
        print_ok "Created: $dir"
    fi
done

chmod -R 775 "$APP_DIR/storage"
chmod -R 775 "$APP_DIR/bootstrap/cache"
print_ok "storage/ & bootstrap/cache/ → 775"

# ============================================================
#  STEP 5: Fix SELinux (jika aktif)
# ============================================================
print_step "5/8" "Checking SELinux..."

if command -v getenforce &>/dev/null; then
    SELINUX_STATUS=$(getenforce 2>/dev/null || echo "Disabled")
    if [ "$SELINUX_STATUS" = "Enforcing" ] || [ "$SELINUX_STATUS" = "Permissive" ]; then
        print_warn "SELinux aktif ($SELINUX_STATUS), applying context..."
        setsebool -P httpd_read_user_content 1 2>/dev/null || true
        chcon -Rt httpd_sys_content_t "$APP_DIR" 2>/dev/null || true
        chcon -Rt httpd_sys_rw_content_t "$APP_DIR/storage" 2>/dev/null || true
        chcon -Rt httpd_sys_rw_content_t "$APP_DIR/bootstrap/cache" 2>/dev/null || true
        print_ok "SELinux context applied."
    else
        print_ok "SELinux tidak aktif, skip."
    fi
else
    print_ok "SELinux tidak terinstall, skip."
fi

# ============================================================
#  STEP 6: Laravel Optimizations
# ============================================================
print_step "6/8" "Running Laravel optimizations..."

cd "$APP_DIR"

# Run database migrations
php artisan migrate --force 2>/dev/null || true
print_ok "Database migrations executed."

# Build frontend assets if package.json exists
if [ -f "$APP_DIR/package.json" ]; then
    print_step "6b/8" "Building frontend assets (Vite)..."
    # Ensure command 'npm' exists
    if command -v npm &>/dev/null; then
        npm install --no-audit --no-fund 2>/dev/null || true
        npm run build 2>/dev/null || true
        print_ok "Frontend assets built successfully."
    else
        print_warn "npm command not found. Skip asset build."
    fi
fi

# Clear old caches
php artisan config:clear 2>/dev/null || true
php artisan route:clear 2>/dev/null || true
php artisan view:clear 2>/dev/null || true
print_ok "Cache lama dibersihkan."

# Build fresh caches
php artisan config:cache 2>/dev/null || true
php artisan route:cache 2>/dev/null || true
php artisan view:cache 2>/dev/null || true
print_ok "Cache baru di-build."

# Storage link
php artisan storage:link 2>/dev/null || true
print_ok "Storage link OK."

# ============================================================
#  STEP 7: Restart Services
# ============================================================
print_step "7/8" "Restarting services..."

# Restart PHP-FPM
PHP_FPM_RESTARTED=false
if [ -n "$PHP_VERSION" ]; then
    # Coba format: php8.3-fpm, php-fpm
    for service_name in "php${PHP_VERSION}-fpm" "php-fpm"; do
        if systemctl is-active --quiet "$service_name" 2>/dev/null; then
            systemctl restart "$service_name"
            print_ok "Restarted: $service_name"
            PHP_FPM_RESTARTED=true
            break
        fi
    done
fi

if [ "$PHP_FPM_RESTARTED" = false ]; then
    # Fallback: cari service php-fpm yang aktif
    FPM_SERVICE=$(systemctl list-units --type=service --state=running 2>/dev/null | grep -oP 'php[0-9.]*-fpm\.service' | head -1 || echo "")
    if [ -n "$FPM_SERVICE" ]; then
        systemctl restart "$FPM_SERVICE"
        print_ok "Restarted: $FPM_SERVICE"
    else
        print_warn "PHP-FPM service tidak ditemukan, skip restart."
    fi
fi

# Restart Nginx
if systemctl is-active --quiet nginx 2>/dev/null; then
    nginx -t 2>/dev/null && systemctl restart nginx
    print_ok "Restarted: nginx"
elif systemctl is-active --quiet apache2 2>/dev/null; then
    systemctl restart apache2
    print_ok "Restarted: apache2"
elif systemctl is-active --quiet httpd 2>/dev/null; then
    systemctl restart httpd
    print_ok "Restarted: httpd"
else
    print_warn "Web server service tidak ditemukan, skip restart."
fi

# ============================================================
#  STEP 8: Verifikasi
# ============================================================
print_step "8/8" "Verifying setup..."

# Cek index.php readable
if [ -r "$APP_DIR/public/index.php" ]; then
    print_ok "public/index.php → readable ✓"
else
    print_error "public/index.php → NOT readable!"
fi

# Cek storage writable
if [ -w "$APP_DIR/storage/logs" ]; then
    print_ok "storage/logs/ → writable ✓"
else
    print_error "storage/logs/ → NOT writable!"
fi

# Cek bootstrap/cache writable
if [ -w "$APP_DIR/bootstrap/cache" ]; then
    print_ok "bootstrap/cache/ → writable ✓"
else
    print_error "bootstrap/cache/ → NOT writable!"
fi

echo ""
echo -e "${GREEN}============================================================${NC}"
echo -e "${GREEN} ✓ Deploy selesai! KreatifCMS siap diakses.${NC}"
echo -e "${GREEN}============================================================${NC}"
echo ""
echo "Jika masih error, cek:"
echo "  1. Nginx config:  sudo nginx -t"
echo "  2. PHP-FPM log:   sudo tail -f /var/log/php*-fpm*.log"
echo "  3. Laravel log:   tail -f $APP_DIR/storage/logs/laravel.log"
echo "  4. Nginx log:     sudo tail -f /var/log/nginx/error.log"
