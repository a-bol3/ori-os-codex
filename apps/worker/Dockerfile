FROM node:20-alpine AS base

# Install dependencies only when needed
FROM base AS builder
# Check https://github.com/nodejs/docker-node/tree/b4117f9333da4138b03a546ec926ef50a31506c3#nodealpine to understand why libc6-compat might be needed.
RUN apk add --no-cache libc6-compat
WORKDIR /app

# Install turbo global
RUN npm install turbo --global

COPY . .
RUN turbo prune --scope=@ori-os/worker --docker

# Add installer image
FROM base AS installer
RUN apk add --no-cache libc6-compat
WORKDIR /app

# First install dependencies (as they change less often)
COPY .gitignore .gitignore
COPY --from=builder /app/out/json/ .
COPY --from=builder /app/out/package-lock.json ./package-lock.json
RUN npm ci

# Build the project and its dependencies
COPY --from=builder /app/out/full/ .
COPY turbo.json turbo.json

# Generate Prisma Client
RUN npx turbo run db:generate

# Build the project
RUN npx turbo run build --filter=@ori-os/worker...

FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nestjs

# Copy built artifacts
COPY --from=installer --chown=nestjs:nodejs /app/apps/worker/dist ./dist
COPY --from=installer --chown=nestjs:nodejs /app/apps/worker/package.json ./package.json

# Copy node_modules (including Prisma)
COPY --from=installer --chown=nestjs:nodejs /app/node_modules ./node_modules
# Copy DB package for Prisma Client
COPY --from=installer --chown=nestjs:nodejs /app/packages/db ./packages/db

USER nestjs

CMD ["node", "dist/main.js"]
