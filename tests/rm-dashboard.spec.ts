import { test, expect } from '@playwright/test';
import { clearSession, installApiMocks, seedStaffSession } from './fixtures/api-mocks';

test.describe('分店長後台核心導航', () => {
  test.beforeEach(async ({ page }) => {
    await clearSession(page);
    await seedStaffSession(page, 'REGION_MANAGER');
    await installApiMocks(page);
    await page.goto('/rm-dashboard');
  });

  test('載入人員管理與主要頁籤', async ({ page }) => {
    await expect(page.locator('.topbar-title')).toHaveText('人員管理');
    for (const tab of ['庫存管理', '活動一覽', '財務報表', '人員管理']) {
      await page.locator('.sidebar-nav .nav-item').filter({ hasText: tab }).click();
      await expect(page.locator('.topbar-title')).toContainText(tab);
    }
  });
});
