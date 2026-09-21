import { test, expect } from '@playwright/test';

test('會員註冊頁可以載入地區資料', async ({ page }) => {
  await page.route('**/lazybaobao/regions/get_all', async route => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        code: 200,
        message: 'success',
        regionsList: [
          {
            id: 1,
            country: '測試國家',
            countryCode: 'TW',
            currencyCode: 'TWD',
            taxRate: 0.05,
            taxType: 'INCLUSIVE',
            usageCap: 10,
          },
        ],
      }),
    });
  });

  await page.route(
    '**/lazybaobao/global-area/get_all_branch',
    async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          code: 200,
          message: 'success',
          globalAreaList: [
            {
              id: 1,
              regionsId: 1,
              country: '測試國家',
              branch: '測試分店',
              address: '測試地址',
              phone: '0912345678',
            },
          ],
        }),
      });
    },
  );

  await page.goto('/customer-register');

  const regionSelect = page.locator('.c-region-select');

  await expect(regionSelect).toBeVisible();
  await expect(regionSelect.locator('option')).toHaveCount(1);
  await expect(regionSelect.locator('option')).toHaveText('測試國家');
  await expect(regionSelect).toHaveValue('1');
});

test('會員註冊表單會阻擋空白資料', async ({ page }) => {
  await page.route('**/lazybaobao/regions/get_all', async route => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        code: 200,
        message: 'success',
        regionsList: [
          {
            id: 1,
            country: '測試國家',
            countryCode: 'TW',
            currencyCode: 'TWD',
            taxRate: 0.05,
            taxType: 'INCLUSIVE',
            usageCap: 10,
          },
        ],
      }),
    });
  });

  await page.route(
    '**/lazybaobao/global-area/get_all_branch',
    async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          code: 200,
          message: 'success',
          globalAreaList: [],
        }),
      });
    },
  );

  await page.goto('/customer-register');

  await page.locator('.c-register-submit-btn').click();

  await expect(page.locator('.c-error-msg')).toHaveCount(3);
});

test('會員可以完成註冊流程', async ({ page }) => {
  await page.route('**/lazybaobao/regions/get_all', async route => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        code: 200,
        message: 'success',
        regionsList: [
          {
            id: 1,
            country: '測試國家',
            countryCode: 'TW',
            currencyCode: 'TWD',
            taxRate: 0.05,
            taxType: 'INCLUSIVE',
            usageCap: 10,
          },
        ],
      }),
    });
  });

  await page.route(
    '**/lazybaobao/global-area/get_all_branch',
    async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          code: 200,
          message: 'success',
          globalAreaList: [],
        }),
      });
    },
  );

  await page.route('**/lazybaobao/members/register_member', async route => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        code: 200,
        message: '註冊成功',
      }),
    });
  });

  await page.goto('/customer-register');

  await page.locator('input[name="name"]').fill('測試使用者');
  await page.locator('input[name="phone"]').fill('0912345678');
  await page.locator('input[name="password"]').fill('123456');
  await page.locator('input[name="confirmPassword"]').fill('123456');

  await page.locator('.c-register-submit-btn').click();

  await expect(page.locator('.c-success-modal')).toBeVisible();
  await expect(page.getByText('註冊會員成功 ! !')).toBeVisible();
});