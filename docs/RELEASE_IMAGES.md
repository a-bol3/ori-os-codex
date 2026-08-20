# Release images

ORI-OS production must consume images published by GitHub Actions, not build
inside the VPS. The workflow at `.github/workflows/release-images.yml`
publishes `api`, `worker`, and `web` to GHCR for a tagged release or a manual
run. Every image receives a commit tag such as `sha-af9e1f8...`.

The release Compose overlay is `docker-compose.prod.release.yml`. It removes
the local `build` definitions and requires explicit image references:

```text
ORI_OS_API_IMAGE=ghcr.io/a-bol3/ori-os-api@sha256:...
ORI_OS_WORKER_IMAGE=ghcr.io/a-bol3/ori-os-worker@sha256:...
ORI_OS_WEB_IMAGE=ghcr.io/a-bol3/ori-os-web@sha256:...
```

Do not put registry credentials or application secrets in this document. The
VPS release procedure must record the selected commit, image digests, database
migration result, operator, and rollback target in `OPERATIONS_LEDGER.md`.

The current production Compose file remains available for local development
and inspection, but it must not be used for a production rollout because its
service definitions still contain local `build` instructions.
