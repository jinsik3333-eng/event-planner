'use server'

import { getServerSession } from 'next-auth'
import { supabase } from '@/lib/supabase'
import {
  CreateCarpoolRequest,
  JoinCarpoolRequest,
  ApiResponse,
} from '@/types/api'
import { Database } from '@/lib/supabase'

type Carpool = Database['public']['Tables']['carpools']['Row']
type CarpoolRequest = Database['public']['Tables']['carpool_requests']['Row']

/**
 * 카풀 운전자 등록
 * 서버에서 검증된 사용자만 카풀 생성 가능
 */
export async function createCarpool(
  data: CreateCarpoolRequest
): Promise<ApiResponse<Carpool>> {
  try {
    // 서버 세션에서 인증된 사용자 ID 획득
    const session = await getServerSession()
    if (!session?.user?.id) {
      return {
        success: false,
        error: '로그인이 필요합니다.',
      }
    }

    const driverId = session.user.id

    // 입력값 검증
    if (!data.eventId) {
      return {
        success: false,
        error: '이벤트 ID가 필요합니다.',
      }
    }

    if (!data.seats || data.seats < 1 || data.seats > 7) {
      return {
        success: false,
        error: '탑승 가능 인원은 1명 이상 7명 이하여야 합니다.',
      }
    }

    if (!data.departure) {
      return {
        success: false,
        error: '출발 장소가 필요합니다.',
      }
    }

    // 카풀 생성
    const { data: carpool, error } = await supabase
      .from('carpools')
      .insert({
        event_id: data.eventId,
        driver_id: driverId,
        seats: data.seats,
        departure: data.departure,
      })
      .select()
      .single()

    if (error) {
      return {
        success: false,
        error: `카풀 등록에 실패했습니다: ${error.message}`,
      }
    }

    return {
      success: true,
      data: carpool,
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
 * 카풀 탑승 신청
 * 서버에서 검증된 사용자만 신청 가능
 */
export async function joinCarpool(
  data: JoinCarpoolRequest
): Promise<ApiResponse<CarpoolRequest>> {
  try {
    // 서버 세션에서 인증된 사용자 ID 획득
    const session = await getServerSession()
    if (!session?.user?.id) {
      return {
        success: false,
        error: '로그인이 필요합니다.',
      }
    }

    const passengerId = session.user.id

    // 입력값 검증
    if (!data.carpoolId) {
      return {
        success: false,
        error: '카풀 ID가 필요합니다.',
      }
    }

    // 카풀 정보 조회
    const { data: carpool, error: carpoolError } = await supabase
      .from('carpools')
      .select('*')
      .eq('id', data.carpoolId)
      .single()

    if (carpoolError) {
      if (carpoolError.code === 'PGRST116') {
        return {
          success: false,
          error: '존재하지 않는 카풀입니다.',
        }
      }
      return {
        success: false,
        error: `카풀 조회에 실패했습니다: ${carpoolError.message}`,
      }
    }

    // 정원 확인 (ACCEPTED 상태의 신청만 계산)
    const { data: acceptedRequests, error: countError } = await supabase
      .from('carpool_requests')
      .select('id')
      .eq('carpool_id', data.carpoolId)
      .eq('status', 'ACCEPTED')

    if (countError) {
      return {
        success: false,
        error: `정원 확인에 실패했습니다: ${countError.message}`,
      }
    }

    const acceptedCount = acceptedRequests?.length || 0
    if (acceptedCount >= carpool.seats) {
      return {
        success: false,
        error: '카풀이 만석입니다.',
      }
    }

    // 중복 신청 확인
    const { data: existing } = await supabase
      .from('carpool_requests')
      .select('id')
      .eq('carpool_id', data.carpoolId)
      .eq('user_id', passengerId)
      .single()

    if (existing) {
      return {
        success: false,
        error: '이미 신청한 카풀입니다.',
      }
    }

    // 탑승 신청
    const { data: request, error } = await supabase
      .from('carpool_requests')
      .insert({
        carpool_id: data.carpoolId,
        user_id: passengerId,
        status: 'PENDING',
      })
      .select()
      .single()

    if (error) {
      return {
        success: false,
        error: `카풀 신청에 실패했습니다: ${error.message}`,
      }
    }

    return {
      success: true,
      data: request,
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
 * 카풀 탑승 취소
 * 서버에서 검증된 사용자만 취소 가능
 */
export async function leaveCarpool(
  carpoolId: string
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

    const passengerId = session.user.id

    // 입력값 검증
    if (!carpoolId) {
      return {
        success: false,
        error: '카풀 ID가 필요합니다.',
      }
    }

    // 탑승 신청 취소
    const { error } = await supabase
      .from('carpool_requests')
      .delete()
      .eq('carpool_id', carpoolId)
      .eq('user_id', passengerId)

    if (error) {
      if (error.code === 'PGRST116') {
        return {
          success: false,
          error: '해당 카풀 신청이 없습니다.',
        }
      }
      return {
        success: false,
        error: `카풀 취소에 실패했습니다: ${error.message}`,
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
 * 이벤트의 카풀 목록 조회
 */
export async function getCarpools(
  eventId: string
): Promise<ApiResponse<Carpool[]>> {
  try {
    // 입력값 검증
    if (!eventId) {
      return {
        success: false,
        error: '이벤트 ID가 필요합니다.',
      }
    }

    // 카풀 목록 조회
    const { data: carpools, error } = await supabase
      .from('carpools')
      .select('*')
      .eq('event_id', eventId)
      .order('created_at', { ascending: false })

    if (error) {
      return {
        success: false,
        error: `카풀 목록 조회에 실패했습니다: ${error.message}`,
      }
    }

    return {
      success: true,
      data: carpools || [],
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
 * 특정 카풀 상세 조회 (운전자, 탑승자 정보 포함)
 */
export async function getCarpool(carpoolId: string): Promise<
  ApiResponse<{
    carpool: Carpool
    acceptedCount: number
    pendingCount: number
    availableSeats: number
  }>
> {
  try {
    // 입력값 검증
    if (!carpoolId) {
      return {
        success: false,
        error: '카풀 ID가 필요합니다.',
      }
    }

    // 카풀 정보 조회
    const { data: carpool, error } = await supabase
      .from('carpools')
      .select('*')
      .eq('id', carpoolId)
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        return {
          success: false,
          error: '존재하지 않는 카풀입니다.',
        }
      }
      return {
        success: false,
        error: `카풀 조회에 실패했습니다: ${error.message}`,
      }
    }

    // 신청자 수 조회 (상태별)
    const { data: requests, error: requestError } = await supabase
      .from('carpool_requests')
      .select('status')
      .eq('carpool_id', carpoolId)

    if (requestError) {
      return {
        success: false,
        error: `신청자 정보 조회에 실패했습니다: ${requestError.message}`,
      }
    }

    const requestList = requests || []
    const acceptedCount = requestList.filter(
      r => r.status === 'ACCEPTED'
    ).length
    const pendingCount = requestList.filter(r => r.status === 'PENDING').length
    const availableSeats = carpool.seats - acceptedCount

    return {
      success: true,
      data: {
        carpool,
        acceptedCount,
        pendingCount,
        availableSeats,
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
 * 사용자가 신청한 카풀 목록 조회
 */
export async function getUserCarpools(
  userId: string,
  eventId?: string
): Promise<ApiResponse<Carpool[]>> {
  try {
    // 입력값 검증
    if (!userId) {
      return {
        success: false,
        error: '사용자 ID가 필요합니다.',
      }
    }

    // 사용자가 신청한 카풀 조회
    const { data: requests, error: requestError } = await supabase
      .from('carpool_requests')
      .select('carpool_id')
      .eq('user_id', userId)

    if (requestError) {
      return {
        success: false,
        error: `카풀 신청 목록 조회에 실패했습니다: ${requestError.message}`,
      }
    }

    const carpoolIds = requests?.map(r => r.carpool_id) || []

    if (carpoolIds.length === 0) {
      return {
        success: true,
        data: [],
      }
    }

    // 카풀 상세 정보 조회
    let carpoolQuery = supabase
      .from('carpools')
      .select('*')
      .in('id', carpoolIds)

    if (eventId) {
      carpoolQuery = carpoolQuery.eq('event_id', eventId)
    }

    const { data: carpools, error: carpoolError } = await carpoolQuery.order(
      'created_at',
      {
        ascending: false,
      }
    )

    if (carpoolError) {
      return {
        success: false,
        error: `카풀 정보 조회에 실패했습니다: ${carpoolError.message}`,
      }
    }

    return {
      success: true,
      data: carpools || [],
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
