import { Skeleton } from '@/components/ui/skeleton'

/**
 * 이벤트 카드 로딩 스켈레톤
 * 실제 이벤트 카드 로딩 중일 때 표시
 */
export function EventCardSkeleton() {
  return (
    <div className="space-y-3 rounded-lg border border-gray-200 bg-white p-4">
      {/* 이미지 스켈레톤 */}
      <Skeleton className="h-32 w-full rounded-lg" />

      {/* 제목 스켈레톤 */}
      <Skeleton className="h-5 w-3/4 rounded" />

      {/* 메타 정보 스켈레톤 */}
      <div className="space-y-2">
        <Skeleton className="h-4 w-1/2 rounded" />
        <Skeleton className="h-4 w-2/3 rounded" />
      </div>

      {/* 참여자 수 스켈레톤 */}
      <Skeleton className="h-4 w-1/3 rounded" />
    </div>
  )
}
