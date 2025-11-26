# Email Template Management UI/UX Design

## 개요
Email Template 페이지는 이메일 템플릿을 생성, 수정, 삭제하고, WYSIWYG 에디터를 통해 변수를 연결하며, 미리보기를 제공하는 기능을 포함합니다.

---

## 1. 페이지 레이아웃

### 1.1 전체 구조
```
┌─────────────────────────────────────────────────────────────┐
│ Header (Layout)                                              │
├──────────┬──────────────────────────────────────────────────┤
│ Sidebar  │ Main Content Area                                │
│          │                                                   │
│ Users    │ ┌─────────────────────────────────────────────┐ │
│ Companies│ │ Email Template                                │ │
│ Email    │ │                                               │ │
│ History  │ │ [Add Template] [Search] [Filter: Active/All] │ │
│ Email    │ ├─────────────────────────────────────────────┤ │
│ Template │ │ Template List Table                          │ │
│ Action   │ │ ┌──────┬──────────┬──────────┬──────────┐   │ │
│          │ │ │ Name │ Subject  │ Status   │ Actions  │   │ │
│          │ │ ├──────┼──────────┼──────────┼──────────┤   │ │
│          │ │ │ ...  │ ...      │ Active   │ [Edit]   │   │ │
│          │ │ │ ...  │ ...      │ Inactive │ [Delete] │   │ │
│          │ │ └──────┴──────────┴──────────┴──────────┘   │ │
│          │ │ [< Prev] [1] [2] [3] [Next >]               │ │
│          │ └─────────────────────────────────────────────┘ │
│          │                                                   │
└──────────┴──────────────────────────────────────────────────┘
```

---

## 2. 템플릿 목록 (Main View)

### 2.1 헤더 섹션
- **제목**: "Email Template" (왼쪽 상단)
- **액션 버튼**: "Add Template" (오른쪽 상단, 파란색 버튼)
- **검색 바**: 템플릿 이름으로 검색 (헤더 오른쪽)
- **필터**: 드롭다운 - "All", "Active", "Inactive"

### 2.2 템플릿 테이블
**컬럼 구성:**
1. **Name** (템플릿 이름)
   - 클릭 시 상세보기/수정 모달 열기
   - 폰트: 0.9375rem, 색상: var(--text-color)
   
2. **Subject** (이메일 제목)
   - 템플릿의 subject 필드 표시
   - 최대 100자, 초과 시 "..." 표시
   
3. **Description** (설명)
   - 템플릿 설명 표시
   - 최대 150자, 초과 시 "..." 표시
   
4. **Status** (상태)
   - "Active" (초록색 배지) / "Inactive" (회색 배지)
   - 배지 스타일: 작은 원형 배지
   
5. **Created At** (생성일)
   - 날짜 형식: "YYYY-MM-DD HH:mm"
   
6. **Actions** (액션)
   - [Edit] 버튼 (파란색 텍스트 버튼)
   - [Delete] 버튼 (빨간색 텍스트 버튼)
   - [Preview] 버튼 (회색 텍스트 버튼)

### 2.3 페이지네이션
- 하단 중앙에 배치
- "Previous", 페이지 번호, "Next" 버튼
- 페이지당 20개 항목 표시

---

## 3. 템플릿 생성/수정 모달

### 3.1 모달 구조
```
┌─────────────────────────────────────────────────────────────┐
│ Create/Edit Email Template                            [X]    │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│ Template Name *                                               │
│ ┌─────────────────────────────────────────────────────────┐ │
│ │ factoring_service                                       │ │
│ └─────────────────────────────────────────────────────────┘ │
│                                                               │
│ Description                                                   │
│ ┌─────────────────────────────────────────────────────────┐ │
│ │ Template for factoring service emails                   │ │
│ └─────────────────────────────────────────────────────────┘ │
│                                                               │
│ Email Subject *                                               │
│ ┌─────────────────────────────────────────────────────────┐ │
│ │ {{ company_name }}님, 식스티페이 서비스 안내            │ │
│ └─────────────────────────────────────────────────────────┘ │
│                                                               │
│ Email Body *                                                  │
│ ┌─────────────────────────────────────────────────────────┐ │
│ │ [Variable Insert] [Bold] [Italic] [Link] [Preview]     │ │
│ ├─────────────────────────────────────────────────────────┤ │
│ │                                                           │ │
│ │  [WYSIWYG Editor Area]                                   │ │
│ │                                                           │ │
│ │                                                           │ │
│ └─────────────────────────────────────────────────────────┘ │
│                                                               │
│ ┌─────────────────────────────────────────────────────────┐ │
│ │ Preview Tab                                              │ │
│ │ ┌─────────────────────────────────────────────────────┐ │ │
│ │ │ Subject: [회사명]님, 식스티페이 서비스 안내          │ │ │
│ │ ├─────────────────────────────────────────────────────┤ │ │
│ │ │ Body:                                                │ │ │
│ │ │ [Rendered HTML Preview]                              │ │ │
│ │ └─────────────────────────────────────────────────────┘ │ │
│ └─────────────────────────────────────────────────────────┘ │
│                                                               │
│ [Cancel]                                    [Save Template]   │
└─────────────────────────────────────────────────────────────┘
```

### 3.2 필드 설명

#### 3.2.1 Template Name
- **필수 필드** (별표 표시)
- 텍스트 입력 필드
- 유효성 검사: 중복 체크, 영문/숫자/언더스코어만 허용
- 에러 메시지: "Template name already exists" 또는 "Invalid template name"

#### 3.2.2 Description
- 선택 필드
- 텍스트 영역 (3줄)
- 템플릿에 대한 설명 입력

#### 3.2.3 Email Subject
- **필수 필드**
- 텍스트 입력 필드
- Jinja2 변수 사용 가능 (예: `{{ company_name }}`)
- 실시간 변수 자동완성 지원

#### 3.2.4 Email Body (WYSIWYG Editor)
- **필수 필드**
- WYSIWYG 에디터 (React Quill 또는 TinyMCE 추천)
- 툴바 구성:
  - **Variable Insert** 버튼 (드롭다운)
  - 텍스트 서식: Bold, Italic, Underline
  - 리스트: Bullet List, Numbered List
  - 링크 삽입
  - 이미지 삽입
  - 미리보기 버튼

### 3.3 변수 삽입 기능

#### 3.3.1 Variable Insert 버튼
- 클릭 시 드롭다운 메뉴 표시
- 카테고리별로 그룹화:
  ```
  ┌─────────────────────────────┐
  │ 회사 정보                    │
  │  • 회사명 ({{ company_name }})│
  │  • 이메일 ({{ company_email }})│
  │  • 연락처 ({{ company_phone }})│
  ├─────────────────────────────┤
  │ 발송자 정보                  │
  │  • 발송자명 ({{ sender_name }})│
  │  • 발송자 이메일 ({{ sender_email }})│
  ├─────────────────────────────┤
  │ 시스템 정보                  │
  │  • 현재 날짜 ({{ current_date }})│
  │  • 로고 URL ({{ logo_url }})│
  └─────────────────────────────┘
  ```

- 변수 클릭 시 에디터 커서 위치에 Jinja2 문법으로 삽입
- 예: `{{ company_name }}`

#### 3.3.2 변수 목록 API 연동
- `GET /mail/template-variables` API 호출
- 카테고리별로 그룹화하여 표시
- 각 변수에 설명 툴팁 표시

### 3.4 미리보기 기능

#### 3.4.1 Preview Tab
- 모달 내부에 탭으로 구성
- "Editor" 탭과 "Preview" 탭 전환

#### 3.4.2 Preview 내용
- **Subject Preview**: 변수가 실제 값으로 치환된 제목 표시
  - 예: "{{ company_name }}님, 안녕하세요" → "ABC회사님, 안녕하세요"
  
- **Body Preview**: 
  - HTML 렌더링된 미리보기
  - 샘플 데이터 사용:
    ```json
    {
      "company_name": "ABC회사",
      "company_email": "contact@abc.com",
      "company_phone": "02-1234-5678",
      "sender_name": "식스티페이 팀",
      "sender_email": "noreply@sixtypay.com",
      "current_date": "2024-01-15",
      "logo_url": "https://example.com/logo.png"
    }
    ```
  - 실제 이메일 클라이언트처럼 렌더링
  - 반응형 디자인 (모바일/데스크톱 뷰 전환 가능)

#### 3.4.3 실시간 미리보기
- 에디터에서 내용 변경 시 자동으로 미리보기 업데이트 (debounce 500ms)
- 또는 "Update Preview" 버튼으로 수동 업데이트

### 3.5 저장/취소
- **Cancel 버튼**: 변경사항 확인 후 모달 닫기
- **Save Template 버튼**: 
  - 유효성 검사 후 저장
  - 생성 시: `POST /mail/templates`
  - 수정 시: `PUT /mail/templates/{template_id}`
  - 저장 성공 시 목록 새로고침 및 모달 닫기

---

## 4. 템플릿 삭제

### 4.1 삭제 확인 다이얼로그
```
┌─────────────────────────────────────────┐
│ Delete Template                         │
├─────────────────────────────────────────┤
│                                         │
│ Are you sure you want to delete        │
│ "factoring_service" template?          │
│                                         │
│ This action cannot be undone.          │
│                                         │
│ [Cancel]              [Delete]          │
└─────────────────────────────────────────┘
```

### 4.2 삭제 동작
- `DELETE /mail/templates/{template_id}` API 호출
- Soft delete (is_active=False로 설정)
- 삭제 후 목록에서 제거 또는 "Inactive" 상태로 표시

---

## 5. 미리보기 전용 모달

### 5.1 Preview 버튼 클릭 시
- 별도 모달로 열림
- 템플릿 상세 정보 표시:
  - Template Name
  - Description
  - Subject (변수 치환된 버전)
  - Body (HTML 렌더링)
- 닫기 버튼만 제공 (수정 불가)

---

## 6. 색상 및 스타일

### 6.1 색상 팔레트
- **Primary**: #2563eb (파란색)
- **Success**: #10b981 (초록색)
- **Danger**: #ef4444 (빨간색)
- **Text**: var(--text-color)
- **Background**: var(--card-bg)
- **Border**: var(--border-color)

### 6.2 버튼 스타일
- **Primary Button**: 파란색 배경, 흰색 텍스트
- **Secondary Button**: 회색 배경, 검은색 텍스트
- **Danger Button**: 빨간색 배경, 흰색 텍스트
- **Text Button**: 투명 배경, 파란색/빨간색 텍스트

### 6.3 테이블 스타일
- 헤더: 회색 배경, 볼드 텍스트
- 행: 호버 시 배경색 변경 (var(--hover-bg))
- 액션 버튼: 작은 텍스트 버튼, 간격 0.5rem

---

## 7. 반응형 디자인

### 7.1 모바일 (768px 이하)
- 테이블을 카드 형태로 변환
- 모달 전체 화면으로 표시
- WYSIWYG 에디터 툴바 간소화

### 7.2 태블릿 (768px ~ 1024px)
- 테이블 유지, 일부 컬럼 숨김 (Description)
- 모달 중앙 배치, 최대 너비 90%

### 7.3 데스크톱 (1024px 이상)
- 전체 기능 표시
- 모달 최대 너비 1200px

---

## 8. 사용자 경험 (UX) 고려사항

### 8.1 로딩 상태
- 목록 로딩: 스켈레톤 UI
- 저장 중: 버튼 비활성화, 로딩 스피너
- 삭제 중: 확인 다이얼로그에 로딩 표시

### 8.2 에러 처리
- 필수 필드 미입력: 필드 하단에 빨간색 에러 메시지
- API 에러: 상단에 토스트 알림 표시
- 네트워크 에러: 재시도 버튼 제공

### 8.3 성공 피드백
- 저장 성공: 토스트 알림 "Template saved successfully"
- 삭제 성공: 토스트 알림 "Template deleted successfully"

### 8.4 키보드 단축키
- `Ctrl/Cmd + S`: 저장
- `Esc`: 모달 닫기
- `Ctrl/Cmd + K`: 변수 삽입 메뉴 열기

---

## 9. 기술 스택 제안

### 9.1 WYSIWYG 에디터
- **React Quill** (추천)
  - 가볍고 커스터마이징 용이
  - 변수 삽입 기능 구현 가능
  
- **TinyMCE** (대안)
  - 더 많은 기능 제공
  - 플러그인 시스템

### 9.2 변수 치환 (미리보기)
- **Jinja2.js** 또는 **nunjucks**
  - 백엔드와 동일한 템플릿 엔진 사용
  - 변수 치환 및 렌더링

### 9.3 상태 관리
- React Context 또는 Zustand
- 템플릿 목록, 선택된 템플릿 상태 관리

---

## 10. API 연동 계획

### 10.1 필요한 API
1. `GET /mail/templates` - 템플릿 목록 조회
2. `GET /mail/templates/{template_id}` - 템플릿 상세 조회
3. `POST /mail/templates` - 템플릿 생성
4. `PUT /mail/templates/{template_id}` - 템플릿 수정
5. `DELETE /mail/templates/{template_id}` - 템플릿 삭제
6. `GET /mail/template-variables` - 변수 목록 조회

### 10.2 TypeScript 타입 정의
```typescript
interface EmailTemplate {
  id: string;
  name: string;
  subject: string;
  body: string;
  description?: string;
  is_active: boolean;
  is_html: boolean;
  created_by?: string;
  created_at: string;
  updated_at: string;
}

interface TemplateVariable {
  name: string;
  display_name: string;
  description: string;
  source_type: 'company' | 'sender' | 'system' | 'custom';
  source_table?: string;
  source_column?: string;
  jinja2_syntax: string;
  example_value?: string;
  is_required: boolean;
  category: string;
}
```

---

## 11. 구현 단계

### Phase 1: 기본 CRUD
1. 템플릿 목록 표시
2. 템플릿 생성 모달 (기본 필드만)
3. 템플릿 수정 모달
4. 템플릿 삭제 기능

### Phase 2: WYSIWYG 에디터
1. React Quill 통합
2. 기본 서식 기능
3. 변수 삽입 기능

### Phase 3: 미리보기
1. 변수 목록 API 연동
2. 샘플 데이터로 미리보기
3. 실시간 미리보기 업데이트

### Phase 4: 고급 기능
1. 검색 및 필터링
2. 페이지네이션
3. 키보드 단축키
4. 에러 처리 및 피드백

---

## 12. 추가 고려사항

### 12.1 템플릿 복사 기능
- "Duplicate" 버튼 추가
- 기존 템플릿을 복사하여 새 템플릿 생성

### 12.2 템플릿 버전 관리
- 향후 기능: 템플릿 수정 이력 추적

### 12.3 템플릿 테스트 발송
- "Send Test Email" 버튼
- 테스트 이메일 주소 입력 후 발송

---

이 디자인 문서를 기반으로 Email Template 관리 페이지를 구현할 수 있습니다.

