import { withAuth } from 'next-auth/middleware'
import { NextRequest } from 'next/server'

export const middleware = withAuth(
  function middleware(req: NextRequest) {
    // 미들웨어 로직이 필요하면 여기에 추가
    return undefined
  },
  {
    callbacks: {
      authorized: ({ token }) => !!token,
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
