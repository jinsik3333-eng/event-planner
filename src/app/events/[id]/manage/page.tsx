'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { MapPin, Clock, Users, Share2, Settings } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Container } from '@/components/layout/container'
import { BottomTab } from '@/components/navigation/bottom-tab'
import { getEvent } from '@/actions/events'
import { getEventMembers } from '@/actions/attendance'
import type { GetEventResponse } from '@/types/api'
import type { Database } from '@/lib/supabase'

type EventMember = Database['public']['Tables']['event_members']['Row']

export default function ManagePage() {
  const params = useParams()
  const router = useRouter()
  const [activeTab, setActiveTab] = useState('members')
  const [event, setEvent] = useState<GetEventResponse | null>(null)
  const [members, setMembers] = useState<EventMember[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showShareModal, setShowShareModal] = useState(false)
  const [copied, setCopied] = useState(false)

  // 이벤트 및 참여자 정보 로드
  useEffect(() => {
    const loadData = async () => {
      try {
        const eventId = Array.isArray(params.id) ? params.id[0] : params.id

        if (!eventId) {
          setError('이벤트 ID가 유효하지 않습니다.')
          setIsLoading(false)
          return
        }

        // 이벤트 정보 조회
        const eventResponse = await getEvent(eventId)
        if (!eventResponse.success || !eventResponse.data) {
          setError(eventResponse.error || '이벤트를 찾을 수 없습니다.')
          setIsLoading(false)
          return
        }

        setEvent(eventResponse.data)

        // 참여자 정보 조회
        const membersResponse = await getEventMembers(eventId)
        if (!membersResponse.success) {
          setError(membersResponse.error || '참여자 정보를 불러올 수 없습니다.')
          setIsLoading(false)
          return
        }

        setMembers(membersResponse.data || [])
        setError(null)
      } catch (err) {
        const message =
          err instanceof Error ? err.message : '데이터 로드에 실패했습니다.'
        setError(message)
      } finally {
        setIsLoading(false)
      }
    }

    loadData()
  }, [params.id])

  // 참여 현황 계산
  const attendingCount = members.filter(m => m.status === 'ATTENDING').length
  const undecidedCount = members.filter(m => m.status === 'PENDING').length
  const notAttendingCount = members.filter(
    m => m.status === 'NOT_ATTENDING'
  ).length

  // 로딩 상태
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 pb-20">
        <div className="sticky top-0 z-10 border-b border-gray-200 bg-white">
          <Container className="flex items-center justify-between py-3">
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
            <h1 className="flex-1 text-center text-lg font-bold text-gray-900">
              모임 관리
            </h1>
            <button className="rounded-lg p-2 hover:bg-gray-100">
              <Settings size={20} className="text-gray-700" />
            </button>
          </Container>
        </div>
        <Container className="mt-8 space-y-4">
          <div className="h-40 animate-pulse rounded-lg bg-gray-200" />
          <div className="space-y-3">
            <div className="h-6 w-3/4 animate-pulse rounded bg-gray-200" />
            <div className="h-4 w-1/2 animate-pulse rounded bg-gray-200" />
          </div>
        </Container>
      </div>
    )
  }

  // 에러 상태
  if (error || !event) {
    return (
      <div className="min-h-screen bg-gray-50 pb-20">
        <div className="sticky top-0 z-10 border-b border-gray-200 bg-white">
          <Container className="flex items-center justify-between py-3">
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
            <h1 className="flex-1 text-center text-lg font-bold text-gray-900">
              모임 관리
            </h1>
            <button className="rounded-lg p-2 hover:bg-gray-100">
              <Settings size={20} className="text-gray-700" />
            </button>
          </Container>
        </div>
        <Container className="mt-8">
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
            className="mt-4 h-12 w-full bg-gray-600 font-bold text-white hover:bg-gray-700"
          >
            뒤로가기
          </Button>
        </Container>
      </div>
    )
  }

  const mapAttendanceStatus = (status: string) => {
    switch (status) {
      case 'ATTENDING':
        return '참석'
      case 'PENDING':
        return '미정'
      case 'NOT_ATTENDING':
        return '불참'
      default:
        return status
    }
  }

  // 초대 링크 생성
  const getInviteLink = () => {
    if (!event) return ''
    const baseUrl = typeof window !== 'undefined' ? window.location.origin : ''
    return `${baseUrl}/join/${event.invite_code}`
  }

  // 초대 링크 복사
  const copyToClipboard = async () => {
    try {
      const link = getInviteLink()
      await navigator.clipboard.writeText(link)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      alert('링크 복사에 실패했습니다.')
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* 뒤로가기 헤더 */}
      <div className="sticky top-0 z-10 border-b border-gray-200 bg-white">
        <Container className="flex items-center justify-between py-3">
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
          <h1 className="flex-1 text-center text-lg font-bold text-gray-900">
            모임 관리
          </h1>
          <button className="rounded-lg p-2 hover:bg-gray-100">
            <Settings size={20} className="text-gray-700" />
          </button>
        </Container>
      </div>

      {/* 이벤트 정보 카드 */}
      <Container className="py-4">
        <Card>
          <CardContent className="space-y-4 p-4">
            {/* 이미지 */}
            <img
              src={
                event.image ||
                'https://images.unsplash.com/photo-1552664730-d307ca884978?w=600&h=400&fit=crop'
              }
              alt={event.title}
              className="h-32 w-full rounded-lg object-cover"
            />

            {/* 제목 및 상태 */}
            <div className="space-y-2">
              <h2 className="text-lg font-bold text-gray-900">{event.title}</h2>
              <Badge
                className={
                  event.status === 'RECRUITING'
                    ? 'bg-emerald-100 text-emerald-700'
                    : 'bg-blue-100 text-blue-700'
                }
              >
                {event.status === 'RECRUITING' ? '모집 중' : '확정'}
              </Badge>
            </div>

            {/* 메타 정보 */}
            <div className="space-y-2 border-t border-b border-gray-200 py-4 text-sm">
              <div className="flex items-center gap-2 text-gray-600">
                <Clock size={18} className="text-emerald-600" />
                <span>{new Date(event.date).toLocaleDateString('ko-KR')}</span>
              </div>
              <div className="flex items-center gap-2 text-gray-600">
                <MapPin size={18} className="text-emerald-600" />
                <span>{event.location}</span>
              </div>
            </div>

            {/* 참여 현황 */}
            <div className="grid grid-cols-3 gap-2">
              <div className="rounded-lg bg-emerald-50 p-3 text-center">
                <p className="text-2xl font-bold text-emerald-600">
                  {attendingCount}
                </p>
                <p className="text-xs text-gray-600">참석</p>
              </div>
              <div className="rounded-lg bg-yellow-50 p-3 text-center">
                <p className="text-2xl font-bold text-yellow-600">
                  {undecidedCount}
                </p>
                <p className="text-xs text-gray-600">미정</p>
              </div>
              <div className="rounded-lg bg-red-50 p-3 text-center">
                <p className="text-2xl font-bold text-red-600">
                  {notAttendingCount}
                </p>
                <p className="text-xs text-gray-600">불참</p>
              </div>
            </div>

            {/* 액션 버튼 */}
            <div className="flex gap-2">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => setShowShareModal(true)}
              >
                <Share2 size={18} className="mr-2" />
                초대 링크
              </Button>
              <Button variant="outline" className="flex-1">
                수정
              </Button>
            </div>
          </CardContent>
        </Card>
      </Container>

      {/* 탭 네비게이션 */}
      <Container className="py-4">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="members">참여자</TabsTrigger>
            <TabsTrigger value="settlement">정산</TabsTrigger>
            <TabsTrigger value="carpool">카풀</TabsTrigger>
          </TabsList>

          {/* 참여자 탭 */}
          <TabsContent value="members" className="mt-4 space-y-4">
            {members.length === 0 ? (
              <div className="py-12 text-center">
                <Users size={48} className="mx-auto mb-4 text-gray-300" />
                <p className="text-gray-600">아직 참여자가 없습니다.</p>
              </div>
            ) : (
              members.map(member => (
                <Card key={member.id}>
                  <CardContent className="flex items-center justify-between p-4">
                    <div className="flex-1">
                      <p className="font-semibold text-gray-900">
                        {member.guest_name || 'Guest User'}
                      </p>
                      <p className="mt-1 text-xs text-gray-600">
                        {mapAttendanceStatus(member.status)}
                      </p>
                    </div>
                    <Badge
                      variant={
                        member.status === 'ATTENDING'
                          ? 'default'
                          : member.status === 'PENDING'
                            ? 'secondary'
                            : 'outline'
                      }
                      className={
                        member.status === 'ATTENDING'
                          ? 'bg-emerald-100 text-emerald-700'
                          : member.status === 'PENDING'
                            ? 'bg-yellow-100 text-yellow-700'
                            : 'bg-gray-100 text-gray-700'
                      }
                    >
                      {member.has_paid ? '납부완료' : '미납'}
                    </Badge>
                  </CardContent>
                </Card>
              ))
            )}
          </TabsContent>

          {/* 정산 탭 */}
          <TabsContent value="settlement" className="mt-4 space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">총 수입</CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <p className="mt-2 text-3xl font-bold text-emerald-600">
                  {(attendingCount * event.fee).toLocaleString()}원
                </p>
                <p className="mt-2 text-sm text-gray-600">
                  {attendingCount}명 × {event.fee.toLocaleString()}원
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">미납자</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {members.filter(m => m.status === 'ATTENDING' && !m.has_paid)
                  .length === 0 ? (
                  <p className="py-4 text-center text-gray-600">
                    미납자가 없습니다.
                  </p>
                ) : (
                  members
                    .filter(m => m.status === 'ATTENDING' && !m.has_paid)
                    .map(member => (
                      <div
                        key={member.id}
                        className="flex justify-between border-b border-gray-200 py-2"
                      >
                        <span className="text-gray-900">
                          {member.guest_name || 'Guest User'}
                        </span>
                        <span className="font-semibold text-red-600">
                          {event.fee.toLocaleString()}원
                        </span>
                      </div>
                    ))
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* 카풀 탭 */}
          <TabsContent value="carpool" className="mt-4 space-y-4">
            <div className="py-12 text-center">
              <Users size={48} className="mx-auto mb-4 text-gray-300" />
              <p className="text-gray-600">아직 카풀 신청이 없습니다.</p>
            </div>
          </TabsContent>
        </Tabs>
      </Container>

      {/* 하단 탭 */}
      <BottomTab />

      {/* 초대 링크 공유 모달 */}
      {showShareModal && (
        <div className="fixed inset-0 z-50 flex items-end bg-black/50">
          <div className="w-full rounded-t-lg bg-white p-6">
            {/* 헤더 */}
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-bold text-gray-900">
                초대 링크 공유
              </h2>
              <button
                onClick={() => setShowShareModal(false)}
                className="text-gray-400 hover:text-gray-600"
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
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>

            {/* 초대 링크 */}
            <div className="mb-4 space-y-2">
              <label className="text-sm font-medium text-gray-700">
                초대 링크
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  readOnly
                  value={getInviteLink()}
                  className="flex-1 rounded-lg border border-gray-300 bg-gray-50 px-4 py-2 text-sm text-gray-700"
                />
                <Button
                  onClick={copyToClipboard}
                  className={`${
                    copied
                      ? 'bg-emerald-600 hover:bg-emerald-700'
                      : 'bg-gray-900 hover:bg-gray-800'
                  } text-white`}
                >
                  {copied ? '복사됨' : '복사'}
                </Button>
              </div>
            </div>

            {/* 공유 방법 */}
            <div className="mb-4 space-y-2">
              <p className="text-sm font-medium text-gray-700">공유 방법</p>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => {
                    const link = getInviteLink()
                    const text = `${event?.title} 모임에 참석해주세요!\n${link}`
                    const kakaoShareUrl = `https://story.kakao.com/?app=3&kakao_agent=kakaolink/2.0/easylink&extra={"key1":"value1","key2":"value2"}`
                    window.open(kakaoShareUrl, '_blank')
                  }}
                >
                  카카오톡
                </Button>
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => {
                    const link = getInviteLink()
                    const text = encodeURIComponent(
                      `${event?.title} 모임에 참석해주세요! ${link}`
                    )
                    window.open(
                      `https://twitter.com/intent/tweet?text=${text}`,
                      '_blank'
                    )
                  }}
                >
                  SNS 공유
                </Button>
              </div>
            </div>

            {/* 닫기 버튼 */}
            <Button
              onClick={() => setShowShareModal(false)}
              className="h-12 w-full bg-gray-100 font-bold text-gray-900 hover:bg-gray-200"
            >
              닫기
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
