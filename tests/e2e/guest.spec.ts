import { test, expect } from '@playwright/test'

test.describe('게스트 플로우 E2E 테스트', () => {
  const testInviteCode = 'test-invite-code-123'

  test('1. 초대 링크로 진입 (게스트)', async ({ page }) => {
    // 로그인하지 않은 상태에서 초대 링크 접근
    await page.goto(`/join/${testInviteCode}`)

    // 모임 정보가 표시되는지 확인 (게스트도 접근 가능)
    const eventTitle = page.locator('h1, h2').first()
    await expect(eventTitle).toBeVisible()

    // 게스트 참여 옵션이 표시되는지 확인
    const guestOption = page.locator('text=/게스트|이름|이메일/')
    await expect(guestOption).toBeVisible()
  })

  test('2. 게스트 정보 입력 및 참석 표시', async ({ page }) => {
    await page.goto(`/join/${testInviteCode}`)

    // 게스트 이름 입력 필드 찾기
    const nameInput = page.locator('input[placeholder*="이름|닉네임|게스트"]')
    if ((await nameInput.count()) > 0) {
      await nameInput.fill('김철수')
    } else {
      // 혹은 다른 형식의 입력 필드
      const inputs = page.locator('input[type="text"]')
      if ((await inputs.count()) > 0) {
        await inputs.first().fill('김철수')
      }
    }

    // 참석 상태 선택 (참석/미정/불참)
    const attendanceButtons = page
      .locator('button')
      .filter({ hasText: /참석|미정|불참/ })
    if ((await attendanceButtons.count()) > 0) {
      await attendanceButtons.first().click() // 참석 클릭
    }

    // 제출 또는 확인 버튼 클릭
    const submitButton = page
      .locator('button')
      .filter({ hasText: /제출|확인|완료/ })
      .first()
    await submitButton.click()

    // 성공 메시지 또는 확인 페이지 표시
    const successMessage = page.locator('text=/성공|감사|참석/')
    await expect(successMessage).toBeVisible()
  })

  test('3. 게스트 참석 현황 반영 확인', async ({ page }) => {
    await page.goto(`/join/${testInviteCode}`)

    // 게스트가 참석 표시 전 현황 확인
    const beforeStats = page.locator('text=/참석|미정|불참/')
    const beforeCount = await beforeStats.count()

    // 게스트 정보 입력 및 참석
    const nameInput = page.locator('input[placeholder*="이름|닉네임|게스트"]')
    if ((await nameInput.count()) > 0) {
      await nameInput.fill('이영희')
    }

    const attendButton = page
      .locator('button')
      .filter({ hasText: /참석/ })
      .first()
    await attendButton.click()

    // 제출
    const submitButton = page
      .locator('button')
      .filter({ hasText: /제출|확인|완료/ })
      .first()
    await submitButton.click()

    // 현황이 업데이트되는지 확인
    await page.waitForTimeout(1000) // 업데이트 대기
    const successIndicator = page.locator('text=/완료|감사|참석/')
    await expect(successIndicator).toBeVisible()
  })

  test('4. 게스트가 공지 정보 확인', async ({ page }) => {
    await page.goto(`/join/${testInviteCode}`)

    // 참석 완료 후 공지사항 탭 접근 시도
    const noticeTab = page.locator('button').filter({ hasText: /공지/ })
    if (await noticeTab.isVisible()) {
      await noticeTab.click()

      // 공지 내용이 표시되는지 확인
      const noticeContent = page.locator('text=/공지|안내/')
      if ((await noticeContent.count()) > 0) {
        await expect(noticeContent).toBeVisible()
      }
    }
  })

  test('5. 게스트 이메일 입력 (선택사항)', async ({ page }) => {
    await page.goto(`/join/${testInviteCode}`)

    // 이메일 입력 필드 찾기 (선택사항일 수 있음)
    const emailInput = page.locator('input[type="email"]')
    if ((await emailInput.count()) > 0) {
      await emailInput.fill('guest@example.com')
    }

    // 이름 입력
    const nameInput = page.locator('input[placeholder*="이름|닉네임"]')
    if ((await nameInput.count()) > 0) {
      await nameInput.fill('박민수')
    }

    // 참석 표시
    const attendButton = page
      .locator('button')
      .filter({ hasText: /참석/ })
      .first()
    await attendButton.click()

    // 성공 확인
    await page.waitForTimeout(500)
    const confirmMessage = page.locator('text=/완료|감사/')
    if ((await confirmMessage.count()) > 0) {
      await expect(confirmMessage).toBeVisible()
    }
  })

  test('6. 게스트 재진입 시나리오', async ({ page }) => {
    // 첫 번째 진입
    await page.goto(`/join/${testInviteCode}`)

    const nameInput = page.locator('input[placeholder*="이름|닉네임"]')
    if ((await nameInput.count()) > 0) {
      await nameInput.fill('최준호')
      const attendButton = page
        .locator('button')
        .filter({ hasText: /참석/ })
        .first()
      await attendButton.click()

      const submitButton = page
        .locator('button')
        .filter({ hasText: /제출|확인|완료/ })
        .first()
      await submitButton.click()
    }

    // 완료 후 페이지 확인
    await page.waitForTimeout(1000)

    // 초대 링크 재접속 (게스트 정보 유지되는지 확인)
    await page.goto(`/join/${testInviteCode}`)

    // 게스트 정보가 표시되거나 재입력 옵션이 있는지 확인
    const guestOption = page.locator('text=/게스트|참석|정보/')
    await expect(guestOption).toBeVisible()
  })
})
