import { toast } from 'sonner'
import { ApiResponse } from '@/types/api'

/**
 * unknown 타입 에러에서 사용자 친화적 메시지 추출
 */
export function getErrorMessage(error: unknown): string {
  if (error instanceof Error) return error.message
  if (typeof error === 'string') return error
  return '알 수 없는 오류가 발생했습니다.'
}

/**
 * Server Action 에러 로깅
 * 추후 Sentry 등의 에러 모니터링 서비스로 교체 가능
 */
export function logError(context: string, error: unknown): void {
  console.error(`[${context}]`, error)
}

/**
 * ApiResponse 결과를 처리하고 적절한 토스트 알림 표시
 *
 * @example
 * const ok = handleApiResponse(response, {
 *   successMessage: '저장되었습니다.',
 *   onSuccess: (data) => setData(data),
 * })
 *
 * @returns 성공 여부
 */
export function handleApiResponse<T>(
  response: ApiResponse<T>,
  options?: {
    successMessage?: string
    errorMessage?: string
    onSuccess?: (data: T) => void
    onError?: (error: string) => void
  }
): boolean {
  if (!response.success) {
    const message =
      options?.errorMessage || response.error || '작업에 실패했습니다.'
    toast.error(message)
    options?.onError?.(message)
    return false
  }

  if (options?.successMessage) {
    toast.success(options.successMessage)
  }

  if (response.data !== undefined && options?.onSuccess) {
    options.onSuccess(response.data)
  }

  return true
}
