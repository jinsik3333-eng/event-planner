import { EventStatus, AttendanceStatus, PaymentStatus } from './enums'

/**
 * 사용자 타입
 * 카카오 OAuth를 통해 생성된 사용자 정보
 */
export interface User {
  /** 사용자 고유 식별자 (UUID) */
  id: string
  /** 카카오 OAuth ID */
  kakaoId: string
  /** 사용자 이름 */
  name: string
  /** 프로필 이미지 URL (선택사항) */
  profileImage?: string
  /** 가입 일시 */
  createdAt: Date
}

/**
 * 이벤트(모임) 타입
 * 사용자가 생성하고 관리하는 모임 정보
 */
export interface Event {
  /** 이벤트 고유 식별자 (UUID) */
  id: string
  /** 이벤트 제목 */
  title: string
  /** 이벤트 설명 (선택사항) */
  description?: string
  /** 주최자 ID (User.id) */
  hostId: string
  /** 이벤트 날짜 및 시간 */
  date: Date
  /** 이벤트 장소 */
  location: string
  /** 참가비 (0원 = 무료) */
  fee: number
  /** 최대 참석 인원 (선택사항) */
  maxAttendees?: number
  /** 이벤트 상태 */
  status: EventStatus
  /** 초대 코드 (공유용 고유 코드) */
  inviteCode: string
  /** 이벤트 이미지 URL (선택사항) */
  image?: string
  /** 생성 일시 */
  createdAt: Date
  /** 수정 일시 */
  updatedAt: Date
}

/**
 * 이벤트 참여자 타입
 * 이벤트에 참여하는 사용자 또는 게스트 정보
 */
export interface EventMember {
  /** 참여자 고유 식별자 (UUID) */
  id: string
  /** 이벤트 ID (Event.id) */
  eventId: string
  /** 사용자 ID (User.id, 게스트는 null) */
  userId?: string
  /** 게스트 이름 (userId가 없을 경우) */
  guestName?: string
  /** 참석 상태 */
  status: AttendanceStatus
  /** 참가비 납부 여부 */
  hasPaid: boolean
  /** 생성 일시 */
  createdAt: Date
  /** 수정 일시 */
  updatedAt: Date
}

/**
 * 공지사항 타입
 * 이벤트 주최자가 참여자들에게 전달하는 공지사항
 */
export interface Notice {
  /** 공지사항 고유 식별자 (UUID) */
  id: string
  /** 이벤트 ID (Event.id) */
  eventId: string
  /** 공지 내용 */
  content: string
  /** 작성자 ID (User.id, 주최자만) */
  authorId: string
  /** 생성 일시 */
  createdAt: Date
  /** 수정 일시 (선택사항) */
  updatedAt?: Date
}

/**
 * 카풀 타입
 * 이벤트 참석자들을 위한 카풀 정보
 */
export interface Carpool {
  /** 카풀 고유 식별자 (UUID) */
  id: string
  /** 이벤트 ID (Event.id) */
  eventId: string
  /** 운전자 ID (User.id) */
  driverId: string
  /** 탑승 가능한 인원 수 */
  seats: number
  /** 출발 장소 */
  departure: string
  /** 생성 일시 */
  createdAt: Date
}

// 열거형 재 export
export { EventStatus, AttendanceStatus, PaymentStatus } from './enums'
