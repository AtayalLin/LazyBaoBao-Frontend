import { Page, Route } from '@playwright/test';
import { branch, inventoryItem, member, product, region, staffByRole } from './test-data';

type Role = keyof typeof staffByRole;
type MockOptions = {
  memberLogin?: 'success' | 'invalid' | 'error';
  staffLogin?: Role | 'invalid' | 'error';
  register?: 'success' | 'error';
  menu?: 'success' | 'empty' | 'error';
  ordering?: 'success' | 'error';
};

export async function clearSession(page: Page): Promise<void> {
  await page.addInitScript(() => sessionStorage.clear());
}

export async function installApiMocks(page: Page, options: MockOptions = {}): Promise<void> {
  const settings: Required<MockOptions> = {
    memberLogin: 'success',
    staffLogin: 'STAFF',
    register: 'success',
    menu: 'success',
    ordering: 'success',
    ...options,
  };

  await page.route('**/lazybaobao/**', async (route: Route) => {
    const request = route.request();
    const url = new URL(request.url());
    const path = url.pathname;
    const method = request.method();
    const json = (body: unknown, status = 200) => route.fulfill({
      status,
      contentType: 'application/json',
      body: JSON.stringify(body),
    });

    if (path.endsWith('/regions/get_all')) return json({ code: 200, message: 'success', regionsList: [region] });
    if (path.endsWith('/global-area/get_all_branch')) return json({ code: 200, message: 'success', globalAreaList: [branch] });

    if (path.endsWith('/members/register_member')) {
      return settings.register === 'success'
        ? json({ code: 200, message: '註冊成功' })
        : json({ code: 500, message: '註冊失敗' }, 500);
    }
    if (path.endsWith('/members/login')) {
      if (settings.memberLogin === 'error') return json({ code: 500, message: 'backend unavailable' }, 500);
      if (settings.memberLogin === 'invalid') return json({ code: 400, message: '密碼錯誤' });
      return json({ code: 200, message: '登入成功', members: member });
    }
    if (path.endsWith('/members/logout')) return json({ code: 200, message: 'ok' });

    if (path.endsWith('/staff/auth/login')) {
      if (settings.staffLogin === 'error') return json({ code: 500, message: 'backend unavailable' }, 500);
      if (settings.staffLogin === 'invalid') return json({ code: 404, message: 'not found' });
      return json({ code: 200, message: '登入成功', staffList: [staffByRole[settings.staffLogin]], mustChangePassword: false });
    }
    if (path.endsWith('/staff/auth/logout')) return json({ code: 200, message: 'ok' });

    if (path.includes('/inventory/menu/')) {
      if (settings.menu === 'error') return json({ code: 500, message: 'menu unavailable' }, 500);
      return json({ code: 200, message: 'success', data: settings.menu === 'empty' ? [] : [{ productId: product.id, name: product.name, basePrice: 120, stockQuantity: 10, category: product.category, style: product.style }] });
    }
    if (path.includes('/inventory/branch/')) return json({ code: 200, message: 'success', data: [inventoryItem] });
    if (path.endsWith('/product/list')) return json({ code: 200, message: 'success', productList: [product] });
    if (path.endsWith('/product/categories')) return json([{ id: 1, name: product.category }]);
    if (path.endsWith('/product/styles')) return json([{ id: 1, name: product.style }]);

    if (path.endsWith('/cart/sync')) {
      if (settings.ordering === 'error') return json({ code: 500, message: 'cart unavailable' }, 500);
      return json({ code: 200, message: 'success', cartId: 9001, availablePromotions: [], cartDetails: [] });
    }
    if (path.endsWith('/orders/create_orders')) {
      if (settings.ordering === 'error') return json({ code: 500, message: 'order unavailable' }, 500);
      return json({ code: 200, message: 'success', id: 'E2E-ORDER', orderDateId: '20260921', totalAmount: 120, status: 'WAITING' });
    }
    if (path.endsWith('/orders/pay')) return json({ code: 200, message: 'ok' });
    if (path.includes('/orders/')) return json({ code: 200, message: 'success', getOrderVoList: [] });

    if (path.endsWith('/staff/admin/staff')) return json({ code: 200, message: 'success', staffList: Object.values(staffByRole) });
    if (path.includes('/promotions/')) return json({ code: 200, message: 'success', promotionList: [], promotions: [], data: [] });
    if (path.includes('/discount/')) return json({ code: 200, message: 'success', discountList: [] });
    if (path.includes('/reports/')) return json({ code: 200, message: 'success', reportList: [], monthlyReportList: [], data: [] });
    if (path.includes('/exchange-rates/')) return json({ code: 200, message: 'success', exchangeRateList: [] });

    if (method === 'GET') return json({ code: 200, message: 'success', data: [], list: [] });
    return json({ code: 200, message: 'success' });
  });
}

export async function seedStaffSession(page: Page, role: Role = 'STAFF'): Promise<void> {
  const staff = staffByRole[role];
  await page.addInitScript(({ staff: savedStaff, role: savedRole }) => {
    sessionStorage.setItem('currentStaff', JSON.stringify(savedStaff));
    sessionStorage.setItem('currentUser', JSON.stringify({ id: savedStaff.id, role: savedRole, name: savedStaff.name, phone: '', email: savedStaff.account, password: '' }));
  }, {
    staff,
    role: role === 'ADMIN' ? 'boss' : role === 'REGION_MANAGER' ? 'branch_manager' : 'staff',
  });
}
