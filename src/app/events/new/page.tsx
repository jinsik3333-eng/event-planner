'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { CreateEventForm } from '@/components/forms/create-event-form'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { ArrowLeftIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { createEvent } from '@/actions/events'
import { getCurrentUserId } from '@/actions/auth'
import { toast } from 'sonner'
import type { CreateEventFormData } from '@/types'

export default function CreateEventPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)

  const handleCreateEvent = async (formData: CreateEventFormData) => {
    setIsLoading(true)
    try {
      const userId = await getCurrentUserId()
      if (!userId) {
        toast.error('사용자 정보를 가져올 수 없습니다.')
        return
      }

      const result = await createEvent(userId, formData)

      if (result.success && result.data?.id) {
        toast.success('이벤트가 생성되었습니다!')
        router.push(`/events/${result.data.id}/manage`)
      } else {
        toast.error(result.error || '이벤트 생성에 실패했습니다.')
      }
    } catch (error) {
      console.error('이벤트 생성 오류:', error)
      toast.error('이벤트 생성 중 오류가 발생했습니다.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white px-4 py-8">
      <div className="mx-auto max-w-2xl">
        {/* 뒤로가기 버튼 */}
        <Button
          variant="ghost"
          size="sm"
          onClick={() => router.back()}
          className="mb-6"
        >
          <ArrowLeftIcon className="mr-2 h-4 w-4" />
          뒤로가기
        </Button>

        <Card>
          <CardHeader className="space-y-1">
            <CardTitle className="text-center text-3xl font-bold">
              새 모임 만들기
            </CardTitle>
            <CardDescription className="text-center">
              모임 정보를 입력하여 새로운 이벤트를 생성하세요
            </CardDescription>
          </CardHeader>
          <CardContent>
            <CreateEventForm
              onSubmit={handleCreateEvent}
              isLoading={isLoading}
            />
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
