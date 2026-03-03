#!/bin/bash
# Ori-OS Staging Deployment Script
# Usage: ./scripts/deploy-staging.sh

set -e

echo "🚀 Starting Staging Deployment for Ori-OS..."

# 1. Pull latest changes
echo "📥 Pulling latest code..."
git pull origin main

# 2. Build images
echo "🏗️ Building Docker images for staging..."
docker compose -f docker-compose.prod.yml build

# 3. Stop existing services
echo "🛑 Stopping current staging services..."
docker compose -f docker-compose.prod.yml down

# 4. Start services
echo "✨ Starting services in detached mode..."
docker compose -f docker-compose.prod.yml up -d

# 5. Run Database Migrations
echo "🐘 Running database migrations..."
docker compose -f docker-compose.prod.yml exec -T api npx prisma migrate deploy

# 6. Verify Health
echo "🛡️ Verifying service health..."
sleep 10
curl -f https://staging-api.ori-craftlabs.com/health || (echo "❌ API Health Check Failed" && exit 1)
curl -f https://staging.ori-craftlabs.com/api/health || (echo "❌ Web Health Check Failed" && exit 1)

echo "✅ Staging Deployment Complete!"
