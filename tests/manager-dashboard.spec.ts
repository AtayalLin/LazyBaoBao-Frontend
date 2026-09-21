import { test, expect } from '@playwright/test';
import { clearSession, installApiMocks, seedStaffSession } from './fixtures/api-mocks';

test.describe('老闆管理後台核心導航', () => {
  test.beforeEach(async ({ page }) => {
    await clearSession(page);
    await seedStaffSession(page, 'ADMIN');
    await installApiMocks(page);
    await page.goto('/manager-dashboard');
  });

  test('預設顯示帳號管理', async ({ page }) => {
    await expect(page.locator('.page-title')).toHaveText('帳號管理');
  });

  test('七個主要頁籤可切換', async ({ page }) => {
    for (const tab of ['分店管理', '國家基本設定', '會員設定', '商品管理', '活動管理', '財務報表', '帳號管理']) {
      await page.locator('.sidebar-nav .nav-item').filter({ hasText: tab }).click();
      await expect(page.locator('.topbar-title')).toContainText(tab);
    }
  });
});
