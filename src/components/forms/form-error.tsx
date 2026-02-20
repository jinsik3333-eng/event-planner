import { AlertCircle } from 'lucide-react'
import { FieldError } from 'react-hook-form'

interface FormErrorProps {
  error?: FieldError
}

/**
 * React Hook Form 에러 표시 컴포넌트
 * 필드 검증 오류를 빨간 텍스트로 표시
 */
export function FormError({ error }: FormErrorProps) {
  if (!error) return null

  return (
    <div className="flex items-center gap-2 text-sm text-red-500">
      <AlertCircle className="h-4 w-4 flex-shrink-0" />
      <span>{error.message}</span>
    </div>
  )
}
