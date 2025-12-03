# API 권한 분석 및 수정 사항

## 📋 백엔드 API 권한 요구사항 정리

### 1. User API (`/api/v1/users`)
| 엔드포인트 | 메서드 | 권한 요구사항 | 현재 프론트엔드 상태 |
|-----------|--------|--------------|-------------------|
| `/users/register` | POST | Public (IP 제한 가능) | ✅ 정상 |
| `/users/login` | POST | Public | ✅ 정상 |
| `/users/me` | GET | Authenticated | ✅ 정상 |
| `/users/me` | PUT | Authenticated | ✅ 정상 |
| `/users` | GET | **Admin Only** | ⚠️ 권한 체크 없음 |
| `/users/{id}` | GET | **Admin Only** | ⚠️ 권한 체크 없음 |
| `/users/{id}` | PUT | **Admin Only** | ⚠️ 권한 체크 없음 |
| `/users/{id}` | DELETE | **Admin Only** | ⚠️ 권한 체크 없음 |

### 2. Company API (`/api/v1/companies`)
| 엔드포인트 | 메서드 | 권한 요구사항 | 현재 프론트엔드 상태 |
|-----------|--------|--------------|-------------------|
| `/companies` | GET | Authenticated | ✅ 정상 |
| `/companies/{id}` | GET | Authenticated | ✅ 정상 |
| `/companies` | POST | Authenticated | ✅ 정상 |
| `/companies/{id}` | PUT | Authenticated (본인 생성한 것만, Admin은 모두) | ⚠️ 권한 체크 없음 |
| `/companies/{id}` | DELETE | **Admin Only** | ⚠️ 권한 체크 없음 |
| `/companies/upload` | POST | **Admin Only** | ⚠️ 권한 체크 없음 |

### 3. Mail Template API (`/api/v1/mail/templates`)
| 엔드포인트 | 메서드 | 권한 요구사항 | 현재 프론트엔드 상태 |
|-----------|--------|--------------|-------------------|
| `/mail/templates` | GET | Authenticated | ✅ 정상 |
| `/mail/templates/{id}` | GET | Authenticated | ✅ 정상 |
| `/mail/templates/name/{name}` | GET | Authenticated | ✅ 정상 |
| `/mail/templates` | POST | **Admin Only** | ⚠️ 권한 체크 없음 |
| `/mail/templates/{id}` | PUT | **Admin Only** | ⚠️ 권한 체크 없음 |
| `/mail/templates/{id}` | DELETE | **Admin Only** | ⚠️ 권한 체크 없음 |
| `/mail/template-variables` | GET | Public (인증 불필요) | ✅ 정상 |

### 4. Mail API (`/api/v1/mail`)
| 엔드포인트 | 메서드 | 권한 요구사항 | 현재 프론트엔드 상태 |
|-----------|--------|--------------|-------------------|
| `/mail/send` | POST | Authenticated | ✅ 정상 |
| `/mail/send-with-template` | POST | Authenticated | ✅ 정상 |
| `/mail/test` | POST | Authenticated | ✅ 정상 |

### 5. Email History API (`/api/v1/email-history`)
| 엔드포인트 | 메서드 | 권한 요구사항 | 현재 프론트엔드 상태 |
|-----------|--------|--------------|-------------------|
| `/email-history` | GET | Authenticated (본인 것만, Admin은 모두) | ✅ 정상 (백엔드에서 처리) |
| `/email-history/{id}` | GET | Authenticated (본인 것만, Admin은 모두) | ✅ 정상 (백엔드에서 처리) |
| `/email-history/company/{id}` | GET | Authenticated (본인 것만, Admin은 모두) | ✅ 정상 (백엔드에서 처리) |
| `/email-history/user/{id}` | GET | Authenticated (본인 것만, Admin은 모두) | ✅ 정상 (백엔드에서 처리) |

### 6. Statistics API (`/api/v1/statistics`)
| 엔드포인트 | 메서드 | 권한 요구사항 | 현재 프론트엔드 상태 |
|-----------|--------|--------------|-------------------|
| `/statistics/email` | GET | Authenticated (본인 것만, Admin은 모두) | ✅ 정상 (백엔드에서 처리) |
| `/statistics/companies` | GET | Authenticated (본인 것만, Admin은 모두) | ✅ 정상 (백엔드에서 처리) |

### 7. Metrics API (`/api/v1/metrics`)
| 엔드포인트 | 메서드 | 권한 요구사항 | 현재 프론트엔드 상태 |
|-----------|--------|--------------|-------------------|
| `/metrics/performance` | GET | **Admin Only** | ❌ 프론트엔드에서 사용 안 함 |
| `/metrics/logs` | GET | **Admin Only** | ❌ 프론트엔드에서 사용 안 함 |
| `/metrics/health` | GET | **Admin Only** | ❌ 프론트엔드에서 사용 안 함 |

### 8. Redis API (`/api/v1/redis`)
| 엔드포인트 | 메서드 | 권한 요구사항 | 현재 프론트엔드 상태 |
|-----------|--------|--------------|-------------------|
| `/redis/ping` | GET | **Admin Only** | ❌ 프론트엔드에서 사용 안 함 |
| `/redis/set` | POST | **Admin Only** | ❌ 프론트엔드에서 사용 안 함 |
| `/redis/get/{key}` | GET | **Admin Only** | ❌ 프론트엔드에서 사용 안 함 |
| `/redis/delete/{key}` | DELETE | **Admin Only** | ❌ 프론트엔드에서 사용 안 함 |
| `/redis/info` | GET | **Admin Only** | ❌ 프론트엔드에서 사용 안 함 |

---

## ⚠️ 발견된 문제점

### 1. UsersPage (`/dashboard/users`)
**문제:**
- Admin 전용 API를 호출하지만 권한 체크 없음
- 일반 사용자가 접근하면 403 에러 발생

**수정 필요:**
- 페이지 접근 시 Admin 권한 체크
- Admin이 아닌 경우 접근 차단 또는 리다이렉트
- Sidebar에서 Admin 전용 메뉴로 표시

### 2. CompaniesPage (`/dashboard/companies`)
**문제:**
- `DELETE /companies/{id}` - Admin Only인데 권한 체크 없음
- `POST /companies/upload` - Admin Only인데 권한 체크 없음
- `PUT /companies/{id}` - 본인이 생성한 것만 수정 가능한데 UI에서 체크 안 함

**수정 필요:**
- 삭제 버튼: Admin만 표시
- 업로드 버튼: Admin만 표시
- 수정 버튼: 본인이 생성한 회사만 수정 가능하도록 체크 (또는 Admin은 모두 수정 가능)

### 3. EmailTemplatePage (`/dashboard/email-template`)
**문제:**
- `POST /mail/templates` - Admin Only인데 권한 체크 없음
- `PUT /mail/templates/{id}` - Admin Only인데 권한 체크 없음
- `DELETE /mail/templates/{id}` - Admin Only인데 권한 체크 없음

**수정 필요:**
- "Add Template" 버튼: Admin만 표시
- "Edit" 버튼: Admin만 표시
- "Delete" 버튼: Admin만 표시

### 4. Sidebar
**문제:**
- Admin 전용 메뉴 구분 없음
- 모든 사용자에게 모든 메뉴 표시

**수정 필요:**
- Users 메뉴: Admin만 표시
- Company Crawling 메뉴: 권한 확인 필요 (현재 백엔드 라우터 확인 안 됨)

---

## 🔧 수정 계획

### Phase 1: 권한 체크 유틸리티 추가
1. `useAuth` 훅에서 `isAdmin` 헬퍼 추가
2. Admin 전용 컴포넌트 래퍼 생성 (`<AdminOnly>`)

### Phase 2: UsersPage 수정
1. 페이지 접근 시 Admin 권한 체크
2. Admin이 아닌 경우 접근 차단

### Phase 3: CompaniesPage 수정
1. 삭제 버튼: Admin만 표시
2. 업로드 버튼: Admin만 표시
3. 수정 권한 체크: 본인 생성 또는 Admin

### Phase 4: EmailTemplatePage 수정
1. "Add Template" 버튼: Admin만 표시
2. "Edit" 버튼: Admin만 표시
3. "Delete" 버튼: Admin만 표시

### Phase 5: Sidebar 수정
1. Admin 전용 메뉴 조건부 표시
2. Users 메뉴: Admin만 표시

---

## 📝 추가 고려사항

### Company 업데이트 권한
백엔드에서:
- 일반 사용자: 본인이 생성한 회사만 수정 가능
- Admin: 모든 회사 수정 가능

프론트엔드에서:
- Company 목록에 `created_by` 정보 표시됨
- 수정 버튼 클릭 시 권한 체크 필요
- 또는 수정 불가능한 회사는 수정 버튼 비활성화

### 에러 처리
- 403 Forbidden 에러 발생 시 사용자에게 적절한 메시지 표시
- 권한이 없는 기능에 접근 시도 시 안내 메시지

---

## ✅ 체크리스트

- [ ] `useAuth` 훅에 `isAdmin` 헬퍼 추가
- [ ] `<AdminOnly>` 컴포넌트 생성
- [ ] UsersPage: Admin 권한 체크 추가
- [ ] CompaniesPage: 삭제 버튼 Admin만 표시
- [ ] CompaniesPage: 업로드 버튼 Admin만 표시
- [ ] CompaniesPage: 수정 권한 체크 추가
- [ ] EmailTemplatePage: 생성/수정/삭제 버튼 Admin만 표시
- [ ] Sidebar: Admin 전용 메뉴 조건부 표시
- [ ] 403 에러 처리 개선

