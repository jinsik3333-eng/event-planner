/**
 * 1인당 금액 계산
 * Math.ceil을 사용하여 소수점 이상 올림 처리
 */
export function calculatePricePerPerson(
  totalFee: number,
  attendingCount: number
): number {
  if (attendingCount === 0) return 0
  return Math.ceil(totalFee / attendingCount)
}
