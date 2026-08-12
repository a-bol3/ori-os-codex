#!/usr/bin/env bash
set -euo pipefail

cd /opt/orios-app

docker build \
  -f Dockerfile.web \
  --build-arg NEXT_PUBLIC_API_URL="https://api.orios.ori-craftlabs.com" \
  --build-arg NEXT_PUBLIC_APP_URL="https://orios.ori-craftlabs.com" \
  --build-arg NEXT_PUBLIC_SENTRY_DSN="" \
  --build-arg NEXT_PUBLIC_AUTH_BYPASS="" \
  -t orios-app-web:latest \
  .

docker compose --env-file .env.prod \
  -f docker-compose.prod.yml \
  -f docker-compose.host-nginx.yml \
  up -d --force-recreate --no-deps web
