'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { MapPin, Clock, Users } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Container } from '@/components/layout/container'
import { getEventByInviteCode } from '@/actions/events'
import { createEventMember } from '@/actions/attendance'
import type { GetEventResponse } from '@/types/api'
import { AttendanceStatus } from '@/types/enums'

export default function JoinPage() {
  const params = useParams()
  const router = useRouter()
  const [guestName, setGuestName] = useState('')
  const [attendance, setAttendance] = useState<
    'attending' | 'not_attending' | 'pending' | null
  >(null)
  const [step, setStep] = useState<'info' | 'response' | 'confirm'>('info')
  const [event, setEvent] = useState<GetEventResponse | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  // 이벤트 정보 로드
  useEffect(() => {
    const loadEvent = async () => {
      try {
        const inviteCode = Array.isArray(params.inviteCode)
          ? params.inviteCode[0]
          : params.inviteCode

        if (!inviteCode) {
          setError('초대 코드가 유효하지 않습니다.')
          setIsLoading(false)
          return
        }

        const response = await getEventByInviteCode(inviteCode)

        if (!response.success || !response.data) {
          setError(response.error || '이벤트를 찾을 수 없습니다.')
          setIsLoading(false)
          return
        }

        setEvent(response.data)
        setError(null)
      } catch (err) {
        const message =
          err instanceof Error ? err.message : '이벤트 로드에 실패했습니다.'
        setError(message)
      } finally {
        setIsLoading(false)
      }
    }

    loadEvent()
  }, [params.inviteCode])

  const handleAttendanceSelect = (
    status: 'attending' | 'not_attending' | 'pending'
  ) => {
    setAttendance(status)
    setStep('response')
  }

  const handleConfirm = async () => {
    if (attendance === 'attending' && !guestName) {
      alert('이름을 입력해주세요')
      return
    }

    if (!event) {
      alert('이벤트 정보를 불러오는 중입니다.')
      return
    }

    if (!attendance) {
      alert('참석 의사를 선택해주세요.')
      return
    }

    try {
      setIsSubmitting(true)

      // 참여자 추가
      const statusMap: Record<
        'attending' | 'not_attending' | 'pending',
        AttendanceStatus
      > = {
        attending: AttendanceStatus.ATTENDING,
        not_attending: AttendanceStatus.NOT_ATTENDING,
        pending: AttendanceStatus.PENDING,
      }

      const response = await createEventMember({
        eventId: event.id,
        status: statusMap[attendance],
        guestName: attendance === 'attending' ? guestName : undefined,
      })

      if (!response.success) {
        alert(response.error || '참여 등록에 실패했습니다.')
        return
      }

      setStep('confirm')
    } catch (err) {
      const message =
        err instanceof Error ? err.message : '참여 등록에 실패했습니다.'
      alert(message)
    } finally {
      setIsSubmitting(false)
    }
  }

  // 로딩 상태
  if (isLoading) {
    return (
      <div className="min-h-screen bg-white pb-4">
        <div className="sticky top-0 z-10 border-b border-gray-200 bg-white">
          <Container className="py-3">
            <button
              className="-ml-2 rounded-lg p-2 hover:bg-gray-100"
              onClick={() => router.back()}
            >
              <svg
                className="h-6 w-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 19l-7-7 7-7"
                />
              </svg>
            </button>
          </Container>
        </div>
        <Container className="mt-8 space-y-4">
          <div className="h-48 animate-pulse rounded-lg bg-gray-200" />
          <div className="space-y-3">
            <div className="h-8 w-3/4 animate-pulse rounded bg-gray-200" />
            <div className="h-4 w-1/2 animate-pulse rounded bg-gray-200" />
            <div className="h-4 w-2/3 animate-pulse rounded bg-gray-200" />
          </div>
        </Container>
      </div>
    )
  }

  // 에러 상태
  if (error || !event) {
    return (
      <div className="min-h-screen bg-white pb-4">
        <div className="sticky top-0 z-10 border-b border-gray-200 bg-white">
          <Container className="py-3">
            <button
              className="-ml-2 rounded-lg p-2 hover:bg-gray-100"
              onClick={() => router.back()}
            >
              <svg
                className="h-6 w-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 19l-7-7 7-7"
                />
              </svg>
            </button>
          </Container>
        </div>
        <Container className="mt-8 space-y-4">
          <div className="rounded-lg border border-red-200 bg-red-50 p-6">
            <h2 className="text-lg font-bold text-red-900">
              오류가 발생했습니다
            </h2>
            <p className="mt-2 text-sm text-red-800">
              {error || '이벤트를 찾을 수 없습니다.'}
            </p>
          </div>
          <Button
            onClick={() => router.back()}
            className="h-12 w-full bg-gray-600 font-bold text-white hover:bg-gray-700"
          >
            뒤로가기
          </Button>
        </Container>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white pb-4">
      {/* 뒤로가기 */}
      <div className="sticky top-0 z-10 border-b border-gray-200 bg-white">
        <Container className="py-3">
          <button
            className="-ml-2 rounded-lg p-2 hover:bg-gray-100"
            onClick={() => router.back()}
          >
            <svg
              className="h-6 w-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 19l-7-7 7-7"
              />
            </svg>
          </button>
        </Container>
      </div>

      {step === 'info' && (
        <div className="space-y-6">
          {/* 이벤트 이미지 및 제목 */}
          <div>
            <img
              src={
                event.image ||
                'https://images.unsplash.com/photo-1552664730-d307ca884978?w=600&h=400&fit=crop'
              }
              alt={event.title}
              className="h-48 w-full object-cover"
            />
          </div>

          <Container className="space-y-4">
            {/* 제목 및 상태 */}
            <div className="space-y-2">
              <h1 className="text-2xl font-bold text-gray-900">
                {event.title}
              </h1>
              <div className="flex items-center gap-2">
                <Badge
                  variant="default"
                  className="bg-emerald-100 text-emerald-700"
                >
                  모집 중
                </Badge>
                <span className="text-sm text-gray-600">
                  {event.attendingCount}/{event.max_attendees || '제한없음'} 명
                </span>
              </div>
            </div>

            {/* 메타 정보 */}
            <div className="space-y-3 border-t border-b border-gray-200 py-4">
              {/* 날짜/시간 */}
              <div className="flex items-start gap-3">
                <Clock
                  size={20}
                  className="mt-0.5 flex-shrink-0 text-emerald-600"
                />
                <div>
                  <p className="text-sm text-gray-600">
                    {new Date(event.date).toLocaleDateString('ko-KR')}
                  </p>
                  <p className="font-semibold text-gray-900">
                    {new Date(event.date).toLocaleTimeString('ko-KR', {
                      hour: '2-digit',
                      minute: '2-digit',
                      hour12: true,
                    })}
                  </p>
                </div>
              </div>

              {/* 위치 */}
              <div className="flex items-start gap-3">
                <MapPin
                  size={20}
                  className="mt-0.5 flex-shrink-0 text-emerald-600"
                />
                <div>
                  <p className="font-semibold text-gray-900">
                    {event.location}
                  </p>
                </div>
              </div>

              {/* 참가비 */}
              <div className="flex items-start gap-3">
                <Users
                  size={20}
                  className="mt-0.5 flex-shrink-0 text-emerald-600"
                />
                <div>
                  <p className="text-sm text-gray-600">참가비</p>
                  <p className="font-semibold text-gray-900">
                    {event.fee && event.fee > 0
                      ? `${event.fee.toLocaleString()}원`
                      : '무료'}
                  </p>
                </div>
              </div>
            </div>

            {/* 설명 */}
            <p className="text-sm leading-relaxed text-gray-700">
              {event.description}
            </p>

            {/* 참석 의사 선택 */}
            <div className="space-y-3 pt-4">
              <p className="font-semibold text-gray-900">
                참석 의사를 알려주세요
              </p>
              <div className="grid grid-cols-3 gap-3">
                <Button
                  onClick={() => handleAttendanceSelect('attending')}
                  variant={attendance === 'attending' ? 'default' : 'outline'}
                  className={
                    attendance === 'attending'
                      ? 'bg-emerald-600 text-white hover:bg-emerald-700'
                      : ''
                  }
                  disabled={isSubmitting}
                >
                  참석
                </Button>
                <Button
                  onClick={() => handleAttendanceSelect('pending')}
                  variant={attendance === 'pending' ? 'default' : 'outline'}
                  className={
                    attendance === 'pending'
                      ? 'bg-amber-600 text-white hover:bg-amber-700'
                      : ''
                  }
                  disabled={isSubmitting}
                >
                  미정
                </Button>
                <Button
                  onClick={() => handleAttendanceSelect('not_attending')}
                  variant={
                    attendance === 'not_attending' ? 'default' : 'outline'
                  }
                  className={
                    attendance === 'not_attending'
                      ? 'bg-red-600 text-white hover:bg-red-700'
                      : ''
                  }
                  disabled={isSubmitting}
                >
                  불참
                </Button>
              </div>
            </div>
          </Container>
        </div>
      )}

      {step === 'response' && (
        <Container className="space-y-6 pt-6">
          {attendance === 'attending' && (
            <div className="space-y-4">
              <h2 className="font-semibold text-gray-900">참석 정보 입력</h2>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">
                  이름
                </label>
                <Input
                  placeholder="이름을 입력해주세요"
                  value={guestName}
                  onChange={e => setGuestName(e.target.value)}
                  className="h-12"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">
                  카카오톡 공유
                </label>
                <Button
                  variant="outline"
                  className="h-12 w-full border-yellow-300 text-yellow-700 hover:bg-yellow-50"
                >
                  카카오톡으로 공유
                </Button>
              </div>

              <Button
                onClick={handleConfirm}
                disabled={isSubmitting}
                className="h-12 w-full bg-emerald-600 font-bold text-white hover:bg-emerald-700"
              >
                {isSubmitting ? '등록 중...' : '참석 확정'}
              </Button>
            </div>
          )}

          {attendance === 'not_attending' && (
            <div className="space-y-4">
              <div className="rounded-lg border border-red-200 bg-red-50 p-4">
                <p className="text-red-800">불참으로 등록하시겠습니까?</p>
              </div>
              <Button
                onClick={handleConfirm}
                disabled={isSubmitting}
                className="h-12 w-full bg-emerald-600 font-bold text-white hover:bg-emerald-700"
              >
                {isSubmitting ? '등록 중...' : '불참 확정'}
              </Button>
            </div>
          )}

          {attendance === 'pending' && (
            <div className="space-y-4">
              <div className="rounded-lg border border-amber-200 bg-amber-50 p-4">
                <p className="text-amber-800">
                  미정으로 등록하시겠습니까? 나중에 변경할 수 있습니다.
                </p>
              </div>
              <Button
                onClick={handleConfirm}
                disabled={isSubmitting}
                className="h-12 w-full bg-emerald-600 font-bold text-white hover:bg-emerald-700"
              >
                {isSubmitting ? '등록 중...' : '미정으로 등록'}
              </Button>
            </div>
          )}
        </Container>
      )}

      {step === 'confirm' && (
        <Container className="space-y-6 pt-6">
          <div className="space-y-4 text-center">
            <div className="text-4xl">✅</div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">
                {attendance === 'attending'
                  ? '참석이 확정되었습니다!'
                  : attendance === 'not_attending'
                    ? '불참이 등록되었습니다'
                    : '미정으로 등록되었습니다'}
              </h2>
              <p className="mt-2 text-sm text-gray-600">
                모임 정보는 홈에서 언제든 확인할 수 있습니다.
              </p>
            </div>
          </div>

          <Button
            onClick={() => router.push('/')}
            className="h-12 w-full bg-emerald-600 font-bold text-white hover:bg-emerald-700"
          >
            홈으로 돌아가기
          </Button>
        </Container>
      )}
    </div>
  )
}
