'use client'

import { useEffect } from 'react'
import Link from 'next/link'
import { AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'

/**
 * 이벤트 관리 페이지 에러 바운더리
 * 이벤트 데이터 로딩 실패 또는 권한 없는 접근 처리
 */
export default function ManageError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error('이벤트 관리 페이지 에러:', error)
  }, [error])

  return (
    <div className="flex min-h-[calc(100vh-200px)] flex-col items-center justify-center px-6 text-center">
      <AlertCircle className="mb-4 h-16 w-16 text-red-500" />
      <h2 className="mb-2 text-xl font-bold text-gray-900 dark:text-gray-100">
        모임 정보를 불러올 수 없습니다
      </h2>
      <p className="mb-6 text-sm text-gray-500 dark:text-gray-400">
        모임이 존재하지 않거나 접근 권한이 없습니다.
      </p>
      <div className="flex gap-3">
        <Button onClick={reset}>다시 시도</Button>
        <Button variant="outline" asChild>
          <Link href="/dashboard">대시보드로</Link>
        </Button>
      </div>
    </div>
  )
}
