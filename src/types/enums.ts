/**
 * 이벤트 상태 열거형
 * - 모집중: 이벤트 모집 중
 * - 확정: 이벤트 확정됨
 * - 종료: 이벤트 종료됨
 */
export enum EventStatus {
  RECRUITING = '모집중',
  CONFIRMED = '확정',
  ENDED = '종료',
}

/**
 * 참석 상태 열거형
 * 데이터베이스의 status 컬럼 값과 일치
 * - ATTENDING: 이벤트에 참석
 * - NOT_ATTENDING: 이벤트에 불참
 * - PENDING: 아직 참석 여부 미정
 */
export enum AttendanceStatus {
  ATTENDING = 'ATTENDING',
  NOT_ATTENDING = 'NOT_ATTENDING',
  PENDING = 'PENDING',
}

/**
 * 납부 상태 열거형
 * - 납부: 참가비 납부 완료
 * - 미납: 참가비 미납
 */
export enum PaymentStatus {
  PAID = '납부',
  UNPAID = '미납',
}
