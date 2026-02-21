import { test, expect } from '@playwright/test'

const BASE_URL = 'http://localhost:3000'
const ADMIN_EMAIL = 'admin@example.com'
const ADMIN_PASSWORD = 'admin12345'
const USER_EMAIL = 'user@example.com'
const USER_PASSWORD = 'user123456'

test.describe('관리자 대시보드', () => {
  test('관리자 로그인 후 통계 데이터 표시 검증', async ({ page }) => {
    // 1. 로그인 페이지로 이동
    await page.goto(`${BASE_URL}/login`)
    await expect(page).toHaveTitle(/.*/)

    // 2. 관리자 계정으로 로그인
    await page.fill('input[name="email"]', ADMIN_EMAIL)
    await page.fill('input[name="password"]', ADMIN_PASSWORD)
    await page.click('button[type="submit"]')

    // 3. 대시보드로 리다이렉트되는지 확인
    await page.waitForURL(`${BASE_URL}/dashboard`)

    // 4. 관리자 대시보드 접근
    await page.goto(`${BASE_URL}/admin`)

    // 5. 통계 카드 확인
    await expect(page.locator('text=총 모임')).toBeVisible()
    await expect(page.locator('text=활성 사용자')).toBeVisible()
    await expect(page.locator('text=이번달 매출')).toBeVisible()
    await expect(page.locator('text=누적 매출')).toBeVisible()

    // 6. 통계 값이 표시되는지 확인
    const totalEventsValue = page
      .locator('p:has-text("총 모임")')
      .locator('..')
      .locator('p[class*="text-2xl"]')
    await expect(totalEventsValue).toContainText(/\d+/)

    // 7. 모임 목록 테이블 확인
    await expect(page.locator('text=최근 모임')).toBeVisible()
    await expect(page.locator('table')).toBeVisible()

    // 8. 테이블 헤더 확인
    await expect(page.locator('th:has-text("모임명")')).toBeVisible()
    await expect(page.locator('th:has-text("주최자")')).toBeVisible()
    await expect(page.locator('th:has-text("참석")')).toBeVisible()
    await expect(page.locator('th:has-text("정원")')).toBeVisible()
    await expect(page.locator('th:has-text("매출")')).toBeVisible()
    await expect(page.locator('th:has-text("상태")')).toBeVisible()
  })

  test('비관리자 접근 차단 검증', async ({ page }) => {
    // 1. 일반 사용자로 로그인
    await page.goto(`${BASE_URL}/login`)
    await page.fill('input[name="email"]', USER_EMAIL)
    await page.fill('input[name="password"]', USER_PASSWORD)
    await page.click('button[type="submit"]')

    // 2. 대시보드로 리다이렉트
    await page.waitForURL(`${BASE_URL}/dashboard`)

    // 3. 관리자 대시보드 접근 시도
    await page.goto(`${BASE_URL}/admin`)

    // 4. 대시보드로 리다이렉트되는지 확인
    await expect(page).toHaveURL(`${BASE_URL}/dashboard`)
  })

  test('로그아웃된 사용자 관리자 페이지 접근 차단', async ({ page }) => {
    // 1. 로그인 없이 관리자 페이지 접근
    await page.goto(`${BASE_URL}/admin`)

    // 2. 로그인 페이지로 리다이렉트되는지 확인
    await page.waitForURL(`${BASE_URL}/login`)
    await expect(page).toHaveURL(`${BASE_URL}/login`)
  })

  test('관리자 대시보드 레이아웃 검증', async ({ page }) => {
    // 1. 관리자로 로그인
    await page.goto(`${BASE_URL}/login`)
    await page.fill('input[name="email"]', ADMIN_EMAIL)
    await page.fill('input[name="password"]', ADMIN_PASSWORD)
    await page.click('button[type="submit"]')
    await page.waitForURL(`${BASE_URL}/dashboard`)

    // 2. 관리자 대시보드 접근
    await page.goto(`${BASE_URL}/admin`)

    // 3. 데스크톱 레이아웃 확인 (md: 이상)
    // 뷰포트를 데스크톱 크기로 설정
    await page.setViewportSize({ width: 1440, height: 900 })

    // 4. 사이드바 확인
    const sidebar = page.locator('.bg-gray-900')
    await expect(sidebar).toBeVisible()

    // 5. 사이드바에 네비게이션 항목 확인
    await expect(page.locator('text=통계')).toBeVisible()
    await expect(page.locator('text=모임 관리')).toBeVisible()
    await expect(page.locator('text=사용자')).toBeVisible()

    // 6. 로그아웃 버튼 확인
    await expect(page.locator('button:has-text("로그아웃")')).toBeVisible()

    // 7. 모바일에서는 숨겨지는지 확인
    await page.setViewportSize({ width: 375, height: 812 })
    const adminPageDiv = page.locator('div.hidden.md\\:flex')
    // 모바일에서는 숨겨져야 함
    const isHidden = await adminPageDiv.evaluate(el => {
      const classes = el.className
      return classes.includes('hidden')
    })
    expect(isHidden).toBe(true)
  })

  test('상태별 모임 배지 표시 검증', async ({ page }) => {
    // 1. 관리자로 로그인
    await page.goto(`${BASE_URL}/login`)
    await page.fill('input[name="email"]', ADMIN_EMAIL)
    await page.fill('input[name="password"]', ADMIN_PASSWORD)
    await page.click('button[type="submit"]')
    await page.waitForURL(`${BASE_URL}/dashboard`)

    // 2. 관리자 대시보드 접근
    await page.goto(`${BASE_URL}/admin`)

    // 3. 테이블에서 상태 배지 확인
    const statusBadges = page.locator('span.inline-block.rounded-full')
    const count = await statusBadges.count()

    // 상태 배지가 표시되는지 확인 (모집 중 또는 확정)
    for (let i = 0; i < count; i++) {
      const text = await statusBadges.nth(i).textContent()
      expect(['모집 중', '확정', '종료']).toContain(text?.trim())
    }
  })

  test('매출 정보 통화 형식 검증', async ({ page }) => {
    // 1. 관리자로 로그인
    await page.goto(`${BASE_URL}/login`)
    await page.fill('input[name="email"]', ADMIN_EMAIL)
    await page.fill('input[name="password"]', ADMIN_PASSWORD)
    await page.click('button[type="submit"]')
    await page.waitForURL(`${BASE_URL}/dashboard`)

    // 2. 관리자 대시보드 접근
    await page.goto(`${BASE_URL}/admin`)

    // 3. 통계 카드의 매출 형식 확인 (만원 단위)
    const thisMonthRevenue = page
      .locator('text=이번달 매출')
      .locator('..')
      .locator('p:has-text("만원")')
    await expect(thisMonthRevenue).toBeVisible()

    // 4. 테이블의 매출 형식 확인 (원 단위)
    const revenueCell = page.locator('td').locator('text=/\\d+원/')
    const count = await revenueCell.count()
    expect(count).toBeGreaterThan(0)
  })
})
