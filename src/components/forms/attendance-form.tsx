'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  updateAttendanceSchema,
  type UpdateAttendanceFormData,
  AttendanceStatus,
} from '@/types'
import { FormError } from './form-error'

interface AttendanceFormProps {
  isGuest?: boolean
  onSubmit?: (data: UpdateAttendanceFormData) => Promise<void>
  isLoading?: boolean
}

export function AttendanceForm({
  isGuest = false,
  onSubmit,
  isLoading,
}: AttendanceFormProps) {
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<UpdateAttendanceFormData>({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: zodResolver(updateAttendanceSchema) as any,
    mode: 'onBlur',
  })

  const status = watch('status')
  const isProcessing = isSubmitting || isLoading

  const onSubmitHandler = async (data: UpdateAttendanceFormData) => {
    if (onSubmit) {
      await onSubmit(data)
    } else {
      console.log('참석 상태 데이터:', data)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>참석 의사 표시</CardTitle>
        <CardDescription>이 모임에 참석 여부를 알려주세요</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmitHandler)} className="space-y-4">
          {/* 게스트 이름 (비로그인 사용자만) */}
          {isGuest && (
            <div className="space-y-2">
              <Label htmlFor="guestName">이름 *</Label>
              <Input
                id="guestName"
                placeholder="이름을 입력해주세요"
                maxLength={50}
                {...register('guestName')}
              />
              {errors.guestName && <FormError error={errors.guestName} />}
            </div>
          )}

          {/* 참석 상태 선택 */}
          <div className="space-y-3">
            <Label>참석 상태 *</Label>
            <div className="space-y-2">
              {/* 참석 */}
              <label
                className="border-input hover:bg-accent flex cursor-pointer items-center space-x-3 rounded-lg border p-3"
                style={{
                  borderColor:
                    status === AttendanceStatus.ATTENDING
                      ? '#2563eb'
                      : 'hsl(var(--input))',
                }}
              >
                <input
                  type="radio"
                  value={AttendanceStatus.ATTENDING}
                  {...register('status')}
                  className="h-4 w-4 cursor-pointer"
                />
                <div className="flex-1">
                  <div className="text-sm font-medium">참석</div>
                  <div className="text-muted-foreground text-xs">
                    모임에 참석하겠습니다
                  </div>
                </div>
              </label>

              {/* 미정 */}
              <label
                className="border-input hover:bg-accent flex cursor-pointer items-center space-x-3 rounded-lg border p-3"
                style={{
                  borderColor:
                    status === AttendanceStatus.UNDECIDED
                      ? '#2563eb'
                      : 'hsl(var(--input))',
                }}
              >
                <input
                  type="radio"
                  value={AttendanceStatus.UNDECIDED}
                  {...register('status')}
                  className="h-4 w-4 cursor-pointer"
                />
                <div className="flex-1">
                  <div className="text-sm font-medium">미정</div>
                  <div className="text-muted-foreground text-xs">
                    아직 결정하지 못했습니다
                  </div>
                </div>
              </label>

              {/* 불참 */}
              <label
                className="border-input hover:bg-accent flex cursor-pointer items-center space-x-3 rounded-lg border p-3"
                style={{
                  borderColor:
                    status === AttendanceStatus.NOT_ATTENDING
                      ? '#2563eb'
                      : 'hsl(var(--input))',
                }}
              >
                <input
                  type="radio"
                  value={AttendanceStatus.NOT_ATTENDING}
                  {...register('status')}
                  className="h-4 w-4 cursor-pointer"
                />
                <div className="flex-1">
                  <div className="text-sm font-medium">불참</div>
                  <div className="text-muted-foreground text-xs">
                    참석할 수 없습니다
                  </div>
                </div>
              </label>
            </div>
            {errors.status && <FormError error={errors.status} />}
          </div>

          {/* 제출 버튼 */}
          <Button type="submit" disabled={isProcessing} className="w-full">
            {isProcessing ? '저장 중...' : '참석 의사 표시'}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
