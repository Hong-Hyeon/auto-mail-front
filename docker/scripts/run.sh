#!/bin/bash

echo "🚀 Starting development environment..."

cd "$(dirname "$0")/../.." || exit

# 개발 환경 실행
docker-compose -f docker/docker-compose.yml up --build

echo "✅ Development environment started!"
echo "🌐 Frontend available at: http://localhost:3000"

