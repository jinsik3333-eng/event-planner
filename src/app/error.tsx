'use client'

import { useEffect } from 'react'
import Link from 'next/link'
import { AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'

/**
 * 전역 에러 페이지
 * Next.js App Router 에러 바운더리 - 예상치 못한 런타임 에러 처리
 */
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    // 에러 로깅 (추후 Sentry 등으로 교체 가능)
    console.error('전역 에러 발생:', error)
  }, [error])

  return (
    <div className="flex min-h-[calc(100vh-200px)] flex-col items-center justify-center px-6 text-center">
      <AlertCircle className="mb-4 h-16 w-16 text-red-500" />
      <h2 className="mb-2 text-xl font-bold text-gray-900 dark:text-gray-100">
        오류가 발생했습니다
      </h2>
      <p className="mb-1 text-sm text-gray-500 dark:text-gray-400">
        예상치 못한 문제가 발생했습니다.
      </p>
      <p className="mb-6 text-sm text-gray-400 dark:text-gray-500">
        잠시 후 다시 시도해 주세요.
      </p>
      {error.digest && (
        <p className="mb-6 font-mono text-xs text-gray-300">
          오류 코드: {error.digest}
        </p>
      )}
      <div className="flex gap-3">
        <Button onClick={reset} variant="default">
          다시 시도
        </Button>
        <Button variant="outline" asChild>
          <Link href="/">홈으로</Link>
        </Button>
      </div>
    </div>
  )
}
