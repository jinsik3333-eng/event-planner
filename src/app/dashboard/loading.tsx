import { EventCardSkeleton } from '@/components/event/event-card-skeleton'
import { Container } from '@/components/layout/container'
import { Skeleton } from '@/components/ui/skeleton'

/**
 * 대시보드 로딩 UI
 * 페이지 초기 로딩 중 표시되는 스켈레톤
 */
export default function DashboardLoading() {
  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* 헤더 스켈레톤 */}
      <div className="sticky top-0 z-10 border-b border-gray-200 bg-white">
        <Container className="py-3">
          <div className="flex items-center justify-between">
            <Skeleton className="h-6 w-20" />
            <div className="flex gap-2">
              <Skeleton className="h-9 w-9 rounded-lg" />
              <Skeleton className="h-9 w-9 rounded-lg" />
            </div>
          </div>
        </Container>
      </div>

      {/* 컨텐츠 스켈레톤 */}
      <Container className="space-y-6 py-6">
        {/* CTA 버튼 스켈레톤 */}
        <Skeleton className="h-12 w-full rounded-lg" />

        {/* 섹션 타이틀 스켈레톤 */}
        <Skeleton className="h-5 w-28" />

        {/* 이벤트 카드 스켈레톤 */}
        <div className="space-y-4">
          <EventCardSkeleton />
          <EventCardSkeleton />
          <EventCardSkeleton />
        </div>
      </Container>
    </div>
  )
}
