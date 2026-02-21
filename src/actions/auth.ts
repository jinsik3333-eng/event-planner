'use server'

import { getServerSession } from 'next-auth'

/**
 * 현재 로그인한 사용자 정보 조회
 */
export async function getCurrentUser() {
  const session = await getServerSession()
  return session?.user || null
}

/**
 * 현재 사용자의 ID 조회
 */
export async function getCurrentUserId(): Promise<string | null> {
  const user = await getCurrentUser()
  return user?.id || null
}

/**
 * 현재 사용자가 관리자인지 확인
 */
export async function isCurrentUserAdmin(): Promise<boolean> {
  const user = await getCurrentUser()
  return user?.isAdmin || false
}
