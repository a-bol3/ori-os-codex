#!/usr/bin/env bash
set -Eeuo pipefail
umask 077

APP_DIR="${ORIOS_STAGING_APP_DIR:-$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)}"
ENV_FILE="$APP_DIR/.env.staging"
COMPOSE_PROJECT="orios-staging"
COMPOSE_FILE="$APP_DIR/docker-compose.staging.yml"

usage() {
  cat <<'EOF'
Usage:
  orios-deploy-staging-release --source <40-hex-commit> \
    --api <ghcr.io/a-bol3/ori-os-api@sha256:64-hex> \
    --worker <ghcr.io/a-bol3/ori-os-worker@sha256:64-hex> \
    --web <ghcr.io/a-bol3/ori-os-web@sha256:64-hex>

Deploys only the pinned ORI-OS staging images into the isolated
orios-staging Compose project.
EOF
}

fail() {
  echo "ERROR: $*" >&2
  exit 1
}

SOURCE_COMMIT=""
API_IMAGE=""
WORKER_IMAGE=""
WEB_IMAGE=""

while [[ $# -gt 0 ]]; do
  case "$1" in
    --source) [[ $# -ge 2 ]] || fail "--source requires a value"; SOURCE_COMMIT=$2; shift 2 ;;
    --api) [[ $# -ge 2 ]] || fail "--api requires a value"; API_IMAGE=$2; shift 2 ;;
    --worker) [[ $# -ge 2 ]] || fail "--worker requires a value"; WORKER_IMAGE=$2; shift 2 ;;
    --web) [[ $# -ge 2 ]] || fail "--web requires a value"; WEB_IMAGE=$2; shift 2 ;;
    --help|-h) usage; exit 0 ;;
    *) fail "unknown argument: $1" ;;
  esac
done

[[ "$SOURCE_COMMIT" =~ ^[0-9a-fA-F]{40}$ ]] || fail "source must be a full 40-character commit SHA"
[[ "$API_IMAGE" =~ ^ghcr\.io/a-bol3/ori-os-api@sha256:[0-9a-fA-F]{64}$ ]] || fail "invalid api image reference"
[[ "$WORKER_IMAGE" =~ ^ghcr\.io/a-bol3/ori-os-worker@sha256:[0-9a-fA-F]{64}$ ]] || fail "invalid worker image reference"
[[ "$WEB_IMAGE" =~ ^ghcr\.io/a-bol3/ori-os-web@sha256:[0-9a-fA-F]{64}$ ]] || fail "invalid web image reference"

command -v git >/dev/null || fail "git is required"
command -v docker >/dev/null || fail "docker is required"
command -v curl >/dev/null || fail "curl is required"
[[ -d "$APP_DIR/.git" ]] || fail "missing repository: $APP_DIR"
[[ -f "$ENV_FILE" ]] || fail "missing environment file: $ENV_FILE"
[[ -f "$COMPOSE_FILE" ]] || fail "missing Compose file: $COMPOSE_FILE"

BRANCH=$(git -C "$APP_DIR" branch --show-current)
[[ "$BRANCH" == main ]] || fail "repository must be on main (found: ${BRANCH:-detached})"
git -C "$APP_DIR" fetch --quiet origin main
REMOTE_MAIN=$(git -C "$APP_DIR" rev-parse --verify origin/main^{commit})
LOCAL_HEAD=$(git -C "$APP_DIR" rev-parse --verify HEAD)
[[ "$REMOTE_MAIN" == "$SOURCE_COMMIT" ]] || fail "source does not match origin/main ($REMOTE_MAIN)"
[[ "$LOCAL_HEAD" == "$SOURCE_COMMIT" ]] || fail "checked-out HEAD does not match source ($LOCAL_HEAD)"
[[ -z "$(git -C "$APP_DIR" status --porcelain)" ]] || fail "working tree is not clean"

export ORI_OS_API_IMAGE="$API_IMAGE"
export ORI_OS_WORKER_IMAGE="$WORKER_IMAGE"
export ORI_OS_WEB_IMAGE="$WEB_IMAGE"
export ORIOS_STAGING_ENV_FILE="$ENV_FILE"

compose() {
  docker compose -p "$COMPOSE_PROJECT" --env-file "$ENV_FILE" -f "$COMPOSE_FILE" "$@"
}

compose config --quiet || fail "effective staging Compose configuration is invalid"

echo "Pulling pinned staging images before changing services..."
docker pull "$API_IMAGE"
docker pull "$WORKER_IMAGE"
docker pull "$WEB_IMAGE"

echo "Starting isolated staging project ${COMPOSE_PROJECT}..."
compose up -d --pull never postgres redis meilisearch minio api worker web

wait_for_service() {
  local service="$1"
  local timeout="${2:-180}"
  local started
  started=$(date +%s)

  while true; do
    local container_id
    container_id=$(compose ps -q "$service")
    if [[ -n "$container_id" ]]; then
      local status
      status=$(docker inspect -f '{{if .State.Health}}{{.State.Health.Status}}{{else}}{{.State.Status}}{{end}}' "$container_id")
      case "$status" in
        healthy|running) echo "${service}: ${status}"; return 0 ;;
        exited|dead) compose logs "$service" --tail=120; fail "${service} failed with status ${status}" ;;
      esac
    fi
    if [[ "$(date +%s)" -ge $((started + timeout)) ]]; then
      compose logs "$service" --tail=120
      fail "timed out waiting for ${service}"
    fi
    sleep 3
  done
}

wait_for_http() {
  local url="$1"
  local name="$2"
  local timeout="${3:-180}"
  local started
  started=$(date +%s)

  while true; do
    if curl -fsS --max-time 10 "$url" >/dev/null; then
      echo "${name}: OK"
      return 0
    fi
    if [[ "$(date +%s)" -ge $((started + timeout)) ]]; then
      fail "timed out waiting for ${name} at ${url}"
    fi
    sleep 5
  done
}

for service in postgres redis meilisearch minio api worker web; do
  wait_for_service "$service"
done

compose exec -T api npx prisma migrate deploy --schema packages/db/prisma/schema.prisma
wait_for_http http://127.0.0.1:4200/health "staging API health"
wait_for_http http://127.0.0.1:4200/ready "staging API readiness"
wait_for_http http://127.0.0.1:3200/login "staging web"

echo "Staging deployment completed for ${SOURCE_COMMIT}."
compose ps api worker web
