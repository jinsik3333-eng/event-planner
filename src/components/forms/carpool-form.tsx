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
import { createCarpoolSchema, type CreateCarpoolFormData } from '@/types'
import { FormError } from './form-error'

interface CarpoolFormProps {
  onSubmit?: (data: CreateCarpoolFormData) => Promise<void>
  isLoading?: boolean
}

export function CarpoolForm({ onSubmit, isLoading }: CarpoolFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<CreateCarpoolFormData>({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: zodResolver(createCarpoolSchema) as any,
    mode: 'onBlur',
  })

  const isProcessing = isSubmitting || isLoading

  const onSubmitHandler = async (data: CreateCarpoolFormData) => {
    if (onSubmit) {
      await onSubmit(data)
    } else {
      console.log('카풀 등록 데이터:', data)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>카풀 운전자 등록</CardTitle>
        <CardDescription>
          운전자가 되어 참석자들과 함께 이동하세요
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmitHandler)} className="space-y-4">
          {/* 탑승 가능 인원 */}
          <div className="space-y-2">
            <Label htmlFor="seats">탑승 가능 인원 (명) *</Label>
            <div className="flex items-center gap-2">
              <Input
                id="seats"
                type="number"
                placeholder="1-7"
                min="1"
                max="7"
                className="flex-1"
                {...register('seats', { valueAsNumber: true })}
              />
              <span className="text-muted-foreground text-xs">최대 7명</span>
            </div>
            {errors.seats && <FormError error={errors.seats} />}
          </div>

          {/* 출발 장소 */}
          <div className="space-y-2">
            <Label htmlFor="departure">출발 장소 *</Label>
            <Input
              id="departure"
              placeholder="예: 서울시 강남역 1번 출구"
              maxLength={100}
              {...register('departure')}
            />
            {errors.departure && <FormError error={errors.departure} />}
          </div>

          {/* 정보 안내 */}
          <div className="rounded-lg bg-blue-50 p-3 text-sm text-blue-900">
            <div className="mb-1 font-medium">✓ 카풀 등록 후:</div>
            <ul className="list-inside list-disc space-y-1 text-xs">
              <li>참석자들이 탑승을 신청할 수 있습니다</li>
              <li>정원이 다 차면 새로운 신청을 받을 수 없습니다</li>
              <li>언제든 운전자 정보를 수정하거나 취소할 수 있습니다</li>
            </ul>
          </div>

          {/* 제출 버튼 */}
          <Button type="submit" disabled={isProcessing} className="w-full">
            {isProcessing ? '등록 중...' : '카풀 등록'}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
