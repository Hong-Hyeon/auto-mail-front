#!/bin/bash

echo "🚀 Starting production environment..."

cd "$(dirname "$0")/../.." || exit

# 기존 컨테이너가 다른 프로젝트로 실행 중인 경우 정리
echo "🧹 Cleaning up old containers if needed..."
docker-compose -f docker/docker-compose.prod.yml down 2>/dev/null || true

# 기존 컨테이너 이름 충돌 방지: 같은 이름의 컨테이너가 있으면 제거
for container in auto-mail-front-prod; do
    if docker ps -a --format "{{.Names}}" | grep -q "^${container}$"; then
        echo "⚠️  Removing existing container: ${container}"
        docker rm -f "${container}" 2>/dev/null || true
    fi
done

# 프로덕션 환경 실행 (항상 재빌드)
echo "🔨 Building containers (this may take a moment)..."
docker-compose -f docker/docker-compose.prod.yml build --no-cache

echo "🚀 Starting containers..."
docker-compose -f docker/docker-compose.prod.yml up -d

echo "✅ Production environment started!"
echo "🌐 Frontend available at: http://localhost:3000"

