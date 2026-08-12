# QA Smoke Tests - ORI-OS

## Health Endpoints
- **API Health Check**: `GET http://localhost:4000/health`
- **Frontend Health Check**: `GET http://localhost:3000/api/health` (if implemented)

## Local Test Commands
```bash
# Verify API is alive
curl -v http://localhost:4000/health

# Verify Web is responding
curl -I http://localhost:3000
```

## Production Verification (Planned)
```bash
# Hostinger VPS Check
curl -v https://api.orios.ori-craftlabs.com/health
curl -I https://orios.ori-craftlabs.com
```
