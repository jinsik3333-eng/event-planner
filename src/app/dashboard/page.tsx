'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { EventCard } from '@/components/event/event-card'
import { BottomTab } from '@/components/navigation/bottom-tab'
import { Container } from '@/components/layout/container'
import { listUserEvents } from '@/actions/events'
import { Database } from '@/lib/supabase'

type Event = Database['public']['Tables']['events']['Row']

interface EventItem {
  id: string
  title: string
  date: Date
  location: string
  fee: number
  status: 'RECRUITING' | 'CONFIRMED' | 'ENDED'
  currentAttendees: number
  maxAttendees: number | null
}

// 주최자 대시보드 페이지
export default function DashboardPage() {
  const [hostedEvents, setHostedEvents] = useState<EventItem[]>([])
  const [participatingEvents, setParticipatingEvents] = useState<EventItem[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    // TODO: Task 006 완료 후 useSession()으로 실제 사용자 ID 가져오기
    // 현재는 테스트용 더미 ID 사용
    const testUserId = 'test-user-id'

    loadEvents(testUserId)
  }, [])

  async function loadEvents(userId: string) {
    try {
      setIsLoading(true)
      const response = await listUserEvents(userId)

      if (!response.success || !response.data) {
        setError(response.error || '모임 목록을 불러올 수 없습니다.')
        return
      }

      // 데이터 변환
      const transformEvent = (event: Event, currentAttendees: number) => {
        // 데이터베이스의 COMPLETED를 컴포넌트의 ENDED로 변환
        const status = event.status === 'COMPLETED' ? 'ENDED' : event.status
        return {
          id: event.id,
          title: event.title,
          date: new Date(event.date),
          location: event.location,
          fee: event.fee,
          status: status as 'RECRUITING' | 'CONFIRMED' | 'ENDED',
          currentAttendees,
          maxAttendees: event.max_attendees,
        }
      }

      setHostedEvents(
        (response.data.hosted as Event[]).map((event) =>
          transformEvent(event, Math.floor(Math.random() * 20) + 1),
        ),
      )
      setParticipatingEvents(
        (response.data.participating as Event[]).map((event) =>
          transformEvent(event, Math.floor(Math.random() * 20) + 1),
        ),
      )
      setError(null)
    } catch (err) {
      const message =
        err instanceof Error ? err.message : '알 수 없는 오류가 발생했습니다.'
      setError(message)
      console.error('Failed to load events:', err)
    } finally {
      setIsLoading(false)
    }
  }

  const myEvents = hostedEvents

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
        {/* 에러 메시지 */}
        {error && (
          <div className="rounded-lg bg-red-50 p-4 text-sm text-red-600">
            {error}
          </div>
        )}

        {/* 로딩 상태 */}
        {isLoading && (
          <div className="flex items-center justify-center py-12">
            <div className="text-center text-gray-600">
              <div className="mb-4 h-8 w-8 animate-spin rounded-full border-4 border-gray-200 border-t-emerald-600"></div>
              <p>모임 목록을 불러오는 중입니다...</p>
            </div>
          </div>
        )}

        {/* CTA 버튼 */}
        {!isLoading && (
          <Link href="/events/new">
            <Button className="h-12 w-full bg-emerald-600 text-base font-bold text-white hover:bg-emerald-700">
              <Plus size={20} className="mr-2" />새 모임 만들기
            </Button>
          </Link>
        )}

        {/* 주최 중인 모임 */}
        {!isLoading && (
          <section>
            <h2 className="mb-4 text-base font-bold text-gray-900">
              주최 중인 모임
            </h2>
            <div className="space-y-4">
              {myEvents.filter((e) => e.status !== 'COMPLETED').length === 0 ? (
                <div className="flex flex-col items-center justify-center rounded-lg border border-gray-200 bg-gray-50 py-12">
                  <p className="text-gray-600">
                    아직 생성한 모임이 없습니다.
                  </p>
                  <p className="mt-2 text-sm text-gray-500">
                    위의 버튼을 눌러 새 모임을 만들어보세요.
                  </p>
                </div>
              ) : (
                myEvents
                  .filter((e) => e.status !== 'COMPLETED')
                  .map((event) => (
                    <Link
                      key={event.id}
                      href={`/events/${event.id}/manage`}
                    >
                      <EventCard {...event} />
                    </Link>
                  ))
              )}
            </div>
          </section>
        )}

        {/* 참여 중인 모임 */}
        {!isLoading && participatingEvents.length > 0 && (
          <section>
            <h2 className="mb-4 text-base font-bold text-gray-900">
              참여 중인 모임
            </h2>
            <div className="space-y-4">
              {participatingEvents
                .filter((e) => e.status !== 'COMPLETED')
                .map((event) => (
                  <Link key={event.id} href={`/events/${event.id}`}>
                    <EventCard {...event} />
                  </Link>
                ))}
            </div>
          </section>
        )}

        {/* 지난 모임 */}
        {!isLoading && myEvents.filter((e) => e.status === 'COMPLETED').length > 0 && (
          <section>
            <h2 className="mb-4 text-base font-bold text-gray-900">지난 모임</h2>
            <div className="space-y-4">
              {myEvents
                .filter((e) => e.status === 'COMPLETED')
                .map((event) => (
                  <Link key={event.id} href={`/events/${event.id}`}>
                    <EventCard {...event} />
                  </Link>
                ))}
            </div>
          </section>
        )}
      </Container>

      {/* 하단 탭 네비게이션 */}
      <BottomTab />
    </div>
  )
}
