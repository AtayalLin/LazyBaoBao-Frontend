# 懶飽飽 LazyBaoBao

> Angular 19 + TypeScript 餐飲點餐與營運管理系統  
> 涵蓋客戶點餐、員工 POS、分店管理與老闆管理後台。

![LazyBaoBao Logo](public/assets/Logo.png)

---

## 專案簡介

**懶飽飽（LazyBaoBao）** 是一套以 Angular 19 + TypeScript 開發的餐飲點餐與營運管理系統。

系統主要涵蓋三類使用情境：

- **客戶端**
  - 會員登入 / 註冊
  - 訪客點餐
  - 商品瀏覽
  - 購物車
  - 結帳
  - 訂單追蹤
  - 會員訂單紀錄

- **員工 / 分店 POS**
  - 現場點餐
  - 購物車與結帳
  - 訂單看板
  - 庫存查詢
  - 活動資訊
  - 分店人員管理

- **管理後台**
  - 帳號管理
  - 商品管理
  - 庫存管理
  - 活動管理
  - 稅率設定
  - 訂單與報表相關功能

專案前端主要以 **Angular 19 Standalone Components、TypeScript、Angular Signals、RxJS** 建構，並與 Spring Boot + MySQL 後端 RESTful API 整合。

---

## Repository 說明

本 repository 為 **團隊專案前端部分的獨立整理版本**。

我在原團隊專案中負責主要前端開發與架構整合；團隊專案結束後，另外將前端整理成獨立 repository，用於：

- 前端程式碼整理
- 測試補強
- Playwright E2E 自動化測試
- API Mock 測試
- 技術文件補充
- 求職作品展示
- 後續前端實驗與維護

本 repository **不重新製造或偽造原團隊 Git commit history**。

完整團隊協作與原始開發歷程可參考：

- 原團隊前端開發歷程  
  https://github.com/Toung0507/global_meals/tree/dev-Ataya-Branches

- 後端 repository  
  https://github.com/Toung0507/global_meals_gradle/tree/dev-Ataya

---

## 我的主要負責內容

在團隊開發期間主要負責前端：

- Angular 前端架構規劃
- 多角色 UI 與路由設計
- Angular Signals 狀態管理
- 客戶端點餐流程
- POS 操作流程
- 管理後台介面
- RESTful API 串接
- 前後端資料格式對接
- 表單驗證
- 權限與 Session 處理
- Mock 資料與離線開發流程
- UI / RWD 調整
- Git 協作與版本紀錄

後續在此獨立前端 repository 中，再補強：

- Playwright E2E 測試
- API route mocking
- AI-assisted test planning
- AI-assisted test generation
- failure analysis / test healing
- regression testing
- 測試報告與文件

---

# 技術棧

| 技術 | 使用方式 |
|---|---|
| Angular | 19.x / Standalone Components |
| TypeScript | 5.6.x |
| Angular Signals | 全域與跨元件狀態管理 |
| RxJS | API 與非同步資料流程 |
| SCSS | 元件與全域樣式 |
| Bootstrap | POS / 管理後台部分 UI |
| Angular Router | 多角色頁面與權限導航 |
| RESTful API | Spring Boot API 串接 |
| sessionStorage | 登入狀態與部分使用者資料保存 |
| Playwright | E2E 自動化測試 |
| Git / GitHub | 版本控制與專案維護 |

專案中另使用 GSAP、Lottie / dotLottie、AOS 等工具處理部分 Loading 與 UI 動畫效果。

---

# 核心架構

```text
Angular Frontend
        │
        ├── Customer
        │     ├── Login / Register
        │     ├── Menu
        │     ├── Cart
        │     ├── Checkout
        │     └── Order Tracking
        │
        ├── POS
        │     ├── Ordering
        │     ├── Cart
        │     ├── Orders
        │     └── Inventory
        │
        ├── RM Dashboard
        │
        └── Manager Dashboard
                │
                ▼
        ApiService / Shared Services
                │
                ▼
          RESTful API
                │
                ▼
        Spring Boot + MySQL
```

---

# 狀態管理

專案使用 Angular Signals 處理部分全域與跨元件狀態。

例如客戶下單與 POS 訂單看板之間透過共用服務同步：

```text
客戶建立訂單
      ↓
OrderService.addOrder()
      ↓
POS 訂單看板更新
      ↓
POS 更新訂單狀態
      ↓
OrderService.updateStatus()
      ↓
客戶訂單追蹤同步更新
```

此方式讓客戶端與 POS 可以在前端狀態層維持一致的訂單流程。

---

# RESTful API 整合

API endpoint 集中管理於：

```text
src/app/shared/api.config.ts
```

API request 集中於：

```text
src/app/shared/api.service.ts
```

避免各 Component 各自硬編 API URL。

目前主要 API 類型包含：

- Cart
- Orders
- Members
- Staff
- Global Area / Branch
- Regions
- Products
- Inventory
- Promotions
- Discount
- Reports
- Exchange Rates
- Payment

前端透過 Angular `HttpClient` 與 Spring Boot backend 溝通。

---

# Backend unavailable / Mock Strategy

本專案在前端開發與自動化測試階段，不要求 backend 必須隨時啟動。

Playwright E2E 測試會使用：

```ts
page.route()
```

攔截指定 API request，回傳 deterministic mock response。

例如：

```ts
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
```

Mock response 依照前端 TypeScript interface 建立，而不是任意產生資料格式。

此方式讓：

```text
Frontend
   │
   ├── Backend 正常
   │      └── 使用真實 REST API
   │
   └── Backend unavailable / E2E Test
          └── Playwright page.route() Mock
```

前端開發與自動化測試不會完全被後端環境阻塞。

---

# Playwright E2E 自動化測試

本專案已導入 **Playwright Test** 建立 E2E regression suite。

## 最新完整測試結果

最新本機完整 regression：

```text
Total:   25
Passed:  25
Failed:  0
Skipped: 0
Flaky:   0

Pass rate: 100%

Execution time: 18.1s
Browser: Google Chrome
Workers: 2
```

執行指令：

```bash
npx playwright test --project="Google Chrome" --workers=2 --reporter=html
```

> 此處的 100% 指的是目前這 25 個 E2E test cases 的最終 regression pass rate，並不代表整個產品具有 100% code coverage 或 feature coverage。

---

## 目前 E2E Coverage

### Customer Registration

包含：

- Region API loading
- 必填欄位驗證
- 電話格式驗證
- 密碼驗證
- 密碼確認
- 成功註冊
- Success modal

### Customer Login

包含：

- 空白帳號驗證
- 正確登入
- Session 建立
- 錯誤密碼
- 國家 / 分店操作

### Staff Login

包含：

- 空白帳密
- 錯誤帳密
- STAFF role
- REGION_MANAGER role
- ADMIN role
- 不同角色登入後 route 導向

### Navigation

包含：

- `/` 預設導向
- Staff → Customer 入口
- Customer → Staff 入口
- Register / Guest 等主要流程導航

### Authorization

包含：

- 未登入存取 POS
- 未登入存取 RM Dashboard
- 未登入存取 Manager Dashboard
- 錯誤角色存取
- ADMIN 正確存取管理後台

### POS

包含：

- 商品資料載入
- 加入購物車
- Payment mode 切換
- Cart API failure resilience

### Manager Dashboard

包含：

- 預設管理頁
- 主要管理頁籤導航

### RM Dashboard

包含：

- Personnel
- Inventory
- Promotions
- Finance
- 其他主要管理頁籤導航

---

# API Mock Coverage

E2E mock helper 集中於：

```text
tests/fixtures/api-mocks.ts
```

目前涵蓋的 API 包含：

```text
regions/get_all
global-area/get_all_branch

members/register_member
members/login
members/logout

staff/auth/login
staff/auth/logout
staff/admin/staff

inventory/menu/:globalAreaId
inventory/branch/:areaId

product/list
product/categories
product/styles

cart/sync

orders/create_orders
orders/pay
orders/*

promotions/*
discount/*
reports/*
exchange-rates/*
```

測試過程：

- 不呼叫正式 backend
- 不呼叫真實付款服務
- 不呼叫會產生費用的第三方服務
- 不建立真實交易資料

---

# AI-assisted Testing Workflow

除了 Playwright，本專案也使用 AI Agent 協助建立與維護測試流程。

完整流程：

```text
Project Analysis
       ↓
Route / Component Analysis
       ↓
Test Planning
       ↓
Critical User Journey Selection
       ↓
Playwright Test Generation
       ↓
API Mock Generation
       ↓
Automated Execution
       ↓
Failure Classification
       ↓
Test Healing
       ↓
Regression Testing
       ↓
HTML / Markdown Report
       ↓
Human Review
```

AI Agent 主要協助：

- 掃描 Angular routes
- 分析 Component / Service
- 建立測試計畫
- 產生 Playwright spec
- 建立 API mock fixture
- 執行 E2E
- 分析失敗原因
- 修復 locator / test implementation
- 重跑 regression
- 整理測試報告

但 AI **不直接決定 production code 修改**。

測試流程限制：

- 不允許自動修改 `src/**`
- 不因測試失敗直接降低 assertion
- 不把 failed test 改成 skip 來取得全綠結果
- 不進行無限制 healing
- 不呼叫真實支付服務
- production bug 需另外記錄並由人工確認

---

# Test Healing

初次 regression 曾發現 3 個 locator 相關測試失敗。

### Authorization Navigation

原問題：

```text
getByRole('link')
```

與實際 DOM accessibility role 不一致。

調整為既有且穩定的：

```text
.nav-customer
```

並保留 URL assertion。

---

### RM Dashboard

原問題：

```text
getByText('人員管理')
```

同時 match：

- sidebar
- topbar
- content

造成 Playwright strict mode failure。

Healing 後改驗證唯一：

```text
.topbar-title
```

並保留頁籤 navigation assertion。

---

### Staff / Manager Dashboard

原問題：

```text
getByText('帳號管理')
```

同時 match 多個 DOM element。

Healing 後改使用：

```text
.page-title
```

並保留：

```text
/manager-dashboard
```

route assertion。

---

修復原則不是「讓測試變綠」，而是：

```text
保留原本行為驗證
        +
使用更穩定 locator
```

三個案例修復後皆通過，最終完整 regression：

```text
25 / 25 passed
```

---

# Testing Documents

測試規劃：

```text
specs/playwright-test-plan.md
```

測試執行結果：

```text
specs/playwright-test-results.md
```

Playwright HTML Report：

```text
playwright-report/
```

---

# Tests Structure

```text
tests/
├── fixtures/
│   ├── api-mocks.ts
│   └── test-data.ts
│
├── authorization-navigation.spec.ts
├── customer-login.spec.ts
├── example.spec.ts
├── manager-dashboard.spec.ts
├── pos-terminal.spec.ts
├── rm-dashboard.spec.ts
├── seed.spec.ts
└── staff-login.spec.ts
```

---

# Testing Principles

此專案測試策略優先考慮：

- Critical User Journey
- Regression Value
- Stable Locator
- Deterministic API Mock
- Role / Permission
- Form Validation
- Backend failure resilience

避免：

- 為了測試數量測 trivial UI
- Pixel-perfect CSS assertions
- 過度依賴 `nth-child`
- 大量 `waitForTimeout()`
- 為了取得綠燈降低 assertion
- 將 production bug 直接改成測試通過

---

# 如何執行測試

安裝 dependency：

```bash
npm install
```

執行完整 Playwright E2E：

```bash
npx playwright test --project="Google Chrome" --workers=2
```

產生 HTML report：

```bash
npx playwright test --project="Google Chrome" --workers=2 --reporter=html
```

查看最近一次 HTML report：

```bash
npx playwright show-report
```

---

# 開發環境

安裝 dependency：

```bash
npm install
```

啟動 Angular：

```bash
npm start
```

或：

```bash
ng serve
```

預設：

```text
http://localhost:4200
```

---

# 主要 Route

| Route | 功能 |
|---|---|
| `/` | 預設入口 |
| `/staff-login` | 員工 / 管理人員登入 |
| `/customer-login` | 客戶登入 |
| `/customer-register` | 客戶註冊 |
| `/customer-guest` | 訪客快速點餐 |
| `/customer-home` | 客戶點餐主頁 |
| `/customer-member` | 會員中心 |
| `/pos-terminal` | POS |
| `/rm-dashboard` | 分店長管理 |
| `/manager-dashboard` | 老闆管理後台 |
| `/qr-entry` | QR Code 入口 |
| `/mobile-pay` | 行動付款確認 |
| `/payment/result` | 付款結果 |
| `/payment/cancel` | 付款取消 |

---

# 客戶端主要功能

## 登入 / 註冊

- 會員登入
- 會員註冊
- 訪客快速登入
- 國家 / 地區資料
- Session 保存
- 表單驗證

## 商品

- 商品清單
- 分類篩選
- 關鍵字搜尋
- 商品圖片
- 商品價格

## 購物車

- 新增
- 增減數量
- 移除
- 清空
- 小計
- 贈品
- Promotion

## Checkout

支援：

- 信用卡 Demo
- 行動支付 Demo
- 現金流程

並包含：

- 表單驗證
- 訂單預覽
- 防止重複送出
- 建立訂單
- 支付狀態
- 訂單追蹤

---

# POS 主要功能

- 商品篩選
- 商品搜尋
- POS Cart
- 會員 / 訪客模式
- Promotion
- Discount
- Payment Method
- 現金計算
- Order Dashboard
- Inventory
- Staff Management
- Role-based UI

---

# 管理後台主要功能

管理端包含：

- 帳號管理
- 商品管理
- 庫存管理
- Promotion
- Regions / Tax
- Reports
- Staff / Branch 管理

不同角色透過 route / session / role 控制可存取頁面與功能。

---

# QR Code / Mobile Pay Demo

行動支付 Demo 可透過目前網站 origin 產生手機付款頁 URL。

流程：

```text
Checkout
   ↓
產生 Mobile Pay URL
   ↓
QR Code
   ↓
手機開啟 /mobile-pay
   ↓
確認付款
   ↓
訂單完成
```

若使用 localhost，手機無法直接存取本機網址。

Demo 展示時可使用 ngrok：

```bash
ngrok http 4200
```

再以產生的 HTTPS URL 開啟網站。

---

# 專案結構

```text
src/
└── app/
    ├── global_meals_login/
    │   ├── staff-login/
    │   ├── customer-login/
    │   ├── customer-register/
    │   └── customer-guest/
    │
    ├── customer-home/
    ├── customer-member/
    ├── manager-dashboard/
    ├── rm-dashboard/
    ├── pos-terminal/
    │
    ├── shared/
    │   ├── api.config.ts
    │   ├── api.service.ts
    │   ├── auth.service.ts
    │   ├── branch.service.ts
    │   ├── loading.service.ts
    │   └── order.service.ts
    │
    ├── app.component.*
    └── app.routes.ts

tests/
├── fixtures/
├── authorization-navigation.spec.ts
├── customer-login.spec.ts
├── manager-dashboard.spec.ts
├── pos-terminal.spec.ts
├── rm-dashboard.spec.ts
└── staff-login.spec.ts

specs/
├── playwright-test-plan.md
└── playwright-test-results.md
```

---

# Git / 版本紀錄

原團隊開發期間使用 Git 分支與 Pull Request 進行協作。

基本流程：

```bash
git checkout main
git pull origin main

git checkout dev-xxx
git merge main

git add .
git commit -m "描述"
git push origin dev-xxx
```

再透過 GitHub Pull Request 合併。

專案亦保留版本與 CHANGELOG 紀錄，用於追蹤：

- 功能新增
- Bug Fix
- UI 調整
- API 修改
- 技術決策

---

# AI 使用說明

本專案在後續整理與測試階段使用 AI coding tools 協助：

- 程式碼閱讀
- Route / Component 分析
- 測試規劃
- Playwright 測試生成
- Debug
- Failure classification
- Test healing
- 文件整理

使用 AI 的原則：

```text
AI 提供分析與實作輔助
        ↓
實際執行測試
        ↓
檢查 failure / diff
        ↓
人工確認
        ↓
保留可解釋且可維護的結果
```

AI 不取代：

- 架構判斷
- Production bug 判斷
- 最終程式碼審查
- Git commit 決策
- 測試結果確認

---

# 已驗證成果

目前最新本機 Playwright regression：

```text
25 tests
25 passed
0 failed
0 skipped
0 flaky

18.1 seconds
Google Chrome
2 workers
```

測試涵蓋：

```text
Registration
Login
Staff Role Routing
Navigation
Authorization
POS
Manager Dashboard
RM Dashboard
API Mock
Backend Failure Resilience
```

---

# 已知限制 / 後續測試方向

目前 E2E 已覆蓋主要 P0 流程，但仍不宣稱完整產品 coverage。

後續可繼續補強：

- Customer checkout 完整 E2E
- Payment cancellation semantics
- 首次登入修改密碼流程
- 更完整的 CRUD error cases
- Mobile viewport regression
- Accessibility testing
- 真實 backend integration testing
- CI 環境完整 E2E execution

部分 Dashboard API 在 E2E 中使用 minimal mock，因此真正 backend contract integration 仍需搭配 Spring Boot backend 執行。

---

# 專案重點

這個專案主要希望展示的不是單一 UI 畫面，而是完整的前端工程流程：

```text
Angular Architecture
        +
State Management
        +
RESTful API
        +
Role / Authorization
        +
POS / Business Flow
        +
Frontend / Backend Collaboration
        +
Playwright E2E
        +
API Mocking
        +
AI-assisted Testing
        +
Regression / Healing
```

---

## Author

**AtayalLin**

GitHub：

https://github.com/AtayalLin

Frontend stack：

```text
Angular 19
TypeScript
Vue 3
JavaScript
HTML5
CSS3 / SCSS
Playwright
Git / GitHub
```

---

## Documentation

- Test Plan  
  `specs/playwright-test-plan.md`

- Test Results  
  `specs/playwright-test-results.md`

- Original Team Development History  
  https://github.com/Toung0507/global_meals/tree/dev-Ataya-Branches

- Backend Repository  
  https://github.com/Toung0507/global_meals_gradle/tree/dev-Ataya

---

> 本 repository 為前端獨立整理與持續維護版本。  
> 原始團隊專案開發歷程保留於原 repository；本 repository 主要用於前端整理、自動化測試、技術文件與作品展示。