import Link from 'next/link'
import { Button } from '@/components/ui/button'

interface EmptyStateProps {
  icon?: React.ReactNode
  title: string
  description: string
  action?: {
    label: string
    href?: string
    onClick?: () => void
  }
}

/**
 * 빈 상태 표시 컴포넌트
 * 데이터가 없을 때 사용자에게 보여지는 상태
 */
export function EmptyState({
  icon,
  title,
  description,
  action,
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      {icon && <div className="mb-4 text-5xl">{icon}</div>}
      <h3 className="mb-2 text-lg font-semibold text-gray-900">{title}</h3>
      <p className="mb-6 text-sm text-gray-600">{description}</p>
      {action && (
        <>
          {action.href ? (
            <Link href={action.href}>
              <Button className="bg-emerald-600 hover:bg-emerald-700">
                {action.label}
              </Button>
            </Link>
          ) : (
            <Button
              onClick={action.onClick}
              className="bg-emerald-600 hover:bg-emerald-700"
            >
              {action.label}
            </Button>
          )}
        </>
      )}
    </div>
  )
}
