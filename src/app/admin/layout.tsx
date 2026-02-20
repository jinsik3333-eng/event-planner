'use client'

import { useEffect } from 'react'

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  useEffect(() => {
    // body의 max-w 클래스 제거하여 전체 너비 사용
    const htmlElement = document.documentElement
    const bodyElement = document.body

    // 기존 클래스 저장
    const originalHtmlClass = htmlElement.className
    const originalBodyClass = bodyElement.className

    // admin 페이지에서는 max-width 제약 제거
    htmlElement.style.maxWidth = 'none'
    bodyElement.style.maxWidth = 'none'
    bodyElement.style.marginLeft = '0'
    bodyElement.style.marginRight = '0'

    return () => {
      // 다른 페이지로 이동 시 원래 스타일 복원
      htmlElement.style.maxWidth = ''
      bodyElement.style.maxWidth = ''
      bodyElement.style.marginLeft = ''
      bodyElement.style.marginRight = ''
    }
  }, [])

  return <>{children}</>
}
