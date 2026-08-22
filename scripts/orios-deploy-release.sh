#!/usr/bin/env bash
set -Eeuo pipefail
umask 077

APP_DIR=/opt/orios-codex
ENV_FILE="$APP_DIR/.env"
MANIFEST_DIR=/var/lib/orios/release-manifests
ENV_BACKUP_DIR=/root/orios-os-env-backups
COMPOSE_PROJECT=orios-app
ENV_TMP=""

usage() {
  cat <<'EOF'
Usage:
  orios-deploy-release --source <40-hex-commit> \
    --api <ghcr.io/a-bol3/ori-os-api@sha256:64-hex> \
    --worker <ghcr.io/a-bol3/ori-os-worker@sha256:64-hex> \
    --web <ghcr.io/a-bol3/ori-os-web@sha256:64-hex>

Deploys only the pinned ORI-OS api, worker and web images.
EOF
}

fail() {
  echo "ERROR: $*" >&2
  exit 1
}

cleanup() {
  if [[ -n "$ENV_TMP" ]]; then
    rm -f -- "$ENV_TMP"
  fi
  if [[ "$ENV_UPDATED" -eq 1 && "$DEPLOY_SUCCEEDED" -eq 0 && -n "$ENV_BACKUP" && -f "$ENV_BACKUP" ]]; then
    cp --preserve=mode,ownership "$ENV_BACKUP" "$ENV_FILE"
    chown root:root "$ENV_FILE"
    chmod 600 "$ENV_FILE"
    compose up -d --no-build --pull never api worker web >/dev/null 2>&1 || true
    echo "WARNING: deployment failed; restored previous .env and restarted ORI-OS services." >&2
  fi
}
trap cleanup EXIT

SOURCE_COMMIT=""
API_IMAGE=""
WORKER_IMAGE=""
WEB_IMAGE=""
ENV_BACKUP=""
ENV_UPDATED=0
DEPLOY_SUCCEEDED=0

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

[[ ${EUID:-$(id -u)} -eq 0 ]] || fail "run this command through sudo as root"
[[ "$SOURCE_COMMIT" =~ ^[0-9a-fA-F]{40}$ ]] || fail "source must be a full 40-character commit SHA"
[[ "$API_IMAGE" =~ ^ghcr\.io/a-bol3/ori-os-api@sha256:[0-9a-fA-F]{64}$ ]] || fail "invalid api image reference"
[[ "$WORKER_IMAGE" =~ ^ghcr\.io/a-bol3/ori-os-worker@sha256:[0-9a-fA-F]{64}$ ]] || fail "invalid worker image reference"
[[ "$WEB_IMAGE" =~ ^ghcr\.io/a-bol3/ori-os-web@sha256:[0-9a-fA-F]{64}$ ]] || fail "invalid web image reference"

command -v git >/dev/null || fail "git is required"
command -v docker >/dev/null || fail "docker is required"
command -v curl >/dev/null || fail "curl is required"
[[ -d "$APP_DIR/.git" ]] || fail "missing repository: $APP_DIR"
[[ -f "$ENV_FILE" ]] || fail "missing environment file: $ENV_FILE"

BRANCH=$(git -C "$APP_DIR" branch --show-current)
[[ "$BRANCH" == main ]] || fail "repository must be on main (found: ${BRANCH:-detached})"
git -C "$APP_DIR" fetch --quiet origin main
REMOTE_MAIN=$(git -C "$APP_DIR" rev-parse --verify origin/main^{commit})
LOCAL_HEAD=$(git -C "$APP_DIR" rev-parse --verify HEAD)
[[ "$REMOTE_MAIN" == "$SOURCE_COMMIT" ]] || fail "source does not match origin/main ($REMOTE_MAIN)"
[[ "$LOCAL_HEAD" == "$SOURCE_COMMIT" ]] || fail "checked-out HEAD does not match source ($LOCAL_HEAD)"
[[ -z "$(git -C "$APP_DIR" status --porcelain)" ]] || fail "working tree is not clean"

compose() {
  docker compose -p "$COMPOSE_PROJECT" --env-file "$ENV_FILE" \
    -f "$APP_DIR/docker-compose.prod.yml" \
    -f "$APP_DIR/docker-compose.prod.release.yml" \
    -f "$APP_DIR/docker-compose.host-nginx.yml" "$@"
}

compose config --quiet || fail "effective Compose configuration is invalid"

for image in ORI_OS_API_IMAGE ORI_OS_WORKER_IMAGE ORI_OS_WEB_IMAGE; do
  [[ $(grep -c "^${image}=" "$ENV_FILE") -eq 1 ]] || fail "$ENV_FILE must contain exactly one ${image} entry"
done

STAMP=$(date -u +%Y%m%dT%H%M%SZ)
mkdir -p "$ENV_BACKUP_DIR" "$MANIFEST_DIR"
chmod 700 "$ENV_BACKUP_DIR" "$MANIFEST_DIR"
ENV_BACKUP="$ENV_BACKUP_DIR/ori-os-prod-$STAMP.env"
cp --preserve=mode,ownership "$ENV_FILE" "$ENV_BACKUP"
chown root:root "$ENV_BACKUP"
chmod 600 "$ENV_BACKUP"

docker pull "$API_IMAGE"
docker pull "$WORKER_IMAGE"
docker pull "$WEB_IMAGE"

ENV_TMP=$(mktemp "${ENV_FILE}.deploy.XXXXXX")
awk -v api="$API_IMAGE" -v worker="$WORKER_IMAGE" -v web="$WEB_IMAGE" '
BEGIN { api_seen=worker_seen=web_seen=0 }
/^ORI_OS_API_IMAGE=/ { print "ORI_OS_API_IMAGE=" api; api_seen=1; next }
/^ORI_OS_WORKER_IMAGE=/ { print "ORI_OS_WORKER_IMAGE=" worker; worker_seen=1; next }
/^ORI_OS_WEB_IMAGE=/ { print "ORI_OS_WEB_IMAGE=" web; web_seen=1; next }
{ print }
END { if (api_seen != 1 || worker_seen != 1 || web_seen != 1) exit 42 }
' "$ENV_FILE" > "$ENV_TMP" || fail "could not update the three release image entries"
chown root:root "$ENV_TMP"
chmod 600 "$ENV_TMP"
mv -f -- "$ENV_TMP" "$ENV_FILE"
ENV_TMP=""
ENV_UPDATED=1

compose config --quiet || fail "effective Compose configuration is invalid after image update"
compose up -d --no-build --pull never api worker web

for container in ori-os-api ori-os-worker ori-os-web; do
  status=$(docker inspect -f '{{.State.Status}}' "$container" 2>/dev/null || true)
  [[ "$status" == running ]] || fail "$container is not running (status: ${status:-missing})"
done

retry_curl() {
  local url=$1
  for _ in $(seq 1 30); do
    if curl -fsS --max-time 10 "$url" >/dev/null; then
      return 0
    fi
    sleep 2
  done
  return 1
}

retry_curl https://api.orios.ori-craftlabs.com/health || fail "public health check failed"
retry_curl https://api.orios.ori-craftlabs.com/ready || fail "public readiness check failed"

MANIFEST="$MANIFEST_DIR/ori-os-$STAMP.manifest"
{
  printf 'source_commit=%s\n' "$SOURCE_COMMIT"
  printf 'api_image=%s\n' "$API_IMAGE"
  printf 'worker_image=%s\n' "$WORKER_IMAGE"
  printf 'web_image=%s\n' "$WEB_IMAGE"
  printf 'deployed_at_utc=%s\n' "$STAMP"
  printf 'operator=%s\n' "${SUDO_USER:-$USER}"
} > "$MANIFEST"
chown root:root "$MANIFEST"
chmod 644 "$MANIFEST"

compose ps api worker web
DEPLOY_SUCCEEDED=1
echo "Deployment completed. Environment backup: $ENV_BACKUP"
echo "Release manifest: $MANIFEST"
