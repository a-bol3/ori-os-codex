FROM node:20-alpine AS base

# Install dependencies only when needed
FROM base AS builder
# Check https://github.com/nodejs/docker-node/tree/b4117f9333da4138b03a546ec926ef50a31506c3#nodealpine to understand why libc6-compat might be needed.
RUN apk add --no-cache libc6-compat
WORKDIR /app

# Install turbo global
RUN npm install turbo --global

COPY . .
RUN turbo prune --scope=@ori-os/web --docker

# Add installer image
FROM base AS installer
RUN apk add --no-cache libc6-compat
WORKDIR /app
ENV CI=true

# First install dependencies (as they change less often)
COPY --from=builder /app/out/json/ .
COPY --from=builder /app/out/package-lock.json ./package-lock.json
RUN npm ci

# Build the project and its dependencies
COPY --from=builder /app/out/full/ .
COPY turbo.json turbo.json
COPY tsconfig.base.json tsconfig.base.json

ARG NEXT_PUBLIC_ENABLE_OPERATIONS_CORE=false
ENV NEXT_PUBLIC_ENABLE_OPERATIONS_CORE=${NEXT_PUBLIC_ENABLE_OPERATIONS_CORE}

# Generate Prisma Client
RUN npx prisma generate --schema=packages/db/prisma/schema.prisma

# Build the project
RUN npx turbo run build --filter=@ori-os/web...

FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production
# Disable next.js telemetry
ENV NEXT_TELEMETRY_DISABLED=1

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Set the correct permission for prerender cache
RUN mkdir .next
RUN chown nextjs:nodejs .next

# Automatically leverage output traces to reduce image size
# https://nextjs.org/docs/advanced-features/output-file-tracing
COPY --from=installer --chown=nextjs:nodejs /app/apps/web/.next/standalone ./
COPY --from=installer --chown=nextjs:nodejs /app/apps/web/.next/static ./apps/web/.next/static

USER nextjs

EXPOSE 3000

ENV PORT=3000
# set hostname to localhost
ENV HOSTNAME="0.0.0.0"

CMD ["node", "apps/web/server.js"]
