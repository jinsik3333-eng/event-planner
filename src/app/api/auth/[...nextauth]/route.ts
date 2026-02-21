import NextAuth, { type NextAuthOptions } from 'next-auth'
import Credentials from 'next-auth/providers/credentials'
import Kakao from 'next-auth/providers/kakao'
import bcrypt from 'bcryptjs'
import { supabaseAdmin } from '@/lib/supabase'

declare module 'next-auth' {
  interface User {
    id: string
    isAdmin?: boolean
  }

  interface Session {
    user: User & {
      id: string
      isAdmin?: boolean
    }
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    id?: string
    isAdmin?: boolean
  }
}

// 카카오 프로필 타입 정의
interface KakaoProfile {
  id: number
  nickname: string
  profile_image: string | null
}

// 프로바이더 설정
const credentialsProvider = Credentials({
  credentials: {
    email: { label: 'Email', type: 'email' },
    password: { label: 'Password', type: 'password' },
  },
  async authorize(credentials) {
    if (!credentials?.email || !credentials?.password) {
      return null
    }

    if (!supabaseAdmin) {
      console.error('Supabase Admin not configured')
      return null
    }

    try {
      // 사용자 조회
      const { data: user, error } = await supabaseAdmin
        .from('users')
        .select('*')
        .eq('email', credentials.email)
        .single()

      if (error || !user) {
        return null
      }

      // 비밀번호 검증
      if (user.password_hash) {
        const isPasswordValid = await bcrypt.compare(
          credentials.password,
          user.password_hash
        )

        if (!isPasswordValid) {
          return null
        }
      } else {
        // 비밀번호 해시가 없는 경우 (마이그레이션 대상)
        // 데모 비밀번호 'demo12345'로 폴백
        if (credentials.password !== 'demo12345') {
          return null
        }
      }

      return {
        id: user.id,
        email: user.email,
        name: user.name,
        image: user.profile_image,
      }
    } catch (error) {
      console.error('Auth error:', error)
      return null
    }
  },
})

const providers = []

// 카카오 환경 변수가 설정되어 있으면 카카오 로그인 추가
if (
  process.env.NEXT_PUBLIC_KAKAO_CLIENT_ID &&
  process.env.KAKAO_CLIENT_SECRET
) {
  providers.push(
    Kakao({
      clientId: process.env.NEXT_PUBLIC_KAKAO_CLIENT_ID,
      clientSecret: process.env.KAKAO_CLIENT_SECRET,
      allowDangerousEmailAccountLinking: true,
    })
  )
}

// Credentials 프로바이더는 항상 추가
providers.push(credentialsProvider)

// NextAuth 옵션
export const authOptions: NextAuthOptions = {
  providers,

  callbacks: {
    // 로그인/가입 시 사용자를 DB에 저장
    async signIn({ user, account, profile }) {
      if (!supabaseAdmin) {
        console.error('Supabase Admin not configured')
        return false
      }

      if (!user.email) {
        return false
      }

      try {
        // 카카오 로그인 처리
        if (account?.provider === 'kakao' && profile) {
          const kakaoProfile = profile as KakaoProfile
          const { data: existingUser } = await supabaseAdmin
            .from('users')
            .select('id')
            .eq('kakao_id', String(kakaoProfile.id))
            .single()

          if (!existingUser) {
            // 새 사용자 생성
            await supabaseAdmin.from('users').insert({
              kakao_id: String(kakaoProfile.id),
              email: user.email,
              name: user.name || kakaoProfile.nickname || '사용자',
              profile_image: user.image,
              is_admin: false,
            })
          } else {
            // 기존 사용자 업데이트
            await supabaseAdmin
              .from('users')
              .update({
                email: user.email,
                name: user.name || kakaoProfile.nickname,
                profile_image: user.image,
              })
              .eq('kakao_id', String(kakaoProfile.id))
          }
        }

        return true
      } catch (error) {
        console.error('Sign in callback error:', error)
        return false
      }
    },

    // JWT 토큰에 사용자 정보 추가
    async jwt({ token, user, account, profile }) {
      if (!supabaseAdmin) {
        return token
      }

      if (user) {
        token.id = user.id
      }

      // 초기 로그인 또는 토큰 갱신
      if (account?.provider === 'kakao' && profile) {
        const kakaoProfile = profile as KakaoProfile
        const { data: dbUser } = await supabaseAdmin
          .from('users')
          .select('id, is_admin')
          .eq('kakao_id', String(kakaoProfile.id))
          .single()

        if (dbUser) {
          token.id = dbUser.id
          token.isAdmin = dbUser.is_admin
        }
      } else if (token.email) {
        // Credentials 로그인
        const { data: dbUser } = await supabaseAdmin
          .from('users')
          .select('id, is_admin')
          .eq('email', token.email)
          .single()

        if (dbUser) {
          token.id = dbUser.id
          token.isAdmin = dbUser.is_admin
        }
      }

      return token
    },

    // 세션에 사용자 정보 추가
    async session({ session, token }) {
      if (session.user && token.id) {
        session.user.id = String(token.id)
        session.user.isAdmin = Boolean(token.isAdmin)
      }
      return session
    },
  },

  pages: {
    signIn: '/login',
    error: '/login?error=true',
  },

  session: {
    strategy: 'jwt',
  },

  secret: process.env.NEXTAUTH_SECRET,
}

const handler = NextAuth(authOptions)

export { handler as GET, handler as POST }
