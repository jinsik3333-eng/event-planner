'use server'

import { nanoid } from 'nanoid'
import { revalidatePath } from 'next/cache'
import { supabase } from '@/lib/supabase'
import { createEventSchema, updateEventSchema } from '@/types/schemas'
import {
  CreateEventRequest,
  UpdateEventRequest,
  ApiResponse,
  GetEventResponse,
} from '@/types/api'
import { Database } from '@/lib/supabase'
import { selectImageByTitle } from '@/lib/image-selector'

type Event = Database['public']['Tables']['events']['Row']

/**
 * 새 이벤트 생성
 * 초대코드는 nanoid로 자동 생성됨
 */
export async function createEvent(
  hostId: string,
  data: CreateEventRequest
): Promise<ApiResponse<Event>> {
  try {
    // 입력값 검증
    const validated = createEventSchema.parse(data)

    // 초대코드 생성 (9자 길이의 URL-safe 문자열)
    const inviteCode = nanoid(9)

    // 제목에 따라 이미지 자동 선택
    const imageUrl = selectImageByTitle(validated.title)

    // Supabase에 이벤트 생성
    const { data: event, error } = await supabase
      .from('events')
      .insert({
        host_id: hostId,
        title: validated.title,
        description: validated.description || null,
        date: validated.date,
        location: validated.location,
        fee: validated.fee,
        max_attendees: validated.maxAttendees || null,
        invite_code: inviteCode,
        image_url: imageUrl,
        status: 'RECRUITING',
      })
      .select()
      .single()

    if (error) {
      return {
        success: false,
        error: `이벤트 생성에 실패했습니다: ${error.message}`,
      }
    }

    // 대시보드 캐시 무효화 (새 이벤트 생성 후 목록 갱신)
    revalidatePath('/dashboard')

    return {
      success: true,
      data: event,
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
 * 단일 이벤트 조회
 * RLS 정책에 의해 자동으로 권한 검증됨
 */
export async function getEvent(
  eventId: string
): Promise<ApiResponse<GetEventResponse>> {
  try {
    // 이벤트 기본 정보 조회
    const { data: event, error } = await supabase
      .from('events')
      .select('*')
      .eq('id', eventId)
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        return {
          success: false,
          error: '존재하지 않는 모임입니다.',
        }
      }
      return {
        success: false,
        error: `이벤트 조회에 실패했습니다: ${error.message}`,
      }
    }

    // 참여자 통계 조회
    const { data: members, error: membersError } = await supabase
      .from('event_members')
      .select('status, has_paid')
      .eq('event_id', eventId)

    if (membersError) {
      return {
        success: false,
        error: `참여자 정보 조회에 실패했습니다: ${membersError.message}`,
      }
    }

    // 통계 계산
    const attendingCount =
      members?.filter(m => m.status === 'ATTENDING').length || 0
    const notAttendingCount =
      members?.filter(m => m.status === 'NOT_ATTENDING').length || 0
    const undecidedCount =
      members?.filter(m => m.status === 'PENDING').length || 0
    const paidCount = members?.filter(m => m.has_paid).length || 0
    const unpaidCount = members?.filter(m => !m.has_paid).length || 0

    return {
      success: true,
      data: {
        ...event,
        attendingCount,
        notAttendingCount,
        undecidedCount,
        paidCount,
        unpaidCount,
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
 * 이벤트 정보 수정
 * 주최자만 수정 가능 (RLS에 의해 자동 검증)
 */
export async function updateEvent(
  eventId: string,
  data: UpdateEventRequest
): Promise<ApiResponse<Event>> {
  try {
    // ID 제거 후 검증
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { id, ...updateData } = data
    const validated = updateEventSchema.parse(updateData)

    // 업데이트할 필드만 선택
    const updatePayload: Partial<Event> = {}
    if (validated.title) updatePayload.title = validated.title
    if (validated.description !== undefined)
      updatePayload.description = validated.description
    if (validated.date) updatePayload.date = validated.date
    if (validated.location) updatePayload.location = validated.location
    if (validated.fee !== undefined) updatePayload.fee = validated.fee
    if (validated.maxAttendees !== undefined)
      updatePayload.max_attendees = validated.maxAttendees

    // Supabase에 업데이트
    const { data: event, error } = await supabase
      .from('events')
      .update(updatePayload)
      .eq('id', eventId)
      .select()
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        return {
          success: false,
          error: '존재하지 않는 모임입니다.',
        }
      }
      if (error.message.includes('403')) {
        return {
          success: false,
          error: '이 모임을 수정할 권한이 없습니다.',
        }
      }
      return {
        success: false,
        error: `이벤트 수정에 실패했습니다: ${error.message}`,
      }
    }

    return {
      success: true,
      data: event,
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
 * 이벤트 삭제
 * 주최자만 삭제 가능 (RLS에 의해 자동 검증)
 */
export async function deleteEvent(eventId: string): Promise<ApiResponse<null>> {
  try {
    const { error } = await supabase.from('events').delete().eq('id', eventId)

    if (error) {
      if (error.code === 'PGRST116') {
        return {
          success: false,
          error: '존재하지 않는 모임입니다.',
        }
      }
      if (error.message.includes('403')) {
        return {
          success: false,
          error: '이 모임을 삭제할 권한이 없습니다.',
        }
      }
      return {
        success: false,
        error: `이벤트 삭제에 실패했습니다: ${error.message}`,
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
 * 사용자가 주최 또는 참여 중인 모임 목록 조회
 */
export async function listUserEvents(userId: string): Promise<
  ApiResponse<{
    hosted: Event[]
    participating: Event[]
  }>
> {
  try {
    // 주최한 이벤트
    const { data: hostedEvents, error: hostedError } = await supabase
      .from('events')
      .select('*')
      .eq('host_id', userId)
      .order('created_at', { ascending: false })

    if (hostedError) {
      return {
        success: false,
        error: `주최 모임 조회에 실패했습니다: ${hostedError.message}`,
      }
    }

    // 참여 중인 이벤트
    const { data: participatingMembers, error: membersError } = await supabase
      .from('event_members')
      .select('event_id')
      .eq('user_id', userId)

    if (membersError) {
      return {
        success: false,
        error: `참여 모임 조회에 실패했습니다: ${membersError.message}`,
      }
    }

    const participatingEventIds =
      participatingMembers?.map(m => m.event_id) || []

    let participatingEvents: Event[] = []
    if (participatingEventIds.length > 0) {
      const { data: events, error: eventsError } = await supabase
        .from('events')
        .select('*')
        .in('id', participatingEventIds)
        .order('created_at', { ascending: false })

      if (eventsError) {
        return {
          success: false,
          error: `참여 모임 상세 조회에 실패했습니다: ${eventsError.message}`,
        }
      }

      participatingEvents = events || []
    }

    return {
      success: true,
      data: {
        hosted: hostedEvents || [],
        participating: participatingEvents,
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
 * 초대코드로 이벤트 조회
 * 게스트도 접근 가능 (로그인 불필요)
 */
export async function getEventByInviteCode(
  inviteCode: string
): Promise<ApiResponse<GetEventResponse>> {
  try {
    // 초대코드로 이벤트 조회
    const { data: event, error } = await supabase
      .from('events')
      .select('*')
      .eq('invite_code', inviteCode)
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        return {
          success: false,
          error: '존재하지 않는 초대 코드입니다.',
        }
      }
      return {
        success: false,
        error: `이벤트 조회에 실패했습니다: ${error.message}`,
      }
    }

    // 참여자 통계 조회
    const { data: members, error: membersError } = await supabase
      .from('event_members')
      .select('status, has_paid')
      .eq('event_id', event.id)

    if (membersError) {
      return {
        success: false,
        error: `참여자 정보 조회에 실패했습니다: ${membersError.message}`,
      }
    }

    // 통계 계산
    const attendingCount =
      members?.filter(m => m.status === 'ATTENDING').length || 0
    const notAttendingCount =
      members?.filter(m => m.status === 'NOT_ATTENDING').length || 0
    const undecidedCount =
      members?.filter(m => m.status === 'PENDING').length || 0
    const paidCount = members?.filter(m => m.has_paid).length || 0
    const unpaidCount = members?.filter(m => !m.has_paid).length || 0

    return {
      success: true,
      data: {
        ...event,
        attendingCount,
        notAttendingCount,
        undecidedCount,
        paidCount,
        unpaidCount,
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
