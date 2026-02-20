'use client'

import { useState } from 'react'
import { useParams } from 'next/navigation'
import { MapPin, Clock, Users, Share2, Settings } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Container } from '@/components/layout/container'
import { BottomTab } from '@/components/navigation/bottom-tab'
import { createCompleteMockEvent } from '@/lib/mock-data'

export default function ManagePage() {
  const params = useParams()
  const [activeTab, setActiveTab] = useState('members')

  // 목 데이터 생성 (임시 - 실제로는 Server Action으로 페칭)
  // params.id를 seed로 사용하여 같은 id에서는 항상 같은 데이터 생성
  const eventId = Array.isArray(params.id) ? params.id[0] : params.id
  const seed = parseInt(eventId) || 1
  const mockData = createCompleteMockEvent(undefined, seed)
  const event = {
    id: eventId,
    title: mockData.event.title,
    date: mockData.event.date,
    location: mockData.event.location,
    fee: mockData.event.fee,
    status: mockData.event.status,
    image: mockData.event.image,
  }

  const members = mockData.members.map(member => ({
    id: member.id,
    name: member.guestName || 'Guest User',
    status: member.status,
    hasPaid: member.hasPaid,
    role: 'MEMBER' as const,
  }))

  const attendingCount = members.filter(m => m.status === 'ATTENDING').length
  const pendingCount = members.filter(m => m.status === 'PENDING').length
  const absentCount = members.filter(m => m.status === 'ABSENT').length

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* 뒤로가기 헤더 */}
      <div className="sticky top-0 z-10 border-b border-gray-200 bg-white">
        <Container className="flex items-center justify-between py-3">
          <button className="-ml-2 rounded-lg p-2 hover:bg-gray-100">
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
              src={event.image}
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
                <span>{event.date.toLocaleDateString('ko-KR')}</span>
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
                  {pendingCount}
                </p>
                <p className="text-xs text-gray-600">미정</p>
              </div>
              <div className="rounded-lg bg-red-50 p-3 text-center">
                <p className="text-2xl font-bold text-red-600">{absentCount}</p>
                <p className="text-xs text-gray-600">불참</p>
              </div>
            </div>

            {/* 액션 버튼 */}
            <div className="flex gap-2">
              <Button variant="outline" className="flex-1" disabled>
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
            {members.map(member => (
              <Card key={member.id}>
                <CardContent className="flex items-center justify-between p-4">
                  <div className="flex-1">
                    <p className="font-semibold text-gray-900">{member.name}</p>
                    <p className="mt-1 text-xs text-gray-600">
                      {member.status === 'ATTENDING'
                        ? '참석'
                        : member.status === 'PENDING'
                          ? '미정'
                          : '불참'}
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
                    {member.hasPaid ? '납부완료' : '미납'}
                  </Badge>
                </CardContent>
              </Card>
            ))}
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
                {members
                  .filter(m => m.status === 'ATTENDING' && !m.hasPaid)
                  .map(member => (
                    <div
                      key={member.id}
                      className="flex justify-between border-b border-gray-200 py-2"
                    >
                      <span className="text-gray-900">{member.name}</span>
                      <span className="font-semibold text-red-600">
                        {event.fee.toLocaleString()}원
                      </span>
                    </div>
                  ))}
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
    </div>
  )
}
