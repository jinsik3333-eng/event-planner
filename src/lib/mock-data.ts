import type { User, Event, EventMember, Notice, Carpool } from '../types'
import { EventStatus, AttendanceStatus } from '../types/enums'

/**
 * 시드 기반 난수 생성기 (같은 시드면 같은 값 생성)
 */
function seededRandom(seed: number): number {
  const x = Math.sin(seed) * 10000
  return x - Math.floor(x)
}

/**
 * 간단한 UUID v4 생성 함수 (시드 기반 - 고정된 값 생성)
 */
function generateId(seed?: number): string {
  if (seed === undefined) {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(
      /[xy]/g,
      function (c) {
        const r = (Math.random() * 16) | 0
        const v = c === 'x' ? r : (r & 0x3) | 0x8
        return v.toString(16)
      }
    )
  }

  // 시드 기반 생성
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
    seed = (seed * 9301 + 49297) % 233280
    const r = ((seed / 233280) * 16) | 0
    const v = c === 'x' ? r : (r & 0x3) | 0x8
    return v.toString(16)
  })
}

/**
 * 미래 날짜 생성 헬퍼
 * @param daysFromNow - 현재로부터 며칠 뒤인지 (1 ~ 90)
 * @param hour - 시간 (0 ~ 23, 기본값: 18)
 */
function generateFutureDate(daysFromNow: number = 7, hour: number = 18): Date {
  const now = new Date()
  const future = new Date(now)
  future.setDate(future.getDate() + Math.max(1, Math.min(daysFromNow, 90)))
  future.setHours(hour, 0, 0, 0)
  return future
}

/**
 * 더미 사용자 생성 팩토리
 * @param overrides - 기본값을 재정의할 필드
 */
export function mockUser(overrides?: Partial<User>): User {
  const id = generateId()
  const timestamp = Date.now()

  return {
    id,
    kakaoId: `mock_kakao_${timestamp}`,
    name: `사용자_${timestamp % 10000}`,
    profileImage: `https://via.placeholder.com/150?text=${timestamp % 10000}`,
    createdAt: new Date(),
    ...overrides,
  }
}

/**
 * 더미 이벤트 생성 팩토리
 * @param overrides - 기본값을 재정의할 필드
 * @param seed - 시드값 (같은 시드면 같은 데이터 생성)
 */
export function mockEvent(overrides?: Partial<Event>, seed?: number): Event {
  // 시드가 있으면 시드 기반, 없으면 시간 기반
  let baseSeed = seed
  if (!seed) {
    baseSeed = Date.now()
  }

  const daysFromNow = Math.floor(seededRandom(baseSeed) * 60) + 7

  return {
    id: generateId(seed),
    title: `모임_${baseSeed % 10000}`,
    description: '즐거운 모임입니다.',
    hostId: generateId(seed ? seed + 1 : undefined),
    date: generateFutureDate(daysFromNow),
    location: '서울시 강남구',
    fee: Math.floor(seededRandom(baseSeed + 1) * 5) * 10000,
    maxAttendees: Math.floor(seededRandom(baseSeed + 2) * 20) + 5,
    status: EventStatus.RECRUITING,
    inviteCode: generateId(seed ? seed + 3 : undefined)
      .substring(0, 8)
      .toUpperCase(),
    image: 'https://via.placeholder.com/400x200?text=Event',
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  }
}

/**
 * 더미 참여자 생성 팩토리
 * @param overrides - 기본값을 재정의할 필드
 * @param seed - 시드값 (같은 시드면 같은 데이터 생성)
 * @param index - 참여자 인덱스 (같은 seed 내에서 고유한 데이터 생성)
 */
export function mockEventMember(
  overrides?: Partial<EventMember>,
  seed?: number,
  index: number = 0
): EventMember {
  const statusOptions = [
    AttendanceStatus.ATTENDING,
    AttendanceStatus.NOT_ATTENDING,
    AttendanceStatus.UNDECIDED,
  ]

  const baseSeed = seed || Date.now()
  const indexedSeed = baseSeed + index

  const randomStatus =
    statusOptions[Math.floor(seededRandom(indexedSeed) * statusOptions.length)]
  const hasUserRandom = seededRandom(indexedSeed + 1000)

  return {
    id: generateId(indexedSeed),
    eventId: generateId(seed),
    userId: hasUserRandom > 0.3 ? generateId(indexedSeed + 1) : undefined,
    guestName: `게스트_${baseSeed % 10000}`,
    status: randomStatus,
    hasPaid: seededRandom(indexedSeed + 2000) > 0.5,
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  }
}

/**
 * 더미 공지사항 생성 팩토리
 * @param overrides - 기본값을 재정의할 필드
 */
export function mockNotice(overrides?: Partial<Notice>): Notice {
  const timestamp = Date.now()

  return {
    id: generateId(),
    eventId: generateId(),
    content: `중요한 공지사항입니다. 모임 시간: 오후 6시 (${timestamp})`,
    authorId: generateId(),
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  }
}

/**
 * 더미 카풀 생성 팩토리
 * @param overrides - 기본값을 재정의할 필드
 */
export function mockCarpool(overrides?: Partial<Carpool>): Carpool {
  return {
    id: generateId(),
    eventId: generateId(),
    driverId: generateId(),
    seats: Math.floor(Math.random() * 6) + 1,
    departure: '서울시 강남역',
    createdAt: new Date(),
    ...overrides,
  }
}

/**
 * 여러 더미 사용자 생성 헬퍼
 * @param count - 생성할 사용자 수
 * @param overrides - 기본값을 재정의할 필드
 */
export function createMockUsers(
  count: number,
  overrides?: Partial<User>
): User[] {
  return Array.from({ length: count }, () => mockUser(overrides))
}

/**
 * 여러 더미 이벤트 생성 헬퍼
 * @param count - 생성할 이벤트 수
 * @param hostId - 주최자 ID (선택사항)
 * @param overrides - 기본값을 재정의할 필드
 */
export function createMockEvents(
  count: number,
  hostId?: string,
  overrides?: Partial<Event>
): Event[] {
  return Array.from({ length: count }, () =>
    mockEvent({
      hostId: hostId || generateId(),
      ...overrides,
    })
  )
}

/**
 * 여러 더미 참여자 생성 헬퍼
 * @param eventId - 이벤트 ID
 * @param count - 생성할 참여자 수
 * @param overrides - 기본값을 재정의할 필드
 */
export function createMockEventMembers(
  eventId: string,
  count: number,
  overrides?: Partial<EventMember>
): EventMember[] {
  return Array.from({ length: count }, () =>
    mockEventMember({
      eventId,
      ...overrides,
    })
  )
}

/**
 * 여러 더미 공지사항 생성 헬퍼
 * @param eventId - 이벤트 ID
 * @param count - 생성할 공지사항 수
 * @param overrides - 기본값을 재정의할 필드
 */
export function createMockNotices(
  eventId: string,
  count: number,
  overrides?: Partial<Notice>
): Notice[] {
  return Array.from({ length: count }, () =>
    mockNotice({
      eventId,
      ...overrides,
    })
  )
}

/**
 * 여러 더미 카풀 생성 헬퍼
 * @param eventId - 이벤트 ID
 * @param count - 생성할 카풀 수
 * @param overrides - 기본값을 재정의할 필드
 */
export function createMockCarpools(
  eventId: string,
  count: number,
  overrides?: Partial<Carpool>
): Carpool[] {
  return Array.from({ length: count }, () =>
    mockCarpool({
      eventId,
      ...overrides,
    })
  )
}

/**
 * 다양한 상태를 포함한 더미 참여자들 생성
 * @param eventId - 이벤트 ID
 * @param attendingCount - 참석 인원
 * @param undecidedCount - 미정 인원
 * @param notAttendingCount - 불참 인원
 * @param seed - 시드값 (같은 시드면 같은 데이터 생성)
 */
export function createMembersWithStatuses(
  eventId: string,
  attendingCount: number = 5,
  undecidedCount: number = 2,
  notAttendingCount: number = 1,
  seed?: number
): EventMember[] {
  const members: EventMember[] = []
  let memberIndex = 0

  // 참석
  for (let i = 0; i < attendingCount; i++) {
    members.push(
      mockEventMember(
        {
          eventId,
          status: AttendanceStatus.ATTENDING,
          hasPaid: seed
            ? seededRandom(seed + memberIndex + 3000) > 0.3
            : Math.random() > 0.3,
        },
        seed,
        memberIndex++
      )
    )
  }

  // 미정
  for (let i = 0; i < undecidedCount; i++) {
    members.push(
      mockEventMember(
        {
          eventId,
          status: AttendanceStatus.UNDECIDED,
        },
        seed,
        memberIndex++
      )
    )
  }

  // 불참
  for (let i = 0; i < notAttendingCount; i++) {
    members.push(
      mockEventMember(
        {
          eventId,
          status: AttendanceStatus.NOT_ATTENDING,
        },
        seed,
        memberIndex++
      )
    )
  }

  return members
}

/**
 * 완전한 더미 이벤트 데이터셋 생성
 * (이벤트 + 참여자 + 공지사항 + 카풀)
 * @param hostId - 주최자 ID (선택사항)
 * @param seed - 시드값 (같은 시드면 같은 데이터 생성)
 */
export function createCompleteMockEvent(
  hostId?: string,
  seed?: number
): {
  event: Event
  members: EventMember[]
  notices: Notice[]
  carpools: Carpool[]
} {
  const event = mockEvent({ hostId }, seed)
  const members = createMembersWithStatuses(event.id, 5, 2, 1, seed)
  const notices = createMockNotices(event.id, 2)
  const carpools = createMockCarpools(event.id, 2)

  return {
    event,
    members,
    notices,
    carpools,
  }
}
