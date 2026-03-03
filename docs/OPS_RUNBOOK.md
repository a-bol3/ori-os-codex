# Operations Runbook - Ori-OS

This document outlines common operational tasks for maintainers of the Ori-OS production environment.

## Monitoring & Logs

### View Application Logs
```bash
# All logs
docker compose -f docker-compose.prod.yml logs -f

# Specific service logs
docker compose -f docker-compose.prod.yml logs -f web
docker compose -f docker-compose.prod.yml logs -f api
docker compose -f docker-compose.prod.yml logs -f worker
```

### Check Resource Usage
```bash
docker stats
```

## Database Operations

### Backup Database
```bash
docker exec -t ori-os-postgres-prod pg_dumpall -c -U postgres > backup_$(date +%Y%m%d).sql
```

### Restore Database
```bash
cat backup_filename.sql | docker exec -i ori-os-postgres-prod psql -U postgres
```

### Prisma Studio (Emergency Access)
Do not use this in production normally. If needed:
```bash
docker compose -f docker-compose.prod.yml run --rm -p 5555:5555 api pnpm --filter @ori-os/db prisma studio
```

## Scaling and Updates

### Pulling Updates
```bash
git pull origin main
docker compose -f docker-compose.prod.yml up -d --build
```

### Scalability Note
The API and Worker scale horizontally. You can increase replicas if the VPS has enough resources:
```bash
docker compose -f docker-compose.prod.yml up -d --scale worker=2
```

## Disaster Recovery

1. **Container Failure**: Restart the specific container: `docker compose restart api`.
2. **MeiliSearch Corrupt**: Wipe the volume `meili_prod_data` and restart; the system will re-index on next interaction (or run a re-index script if implemented).
3. **Caddy Certificate Issues**: Check `docker logs ori-os-caddy`. Ensure domain is reachable on Port 80.

## Contacts & Support
- **Infrastructure**: root@your-org.com
- **System Admin**: admin@your-org.com
