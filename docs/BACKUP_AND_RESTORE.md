# Backup and Restore Procedures

This document outlines the strategy for protecting and recovering Ori-OS production data.

## 1. Data Components
- **PostgreSQL**: Application state, users, organizations, CRM data.
- **Redis**: Job queues and session cache (non-persistent backup usually sufficient).
- **MinIO/S3**: Uploaded assets and media.

## 2. Backup Strategy

### Database (PostgreSQL)
We use `pg_dump` for daily logical backups.
- **Schedule**: Every day at 02:00 UTC.
- **Retention**: 30 days of daily backups, 12 months of monthly backups.
- **Storage**: Encrypted S3 bucket in a different region.

**Manual Backup Command:**
```bash
docker exec -t ori-os-db pg_dumpall -c -U user > backup_$(date +%Y%m%d).sql
```

### Media (S3)
- **Strategy**: Cross-region replication (CRR) enabled on the production bucket.
- **Versioning**: Enabled to protect against accidental deletion.

## 3. Restore Procedures

### Database Restore
1. Stop the application services.
2. Drop the existing database.
3. Apply the backup:
```bash
cat backup_file.sql | docker exec -i ori-os-db psql -U user
```
4. Start the application services.

### Media Restore
Normally handled via bucket versioning or CRR. In case of total loss:
1. Re-sync from the secondary region using the S3 CLI.

## 4. Disaster Recovery (DR)
In case of total server failure:
1. Provision a new Hostinger VPS.
2. Clone the repository.
3. Configure `.env` with production secrets.
4. Run `docker compose -f docker-compose.prod.yml up -d`.
5. Restore the latest DB backup.
