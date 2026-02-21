'use server'

import { getServerSession } from 'next-auth'
import { supabase } from '@/lib/supabase'
import { UpdatePaymentStatusRequest, ApiResponse } from '@/types/api'
import { Database } from '@/lib/supabase'

type Event = Database['public']['Tables']['events']['Row']
type EventMember = Database['public']['Tables']['event_members']['Row']

/**
 * 정산 현황 조회
 * 이벤트의 참여자별 납부 상태와 통계 반환
 */
export async function getSettlementSummary(eventId: string): Promise<
  ApiResponse<{
    event: Event
    members: EventMember[]
    totalFee: number
    pricePerPerson: number
    paidCount: number
    unpaidCount: number
    totalPaid: number
    totalUnpaid: number
  }>
> {
  try {
    // 입력값 검증
    if (!eventId) {
      return {
        success: false,
        error: '이벤트 ID가 필요합니다.',
      }
    }

    // 이벤트 정보 조회
    const { data: event, error: eventError } = await supabase
      .from('events')
      .select('*')
      .eq('id', eventId)
      .single()

    if (eventError) {
      if (eventError.code === 'PGRST116') {
        return {
          success: false,
          error: '존재하지 않는 모임입니다.',
        }
      }
      return {
        success: false,
        error: `이벤트 조회에 실패했습니다: ${eventError.message}`,
      }
    }

    // 참여자 정보 조회
    const { data: members, error: membersError } = await supabase
      .from('event_members')
      .select('*')
      .eq('event_id', eventId)
      .eq('status', 'ATTENDING')

    if (membersError) {
      return {
        success: false,
        error: `참여자 조회에 실패했습니다: ${membersError.message}`,
      }
    }

    const attendingMembers = members || []
    const totalFee = event.fee || 0
    const attendingCount = attendingMembers.length
    const pricePerPerson = attendingCount > 0 ? totalFee / attendingCount : 0

    const paidCount = attendingMembers.filter(m => m.has_paid).length
    const unpaidCount = attendingCount - paidCount
    const totalPaid = paidCount * pricePerPerson
    const totalUnpaid = unpaidCount * pricePerPerson

    return {
      success: true,
      data: {
        event,
        members: attendingMembers,
        totalFee,
        pricePerPerson: Math.round(pricePerPerson),
        paidCount,
        unpaidCount,
        totalPaid: Math.round(totalPaid),
        totalUnpaid: Math.round(totalUnpaid),
      },
    }
  } catch (error) {
    if (error instanceof Error) {
      return {
        success: false,
        error: error.message,
      }
    }
    return {
      success: false,
      error: '예상치 못한 오류가 발생했습니다.',
    }
  }
}

/**
 * 참여자 납부 상태 업데이트
 * 서버에서 검증된 사용자만 주최자인 경우에만 가능
 */
export async function updatePaymentStatus(
  data: UpdatePaymentStatusRequest
): Promise<ApiResponse<EventMember>> {
  try {
    // 서버 세션에서 인증된 사용자 ID 획득
    const session = await getServerSession()
    if (!session?.user?.id) {
      return {
        success: false,
        error: '로그인이 필요합니다.',
      }
    }

    const userId = session.user.id

    // 입력값 검증
    if (!data.eventId || !data.memberId) {
      return {
        success: false,
        error: '이벤트 ID와 참여자 ID가 필요합니다.',
      }
    }

    // 주최자 권한 검증
    const { data: event, error: eventError } = await supabase
      .from('events')
      .select('host_id')
      .eq('id', data.eventId)
      .single()

    if (eventError || !event) {
      return {
        success: false,
        error: '이벤트를 찾을 수 없습니다.',
      }
    }

    if (event.host_id !== userId) {
      return {
        success: false,
        error: '이벤트의 주최자만 납부 상태를 변경할 수 있습니다.',
      }
    }

    // 납부 상태 업데이트
    const { data: member, error } = await supabase
      .from('event_members')
      .update({
        has_paid: data.hasPaid,
        updated_at: new Date().toISOString(),
      })
      .eq('id', data.memberId)
      .eq('event_id', data.eventId)
      .select()
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        return {
          success: false,
          error: '존재하지 않는 참여자입니다.',
        }
      }
      return {
        success: false,
        error: `납부 상태 업데이트에 실패했습니다: ${error.message}`,
      }
    }

    return {
      success: true,
      data: member,
    }
  } catch (error) {
    if (error instanceof Error) {
      return {
        success: false,
        error: error.message,
      }
    }
    return {
      success: false,
      error: '예상치 못한 오류가 발생했습니다.',
    }
  }
}

/**
 * 한 번에 여러 참여자의 납부 상태 업데이트
 * 주최자만 가능
 */
export async function bulkUpdatePaymentStatus(
  eventId: string,
  updates: Array<{
    memberId: string
    hasPaid: boolean
  }>
): Promise<ApiResponse<EventMember[]>> {
  try {
    // 입력값 검증
    if (!eventId || !updates.length) {
      return {
        success: false,
        error: '이벤트 ID와 업데이트할 참여자 정보가 필요합니다.',
      }
    }

    // 각 참여자의 납부 상태를 개별적으로 업데이트
    const results = await Promise.all(
      updates.map(update =>
        supabase
          .from('event_members')
          .update({
            has_paid: update.hasPaid,
            updated_at: new Date().toISOString(),
          })
          .eq('id', update.memberId)
          .eq('event_id', eventId)
          .select()
          .single()
      )
    )

    // 에러 확인
    const errorResult = results.find(r => r.error)
    if (errorResult?.error) {
      return {
        success: false,
        error: `납부 상태 업데이트에 실패했습니다: ${errorResult.error.message}`,
      }
    }

    const updatedMembers = results
      .map(r => r.data)
      .filter(Boolean) as EventMember[]

    return {
      success: true,
      data: updatedMembers,
    }
  } catch (error) {
    if (error instanceof Error) {
      return {
        success: false,
        error: error.message,
      }
    }
    return {
      success: false,
      error: '예상치 못한 오류가 발생했습니다.',
    }
  }
}

/**
 * 미납자 목록 조회
 */
export async function getUnpaidMembers(
  eventId: string
): Promise<ApiResponse<EventMember[]>> {
  try {
    // 입력값 검증
    if (!eventId) {
      return {
        success: false,
        error: '이벤트 ID가 필요합니다.',
      }
    }

    // 미납자 조회 (참석 중이고 미납한 사람)
    const { data: members, error } = await supabase
      .from('event_members')
      .select('*')
      .eq('event_id', eventId)
      .eq('status', 'ATTENDING')
      .eq('has_paid', false)
      .order('created_at', { ascending: false })

    if (error) {
      return {
        success: false,
        error: `미납자 목록 조회에 실패했습니다: ${error.message}`,
      }
    }

    return {
      success: true,
      data: members || [],
    }
  } catch (error) {
    if (error instanceof Error) {
      return {
        success: false,
        error: error.message,
      }
    }
    return {
      success: false,
      error: '예상치 못한 오류가 발생했습니다.',
    }
  }
}

/**
 * 납부 완료 현황 통계
 */
export async function getPaymentStats(eventId: string): Promise<
  ApiResponse<{
    totalAttending: number
    paid: number
    unpaid: number
    paymentRate: number
  }>
> {
  try {
    // 입력값 검증
    if (!eventId) {
      return {
        success: false,
        error: '이벤트 ID가 필요합니다.',
      }
    }

    // 참석 중인 참여자 중 납부 상태 조회
    const { data: members, error } = await supabase
      .from('event_members')
      .select('has_paid')
      .eq('event_id', eventId)
      .eq('status', 'ATTENDING')

    if (error) {
      return {
        success: false,
        error: `납부 통계 조회에 실패했습니다: ${error.message}`,
      }
    }

    const memberList = members || []
    const totalAttending = memberList.length
    const paid = memberList.filter(m => m.has_paid).length
    const unpaid = totalAttending - paid
    const paymentRate = totalAttending > 0 ? (paid / totalAttending) * 100 : 0

    return {
      success: true,
      data: {
        totalAttending,
        paid,
        unpaid,
        paymentRate: Math.round(paymentRate),
      },
    }
  } catch (error) {
    if (error instanceof Error) {
      return {
        success: false,
        error: error.message,
      }
    }
    return {
      success: false,
      error: '예상치 못한 오류가 발생했습니다.',
    }
  }
}
