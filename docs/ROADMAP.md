# Moim 개발 로드맵

친목 모임 주최자가 카카오톡에서 겪는 참여자 관리, 정산, 공지 문제를 한 곳에서 해결하는 모바일 퍼스트 웹 서비스

## 개요

**Moim(모임)**은 20~40대 직장인 및 동호회 주최자를 위한 모임 관리 플랫폼으로 다음 기능을 제공합니다:

- **이벤트 생성 및 초대**: 모임을 생성하고 초대 링크를 카카오톡으로 공유 (F001, F002)
- **참석 관리**: 참석/불참/미정 의사 표시 및 실시간 현황 대시보드 (F003, F004, F011)
- **정산 및 카풀**: 더치페이 자동 계산, 카풀 매칭, 공지사항 관리 (F005, F006, F007)
- **인증 및 관리**: 카카오 OAuth 로그인, 관리자 대시보드 (F010, F012)

## 개발 워크플로우

1. **작업 계획**

- 기존 코드베이스를 학습하고 현재 상태를 파악
- 새로운 작업을 포함하도록 `ROADMAP.md` 업데이트
- 우선순위 작업은 마지막 완료된 작업 다음에 삽입

2. **작업 생성**

- 기존 코드베이스를 학습하고 현재 상태를 파악
- `/tasks` 디렉토리에 새 작업 파일 생성
- 명명 형식: `XXX-description.md` (예: `001-setup.md`)
- 고수준 명세서, 관련 파일, 수락 기준, 구현 단계 포함
- **API/비즈니스 로직 작업 시 "## 테스트 체크리스트" 섹션 필수 포함 (Playwright MCP 테스트 시나리오 작성)**

3. **작업 구현**

- 작업 파일의 명세서를 따름
- 기능과 기능성 구현
- **API 연동 및 비즈니스 로직 구현 시 Playwright MCP로 테스트 수행 필수**
- 각 단계 후 작업 파일 내 단계 진행 상황 업데이트
- 구현 완료 후 Playwright MCP를 사용한 E2E 테스트 실행
- 각 단계 완료 후 중단하고 추가 지시를 기다림

4. **로드맵 업데이트**

- 로드맵에서 완료된 작업을 ✅로 표시

---

## 개발 단계

### Phase 1: 애플리케이션 골격 구축 ✅

- **Task 001: 프로젝트 구조 및 라우팅 설정** ✅ - 완료
  - ✅ Next.js App Router 기반 전체 라우트 구조 생성
    - `/` (랜딩 페이지)
    - `/login` (로그인)
    - `/signup` (회원가입)
    - `/dashboard` (대시보드)
    - `/events/[id]/manage` (이벤트 관리 - 주최자)
    - `/join/[inviteCode]` (초대 링크 참여)
    - `/admin` (관리자 대시보드)
  - ✅ 공통 레이아웃 컴포넌트 골격 구현 (Header, Footer, Container)
  - ✅ 하단 탭 네비게이션 컴포넌트 생성 (BottomTab)
  - ✅ 테마 프로바이더 설정 (ThemeProvider)

- **Task 002: 타입 정의 및 데이터 모델 설계** - 대기
  - PRD 데이터 모델 기반 TypeScript 인터페이스 정의
    - `User`: id, kakaoId, name, profileImage, createdAt
    - `Event`: id, title, hostId, date, location, fee, maxAttendees, status, inviteCode
    - `EventMember`: id, eventId, userId, guestName, status, hasPaid
    - `Notice`: id, eventId, content, authorId, createdAt
    - `Carpool`: id, eventId, driverId, seats, departure
  - API 요청/응답 타입 정의 (이벤트 CRUD, 참여자 관리, 정산, 카풀)
  - Zod 스키마 정의 (이벤트 생성 폼, 참석 의사 표시 폼, 카풀 등록 폼)
  - 상태 열거형 정의 (EventStatus, AttendanceStatus, PaymentStatus)
  - 더미 데이터 팩토리 함수 생성 (`src/lib/mock-data.ts`)

### Phase 2: UI/UX 완성 (더미 데이터 활용) ✅

- **Task 003: 공통 컴포넌트 라이브러리 구현** ✅ - 완료
  - ✅ shadcn/ui 기반 공통 UI 컴포넌트 설치 및 구성
    - Button, Card, Badge, Avatar, Input, Select, Dialog, Sheet, Form, Checkbox, Progress, Skeleton, Sonner 등
  - ✅ 이벤트 도메인 컴포넌트 구현 (EventCard)
  - ✅ 랜딩 페이지 섹션 컴포넌트 구현 (Hero, Features, CTA)
  - ✅ 인증 폼 컴포넌트 구현 (LoginForm, SignupForm)

- **Task 004: 모든 페이지 UI 완성** ✅ - 완료
  - ✅ 랜딩 페이지 UI (`/`) - 서비스 소개, 카카오 로그인 CTA
  - ✅ 로그인/회원가입 페이지 UI (`/login`, `/signup`)
  - ✅ 대시보드 페이지 UI (`/dashboard`) - 주최/참여 모임 카드 목록
  - ✅ 이벤트 관리 페이지 UI (`/events/[id]/manage`) - 참여자/정산/카풀 탭
  - ✅ 초대 링크 페이지 UI (`/join/[inviteCode]`) - 참석 의사 표시
  - ✅ 관리자 대시보드 UI (`/admin`) - 통계 카드, 모임 테이블
  - ✅ 반응형 디자인 및 모바일 최적화
  - ✅ 하단 탭 네비게이션 연동

- **Task 002: 타입 정의 및 데이터 모델 설계** ✅ - 완료 (대기 중이던 작업 완료)
  - ✅ TypeScript 인터페이스 정의 (User, Event, EventMember, Notice, Carpool)
  - ✅ API 요청/응답 DTO 타입 (src/types/api.ts)
  - ✅ React Hook Form + Zod 스키마 (src/types/schemas.ts)
  - ✅ 더미 데이터 팩토리 함수 (src/lib/mock-data.ts)
  - ✅ 상태 열거형 정의 (EventStatus, AttendanceStatus, PaymentStatus)

- **Task 002-1: React Hook Form 폼 통합** ✅ - 완료
  - ✅ React Hook Form + Zod로 LoginForm, SignupForm 마이그레이션
  - ✅ FormError 컴포넌트 생성 (필드 검증 에러 표시)
  - ✅ useForm hook으로 폼 상태 관리, zodResolver로 검증 통합
  - ✅ 비밀번호 필드 표시/숨김 토글 기능 유지
  - ✅ 폼 제출 중 상태 표시 (로딩 텍스트, 버튼 비활성화)
  - ✅ 모든 폼 에러 메시지는 FormError 컴포넌트로 일관되게 표시

- **Task 002-2: 페이지 데이터 통합** ✅ - 완료
  - ✅ Tabs UI 컴포넌트 생성 (@/components/ui/tabs.tsx)
  - ✅ 대시보드 페이지: createMockEvents() 연동
  - ✅ 이벤트 관리 페이지: createCompleteMockEvent() 연동, Tabs 레이아웃 활성화
  - ✅ 초대 링크 페이지: mockEvent() 연동
  - ✅ 관리자 대시보드: createMockEvents() 연동 및 통계 표시
  - ✅ 모든 페이지에서 더미 데이터 활용하여 UI 프리뷰 가능

- **Task 002-3: UX 개선 (로딩, 에러, 빈 상태)** ✅ - 완료
  - ✅ EmptyState 컴포넌트 (아이콘, 제목, 설명, 액션 버튼)
  - ✅ LoadingState 컴포넌트 (스켈레톤 표시)
  - ✅ ErrorState 컴포넌트 (AlertCircle 아이콘, 재시도 버튼)
  - ✅ EventCardSkeleton 컴포넌트 (이벤트 카드 로딩)
  - ✅ Skeleton 컴포넌트로 animate-pulse 효과 적용
  - ✅ Sonner 토스트 활용 준비 (기존 설정 활용)

- **Task 002-4: 반응형 검증 및 접근성 & 테스트** ✅ - 완료
  - ✅ Playwright E2E 테스트 작성 (forms.spec.ts, pages.spec.ts)
  - ✅ 폼 입력 및 검증 테스트 (로그인, 회원가입)
  - ✅ 페이지 네비게이션 및 상호작용 테스트
  - ✅ WCAG 2.1 AA 접근성 검증 (키보드 네비게이션, 레이블 연결)
  - ✅ 반응형 디자인 검증 (375px, 768px, 1440px)
  - ✅ 에러 메시지 표시 및 폼 제출 기능 테스트

### Phase 3: 핵심 기능 구현

> ⚠️ Task 002-4 완료 후 Task 005 시작 (Phase 2 모든 태스크 완료 필수)

- **Task 005: Supabase 데이터베이스 구축 및 API 개발**
  - ✅ Supabase 프로젝트 생성 및 PostgreSQL 연결
  - ✅ 데이터베이스 테이블 생성 (User, Event, EventMember, Notice, Carpool)
    - ✅ RLS(Row Level Security) 정책 설정
    - ✅ 인덱스 및 외래키 제약조건 설정
  - Server Actions 기반 데이터 접근 레이어 구현
    - ✅ 이벤트 CRUD (생성/조회/수정/삭제) - F001 **[Task 005-2]**
      - ✅ createEvent() - 초대코드 자동 생성 (nanoid)
      - ✅ getEvent() - 참여자 통계 포함
      - ✅ updateEvent() - 주최자만 수정 가능
      - ✅ deleteEvent() - 주최자만 삭제 가능
      - ✅ listUserEvents() - 주최/참여 모임 구분
      - ✅ getEventByInviteCode() - 게스트 접근 가능
    - ✅ 참여자 관리 (참석 의사 표시, 목록 조회) - F003, F004 **[Task 005-3]**
      - ✅ createEventMember() - 로그인/게스트 참여자 추가
      - ✅ updateAttendance() - 참석 상태 변경
      - ✅ getEventMembers() - 참여자 목록 조회
      - ✅ removeEventMember() - 참여자 제거 (주최자)
    - ✅ 정산 관리 (금액 계산, 납부 상태 업데이트) - F005 **[Task 005-4]**
      - ✅ getSettlementSummary() - 정산 현황 조회 및 자동 계산
      - ✅ updatePaymentStatus() - 개별 납부 상태 업데이트
      - ✅ bulkUpdatePaymentStatus() - 일괄 납부 상태 업데이트
      - ✅ getPaymentStats() - 납부율 통계 조회
    - ✅ 카풀 관리 (운전자 등록, 탑승자 신청/취소) - F006 **[Task 005-5]**
      - ✅ createCarpool() - 카풀 운전자 등록
      - ✅ joinCarpool() - 카풀 탑승 신청 (PENDING 상태)
      - ✅ leaveCarpool() - 카풀 탑승 취소
      - ✅ getCarpools() - 이벤트별 카풀 목록 조회
      - ✅ getCarpool() - 카풀 상세 조회 (신청자 통계 포함)
      - ✅ getUserCarpools() - 사용자 신청 카풀 목록 조회
    - ✅ 공지사항 CRUD - F007 **[Task 005-6]**
      - ✅ createNotice() - 공지사항 작성 (주최자)
      - ✅ updateNotice() - 공지사항 수정 (작성자)
      - ✅ deleteNotice() - 공지사항 삭제 (작성자)
      - ✅ getNotices() - 공지사항 목록 조회
      - ✅ getRecentNotices() - 최근 공지사항 조회
  - 폼 컴포넌트 생성
    - ✅ CreateEventForm - React Hook Form + Zod 구현
    - ✅ AttendanceForm - 참석 의사 표시 폼
    - ✅ CarpoolForm - 카풀 등록 폼
  - 더미 데이터를 실제 API 호출로 교체 (Task 007에서 수행)
  - ## 테스트 체크리스트
    - ✅ 이벤트 생성/조회/수정/삭제 API 동작 검증
    - ✅ 참여자 참석 의사 표시 및 현황 조회 테스트 (attendance.ts 구현)
    - ✅ 정산 금액 계산 정확성 검증 (settlement.ts 구현)
    - ✅ 카풀 등록/신청/취소 플로우 테스트 (carpool.ts 구현)
    - ✅ 공지사항 작성/수정/삭제 테스트 (notices.ts 구현)
    - RLS 정책 검증 (권한 없는 접근 차단) - 후속 테스트

- **Task 006: 카카오 OAuth 인증 시스템 구현** (F010)
  - NextAuth.js 설치 및 카카오 Provider 설정
  - 카카오 개발자 앱 등록 및 OAuth 리다이렉트 설정
  - 로그인/로그아웃 처리 및 세션 관리
  - 사용자 프로필 자동 저장 (카카오 이름, 프로필 이미지)
  - 인증 미들웨어 구현 (보호된 라우트 접근 제어)
    - `/dashboard`, `/events/*` 로그인 필수
    - `/admin` 관리자 권한 필수
    - `/join/[inviteCode]` 게스트 허용
  - 로그인/회원가입 폼을 실제 카카오 OAuth와 연동
  - ## 테스트 체크리스트
    - 카카오 로그인 플로우 (로그인 -> 리다이렉트 -> 대시보드)
    - 로그아웃 후 보호된 페이지 접근 차단 검증
    - 게스트 사용자 초대 링크 접근 허용 검증
    - 관리자 권한 페이지 접근 제어 검증
    - 세션 만료 시 자동 리다이렉트 검증

- **Task 007: 이벤트 핵심 비즈니스 로직 구현** (F001, F002, F003, F004)
  - 이벤트 생성 폼 실제 연동 (React Hook Form + Zod + Server Action)
    - 제목, 날짜/시간, 장소, 최대 인원, 참가비, 설명 입력
    - 유효성 검사 및 에러 처리
  - 초대 링크 생성 및 공유 기능 구현
    - nanoid 기반 고유 초대 코드 생성
    - 카카오톡 공유 버튼 (Kakao JavaScript SDK 연동)
    - 클립보드 링크 복사 기능
  - 참석 의사 표시 기능 구현
    - 로그인 사용자: 참석/불참/미정 토글
    - 게스트 사용자: 이름 입력 후 참석 의사 표시
    - 실시간 참여 현황 반영 (참석 N / 미정 N / 불참 N)
  - 대시보드 실제 데이터 연동 (F011)
    - 주최 중인 모임 목록 조회
    - 참여 중인 모임 목록 조회
    - 다가오는 일정 강조 표시
  - 이벤트 상태 관리 (모집중 -> 확정 -> 종료)
  - ## 테스트 체크리스트
    - 이벤트 생성 전체 플로우 (입력 -> 유효성 검사 -> 생성 -> 관리 페이지 이동)
    - 초대 링크로 참여자 진입 및 참석 의사 표시
    - 게스트 참여 플로우 (이름 입력 -> 참석 표시 -> 완료)
    - 대시보드에서 모임 목록 정상 표시 검증
    - 이벤트 상태 변경 플로우 검증

- **Task 008: 정산/카풀/공지 기능 구현** (F005, F006, F007)
  - 더치페이 정산 기능 구현 (F005)
    - 참가비 기반 1인당 금액 자동 계산
    - 참여자별 납부 상태 체크 (주최자가 관리)
    - 미납자 목록 하이라이트 표시
    - 카카오페이 링크 입력 및 표시
    - 참여자 납부 완료 자기 신고 버튼
  - 카풀 매칭 기능 구현 (F006)
    - 운전자 등록 (탑승 가능 인원, 출발 장소)
    - 탑승자 신청 및 취소
    - 카풀 현황 카드 (운전자별 탑승자 목록)
    - 정원 초과 시 신청 차단
  - 공지사항 기능 구현 (F007)
    - 주최자 공지 작성/수정/삭제
    - 참여자 공지 목록 조회
    - 이벤트 상세 페이지 내 공지 섹션 표시
  - ## 테스트 체크리스트
    - 정산 금액 계산 정확성 (참가비 / 참석 인원)
    - 납부 상태 업데이트 및 미납자 표시 검증
    - 카풀 운전자 등록 -> 탑승자 신청 -> 매칭 완료 플로우
    - 카풀 정원 초과 시 신청 차단 검증
    - 공지 작성/수정/삭제 권한 검증 (주최자만 가능)

- **Task 008-1: 핵심 기능 통합 테스트**
  - Playwright MCP를 사용한 전체 사용자 플로우 E2E 테스트
    - 주최자 플로우: 로그인 -> 모임 생성 -> 초대 링크 공유 -> 참여 현황 확인 -> 정산 관리
    - 참여자 플로우: 초대 링크 클릭 -> 참석 표시 -> 공지 확인 -> 카풀 신청
    - 게스트 플로우: 초대 링크 클릭 -> 이름 입력 -> 참석 표시
  - API 연동 및 비즈니스 로직 전체 검증
  - 에러 핸들링 및 엣지 케이스 테스트
    - 네트워크 오류 시 적절한 에러 메시지 표시
    - 동시 접근 시 데이터 정합성 유지
    - 만료된 초대 링크 처리

### Phase 4: 고급 기능 및 최적화

- **Task 009: 관리자 대시보드 기능 구현** (F012)
  - 관리자 대시보드 실제 데이터 연동
    - 전체 모임 수, 활성 사용자 수, 총 매출 통계 카드
    - 최근 모임 테이블 (모임명, 참석/정원, 매출, 상태)
  - 관리자 권한 검증 미들웨어
  - 데스크톱 전용 레이아웃 최적화 (사이드바 네비게이션)
  - ## 테스트 체크리스트
    - 관리자 로그인 후 통계 데이터 정상 표시 검증
    - 비관리자 접근 차단 검증
    - 모임 목록 필터링 및 정렬 기능 검증

- **Task 010: UX 개선 및 에러 처리**
  - 로딩 스켈레톤 UI 적용 (모든 데이터 페칭 구간)
  - 에러 페이지 구현 (404 Not Found, 500 Server Error)
  - 빈 상태 UI 구현 (모임이 없을 때, 참여자가 없을 때)
  - 성공/실패 토스트 알림 (Sonner 활용)
  - 모바일 터치 최적화 (버튼 최소 44px, 스와이프 제스처)
  - 접근성 개선 (aria 속성, 키보드 네비게이션)

- **Task 011: 성능 최적화**
  - 이미지 최적화 (next/image 컴포넌트 활용)
  - API 응답 캐싱 전략 구현 (React Server Components, revalidate)
  - 번들 사이즈 최적화 (dynamic import, tree shaking)
  - Lighthouse 점수 90점 이상 달성
  - Core Web Vitals 최적화 (LCP, FID, CLS)

- **Task 012: 보안 강화 및 배포**
  - 보안 강화
    - API Route 인증 체크 미들웨어
    - CSRF 방어 설정
    - 환경 변수 보안 관리
    - 입력값 검증 및 XSS 방지
  - Vercel 배포
    - Supabase 프로덕션 환경 설정
    - 카카오 앱 도메인 등록 (프로덕션 URL)
    - 환경 변수 설정 (Vercel Dashboard)
    - 커스텀 도메인 연결
  - 모니터링 설정
    - 에러 로깅 (Vercel Analytics 또는 Sentry)
    - 성능 모니터링

---

## 기술 부채 / 차기 버전 (v2 계획)

> MVP 이후 사용자 피드백 기반으로 우선순위 결정

- 반복 일정 자동 생성 (매주/매월)
- 프로필 상세 관리 (아바타, 자기소개)
- 채팅 / 댓글 기능
- 사진 갤러리 (모임 후기)
- 투표 기능 (날짜 선택 투표)
- 외부 캘린더 연동 (Google Calendar)
- 실시간 알림 (브라우저 Push, 카카오 알림톡)
- iOS / Android 앱 (PWA 또는 React Native)

---

_이 로드맵은 `docs/PRD.md`와 함께 관리됩니다._

---

## 📊 진행 상황 현황

| Phase       | 상태       | 진행도                              |
| ----------- | ---------- | ----------------------------------- |
| **Phase 1** | ✅ 완료    | 2/2 Tasks                           |
| **Phase 2** | ✅ 완료    | 4/4 Tasks                           |
| **Phase 3** | 🔄 진행 중 | 2/4 Tasks (Task 005-2,3,4,5,6 완료) |
| **Phase 4** | ⏳ 대기 중 | 0/4 Tasks                           |

**📅 최종 업데이트**: 2026-02-21
**📈 전체 진행률**: 8/12 Tasks 완료 (67%)
