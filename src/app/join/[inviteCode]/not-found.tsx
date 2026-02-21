import Link from 'next/link'
import { LinkIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'

/**
 * 초대 링크 Not Found 페이지
 * 유효하지 않거나 만료된 초대 코드 접근 시 표시
 */
export default function InviteNotFound() {
  return (
    <div className="flex min-h-[calc(100vh-200px)] flex-col items-center justify-center px-6 text-center">
      <LinkIcon className="mb-4 h-16 w-16 text-gray-300" />
      <h2 className="mb-2 text-xl font-bold text-gray-900 dark:text-gray-100">
        유효하지 않은 초대 링크
      </h2>
      <p className="mb-2 text-sm text-gray-500 dark:text-gray-400">
        초대 링크가 만료되었거나 존재하지 않습니다.
      </p>
      <p className="mb-6 text-sm text-gray-400 dark:text-gray-500">
        주최자에게 새 초대 링크를 요청해 주세요.
      </p>
      <Button asChild>
        <Link href="/">홈으로</Link>
      </Button>
    </div>
  )
}
