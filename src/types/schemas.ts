import { z } from 'zod'
import { EventStatus, AttendanceStatus } from './enums'

/**
 * 이벤트 생성 폼 검증 스키마
 * React Hook Form + Zod 통합 사용
 */
export const createEventSchema = z.object({
  title: z
    .string()
    .min(1, '모임 제목을 입력해 주세요.')
    .max(50, '모임 제목은 50자 이내여야 합니다.'),
  description: z
    .string()
    .max(500, '설명은 500자 이내여야 합니다.')
    .optional()
    .default(''),
  date: z
    .string()
    .datetime({ message: '올바른 날짜/시간 형식이 아닙니다.' })
    .refine(date => new Date(date) > new Date(), {
      message: '모임 날짜는 미래여야 합니다.',
    }),
  location: z
    .string()
    .min(1, '모임 장소를 입력해 주세요.')
    .max(100, '장소는 100자 이내여야 합니다.'),
  fee: z
    .number()
    .int('참가비는 정수여야 합니다.')
    .min(0, '참가비는 0 이상이어야 합니다.')
    .max(1000000, '참가비는 1,000,000 이하여야 합니다.'),
  maxAttendees: z
    .number()
    .int('최대 인원은 정수여야 합니다.')
    .min(1, '최대 인원은 1명 이상이어야 합니다.')
    .max(100, '최대 인원은 100명 이하여야 합니다.')
    .optional(),
  image: z.string().url('올바른 이미지 URL이 아닙니다.').optional(),
})

/**
 * 이벤트 생성 폼 데이터 타입 (React Hook Form과 통합)
 */
export type CreateEventFormData = z.infer<typeof createEventSchema>

/**
 * 참석 상태 업데이트 폼 검증 스키마
 */
export const updateAttendanceSchema = z.object({
  status: z.nativeEnum(AttendanceStatus).refine(val => val !== undefined, {
    message: '올바른 참석 상태를 선택해 주세요.',
  }),
  guestName: z
    .string()
    .min(1, '이름을 입력해 주세요.')
    .max(50, '이름은 50자 이내여야 합니다.')
    .optional(),
})

/**
 * 참석 상태 업데이트 폼 데이터 타입
 */
export type UpdateAttendanceFormData = z.infer<typeof updateAttendanceSchema>

/**
 * 카풀 등록 폼 검증 스키마
 */
export const createCarpoolSchema = z.object({
  seats: z
    .number()
    .int('탑승 가능 인원은 정수여야 합니다.')
    .min(1, '탑승 가능 인원은 최소 1명 이상이어야 합니다.')
    .max(7, '탑승 가능 인원은 최대 7명 이하여야 합니다.'),
  departure: z
    .string()
    .min(1, '출발 장소를 입력해 주세요.')
    .max(100, '출발 장소는 100자 이내여야 합니다.'),
})

/**
 * 카풀 등록 폼 데이터 타입
 */
export type CreateCarpoolFormData = z.infer<typeof createCarpoolSchema>

/**
 * 공지사항 생성 폼 검증 스키마
 */
export const createNoticeSchema = z.object({
  content: z
    .string()
    .min(1, '공지사항 내용을 입력해 주세요.')
    .max(1000, '공지사항은 1,000자 이내여야 합니다.'),
})

/**
 * 공지사항 생성 폼 데이터 타입
 */
export type CreateNoticeFormData = z.infer<typeof createNoticeSchema>

/**
 * 사용자 프로필 폼 검증 스키마
 */
export const userProfileSchema = z.object({
  name: z
    .string()
    .min(1, '이름을 입력해 주세요.')
    .max(50, '이름은 50자 이내여야 합니다.'),
  profileImage: z.string().url('올바른 이미지 URL이 아닙니다.').optional(),
})

/**
 * 사용자 프로필 폼 데이터 타입
 */
export type UserProfileFormData = z.infer<typeof userProfileSchema>

/**
 * 게스트 참석 폼 검증 스키마
 * 로그인하지 않은 사용자의 참석 의사 표시
 */
export const guestAttendanceSchema = z.object({
  guestName: z
    .string()
    .min(1, '이름을 입력해 주세요.')
    .max(50, '이름은 50자 이내여야 합니다.'),
  status: z.nativeEnum(AttendanceStatus).refine(val => val !== undefined, {
    message: '올바른 참석 상태를 선택해 주세요.',
  }),
})

/**
 * 게스트 참석 폼 데이터 타입
 */
export type GuestAttendanceFormData = z.infer<typeof guestAttendanceSchema>

/**
 * 이벤트 수정 폼 검증 스키마 (선택적 필드)
 */
export const updateEventSchema = createEventSchema.partial()

/**
 * 이벤트 수정 폼 데이터 타입
 */
export type UpdateEventFormData = z.infer<typeof updateEventSchema>

/**
 * 로그인 폼 검증 스키마
 */
export const loginSchema = z.object({
  email: z
    .string()
    .email('올바른 이메일 주소를 입력해 주세요.')
    .min(1, '이메일을 입력해 주세요.'),
  password: z
    .string()
    .min(8, '비밀번호는 최소 8자 이상이어야 합니다.')
    .min(1, '비밀번호를 입력해 주세요.'),
  rememberMe: z.boolean().optional().default(false),
})

/**
 * 로그인 폼 데이터 타입
 */
export type LoginFormData = z.infer<typeof loginSchema>

/**
 * 회원가입 폼 검증 스키마
 */
export const signupSchema = z
  .object({
    email: z
      .string()
      .email('올바른 이메일 주소를 입력해 주세요.')
      .min(1, '이메일을 입력해 주세요.'),
    password: z
      .string()
      .min(8, '비밀번호는 최소 8자 이상이어야 합니다.')
      .min(1, '비밀번호를 입력해 주세요.'),
    confirmPassword: z.string().min(1, '비밀번호를 다시 입력해 주세요.'),
  })
  .refine(data => data.password === data.confirmPassword, {
    message: '비밀번호가 일치하지 않습니다.',
    path: ['confirmPassword'],
  })

/**
 * 회원가입 폼 데이터 타입
 */
export type SignupFormData = z.infer<typeof signupSchema>
