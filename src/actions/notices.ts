'use server'

import { getServerSession } from 'next-auth'
import { revalidatePath } from 'next/cache'
import { supabase } from '@/lib/supabase'
import {
  CreateNoticeRequest,
  UpdateNoticeRequest,
  ApiResponse,
} from '@/types/api'
import { Database } from '@/lib/supabase'

type Notice = Database['public']['Tables']['notices']['Row']

/**
 * 공지사항 생성
 * 서버에서 검증된 사용자만 작성 가능
 */
export async function createNotice(
  data: CreateNoticeRequest
): Promise<ApiResponse<Notice>> {
  try {
    // 서버 세션에서 인증된 사용자 ID 획득
    const session = await getServerSession()
    if (!session?.user?.id) {
      return {
        success: false,
        error: '로그인이 필요합니다.',
      }
    }

    const authorId = session.user.id

    // 입력값 검증
    if (!data.eventId) {
      return {
        success: false,
        error: '이벤트 ID가 필요합니다.',
      }
    }

    if (!data.content) {
      return {
        success: false,
        error: '공지사항 내용이 필요합니다.',
      }
    }

    // 공지사항 생성
    const { data: notice, error } = await supabase
      .from('notices')
      .insert({
        event_id: data.eventId,
        author_id: authorId,
        content: data.content,
      })
      .select()
      .single()

    if (error) {
      return {
        success: false,
        error: `공지사항 생성에 실패했습니다: ${error.message}`,
      }
    }

    // 관리 페이지 캐시 무효화 (공지 작성 후 즉시 반영)
    revalidatePath(`/events/${data.eventId}/manage`)

    return {
      success: true,
      data: notice,
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
 * 공지사항 수정
 * 작성자만 수정 가능 (RLS에 의해 검증)
 */
export async function updateNotice(
  data: UpdateNoticeRequest
): Promise<ApiResponse<Notice>> {
  try {
    // 입력값 검증
    if (!data.id || !data.content) {
      return {
        success: false,
        error: '공지사항 ID와 내용이 필요합니다.',
      }
    }

    // 공지사항 수정
    const { data: notice, error } = await supabase
      .from('notices')
      .update({
        content: data.content,
        updated_at: new Date().toISOString(),
      })
      .eq('id', data.id)
      .select()
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        return {
          success: false,
          error: '존재하지 않는 공지사항입니다.',
        }
      }
      return {
        success: false,
        error: `공지사항 수정에 실패했습니다: ${error.message}`,
      }
    }

    return {
      success: true,
      data: notice,
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
 * 공지사항 삭제
 * 서버에서 검증된 사용자만 삭제 가능 (작성자 또는 주최자)
 */
export async function deleteNotice(
  noticeId: string
): Promise<ApiResponse<null>> {
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
    if (!noticeId) {
      return {
        success: false,
        error: '공지사항 ID가 필요합니다.',
      }
    }

    // 공지사항 정보 조회
    const { data: notice, error: noticeError } = await supabase
      .from('notices')
      .select('author_id, event_id')
      .eq('id', noticeId)
      .single()

    if (noticeError || !notice) {
      return {
        success: false,
        error: '공지사항을 찾을 수 없습니다.',
      }
    }

    // 이벤트 정보 조회 (주최자 확인용)
    const { data: event, error: eventError } = await supabase
      .from('events')
      .select('host_id')
      .eq('id', notice.event_id)
      .single()

    if (eventError || !event) {
      return {
        success: false,
        error: '이벤트 정보를 찾을 수 없습니다.',
      }
    }

    // 권한 검증: 작성자 또는 주최자인지 확인
    const isAuthor = notice.author_id === userId
    const isHost = event.host_id === userId

    if (!isAuthor && !isHost) {
      return {
        success: false,
        error: '이 공지사항을 삭제할 권한이 없습니다.',
      }
    }

    // 공지사항 삭제
    const { error } = await supabase.from('notices').delete().eq('id', noticeId)

    if (error) {
      if (error.code === 'PGRST116') {
        return {
          success: false,
          error: '존재하지 않는 공지사항입니다.',
        }
      }
      return {
        success: false,
        error: `공지사항 삭제에 실패했습니다: ${error.message}`,
      }
    }

    // 관리 페이지 캐시 무효화 (공지 삭제 후 즉시 반영)
    revalidatePath(`/events/${notice.event_id}/manage`)

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
 * 이벤트 공지사항 목록 조회
 */
export async function getNotices(
  eventId: string
): Promise<ApiResponse<Notice[]>> {
  try {
    // 입력값 검증
    if (!eventId) {
      return {
        success: false,
        error: '이벤트 ID가 필요합니다.',
      }
    }

    // 공지사항 목록 조회
    const { data: notices, error } = await supabase
      .from('notices')
      .select('*')
      .eq('event_id', eventId)
      .order('created_at', { ascending: false })

    if (error) {
      return {
        success: false,
        error: `공지사항 목록 조회에 실패했습니다: ${error.message}`,
      }
    }

    return {
      success: true,
      data: notices || [],
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
 * 특정 공지사항 조회
 */
export async function getNotice(
  noticeId: string
): Promise<ApiResponse<Notice>> {
  try {
    // 입력값 검증
    if (!noticeId) {
      return {
        success: false,
        error: '공지사항 ID가 필요합니다.',
      }
    }

    // 공지사항 조회
    const { data: notice, error } = await supabase
      .from('notices')
      .select('*')
      .eq('id', noticeId)
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        return {
          success: false,
          error: '존재하지 않는 공지사항입니다.',
        }
      }
      return {
        success: false,
        error: `공지사항 조회에 실패했습니다: ${error.message}`,
      }
    }

    return {
      success: true,
      data: notice,
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
 * 최근 공지사항 조회
 * 개수 제한과 함께 조회
 */
export async function getRecentNotices(
  eventId: string,
  limit: number = 5
): Promise<ApiResponse<Notice[]>> {
  try {
    // 입력값 검증
    if (!eventId) {
      return {
        success: false,
        error: '이벤트 ID가 필요합니다.',
      }
    }

    const maxLimit = Math.min(Math.max(limit, 1), 50)

    // 최근 공지사항 조회
    const { data: notices, error } = await supabase
      .from('notices')
      .select('*')
      .eq('event_id', eventId)
      .order('created_at', { ascending: false })
      .limit(maxLimit)

    if (error) {
      return {
        success: false,
        error: `공지사항 조회에 실패했습니다: ${error.message}`,
      }
    }

    return {
      success: true,
      data: notices || [],
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
