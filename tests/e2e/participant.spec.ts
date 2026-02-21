import { test, expect } from '@playwright/test'

test.describe('참여자 플로우 E2E 테스트', () => {
  // 주최자가 생성한 모임의 초대 코드
  const testInviteCode = 'test-invite-code-123'

  test('1. 초대 링크로 참가', async ({ page }) => {
    // 초대 링크 접근 (실제 초대 코드는 주최자 테스트에서 생성됨)
    await page.goto(`/join/${testInviteCode}`)

    // 모임 정보 페이지 로드 확인
    await expect(page).toHaveTitle(/모임|초대/)

    // 모임 제목이 표시되는지 확인
    const eventTitle = page.locator('h1, h2').first()
    await expect(eventTitle).toBeVisible()
  })

  test('2. 로그인 후 참석 표시', async ({ page }) => {
    await page.goto(`/join/${testInviteCode}`)

    // "로그인" 또는 "참석" 버튼 찾기
    const actionButton = page
      .locator('button')
      .filter({ hasText: /로그인|참석|표시/ })
      .first()
    await actionButton.click()

    // 로그인이 필요한 경우 로그인 페이지로 이동
    if (page.url().includes('/login')) {
      await page.fill('input[type="email"]', 'participant@example.com')
      await page.fill('input[type="password"]', 'demo123')
      await page.click('button[type="submit"]')

      // 초대 페이지로 돌아오기
      await page.waitForURL(/\/join\//)
    }

    // 참석 상태 버튼이 표시되는지 확인 (참석/미정/불참)
    const attendanceButtons = page
      .locator('button')
      .filter({ hasText: /참석|미정|불참/ })
    await expect(attendanceButtons).toHaveCount(3)

    // 참석 버튼 클릭
    const attendButton = page.locator('button').filter({ hasText: /참석/ })
    await attendButton.click()

    // 성공 토스트 확인
    await expect(page.locator('text=/성공|참석|표시/')).toBeVisible()
  })

  test('3. 공지사항 확인', async ({ page }) => {
    await page.goto(`/join/${testInviteCode}`)

    // 참석 표시 후 모임 정보 페이지에서 공지탭으로 이동
    // (또는 별도의 공지사항 보기 기능)
    const noticeTab = page.locator('button').filter({ hasText: /공지/ })
    if (await noticeTab.isVisible()) {
      await noticeTab.click()

      // 공지사항 목록이 표시되는지 확인
      const noticeContent = page.locator('text=/공지|내용/')
      await expect(noticeContent).toBeVisible()
    }
  })

  test('4. 카풀 신청', async ({ page }) => {
    await page.goto(`/join/${testInviteCode}`)

    // 카풀 탭 또는 카풀 정보 영역 찾기
    const carpoolTab = page.locator('button').filter({ hasText: /카풀/ })
    if (await carpoolTab.isVisible()) {
      await carpoolTab.click()

      // 카풀 목록이 표시되는지 확인
      const carpoolList = page.locator('text=/카풀|탑승|운전자/')
      await expect(carpoolList).toBeVisible()

      // 카풀 신청 버튼 찾기 및 클릭
      const joinCarpoolButton = page
        .locator('button')
        .filter({ hasText: /신청|탑승|참여/ })
        .first()
      if (await joinCarpoolButton.isVisible()) {
        await joinCarpoolButton.click()

        // 성공 토스트 확인
        await expect(page.locator('text=/성공|신청|카풀/')).toBeVisible()
      }
    }
  })

  test('5. 참석 상태 변경 (참석 -> 미정)', async ({ page }) => {
    await page.goto(`/join/${testInviteCode}`)

    // 참석 상태 버튼이 표시되는지 확인
    const attendanceButtons = page
      .locator('button')
      .filter({ hasText: /참석|미정|불참/ })
    await expect(attendanceButtons).toHaveCount(3)

    // 미정 버튼 클릭
    const pendingButton = page.locator('button').filter({ hasText: /미정/ })
    await pendingButton.click()

    // 상태 변경 확인
    await expect(page.locator('text=/미정/')).toBeVisible()
  })
})
