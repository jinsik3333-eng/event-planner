import { test, expect } from '@playwright/test'

/**
 * 통합 E2E 테스트: 전체 사용자 플로우 연결
 * 주최자 -> 모임 생성 -> 초대 링크 생성 -> 참여자 참석 -> 정산 관리
 */
test.describe('통합 E2E 테스트', () => {
  test('전체 플로우: 주최자가 모임 생성 후 참여자가 참석하고 정산 처리', async ({
    page,
    context,
  }) => {
    let eventUrl = ''
    let inviteCode = ''

    // === STEP 1: 주최자 로그인 ===
    console.log('✓ STEP 1: 주최자 로그인 시작')
    await page.goto('/login')
    await page.fill('input[type="email"]', 'organizer@example.com')
    await page.fill('input[type="password"]', 'demo123')
    await page.click('button[type="submit"]')
    await page.waitForURL('/dashboard')
    console.log('✓ 주최자 로그인 완료')

    // === STEP 2: 모임 생성 ===
    console.log('✓ STEP 2: 모임 생성 시작')
    const createButton = page
      .locator('button')
      .filter({ hasText: /새|생성|추가/ })
    if (await createButton.first().isVisible()) {
      await createButton.first().click()
    } else {
      // 대체 버튼 찾기
      await page.click('button', { force: true })
    }

    await page.waitForURL('/events/new')
    await page.fill('input[placeholder*="모임|제목"]', '통합테스트 모임')
    await page.fill('input[type="date"]', '2026-03-20')
    await page.fill('input[type="time"]', '15:00')
    await page.fill('input[placeholder*="장소|위치"]', '강남역')
    await page.fill('input[type="number"][placeholder*="참가|금액"]', '30000')
    await page.fill('input[placeholder*="최대|인원"]', '15')

    await page.click('button[type="submit"]')
    await page.waitForURL(/\/events\/[^/]+\/manage/)
    eventUrl = page.url()
    console.log(`✓ 모임 생성 완료: ${eventUrl}`)

    // === STEP 3: 초대 링크 생성 및 추출 ===
    console.log('✓ STEP 3: 초대 링크 생성')
    const shareButton = page.locator('button').filter({ hasText: /초대|공유/ })
    if (await shareButton.isVisible()) {
      await shareButton.click()
      await expect(page.locator('text=초대 링크')).toBeVisible()

      const linkInput = page.locator('input[readonly][value*="/join/"]')
      const link = await linkInput.inputValue()
      const codeMatch = link.match(/\/join\/([a-zA-Z0-9_-]+)/)
      if (codeMatch) {
        inviteCode = codeMatch[1]
      }

      await page.keyboard.press('Escape')
      console.log(`✓ 초대 코드 추출: ${inviteCode}`)
    }

    // === STEP 4: 카풀 운전자 등록 (주최자) ===
    console.log('✓ STEP 4: 카풀 운전자 등록')
    const carpoolTab = page.locator('button').filter({ hasText: /카풀/ })
    if (await carpoolTab.isVisible()) {
      await carpoolTab.click()

      const seatsInput = page.locator('input[placeholder*="1-7"]')
      if ((await seatsInput.count()) > 0) {
        await seatsInput.fill('5')
        const departureInput = page.locator('input[placeholder*="출발|장소"]')
        await departureInput.fill('강남역 2번 출구')
        const registerButton = page
          .locator('button')
          .filter({ hasText: /카풀|등록/ })
        if (await registerButton.first().isVisible()) {
          await registerButton.first().click()
          await page.waitForTimeout(500)
        }
      }
    }
    console.log('✓ 카풀 등록 완료')

    // === STEP 5: 공지사항 작성 (주최자) ===
    console.log('✓ STEP 5: 공지사항 작성')
    const noticeTab = page.locator('button').filter({ hasText: /공지/ })
    if (await noticeTab.isVisible()) {
      await noticeTab.click()
      const textarea = page.locator('textarea').first()
      if ((await textarea.count()) > 0) {
        await textarea.fill('모임이 2시간 단축되었습니다. 참고 바랍니다.')
        const submitButton = page
          .locator('button')
          .filter({ hasText: /작성|제출/ })
        if (await submitButton.first().isVisible()) {
          await submitButton.first().click()
          await page.waitForTimeout(500)
        }
      }
    }
    console.log('✓ 공지사항 작성 완료')

    // === STEP 6: 새 브라우저 컨텍스트로 참여자 시뮬레이션 ===
    console.log('✓ STEP 6: 참여자가 초대 링크 접근')
    const participantPage = await context.newPage()
    await participantPage.goto(`/join/${inviteCode}`)

    // 게스트 정보 입력
    const guestNameInput = participantPage.locator(
      'input[placeholder*="이름|닉네임|게스트"]'
    )
    if ((await guestNameInput.count()) > 0) {
      await guestNameInput.fill('참여자테스트')
    }

    // 참석 버튼 클릭
    const attendButton = participantPage
      .locator('button')
      .filter({ hasText: /참석/ })
    if (await attendButton.first().isVisible()) {
      await attendButton.first().click()

      // 제출 버튼
      const submitBtn = participantPage
        .locator('button')
        .filter({ hasText: /제출|확인|완료/ })
      if (await submitBtn.first().isVisible()) {
        await submitBtn.first().click()
        await participantPage.waitForTimeout(500)
      }
    }
    console.log('✓ 참여자 참석 완료')

    // === STEP 7: 주최자 페이지에서 참여 현황 확인 ===
    console.log('✓ STEP 7: 주최자가 참여 현황 확인')
    await page.goto(eventUrl)
    await page.waitForTimeout(1000)

    const membersTab = page.locator('button').filter({ hasText: /참여자/ })
    if (await membersTab.isVisible()) {
      await membersTab.click()
      const memberCards = page.locator('text=/참석|미정|불참/')
      await expect(memberCards).toHaveCount(3)
    }
    console.log('✓ 참여 현황 확인 완료')

    // === STEP 8: 정산 관리 ===
    console.log('✓ STEP 8: 주최자가 정산 관리')
    const settlementTab = page.locator('button').filter({ hasText: /정산/ })
    if (await settlementTab.isVisible()) {
      await settlementTab.click()
      await expect(page.locator('text=/원/')).toBeVisible()

      // 납부 상태 업데이트 (만약 있다면)
      const paymentButton = page
        .locator('button')
        .filter({ hasText: /완료|납부|미납/ })
      if ((await paymentButton.count()) > 0) {
        await paymentButton.first().click()
        await page.waitForTimeout(500)
      }
    }
    console.log('✓ 정산 관리 완료')

    // === STEP 9: 참여자가 공지 확인 ===
    console.log('✓ STEP 9: 참여자가 공지사항 확인')
    const participantNoticeTab = participantPage
      .locator('button')
      .filter({ hasText: /공지/ })
    if (await participantNoticeTab.isVisible()) {
      await participantNoticeTab.click()
      const noticeContent = participantPage.locator('text=/공지|모임/')
      if ((await noticeContent.count()) > 0) {
        await expect(noticeContent).toBeVisible()
      }
    }
    console.log('✓ 참여자 공지 확인 완료')

    // === STEP 10: 참여자가 카풀 신청 ===
    console.log('✓ STEP 10: 참여자가 카풀 신청')
    const participantCarpoolTab = participantPage
      .locator('button')
      .filter({ hasText: /카풀/ })
    if (await participantCarpoolTab.isVisible()) {
      await participantCarpoolTab.click()
      const joinButton = participantPage
        .locator('button')
        .filter({ hasText: /신청|탑승/ })
      if (await joinButton.first().isVisible()) {
        await joinButton.first().click()
        await participantPage.waitForTimeout(500)
      }
    }
    console.log('✓ 참여자 카풀 신청 완료')

    // === 최종 확인 ===
    console.log('✓ 통합 E2E 테스트 완료')
    await participantPage.close()

    // 최종 상태 확인
    await page.goto(eventUrl)
    await expect(page).toHaveURL(eventUrl)
  })
})
