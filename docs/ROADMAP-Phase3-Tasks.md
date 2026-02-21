# Phase 3 작업 분할 계획

**상태**: 준비 단계 (Task 002-4 ✅ 완료 후 시작)
**총 태스크**: 14개 서브태스크
**예상 기간**: 4주

---

## Task 005: Supabase 데이터베이스 구축 (5개 서브태스크)

### 005-1: Supabase 프로젝트 설정 및 테이블 생성

**설명**
Supabase 프로젝트를 생성하고 PostgreSQL 데이터베이스에 필요한 모든 테이블을 정의합니다. 각 테이블은 외래키, 인덱스, RLS(Row Level Security) 정책을 포함하여 구성됩니다.

**구현 가이드**
1. Supabase 웹사이트에서 새 프로젝트 생성 (org.supabase.co)
2. PostgreSQL 연결 정보 확보 (Database URL, Public/Private Key)
3. SQL 스크립트로 다음 테이블 생성:
   ```
   - users (id, kakao_id, name, profile_image, created_at)
   - events (id, host_id, title, date, location, max_attendees, fee, status, invite_code, created_at)
   - event_members (id, event_id, user_id, guest_name, status, has_paid, created_at)
   - notices (id, event_id, author_id, content, created_at)
   - carpools (id, event_id, driver_id, seats, departure, created_at)
   - carpool_requests (id, carpool_id, user_id, status, created_at)
   ```
4. 각 테이블에 인덱스 생성 (foreign_keys, created_at, status)
5. RLS 정책 설정:
   - users: 자신의 프로필만 조회/수정
   - events: 주최자는 모든 작업, 참여자는 조회만 가능
   - event_members: 자신의 참여 정보만 조회/수정
   - notices: 주최자만 CUD, 모두 R
   - carpools: 주최자/운전자는 CU, 모두 R
6. 환경 변수 설정 (SUPABASE_URL, SUPABASE_ANON_KEY, SUPABASE_SERVICE_KEY)

**의존성**
- 없음 (첫 번째 작업)

**검증 기준**
- Supabase 프로젝트 생성 완료
- 모든 테이블 생성 및 구조 확인
- 외래키 제약조건 정상 작동
- RLS 정책 활성화 및 기본 규칙 적용
- 환경 변수 .env.local에 저장됨

**관련 파일**
- `src/lib/supabase.ts`: Supabase 클라이언트 초기화 (CREATE)
- `.env.local`: 환경 변수 (CREATE - .gitignore에 추가)
- `docs/ROADMAP.md`: Task 005-1 ✅ 표시 (TO_MODIFY)

---

### 005-2: 이벤트 CRUD Server Actions

**설명**
Supabase를 활용하여 이벤트의 CRUD(생성/조회/수정/삭제) 작업을 Server Actions으로 구현합니다. 초대 코드는 nanoid로 생성하며, 각 작업은 타입 안정성과 에러 처리를 포함합니다.

**구현 가이드**
1. nanoid 패키지 설치: `npm install nanoid`
2. `src/actions/events.ts` 파일 생성:
   ```
   - createEvent(data): Event 객체 반환, 초대코드 자동생성(nanoid)
   - getEvent(id): 단일 이벤트 조회 (RLS 자동 적용)
   - updateEvent(id, data): 이벤트 수정 (주최자만 가능)
   - deleteEvent(id): 이벤트 삭제 (주최자만 가능)
   - listUserEvents(userId): 사용자가 주최/참여 중인 모임 목록
   - getEventByInviteCode(code): 초대 코드로 이벤트 조회
   ```
3. 각 함수에 입력값 Zod 검증 추가 (src/types/schemas.ts 활용)
4. try-catch로 에러 처리:
   - Supabase 오류 -> toast.error() 메시지 반환
   - RLS 정책 위반 -> "권한이 없습니다" 에러
   - 유효성 검사 실패 -> 필드별 상세 에러
5. 각 함수 반환값 타입 정의 (ApiResponse<T> 패턴 사용)
6. 더미 데이터 호출 부분을 실제 Server Action으로 교체

**의존성**
- 005-1: Supabase 프로젝트 설정 완료

**검증 기준**
- createEvent: 새 이벤트 생성 후 ID 반환 확인
- getEvent: 기존 이벤트 조회 및 초대코드 포함 확인
- updateEvent: 제목/날짜 수정 및 업데이트 반영 확인
- deleteEvent: 이벤트 삭제 후 조회 불가능 확인
- listUserEvents: 주최/참여 모임 정확히 분류 확인
- getEventByInviteCode: 초대 코드로 올바른 이벤트 조회 확인

**관련 파일**
- `src/actions/events.ts`: 이벤트 Server Actions (CREATE)
- `src/lib/supabase.ts`: 클라이언트 설정 (REFERENCE)
- `src/types/schemas.ts`: 이벤트 Zod 스키마 (REFERENCE)
- `src/app/dashboard/page.tsx`: 더미 데이터 제거, 실제 API 호출 (TO_MODIFY)
- `docs/ROADMAP.md`: Task 005-2 ✅ 표시 (TO_MODIFY)

---

### 005-3: 참여자/정산 API

**설명**
이벤트의 참여자 관리(참석 의사 표시, 목록 조회) 및 정산(납부 상태 관리)에 관련된 Server Actions을 구현합니다.

**구현 가이드**
1. `src/actions/participants.ts` 파일 생성:
   ```
   - addParticipant(eventId, userId/guestName, status): 참여자 추가
   - updateParticipantStatus(eventId, userId, status): 참석/불참/미정 업데이트
   - listEventParticipants(eventId): 이벤트의 모든 참여자 조회 (상태별 집계 포함)
   - getParticipantStatus(eventId, userId): 특정 참여자의 상태 조회
   ```
2. `src/actions/settlements.ts` 파일 생성:
   ```
   - calculateSettlement(eventId): 참가비 기반 1인당 금액 계산
     - 공식: fee / (참석 인원 수)
     - 소수점 처리: 원 단위로 반올림
   - updatePaymentStatus(participantId, hasPaid): 납부 상태 업데이트
   - getSettlementSummary(eventId): 정산 현황 조회
     - 1인당 금액, 납부자, 미납자, 수금액 반환
   - getUnpaidParticipants(eventId): 미납자 목록 조회
   ```
3. 참여자 상태 enum: ATTENDING, NOT_ATTENDING, PENDING
4. 에러 처리:
   - 중복 참여자 추가 -> "이미 참여 중입니다" 에러
   - 이벤트 없음 -> "존재하지 않는 모임입니다" 에러
   - 권한 없음 -> RLS 자동 처리

**의존성**
- 005-1: Supabase 프로젝트 설정 완료
- 005-2: 이벤트 CRUD 구현 완료

**검증 기준**
- addParticipant: 로그인 사용자와 게스트 모두 추가 가능
- updateParticipantStatus: 상태 변경 후 정산 금액 재계산 확인
- listEventParticipants: 참석/미정/불참 인원 정확히 집계 확인
- calculateSettlement: 정산 금액 계산 정확성 (예: 30,000원 / 3명 = 10,000원)
- updatePaymentStatus: 납부 상태 변경 후 반영 확인
- getSettlementSummary: 수금액 정확성 검증

**관련 파일**
- `src/actions/participants.ts`: 참여자 관리 (CREATE)
- `src/actions/settlements.ts`: 정산 관리 (CREATE)
- `src/types/api.ts`: API 응답 타입 (REFERENCE)
- `src/app/events/[id]/manage/page.tsx`: 정산 탭 실제 API 연동 (TO_MODIFY)
- `docs/ROADMAP.md`: Task 005-3 ✅ 표시 (TO_MODIFY)

---

### 005-4: 카풀/공지 API

**설명**
카풀 매칭(운전자 등록, 탑승자 신청/취소) 및 공지사항(작성/수정/삭제/조회) 기능을 Server Actions로 구현합니다.

**구현 가이드**
1. `src/actions/carpools.ts` 파일 생성:
   ```
   - registerDriver(eventId, userId, seats, departure): 운전자 등록
   - requestRide(carpoolId, userId): 탑승자 신청
   - cancelRideRequest(carpoolId, userId): 신청 취소
   - listEventCarpools(eventId): 이벤트의 모든 카풀 조회 (탑승자 포함)
   - getCarpoolDetails(carpoolId): 카풀 상세 조회
   - updateCarpoolStatus(carpoolId, requestId, status): 운전자가 신청자 승인/거절
   ```
2. `src/actions/notices.ts` 파일 생성:
   ```
   - createNotice(eventId, content): 공지 작성 (주최자만)
   - updateNotice(noticeId, content): 공지 수정 (작성자만)
   - deleteNotice(noticeId): 공지 삭제 (작성자만)
   - listEventNotices(eventId): 이벤트의 모든 공지 조회
   ```
3. 카풀 요청 상태: PENDING, ACCEPTED, REJECTED
4. 에러 처리:
   - 중복 등록 -> "이미 운전자로 등록했습니다" 에러
   - 정원 초과 -> "탑승 가능 인원이 없습니다" 에러
   - 권한 없음 -> RLS 자동 처리

**의존성**
- 005-1: Supabase 프로젝트 설정 완료
- 005-2: 이벤트 CRUD 구현 완료

**검증 기준**
- registerDriver: 운전자 등록 후 carpools 테이블에 record 생성 확인
- requestRide: 탑승 신청 후 carpool_requests 테이블에 record 생성 확인
- listEventCarpools: 카풀별 탑승자 목록 정확히 반환 확인
- 정원 초과 시 신청 차단 (예: 3좌석 > 3명 이상 신청 시 거절)
- createNotice: 공지 작성 후 조회 가능 확인
- updateNotice: 공지 수정 후 반영 확인
- deleteNotice: 공지 삭제 후 조회 불가능 확인

**관련 파일**
- `src/actions/carpools.ts`: 카풀 관리 (CREATE)
- `src/actions/notices.ts`: 공지 관리 (CREATE)
- `src/app/events/[id]/manage/page.tsx`: 카풀/공지 탭 실제 API 연동 (TO_MODIFY)
- `docs/ROADMAP.md`: Task 005-4 ✅ 표시 (TO_MODIFY)

---

### 005-5: API 테스트

**설명**
Playwright를 사용하여 모든 Server Actions의 기능을 테스트합니다. 정상 플로우뿐 아니라 에러 케이스도 검증합니다.

**구현 가이드**
1. `e2e/api-integration.spec.ts` 파일 생성:
   - 테스트 전 세트업: 테스트 이벤트 생성, 테스트 사용자 설정

2. 이벤트 CRUD 테스트:
   ```
   - 이벤트 생성 후 ID/초대코드 반환 확인
   - 생성된 이벤트 조회 및 정보 일치 확인
   - 이벤트 수정 및 변경사항 반영 확인
   - 이벤트 삭제 후 조회 불가능 확인
   - 초대 코드로 이벤트 조회 확인
   ```

3. 참여자/정산 테스트:
   ```
   - 로그인 사용자 참여 추가 확인
   - 게스트 참여 추가 (이름 입력) 확인
   - 참석 상태 업데이트 후 정산 금액 재계산 확인
   - 정산 금액 계산 정확성 (30,000원 / 3명 = 10,000원)
   - 미납자 목록 정확성 확인
   ```

4. 카풀 테스트:
   ```
   - 운전자 등록 확인
   - 탑승 신청 -> 승인 플로우 확인
   - 정원 초과 시 신청 차단 확인 (3좌석에 4명 신청 시 실패)
   ```

5. 공지 테스트:
   ```
   - 공지 작성 후 조회 가능 확인
   - 공지 수정 후 내용 변경 확인
   - 공지 삭제 후 조회 불가능 확인
   - 비주최자 공지 작성 시 거절 확인
   ```

6. 에러 케이스:
   ```
   - 존재하지 않는 이벤트 조회 -> 404 또는 에러 메시지 확인
   - RLS 정책 위반 (다른 사용자의 이벤트 수정) -> 거절 확인
   - 유효성 검사 실패 (빈 제목) -> 에러 메시지 확인
   ```

**의존성**
- 005-2: 이벤트 CRUD 완료
- 005-3: 참여자/정산 API 완료
- 005-4: 카풀/공지 API 완료

**검증 기준**
- 모든 API 함수 동작 검증
- 정산 금액 계산 정확성
- 카풀 정원 제한 정상 작동
- RLS 정책 정상 작동 (권한 없는 접근 차단)
- 에러 메시지 적절성

**관련 파일**
- `e2e/api-integration.spec.ts`: API 통합 테스트 (CREATE)
- `src/actions/events.ts`: 이벤트 API (REFERENCE)
- `src/actions/participants.ts`: 참여자 API (REFERENCE)
- `src/actions/settlements.ts`: 정산 API (REFERENCE)
- `src/actions/carpools.ts`: 카풀 API (REFERENCE)
- `src/actions/notices.ts`: 공지 API (REFERENCE)
- `docs/ROADMAP.md`: Task 005-5 ✅ 표시 (TO_MODIFY)

---

## Task 006: OAuth 인증 (4개 서브태스크)

### 006-1: NextAuth.js 설치 및 카카오 설정

**설명**
NextAuth.js를 프로젝트에 설치하고 카카오 OAuth 공급자를 설정합니다. 카카오 개발자 앱을 등록하고 리다이렉트 URI를 구성합니다.

**구현 가이드**
1. NextAuth.js 설치:
   ```bash
   npm install next-auth@5 @auth/core @auth/prisma-adapter
   ```
   (또는 Supabase Adapter 사용 가능)

2. 카카오 개발자 센터 설정:
   - 카카오 개발자 계정 가입 (developers.kakao.com)
   - 새 애플리케이션 등록 (앱 이름, 사업자 정보 등)
   - 카카오 로그인 활성화 (제품 설정)
   - 리다이렉트 URI 등록:
     - 개발: `http://localhost:3000/api/auth/callback/kakao`
     - 프로덕션: `https://yourdomain.com/api/auth/callback/kakao`
   - REST API 키, Client ID, Client Secret 확보

3. NextAuth.js 설정:
   ```
   - src/auth.ts 파일 생성
   - NextAuthOptions 정의
   - KakaoProvider 추가 (clientId, clientSecret, httpOptions)
   - callbacks 설정:
     * jwt: 토큰에 userId 추가
     * session: 세션에 user 정보 포함
     * signIn: 사용자 DB 저장 로직 추가
   - pages 설정 (signIn: "/login")
   ```

4. 환경 변수 설정 (.env.local):
   ```
   NEXT_PUBLIC_APP_URL=http://localhost:3000
   NEXTAUTH_URL=http://localhost:3000
   NEXTAUTH_SECRET=<생성된 시크릿>
   NEXT_PUBLIC_KAKAO_CLIENT_ID=<카카오 REST API 키>
   NEXTAUTH_SECRET_KAKAO=<클라이언트 시크릿>
   ```

5. API 라우트 생성:
   ```
   - src/app/api/auth/[...nextauth]/route.ts
   - GET/POST 핸들러에서 NextAuth.js 라우터 제공
   ```

6. 클라이언트 설정:
   ```
   - SessionProvider를 root layout에 추가 (클라이언트 컴포넌트)
   - src/app/layout.tsx에서 useSession import
   ```

**의존성**
- 없음 (첫 번째 인증 관련 작업)

**검증 기준**
- NextAuth.js 설치 및 초기화 완료
- NextAuth API 라우트 정상 작동
- 카카오 개발자 센터 설정 완료
- 환경 변수 설정 완료
- SessionProvider 정상 작동 확인

**관련 파일**
- `src/auth.ts`: NextAuth.js 설정 (CREATE)
- `src/app/api/auth/[...nextauth]/route.ts`: API 라우트 (CREATE)
- `src/app/layout.tsx`: SessionProvider 추가 (TO_MODIFY)
- `.env.local`: 환경 변수 (CREATE)
- `package.json`: next-auth 의존성 추가 (TO_MODIFY)
- `docs/ROADMAP.md`: Task 006-1 ✅ 표시 (TO_MODIFY)

---

### 006-2: 인증 미들웨어

**설명**
Next.js 미들웨어를 사용하여 보호된 라우트에 대한 접근 제어를 구현합니다. 로그인 여부와 사용자 권한(주최자/관리자)을 검증합니다.

**구현 가이드**
1. 미들웨어 파일 생성:
   ```
   - src/middleware.ts
   - matcher 설정: ['/dashboard/:path*', '/events/:path*', '/admin/:path*']
   ```

2. 라우트별 접근 제어:
   ```
   - /dashboard: 로그인 필수 (로그인 안됨 -> /login 리다이렉트)
   - /events/[id]/manage: 로그인 필수 + 주최자 확인 (다른 사용자 -> /dashboard 리다이렉트)
   - /admin: 로그인 필수 + 관리자 권한 확인 (비관리자 -> /dashboard 리다이렉트)
   - /join/[inviteCode]: 게스트 허용 (로그인 불필요)
   ```

3. 미들웨어 로직:
   ```
   - getToken() 호출로 세션 확인
   - 토큰 없음 -> /login으로 리다이렉트
   - 사용자 권한 확인 (role = "admin"인지 확인)
   - 주최자 확인: event record의 host_id와 userId 비교
   ```

4. 에러 처리:
   ```
   - 토큰 유효성 검사 실패 -> /login 리다이렉트
   - 권한 부족 -> /dashboard 또는 / 리다이렉트
   - 쿼리 매개변수로 원래 URL 전달 (로그인 후 리다이렉트)
   ```

**의존성**
- 006-1: NextAuth.js 설치 및 카카오 설정 완료

**검증 기준**
- /dashboard 로그인 필수 확인 (로그인 안됨 -> /login)
- /events/[id]/manage 주최자만 접근 가능 확인
- /admin 관리자만 접근 가능 확인
- /join/[inviteCode] 게스트 허용 확인
- 로그인 후 원래 URL로 리다이렉트 확인

**관련 파일**
- `src/middleware.ts`: 인증 미들웨어 (CREATE)
- `src/auth.ts`: NextAuth 설정 (REFERENCE)
- `src/lib/auth.ts`: 유틸리티 함수 추가 (isUserAdmin, getEventHost 등) (CREATE)
- `docs/ROADMAP.md`: Task 006-2 ✅ 표시 (TO_MODIFY)

---

### 006-3: 폼 연동

**설명**
로그인/회원가입 폼을 실제 NextAuth.js와 연동합니다. 더미 데이터 대신 실제 카카오 OAuth를 사용하도록 변경합니다.

**구현 가이드**
1. 카카오 로그인 버튼 구현:
   ```
   - signIn("kakao") 함수 호출로 카카오 로그인 페이지로 리다이렉트
   - LoginForm에 카카오 로그인 버튼 추가
   - 카카오 아이콘 (LucideIcons의 Coffee 또는 커스텀 이미지)
   ```

2. 로그인 페이지 업데이트 (`/login`):
   ```
   - 기존 이메일/비밀번호 폼 제거 또는 비활성화
   - 카카오 로그인 버튼 중앙 배치
   - 또는 카카오/이메일 탭 제공 (선택사항)
   ```

3. 회원가입 페이지 업데이트 (`/signup`):
   ```
   - 카카오 로그인으로 자동 회원가입 (처음 로그인 시 users 테이블에 record 생성)
   - 회원가입 폼 제거
   - "카카오로 가입하기" 메시지 표시
   ```

4. 로그아웃 기능:
   ```
   - signOut() 함수 호출
   - Header 또는 BottomTab에 로그아웃 메뉴 추가
   - 로그아웃 후 랜딩 페이지로 리다이렉트
   ```

5. 에러 처리:
   ```
   - 카카오 로그인 실패 -> toast.error() 메시지
   - 네트워크 오류 -> 재시도 버튼
   - 권한 거부 -> "다시 시도해주세요" 메시지
   ```

**의존성**
- 006-1: NextAuth.js 설치 및 카카오 설정 완료
- 006-2: 인증 미들웨어 완료

**검증 기준**
- 카카오 로그인 버튼 클릭 -> 카카오 페이지로 리다이렉트 확인
- 카카오 인증 후 /dashboard로 리다이렉트 확인
- 로그인 후 사용자 정보 저장 확인 (users 테이블)
- 로그아웃 후 세션 삭제 및 /로 리다이렉트 확인
- 카카오 로그인 에러 시 적절한 메시지 표시

**관련 파일**
- `src/app/login/page.tsx`: 로그인 페이지 (TO_MODIFY)
- `src/app/signup/page.tsx`: 회원가입 페이지 (TO_MODIFY)
- `src/components/auth/LoginForm.tsx`: 로그인 폼 (TO_MODIFY)
- `src/components/auth/SignupForm.tsx`: 회원가입 폼 (TO_MODIFY)
- `src/components/Header.tsx`: 로그아웃 메뉴 추가 (TO_MODIFY)
- `docs/ROADMAP.md`: Task 006-3 ✅ 표시 (TO_MODIFY)

---

### 006-4: 세션/프로필 저장

**설명**
카카오 OAuth를 통해 획득한 사용자 정보를 Supabase users 테이블에 저장하고, 세션에 포함시킵니다. 프로필 정보 조회 및 수정 기능을 추가합니다.

**구현 가이드**
1. 카카오 사용자 정보 매핑:
   ```
   - kakao_id: 카카오 제공 사용자 ID
   - name: 카카오 프로필 이름
   - profile_image: 카카오 프로필 이미지 URL
   - email: 카카오 이메일 (선택)
   - created_at: 가입 날짜
   ```

2. NextAuth.js callbacks 수정:
   ```
   - jwt callback: 토큰에 kakao_id, name 포함
   - session callback: 세션에 user.id, user.name, user.image 포함
   - signIn callback: 사용자가 없으면 users 테이블에 생성
   ```

3. 세션 조회 Server Action (`src/actions/auth.ts`):
   ```
   - getCurrentUser(): 현재 로그인한 사용자 정보 반환
   - getCurrentSession(): 현재 세션 정보 반환
   ```

4. 프로필 조회/수정 Server Action:
   ```
   - getUserProfile(userId): 사용자 프로필 조회
   - updateUserProfile(userId, data): 사용자 프로필 수정 (이름, 프로필 이미지)
   ```

5. 커스텀 Hook 생성 (`src/hooks/useAuth.ts`):
   ```
   - useSession() 래퍼 (NextAuth.js 기본값)
   - useCurrentUser(): 현재 사용자 정보 조회
   - useIsAdmin(): 관리자 여부 확인
   - useEventHost(eventId): 주최자 여부 확인
   ```

6. 세션 저장소:
   ```
   - Header/Profile 컴포넌트에서 useSession 사용
   - 사용자 이름, 프로필 이미지 표시
   - 로그아웃 메뉴 추가
   ```

**의존성**
- 006-3: 폼 연동 완료
- 005-1: Supabase 프로젝트 설정 완료

**검증 기준**
- 카카오 로그인 후 users 테이블에 record 생성 확인
- 세션에 사용자 정보 포함 확인
- getCurrentUser(): 로그인 사용자 정보 반환 확인
- getUserProfile(): 사용자 프로필 조회 확인
- updateUserProfile(): 프로필 수정 후 반영 확인
- useSession() 커스텀 Hook 정상 작동 확인

**관련 파일**
- `src/auth.ts`: NextAuth 콜백 수정 (TO_MODIFY)
- `src/actions/auth.ts`: 세션/프로필 Server Actions (CREATE)
- `src/hooks/useAuth.ts`: 커스텀 Auth Hook (CREATE)
- `src/components/Header.tsx`: 사용자 정보 표시 (TO_MODIFY)
- `src/app/(auth)/profile/page.tsx`: 프로필 페이지 (CREATE - 선택사항)
- `docs/ROADMAP.md`: Task 006-4 ✅ 표시 (TO_MODIFY)

---

## Task 007: 이벤트 로직 (4개 서브태스크)

### 007-1: 이벤트 생성 폼 연동

**설명**
이벤트 생성 폼을 실제 Server Action과 연동합니다. React Hook Form + Zod + Supabase를 통해 완전한 이벤트 생성 플로우를 구현합니다.

**구현 가이드**
1. 이벤트 생성 페이지 구현 (`/events/new`):
   ```
   - 페이지 라우트 생성: src/app/events/new/page.tsx
   - 미들웨어에서 /dashboard 또는 새로운 /events/new 경로 보호 (로그인 필수)
   ```

2. 이벤트 생성 폼 컴포넌트 (`CreateEventForm.tsx`):
   ```
   - React Hook Form + Zod 스키마 적용
   - 입력 필드:
     * title (필수): 모임 제목
     * date (필수): 모임 날짜
     * time (선택): 모임 시간
     * location (필수): 모임 장소
     * maxAttendees (필수): 최대 참석 인원
     * fee (필수): 참가비 (원 단위)
     * description (선택): 모임 설명
   - 유효성 검사:
     * 모든 필수 필드 검사
     * 날짜는 미래 날짜만 허용
     * 참가비는 0 이상 정수
   - 제출 시 createEvent() Server Action 호출
   ```

3. 폼 제출 플로우:
   ```
   - 폼 검증 -> createEvent() 호출
   - 성공: toast.success("모임이 생성되었습니다") + /events/[id]/manage로 리다이렉트
   - 실패: toast.error(에러 메시지) + 폼 유지
   - 로딩 중: 제출 버튼 비활성화 + 로딩 텍스트 표시
   ```

4. 폼 UI:
   ```
   - shadcn/ui Form 컴포넌트 사용
   - Input, Textarea, Select, DatePicker 활용
   - 필드별 에러 메시지 표시 (FormError 컴포넌트)
   - 취소 버튼 (뒤로가기)
   ```

5. 대시보드에 "새 모임" 버튼 추가:
   ```
   - /events/new으로 링크
   - 모바일 UI에 맞게 배치
   - 또는 BottomTab에 추가 버튼
   ```

**의존성**
- 005-2: 이벤트 CRUD Server Actions 완료
- 006-2: 인증 미들웨어 완료

**검증 기준**
- /events/new 페이지 렌더링 확인
- 폼 입력 후 제출 시 이벤트 생성 확인
- 생성 후 /events/[id]/manage로 리다이렉트 확인
- 유효하지 않은 입력 시 에러 메시지 표시
- 로딩 중 제출 버튼 비활성화 확인

**관련 파일**
- `src/app/events/new/page.tsx`: 이벤트 생성 페이지 (CREATE)
- `src/components/events/CreateEventForm.tsx`: 폼 컴포넌트 (CREATE)
- `src/app/dashboard/page.tsx`: "새 모임" 버튼 추가 (TO_MODIFY)
- `src/types/schemas.ts`: 이벤트 Zod 스키마 (REFERENCE)
- `docs/ROADMAP.md`: Task 007-1 ✅ 표시 (TO_MODIFY)

---

### 007-2: 초대 링크 공유

**설명**
이벤트 초대 링크를 생성하고 카카오톡으로 공유하는 기능을 구현합니다. 또한 링크 복사 기능도 포함합니다.

**구현 가이드**
1. 초대 링크 공유 컴포넌트 (`ShareInviteLink.tsx`):
   ```
   - 초대 링크 생성: https://yourdomain.com/join/[inviteCode]
   - 초대 코드는 이벤트 생성 시 자동으로 nanoid로 생성됨
   ```

2. 카카오톡 공유 기능:
   ```
   - Kakao JavaScript SDK 활용
   - window.Kakao 초기화 (컴포넌트 mount 시)
   - 공유 버튼 클릭 시 Kakao.Link.sendDefault() 호출
   - 공유 내용:
     * 제목: "[이벤트 제목] 참여 초대"
     * 설명: "모임에 참여해주세요! 아래 링크를 클릭하세요."
     * 이미지: 모임 관련 이미지 또는 로고
     * 링크: 초대 링크
   ```

3. 클립보드 복사 기능:
   ```
   - navigator.clipboard.writeText() 사용
   - 복사 성공: toast.success("링크가 복사되었습니다")
   - 복사 실패: toast.error("복사에 실패했습니다")
   - 복사 버튼 UI 변경 (복사됨 표시)
   ```

4. 이벤트 관리 페이지에 통합:
   ```
   - /events/[id]/manage 페이지 상단에 ShareInviteLink 컴포넌트 추가
   - 탭 이전에 배치하여 초대 링크가 항상 보이도록
   ```

5. 초대 링크 페이지 확인:
   ```
   - /join/[inviteCode] 페이지에서 이벤트 정보 표시
   - 게스트도 접근 가능 (로그인 불필요)
   ```

**의존성**
- 005-2: 이벤트 CRUD Server Actions 완료 (초대 코드 생성)
- 007-1: 이벤트 생성 폼 연동 완료

**검증 기준**
- 초대 링크 생성 및 표시 확인
- 카카오톡 공유 버튼 클릭 -> 카카오톡 실행 또는 팝업 확인
- 클립보드 복사 -> 링크 복사 확인
- /join/[inviteCode] 페이지 접근 가능 확인
- 게스트 접근 허용 확인

**관련 파일**
- `src/components/events/ShareInviteLink.tsx`: 공유 컴포넌트 (CREATE)
- `src/app/events/[id]/manage/page.tsx`: 컴포넌트 통합 (TO_MODIFY)
- `public/kakao-sdk.js` 또는 HTML 스크립트 태그: Kakao SDK 로드 (CREATE)
- `docs/ROADMAP.md`: Task 007-2 ✅ 표시 (TO_MODIFY)

---

### 007-3: 참석 의사 표시 및 대시보드

**설명**
사용자가 초대 링크를 통해 참석/불참/미정을 표시하고, 대시보드에서 참여 모임 목록을 조회하는 기능을 구현합니다.

**구현 가이드**
1. 초대 링크 페이지 업데이트 (`/join/[inviteCode]`):
   ```
   - URL에서 inviteCode 추출
   - getEventByInviteCode() Server Action 호출로 이벤트 정보 조회
   - 이벤트 정보 표시:
     * 제목, 날짜/시간, 장소, 참가비
     * 현재 참석/미정/불참 인원
   - 참석 의사 표시 폼:
     * 로그인 사용자: "참석" / "미정" / "불참" 버튼
     * 게스트: 이름 입력 필드 + "참석" 버튼
   ```

2. 참석 의사 표시 Server Action:
   ```
   - updateParticipantStatus(eventId, userId, status) 호출
   - 게스트: addParticipant(eventId, null, guestName, "ATTENDING") 호출
   - 성공: toast.success("참석 의사가 등록되었습니다") + 페이지 새로고침
   - 실패: toast.error(에러 메시지)
   ```

3. 대시보드 업데이트 (`/dashboard`):
   ```
   - 두 섹션으로 분리:
     * "주최 중인 모임": 현재 사용자가 주최한 이벤트 목록
     * "참여 중인 모임": 현재 사용자가 참여한 이벤트 목록
   - 각 이벤트 카드:
     * 제목, 날짜, 장소, 참가비
     * 주최 모임: "관리하기" 버튼 (/events/[id]/manage)
     * 참여 모임: "상세보기" 버튼 (/events/[id])
   - 빈 상태: "생성한 모임이 없습니다" / "참여한 모임이 없습니다"
   ```

4. 실시간 참여 현황 반영:
   ```
   - 이벤트 관리 페이지에서 참여자 탭 업데이트
   - listEventParticipants() 호출로 최신 데이터 조회
   - 참석/미정/불참 인원 집계 표시
   - 참여자 목록 (이름, 상태)
   ```

5. 로딩/에러 처리:
   ```
   - 초대 코드 조회 중: LoadingState 표시
   - 유효하지 않은 초대 코드: ErrorState 표시 ("존재하지 않는 모임입니다")
   - 대시보드 로딩: EventCardSkeleton 표시
   ```

**의존성**
- 005-2: 이벤트 CRUD Server Actions 완료
- 005-3: 참여자 API 완료
- 006-2: 인증 미들웨어 완료
- 007-1: 이벤트 생성 폼 완료

**검증 기준**
- 초대 링크 페이지 이벤트 정보 표시 확인
- 로그인 사용자 참석 의사 표시 -> 대시보드에 반영 확인
- 게스트 이름 입력 + 참석 -> 이벤트 참여자 목록에 추가 확인
- 대시보드 "주최 중인 모임" / "참여 중인 모임" 분리 확인
- 유효하지 않은 초대 코드 -> 에러 메시지 표시 확인

**관련 파일**
- `src/app/join/[inviteCode]/page.tsx`: 초대 링크 페이지 (TO_MODIFY)
- `src/app/dashboard/page.tsx`: 대시보드 업데이트 (TO_MODIFY)
- `src/components/events/JoinEventForm.tsx`: 참석 의사 표시 폼 (CREATE)
- `src/actions/participants.ts`: 참여자 API (REFERENCE)
- `docs/ROADMAP.md`: Task 007-3 ✅ 표시 (TO_MODIFY)

---

### 007-4: 상태 관리 및 E2E 테스트

**설명**
이벤트 상태 전환(모집중 -> 확정 -> 종료) 기능을 구현하고, 전체 이벤트 플로우에 대한 E2E 테스트를 작성합니다.

**구현 가이드**
1. 이벤트 상태 관리:
   ```
   - 상태: RECRUITING (모집중), CONFIRMED (확정), COMPLETED (종료)
   - 상태 전환 로직:
     * RECRUITING -> CONFIRMED: 주최자가 수동으로 확정
     * CONFIRMED -> COMPLETED: 이벤트 날짜 지난 후 자동/수동 전환
   - updateEventStatus(eventId, status) Server Action 구현
   - 주최자만 상태 변경 가능
   ```

2. 상태별 UI 표시:
   ```
   - 이벤트 카드에 상태 배지 추가 (RECRUITING, CONFIRMED, COMPLETED)
   - 상태별 색상: 파란색 (모집중), 초록색 (확정), 회색 (종료)
   - 이벤트 관리 페이지에 상태 변경 버튼 추가
   ```

3. E2E 테스트 작성 (`e2e/event-flow.spec.ts`):
   ```
   - 주최자 플로우:
     * 로그인 -> 대시보드 진입
     * 모임 생성 -> 이벤트 관리 페이지 이동
     * 초대 링크 확인 및 복사
     * 참여자 현황 확인 (아무도 참여하지 않은 상태)
     * 상태 "확정"으로 변경 -> 상태 업데이트 확인
   - 참여자 플로우:
     * 초대 링크 접근 (로그인 안한 상태)
     * 이름 입력 및 참석 의사 표시
     * 주최자: 참여자 목록에 추가 확인
   - 로그인 사용자 플로우:
     * 초대 링크 접근 (로그인 함)
     * 참석/불참/미정 선택
     * 대시보드의 "참여 중인 모임" 목록에 추가 확인
   ```

4. 에러 시나리오 테스트:
   ```
   - 유효하지 않은 초대 코드: 에러 메이지 표시
   - 중복 참여: "이미 참여 중입니다" 메시지
   - 주최자 외 상태 변경 시도: 거절 또는 버튼 비활성화
   ```

**의존성**
- 005-2: 이벤트 CRUD Server Actions 완료
- 005-3: 참여자 API 완료
- 006-2: 인증 미들웨어 완료
- 007-1: 이벤트 생성 폼 완료
- 007-3: 참석 의사 표시 완료

**검증 기준**
- updateEventStatus() Server Action 동작 확인
- 이벤트 상태 변경 후 UI 반영 확인
- E2E 테스트 모든 시나리오 통과
- 주최자 플로우: 로그인 -> 생성 -> 초대 -> 상태변경 완료
- 게스트 플로우: 초대 링크 -> 참석 의사 표시 완료
- 로그인 사용자 플로우: 초대 링크 -> 대시보드 반영 완료

**관련 파일**
- `src/actions/events.ts`: updateEventStatus() 추가 (TO_MODIFY)
- `src/app/events/[id]/manage/page.tsx`: 상태 변경 버튼 추가 (TO_MODIFY)
- `e2e/event-flow.spec.ts`: 이벤트 플로우 E2E 테스트 (CREATE)
- `src/types/api.ts`: EventStatus enum (REFERENCE)
- `docs/ROADMAP.md`: Task 007-4 ✅ 표시 (TO_MODIFY)

---

## Task 008: 정산/카풀/공지 (4개 서브태스크)

### 008-1: 정산 로직

**설명**
더치페이 정산 기능을 완전히 구현합니다. 참가비 기반 1인당 금액 계산, 납부 상태 관리, 카카오페이 링크 연동 등을 포함합니다.

**구현 가이드**
1. 정산 탭 UI 구현 (`SettlementTab.tsx`):
   ```
   - 정산 현황 카드:
     * 총 참가비 금액
     * 참석 인원 수
     * 1인당 금액 (fee / 참석 인원)
   - 참여자별 납부 상태 목록:
     * 참여자 이름, 상태 (납부/미납)
     * 미납자: 배경색 강조 (빨간색 또는 노란색)
   - 카카오페이 계좌 정보 입력:
     * 입력 필드: "카카오페이 계좌 (선택)"
     * 저장 버튼
     * 저장된 계좌는 참여자에게 표시
   ```

2. 정산 금액 계산:
   ```
   - calculateSettlement(eventId) Server Action 호출
   - 공식: fee / (참석 인원 수)
   - 소수점 처리: Math.ceil() 사용 (올림)
   - 예: 30,000원 / 3명 = 10,000원
   - 예: 30,000원 / 4명 = 7,500원 (올림: 7,500)
   ```

3. 납부 상태 관리:
   ```
   - updatePaymentStatus(participantId, hasPaid) Server Action
   - 주최자가 참여자의 납부 상태를 체크/언체크 가능
   - 체크 시 데이터베이스의 has_paid를 true로 업데이트
   - 언체크 시 has_paid를 false로 업데이트
   ```

4. 정산 현황 조회:
   ```
   - getSettlementSummary(eventId) Server Action
   - 반환값:
     * totalFee: 총 참가비
     * perPersonAmount: 1인당 금액
     * attendeeCount: 참석 인원
     * totalCollected: 현재 수금액 (납부자 수 * 1인당 금액)
     * unpaidCount: 미납자 수
     * kakaoPayUrl: 카카오페이 계좌 정보
   ```

5. 카카오페이 계좌 저장:
   ```
   - updateEventKakaoPayUrl(eventId, url) Server Action
   - 주최자만 수정 가능
   - 저장 후 toast.success("계좌 정보가 저장되었습니다")
   ```

6. 정산 탭 통합:
   ```
   - /events/[id]/manage 페이지의 "정산" 탭에 SettlementTab 추가
   - 주최자: 전체 기능 사용 가능
   - 참여자: 읽기만 가능 (자신의 납부 상태 확인)
   ```

**의존성**
- 005-3: 참여자/정산 API 완료
- 007-1: 이벤트 생성 폼 완료

**검증 기준**
- calculateSettlement() 계산 정확성 (30,000원 / 3명 = 10,000원)
- 참석 인원 수 변경 시 정산 금액 재계산 확인
- updatePaymentStatus() 납부 상태 업데이트 확인
- 미납자 목록 하이라이트 표시 확인
- 카카오페이 URL 저장 및 조회 확인
- 권한 검증 (참여자는 수정 불가)

**관련 파일**
- `src/components/events/manage/SettlementTab.tsx`: 정산 탭 UI (CREATE)
- `src/actions/settlements.ts`: 정산 API (REFERENCE - 005-3에서 생성)
- `src/app/events/[id]/manage/page.tsx`: 정산 탭 통합 (TO_MODIFY)
- `docs/ROADMAP.md`: Task 008-1 ✅ 표시 (TO_MODIFY)

---

### 008-2: 카풀 매칭

**설명**
카풀 매칭 기능을 완전히 구현합니다. 운전자 등록, 탑승자 신청, 정원 관리 등을 포함합니다.

**구현 가이드**
1. 카풀 탭 UI 구현 (`CarpoolTab.tsx`):
   ```
   - 두 섹션으로 분리:
     * "운전자 등록": 운전자로 등록하는 폼 (로그인 사용자만)
     * "카풀 현황": 등록된 카풀 목록
   - 운전자 등록 폼:
     * 입력 필드: 탑승 가능 인원(Select), 출발 장소(Input)
     * 등록 버튼
     * 이미 운전자로 등록했으면 "이미 등록했습니다" 메시지
   ```

2. 카풀 현황 카드:
   ```
   - 각 카풀 정보:
     * 운전자 이름, 출발 장소, 탑승 가능 인원
     * 현재 탑승자 수 / 정원 (예: 2 / 3명)
     * 탑승자 목록:
       - 이름, 상태 (대기중/승인/거절)
   - 주최자(운전자): "승인" / "거절" 버튼
   - 참여자(탑승자): "신청 취소" 버튼
   - 게스트: 신청 버튼
   - 정원 초과 시: "신청 불가" 버튼 (회색)
   ```

3. 운전자 등록:
   ```
   - registerDriver(eventId, userId, seats, departure) Server Action
   - 성공: toast.success("운전자로 등록되었습니다")
   - 실패: toast.error("이미 운전자로 등록했습니다")
   - 폼 초기화 및 카풀 현황 새로고침
   ```

4. 탑승자 신청:
   ```
   - requestRide(carpoolId, userId/guestName) Server Action
   - 정원 초과 시: toast.error("탑승 가능 인원이 없습니다")
   - 이미 신청했으면: toast.error("이미 신청했습니다")
   - 성공: toast.success("탑승을 신청했습니다")
   ```

5. 신청 관리:
   ```
   - updateCarpoolStatus(carpoolId, requestId, status) Server Action (ACCEPTED/REJECTED)
   - 운전자만 호출 가능
   - 승인: 탑승자 상태를 ACCEPTED로 변경
   - 거절: 탑승자 상태를 REJECTED로 변경
   - 시간초: toast.success("승인했습니다") / toast.error("거절했습니다")
   ```

6. 취소 기능:
   ```
   - cancelRideRequest(carpoolId, userId) Server Action
   - 탑승자가 신청 취소 가능
   - 취소 후 carpool_requests 레코드 삭제
   - toast.success("신청이 취소되었습니다")
   ```

**의존성**
- 005-4: 카풀 API 완료
- 007-1: 이벤트 생성 폼 완료

**검증 기준**
- registerDriver() 운전자 등록 확인
- requestRide() 탑승 신청 확인
- 정원 초과 시 신청 차단 (예: 3좌석에 4명 신청 시 실패)
- updateCarpoolStatus() 신청 승인/거절 확인
- cancelRideRequest() 신청 취소 확인
- 권한 검증 (운전자만 승인/거절 가능)

**관련 파일**
- `src/components/events/manage/CarpoolTab.tsx`: 카풀 탭 UI (CREATE)
- `src/actions/carpools.ts`: 카풀 API (REFERENCE - 005-4에서 생성)
- `src/app/events/[id]/manage/page.tsx`: 카풀 탭 통합 (TO_MODIFY)
- `docs/ROADMAP.md`: Task 008-2 ✅ 표시 (TO_MODIFY)

---

### 008-3: 공지사항 CRUD

**설명**
공지사항 기능을 완전히 구현합니다. 주최자의 공지 작성/수정/삭제와 참여자의 공지 조회 기능을 포함합니다.

**구현 가이드**
1. 공지 탭 UI 구현 (`NoticeTab.tsx`):
   ```
   - 두 섹션으로 분리:
     * "공지 작성" (주최자만): 입력 폼
     * "공지 목록": 생성된 공지들
   - 공지 작성 폼 (주최자용):
     * 입력 필드: 공지 내용 (Textarea)
     * 작성 버튼
     * 취소 버튼
   - 공지 목록:
     * 각 공지: 내용, 작성자, 작성 날짜
     * 주최자: "수정" / "삭제" 버튼
     * 참여자: 읽기만 가능
   ```

2. 공지 작성:
   ```
   - createNotice(eventId, content) Server Action
   - 주최자만 호출 가능 (RLS에 의해 자동 제어)
   - 빈 내용 검증: "공지 내용을 입력해주세요"
   - 성공: toast.success("공지가 작성되었습니다") + 폼 초기화 + 목록 새로고침
   ```

3. 공지 수정:
   ```
   - updateNotice(noticeId, content) Server Action
   - 작성자(주최자)만 호출 가능
   - 수정 폼 팝업 또는 인라인 에디트 제공
   - 성공: toast.success("공지가 수정되었습니다") + 목록 새로고침
   ```

4. 공지 삭제:
   ```
   - deleteNotice(noticeId) Server Action
   - 작성자(주최자)만 호출 가능
   - 확인 다이얼로그 표시: "공지를 삭제하시겠습니까?"
   - 성공: toast.success("공지가 삭제되었습니다") + 목록 새로고침
   ```

5. 공지 목록 조회:
   ```
   - listEventNotices(eventId) Server Action
   - 작성 날짜 역순 정렬 (최신부터)
   - 모든 참여자가 조회 가능
   - 빈 상태: "공지가 없습니다"
   ```

6. 공지 탭 통합:
   ```
   - /events/[id]/manage 페이지의 "공지" 탭에 NoticeTab 추가
   - 주최자: 모든 기능 사용 가능
   - 참여자: 읽기만 가능
   ```

**의존성**
- 005-4: 공지 API 완료
- 007-1: 이벤트 생성 폼 완료

**검증 기준**
- createNotice() 공지 작성 확인
- updateNotice() 공지 수정 확인
- deleteNotice() 공지 삭제 확인
- listEventNotices() 공지 목록 조회 확인
- 권한 검증 (주최자만 CUD 가능, 모두 R 가능)
- 빈 상태 UI 표시 확인

**관련 파일**
- `src/components/events/manage/NoticeTab.tsx`: 공지 탭 UI (CREATE)
- `src/actions/notices.ts`: 공지 API (REFERENCE - 005-4에서 생성)
- `src/app/events/[id]/manage/page.tsx`: 공지 탭 통합 (TO_MODIFY)
- `docs/ROADMAP.md`: Task 008-3 ✅ 표시 (TO_MODIFY)

---

### 008-4: 통합 E2E 테스트

**설명**
정산, 카풀, 공지 기능을 포함한 전체 이벤트 관리 플로우에 대한 통합 E2E 테스트를 작성합니다.

**구현 가이드**
1. `e2e/settlement-carpool-notice.spec.ts` 파일 생성:

2. 정산 플로우 테스트:
   ```
   - 이벤트 생성 (참가비 30,000원)
   - 참여자 3명 추가 (참석 상태)
   - 정산 탭 진입
   - 1인당 금액 계산 확인 (10,000원)
   - 주최자가 참여자 1명의 납부 상태를 "납부" 체크
   - "미납자" 목록 업데이트 확인 (2명 남음)
   - 카카오페이 계좌 입력 및 저장
   - 저장된 계좌 조회 확인
   ```

3. 카풀 플로우 테스트:
   ```
   - 운전자 등록 (4좌석, 출발지: "종로3가역")
   - 탑승자 A가 신청
   - 탑승자 B가 신청
   - 현황 확인 (2 / 4명)
   - 운전자가 A 승인, B 거절
   - 상태 업데이트 확인 (A: 승인, B: 거절)
   - 거절된 B가 신청 취소
   - 현황 다시 확인 (1 / 4명)
   - 정원 초과 테스트: 5명이 신청 시도 -> 차단 확인
   ```

4. 공지 플로우 테스트:
   ```
   - 주최자가 공지 작성 ("시간이 30분 앞당겨졌습니다")
   - 공지 목록 조회 확인
   - 주최자가 공지 수정 ("시간이 1시간 앞당겨졌습니다")
   - 수정된 내용 확인
   - 주최자가 공지 삭제 확인
   - 공지 목록 비어있음 확인
   - 참여자가 공지 작성 시도 -> 권한 오류 확인
   ```

5. 통합 플로우 테스트:
   ```
   - 주최자: 로그인 -> 이벤트 생성 -> 초대 링크 공유
   - 참여자 1: 초대 링크 -> 이름 입력 -> 참석
   - 참여자 2: 초대 링크 -> 로그인 후 참석
   - 주최자: 정산 탭 -> 1인당 금액 확인 -> 카풀 운전자 등록
   - 참여자 1, 2: 탑승 신청
   - 주최자: 신청 승인
   - 주최자: 공지 작성 ("카풀 확정되었습니다")
   - 참여자: 공지 확인
   ```

6. 에러 시나리오:
   ```
   - 비주최자가 정산 수정 시도 -> 읽기 모드 확인
   - 비운전자가 신청 관리 시도 -> 버튼 비활성화 확인
   - 정원 초과 신청 -> "탑승 가능 인원이 없습니다" 확인
   - 중복 신청 -> "이미 신청했습니다" 확인
   ```

**의존성**
- 008-1: 정산 로직 완료
- 008-2: 카풀 매칭 완료
- 008-3: 공지사항 CRUD 완료

**검증 기준**
- 정산 플로우 E2E 테스트 통과
- 카풀 플로우 E2E 테스트 통과
- 공지 플로우 E2E 테스트 통과
- 통합 플로우 (주최자 + 참여자) E2E 테스트 통과
- 에러 시나리오 테스트 통과
- 모든 권한 검증 통과

**관련 파일**
- `e2e/settlement-carpool-notice.spec.ts`: 통합 E2E 테스트 (CREATE)
- `src/components/events/manage/SettlementTab.tsx`: 정산 탭 (REFERENCE)
- `src/components/events/manage/CarpoolTab.tsx`: 카풀 탭 (REFERENCE)
- `src/components/events/manage/NoticeTab.tsx`: 공지 탭 (REFERENCE)
- `src/actions/settlements.ts`: 정산 API (REFERENCE)
- `src/actions/carpools.ts`: 카풀 API (REFERENCE)
- `src/actions/notices.ts`: 공지 API (REFERENCE)
- `docs/ROADMAP.md`: Task 008-4 ✅ 표시 (TO_MODIFY)

---

## 요약

### 타임라인
- **Phase 3 총 기간**: 약 4주
- **Task 005 (DB 구축)**: 1주 (매일 2-3시간)
- **Task 006 (OAuth)**: 1주 (매일 2-3시간)
- **Task 007 (이벤트 로직)**: 1주 (매일 2-3시간)
- **Task 008 (정산/카풀/공지)**: 1주 (매일 2-3시간)

### 우선순위
1. **Task 005**: 모든 다른 작업의 기반
2. **Task 006**: Task 007, 008과 병렬 진행 가능
3. **Task 007**: Task 006 완료 후
4. **Task 008**: Task 007 완료 후

### 체크리스트
- [ ] Task 005-1: Supabase 설정
- [ ] Task 005-2: 이벤트 CRUD
- [ ] Task 005-3: 참여자/정산 API
- [ ] Task 005-4: 카풀/공지 API
- [ ] Task 005-5: API 테스트
- [ ] Task 006-1: NextAuth 설정
- [ ] Task 006-2: 인증 미들웨어
- [ ] Task 006-3: 폼 연동
- [ ] Task 006-4: 세션/프로필 저장
- [ ] Task 007-1: 이벤트 생성 폼
- [ ] Task 007-2: 초대 링크 공유
- [ ] Task 007-3: 참석 의사 표시
- [ ] Task 007-4: 상태 관리 및 E2E 테스트
- [ ] Task 008-1: 정산 로직
- [ ] Task 008-2: 카풀 매칭
- [ ] Task 008-3: 공지사항 CRUD
- [ ] Task 008-4: 통합 E2E 테스트

---

_이 문서는 `docs/ROADMAP.md`와 함께 관리됩니다. 각 작업 완료 후 해당 섹션의 체크박스를 업데이트하세요._
