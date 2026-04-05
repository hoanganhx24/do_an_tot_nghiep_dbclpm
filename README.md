# TOEIC Platform - Docker Runbook

This repository now supports full-stack Docker orchestration for:

- `mysql` (3306)
- `spring-backend` (8081)
- `node-backend` (3001)
- `daokien-frontend` (5173)
- `ngan-frontend` (3000)

## 1. Prerequisites

- Docker Desktop (or Docker Engine + Compose v2)
- Port `3000`, `3001`, `5173`, `8081` available

## 2. Environment Setup

Project already includes:

- `.env.docker.example` (template)
- `.env.docker` (local default values)

If needed, regenerate local env file:

```bash
cp .env.docker.example .env.docker
```

Then edit `.env.docker` for your secrets before running in shared environments.

## 3. Start MySQL Only (First Boot)

```bash
docker compose --env-file .env.docker up -d mysql
```

Wait until healthy:

```bash
docker compose --env-file .env.docker ps
```

## 4. Manual Database Creation (Required)

Create databases manually from terminal to control initialization and avoid duplicate import behavior:

```bash
docker compose --env-file .env.docker exec -it mysql sh -lc 'mysql -uroot -p"$MYSQL_ROOT_PASSWORD" -e "CREATE DATABASE IF NOT EXISTS db_do_an_tot_nghiep CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci; CREATE DATABASE IF NOT EXISTS db_doantotnghiep CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"'
```

## 5. One-Time Manual SQL Import (No Auto Re-import)

Check if schema is empty before importing:

```bash
docker compose --env-file .env.docker exec -T mysql sh -lc 'mysql -N -uroot -p"$MYSQL_ROOT_PASSWORD" -e "SELECT COUNT(*) FROM information_schema.tables WHERE table_schema=\"db_do_an_tot_nghiep\";"'
```

If result is `0`, import dump one time:

```bash
docker compose --env-file .env.docker exec -T mysql sh -lc 'mysql -uroot -p"$MYSQL_ROOT_PASSWORD" db_do_an_tot_nghiep' < Dump20260126.sql
```

If result is greater than `0`, skip import.

## 6. Start Backends and Frontends

```bash
docker compose --env-file .env.docker up -d spring-backend node-backend
docker compose --env-file .env.docker up -d daokien-frontend ngan-frontend
```

Or start all at once:

```bash
docker compose --env-file .env.docker up -d
```

## 7. Health Verification

```bash
curl http://localhost:3001/health
curl http://localhost:3001/api/exam/health
curl http://localhost:8081/
```

Expected HTTP status:

- Node health endpoints: `200`
- Spring root endpoint: `401` (expected because security is enabled)

Open frontends:

- `http://localhost:5173`
- `http://localhost:3000`

## 8. Why Restart Does Not Duplicate Data

- MySQL data is persisted in named volume `mysql_data`
- There is no auto SQL import mounted into `/docker-entrypoint-initdb.d`
- SQL import is terminal-only and manually triggered

So `docker compose restart` will not re-import dump.

## 9. Useful Commands

View status:

```bash
docker compose --env-file .env.docker ps
```

View logs:

```bash
docker compose --env-file .env.docker logs -f mysql
docker compose --env-file .env.docker logs -f spring-backend
docker compose --env-file .env.docker logs -f node-backend
```

Stop without deleting DB data:

```bash
docker compose --env-file .env.docker down
```

Full reset (will remove DB volume and require re-import):

```bash
docker compose --env-file .env.docker down -v
```

