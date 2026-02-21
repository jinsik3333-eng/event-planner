import Link from 'next/link'
import { Search } from 'lucide-react'
import { Button } from '@/components/ui/button'

/**
 * 404 Not Found 페이지
 * 존재하지 않는 경로 접근 시 표시
 */
export default function NotFound() {
  return (
    <div className="flex min-h-[calc(100vh-200px)] flex-col items-center justify-center px-6 text-center">
      <Search className="mb-4 h-16 w-16 text-gray-300" />
      <h2 className="mb-2 text-xl font-bold text-gray-900 dark:text-gray-100">
        페이지를 찾을 수 없습니다
      </h2>
      <p className="mb-6 text-sm text-gray-500 dark:text-gray-400">
        요청하신 페이지가 존재하지 않거나 이동되었습니다.
      </p>
      <div className="flex gap-3">
        <Button asChild>
          <Link href="/dashboard">대시보드로</Link>
        </Button>
        <Button variant="outline" asChild>
          <Link href="/">홈으로</Link>
        </Button>
      </div>
    </div>
  )
}
