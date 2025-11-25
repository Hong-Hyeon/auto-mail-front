# Multi-stage build for React + Vite application

# Stage 1: Build
FROM node:20-alpine AS builder

# 작업 디렉토리 설정
WORKDIR /app

# package.json과 package-lock.json 복사
COPY app/package*.json ./

# 의존성 설치
RUN npm ci

# 소스 코드 복사
COPY app/ .

# 환경 변수 설정 (빌드 시점)
ARG VITE_API_BASE_URL
ENV VITE_API_BASE_URL=${VITE_API_BASE_URL}

# 빌드 실행
RUN npm run build

# Stage 2: Production
FROM nginx:alpine

# 빌드된 파일을 nginx로 복사
COPY --from=builder /app/dist /usr/share/nginx/html

# nginx 설정 파일 복사
COPY docker/nginx.conf /etc/nginx/conf.d/default.conf

# 포트 노출
EXPOSE 80

# nginx 실행
CMD ["nginx", "-g", "daemon off;"]

