#!/usr/bin/env bash
set -euo pipefail

echo 'before-clean'
ps -eo pid,etime,cmd | grep -E 'docker compose|next build|npm ci' | grep -v grep || true

pkill -f 'docker compose' || true
pkill -f 'next build' || true
pkill -f 'npm ci' || true
sleep 2

echo 'after-clean'
ps -eo pid,etime,cmd | grep -E 'docker compose|next build|npm ci' | grep -v grep || true

cd /opt/orios-app
docker compose --env-file .env.prod -f docker-compose.prod.yml -f docker-compose.host-nginx.yml build web
docker compose --env-file .env.prod -f docker-compose.prod.yml -f docker-compose.host-nginx.yml up -d --force-recreate --no-deps web

echo 'after-deploy'
docker inspect ori-os-web --format '{{.Image}} {{.State.StartedAt}}'
