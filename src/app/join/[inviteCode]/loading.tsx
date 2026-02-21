import { Skeleton } from '@/components/ui/skeleton'
import { Container } from '@/components/layout/container'

/**
 * 초대 링크 페이지 로딩 UI
 * 이벤트 정보 로딩 중 표시되는 스켈레톤
 */
export default function JoinLoading() {
  return (
    <div className="min-h-screen bg-white pb-4">
      {/* 헤더 스켈레톤 */}
      <div className="sticky top-0 z-10 border-b border-gray-200 bg-white">
        <Container className="py-3">
          <Skeleton className="h-9 w-9 rounded-lg" />
        </Container>
      </div>

      {/* 이미지 스켈레톤 */}
      <Skeleton className="h-48 w-full rounded-none" />

      <Container className="mt-4 space-y-4">
        {/* 제목/배지 스켈레톤 */}
        <div className="space-y-2">
          <Skeleton className="h-8 w-3/4" />
          <div className="flex gap-2">
            <Skeleton className="h-5 w-16 rounded-full" />
            <Skeleton className="h-5 w-20" />
          </div>
        </div>

        {/* 메타 정보 스켈레톤 */}
        <div className="space-y-3 border-t border-b border-gray-200 py-4">
          <div className="flex items-center gap-3">
            <Skeleton className="h-5 w-5 rounded" />
            <Skeleton className="h-4 w-40" />
          </div>
          <div className="flex items-center gap-3">
            <Skeleton className="h-5 w-5 rounded" />
            <Skeleton className="h-4 w-32" />
          </div>
          <div className="flex items-center gap-3">
            <Skeleton className="h-5 w-5 rounded" />
            <Skeleton className="h-4 w-20" />
          </div>
        </div>

        {/* 설명 스켈레톤 */}
        <div className="space-y-2">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-5/6" />
        </div>

        {/* 참석 버튼 스켈레톤 */}
        <div className="space-y-3 pt-4">
          <Skeleton className="h-5 w-36" />
          <div className="grid grid-cols-3 gap-3">
            <Skeleton className="h-10 rounded-md" />
            <Skeleton className="h-10 rounded-md" />
            <Skeleton className="h-10 rounded-md" />
          </div>
        </div>
      </Container>
    </div>
  )
}
