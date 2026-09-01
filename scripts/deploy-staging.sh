#!/usr/bin/env bash
set -Eeuo pipefail

# Compatibility entrypoint. Staging uses its own Compose project, volumes,
# network and host ports; it never reuses the production stack.
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
exec "$SCRIPT_DIR/orios-deploy-staging-release.sh" "$@"
