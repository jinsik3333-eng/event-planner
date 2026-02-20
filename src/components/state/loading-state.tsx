import { Skeleton } from '@/components/ui/skeleton'

interface LoadingStateProps {
  /**
   * 보여줄 스켈레톤 개수
   */
  count?: number
  /**
   * 스켈레톤의 높이 (Tailwind 클래스)
   */
  height?: string
}

/**
 * 로딩 상태 표시 컴포넌트
 * 데이터 로딩 중일 때 스켈레톤으로 표시
 */
export function LoadingState({
  count = 3,
  height = 'h-24',
}: LoadingStateProps) {
  return (
    <div className="space-y-4">
      {Array.from({ length: count }).map((_, i) => (
        <Skeleton key={i} className={`w-full ${height} rounded-lg`} />
      ))}
    </div>
  )
}
