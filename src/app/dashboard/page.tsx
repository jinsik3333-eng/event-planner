'use client'

import Link from 'next/link'
import { Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { EventCard } from '@/components/event/event-card'
import { BottomTab } from '@/components/navigation/bottom-tab'
import { Container } from '@/components/layout/container'

// 주최자 대시보드 페이지
export default function DashboardPage() {
  // TODO: 실제 데이터 페칭 로직
  const myEvents = [
    {
      id: '1',
      title: '주간 러닝 크루',
      image:
        'https://images.unsplash.com/photo-1461896836934-ffe607ba8211?w=500&h=400&fit=crop',
      date: new Date('2026-02-28T07:00:00'),
      location: '한강공원 여의도',
      currentAttendees: 23,
      maxAttendees: 50,
      fee: 0,
      status: 'RECRUITING' as const,
      isNew: true,
    },
    {
      id: '2',
      title: '독서 모임 - 장편소설',
      image:
        'https://images.unsplash.com/photo-1507842217343-583f20270319?w=500&h=400&fit=crop',
      date: new Date('2026-03-05T19:00:00'),
      location: '서울시 강남구 카페',
      currentAttendees: 8,
      maxAttendees: 15,
      fee: 5000,
      status: 'RECRUITING' as const,
    },
    {
      id: '3',
      title: '지난 달 축제',
      image:
        'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=500&h=400&fit=crop',
      date: new Date('2026-01-15T18:00:00'),
      location: '한강공원',
      currentAttendees: 42,
      maxAttendees: 50,
      fee: 15000,
      status: 'ENDED' as const,
    },
  ]

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* 헤더 */}
      <div className="sticky top-0 z-10 border-b border-gray-200 bg-white">
        <Container className="py-3">
          <div className="flex items-center justify-between">
            <h1 className="text-lg font-bold text-gray-900">내 모임</h1>
            <div className="flex items-center gap-2">
              <button className="rounded-lg p-2 hover:bg-gray-100">
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
                    d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
                  />
                </svg>
              </button>
              <button className="rounded-lg p-2 hover:bg-gray-100">
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
                    d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                  />
                </svg>
              </button>
            </div>
          </div>
        </Container>
      </div>

      {/* 컨텐츠 */}
      <Container className="space-y-6 py-6">
        {/* CTA 버튼 */}
        <Link href="/events/new">
          <Button className="h-12 w-full bg-emerald-600 text-base font-bold text-white hover:bg-emerald-700">
            <Plus size={20} className="mr-2" />새 모임 만들기
          </Button>
        </Link>

        {/* 주최 중인 모임 */}
        <section>
          <h2 className="mb-4 text-base font-bold text-gray-900">
            주최 중인 모임
          </h2>
          <div className="space-y-4">
            {myEvents
              .filter(e => e.status !== 'ENDED')
              .map(event => (
                <Link key={event.id} href={`/events/${event.id}/manage`}>
                  <EventCard {...event} />
                </Link>
              ))}
          </div>
        </section>

        {/* 지난 모임 */}
        <section>
          <h2 className="mb-4 text-base font-bold text-gray-900">지난 모임</h2>
          <div className="space-y-4">
            {myEvents
              .filter(e => e.status === 'ENDED')
              .map(event => (
                <Link key={event.id} href={`/events/${event.id}`}>
                  <EventCard {...event} />
                </Link>
              ))}
          </div>
        </section>
      </Container>

      {/* 하단 탭 네비게이션 */}
      <BottomTab />
    </div>
  )
}
