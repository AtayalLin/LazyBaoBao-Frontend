import { test, expect } from '@playwright/test';
import { clearSession, installApiMocks } from './fixtures/api-mocks';

test.describe('員工登入與角色導向', () => {
  test('空白帳密會阻擋送出', async ({ page }) => {
    await clearSession(page);
    await installApiMocks(page);
    await page.goto('/staff-login');
    await page.getByRole('button', { name: /進入管理後台/ }).click();
    await expect(page.locator('.s-error-msg')).toHaveText('請輸入帳號與密碼');
  });

  test('錯誤帳密顯示錯誤且不進入後台', async ({ page }) => {
    await clearSession(page);
    await installApiMocks(page, { staffLogin: 'invalid' });
    await page.goto('/staff-login');
    await page.locator('input[name="email"]').fill('unknown@example.test');
    await page.locator('input[name="password"]').fill('wrong');
    await page.getByRole('button', { name: /進入管理後台/ }).click();
    await expect(page.locator('.s-error-msg')).toHaveText('找不到此帳號，請確認帳號是否正確');
  });

  test('員工登入導向 POS', async ({ page }) => {
    await clearSession(page);
    await installApiMocks(page, { staffLogin: 'STAFF' });
    await page.goto('/staff-login');
    await page.locator('input[name="email"]').fill('staff@example.test');
    await page.locator('input[name="password"]').fill('secret123');
    await page.getByRole('button', { name: /進入管理後台/ }).click();
    await expect(page).toHaveURL(/\/pos-terminal$/, { timeout: 6000 });
    await expect(page.getByText('POS 點餐')).toBeVisible();
  });

  test('分店長登入導向 RM 後台', async ({ page }) => {
    await clearSession(page);
    await installApiMocks(page, { staffLogin: 'REGION_MANAGER' });
    await page.goto('/staff-login');
    await page.locator('input[name="email"]').fill('manager@example.test');
    await page.locator('input[name="password"]').fill('secret123');
    await page.getByRole('button', { name: /進入管理後台/ }).click();
    await expect(page).toHaveURL(/\/rm-dashboard$/, { timeout: 6000 });
  });

  test('老闆登入導向管理後台', async ({ page }) => {
    await clearSession(page);
    await installApiMocks(page, { staffLogin: 'ADMIN' });
    await page.goto('/staff-login');
    await page.locator('input[name="email"]').fill('admin@example.test');
    await page.locator('input[name="password"]').fill('secret123');
    await page.getByRole('button', { name: /進入管理後台/ }).click();
    await expect(page).toHaveURL(/\/manager-dashboard$/, { timeout: 6000 });
    await expect(page.locator('.page-title')).toHaveText('帳號管理');
  });
});
