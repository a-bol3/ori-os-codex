# Hostinger VPS Deployment Guide - Ori-OS

This guide provides step-by-step instructions for provisioning a Hostinger VPS and deploying the Ori-OS production stack.

## 1. VPS Provisioning (Hostinger Panel)

1. **Operating System**: Choose **Ubuntu 24.04 64bit**.
2. **Resource Allocation**: Minimum 4GB RAM / 2 vCPUs recommended for the full stack.
3. **SSH Keys**: Add your public SSH key to the Hostinger panel for secure access.
4. **Firewall**: In the "Firewall" section of the VPS dashboard, ensure the following ports are open:
   - `22`: SSH
   - `80`: HTTP (Caddy)
   - `443`: HTTPS (Caddy)

## 2. Server Preparation

Connect to your VPS:
```bash
ssh root@your-vps-ip
```

### Install Docker & Workspace Tools
```bash
# Update system
apt update && apt upgrade -y

# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sh get-docker.sh

# Install Node.js (for pnpm/turbo local tools, optional if using strictly Docker)
curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
apt install -y nodejs git curl htop

# Install pnpm
npm install -g pnpm
```

## 3. Application Deployment

### Clone the Repository
```bash
git clone https://github.com/ib4d/ori-os-chatzai.git /opt/ori-os
cd /opt/ori-os
```

### Configure Environment
Create a `.env` file based on `.env.example`. Refer to [PRODUCTION_SETUP.md](./PRODUCTION_SETUP.md) for detailed variable descriptions.

```bash
cp .env.example .env
nano .env
```

**CRITICAL PRODUCTION SETTINGS**:
- `ORI_AUTH_BYPASS=0`
- `NODE_ENV=production`
- `APP_DOMAIN=your-domain.com`

### Build and Start Stack
```bash
# Pull and build images
docker compose -f docker-compose.prod.yml build

# Start services in detached mode
docker compose -f docker-compose.prod.yml up -d
```

## 4. Post-Deployment

### Apply Database Migrations
```bash
docker compose -f docker-compose.prod.yml run --rm api pnpm --filter @ori-os/db prisma migrate deploy
```

### Verify Status
- Frontend: `https://your-domain.com`
- API: `https://api.your-domain.com/health`
- Check Logs: `docker compose -f docker-compose.prod.yml logs -f`

## Troubleshooting

1. **DNS Propagation**: Ensure your A records point to the VPS IP and wait a few minutes for Caddy to issue certificates.
2. **Permission Denied**: If you get Docker permission errors, ensure your user is in the `docker` group.
3. **Memory Issues**: If the build fails due to memory, you may need a swap file:
   ```bash
   fallocate -l 2G /swapfile
   chmod 600 /swapfile
   mkswap /swapfile
   swapon /swapfile
   ```
