# Auto Mail Frontend

React + TypeScript + Vite 기반 프론트엔드 애플리케이션

## 프로젝트 구조

```
auto-mail-front/
├── app/                    # 실제 프로젝트 코드
│   ├── src/               # 소스 코드
│   ├── public/            # 정적 파일
│   ├── package.json       # 의존성 관리
│   └── ...                # 기타 설정 파일들
├── docker/                # Docker 관련 파일
│   ├── Dockerfile         # 프로덕션 빌드용
│   ├── Dockerfile.dev     # 개발 환경용
│   ├── docker-compose.yml # 개발 환경
│   ├── docker-compose.prod.yml # 프로덕션 환경
│   ├── nginx.conf         # nginx 설정
│   └── scripts/           # 실행 스크립트
└── README.md
```

## 로컬 개발 환경 설정

### 사전 요구사항
- Node.js 20 이상
- npm 또는 yarn

### 설치 및 실행

```bash
cd app
npm install
npm run dev
```

애플리케이션이 `http://localhost:5173`에서 실행됩니다.

## Docker를 사용한 실행

### 개발 환경

```bash
# Docker Compose 사용
docker-compose -f docker/docker-compose.yml up --build

# 또는 스크립트 사용
./docker/scripts/run.sh
```

개발 서버가 `http://localhost:5173`에서 실행됩니다.

### 프로덕션 빌드

```bash
# Docker Compose 사용
docker-compose -f docker/docker-compose.prod.yml up --build

# 또는 스크립트 사용
./docker/scripts/run-prod.sh
```

프로덕션 빌드가 `http://localhost:3000`에서 실행됩니다.

## 환경 변수

프로젝트 루트에 `.env` 파일을 생성하고 다음 변수를 설정하세요:

```env
VITE_API_BASE_URL=http://localhost:8000/api/v1
```

Docker를 사용하는 경우, `docker-compose.yml`의 `environment` 섹션에서 환경 변수를 설정할 수 있습니다.

## 주요 기능

- ✅ 사용자 인증 (로그인/로그아웃)
- ✅ 보호된 라우트
- ✅ JWT 토큰 기반 인증
- ✅ 반응형 UI

## 기술 스택

- React 19
- TypeScript
- Vite
- React Router
- Axios
- Docker & Docker Compose
- Nginx (프로덕션)
