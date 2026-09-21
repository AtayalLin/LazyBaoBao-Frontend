import { test, expect } from '@playwright/test';
import { clearSession, installApiMocks, seedStaffSession } from './fixtures/api-mocks';

test.describe('POS 核心流程', () => {
  test.beforeEach(async ({ page }) => {
    await clearSession(page);
    await seedStaffSession(page, 'STAFF');
    await installApiMocks(page);
    await page.goto('/pos-terminal');
  });

  test('載入商品並加入購物車', async ({ page }) => {
    await expect(page.locator('.prod-card')).toHaveCount(1);
    await page.locator('.prod-card').click();
    await expect(page.locator('.cart-row')).toContainText('測試拉麵');
    await expect(page.locator('.cart-summary')).toContainText('120');
  });

  test('可切換會員/訪客與付款方式', async ({ page }) => {
    await page.getByRole('button', { name: '訪客', exact: true }).click();
    await expect(page.getByText('訪客模式')).toBeVisible();
    await page.getByText('信用卡', { exact: true }).click();
    await expect(page.locator('.pay-btn.active')).toContainText('信用卡');
  });

  test('購物車同步失敗時 POS 仍保持可用', async ({ page }) => {
    await page.unroute('**/lazybaobao/**');
    await installApiMocks(page, { ordering: 'error' });
    await page.reload();
    await expect(page.locator('.prod-card')).toHaveCount(1);
    await page.locator('.prod-card').click();
    await expect(page.locator('.cart-row')).toContainText('測試拉麵');
  });
});
