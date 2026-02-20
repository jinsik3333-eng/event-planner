import { Event, EventMember, Notice, Carpool, User } from './index'
import { EventStatus, AttendanceStatus } from './enums'

/**
 * 이벤트 생성 요청 DTO
 * 클라이언트에서 새 이벤트를 생성할 때 필요한 필드
 */
export interface CreateEventRequest {
  /** 이벤트 제목 */
  title: string
  /** 이벤트 설명 (선택사항) */
  description?: string
  /** 이벤트 날짜 및 시간 (ISO 8601 형식) */
  date: string
  /** 이벤트 장소 */
  location: string
  /** 참가비 (0원 = 무료) */
  fee: number
  /** 최대 참석 인원 (선택사항) */
  maxAttendees?: number
  /** 이벤트 이미지 URL (선택사항) */
  image?: string
}

/**
 * 이벤트 수정 요청 DTO
 * 이벤트 정보를 수정할 때 필요한 필드
 */
export interface UpdateEventRequest {
  /** 이벤트 ID */
  id: string
  /** 이벤트 제목 (선택사항) */
  title?: string
  /** 이벤트 설명 (선택사항) */
  description?: string
  /** 이벤트 날짜 (선택사항) */
  date?: string
  /** 이벤트 장소 (선택사항) */
  location?: string
  /** 참가비 (선택사항) */
  fee?: number
  /** 최대 인원 (선택사항) */
  maxAttendees?: number
  /** 이벤트 상태 (선택사항) */
  status?: EventStatus
  /** 이벤트 이미지 (선택사항) */
  image?: string
}

/**
 * 이벤트 조회 응답 DTO
 * 이벤트 상세 정보 + 통계 데이터
 */
export interface GetEventResponse extends Event {
  /** 참석 인원 수 */
  attendingCount: number
  /** 불참 인원 수 */
  notAttendingCount: number
  /** 미정 인원 수 */
  undecidedCount: number
  /** 참가비 납부 완료 인원 */
  paidCount: number
  /** 참가비 미납 인원 */
  unpaidCount: number
  /** 참여자 목록 (선택사항, 상세 조회 시) */
  members?: EventMember[]
  /** 공지사항 목록 (선택사항) */
  notices?: Notice[]
  /** 카풀 목록 (선택사항) */
  carpools?: Carpool[]
}

/**
 * 이벤트 참여자 추가 요청 DTO
 * 새 참여자를 이벤트에 추가할 때 필요한 필드
 */
export interface CreateEventMemberRequest {
  /** 이벤트 ID */
  eventId: string
  /** 사용자 ID (로그인한 사용자) */
  userId?: string
  /** 게스트 이름 (로그인하지 않은 참여자) */
  guestName?: string
  /** 참석 상태 */
  status: AttendanceStatus
}

/**
 * 참석 상태 업데이트 요청 DTO
 * 기존 참여자의 참석 여부를 변경할 때 필요한 필드
 */
export interface UpdateAttendanceRequest {
  /** 이벤트 ID */
  eventId: string
  /** 참여자 ID */
  memberId: string
  /** 새로운 참석 상태 */
  status: AttendanceStatus
}

/**
 * 참가비 납부 상태 업데이트 요청 DTO
 */
export interface UpdatePaymentStatusRequest {
  /** 이벤트 ID */
  eventId: string
  /** 참여자 ID */
  memberId: string
  /** 납부 여부 */
  hasPaid: boolean
}

/**
 * 공지사항 생성 요청 DTO
 */
export interface CreateNoticeRequest {
  /** 이벤트 ID */
  eventId: string
  /** 공지 내용 */
  content: string
}

/**
 * 공지사항 수정 요청 DTO
 */
export interface UpdateNoticeRequest {
  /** 공지사항 ID */
  id: string
  /** 공지 내용 */
  content: string
}

/**
 * 카풀 등록 요청 DTO
 */
export interface CreateCarpoolRequest {
  /** 이벤트 ID */
  eventId: string
  /** 탑승 가능 인원 수 (1~7) */
  seats: number
  /** 출발 장소 */
  departure: string
}

/**
 * 카풀 탑승자 신청 요청 DTO
 */
export interface JoinCarpoolRequest {
  /** 카풀 ID */
  carpoolId: string
  /** 사용자 ID */
  userId: string
}

/**
 * API 응답 래퍼 타입
 * 모든 API 응답은 이 형식을 따름
 */
export interface ApiResponse<T> {
  /** 요청 성공 여부 */
  success: boolean
  /** 응답 데이터 (성공 시) */
  data?: T
  /** 오류 메시지 (실패 시) */
  error?: string
  /** HTTP 상태 코드 (선택사항) */
  code?: number
}

/**
 * 페이징 요청 매개변수 DTO
 * 목록 조회 시 사용
 */
export interface PaginationParams {
  /** 페이지 번호 (1부터 시작) */
  page: number
  /** 한 페이지의 항목 수 */
  limit: number
  /** 정렬 필드 (선택사항) */
  sortBy?: string
  /** 정렬 순서 (선택사항) */
  sortOrder?: 'asc' | 'desc'
}

/**
 * 페이징된 응답 DTO
 * 목록 조회 응답에 사용
 */
export interface PaginatedResponse<T> {
  /** 조회된 항목 배열 */
  items: T[]
  /** 전체 항목 수 */
  total: number
  /** 현재 페이지 번호 */
  page: number
  /** 한 페이지의 항목 수 */
  limit: number
  /** 전체 페이지 수 */
  totalPages: number
}

/**
 * 이벤트 목록 조회 응답 DTO
 */
export type GetEventsResponse = PaginatedResponse<GetEventResponse>

/**
 * 참여자 목록 조회 응답 DTO
 */
export type GetEventMembersResponse = PaginatedResponse<EventMember>

/**
 * 공지사항 목록 조회 응답 DTO
 */
export type GetNoticesResponse = PaginatedResponse<Notice>

/**
 * 초대 코드 검증 요청 DTO
 */
export interface ValidateInviteCodeRequest {
  /** 초대 코드 */
  inviteCode: string
}

/**
 * 초대 코드 검증 응답 DTO
 */
export interface ValidateInviteCodeResponse {
  /** 검증 성공 여부 */
  valid: boolean
  /** 이벤트 정보 (검증 성공 시) */
  event?: Omit<Event, 'inviteCode'> & { attendingCount: number }
  /** 오류 메시지 (검증 실패 시) */
  error?: string
}
