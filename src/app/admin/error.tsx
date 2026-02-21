'use client'

import { useEffect } from 'react'
import Link from 'next/link'
import { AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'

/**
 * 관리자 대시보드 에러 바운더리
 * 통계/모임 데이터 로딩 실패 시 표시
 */
export default function AdminError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error('관리자 대시보드 에러:', error)
  }, [error])

  return (
    <div className="hidden min-h-screen w-full !max-w-none items-center justify-center bg-gray-100 md:flex">
      <div className="flex flex-col items-center text-center">
        <AlertCircle className="mb-4 h-16 w-16 text-red-500" />
        <h2 className="mb-2 text-xl font-bold text-gray-900">
          데이터를 불러올 수 없습니다
        </h2>
        <p className="mb-6 text-sm text-gray-500">
          관리자 대시보드 데이터 로딩 중 오류가 발생했습니다.
        </p>
        <div className="flex gap-3">
          <Button onClick={reset}>다시 시도</Button>
          <Button variant="outline" asChild>
            <Link href="/dashboard">대시보드로</Link>
          </Button>
        </div>
      </div>
    </div>
  )
}
