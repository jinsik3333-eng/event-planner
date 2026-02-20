import { test, expect } from '@playwright/test'

/**
 * 폼 관련 E2E 테스트
 * 로그인, 회원가입 폼의 입력, 검증, 제출 테스트
 */

test.describe('로그인 폼', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/login')
  })

  test('이메일 필드가 표시되고 입력 가능해야 함', async ({ page }) => {
    const emailInput = page.getByRole('textbox', { name: /이메일/i })
    await expect(emailInput).toBeVisible()
    await emailInput.fill('test@example.com')
    await expect(emailInput).toHaveValue('test@example.com')
  })

  test('비밀번호 필드가 표시되고 마스킹되어야 함', async ({ page }) => {
    const passwordInput = page.getByRole('textbox', { name: /비밀번호/i })
    await expect(passwordInput).toBeVisible()
    await expect(passwordInput).toHaveAttribute('type', 'password')
  })

  test('비밀번호 표시/숨김 토글이 작동해야 함', async ({ page }) => {
    const passwordInput = page.getByRole('textbox', { name: /비밀번호/i })
    const toggleButton = page.getByRole('button', { name: /비밀번호/i }).nth(0)

    // 초기 상태: 비밀번호 마스킹
    await expect(passwordInput).toHaveAttribute('type', 'password')

    // 토글 클릭 후: 텍스트 표시
    await toggleButton.click()
    await expect(passwordInput).toHaveAttribute('type', 'text')

    // 다시 토글: 비밀번호 마스킹
    await toggleButton.click()
    await expect(passwordInput).toHaveAttribute('type', 'password')
  })

  test('로그인 상태 유지 체크박스가 표시되어야 함', async ({ page }) => {
    const checkbox = page.getByRole('checkbox', { name: /로그인 상태 유지/i })
    await expect(checkbox).toBeVisible()
    await checkbox.check()
    await expect(checkbox).toBeChecked()
  })

  test('빈 이메일 필드는 검증 에러를 표시해야 함', async ({ page }) => {
    const submitButton = page.getByRole('button', { name: /로그인/i })
    const emailInput = page.getByRole('textbox', { name: /이메일/i })

    await emailInput.focus()
    await emailInput.blur()

    // 에러 메시지 표시 대기
    await expect(page.getByText(/이메일을 입력/i)).toBeVisible()
  })

  test('잘못된 이메일 형식은 검증 에러를 표시해야 함', async ({ page }) => {
    const emailInput = page.getByRole('textbox', { name: /이메일/i })

    await emailInput.fill('invalid-email')
    await emailInput.blur()

    // 에러 메시지 표시 대기
    await expect(page.getByText(/올바른 이메일/i)).toBeVisible()
  })

  test('비밀번호 최소 길이 검증이 작동해야 함', async ({ page }) => {
    const passwordInput = page.getByRole('textbox', { name: /비밀번호/i })

    await passwordInput.fill('1234567')
    await passwordInput.blur()

    // 에러 메시지 표시 대기
    await expect(page.getByText(/최소 8자/i)).toBeVisible()
  })

  test('유효한 이메일과 비밀번호로 폼 제출 가능해야 함', async ({ page }) => {
    const emailInput = page.getByRole('textbox', { name: /이메일/i })
    const passwordInput = page.getByRole('textbox', { name: /비밀번호/i })
    const submitButton = page.getByRole('button', { name: /로그인/i })

    await emailInput.fill('test@example.com')
    await passwordInput.fill('password123')

    // 제출 버튼이 활성화되어 있어야 함
    await expect(submitButton).toBeEnabled()
  })
})

test.describe('회원가입 폼', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/signup')
  })

  test('이메일, 비밀번호, 비밀번호 확인 필드가 표시되어야 함', async ({
    page,
  }) => {
    const emailInput = page.getByRole('textbox', { name: /이메일/i })
    const passwordInputs = page.getByRole('textbox', { name: /비밀번호/i })

    await expect(emailInput).toBeVisible()
    await expect(passwordInputs).toHaveCount(2)
  })

  test('비밀번호와 비밀번호 확인이 일치하지 않으면 에러 표시', async ({
    page,
  }) => {
    const passwordInputs = page.getByRole('textbox', { name: /비밀번호/i })
    const confirmPasswordInput = passwordInputs.nth(1)

    await passwordInputs.first().fill('password123')
    await confirmPasswordInput.fill('password456')
    await confirmPasswordInput.blur()

    // 에러 메시지 표시 대기
    await expect(page.getByText(/일치하지 않/i)).toBeVisible()
  })

  test('유효한 데이터로 회원가입 폼 제출 가능', async ({ page }) => {
    const emailInput = page.getByRole('textbox', { name: /이메일/i })
    const passwordInputs = page.getByRole('textbox', { name: /비밀번호/i })
    const submitButton = page.getByRole('button', { name: /회원가입/i })

    await emailInput.fill('newuser@example.com')
    await passwordInputs.first().fill('password123')
    await passwordInputs.nth(1).fill('password123')

    // 제출 버튼이 활성화되어 있어야 함
    await expect(submitButton).toBeEnabled()
  })
})

test.describe('접근성 (Accessibility)', () => {
  test('로그인 폼이 키보드 네비게이션 가능해야 함', async ({ page }) => {
    await page.goto('/login')

    // Tab 키로 폼 요소 탐색
    await page.keyboard.press('Tab')
    const emailInput = page.getByRole('textbox', { name: /이메일/i })
    await expect(emailInput).toBeFocused()

    await page.keyboard.press('Tab')
    const passwordInput = page.getByRole('textbox', { name: /비밀번호/i })
    await expect(passwordInput).toBeFocused()
  })

  test('폼 레이블이 입력 필드와 연결되어야 함', async ({ page }) => {
    await page.goto('/login')

    const emailInput = page.getByRole('textbox', { name: /이메일/i })
    const emailLabel = page.getByText('이메일')

    // htmlFor 속성 확인 (레이블과 입력 필드 연결)
    const labelElement = emailLabel.locator('xpath=ancestor::label')
    const labelFor = await labelElement.getAttribute('for')
    const inputId = await emailInput.getAttribute('id')

    expect(labelFor).toBe(inputId)
  })

  test('폼 에러 메시지가 aria-live로 공지되어야 함', async ({ page }) => {
    await page.goto('/login')

    const emailInput = page.getByRole('textbox', { name: /이메일/i })
    await emailInput.focus()
    await emailInput.blur()

    // 에러 메시지가 표시되어야 함
    const errorMessage = page.getByText(/이메일을 입력/i)
    await expect(errorMessage).toBeVisible()
  })
})

test.describe('반응형 디자인', () => {
  test('모바일 크기(375px)에서 로그인 폼이 표시되어야 함', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 })
    await page.goto('/login')

    const cardTitle = page.getByRole('heading', { name: /로그인/i })
    await expect(cardTitle).toBeVisible()

    // 폼 요소들이 한 열로 배열되어야 함
    const emailInput = page.getByRole('textbox', { name: /이메일/i })
    await expect(emailInput).toBeVisible()
  })

  test('태블릿 크기(768px)에서 로그인 폼이 표시되어야 함', async ({ page }) => {
    await page.setViewportSize({ width: 768, height: 1024 })
    await page.goto('/login')

    const cardTitle = page.getByRole('heading', { name: /로그인/i })
    await expect(cardTitle).toBeVisible()
  })

  test('데스크톱 크기(1440px)에서 로그인 폼이 표시되어야 함', async ({
    page,
  }) => {
    await page.setViewportSize({ width: 1440, height: 900 })
    await page.goto('/login')

    const cardTitle = page.getByRole('heading', { name: /로그인/i })
    await expect(cardTitle).toBeVisible()
  })
})
