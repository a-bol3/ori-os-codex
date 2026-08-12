#!/bin/bash
set -euo pipefail

COMPOSE_BASE="docker-compose.prod.yml"
COMPOSE_OVERRIDE="docker-compose.host-nginx.yml"
ENV_FILE=".env.prod"
API_HEALTH_URL="${API_HEALTH_URL:-https://api.orios.ori-craftlabs.com/health}"
WEB_HEALTH_URL="${WEB_HEALTH_URL:-https://orios.ori-craftlabs.com}"

wait_for_container() {
  local service="$1"
  local timeout="${2:-180}"
  local start_time
  start_time="$(date +%s)"

  echo "Waiting for ${service}..."

  while true; do
    local container_id
    container_id="$(docker compose --env-file "$ENV_FILE" -f "$COMPOSE_BASE" -f "$COMPOSE_OVERRIDE" ps -q "$service")"

    if [ -n "$container_id" ]; then
      local status
      status="$(docker inspect -f '{{if .State.Health}}{{.State.Health.Status}}{{else}}{{.State.Status}}{{end}}' "$container_id")"

      case "$status" in
        healthy|running)
          echo "${service} is ${status}"
          return 0
          ;;
        exited|dead)
          echo "${service} failed with status ${status}"
          docker compose --env-file "$ENV_FILE" -f "$COMPOSE_BASE" -f "$COMPOSE_OVERRIDE" logs "$service" --tail=120
          return 1
          ;;
      esac
    fi

    if [ "$(date +%s)" -ge $((start_time + timeout)) ]; then
      echo "Timed out waiting for ${service}"
      docker compose --env-file "$ENV_FILE" -f "$COMPOSE_BASE" -f "$COMPOSE_OVERRIDE" logs "$service" --tail=120
      return 1
    fi

    sleep 3
  done
}

wait_for_http() {
  local url="$1"
  local name="$2"
  local timeout="${3:-180}"
  local start_time
  start_time="$(date +%s)"

  echo "Checking ${name} at ${url}..."

  while true; do
    if curl -fsS --max-time 10 "$url" >/dev/null; then
      echo "${name} responded successfully."
      return 0
    fi

    if [ "$(date +%s)" -ge $((start_time + timeout)) ]; then
      echo "Timed out waiting for ${name}"
      return 1
    fi

    sleep 5
  done
}

require_host_binding() {
  local service="$1"
  local expected_port="$2"
  local inspect_port="$3"
  local bindings

  bindings="$(docker inspect "$service" --format '{{json .NetworkSettings.Ports}}')"

  if [[ "$bindings" != *"\"${inspect_port}\":[{\"HostIp\":\"127.0.0.1\",\"HostPort\":\"${expected_port}\"}]"* ]]; then
    echo "Missing host binding for ${service} on 127.0.0.1:${expected_port}. Recreating ${service}..."
    docker compose --env-file "$ENV_FILE" -f "$COMPOSE_BASE" -f "$COMPOSE_OVERRIDE" up -d --force-recreate "${service#ori-os-}"
    bindings="$(docker inspect "$service" --format '{{json .NetworkSettings.Ports}}')"

    if [[ "$bindings" != *"\"${inspect_port}\":[{\"HostIp\":\"127.0.0.1\",\"HostPort\":\"${expected_port}\"}]"* ]]; then
      echo "Failed to restore host binding for ${service}."
      echo "$bindings"
      return 1
    fi
  fi

  echo "${service} host binding OK on 127.0.0.1:${expected_port}"
}

echo "=== ORI-OS host-nginx deploy ==="

if [ ! -f "$ENV_FILE" ]; then
  echo "Missing ${ENV_FILE}. Create it before deploying."
  exit 1
fi

echo "Validating Docker Compose..."
docker compose --env-file "$ENV_FILE" -f "$COMPOSE_BASE" -f "$COMPOSE_OVERRIDE" config >/dev/null

echo "Building application containers sequentially (safe for KVM 1)..."
for service in api worker web; do
  echo "Building ${service}..."
  docker compose --env-file "$ENV_FILE" -f "$COMPOSE_BASE" -f "$COMPOSE_OVERRIDE" build "$service"
done

echo "Starting stack..."
docker compose --env-file "$ENV_FILE" -f "$COMPOSE_BASE" -f "$COMPOSE_OVERRIDE" up -d

wait_for_container postgres 180
wait_for_container redis 180
wait_for_container meilisearch 180
wait_for_container minio 180
wait_for_container api 180
wait_for_container worker 180
wait_for_container web 180

echo "Running migrations..."
docker compose --env-file "$ENV_FILE" -f "$COMPOSE_BASE" -f "$COMPOSE_OVERRIDE" exec -T api \
  npx prisma migrate deploy --schema packages/db/prisma/schema.prisma

echo "Validating host nginx bindings..."
require_host_binding "ori-os-web" "3100" "3000/tcp"
require_host_binding "ori-os-api" "4100" "4000/tcp"

echo "Checking local endpoints..."
wait_for_http "http://127.0.0.1:4100/health" "Local API health endpoint" 120
wait_for_http "http://127.0.0.1:3100/login" "Local web application" 120

echo "Checking public endpoints..."
wait_for_http "$API_HEALTH_URL" "API health endpoint" 180
wait_for_http "$WEB_HEALTH_URL" "Web application" 180

echo "=== Deploy complete ==="
docker compose --env-file "$ENV_FILE" -f "$COMPOSE_BASE" -f "$COMPOSE_OVERRIDE" ps
