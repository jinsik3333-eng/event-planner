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
import { createEventSchema, type CreateEventFormData } from '@/types'
import { FormError } from './form-error'

interface CreateEventFormProps {
  onSubmit?: (data: CreateEventFormData) => Promise<void>
  isLoading?: boolean
}

export function CreateEventForm({ onSubmit, isLoading }: CreateEventFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<CreateEventFormData>({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: zodResolver(createEventSchema) as any,
    mode: 'onBlur',
    defaultValues: {
      title: '',
      description: '',
      date: '',
      location: '',
      fee: 0,
      maxAttendees: undefined,
    },
  })

  const isProcessing = isSubmitting || isLoading

  const onSubmitHandler = async (data: CreateEventFormData) => {
    if (onSubmit) {
      await onSubmit(data)
    } else {
      console.log('이벤트 생성 데이터:', data)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>모임 생성</CardTitle>
        <CardDescription>
          새로운 모임을 만들어 친구들을 초대하세요
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmitHandler)} className="space-y-4">
          {/* 모임 제목 */}
          <div className="space-y-2">
            <Label htmlFor="title">모임 제목 *</Label>
            <Input
              id="title"
              placeholder="예: 서울 맛집 투어"
              maxLength={50}
              {...register('title')}
            />
            {errors.title && <FormError error={errors.title} />}
          </div>

          {/* 설명 */}
          <div className="space-y-2">
            <Label htmlFor="description">설명</Label>
            <textarea
              id="description"
              placeholder="모임에 대해 설명해주세요"
              maxLength={500}
              className="border-input bg-background ring-offset-background placeholder:text-muted-foreground focus-visible:ring-ring min-h-24 w-full rounded-md border px-3 py-2 text-sm focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50"
              {...register('description')}
            />
            {errors.description && <FormError error={errors.description} />}
          </div>

          {/* 날짜 및 시간 */}
          <div className="space-y-2">
            <Label htmlFor="date">모임 날짜/시간 *</Label>
            <Input
              id="date"
              type="datetime-local"
              step="1800"
              {...register('date')}
            />
            <p className="text-xs text-muted-foreground">시간은 30분 단위로 선택됩니다</p>
            {errors.date && <FormError error={errors.date} />}
          </div>

          {/* 장소 */}
          <div className="space-y-2">
            <Label htmlFor="location">장소 *</Label>
            <Input
              id="location"
              placeholder="예: 서울시 강남구 강남대로 94"
              maxLength={100}
              {...register('location')}
            />
            {errors.location && <FormError error={errors.location} />}
          </div>

          {/* 참가비 */}
          <div className="space-y-2">
            <Label htmlFor="fee">참가비 (원) *</Label>
            <Input
              id="fee"
              type="number"
              placeholder="0"
              min="0"
              max="1000000"
              {...register('fee', { valueAsNumber: true })}
            />
            {errors.fee && <FormError error={errors.fee} />}
          </div>

          {/* 최대 인원 */}
          <div className="space-y-2">
            <Label htmlFor="maxAttendees">최대 인원</Label>
            <Input
              id="maxAttendees"
              type="number"
              placeholder="제한 없음"
              min="1"
              max="100"
              {...register('maxAttendees', { valueAsNumber: true })}
            />
            {errors.maxAttendees && <FormError error={errors.maxAttendees} />}
          </div>

          {/* 제출 버튼 */}
          <Button type="submit" disabled={isProcessing} className="w-full">
            {isProcessing ? '생성 중...' : '모임 생성'}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
