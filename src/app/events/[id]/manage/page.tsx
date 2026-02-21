'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import { useParams, useRouter } from 'next/navigation'
import { toast } from 'sonner'
import {
  MapPin,
  Clock,
  Users,
  Share2,
  Settings,
  AlertCircle,
  CheckCircle,
  Edit2,
  Trash2,
  MessageCircle,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Container } from '@/components/layout/container'
import { BottomTab } from '@/components/navigation/bottom-tab'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Skeleton } from '@/components/ui/skeleton'
import dynamic from 'next/dynamic'

// 카풀 탭에서만 필요한 폼 — lazy loading으로 초기 번들 분리
const CarpoolForm = dynamic(
  () => import('@/components/forms/carpool-form').then(mod => mod.CarpoolForm),
  {
    loading: () => <Skeleton className="h-32 w-full rounded-lg" />,
    ssr: false,
  }
)
import { ErrorState } from '@/components/state/error-state'
import { EmptyState } from '@/components/state/empty-state'
import { calculatePricePerPerson } from '@/lib/calculation'
import { getEvent } from '@/actions/events'
import { getEventMembers } from '@/actions/attendance'
import { updatePaymentStatus } from '@/actions/settlement'
import { getCarpools, createCarpool, joinCarpool } from '@/actions/carpool'
import { getNotices, createNotice, deleteNotice } from '@/actions/notices'
import type { GetEventResponse } from '@/types/api'
import type { Database } from '@/lib/supabase'

type EventMember = Database['public']['Tables']['event_members']['Row']
type Carpool = Database['public']['Tables']['carpools']['Row']
type Notice = Database['public']['Tables']['notices']['Row']

/**
 * 참석 상태를 한글로 변환
 */
function mapAttendanceStatus(status: string): string {
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

/**
 * 모임 관리 페이지 헤더
 */
function ManagePageHeader() {
  const router = useRouter()

  return (
    <div className="sticky top-0 z-10 border-b border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-900">
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
  )
}

export default function ManagePage() {
  const params = useParams()
  const router = useRouter()
  // 사용자 ID는 Server Action 내부에서 getServerSession으로 검증됨
  const [activeTab, setActiveTab] = useState('members')
  const [event, setEvent] = useState<GetEventResponse | null>(null)
  const [members, setMembers] = useState<EventMember[]>([])
  const [carpools, setCarpools] = useState<
    Array<Carpool & { acceptedCount: number }>
  >([])
  const [notices, setNotices] = useState<Notice[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showShareModal, setShowShareModal] = useState(false)
  const [copied, setCopied] = useState(false)
  const [kakaoPayLink, setKakaoPayLink] = useState('')
  const [noticeContent, setNoticeContent] = useState('')
  // 상태 관리를 기능별로 분리하여 동시에 여러 작업 처리 가능
  const [submittingPaymentId, setSubmittingPaymentId] = useState<string | null>(
    null
  )
  const [isCreatingCarpool, setIsCreatingCarpool] = useState(false)
  const [joiningCarpoolId, setJoiningCarpoolId] = useState<string | null>(null)
  const [isCreatingNotice, setIsCreatingNotice] = useState(false)
  const [deletingNoticeId, setDeletingNoticeId] = useState<string | null>(null)

  // 이벤트, 참여자, 카풀, 공지사항 정보 로드
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

        // 카풀 정보 조회
        const carpoolsResponse = await getCarpools(eventId)
        if (carpoolsResponse.success) {
          setCarpools(carpoolsResponse.data || [])
        }

        // 공지사항 조회
        const noticesResponse = await getNotices(eventId)
        if (noticesResponse.success) {
          setNotices(noticesResponse.data || [])
        }

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

  // 모달의 ESC 키 처리
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (showShareModal && e.key === 'Escape') {
        setShowShareModal(false)
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [showShareModal])

  // 참여 현황 계산
  const attendingCount = members.filter(m => m.status === 'ATTENDING').length
  const undecidedCount = members.filter(m => m.status === 'PENDING').length
  const notAttendingCount = members.filter(
    m => m.status === 'NOT_ATTENDING'
  ).length

  // 로딩 상태 - Skeleton 카드로 실제 레이아웃과 유사하게
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 pb-20 dark:bg-gray-950">
        <ManagePageHeader />
        <Container className="mt-4 space-y-4 py-4">
          {/* 이벤트 정보 카드 스켈레톤 */}
          <Card>
            <CardContent className="space-y-4 p-4">
              <Skeleton className="h-32 w-full rounded-lg" />
              <Skeleton className="h-6 w-3/4" />
              <div className="space-y-2 border-t border-b border-gray-100 py-4">
                <Skeleton className="h-4 w-1/2" />
                <Skeleton className="h-4 w-2/3" />
              </div>
              <div className="grid grid-cols-3 gap-2">
                <Skeleton className="h-16 rounded-lg" />
                <Skeleton className="h-16 rounded-lg" />
                <Skeleton className="h-16 rounded-lg" />
              </div>
              <div className="flex gap-2">
                <Skeleton className="h-9 flex-1 rounded-md" />
                <Skeleton className="h-9 flex-1 rounded-md" />
              </div>
            </CardContent>
          </Card>
          {/* 탭 스켈레톤 */}
          <Skeleton className="h-10 w-full rounded-lg" />
          {/* 탭 콘텐츠 스켈레톤 */}
          <div className="space-y-3">
            <Skeleton className="h-20 w-full rounded-lg" />
            <Skeleton className="h-20 w-full rounded-lg" />
            <Skeleton className="h-20 w-full rounded-lg" />
          </div>
        </Container>
      </div>
    )
  }

  // 에러 상태
  if (error || !event) {
    return (
      <div className="min-h-screen bg-gray-50 pb-20 dark:bg-gray-950">
        <ManagePageHeader />
        <Container className="mt-8">
          <ErrorState
            message={error || '이벤트를 찾을 수 없습니다.'}
            action={{
              label: '뒤로가기',
              onClick: () => router.back(),
            }}
          />
        </Container>
      </div>
    )
  }

  // 초대 링크 생성
  const getInviteLink = () => {
    if (!event) return ''
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
    return `${baseUrl}/join/${event.invite_code}`
  }

  // 초대 링크 복사
  const copyToClipboard = async () => {
    try {
      const link = getInviteLink()
      await navigator.clipboard.writeText(link)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
      toast.success('링크가 복사되었습니다.')
    } catch {
      toast.error('링크 복사에 실패했습니다.')
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-20 dark:bg-gray-950">
      <ManagePageHeader />

      {/* 이벤트 정보 카드 */}
      <Container className="py-4">
        <Card>
          <CardContent className="space-y-4 p-4">
            {/* 이미지 */}
            <div className="relative h-32 w-full overflow-hidden rounded-lg">
              <Image
                src={
                  event.image ||
                  'https://images.unsplash.com/photo-1552664730-d307ca884978?w=600&h=400&fit=crop'
                }
                alt={event.title}
                fill
                className="object-cover"
                priority
              />
            </div>

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
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="members">참여자</TabsTrigger>
            <TabsTrigger value="settlement">정산</TabsTrigger>
            <TabsTrigger value="carpool">카풀</TabsTrigger>
            <TabsTrigger value="notice">공지</TabsTrigger>
          </TabsList>

          {/* 참여자 탭 */}
          <TabsContent value="members" className="mt-4 space-y-4">
            {members.length === 0 ? (
              <EmptyState
                icon={<Users size={48} className="text-gray-300" />}
                title="아직 참여자가 없습니다"
                description="초대 링크를 공유하여 참여자를 초대해보세요."
              />
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
            {/* 정산 현황 */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">정산 현황</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="text-xs text-gray-600">1인당 금액</p>
                  <p className="mt-1 text-2xl font-bold text-emerald-600">
                    {calculatePricePerPerson(
                      event.fee,
                      attendingCount
                    ).toLocaleString()}
                    원
                  </p>
                </div>
                <div className="border-t border-gray-200 pt-4">
                  <div className="grid grid-cols-2 gap-2">
                    <div className="rounded-lg bg-emerald-50 p-3 text-center">
                      <p className="text-sm font-semibold text-emerald-700">
                        납부 완료
                      </p>
                      <p className="mt-1 text-2xl font-bold text-emerald-600">
                        {
                          members.filter(
                            m => m.status === 'ATTENDING' && m.has_paid
                          ).length
                        }
                      </p>
                    </div>
                    <div className="rounded-lg bg-red-50 p-3 text-center">
                      <p className="text-sm font-semibold text-red-700">
                        미납자
                      </p>
                      <p className="mt-1 text-2xl font-bold text-red-600">
                        {
                          members.filter(
                            m => m.status === 'ATTENDING' && !m.has_paid
                          ).length
                        }
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* 카카오페이 링크 */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">결제 정보</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="space-y-2">
                  <Label htmlFor="kakao-pay">카카오페이 링크</Label>
                  <div className="flex gap-2">
                    <Input
                      id="kakao-pay"
                      type="url"
                      placeholder="https://..."
                      value={kakaoPayLink}
                      onChange={e => setKakaoPayLink(e.target.value)}
                      className="text-sm"
                    />
                    <Button
                      size="sm"
                      onClick={async () => {
                        if (kakaoPayLink && event) {
                          try {
                            await navigator.clipboard.writeText(kakaoPayLink)
                            toast.success('카카오페이 링크가 복사되었습니다.')
                          } catch {
                            toast.error('링크 복사에 실패했습니다.')
                          }
                        }
                      }}
                    >
                      복사
                    </Button>
                  </div>
                  <p className="text-xs text-gray-500">
                    참여자들이 쉽게 접근할 수 있는 결제 링크를 입력하세요.
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* 미납자 목록 */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <AlertCircle size={18} className="text-red-600" />
                  미납자 목록
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {members.filter(m => m.status === 'ATTENDING' && !m.has_paid)
                  .length === 0 ? (
                  <div className="flex items-center justify-center gap-2 py-6 text-green-600">
                    <CheckCircle size={20} />
                    <p>모든 참석자가 납부를 완료했습니다!</p>
                  </div>
                ) : (
                  members
                    .filter(m => m.status === 'ATTENDING' && !m.has_paid)
                    .map(member => (
                      <div
                        key={member.id}
                        className="flex items-center justify-between rounded-lg border border-red-200 bg-red-50 px-3 py-2"
                      >
                        <div className="flex-1">
                          <p className="font-semibold text-gray-900">
                            {member.guest_name || 'Guest User'}
                          </p>
                          <p className="text-xs text-gray-600">
                            {event.fee.toLocaleString()}원
                          </p>
                        </div>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={async () => {
                            try {
                              setSubmittingPaymentId(member.id)
                              const result = await updatePaymentStatus({
                                eventId: event.id,
                                memberId: member.id,
                                hasPaid: true,
                              })
                              // 서버에서 사용자 인증을 검증합니다
                              if (result.success) {
                                setMembers(
                                  members.map(m =>
                                    m.id === member.id
                                      ? { ...m, has_paid: true }
                                      : m
                                  )
                                )
                                toast.success('납부 상태가 업데이트되었습니다.')
                              } else {
                                toast.error(
                                  result.error || '업데이트에 실패했습니다.'
                                )
                              }
                            } catch (err) {
                              toast.error(
                                err instanceof Error
                                  ? err.message
                                  : '오류가 발생했습니다.'
                              )
                            } finally {
                              setSubmittingPaymentId(null)
                            }
                          }}
                          disabled={submittingPaymentId === member.id}
                        >
                          {submittingPaymentId === member.id
                            ? '처리 중...'
                            : '완료'}
                        </Button>
                      </div>
                    ))
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* 카풀 탭 */}
          <TabsContent value="carpool" className="mt-4 space-y-4">
            {/* 운전자 등록 폼 */}
            <CarpoolForm
              onSubmit={async data => {
                if (!event) return
                try {
                  setIsCreatingCarpool(true)
                  const result = await createCarpool({
                    eventId: event.id,
                    seats: data.seats,
                    departure: data.departure,
                  })
                  // 서버에서 사용자 인증을 검증합니다
                  if (result.success && result.data) {
                    setCarpools([
                      { ...result.data, acceptedCount: 0 },
                      ...carpools,
                    ])
                    toast.success('카풀이 등록되었습니다.')
                  } else {
                    toast.error(result.error || '등록에 실패했습니다.')
                  }
                } catch (err) {
                  toast.error(
                    err instanceof Error ? err.message : '오류가 발생했습니다.'
                  )
                } finally {
                  setIsCreatingCarpool(false)
                }
              }}
              isLoading={isCreatingCarpool}
            />

            {/* 카풀 목록 */}
            {carpools.length === 0 ? (
              <EmptyState
                icon={<Users size={40} className="text-gray-300" />}
                title="등록된 카풀이 없습니다"
                description="위 양식으로 카풀을 등록하면 탑승 신청이 가능합니다."
              />
            ) : (
              carpools.map(carpool => (
                <Card key={carpool.id}>
                  <CardContent className="space-y-3 p-4">
                    {/* 카풀 정보 */}
                    <div>
                      <p className="text-sm text-gray-600">출발 장소</p>
                      <p className="font-semibold text-gray-900">
                        {carpool.departure}
                      </p>
                    </div>

                    {/* 정원 현황 */}
                    <div className="rounded-lg bg-blue-50 p-3">
                      <p className="mb-2 text-xs font-medium text-gray-600">
                        탑승 현황
                      </p>
                      <div className="flex items-center gap-2">
                        <div className="flex-1">
                          <div className="h-2 w-full rounded-full bg-gray-200">
                            <div
                              className="h-full rounded-full bg-emerald-500"
                              style={{
                                width: `${(carpool.acceptedCount / carpool.seats) * 100}%`,
                              }}
                            />
                          </div>
                        </div>
                        <span className="text-sm font-semibold text-gray-900">
                          {carpool.acceptedCount} / {carpool.seats}
                        </span>
                      </div>
                    </div>

                    {/* 액션 버튼 */}
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        className="flex-1 text-xs"
                        onClick={async () => {
                          try {
                            setJoiningCarpoolId(carpool.id)
                            const result = await joinCarpool({
                              carpoolId: carpool.id,
                            })
                            // 서버에서 사용자 인증을 검증합니다
                            if (result.success) {
                              toast.success('카풀 신청이 완료되었습니다.')
                            } else {
                              toast.error(
                                result.error || '신청에 실패했습니다.'
                              )
                            }
                          } catch (err) {
                            toast.error(
                              err instanceof Error
                                ? err.message
                                : '오류가 발생했습니다.'
                            )
                          } finally {
                            setJoiningCarpoolId(null)
                          }
                        }}
                        disabled={joiningCarpoolId === carpool.id}
                      >
                        {joiningCarpoolId === carpool.id
                          ? '신청 중...'
                          : '탑승 신청'}
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="flex-1 text-xs"
                      >
                        상세보기
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </TabsContent>
          {/* 공지사항 탭 */}
          <TabsContent value="notice" className="mt-4 space-y-4">
            {/* 공지사항 작성 폼 */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <MessageCircle size={18} />새 공지사항 작성
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="space-y-2">
                  <Label htmlFor="notice-content">내용</Label>
                  <textarea
                    id="notice-content"
                    placeholder="참석자들에게 전달할 공지사항을 입력하세요."
                    rows={3}
                    value={noticeContent}
                    onChange={e => setNoticeContent(e.target.value)}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-gray-900 focus:outline-none"
                  />
                </div>
                <Button
                  onClick={async () => {
                    if (!event || !noticeContent.trim()) return
                    try {
                      setIsCreatingNotice(true)
                      const result = await createNotice({
                        eventId: event.id,
                        content: noticeContent,
                      })
                      // 서버에서 사용자 인증을 검증합니다
                      if (result.success && result.data) {
                        setNotices([result.data, ...notices])
                        setNoticeContent('')
                        toast.success('공지사항이 작성되었습니다.')
                      } else {
                        toast.error(result.error || '작성에 실패했습니다.')
                      }
                    } catch (err) {
                      toast.error(
                        err instanceof Error
                          ? err.message
                          : '오류가 발생했습니다.'
                      )
                    } finally {
                      setIsCreatingNotice(false)
                    }
                  }}
                  disabled={isCreatingNotice || !noticeContent.trim()}
                  className="w-full"
                >
                  {isCreatingNotice ? '작성 중...' : '공지하기'}
                </Button>
              </CardContent>
            </Card>

            {/* 공지사항 목록 */}
            {notices.length === 0 ? (
              <EmptyState
                icon={<MessageCircle size={40} className="text-gray-300" />}
                title="아직 공지사항이 없습니다"
                description="참석자들에게 전달할 공지사항을 작성해보세요."
              />
            ) : (
              notices.map(notice => (
                <Card key={notice.id}>
                  <CardContent className="space-y-2 p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <p className="text-sm whitespace-pre-wrap text-gray-900">
                          {notice.content}
                        </p>
                        <p className="mt-2 text-xs text-gray-600">
                          {new Date(notice.created_at).toLocaleDateString(
                            'ko-KR',
                            {
                              month: 'short',
                              day: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit',
                            }
                          )}
                        </p>
                      </div>
                      <div className="flex gap-1">
                        <Button
                          size="sm"
                          variant="ghost"
                          disabled
                          title="수정 기능은 준비 중입니다."
                        >
                          <Edit2 size={16} />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={async () => {
                            if (!confirm('이 공지사항을 삭제하시겠습니까?')) {
                              return
                            }
                            try {
                              setDeletingNoticeId(notice.id)
                              const result = await deleteNotice(notice.id)
                              if (result.success) {
                                setNotices(
                                  notices.filter(n => n.id !== notice.id)
                                )
                                toast.success('삭제되었습니다.')
                              } else {
                                toast.error(
                                  result.error || '삭제에 실패했습니다.'
                                )
                              }
                            } catch (err) {
                              toast.error(
                                err instanceof Error
                                  ? err.message
                                  : '오류가 발생했습니다.'
                              )
                            } finally {
                              setDeletingNoticeId(null)
                            }
                          }}
                          disabled={deletingNoticeId === notice.id}
                        >
                          <Trash2 size={16} className="text-red-600" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </TabsContent>
        </Tabs>
      </Container>

      {/* 하단 탭 */}
      <BottomTab />

      {/* 초대 링크 공유 모달 */}
      {showShareModal && (
        <div className="fixed inset-0 z-50 flex items-end bg-black/50 dark:bg-black/70">
          <div className="w-full rounded-t-lg bg-white p-6 dark:bg-gray-900">
            {/* 헤더 */}
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-bold text-gray-900 dark:text-white">
                초대 링크 공유
              </h2>
              <button
                onClick={() => setShowShareModal(false)}
                className="text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300"
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
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                초대 링크
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  readOnly
                  value={getInviteLink()}
                  className="flex-1 rounded-lg border border-gray-300 bg-gray-50 px-4 py-2 text-sm text-gray-700 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-200"
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
              <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                공유 방법
              </p>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={async () => {
                    const link = getInviteLink()
                    const shareData = {
                      title: event?.title || '모임 초대',
                      text: `${event?.title} 모임에 참석해주세요!`,
                      url: link,
                    }

                    try {
                      // Web Share API 지원 확인
                      if (navigator.share) {
                        await navigator.share(shareData)
                        toast.success('공유되었습니다.')
                      } else {
                        // 폴백: 클립보드에 복사
                        await copyToClipboard()
                      }
                    } catch (err) {
                      // 사용자가 공유를 취소한 경우나 기타 오류
                      if (err instanceof Error && err.name !== 'AbortError') {
                        console.error('공유 실패:', err)
                        toast.error('공유에 실패했습니다.')
                      }
                    }
                  }}
                >
                  공유
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
                  X 공유
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
