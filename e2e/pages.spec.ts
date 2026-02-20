import { test, expect } from '@playwright/test'

/**
 * 페이지 네비게이션 및 데이터 표시 E2E 테스트
 * 대시보드, 이벤트 관리, 초대 링크 페이지의 기능 검증
 */

test.describe('대시보드 페이지', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/dashboard')
  })

  test('대시보드 헤더가 표시되어야 함', async ({ page }) => {
    const heading = page.getByRole('heading', { name: /내 모임/i })
    await expect(heading).toBeVisible()
  })

  test('새 모임 만들기 버튼이 표시되어야 함', async ({ page }) => {
    const createButton = page.getByRole('link', { name: /새 모임 만들기/i })
    await expect(createButton).toBeVisible()
    await expect(createButton).toHaveAttribute('href', '/events/new')
  })

  test('주최 중인 모임 섹션이 표시되어야 함', async ({ page }) => {
    const section = page.getByRole('heading', { name: /주최 중인 모임/i })
    await expect(section).toBeVisible()
  })

  test('지난 모임 섹션이 표시되어야 함', async ({ page }) => {
    const section = page.getByRole('heading', { name: /지난 모임/i })
    await expect(section).toBeVisible()
  })

  test('이벤트 카드가 표시되어야 함', async ({ page }) => {
    // 이벤트 카드 존재 여부 확인
    const eventCards = page.locator('[class*="event-card"]')
    await expect(eventCards.first()).toBeVisible()
  })

  test('하단 탭 네비게이션이 표시되어야 함', async ({ page }) => {
    const bottomTab = page.getByRole('navigation')
    await expect(bottomTab).toBeVisible()
  })
})

test.describe('이벤트 관리 페이지', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/events/1/manage')
  })

  test('이벤트 정보 카드가 표시되어야 함', async ({ page }) => {
    const heading = page.getByRole('heading', { name: /모임 관리/i })
    await expect(heading).toBeVisible()
  })

  test('모임 제목이 표시되어야 함', async ({ page }) => {
    const titleElement = page.locator('h2').first()
    await expect(titleElement).toBeVisible()
  })

  test('참여 현황 통계가 표시되어야 함', async ({ page }) => {
    // 참석, 미정, 불참 통계 표시 확인
    const stats = page.locator('div').filter({ has: page.getByText('참석') })
    await expect(stats.first()).toBeVisible()
  })

  test('탭 네비게이션이 표시되어야 함', async ({ page }) => {
    const tabs = page.getByRole('tablist')
    await expect(tabs).toBeVisible()

    // 각 탭 트리거 확인
    const membersTab = page.getByRole('tab', { name: /참여자/i })
    const settlementTab = page.getByRole('tab', { name: /정산/i })
    const carpoolTab = page.getByRole('tab', { name: /카풀/i })

    await expect(membersTab).toBeVisible()
    await expect(settlementTab).toBeVisible()
    await expect(carpoolTab).toBeVisible()
  })

  test('참여자 탭에서 참여자 목록이 표시되어야 함', async ({ page }) => {
    const membersTab = page.getByRole('tab', { name: /참여자/i })
    await membersTab.click()

    // 참여자 목록 표시 확인
    const memberList = page.locator('[class*="member"]')
    await expect(memberList.first()).toBeVisible()
  })

  test('정산 탭에서 수입 정보가 표시되어야 함', async ({ page }) => {
    const settlementTab = page.getByRole('tab', { name: /정산/i })
    await settlementTab.click()

    // 총 수입 섹션 표시 확인
    const totalRevenueHeading = page.getByRole('heading', { name: /총 수입/i })
    await expect(totalRevenueHeading).toBeVisible()
  })

  test('카풀 탭이 표시되어야 함', async ({ page }) => {
    const carpoolTab = page.getByRole('tab', { name: /카풀/i })
    await expect(carpoolTab).toBeVisible()

    await carpoolTab.click()
    // 카풀 섹션 표시 확인
    const carpoolSection = page.getByText(/아직 카풀 신청/i)
    await expect(carpoolSection).toBeVisible()
  })
})

test.describe('초대 링크 페이지', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/join/test-invite-code')
  })

  test('이벤트 정보가 표시되어야 함', async ({ page }) => {
    const eventImage = page.locator('img').first()
    await expect(eventImage).toBeVisible()

    const eventTitle = page.getByRole('heading').first()
    await expect(eventTitle).toBeVisible()
  })

  test('참석 의사 선택 버튼들이 표시되어야 함', async ({ page }) => {
    const attendingButton = page.getByRole('button', { name: /참석/i })
    const pendingButton = page.getByRole('button', { name: /미정/i })
    const absentButton = page.getByRole('button', { name: /불참/i })

    await expect(attendingButton).toBeVisible()
    await expect(pendingButton).toBeVisible()
    await expect(absentButton).toBeVisible()
  })

  test('참석 선택 후 이름 입력 필드가 표시되어야 함', async ({ page }) => {
    const attendingButton = page.getByRole('button', { name: /참석/i }).first()
    await attendingButton.click()

    // 다음 단계로 이동
    const nextPageIndicator = page.getByText(/참석 정보 입력/i)
    await expect(nextPageIndicator).toBeVisible()

    const nameInput = page.getByPlaceholder(/이름을 입력/i)
    await expect(nameInput).toBeVisible()
  })

  test('불참 선택 후 확인이 가능해야 함', async ({ page }) => {
    const absentButton = page.getByRole('button', { name: /불참/i }).first()
    await absentButton.click()

    // 불참 확인 메시지 표시
    const confirmMessage = page.getByText(/불참으로 등록/i)
    await expect(confirmMessage).toBeVisible()
  })

  test('미정 선택 후 확인이 가능해야 함', async ({ page }) => {
    const pendingButton = page.getByRole('button', { name: /미정/i }).first()
    await pendingButton.click()

    // 미정 확인 메시지 표시
    const confirmMessage = page.getByText(/미정으로 등록/i)
    await expect(confirmMessage).toBeVisible()
  })
})

test.describe('반응형 페이지 디자인', () => {
  test('모바일(375px)에서 대시보드가 표시되어야 함', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 })
    await page.goto('/dashboard')

    const heading = page.getByRole('heading', { name: /내 모임/i })
    await expect(heading).toBeVisible()
  })

  test('태블릿(768px)에서 대시보드가 표시되어야 함', async ({ page }) => {
    await page.setViewportSize({ width: 768, height: 1024 })
    await page.goto('/dashboard')

    const heading = page.getByRole('heading', { name: /내 모임/i })
    await expect(heading).toBeVisible()
  })

  test('데스크톱(1440px)에서 대시보드가 표시되어야 함', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 })
    await page.goto('/dashboard')

    const heading = page.getByRole('heading', { name: /내 모임/i })
    await expect(heading).toBeVisible()
  })

  test('모바일에서 이벤트 관리 페이지가 표시되어야 함', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 })
    await page.goto('/events/1/manage')

    const heading = page.getByRole('heading', { name: /모임 관리/i })
    await expect(heading).toBeVisible()
  })
})
