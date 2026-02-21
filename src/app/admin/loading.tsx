import { Skeleton } from '@/components/ui/skeleton'
import { Card, CardContent } from '@/components/ui/card'

/**
 * 관리자 대시보드 로딩 UI
 * admin/page.tsx 데이터 로딩 중 표시되는 스켈레톤
 */
export default function AdminLoading() {
  return (
    <div className="hidden min-h-screen w-full !max-w-none bg-gray-100 md:flex">
      {/* 사이드바 스켈레톤 */}
      <div className="flex w-64 flex-col bg-gray-900">
        <div className="border-b border-gray-800 p-6">
          <Skeleton className="h-8 w-16 bg-gray-700" />
          <Skeleton className="mt-1 h-3 w-28 bg-gray-700" />
        </div>
        <nav className="flex-1 space-y-2 p-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-10 w-full rounded-lg bg-gray-700" />
          ))}
        </nav>
      </div>

      {/* 메인 콘텐츠 스켈레톤 */}
      <div className="flex-1 overflow-auto">
        {/* 상단바 스켈레톤 */}
        <div className="sticky top-0 z-10 border-b border-gray-200 bg-white px-8 py-4">
          <Skeleton className="h-7 w-32" />
        </div>

        <div className="space-y-8 p-8">
          {/* 통계 카드 스켈레톤 */}
          <div>
            <Skeleton className="mb-4 h-6 w-24" />
            <div className="grid grid-cols-4 gap-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <Card key={i} className="bg-gray-50">
                  <CardContent className="pt-6">
                    <div className="flex items-start justify-between">
                      <div className="space-y-2">
                        <Skeleton className="h-4 w-20" />
                        <Skeleton className="h-8 w-16" />
                      </div>
                      <Skeleton className="h-6 w-6 rounded" />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* 테이블 스켈레톤 */}
          <div>
            <Skeleton className="mb-4 h-6 w-24" />
            <Card>
              <CardContent className="pt-6">
                <div className="space-y-3">
                  {/* 테이블 헤더 */}
                  <div className="grid grid-cols-6 gap-4 border-b border-gray-200 pb-3">
                    {Array.from({ length: 6 }).map((_, i) => (
                      <Skeleton key={i} className="h-4 w-full" />
                    ))}
                  </div>
                  {/* 테이블 행 */}
                  {Array.from({ length: 5 }).map((_, i) => (
                    <div key={i} className="grid grid-cols-6 gap-4 py-2">
                      {Array.from({ length: 6 }).map((_, j) => (
                        <Skeleton key={j} className="h-4 w-full" />
                      ))}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
