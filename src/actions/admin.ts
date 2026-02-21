'use server'

import { getServerSession } from 'next-auth'
import { supabase } from '@/lib/supabase'
import { ApiResponse } from '@/types/api'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'

/**
 * 관리자 통계 데이터
 */
export interface AdminStats {
  totalEvents: number
  activeUsers: number
  thisMonthRevenue: number
  totalRevenue: number
}

/**
 * 관리자용 모임 목록 항목
 */
export interface AdminEventItem {
  id: string
  title: string
  hostId: string
  hostName: string
  date: string
  location: string
  fee: number
  maxAttendees: number | null
  attendeeCount: number
  revenue: number
  status: string
  createdAt: string
}

/**
 * 관리자 권한 검증
 */
async function checkAdminAccess(): Promise<boolean> {
  const session = await getServerSession(authOptions)
  return !!session?.user?.isAdmin
}

/**
 * 관리자 통계 조회
 * 전체 모임 수, 활성 사용자 수, 매출 통계
 */
export async function getAdminStats(): Promise<ApiResponse<AdminStats>> {
  try {
    // 관리자 권한 검증
    const isAdmin = await checkAdminAccess()
    if (!isAdmin) {
      return {
        success: false,
        error: '관리자 권한이 필요합니다.',
      }
    }

    // 1. 전체 모임 수
    const { count: totalEvents, error: eventsError } = await supabase
      .from('events')
      .select('id', { count: 'exact' })

    if (eventsError) {
      throw new Error(`모임 수 조회 실패: ${eventsError.message}`)
    }

    // 2. 활성 사용자 수 (최근 30일 내 참여 활동이 있는 사용자)
    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

    const { count: activeUsers, error: usersError } = await supabase
      .from('event_members')
      .select('user_id', { count: 'exact' })
      .gte('created_at', thirtyDaysAgo.toISOString())

    if (usersError) {
      throw new Error(`활성 사용자 수 조회 실패: ${usersError.message}`)
    }

    // 3. 이번달 매출 (이번달에 생성된 모임의 매출)
    const now = new Date()
    const monthStart = new Date(
      now.getFullYear(),
      now.getMonth(),
      1
    ).toISOString()

    const { data: monthlyEvents, error: monthlyError } = await supabase
      .from('events')
      .select('id, fee')
      .gte('created_at', monthStart)

    if (monthlyError) {
      throw new Error(`이번달 매출 조회 실패: ${monthlyError.message}`)
    }

    // 이번달 매출 계산 (모임별 fee * 참석자수)
    let thisMonthRevenue = 0

    if (monthlyEvents && monthlyEvents.length > 0) {
      for (const event of monthlyEvents) {
        const { count: attendees } = await supabase
          .from('event_members')
          .select('id', { count: 'exact' })
          .eq('event_id', event.id)
          .eq('status', 'ATTENDING')

        if (attendees) {
          thisMonthRevenue += (event.fee || 0) * attendees
        }
      }
    }

    // 4. 누적 매출
    const { data: allEvents, error: allError } = await supabase
      .from('events')
      .select('id, fee')

    if (allError) {
      throw new Error(`누적 매출 조회 실패: ${allError.message}`)
    }

    let totalRevenue = 0

    if (allEvents && allEvents.length > 0) {
      for (const event of allEvents) {
        const { count: attendees } = await supabase
          .from('event_members')
          .select('id', { count: 'exact' })
          .eq('event_id', event.id)
          .eq('status', 'ATTENDING')

        if (attendees) {
          totalRevenue += (event.fee || 0) * attendees
        }
      }
    }

    return {
      success: true,
      data: {
        totalEvents: totalEvents || 0,
        activeUsers: activeUsers || 0,
        thisMonthRevenue,
        totalRevenue,
      },
    }
  } catch (error) {
    console.error('Admin stats error:', error)
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : '통계 조회 중 오류가 발생했습니다.',
    }
  }
}

/**
 * 관리자용 모임 목록 조회 (필터링, 정렬 가능)
 */
export async function getAdminEvents(options?: {
  status?: string
  sortBy?: 'date' | 'revenue' | 'attendees'
  order?: 'asc' | 'desc'
  limit?: number
  offset?: number
}): Promise<ApiResponse<AdminEventItem[]>> {
  try {
    // 관리자 권한 검증
    const isAdmin = await checkAdminAccess()
    if (!isAdmin) {
      return {
        success: false,
        error: '관리자 권한이 필요합니다.',
      }
    }

    const limit = options?.limit || 50
    const offset = options?.offset || 0
    let query = supabase.from('events').select(
      `
        id,
        title,
        host_id,
        date,
        location,
        fee,
        max_attendees,
        status,
        created_at,
        users!events_host_id_fkey (
          name
        )
      `
    )

    // 상태 필터
    if (options?.status) {
      query = query.eq('status', options.status)
    }

    // 정렬
    const sortColumn = options?.sortBy === 'date' ? 'date' : 'created_at'
    const sortOrder = options?.order === 'asc'
    query = query.order(sortColumn, { ascending: sortOrder })

    // 페이지네이션
    query = query.range(offset, offset + limit - 1)

    const { data: events, error } = await query

    if (error) {
      throw new Error(`모임 목록 조회 실패: ${error.message}`)
    }

    if (!events) {
      return {
        success: true,
        data: [],
      }
    }

    // 각 모임의 참석자 수와 매출 계산
    const adminEvents: AdminEventItem[] = []

    for (const event of events) {
      const { count: attendeeCount } = await supabase
        .from('event_members')
        .select('id', { count: 'exact' })
        .eq('event_id', event.id)
        .eq('status', 'ATTENDING')

      const revenue = (event.fee || 0) * (attendeeCount || 0)

      const hostName =
        (event.users && typeof event.users === 'object' && 'name' in event.users
          ? (event.users as Record<string, unknown>).name
          : '알 수 없음') || '알 수 없음'

      adminEvents.push({
        id: event.id,
        title: event.title,
        hostId: event.host_id,
        hostName: String(hostName),
        date: event.date,
        location: event.location,
        fee: event.fee || 0,
        maxAttendees: event.max_attendees,
        attendeeCount: attendeeCount || 0,
        revenue,
        status: event.status,
        createdAt: event.created_at,
      })
    }

    return {
      success: true,
      data: adminEvents,
    }
  } catch (error) {
    console.error('Admin events error:', error)
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : '모임 목록 조회 중 오류가 발생했습니다.',
    }
  }
}
