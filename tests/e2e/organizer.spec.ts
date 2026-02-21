import { test, expect } from '@playwright/test'

test.describe('주최자 플로우 E2E 테스트', () => {
  let eventId: string
  let inviteCode: string

  test('1. 로그인', async ({ page }) => {
    await page.goto('/login')

    // 로그인 페이지 로드 확인
    await expect(page).toHaveTitle(/로그인|모임/)

    // 이메일 및 비밀번호 입력
    await page.fill('input[type="email"]', 'demo@example.com')
    await page.fill('input[type="password"]', 'demo123')

    // 로그인 버튼 클릭
    await page.click('button[type="submit"]')

    // 대시보드로 리다이렉트 확인
    await page.waitForURL('/dashboard')
    await expect(page).toHaveURL('/dashboard')
  })

  test('2. 모임 생성', async ({ page }) => {
    await page.goto('/dashboard')

    // "새 모임" 또는 "모임 생성" 버튼 찾기
    const createButton = page
      .locator('button')
      .filter({ hasText: /새|생성|추가/ })
      .first()
    await createButton.click()

    // /events/new 페이지로 이동 확인
    await page.waitForURL('/events/new')

    // 모임 생성 폼 입력
    await page.fill('input[placeholder*="모임|제목"]', '팀 야유회 2026')
    await page.fill('input[type="date"]', '2026-03-15')
    await page.fill('input[type="time"]', '14:00')
    await page.fill('input[placeholder*="장소|위치"]', '남산공원')
    await page.fill('input[type="number"][placeholder*="참가|금액"]', '50000')
    await page.fill('input[placeholder*="최대|인원"]', '20')

    // 설명 입력 (텍스트에어리아가 있을 경우)
    const descriptionField = page.locator('textarea')
    if ((await descriptionField.count()) > 0) {
      await descriptionField.first().fill('즐거운 팀 야유회입니다!')
    }

    // 제출 버튼 클릭
    const submitButton = page
      .locator('button[type="submit"]')
      .filter({ hasText: /생성|제출/ })
    await submitButton.click()

    // 모임 관리 페이지로 리다이렉트 확인
    await page.waitForURL(/\/events\/[^/]+\/manage/)
    const url = page.url()
    const match = url.match(/\/events\/([^/]+)\/manage/)
    if (match) {
      eventId = match[1]
    }

    // 모임 정보 확인
    await expect(page.locator('h1, h2')).toContainText(/모임 관리|야유회/)
  })

  test('3. 초대 링크 공유', async ({ page }) => {
    await page.goto(`/events/${eventId}/manage`)

    // 초대 링크 버튼 클릭
    const shareButton = page.locator('button').filter({ hasText: /초대|공유/ })
    await shareButton.click()

    // 모달 표시 확인
    await expect(page.locator('text=초대 링크')).toBeVisible()

    // 초대 링크 텍스트 복사
    const linkInput = page.locator('input[readonly][value*="/join/"]')
    const link = await linkInput.inputValue()
    const codeMatch = link.match(/\/join\/([a-zA-Z0-9_-]+)/)
    if (codeMatch) {
      inviteCode = codeMatch[1]
    }

    // 복사 버튼 클릭
    const copyButton = page
      .locator('button')
      .filter({ hasText: /복사/ })
      .first()
    await copyButton.click()

    // 모달 닫기
    await page.keyboard.press('Escape')
  })

  test('4. 참여 현황 확인', async ({ page }) => {
    await page.goto(`/events/${eventId}/manage`)

    // 참석/미정/불참 현황 표시 확인
    const participantStats = page.locator('text=/참석|미정|불참/')
    await expect(participantStats).toBeVisible()
  })

  test('5. 정산 관리', async ({ page }) => {
    await page.goto(`/events/${eventId}/manage`)

    // 정산 탭 클릭
    const settlementTab = page.locator('button').filter({ hasText: /정산/ })
    await settlementTab.click()

    // 1인당 금액 표시 확인
    await expect(page.locator('text=/1인당|금액/')).toBeVisible()

    // 정산 현황 텍스트 확인 (금액이 표시되어야 함)
    const priceDisplay = page.locator('text=/원/')
    await expect(priceDisplay).toBeVisible()

    // 납부 상태 정보 표시
    const paymentInfo = page.locator('text=/납부|미납/')
    await expect(paymentInfo).toBeVisible()
  })

  test('6. 카풀 관리', async ({ page }) => {
    await page.goto(`/events/${eventId}/manage`)

    // 카풀 탭 클릭
    const carpoolTab = page.locator('button').filter({ hasText: /카풀/ })
    await carpoolTab.click()

    // 카풀 폼이 보이는지 확인
    const carpoolForm = page.locator('text=/운전자|카풀/')
    await expect(carpoolForm).toBeVisible()

    // 탑승 가능 인원 입력
    const seatsInput = page.locator('input[placeholder*="1-7"]')
    await seatsInput.fill('4')

    // 출발 장소 입력
    const departureInput = page.locator('input[placeholder*="출발|장소"]')
    await departureInput.fill('강남역 1번 출구')

    // 카풀 등록 버튼 클릭
    const registerButton = page
      .locator('button')
      .filter({ hasText: /카풀|등록/ })
      .first()
    await registerButton.click()

    // 성공 토스트 확인
    await expect(page.locator('text=/성공|등록|카풀/')).toBeVisible()
  })

  test('7. 공지사항 작성', async ({ page }) => {
    await page.goto(`/events/${eventId}/manage`)

    // 공지 탭 클릭
    const noticeTab = page.locator('button').filter({ hasText: /공지/ })
    await noticeTab.click()

    // 공지사항 입력 필드 찾기
    const noticeTextarea = page.locator('textarea').first()
    await noticeTextarea.fill('내일 날씨가 좋다고 하니 우산을 꼭 챙겨오세요!')

    // 공지 작성 버튼 클릭
    const submitButton = page
      .locator('button')
      .filter({ hasText: /작성|작성하기|제출/ })
      .first()
    await submitButton.click()

    // 성공 토스트 확인
    await expect(page.locator('text=/성공|작성/')).toBeVisible()

    // 작성한 공지가 목록에 표시되는지 확인
    await expect(page.locator('text=/우산|날씨/')).toBeVisible()
  })
})
