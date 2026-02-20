import Image from 'next/image'
import { Clock, MapPin, Users } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'

// 이벤트 카드 컴포넌트 (배달의민족 스타일)
interface EventCardProps {
  id: string
  title: string
  image?: string
  date: Date
  location: string
  currentAttendees: number
  maxAttendees?: number | null
  fee?: number
  isNew?: boolean
  status?: 'RECRUITING' | 'CONFIRMED' | 'ENDED'
  onClick?: () => void
  className?: string
}

export function EventCard({
  id,
  title,
  image,
  date,
  location,
  currentAttendees,
  maxAttendees,
  fee,
  isNew,
  status = 'RECRUITING',
  onClick,
  className,
}: EventCardProps) {
  // 날짜 포맷
  const formattedDate = new Date(date).toLocaleDateString('ko-KR', {
    month: 'short',
    day: 'numeric',
  })

  // 시간 포맷
  const formattedTime = new Date(date).toLocaleTimeString('ko-KR', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  })

  // 상태 배지 색상
  const statusColor = {
    RECRUITING: 'bg-emerald-100 text-emerald-700',
    CONFIRMED: 'bg-blue-100 text-blue-700',
    ENDED: 'bg-gray-100 text-gray-700',
  }

  return (
    <div
      onClick={onClick}
      className={cn(
        'group cursor-pointer overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm transition-shadow hover:shadow-md',
        'w-full',
        className
      )}
    >
      {/* 이미지 영역 */}
      <div className="relative h-40 w-full overflow-hidden bg-gray-200">
        {image ? (
          <Image
            src={image}
            alt={title}
            fill
            className="object-cover transition-transform duration-300 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-emerald-100 to-emerald-50">
            <Users size={32} className="text-emerald-300" />
          </div>
        )}

        {/* 상태 배지 */}
        <div className="absolute top-2 right-2">
          {isNew && <Badge className="bg-red-500">NEW</Badge>}
        </div>

        {/* 참석자 수 (우측 하단) */}
        <div className="absolute right-2 bottom-2 rounded-full bg-white/90 px-2 py-1 text-xs font-semibold">
          {currentAttendees}/{maxAttendees || '무제한'}
        </div>
      </div>

      {/* 정보 영역 */}
      <div className="space-y-3 p-4">
        {/* 제목 */}
        <h3 className="line-clamp-2 text-base font-bold text-gray-900">
          {title}
        </h3>

        {/* 메타 정보 */}
        <div className="space-y-2 text-sm">
          {/* 날짜/시간 */}
          <div className="flex items-center gap-2 text-gray-600">
            <Clock size={16} className="text-emerald-600" />
            <span>
              {formattedDate} · {formattedTime}
            </span>
          </div>

          {/* 위치 */}
          <div className="flex items-center gap-2 text-gray-600">
            <MapPin size={16} className="text-emerald-600" />
            <span className="line-clamp-1">{location}</span>
          </div>
        </div>

        {/* 하단 정보 */}
        <div className="flex items-center justify-between border-t border-gray-100 pt-2">
          {/* 참가비 또는 상태 */}
          <span className="text-sm font-semibold text-gray-900">
            {fee ? `${fee.toLocaleString()}원` : '무료'}
          </span>

          {/* 상태 배지 */}
          <Badge className={statusColor[status]} variant="secondary">
            {status === 'RECRUITING'
              ? '모집 중'
              : status === 'CONFIRMED'
                ? '확정'
                : '종료'}
          </Badge>
        </div>
      </div>
    </div>
  )
}
