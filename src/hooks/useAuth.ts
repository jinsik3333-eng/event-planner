'use client'

import { useSession } from 'next-auth/react'
import type { Session } from 'next-auth'

/**
 * 현재 세션의 사용자 정보를 가져오는 훅
 */
export function useCurrentUser() {
  const { data: session } = useSession()
  return session?.user || null
}

/**
 * 현재 사용자 ID 조회 훅
 */
export function useCurrentUserId(): string | null {
  const user = useCurrentUser()
  return user?.id || null
}

/**
 * 현재 사용자가 관리자인지 확인하는 훅
 */
export function useIsAdmin(): boolean {
  const user = useCurrentUser()
  return user?.isAdmin || false
}

/**
 * 로딩 상태 포함 세션 정보를 반환하는 훅
 */
export function useAuthSession() {
  return useSession() as {
    data:
      | (Session & {
          user: Session['user'] & { id: string; isAdmin?: boolean }
        })
      | null
    status: 'loading' | 'authenticated' | 'unauthenticated'
  }
}
