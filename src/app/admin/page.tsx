'use client'

import { BarChart3, Users, Calendar, Wallet, Car, LogOut } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Container } from '@/components/layout/container'

// 관리자 대시보드 (데스크톱 전용)
export default function AdminPage() {
  // 목 데이터 생성 (임시 - 실제로는 Server Action으로 페칭)
  // 고정 seed를 사용하여 hydration 문제 방지
  const mockEvents = Array.from({ length: 5 }, (_, i) => {
    const seed = 2000 + i
    return {
      id: `admin-event-${i + 1}`,
      title: `모임_${seed % 10000}`,
      description: '즐거운 모임입니다.',
      hostId: `host-${i + 1}`,
      date: new Date(Date.now() + (i + 7) * 24 * 60 * 60 * 1000),
      location: '서울시 강남구',
      fee: (i % 5) * 10000,
      maxAttendees: 20 + i * 5,
      status: 'RECRUITING',
      inviteCode: `CODE${i + 1}`,
      image: 'https://via.placeholder.com/400x200?text=Event',
      createdAt: new Date(),
      updatedAt: new Date(),
    }
  })

  const stats = {
    totalEvents: 345,
    activeUsers: 1200,
    thisMonthRevenue: 1500000,
    totalRevenue: 12500000,
  }

  const recentEvents = mockEvents.map((event, idx) => ({
    id: event.id,
    title: event.title,
    attendees: 5 + idx * 4,
    maxAttendees: event.maxAttendees || 50,
    revenue: event.fee * (5 + idx * 4),
    status: idx % 2 === 0 ? 'RECRUITING' : 'CONFIRMED',
  }))

  return (
    <div className="hidden min-h-screen w-full !max-w-none bg-gray-100 md:flex">
      {/* 왼쪽 사이드바 */}
      <div className="flex w-64 flex-col bg-gray-900 text-white">
        <div className="border-b border-gray-800 p-6">
          <h1 className="text-2xl font-bold">Moim</h1>
          <p className="mt-1 text-xs text-gray-400">관리자 대시보드</p>
        </div>

        <nav className="flex-1 space-y-2 p-4">
          <NavItem icon={BarChart3} label="통계" active />
          <NavItem icon={Calendar} label="모임 관리" />
          <NavItem icon={Users} label="사용자" />
          <NavItem icon={Wallet} label="정산" />
          <NavItem icon={Car} label="카풀" />
        </nav>

        <div className="border-t border-gray-800 p-4">
          <Button
            variant="outline"
            className="w-full border-gray-700 text-white hover:bg-gray-800"
          >
            <LogOut size={18} className="mr-2" />
            로그아웃
          </Button>
        </div>
      </div>

      {/* 메인 콘텐츠 */}
      <div className="flex-1 overflow-auto">
        {/* 상단바 */}
        <div className="sticky top-0 z-10 border-b border-gray-200 bg-white">
          <Container
            size="xl"
            className="flex items-center justify-between py-4"
          >
            <h2 className="text-xl font-bold text-gray-900">대시보드</h2>
            <div className="flex items-center gap-4">
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
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-600 font-bold text-white">
                A
              </div>
            </div>
          </Container>
        </div>

        {/* 콘텐츠 영역 */}
        <div className="space-y-8 p-8">
          {/* 주요 지표 */}
          <div>
            <h3 className="mb-4 text-lg font-bold text-gray-900">주요 지표</h3>
            <div className="grid grid-cols-4 gap-4">
              <StatCard
                title="총 모임"
                value={stats.totalEvents}
                icon={Calendar}
                color="bg-blue-50"
                iconColor="text-blue-600"
              />
              <StatCard
                title="활성 사용자"
                value={stats.activeUsers}
                icon={Users}
                color="bg-emerald-50"
                iconColor="text-emerald-600"
              />
              <StatCard
                title="이번달 매출"
                value={`${(stats.thisMonthRevenue / 1000000).toFixed(1)}만원`}
                icon={Wallet}
                color="bg-amber-50"
                iconColor="text-amber-600"
              />
              <StatCard
                title="누적 매출"
                value={`${(stats.totalRevenue / 1000000).toFixed(1)}만원`}
                icon={Wallet}
                color="bg-purple-50"
                iconColor="text-purple-600"
              />
            </div>
          </div>

          {/* 최근 모임 */}
          <div>
            <h3 className="mb-4 text-lg font-bold text-gray-900">최근 모임</h3>
            <Card>
              <CardHeader>
                <CardTitle className="text-base">모임 목록</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="border-b border-gray-200 bg-gray-50">
                      <tr>
                        <th className="px-4 py-3 text-left font-semibold text-gray-700">
                          모임명
                        </th>
                        <th className="px-4 py-3 text-left font-semibold text-gray-700">
                          참석
                        </th>
                        <th className="px-4 py-3 text-left font-semibold text-gray-700">
                          정원
                        </th>
                        <th className="px-4 py-3 text-left font-semibold text-gray-700">
                          매출
                        </th>
                        <th className="px-4 py-3 text-left font-semibold text-gray-700">
                          상태
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {recentEvents.map(event => (
                        <tr
                          key={event.id}
                          className="border-b border-gray-200 hover:bg-gray-50"
                        >
                          <td className="px-4 py-3 font-medium text-gray-900">
                            {event.title}
                          </td>
                          <td className="px-4 py-3 text-gray-600">
                            {event.attendees}명
                          </td>
                          <td className="px-4 py-3 text-gray-600">
                            {event.maxAttendees}명
                          </td>
                          <td className="px-4 py-3 font-medium text-gray-900">
                            {event.revenue.toLocaleString()}원
                          </td>
                          <td className="px-4 py-3">
                            <span
                              className={`inline-block rounded-full px-3 py-1 text-xs font-semibold ${
                                event.status === 'RECRUITING'
                                  ? 'bg-emerald-100 text-emerald-700'
                                  : 'bg-blue-100 text-blue-700'
                              }`}
                            >
                              {event.status === 'RECRUITING'
                                ? '모집 중'
                                : '확정'}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}

// 네비게이션 아이템
interface NavItemProps {
  icon: React.ComponentType<{ size: number; className?: string }>
  label: string
  active?: boolean
}

function NavItem({ icon: Icon, label, active }: NavItemProps) {
  return (
    <button
      className={`flex w-full items-center gap-3 rounded-lg px-4 py-3 font-medium transition-colors ${
        active
          ? 'bg-emerald-600 text-white'
          : 'text-gray-400 hover:bg-gray-800 hover:text-white'
      }`}
    >
      <Icon size={20} />
      {label}
    </button>
  )
}

// 통계 카드
interface StatCardProps {
  title: string
  value: string | number
  icon: React.ComponentType<{ size: number; className?: string }>
  color: string
  iconColor: string
}

function StatCard({
  title,
  value,
  icon: Icon,
  color,
  iconColor,
}: StatCardProps) {
  return (
    <Card className={color}>
      <CardContent className="pt-6">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600">{title}</p>
            <p className="mt-2 text-2xl font-bold text-gray-900">{value}</p>
          </div>
          <Icon size={24} className={iconColor} />
        </div>
      </CardContent>
    </Card>
  )
}
