#!/bin/bash
set -euo pipefail

if [ "${CLAUDE_CODE_REMOTE:-}" != "true" ]; then
  exit 0
fi

cd "$CLAUDE_PROJECT_DIR"

# Install npm dependencies
npm install

# Start PostgreSQL if not running
if ! pg_isready -q 2>/dev/null; then
  service postgresql start
  sleep 2
fi

# Ensure the database exists
sudo -u postgres psql -tc "SELECT 1 FROM pg_database WHERE datname = 'intlogistics'" | grep -q 1 || \
  sudo -u postgres psql -c "CREATE DATABASE intlogistics OWNER postgres;"

sudo -u postgres psql -c "ALTER USER postgres WITH PASSWORD 'password';" > /dev/null 2>&1

# Generate Prisma client and apply migrations
npx prisma generate
npx prisma migrate deploy
