'use server'

import { getServerSession } from 'next-auth'
import { signIn } from 'next-auth/react'
import bcrypt from 'bcryptjs'
import { supabaseAdmin } from '@/lib/supabase'

/**
 * 현재 로그인한 사용자 정보 조회
 */
export async function getCurrentUser() {
  const { authOptions } = await import('@/app/api/auth/[...nextauth]/route')
  const session = await getServerSession(authOptions)
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

/**
 * 회원가입
 */
export async function signup(email: string, name: string, password: string) {
  try {
    if (!supabaseAdmin) {
      throw new Error('Supabase가 설정되지 않았습니다')
    }

    // 1. 기존 사용자 확인
    const { data: existingUser } = await supabaseAdmin
      .from('users')
      .select('id')
      .eq('email', email)
      .single()

    if (existingUser) {
      throw new Error('이미 가입된 이메일입니다')
    }

    // 2. 비밀번호 해싱
    const hashedPassword = await bcrypt.hash(password, 10)

    // 3. 새 사용자 생성
    const { data: newUser, error: insertError } = await supabaseAdmin
      .from('users')
      .insert({
        email,
        name,
        password_hash: hashedPassword,
        is_admin: false,
      })
      .select('id')
      .single()

    if (insertError || !newUser) {
      throw new Error('회원가입 중 오류가 발생했습니다')
    }

    return {
      success: true,
      userId: newUser.id,
      message: '회원가입이 완료되었습니다. 로그인해주세요.',
    }
  } catch (error) {
    console.error('Signup error:', error)
    throw error
  }
}
