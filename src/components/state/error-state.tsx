import { AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface ErrorStateProps {
  title?: string
  message: string
  action?: {
    label: string
    onClick: () => void
  }
}

/**
 * 에러 상태 표시 컴포넌트
 * 데이터 로딩이나 작업 중 에러 발생 시 표시
 */
export function ErrorState({
  title = '오류가 발생했습니다',
  message,
  action,
}: ErrorStateProps) {
  return (
    <div className="flex flex-col items-center justify-center rounded-lg border border-red-200 bg-red-50 py-12 text-center">
      <AlertCircle className="mb-4 h-12 w-12 text-red-600" />
      <h3 className="mb-2 text-lg font-semibold text-red-900">{title}</h3>
      <p className="mb-6 text-sm text-red-700">{message}</p>
      {action && (
        <Button
          onClick={action.onClick}
          className="bg-red-600 hover:bg-red-700"
        >
          {action.label}
        </Button>
      )}
    </div>
  )
}
