# WellTrack

Step 11 draft for running, packaging, and deploying the current `apps/frontend` + `apps/backend` implementation.

## What This README Is For

- Purpose: local execution, Docker execution, and deployment handoff.
- Use when:
  - a developer wants to boot the stack locally
  - CI needs a repeatable build target
  - infra setup needs a baseline for staging or production

## Current App Layout

- `apps/frontend`: Next.js App Router frontend
- `apps/backend`: FastAPI backend + Alembic migrations
- `docker-compose.yml`: local full-stack orchestration draft
- `.env.example`: root compose and shared runtime example
- `apps/backend/.env.example`: backend-only environment example

## Important Deployment Notes

- The current OCR runtime baseline is `paddleocr`.
- The current OCR storage adapter in `apps/backend/app/integrations/r2/client.py` is a local filesystem shim.
- This is safe for local/dev and single-container staging.
- For multi-instance production, replace the shim with a real S3-compatible object storage client.
- Backend health endpoints are available at:
  - `/health/live`
  - `/health/ready`
- Frontend health endpoint is available at:
  - `/api/health`

## Recommended Platform Split

- Frontend: Vercel
- Backend: Docker-based web service on Render
- Database: managed PostgreSQL such as Neon
- Redis/session cache: managed Redis such as Upstash
- Object storage:
  - dev/staging: local volume mounted to backend container
  - production: Cloudflare R2 or another S3-compatible bucket

## Local Development

### 1. Shared infra only

```bash
cp .env.example .env
docker compose up -d postgres redis
```

### 2. Backend

```bash
cd apps/backend
copy .env.example .env
python -m pip install -r requirements.txt
alembic upgrade head
uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```

PowerShell:

```powershell
Set-Location apps/backend
Copy-Item .env.example .env -Force
..\..\.venv\Scripts\python.exe -m pip install -r requirements.txt
..\..\.venv\Scripts\alembic.exe upgrade head
..\..\.venv\Scripts\uvicorn.exe app.main:app --host 0.0.0.0 --port 8000 --reload
```

### 3. Frontend

```bash
cd apps/frontend
npm ci
npm run dev
```

## Full Stack With Docker

```bash
cp .env.example .env
docker compose up --build
```

Expected endpoints:

- Frontend: `http://localhost:3000`
- Backend API: `http://localhost:8000`
- Backend health: `http://localhost:8000/health/live`
- Frontend health: `http://localhost:3000/api/health`

## Deployment Command Examples

### Frontend to Vercel

```bash
vercel --cwd apps/frontend
```

Preview build:

```bash
vercel --cwd apps/frontend --target preview
```

Production promote:

```bash
vercel --cwd apps/frontend --prod
```

### Backend Docker image

```bash
docker build -t welltrack-backend:latest ./apps/backend
docker run --rm -p 8000:8000 --env-file .env welltrack-backend:latest
```

### Frontend Docker image

```bash
docker build \
  --build-arg NEXT_PUBLIC_API_BASE_URL=http://localhost:8000 \
  --build-arg API_BASE_URL=http://backend:8000 \
  -t welltrack-frontend:latest \
  ./apps/frontend
docker run --rm -p 3000:3000 welltrack-frontend:latest
```

## Environment Split Example

### dev

- Frontend public API: `http://localhost:8000`
- Frontend internal API: `http://backend:8000` in Docker, `http://localhost:8000` outside Docker
- Cookie secure: `false`
- Storage: local `.storage`

### staging

- Frontend public API: `https://api-staging.example.com`
- Frontend internal API:
  - same external URL when frontend and backend are on separate hosts
  - private service URL when the platform provides one
- Build note: set `NEXT_PUBLIC_API_BASE_URL` to the staging API URL before building the staging artifact
- Cookie secure: `true`
- Storage: mounted disk or real object storage

### prod

- Frontend public API: `https://api.example.com`
- Build note: rebuild with the production `NEXT_PUBLIC_API_BASE_URL` instead of reusing a preview or staging build
- Cookie secure: `true`
- Storage: S3-compatible object storage strongly recommended
- DB/Redis: managed services only

## Suggested Health Checks

### Backend liveness

```text
GET /health/live
200 when process is booted and request handling works
```

### Backend readiness

```text
GET /health/ready
200 when database, redis, and writable storage are ready
503 when any dependency is unavailable
```

### Frontend health

```text
GET /api/health
200 when Next.js runtime is serving requests
```

## CI / Pre-deploy Checklist

### Frontend

```bash
cd apps/frontend
npm ci
npm run typecheck
npm run build
```

### Backend

```bash
cd apps/backend
python -m pip install -r requirements.txt
alembic upgrade head
python -c "from app.main import app; print(app.title)"
```

Migration rollout note:

- The current container startup command includes `alembic upgrade head` for convenience.
- For larger production rollouts, split migration into a separate release step or one-off job before starting app instances.

## Operations First Response

1. Check frontend `/api/health`
2. Check backend `/health/live`
3. Check backend `/health/ready`
4. Review backend logs
5. Verify PostgreSQL connectivity
6. Verify Redis connectivity
7. Verify OCR storage path or object storage connectivity
8. Review the latest deployment
9. Roll back to the previous image if the issue started immediately after deploy

## Production Safeguards

- R2 shim:
  - Keep the current local-storage adapter only for local/dev or single-instance staging.
  - Before multi-instance production, replace it with a real object storage adapter so upload, OCR source, and review assets are shared across instances.
- Frontend API URL:
  - Set `NEXT_PUBLIC_API_BASE_URL` separately for preview, staging, and production at build time.
  - Do not reuse a preview build artifact in production unless it was built with the production API URL.
- Migration rollout:
  - The current backend container runs migrations at startup for convenience.
  - Once multiple backend instances or concurrent deploys are introduced, move migrations into a dedicated deployment step.

## Files Added In Step 11

- `.env.example`
- `.gitignore`
- `README.md`
- `docker-compose.yml`
- `apps/backend/.env.example`
- `apps/backend/Dockerfile`
- `apps/backend/requirements.txt`
- `apps/backend/app/api/v1/health.py`
- `apps/frontend/Dockerfile`
- `apps/frontend/app/api/health/route.ts`
- `.github/workflows/ci.yml`
- `manual/development process/step_11.txt`
