# Supabase 설정 가이드

## 1️⃣ Supabase 프로젝트 생성

### 단계 1: 프로젝트 생성
1. [supabase.com](https://supabase.com)에 접속
2. **"Start your project"** 클릭
3. 다음 정보 입력:
   - **Project name**: `event-planner` (또는 선호하는 이름)
   - **Database password**: 강력한 비밀번호 설정
   - **Region**: 가장 가까운 지역 선택 (예: Tokyo, Singapore)
4. **"Create new project"** 클릭 (약 2-5분 소요)

### 단계 2: API 키 확보
프로젝트 생성 완료 후:
1. 좌측 사이드바에서 **Settings** → **API** 클릭
2. 다음 정보 복사:
   - **Project URL** (예: `https://xxxxxxxxxxxx.supabase.co`)
   - **anon public** (Public Key)
   - **service_role** (Service Role Key)

---

## 2️⃣ 데이터베이스 테이블 생성

### 단계 1: SQL 스크립트 실행
1. Supabase 대시보드에서 **SQL Editor** 클릭
2. **"New Query"** 클릭
3. 다음 파일의 전체 내용을 복사:
   - `docs/database-schema.sql`
4. SQL 에디터에 붙여넣기
5. **▶ Run** 또는 **Ctrl+Enter** 클릭

✅ 모든 테이블 생성 확인 (에러 없음)

### 단계 2: 테이블 확인
1. **Table Editor** 클릭
2. 다음 테이블들이 생성되었는지 확인:
   - `users`
   - `events`
   - `event_members`
   - `notices`
   - `carpools`
   - `carpool_requests`

---

## 3️⃣ 환경 변수 설정

### 파일: `.env.local` 생성

프로젝트 루트에 `.env.local` 파일 생성 후 다음 내용 입력:

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://xxxxxxxxxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**⚠️ 중요 사항:**
- `.env.local`은 `.gitignore`에 이미 포함되어 있습니다
- Service Role Key는 절대 GitHub에 업로드하지 마세요
- Vercel 배포 시에는 대시보드에서 환경 변수 등록

---

## 4️⃣ 테스트

### 간단한 테스트 실행
터미널에서:

```bash
npm run dev
```

브라우저에서 `http://localhost:3000` 접속 후:
- 콘솔에 에러가 없는지 확인
- 초대 링크 페이지 접속 시 더미 데이터 대신 실제 이벤트 조회 여부 확인

---

## 🔐 RLS (Row Level Security) 정책

데이터베이스 스키마에 포함된 RLS 정책:

| 테이블 | 정책 |
|--------|------|
| `users` | 모든 사용자가 프로필 조회 가능, 자신만 수정 |
| `events` | 모든 인증 사용자가 조회, 주최자만 CUD |
| `event_members` | 모든 사용자가 조회, 자신의 정보만 수정 |
| `notices` | 모든 사용자가 조회, 주최자만 CUD |
| `carpools` | 모든 사용자가 조회, 운전자만 수정 |
| `carpool_requests` | 모든 사용자가 조회, 신청자/운전자가 수정/삭제 |

---

## ✅ 체크리스트

- [ ] Supabase 프로젝트 생성
- [ ] API 키 복사 (Project URL, Anon Key, Service Role Key)
- [ ] SQL 스크립트 실행
- [ ] 모든 테이블 생성 확인
- [ ] `.env.local` 파일 생성 및 값 입력
- [ ] 개발 서버 실행 확인 (에러 없음)
- [ ] RLS 정책 활성화 확인 (SQL 스크립트에 포함)

---

## 📞 문제 해결

### 문제: "NEXT_PUBLIC_SUPABASE_URL이 없다"는 에러
**해결**: `.env.local` 파일이 프로젝트 루트에 있는지 확인, 개발 서버 재시작

### 문제: "RLS 정책 오류"가 나타남
**해결**: Supabase 대시보드의 **Authentication** → **Policies** 에서 정책 확인

### 문제: "초대 코드가 조회되지 않음"
**해결**: `events` 테이블의 인덱스 확인, RLS 정책이 SELECT를 허용하는지 확인

---

## 🚀 다음 단계

Task 005-1 완료 후:
1. **Task 005-2**: 이벤트 CRUD Server Actions 구현
2. **Task 005-3**: 참여자/정산 API 구현
3. **Task 005-4**: 카풀/공지 API 구현
4. **Task 005-5**: API 테스트

---

_이 문서는 `docs/ROADMAP.md`와 함께 관리됩니다._
