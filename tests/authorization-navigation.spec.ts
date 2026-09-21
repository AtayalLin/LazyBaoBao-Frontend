import { test, expect } from '@playwright/test';
import { clearSession, installApiMocks, seedStaffSession } from './fixtures/api-mocks';

test.describe('導航與權限保護', () => {
  test('根路徑導向員工登入', async ({ page }) => {
    await clearSession(page);
    await installApiMocks(page);
    await page.goto('/');
    await expect(page).toHaveURL(/\/staff-login$/);
  });

  test('未登入不能進入 POS、RM、manager', async ({ page }) => {
    await clearSession(page);
    await installApiMocks(page);
    for (const route of ['/pos-terminal', '/rm-dashboard', '/manager-dashboard']) {
      await page.goto(route);
      await expect(page).toHaveURL(/\/staff-login$/);
    }
  });

  test('員工登入頁可導航到客戶入口', async ({ page }) => {
    await clearSession(page);
    await installApiMocks(page);
    await page.goto('/staff-login');
    await page.locator('.nav-customer').click();
    await expect(page).toHaveURL(/\/customer-login$/);
  });

  test('客戶登入頁可導航到註冊與訪客流程', async ({ page }) => {
    await clearSession(page);
    await installApiMocks(page);
    await page.goto('/customer-login');
    await page.getByRole('button', { name: /前往註冊/ }).click();
    await expect(page).toHaveURL(/\/customer-register$/);
    await page.getByRole('link', { name: /返回登入/ }).click();
    await page.getByRole('button', { name: /訪客快速點餐/ }).click();
    await expect(page).toHaveURL(/\/customer-guest$/);
  });

  test('錯誤角色不能進入 manager dashboard', async ({ page }) => {
    await clearSession(page);
    await seedStaffSession(page, 'STAFF');
    await installApiMocks(page);
    await page.goto('/manager-dashboard');
    await expect(page).toHaveURL(/\/staff-login$/);
  });

  test('正確角色可進入 manager dashboard', async ({ page }) => {
    await clearSession(page);
    await seedStaffSession(page, 'ADMIN');
    await installApiMocks(page);
    await page.goto('/manager-dashboard');
    await expect(page).toHaveURL(/\/manager-dashboard$/);
    await expect(page.locator('.page-title')).toHaveText('帳號管理');
  });
});
