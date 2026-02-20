# 🎨 UI/UX 가이드

> Moim 프로젝트의 UI/UX 설계 가이드
> 배달의민족 스타일의 모바일 퍼스트 인터페이스

---

## 1. 설계 철학

### 1.1 핵심 원칙

| 원칙                 | 설명                                   |
| -------------------- | -------------------------------------- |
| **모바일 퍼스트**    | 주최자, 참여자는 모두 모바일에서 접근  |
| **빠른 액션**        | 초대 링크 공유, 참석 확인을 3-4 터치로 |
| **명확한 정보 계층** | 가장 중요한 정보를 먼저 보여줌         |
| **일관된 디자인**    | 배달의민족 스타일의 카드 기반 UI       |

### 1.2 사용자별 인터페이스

| 사용자     | 플랫폼   | 특징                                |
| ---------- | -------- | ----------------------------------- |
| **주최자** | 모바일   | 하단 탭 네비게이션, 빠른 액션 버튼  |
| **참여자** | 모바일   | 초대 링크 접근, 로그인 최소화       |
| **관리자** | 데스크톱 | 왼쪽 사이드바, 테이블 기반 대시보드 |

---

## 2. 색상 팔레트

### 2.1 기본 색상

```css
Primary: #00C884 (Emerald 600)    /* 주최자 액션, 참석 */
Secondary: #0EA5E9 (Sky 500)      /* 정보, 링크 */
Danger: #EF4444 (Red 500)         /* 불참, 삭제 */
Warning: #EAB308 (Yellow 500)     /* 미정, 미납 */
Success: #22C55E (Green 500)      /* 확정, 완료 */

Background: #F5F5F5 (Gray 100)    /* 페이지 배경 */
Border: #E5E7EB (Gray 200)        /* 분할선 */
Text: #111827 (Gray 900)          /* 본문 텍스트 */
Muted: #6B7280 (Gray 500)         /* 보조 텍스트 */
```

### 2.2 Tailwind 클래스 사용

```tsx
// Primary
<Button className="bg-emerald-600 hover:bg-emerald-700 text-white" />

// Danger
<Button className="bg-red-500 hover:bg-red-600 text-white" />

// Warning
<Badge className="bg-yellow-100 text-yellow-700" />

// Text
<p className="text-gray-900">본문</p>
<p className="text-gray-600">보조</p>
```

---

## 3. 레이아웃 시스템

### 3.1 컨테이너

```tsx
// 모바일 (권장 너비)
<Container>
  {/* 전체 화면에서 좌우 16px 패딩 */}
</Container>

// 데스크톱 (max-width)
<Container size="xl">
  {/* 최대 1280px */}
</Container>
```

### 3.2 간격 시스템 (Spacing)

```
xs: 4px   (사소한 간격)
sm: 8px   (작은 간격)
md: 16px  (보통 간격) ← 기본값
lg: 24px  (큰 간격)
xl: 32px  (매우 큰 간격)
```

### 3.3 라운드 (Border Radius)

```
sm: 4px   (버튼, 입력 필드)
md: 8px   (기본 라운드)
lg: 12px  (카드, 이미지)
full: 9999px (아바타, 배지)
```

---

## 4. 컴포넌트 가이드

### 4.1 카드 (EventCard)

**특징:**

- 이미지: 4:3 비율, 상단 배치
- 높이: 200px (이미지) + 140px (정보) = 340px
- 라운드: 12px
- 그림자: light (hover 시 medium)
- 반응형: 모바일에서는 풀너비 - 32px

**마크업 예시:**

```tsx
<div className="overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm hover:shadow-md">
  {/* 이미지 영역 */}
  <div className="relative h-40 w-full bg-gray-200">
    <Image src={image} alt={title} fill className="object-cover" />
    {/* 배지, 참석자 수 표시 */}
  </div>

  {/* 정보 영역 */}
  <div className="space-y-3 p-4">
    <h3 className="line-clamp-2 text-base font-bold text-gray-900">{title}</h3>
    {/* 메타 정보 (날짜, 위치) */}
    {/* 하단 정보 (가격, 상태) */}
  </div>
</div>
```

### 4.2 버튼

**크기 규칙:**

```
sm: h-8, text-xs      (보조 버튼)
md: h-10, text-sm     (일반 버튼)
lg: h-12, text-base   (주요 버튼) ← 터치 최적화 기본값
```

**변형:**

```tsx
// Primary (주요 액션)
<Button className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold">

// Secondary (보조 액션)
<Button variant="outline">

// Danger (삭제, 불참)
<Button className="bg-red-600 hover:bg-red-700 text-white">

// Warning (미정)
<Button className="bg-yellow-600 hover:bg-yellow-700 text-white">
```

### 4.3 배지

**변형:**

```tsx
// Primary
<Badge className="bg-emerald-100 text-emerald-700">모집 중</Badge>

// Secondary
<Badge variant="secondary">상태</Badge>

// Danger
<Badge className="bg-red-100 text-red-700">불참</Badge>

// Warning
<Badge className="bg-yellow-100 text-yellow-700">미정</Badge>
```

### 4.4 하단 탭 네비게이션 (모바일)

**특징:**

- 높이: 64px (h-16)
- 위치: 모든 모바일 페이지 하단 고정
- 데스크톱: 숨김 (md:hidden)
- 아이콘: 24px
- 텍스트: 12px, font-medium

**구현:**

```tsx
import { BottomTab } from '@/components/navigation/bottom-tab'

export default function Page() {
  return (
    <div className="pb-20">
      {' '}
      {/* pb-20 = 하단 탭 높이 */}
      {/* 페이지 콘텐츠 */}
      <BottomTab />
    </div>
  )
}
```

---

## 5. 페이지 구조

### 5.1 모바일 페이지 기본 템플릿

```tsx
'use client'

import { Container } from '@/components/layout/container'
import { BottomTab } from '@/components/navigation/bottom-tab'

export default function Page() {
  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* 헤더 (선택사항) */}
      <div className="sticky top-0 z-10 border-b bg-white">
        <Container className="py-3">{/* 헤더 콘텐츠 */}</Container>
      </div>

      {/* 메인 콘텐츠 */}
      <Container className="space-y-6 py-6">{/* 콘텐츠 */}</Container>

      {/* 하단 탭 */}
      <BottomTab />
    </div>
  )
}
```

### 5.2 데스크톱 페이지 기본 템플릿

```tsx
'use client'

export default function AdminPage() {
  return (
    <div className="hidden min-h-screen md:flex">
      {/* 왼쪽 사이드바 (고정) */}
      <div className="w-64 bg-gray-900 text-white">{/* 네비게이션 */}</div>

      {/* 메인 콘텐츠 */}
      <div className="flex-1 overflow-auto">
        {/* 헤더 */}
        <div className="sticky top-0 z-10 border-b bg-white">
          {/* 헤더 콘텐츠 */}
        </div>

        {/* 콘텐츠 */}
        <div className="p-8">{/* 메인 콘텐츠 */}</div>
      </div>
    </div>
  )
}
```

---

## 6. 반응형 설계

### 6.1 Tailwind 브레이크포인트

```
sm: 640px   (스마트폰 가로)
md: 768px   (태블릿 이상)
lg: 1024px  (데스크톱)
xl: 1280px  (큰 데스크톱)
```

### 6.2 모바일 vs 데스크톱

```tsx
// 모바일에서만 표시
<div className="md:hidden">모바일</div>

// 데스크톱에서만 표시
<div className="hidden md:block">데스크톱</div>

// 반응형 간격
<div className="px-4 md:px-8">콘텐츠</div>

// 반응형 그리드
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4">
  <div>항목</div>
</div>
```

---

## 7. 접근성 (Accessibility)

### 7.1 ARIA 속성

```tsx
// 버튼 설명
<Button aria-label="새 모임 만들기">
  <Plus size={20} />
</Button>

// 네비게이션
<nav aria-label="메인 네비게이션">
  {/* 네비게이션 항목 */}
</nav>

// 현재 활성 탭
<a href="#" aria-current="page">
  현재 페이지
</a>
```

### 7.2 색상 대비

- 텍스트: 최소 4.5:1 대비도
- 버튼: 최소 3:1 대비도
- 아이콘: 최소 3:1 대비도

### 7.3 터치 최적화

- 버튼/링크: 최소 44x44px
- 간격: 충분한 터치 간격 (최소 8px)
- 텍스트: 최소 14px

---

## 8. 상태별 UI

### 8.1 로딩 상태

```tsx
// Skeleton 로딩
import { Skeleton } from '@/components/ui/skeleton'
;<div className="space-y-4">
  <Skeleton className="h-40 w-full rounded-lg" />
  <Skeleton className="h-4 w-3/4" />
  <Skeleton className="h-4 w-1/2" />
</div>
```

### 8.2 빈 상태

```tsx
<div className="py-12 text-center">
  <Users size={48} className="mx-auto mb-4 text-gray-300" />
  <p className="text-gray-600">아직 모임이 없습니다.</p>
  <Button className="mt-4">새 모임 만들기</Button>
</div>
```

### 8.3 에러 상태

```tsx
<div className="rounded-lg border border-red-200 bg-red-50 p-4">
  <p className="font-semibold text-red-800">오류가 발생했습니다</p>
  <p className="mt-1 text-sm text-red-700">다시 시도해주세요</p>
</div>
```

---

## 9. 아이콘 가이드

Lucide React 사용:

```tsx
import {
  Home,
  ListTodo,
  Users,
  MapPin,
  Clock,
  Plus,
  Edit,
  Trash2,
  Share2,
  // ... 기타
} from 'lucide-react'

// 크기 규칙
<Icon size={16} />  // xs: 라벨, 헬퍼 텍스트
<Icon size={20} />  // sm: 메타 정보, 폼 필드
<Icon size={24} />  // md: 버튼, 네비게이션
<Icon size={32} />  // lg: 히어로, 빈 상태
```

---

## 10. 개발 체크리스트

### 10.1 새 페이지 생성 시

- [ ] 모바일 우선으로 설계
- [ ] 데스크톱에서 `md:hidden` / `hidden md:block` 사용
- [ ] 반응형 간격 설정 (px-4 md:px-8)
- [ ] 하단 탭 포함 (모바일)
- [ ] 접근성 속성 확인 (aria-label, aria-current)
- [ ] 색상 대비 확인
- [ ] 터치 타겟 크기 확인 (최소 44px)

### 10.2 컴포넌트 생성 시

- [ ] TypeScript props 인터페이스 정의
- [ ] Tailwind 클래스만 사용 (인라인 CSS 금지)
- [ ] 반응형 클래스 포함
- [ ] 다크모드 고려 (dark: 클래스)
- [ ] ARIA 속성 포함
- [ ] 한국어 주석 작성

### 10.3 배포 전 체크

- [ ] 모든 페이지 모바일에서 테스트
- [ ] 모든 페이지 데스크톱에서 테스트
- [ ] 이미지 최적화 (next/image 사용)
- [ ] 성능 체크 (Lighthouse)
- [ ] 접근성 체크 (WCAG)

---

_이 가이드는 `docs/PRD.md`의 UI/UX 섹션과 함께 관리됩니다._
