#!/bin/sh
set -e

mkdir -p /data

if [ "$NODE_ENV" != "production" ]; then
  echo "Generating Prisma client..."
  npm run db:generate
fi

if [ -d "prisma/migrations" ] && [ "$(ls -A prisma/migrations 2>/dev/null)" ]; then
  echo "Applying database migrations..."
  npx prisma migrate deploy
fi

exec "$@"
