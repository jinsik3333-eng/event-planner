'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Home, ListTodo, Users } from 'lucide-react'
import { cn } from '@/lib/utils'

// 하단 탭 네비게이션 (모바일 전용)
interface BottomTabProps {
  className?: string
}

export function BottomTab({ className }: BottomTabProps) {
  const pathname = usePathname()

  const tabs = [
    { name: '홈', href: '/dashboard', icon: Home },
    { name: '내 모임', href: '/dashboard/my-events', icon: ListTodo },
    { name: '참여 중', href: '/dashboard/participating', icon: Users },
  ]

  return (
    <nav
      className={cn(
        'fixed right-0 bottom-0 left-0 border-t bg-white',
        'flex h-16 items-center justify-around',
        'md:hidden', // 데스크톱에서는 숨김
        className
      )}
    >
      {tabs.map(tab => {
        const isActive = pathname.startsWith(tab.href)
        const Icon = tab.icon

        return (
          <Link
            key={tab.href}
            href={tab.href}
            className={cn(
              'flex flex-1 flex-col items-center justify-center gap-1 py-2',
              'transition-colors duration-200',
              isActive
                ? 'text-emerald-600'
                : 'text-gray-600 hover:text-gray-900'
            )}
          >
            <Icon size={24} />
            <span className="text-xs font-medium">{tab.name}</span>
          </Link>
        )
      })}
    </nav>
  )
}
