#!/bin/bash

echo "🔨 Building frontend Docker image..."

cd "$(dirname "$0")/../.." || exit

docker-compose -f docker/docker-compose.yml build

echo "✅ Build completed!"

