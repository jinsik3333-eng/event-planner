'use client'

import { signOut } from 'next-auth/react'
import { LogOut } from 'lucide-react'
import { Button } from '@/components/ui/button'

// 관리자 페이지 로그아웃 버튼 (Client Component)
export function SignOutButton() {
  return (
    <Button
      type="button"
      variant="outline"
      className="w-full border-gray-700 text-white hover:bg-gray-800"
      onClick={() => signOut({ callbackUrl: '/login' })}
    >
      <LogOut size={18} className="mr-2" />
      로그아웃
    </Button>
  )
}
