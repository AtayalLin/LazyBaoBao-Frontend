export const region = {
  id: 1,
  country: '測試國家',
  countryCode: 'TW',
  currencyCode: 'TWD',
  taxRate: 0.05,
  taxType: 'INCLUSIVE',
  usageCap: 10,
};

export const branch = {
  id: 19,
  regionsId: region.id,
  country: region.country,
  branch: '測試分店',
  address: '測試地址',
  phone: '0900000000',
};

export const member = {
  id: 101,
  name: '測試會員',
  phone: '0900000000',
  orderCount: 1,
  discount: false,
};

export const staffByRole = {
  ADMIN: { id: 201, name: '測試老闆', account: 'admin@example.test', role: 'ADMIN', globalAreaId: branch.id, status: true, hireAt: '2026-01-01' },
  REGION_MANAGER: { id: 202, name: '測試分店長', account: 'manager@example.test', role: 'REGION_MANAGER', globalAreaId: branch.id, status: true, hireAt: '2026-01-01' },
  STAFF: { id: 203, name: '測試員工', account: 'staff@example.test', role: 'STAFF', globalAreaId: branch.id, status: true, hireAt: '2026-01-01' },
};

export const product = {
  id: 301,
  name: '測試拉麵',
  category: '麵食',
  style: '日式簡約',
  description: 'E2E 測試商品',
  active: true,
  foodImgBase64: '',
};

export const inventoryItem = {
  productId: product.id,
  productName: product.name,
  category: product.category,
  style: product.style,
  globalAreaId: branch.id,
  branchName: branch.branch,
  basePrice: 120,
  costPrice: 60,
  stockQuantity: 10,
  maxOrderQuantity: 5,
  active: true,
};
