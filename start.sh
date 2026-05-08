#!/usr/bin/env bash
# =============================================================================
# start.sh — Khởi động toàn bộ TOEIC Platform bằng Docker
#
# Thứ tự:
#   1. Kiểm tra docker / docker compose
#   2. Đảm bảo file .env.docker tồn tại
#   3. Khởi động MySQL và chờ healthy
#   4. Tạo databases (nếu chưa có)
#   5. Import SQL dump MỘT LẦN nếu schema còn trống
#   6. Khởi động tất cả services còn lại
#   7. In thông tin health-check và URL truy cập
# =============================================================================

set -euo pipefail

# ── Màu sắc ──────────────────────────────────────────────────────────────────
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
BOLD='\033[1m'
NC='\033[0m' # No Color

# ── Helpers ───────────────────────────────────────────────────────────────────
info()    { echo -e "${CYAN}[INFO]${NC}  $*"; }
success() { echo -e "${GREEN}[OK]${NC}    $*"; }
warn()    { echo -e "${YELLOW}[WARN]${NC}  $*"; }
error()   { echo -e "${RED}[ERROR]${NC} $*" >&2; }
step()    { echo -e "\n${BOLD}${CYAN}▶ $*${NC}"; }

# ── Thư mục gốc dự án (nơi đặt script này) ───────────────────────────────────
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

ENV_FILE=".env.docker"
COMPOSE_CMD="docker compose"
DUMP_FILE="Dump20260126.sql"
TARGET_DB="db_do_an_tot_nghiep"

# =============================================================================
# Bước 0 – Kiểm tra môi trường
# =============================================================================
step "Kiểm tra môi trường"

if ! command -v docker &>/dev/null; then
  error "Docker chưa được cài đặt. Vui lòng cài Docker Desktop."
  exit 1
fi
success "Docker: $(docker --version)"

if ! $COMPOSE_CMD version &>/dev/null; then
  error "Docker Compose v2 chưa có. Hãy cập nhật Docker Desktop."
  exit 1
fi
success "Docker Compose: $($COMPOSE_CMD version --short)"

# =============================================================================
# Bước 1 – Đảm bảo file .env.docker tồn tại
# =============================================================================
step "Kiểm tra file cấu hình ${ENV_FILE}"

if [ ! -f "$ENV_FILE" ]; then
  if [ -f ".env.docker.example" ]; then
    warn "Không tìm thấy ${ENV_FILE}. Đang sao chép từ .env.docker.example ..."
    cp .env.docker.example "$ENV_FILE"
    warn "Hãy chỉnh sửa ${ENV_FILE} trước khi chạy lại script này."
    exit 1
  else
    error "Không tìm thấy ${ENV_FILE} lẫn .env.docker.example!"
    exit 1
  fi
fi
success "${ENV_FILE} đã tồn tại."

# Đọc MYSQL_ROOT_PASSWORD từ env file
MYSQL_ROOT_PASSWORD=$(grep -E '^MYSQL_ROOT_PASSWORD=' "$ENV_FILE" | cut -d'=' -f2 | tr -d '"'"'" | head -1)
if [ -z "$MYSQL_ROOT_PASSWORD" ]; then
  error "MYSQL_ROOT_PASSWORD chưa được đặt trong ${ENV_FILE}."
  exit 1
fi

# =============================================================================
# Bước 2 – Khởi động MySQL và chờ healthy
# =============================================================================
step "Khởi động MySQL"

$COMPOSE_CMD --env-file "$ENV_FILE" up -d mysql
info "Đang chờ MySQL healthy (tối đa 120 giây)..."

WAIT=0
MAX_WAIT=120
until $COMPOSE_CMD --env-file "$ENV_FILE" exec -T mysql \
      sh -lc "mysqladmin ping -uroot -p\"${MYSQL_ROOT_PASSWORD}\" --silent" &>/dev/null; do
  if [ $WAIT -ge $MAX_WAIT ]; then
    error "MySQL không healthy sau ${MAX_WAIT}s. Kiểm tra logs:"
    $COMPOSE_CMD --env-file "$ENV_FILE" logs --tail=30 mysql
    exit 1
  fi
  sleep 5
  WAIT=$((WAIT + 5))
  info "  ... đã chờ ${WAIT}s"
done
success "MySQL đang healthy."

# =============================================================================
# Bước 3 – Tạo databases (idempotent)
# =============================================================================
step "Tạo databases (nếu chưa có)"

$COMPOSE_CMD --env-file "$ENV_FILE" exec -T mysql \
  sh -lc "mysql -uroot -p\"${MYSQL_ROOT_PASSWORD}\" -e \
    \"CREATE DATABASE IF NOT EXISTS db_do_an_tot_nghiep CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci; \
     CREATE DATABASE IF NOT EXISTS db_doantotnghiep CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;\""

success "Databases đã sẵn sàng."

# =============================================================================
# Bước 4 – Import SQL dump (chỉ một lần nếu schema trống)
# =============================================================================
step "Kiểm tra schema và import SQL dump"

TABLE_COUNT=$($COMPOSE_CMD --env-file "$ENV_FILE" exec -T mysql \
  sh -lc "mysql -N -uroot -p\"${MYSQL_ROOT_PASSWORD}\" -e \
    \"SELECT COUNT(*) FROM information_schema.tables WHERE table_schema='${TARGET_DB}';\"" 2>/dev/null | tr -d '[:space:]')

if [ "$TABLE_COUNT" = "0" ] || [ -z "$TABLE_COUNT" ]; then
  if [ -f "$DUMP_FILE" ]; then
    info "Schema trống → Đang import ${DUMP_FILE} (có thể mất vài phút)..."
    $COMPOSE_CMD --env-file "$ENV_FILE" exec -T mysql \
      sh -lc "mysql -uroot -p\"${MYSQL_ROOT_PASSWORD}\" ${TARGET_DB}" < "$DUMP_FILE"
    success "Import SQL dump hoàn tất."
  else
    warn "File ${DUMP_FILE} không tìm thấy. Bỏ qua bước import."
  fi
else
  success "Schema đã có ${TABLE_COUNT} bảng → bỏ qua import (dữ liệu không bị ghi đè)."
fi

# =============================================================================
# Bước 5 – Khởi động toàn bộ services
# =============================================================================
step "Khởi động tất cả services"

$COMPOSE_CMD --env-file "$ENV_FILE" up -d --build

success "Tất cả containers đã được khởi động."

# =============================================================================
# Bước 6 – Hiển thị trạng thái và thông tin truy cập
# =============================================================================
step "Trạng thái containers"
$COMPOSE_CMD --env-file "$ENV_FILE" ps

echo ""
echo -e "${BOLD}${GREEN}════════════════════════════════════════════${NC}"
echo -e "${BOLD}${GREEN}  🚀 TOEIC Platform đã khởi động thành công!${NC}"
echo -e "${BOLD}${GREEN}════════════════════════════════════════════${NC}"
echo ""
echo -e "  ${BOLD}Frontend DaoKien :${NC}  http://localhost:5173"
echo -e "  ${BOLD}Frontend Ngan    :${NC}  http://localhost:3000"
echo -e "  ${BOLD}Node Backend     :${NC}  http://localhost:3001"
echo -e "  ${BOLD}Spring Backend   :${NC}  http://localhost:8081"
echo -e "  ${BOLD}MySQL            :${NC}  localhost:3306"
echo ""
echo -e "${CYAN}Xem logs theo dịch vụ:${NC}"
echo -e "  $COMPOSE_CMD --env-file $ENV_FILE logs -f spring-backend"
echo -e "  $COMPOSE_CMD --env-file $ENV_FILE logs -f node-backend"
echo -e "  $COMPOSE_CMD --env-file $ENV_FILE logs -f mysql"
echo ""
echo -e "${CYAN}Dừng toàn bộ (giữ dữ liệu DB):${NC}"
echo -e "  $COMPOSE_CMD --env-file $ENV_FILE down"
echo ""
echo -e "${RED}Reset hoàn toàn (xóa cả dữ liệu DB):${NC}"
echo -e "  $COMPOSE_CMD --env-file $ENV_FILE down -v"
echo ""
