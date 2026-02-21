'use server'

import { supabase } from '@/lib/supabase'
import {
  CreateEventMemberRequest,
  UpdateAttendanceRequest,
  ApiResponse,
} from '@/types/api'
import { Database } from '@/lib/supabase'

type EventMember = Database['public']['Tables']['event_members']['Row']

/**
 * 이벤트에 새 참여자 추가
 * 로그인 사용자 또는 게스트 참여 지원
 */
export async function createEventMember(
  data: CreateEventMemberRequest
): Promise<ApiResponse<EventMember>> {
  try {
    // 입력값 검증
    if (!data.eventId) {
      return {
        success: false,
        error: '이벤트 ID가 필요합니다.',
      }
    }

    if (!data.userId && !data.guestName) {
      return {
        success: false,
        error: '사용자 ID 또는 게스트 이름이 필요합니다.',
      }
    }

    // 참여자 추가
    const { data: member, error } = await supabase
      .from('event_members')
      .insert({
        event_id: data.eventId,
        user_id: data.userId || null,
        guest_name: data.guestName || null,
        status: data.status,
        has_paid: false,
      })
      .select()
      .single()

    if (error) {
      // 중복 참여자 확인
      if (error.code === '23505') {
        return {
          success: false,
          error: '이미 참여 중인 모임입니다.',
        }
      }
      return {
        success: false,
        error: `참여자 추가에 실패했습니다: ${error.message}`,
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
 * 참석 상태 업데이트
 * 사용자 또는 주최자만 수정 가능 (RLS에 의해 검증)
 */
export async function updateAttendance(
  data: UpdateAttendanceRequest
): Promise<ApiResponse<EventMember>> {
  try {
    // 입력값 검증
    if (!data.eventId || !data.memberId) {
      return {
        success: false,
        error: '이벤트 ID와 참여자 ID가 필요합니다.',
      }
    }

    // 참석 상태 업데이트
    const { data: member, error } = await supabase
      .from('event_members')
      .update({
        status: data.status,
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
        error: `참석 상태 업데이트에 실패했습니다: ${error.message}`,
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
 * 이벤트 참여자 목록 조회
 */
export async function getEventMembers(
  eventId: string,
  status?: string
): Promise<ApiResponse<EventMember[]>> {
  try {
    // 입력값 검증
    if (!eventId) {
      return {
        success: false,
        error: '이벤트 ID가 필요합니다.',
      }
    }

    let query = supabase
      .from('event_members')
      .select('*')
      .eq('event_id', eventId)

    // 상태 필터 적용 (선택사항)
    if (status) {
      query = query.eq('status', status)
    }

    const { data: members, error } = await query.order('created_at', {
      ascending: false,
    })

    if (error) {
      return {
        success: false,
        error: `참여자 목록 조회에 실패했습니다: ${error.message}`,
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
 * 참여자 제거
 * 주최자만 가능 (RLS에 의해 검증)
 */
export async function removeEventMember(
  eventId: string,
  memberId: string
): Promise<ApiResponse<null>> {
  try {
    // 입력값 검증
    if (!eventId || !memberId) {
      return {
        success: false,
        error: '이벤트 ID와 참여자 ID가 필요합니다.',
      }
    }

    const { error } = await supabase
      .from('event_members')
      .delete()
      .eq('id', memberId)
      .eq('event_id', eventId)

    if (error) {
      if (error.code === 'PGRST116') {
        return {
          success: false,
          error: '존재하지 않는 참여자입니다.',
        }
      }
      return {
        success: false,
        error: `참여자 제거에 실패했습니다: ${error.message}`,
      }
    }

    return {
      success: true,
      data: null,
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
 * 특정 참여자 조회
 */
export async function getEventMember(
  eventId: string,
  memberId: string
): Promise<ApiResponse<EventMember>> {
  try {
    // 입력값 검증
    if (!eventId || !memberId) {
      return {
        success: false,
        error: '이벤트 ID와 참여자 ID가 필요합니다.',
      }
    }

    const { data: member, error } = await supabase
      .from('event_members')
      .select('*')
      .eq('id', memberId)
      .eq('event_id', eventId)
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
        error: `참여자 조회에 실패했습니다: ${error.message}`,
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
