# 📋 프로젝트 규칙 (Project Rules)

이 문서는 **Event Planner App** 프로젝트의 개발 규칙과 표준을 정의합니다. 모든 팀 멤버와 AI 에이전트는 이 규칙을 준수해야 합니다.

---

## 1️⃣ 코딩 표준 (Code Standards)

### TypeScript 사용
- **모든 파일**: `.ts`, `.tsx` 확장자 사용
- **타입 정의**: 항상 명시적 타입 정의 필수
- **any 타입**: 금지 ❌
- **인터페이스**: 비즈니스 로직의 주요 타입은 반드시 인터페이스로 정의

### 들여쓰기
- **스페이스**: 2칸 (탭 금지)
- **Prettier**: 자동 포맷팅 필수

### 코드 품질
- **ESLint**: 모든 파일이 ESLint 통과 필수
- **Prettier**: 포맷팅 검사 필수
- **TypeScript**: 타입 체크 필수 (`npm run typecheck`)

---

## 2️⃣ 파일/폴더 구조 (File Structure)

```
src/
├── app/                      # Next.js App Router
│   ├── layout.tsx           # 루트 레이아웃
│   ├── page.tsx             # 홈페이지
│   ├── admin/               # 관리자 페이지
│   ├── dashboard/           # 대시보드
│   ├── events/              # 이벤트 관련
│   └── join/                # 참여 페이지
├── components/              # 재사용 컴포넌트
│   ├── ui/                  # shadcn/ui 컴포넌트
│   ├── event/               # 이벤트 관련 컴포넌트
│   └── navigation/          # 네비게이션 컴포넌트
├── hooks/                   # 커스텀 React 훅
├── lib/                     # 유틸리티 함수
├── store/                   # Zustand 스토어
├── types/                   # TypeScript 타입 정의
└── styles/                  # 글로벌 스타일

docs/
├── guides/                  # 개발 가이드
└── reference/               # 참고 자료
```

---

## 3️⃣ 네이밍 규칙 (Naming Conventions)

### 파일/폴더
- **폴더**: `kebab-case` (예: `event-planner`, `bottom-tab`)
- **컴포넌트**: `PascalCase` (예: `EventCard.tsx`)
- **유틸리티**: `camelCase` (예: `formatDate.ts`)
- **타입/인터페이스**: `PascalCase` (예: `Event.ts`, `IEventDTO.ts`)

### 변수/함수
- **변수**: `camelCase` (예: `eventName`, `isLoading`)
- **상수**: `UPPER_SNAKE_CASE` (예: `MAX_EVENT_NAME_LENGTH`)
- **함수**: `camelCase` (예: `handleSubmit`, `calculateTotal`)
- **boolean 변수**: `is/has` 접두사 (예: `isOpen`, `hasError`)

### CSS 클래스
- **Tailwind**: `kebab-case` (Tailwind에서 자동 처리)
- **사용자정의**: `kebab-case` (예: `event-card-header`)

---

## 4️⃣ 컴포넌트 작성 규칙 (Component Rules)

### 구조
```typescript
// 1. Imports
import { ReactNode } from 'react';
import { Button } from '@/components/ui/button';

// 2. Type Definitions
interface ComponentProps {
  title: string;
  onClick: () => void;
}

// 3. Component
export function MyComponent({ title, onClick }: ComponentProps) {
  return (
    <div>
      <h1>{title}</h1>
      <Button onClick={onClick}>Click me</Button>
    </div>
  );
}
```

### 규칙
- **함수형 컴포넌트**: 항상 `export function` 사용
- **Props 인터페이스**: 각 컴포넌트마다 정의
- **분해 할당**: Props는 함수 인자에서 분해 할당
- **키**: 배열 렌더링 시 안정적인 ID 사용 (index 금지)
- **주석**: 복잡한 로직에만 한국어로 작성

### 이벤트 핸들러
- `handle` 접두사: `handleClick`, `handleSubmit`
- 화살표 함수 사용: `const handleClick = () => {}`
- Props에서 분해 할당

---

## 5️⃣ 폼 처리 규칙 (Form Rules)

### 기술 스택
- **라이브러리**: React Hook Form
- **유효성 검사**: Zod
- **서버 액션**: Next.js Server Actions

### 패턴
```typescript
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

// 1. Zod 스키마
const eventSchema = z.object({
  name: z.string().min(1, '이벤트명 필수'),
  date: z.date(),
});

type EventFormData = z.infer<typeof eventSchema>;

// 2. 폼 컴포넌트
export function EventForm() {
  const { register, handleSubmit, formState: { errors } } = useForm<EventFormData>({
    resolver: zodResolver(eventSchema),
  });

  const onSubmit = async (data: EventFormData) => {
    // 처리
  };

  return <form onSubmit={handleSubmit(onSubmit)}>{/* ... */}</form>;
}
```

---

## 6️⃣ 상태 관리 규칙 (State Management)

### 라이브러리
- **전역 상태**: Zustand
- **로컬 상태**: React `useState`

### Zustand 스토어 구조
```typescript
// store/eventStore.ts
import { create } from 'zustand';

interface EventStore {
  // State
  events: Event[];
  selectedEvent: Event | null;
  // Actions
  setEvents: (events: Event[]) => void;
  selectEvent: (event: Event) => void;
}

export const useEventStore = create<EventStore>((set) => ({
  events: [],
  selectedEvent: null,
  setEvents: (events) => set({ events }),
  selectEvent: (event) => set({ selectedEvent: event }),
}));
```

### 규칙
- 스토어는 `store/` 디렉토리에 위치
- 파일명: `[entity]Store.ts`
- 훅명: `use[Entity]Store`
- 선택적 상태만 포함 (UI 상태가 아닌 비즈니스 로직 상태)

---

## 7️⃣ 스타일링 규칙 (Styling Rules)

### Tailwind CSS
- **기본 선택**: Tailwind CSS 클래스 사용
- **반응형**: `sm:`, `md:`, `lg:` 브레이크포인트 활용
- **어두운 모드**: `dark:` 접두사로 다크 모드 지원

### shadcn/ui
- **UI 컴포넌트**: shadcn/ui 사용
- **커스터마이징**: `cn()` 함수로 클래스 병합
- **구조**: `@/components/ui/` 디렉토리

### 사용자 정의 스타일
- **글로벌**: `app/globals.css`
- **모듈**: CSS Modules (필요시)
- **라이브러리**: `prettier-plugin-tailwindcss`로 자동 정렬

---

## 8️⃣ 커밋 규칙 (Commit Rules)

### 커밋 메시지 형식
```
<type>: <제목>

<본문>

<푸터>
```

### 타입 (이모지 포함)
- `✨ feat`: 새로운 기능
- `🐛 fix`: 버그 수정
- `♻️ refactor`: 코드 구조 개선
- `📝 docs`: 문서 작성/수정
- `🎨 style`: 코드 스타일 변경 (기능 변화 없음)
- `✅ test`: 테스트 추가/수정
- `🔧 chore`: 빌드, 의존성 등 설정 변경

### 제목
- 한국어로 작성
- 첫 글자 대문자
- 명령조 사용 (예: "추가", "수정", "제거")
- 마침표 금지

### 본문 (선택사항)
- 변경 이유와 상세 설명
- 한국어로 작성
- 70자 이내로 줄바꿈

### 푸터 (선택사항)
- `Closes #123` (이슈 연결)
- `Breaking change: ...`

---

## 9️⃣ 개발 워크플로우 (Development Workflow)

### 개발 시작
```bash
# 1. 저장소 클론
git clone <repository>
cd event-planner-app

# 2. 의존성 설치
npm install

# 3. 개발 서버 실행
npm run dev

# 4. http://localhost:3000 접속
```

### 기능 개발
```bash
# 1. 브랜치 생성
git checkout -b feature/event-creation

# 2. 기능 개발
# ... 코드 작성

# 3. 모든 검사 실행
npm run check-all

# 4. 커밋
git commit -m "✨ feat: 이벤트 생성 기능 추가"

# 5. 푸시 및 PR 생성
git push origin feature/event-creation
```

### PR (Pull Request) 규칙
- **제목**: 커밋과 동일한 규칙
- **설명**: 변경사항, 테스트 방법 포함
- **리뷰**: 최소 1명의 리뷰 필수
- **체크리스트**:
  - [ ] `npm run check-all` 통과
  - [ ] 새 기능에 대한 문서 작성
  - [ ] 관련 이슈 연결

---

## 🔟 배포 규칙 (Deployment Rules)

### 환경
- **개발**: `npm run dev`
- **스테이징**: `npm run build` (로컬 테스트)
- **프로덕션**: 자동 배포 (GitHub Actions)

### 배포 전 체크리스트
```bash
# 1. 모든 검사 통과
npm run check-all

# 2. 프로덕션 빌드
npm run build

# 3. 빌드 결과 확인
npm run start

# 4. 수동 테스트
# ... 주요 기능 테스트

# 5. PR 리뷰 완료
# ... 리뷰 승인 대기
```

### 환경 변수
- `.env.local`: 로컬 개발 (Git 무시)
- `.env.example`: 예시 파일 (Git 포함)
- 민감한 정보는 절대 커밋하지 말 것

---

## 📚 추가 리소스

- 🗺️ [개발 로드맵](../ROADMAP.md)
- 📋 [프로젝트 요구사항](../PRD.md)
- 📁 [프로젝트 구조](./project-structure.md)
- 🎨 [스타일링 가이드](./styling-guide.md)
- 🧩 [컴포넌트 패턴](./component-patterns.md)
- ⚡ [Next.js 15.5.3 가이드](./nextjs-15.md)
- 📝 [폼 처리 가이드](./forms-react-hook-form.md)

---

**마지막 업데이트**: 2026-02-21
**유지보수**: Claude Code + Shrimp Task Manager
