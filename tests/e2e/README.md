# E2E 테스트 가이드

Event Planner App의 End-to-End 테스트입니다. Playwright를 사용하여 실제 사용자 플로우를 검증합니다.

## 📋 테스트 시나리오

### 1. **organizer.spec.ts** - 주최자 플로우

- 로그인
- 모임 생성
- 초대 링크 생성 및 공유
- 참여 현황 확인
- 정산 관리
- 카풀 운전자 등록
- 공지사항 작성

### 2. **participant.spec.ts** - 참여자 플로우

- 초대 링크로 참가
- 로그인 후 참석 표시
- 공지사항 확인
- 카풀 신청
- 참석 상태 변경
- 참석 현황 반영 확인

### 3. **guest.spec.ts** - 게스트 플로우

- 로그인 없이 초대 링크 접근
- 게스트 정보 입력 (이름)
- 참석 상태 표시
- 공지사항 확인
- 카풀 신청
- 게스트 재진입 시나리오

### 4. **integration.spec.ts** - 통합 플로우

- 주최자가 모임 생성
- 초대 링크 생성 및 추출
- 카풀 등록
- 공지사항 작성
- 참여자가 초대 링크로 진입
- 참여 현황 동기화
- 정산 관리
- 카풀 신청 및 공지 확인

## 🚀 테스트 실행 방법

### 전제 조건

```bash
# 개발 서버 실행 (포트 3000에서)
npm run dev
```

### 모든 테스트 실행

```bash
npm run test:e2e
```

### UI 모드로 실행 (권장)

```bash
npm run test:e2e:ui
```

### 특정 테스트만 실행

```bash
npx playwright test organizer.spec.ts
npx playwright test participant.spec.ts
npx playwright test guest.spec.ts
npx playwright test integration.spec.ts
```

### 헤드리스 모드 (브라우저 표시)

```bash
npm run test:e2e:headed
```

### 디버그 모드

```bash
npm run test:e2e:debug
```

## 📊 테스트 결과 확인

테스트 완료 후 HTML 리포트가 생성됩니다:

```bash
npx playwright show-report
```

## ⚙️ 설정

### playwright.config.ts

- **baseURL**: http://localhost:3000
- **timeout**: 30초 (기본값)
- **retries**: 개발: 0, CI: 2
- **workers**: 병렬 실행 (개발 환경)
- **headless**: true (기본값)

## 🔍 주의사항

1. **테스트 데이터**
   - 테스트는 실제 Supabase 데이터베이스에 데이터를 생성합니다
   - 테스트 후 수동으로 정리가 필요할 수 있습니다
   - 또는 테스트용 별도 데이터베이스 사용 권장

2. **타이밍 이슈**
   - 네트워크 지연으로 인한 실패 시 `page.waitForTimeout()` 값 조정
   - 또는 `page.waitForSelector()` 등의 대기 조건 추가

3. **로그인 정보**
   - 테스트 계정 필요 (예: demo@example.com / demo123)
   - 각 테스트 시나리오별로 다른 계정 사용 권장

## 🛠️ 문제 해결

### "Page crashed" 에러

- 개발 서버가 실행 중인지 확인
- 포트 3000이 사용 중인지 확인

### 로그인 실패

- 테스트 계정이 데이터베이스에 존재하는지 확인
- NextAuth 설정 확인

### 요소를 찾을 수 없음

- 페이지 로드 대기 시간 증가
- 요소 선택자 업데이트 필요

## 📝 테스트 추가 방법

1. `tests/e2e/` 디렉토리에 새 파일 생성 (예: `feature.spec.ts`)
2. Playwright 테스트 코드 작성
3. `npm run test:e2e` 또는 `npm run test:e2e:ui`로 실행

## ✅ 체크리스트

- [ ] 개발 서버 실행 중 (npm run dev)
- [ ] 테스트 계정 생성됨
- [ ] Playwright 설치 완료 (npm install --save-dev @playwright/test)
- [ ] 테스트 실행 성공
- [ ] HTML 리포트 생성 확인

---

**마지막 업데이트**: 2026-02-21
**작성자**: Task 008-1 E2E 테스트
