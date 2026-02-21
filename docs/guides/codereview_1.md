# Task 008 코드 리뷰 - 남은 사항 정리

**리뷰 완료 일자**: 2026-02-21
**대상**: Task 008 (정산/카풀/공지 기능 구현)
**리뷰어**: code-reviewer 에이전트

---

## 📌 현재 상태

### ✅ 완료된 사항

#### 🔒 보안 이슈 #1: 인증 우회 취약점 (2026-02-21)

- **Commit**: c505454
- **상태**: ✅ 완료
- **내용**:
  - `createCarpool()`, `joinCarpool()`, `leaveCarpool()` - driverId/passengerId 서버 검증
  - `createNotice()` - authorId 서버 검증
  - `deleteNotice()` - 작성자/주최자 권한 검증 추가
  - `updatePaymentStatus()` - 주최자 권한 검증 추가
  - `JoinCarpoolRequest` - userId 필드 제거

---

## ⚠️ 남은 사항 (우선순위별)

### 1. 심각도: 높음

#### Issue #3: isSubmitting 상태가 전역적으로 공유됨

**파일**: `src/app/events/[id]/manage/page.tsx` (59줄, 539-573줄, 659-682줄, 719-751줄, 802-822줄)

**문제**: 컴포넌트 전체에 `isSubmitting` 상태 하나를 공유합니다.

- 납부 완료 처리 중에 공지사항 작성 버튼도 동시에 비활성화됨
- 미납자 목록에 여러 명이 있을 때, 어떤 항목이 처리 중인지 구분 불가

```typescript
// ❌ 현재: 모든 버튼이 공유하는 상태
const [isSubmitting, setIsSubmitting] = useState(false)

// ✅ 개선: 기능별/항목별 상태 분리
const [submittingPaymentId, setSubmittingPaymentId] = useState<string | null>(
  null
)
const [isCreatingNotice, setIsCreatingNotice] = useState(false)
const [joiningCarpoolId, setJoiningCarpoolId] = useState<string | null>(null)
```

**해결 방안**:

```typescript
// 각 기능별로 상태 분리
const [submittingPaymentId, setSubmittingPaymentId] = useState<string | null>(null)
const [isCreatingNotice, setIsCreatingNotice] = useState(false)
const [joiningCarpoolId, setJoiningCarpoolId] = useState<string | null>(null)

// 납부 처리 버튼 예시
<Button
  disabled={submittingPaymentId === member.id}
  onClick={async () => {
    setSubmittingPaymentId(member.id)
    // ...
    setSubmittingPaymentId(null)
  }}
>
  {submittingPaymentId === member.id ? '처리 중...' : '완료'}
</Button>
```

---

#### Issue #8: bulkUpdatePaymentStatus가 부분 실패 시 롤백 없음

**파일**: `src/actions/settlement.ts` (186-212줄)

**문제**: `Promise.all`로 여러 업데이트를 병렬 실행할 때, 일부가 성공하고 일부가 실패하면 데이터 불일치 발생

```typescript
// ❌ 현재: 일부 성공, 일부 실패 시 데이터 불일치
const results = await Promise.all(updates.map(update => supabase...))
const errorResult = results.find(r => r.error)
if (errorResult?.error) {
  return { success: false, error: ... }  // 이미 일부는 업데이트된 상태
}
```

**해결 방안**:

1. **트랜잭션 사용**: Supabase의 PostgreSQL RPC를 사용하여 트랜잭션으로 처리
2. **순차 처리**: 개별 업데이트를 순차적으로 실행하면서 실패 시 이전 상태로 복구

```typescript
export async function bulkUpdatePaymentStatus(
  eventId: string,
  updates: Array<{ memberId: string; hasPaid: boolean }>
): Promise<ApiResponse<EventMember[]>> {
  const results: EventMember[] = []
  const rollbackStack: Array<{ memberId: string; hasPaid: boolean }> = []

  try {
    // 순차적으로 처리하며 롤백 스택 유지
    for (const update of updates) {
      const result = await updatePaymentStatus({
        eventId,
        memberId: update.memberId,
        hasPaid: update.hasPaid,
      })

      if (!result.success) {
        // 이전 변경사항 롤백
        for (const rollback of rollbackStack) {
          await updatePaymentStatus({
            eventId,
            memberId: rollback.memberId,
            hasPaid: rollback.hasPaid,
          })
        }
        return result
      }

      results.push(result.data!)
      rollbackStack.push({
        memberId: update.memberId,
        hasPaid: !update.hasPaid, // 롤백용 값
      })
    }

    return { success: true, data: results }
  } catch (error) {
    return { success: false, error: '배치 업데이트 중 오류 발생' }
  }
}
```

---

### 2. 심각도: 중간

#### Issue #5: 카풀 탑승 현황 Progress Bar가 항상 0%

**파일**: `src/app/events/[id]/manage/page.tsx` (641-649줄)

**문제**: Progress Bar의 너비가 하드코딩되어 실제 탑승 인원을 반영하지 않음

```tsx
// ❌ 현재: 항상 0%
style={{ width: `${(0 / carpool.seats) * 100}%` }}
```

**해결 방안**: `getCarpool` 함수로 실제 인원수 조회하여 표시

```typescript
// getCarpool 응답 구조
{
  carpool,
  acceptedCount,  // 탑승 승인된 인원
  pendingCount,   // 신청 대기 중인 인원
  availableSeats  // 남은 좌석
}

// 페이지에서 사용
const { acceptedCount, carpool } = await getCarpool(carpoolId)
style={{ width: `${(acceptedCount / carpool.seats) * 100}%` }}
```

---

#### Issue #6: JoinCarpoolRequest의 userId 중복 전달

**파일**: `src/app/events/[id]/manage/page.tsx` (662-665줄)

**상태**: ✅ 타입 정의 완료 (userId 필드 제거)

**확인 사항**: 페이지의 호출부 이미 수정됨

---

#### Issue #7: 1인당 금액 계산이 페이지와 Server Action에서 다르게 처리

**파일**:

- `src/app/events/[id]/manage/page.tsx` (429줄)
- `src/actions/settlement.ts` (72줄)

**문제**: 페이지에서는 `Math.ceil`, Server Action에서는 `Math.round` 사용

```typescript
// ❌ 페이지: Math.ceil
Math.ceil(event.fee / attendingCount).toLocaleString()

// ❌ Server Action: Math.round
pricePerPerson: Math.round(pricePerPerson)
```

**해결 방안**: 계산 로직을 유틸 함수로 분리하여 일관성 보장

```typescript
// src/lib/calculation.ts
export function calculatePricePerPerson(
  totalFee: number,
  attendingCount: number
): number {
  if (attendingCount === 0) return 0
  return Math.ceil(totalFee / attendingCount)
}

// 페이지와 Server Action 모두에서 사용
import { calculatePricePerPerson } from '@/lib/calculation'
const pricePerPerson = calculatePricePerPerson(event.fee, attendingCount)
```

---

#### Issue #9: 초대 링크 공유 모달에서 카카오톡 공유 API가 잘못 구현됨

**파일**: `src/app/events/[id]/manage/page.tsx` (901-909줄)

**문제**: 카카오톡 공유 버튼이 실제 공유 텍스트/링크를 전달하지 않음

```typescript
// ❌ 현재: text 변수가 선언되었으나 사용되지 않음
const text = `${event?.title} 모임에 참석해주세요!\n${link}`
const kakaoShareUrl = `https://story.kakao.com/?...{"key1":"value1","key2":"value2"}`
// 실제 link와 text가 URL에 포함되지 않음
```

**해결 방안**: Web Share API 사용 (폴백: 클립보드 복사)

```typescript
const handleShare = async () => {
  const shareData = {
    title: event?.title,
    text: `${event?.title} 모임에 참석해주세요!`,
    url: getInviteLink(),
  }

  if (navigator.share) {
    await navigator.share(shareData)
  } else {
    // 폴백: 클립보드 복사
    await copyToClipboard()
  }
}
```

---

#### Issue #10: 헤더 UI가 로딩/에러/정상 세 상태에 모두 동일하게 복사됨

**파일**: `src/app/events/[id]/manage/page.tsx` (127-218줄)

**문제**: 뒤로가기 헤더 JSX가 3번 중복되어 유지보수 어려움

**해결 방안**: 헤더를 별도 컴포넌트로 분리

```typescript
// ManagePageHeader 컴포넌트 분리
function ManagePageHeader() {
  const router = useRouter()
  return (
    <div className="sticky top-0 z-10 border-b border-gray-200 bg-white">
      <Container className="flex items-center justify-between py-3">
        <button className="-ml-2 rounded-lg p-2 hover:bg-gray-100" onClick={() => router.back()}>
          {/* 뒤로가기 아이콘 */}
        </button>
        <h1 className="flex-1 text-center text-lg font-bold text-gray-900">모임 관리</h1>
        <button className="rounded-lg p-2 hover:bg-gray-100">
          <Settings size={20} className="text-gray-700" />
        </button>
      </Container>
    </div>
  )
}

// 사용
export default function ManagePage() {
  return (
    <>
      {isLoading ? <ManagePageHeader /> : null}
      {error || !event ? <ManagePageHeader /> : null}
      <ManagePageHeader />
    </>
  )
}
```

---

### 3. 심각도: 낮음

#### Issue #11: mapAttendanceStatus 함수가 렌더링 중에 정의됨

**파일**: `src/app/events/[id]/manage/page.tsx` (220-231줄)

**개선 방안**: 컴포넌트 최상단 또는 파일 외부에서 정의

---

#### Issue #12: getInviteLink가 window 객체에 직접 접근

**파일**: `src/app/events/[id]/manage/page.tsx` (234-238줄)

**개선 방안**: `process.env.NEXT_PUBLIC_APP_URL` 환경변수 사용

```typescript
// .env.local
NEXT_PUBLIC_APP_URL=http://localhost:3000

// 코드
const getInviteLink = () => {
  if (!event) return ''
  return `${process.env.NEXT_PUBLIC_APP_URL}/join/${event.invite_code}`
}
```

---

#### Issue #13: CarpoolForm 내부의 eslint-disable 주석

**파일**: `src/components/forms/carpool-form.tsx` (30줄)

**문제**: `any` 타입 사용 (CLAUDE.md 규칙 위배)

```typescript
// ❌ 현재
// eslint-disable-next-line @typescript-eslint/no-explicit-any
resolver: zodResolver(createCarpoolSchema) as any,

// ✅ 수정
resolver: zodResolver<CreateCarpoolFormData>(createCarpoolSchema),
```

---

#### Issue #14: 모달에서 키보드 접근성(ESC 키) 미지원

**파일**: `src/app/events/[id]/manage/page.tsx` (841-938줄)

**개선 방안**: `useEffect`로 키보드 이벤트 등록 또는 shadcn/ui Dialog 사용

```typescript
useEffect(() => {
  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key === 'Escape') {
      setShowShareModal(false)
    }
  }

  document.addEventListener('keydown', handleKeyDown)
  return () => document.removeEventListener('keydown', handleKeyDown)
}, [])
```

---

#### Issue #15: 공지사항 수정 버튼이 alert으로만 처리됨

**파일**: `src/app/events/[id]/manage/page.tsx` (786-793줄)

**개선 방안**: 미완성 기능은 숨기거나 disabled로 처리

```typescript
// ✅ 방법 1: 버튼 숨기기
{/* 수정 기능은 구현 후 추가 */}

// ✅ 방법 2: disabled로 표시
<Button
  size="sm"
  variant="ghost"
  disabled
  title="수정 기능은 준비 중입니다."
>
  <Edit2 size={16} />
</Button>
```

---

## 🏗️ 아키텍처 개선 제안

### Issue #1: 데이터 페칭 아키텍처 개선

**현재 방식 (권장하지 않음)**:

- `'use client'` 컴포넌트에서 `useEffect`로 서버 액션 호출

**권장 방식**:

- Server Component에서 데이터 조회
- Client Component에 데이터 전달
- 상태 변경만 Server Action으로 처리

```typescript
// ✅ 권장 구조
// src/app/events/[id]/manage/page.tsx (Server Component)
export default async function ManagePage({ params }) {
  const eventId = params.id
  const [event, members, carpools, notices] = await Promise.all([
    getEvent(eventId),
    getEventMembers(eventId),
    getCarpools(eventId),
    getNotices(eventId),
  ])

  if (!event) {
    return <ErrorComponent error="이벤트를 찾을 수 없습니다." />
  }

  return <ManagePageClient event={event} members={members} carpools={carpools} notices={notices} />
}

// src/app/events/[id]/manage/manage-client.tsx (Client Component)
'use client'
export function ManagePageClient({ event, members, ... }) {
  // 상태 변경 로직만 처리
}
```

**장점**:

- 초기 로드 시 로딩 스피너 불필요
- SEO 개선
- 네트워크 요청 감소

---

### Issue #2: Toast 알림 도입

**현재**: `alert()` 15곳에서 사용

**권장**: shadcn/ui의 `Sonner` 또는 `useToast` 훅 사용

```bash
npx shadcn@latest add sonner
```

```typescript
import { toast } from 'sonner'

// ❌ 현재
alert('납부 상태가 업데이트되었습니다.')

// ✅ 개선
toast.success('납부 상태가 업데이트되었습니다.')
toast.error(result.error || '업데이트에 실패했습니다.')
toast.loading('처리 중입니다...')
```

---

### Issue #3: 다크모드 미지원

**현재**: 라이트 모드 색상만 하드코딩

**개선**: `dark:` 변형 클래스 또는 shadcn/ui 테마 변수 사용

```tsx
// ❌ 현재
<div className="bg-gray-50 text-gray-900">

// ✅ 개선
<div className="bg-background text-foreground dark:bg-gray-950 dark:text-gray-50">
```

---

## 📊 우선순위 매트릭스

| 이슈            | 심각도  | 복잡도 | 우선순위 | 상태    |
| --------------- | ------- | ------ | -------- | ------- |
| #1 인증 우회    | 🔴 높음 | ⭐⭐⭐ | P0       | ✅ 완료 |
| #3 isSubmitting | 🔴 높음 | ⭐⭐   | P0       | ⏳ 예정 |
| #8 bulkUpdate   | 🔴 높음 | ⭐⭐⭐ | P0       | ⏳ 예정 |
| #5 Progress Bar | 🟠 중간 | ⭐     | P1       | ⏳ 예정 |
| #7 금액 계산    | 🟠 중간 | ⭐     | P1       | ⏳ 예정 |
| #9 카카오 공유  | 🟠 중간 | ⭐⭐   | P1       | ⏳ 예정 |
| #10 헤더 중복   | 🟠 중간 | ⭐     | P1       | ⏳ 예정 |
| #11-15 기타     | 🟡 낮음 | ⭐     | P2       | ⏳ 예정 |
| 아키텍처        | 🟡 낮음 | ⭐⭐⭐ | P2       | ⏳ 예정 |

---

## 📝 다음 단계

### 1단계: 보안 이슈 완료 (P0)

```
[ ] Issue #3: isSubmitting 상태 분리
[ ] Issue #8: bulkUpdatePaymentStatus 트랜잭션 처리
```

### 2단계: 기능 버그 수정 (P1)

```
[ ] Issue #5: Progress Bar 수정
[ ] Issue #7: 금액 계산 로직 통일
[ ] Issue #9: 카카오 공유 API 개선
[ ] Issue #10: 헤더 컴포넌트 분리
```

### 3단계: 선택적 개선 (P2)

```
[ ] Issue #11-15: 소소한 개선사항들
[ ] 아키텍처: 데이터 페칭 패턴 변경
[ ] Toast 알림 도입
[ ] 다크모드 지원
```

---

## 📚 참고 자료

- **Next.js Server Components**: https://nextjs.org/docs/app/building-your-application/rendering/server-components
- **NextAuth.js**: https://next-auth.js.org/
- **Sonner Toast**: https://sonner.emilkowal.ski/
- **Shadcn/ui Dialog**: https://ui.shadcn.com/docs/components/dialog
