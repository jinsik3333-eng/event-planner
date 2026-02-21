import { redirect } from 'next/navigation'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'

export default async function Home() {
  // 현재 사용자 세션 확인
  const session = await getServerSession(authOptions)

  // 로그인 상태에 따라 리다이렉트
  if (session?.user) {
    redirect('/dashboard')
  } else {
    redirect('/login')
  }
}
