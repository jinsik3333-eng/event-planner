import { withAuth } from 'next-auth/middleware'
import { NextRequest, NextResponse } from 'next/server'

export const middleware = withAuth(
  function middleware(req: NextRequest) {
    return undefined
  },
  {
    callbacks: {
      authorized: ({ token, req: middlewareReq }) => {
        // 기본 인증 확인
        if (!token) {
          return false
        }

        // /admin 라우트에 대한 관리자 권한 검증
        if (middlewareReq.nextUrl.pathname.startsWith('/admin')) {
          return token.isAdmin === true
        }

        return true
      },
    },
    pages: {
      signIn: '/login',
    },
  }
)

// 미들웨어가 적용될 라우트 설정
export const config = {
  matcher: [
    // 보호할 라우트
    '/dashboard/:path*',
    '/events/new',
    '/events/:path*/manage',
    '/admin/:path*',
  ],
}
