import { test, expect } from '@playwright/test';
import { clearSession, installApiMocks } from './fixtures/api-mocks';

 test.describe('會員登入', () => {
  test.beforeEach(async ({ page }) => {
    await clearSession(page);
    await installApiMocks(page);
    await page.goto('/customer-login');
  });

  test('空白帳號會阻擋送出', async ({ page }) => {
    await page.getByRole('button', { name: /會員登入/ }).click();
    await expect(page.locator('.c-error-msg')).toHaveText('請輸入手機號碼或電子郵件');
  });

  test('正確資料登入後導向客戶首頁並建立 session', async ({ page }) => {
    await page.locator('input[name="account"]').fill('0900000000');
    await page.locator('input[name="password"]').fill('secret123');
    await page.getByRole('button', { name: /會員登入/ }).click();
    await expect(page).toHaveURL(/\/customer-home$/,
      { timeout: 6000 });
    const session = await page.evaluate(() => ({
      member: sessionStorage.getItem('currentMember'),
      user: sessionStorage.getItem('currentUser'),
    }));
    expect(session.member).toContain('測試會員');
    expect(session.user).toContain('customer');
  });

  test('錯誤密碼留在登入頁並顯示錯誤', async ({ page }) => {
    await page.unroute('**/lazybaobao/**');
    await installApiMocks(page, { memberLogin: 'invalid' });
    await page.locator('input[name="account"]').fill('0900000000');
    await page.locator('input[name="password"]').fill('wrong');
    await page.getByRole('button', { name: /會員登入/ }).click();
    await expect(page.locator('.c-error-msg')).toBeVisible();
    await expect(page).toHaveURL(/\/customer-login$/);
  });

  test('會員入口可切換國家與分店選擇器', async ({ page }) => {
    await page.locator('.c-branch-trigger').click();
    await expect(page.locator('.c-branch-dropdown')).toBeVisible();
    await page.getByRole('button', { name: '日本' }).click();
    await expect(page.getByRole('button', { name: '日本' })).toHaveClass(/is-active/);
  });
});
