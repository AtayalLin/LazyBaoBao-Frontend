# LazyBaoBao Angular Playwright 測試計畫

## 目的與範圍

本計畫針對目前 Angular 前端建立 Playwright E2E 測試藍圖，優先覆蓋會員、員工、導航、表單驗證、權限保護、POS 與管理後台核心流程。測試只在 `tests/` 新增 Playwright spec、fixture 與 mock helper，不修改 `src/` production code。

目前 backend 未啟動，因此所有需要後端結果的測試都使用 `page.route()` 或共用 mock fixture 攔截 `/lazybaobao/**` API。UI fallback 與 API 500 行為另列為明確的 resilience 測試。

## 執行基線

- 啟動：`npm.cmd start`（PowerShell execution policy 會阻擋 `npm start` 的 `npm.ps1`）
- Base URL：`http://localhost:4200`
- Playwright 設定：`playwright.config.ts`
- Browser project：Google Chrome / Desktop Chrome
- 測試指令：`npx playwright test`
- 報告：`npx playwright show-report`
- 現有範例：`tests/example.spec.ts` 已示範 regions、branch 與註冊 API mock

## 路由盤點與目前行為

| Route | 頁面/角色 | 未登入實測結果 | 測試重點 |
|---|---|---|---|
| `/` | 入口 | 導向 `/staff-login` | 預設導向 |
| `/staff-login` | 員工登入 | 可直接進入 | 空白、錯誤、成功、角色導向 |
| `/customer-login` | 會員登入 | 可直接進入 | 會員登入、國家/分店切換、導航 |
| `/customer-register` | 會員註冊 | 可直接進入 | 必填、電話、密碼一致、成功 modal |
| `/customer-guest` | 訪客點餐 | 可直接進入 | 手機號碼驗證、進入點餐 |
| `/customer-home` | 客戶菜單 | 可顯示訪客資料 | 菜單、活動、購物車與導覽 |
| `/customer-member` | 會員中心 | 顯示訪客內容 | 權限邊界、登出、資料更新 |
| `/pos-terminal` | POS | 導回 `/staff-login` | staff/manager 權限、點餐、結帳 |
| `/rm-dashboard` | 分店長後台 | 導回 `/staff-login` | 分店長權限、庫存、人員、報表 |
| `/manager-dashboard` | 老闆後台 | 導回 `/staff-login` | boss 權限、帳號、商品、活動、報表 |
| `/qr-entry` | QR 入口 | 導向 `/customer-guest` | branch query 保留與訪客流程 |
| `/mobile-pay` | 行動支付 | 可直接顯示 | 確認付款、取消、訂單 mock |
| `/payment/result` | 付款結果 | 顯示成功頁 | 成功訊息、返回首頁、自動返回 |
| `/payment/cancel` | 付款取消 | 目前也顯示成功頁 | 建立 regression，確認是否為預期行為 |

## 已完成的瀏覽器探索證據

- 根路徑實際導向 `/staff-login`。
- 未登入進入 `/pos-terminal`、`/rm-dashboard`、`/manager-dashboard` 皆導回 `/staff-login`。
- `/qr-entry` 導向 `/customer-guest`。
- 註冊空送顯示：會員名稱、電話號碼、密碼至少 6 個字元。
- 會員登入空送顯示：請輸入手機號碼或電子郵件。
- 員工登入空送顯示：請輸入帳號與密碼。
- backend 未啟動時多個 API 回 500，但客戶菜單仍以 Demo 資料呈現；應以 mock 測試成功流程，並保留一條 API 失敗 fallback 測試。
- 開發模式觀察到 `NG0100 ExpressionChangedAfterItHasBeenCheckedError` 與資源 500 訊息；它們應納入 console error gate 或隔離成已知風險，避免測試默默吞掉前端 runtime 問題。

## 測試優先級與案例

### P0：發佈前必須通過

| ID | 流程 | 主要步驟 | 重要斷言 |
|---|---|---|---|
| AUTH-C-01 | 會員登入成功 | mock `members/login` code 200，填帳號密碼並送出 | 導向 `/customer-home`；sessionStorage 有 `currentMember`/`currentUser` |
| AUTH-C-02 | 會員登入失敗 | mock code 400 或 network error | 留在登入頁；顯示錯誤；不建立登入 session |
| AUTH-C-03 | 會員註冊成功 | mock regions 200 與 `members/register_member` 200，填完整資料 | 顯示成功 modal；約 3 秒後導回 `/customer-login` |
| AUTH-C-04 | 會員註冊驗證 | 空白、電話少於 6 位、密碼少於 6 位、確認密碼不同 | 對應錯誤顯示；不呼叫 register API |
| AUTH-S-01 | 員工登入導向 | mock staff login 分別回 ADMIN、REGION_MANAGER、STAFF | ADMIN 到 `/manager-dashboard`；REGION_MANAGER 到 `/rm-dashboard`；STAFF 到 `/pos-terminal` |
| AUTH-S-02 | 員工登入失敗 | mock 404、400、403、network error | 顯示找不到帳號、密碼錯誤、停用或連線錯誤；不進後台 |
| AUTH-S-03 | 權限保護 | 清除所有 session，直接造訪三個 staff routes | 三者都導回 `/staff-login` |
| NAV-01 | 登入頁主要導航 | 員工頁點客戶入口；會員頁點管理系統；會員頁進註冊/訪客 | 目的 route 正確；loading 後沒有卡在原頁 |
| NAV-02 | 客戶導覽 | customer home 點首頁、菜單、購物車、活動專區 | 每個控制項可操作；頁面內容或狀態切換正確 |
| POS-01 | POS 建立訂單 | 以 STAFF mock 登入，mock menu、cart sync、create order、pay | 商品加入購物車、數量/總額正確；付款成功；顯示訂單編號 |
| ADMIN-01 | 老闆後台核心導航 | 以 ADMIN mock 登入，依序點帳號、分店、國家、會員、商品、活動、報表 | 每個 tab 的標題/主要容器出現；沒有未處理 API/runtime 錯誤 |

### P1：核心回歸與錯誤處理

- `AUTH-C-05`：國家切換後語系、電話區碼、分店清單同步更新。
- `AUTH-C-06`：訪客手機驗證成功後進入 `/customer-home`，session 存有 guest user。
- `AUTH-S-04`：首次登入 `mustChangePassword` modal 的空白、預設密碼、確認密碼不一致與成功修改。
- `POS-02`：POS 會員查詢成功/查無會員、訪客模式、內用/外帶、現金/刷卡/行動支付切換。
- `POS-03`：POS 活動門檻、贈品選擇、滿額提示與購物車同步失敗時仍可操作。
- `POS-04`：POS 分頁切換：POS、訂單看板、庫存、活動、員工、報表；角色限制不可見功能。
- `ADMIN-02`：帳號停權/復權、重設密碼、職務調整與分店調換的成功/失敗 toast。
- `ADMIN-03`：商品與活動新增、編輯、啟用/停用、刪除；表單欄位與 API payload 驗證。
- `RM-01`：分店長登入後驗證庫存排序/搜尋、庫存調整、活動與財務查詢。
- `PAY-01`：行動支付確認與取消；確認付款呼叫 mock pay API，取消不建立成功訂單。
- `RES-01`：菜單、活動、分店、報表 API 回 500 時顯示 fallback/空狀態，頁面不白屏。

### P2：品質與相容性

- Desktop Chrome 與 mobile viewport（390x844）各跑會員登入、註冊、訪客、客戶菜單。
- 所有 P0 流程檢查 keyboard focus、可見 label、button disabled/loading 狀態。
- 重要流程收集 console error、page error、failed request；排除 favicon 等非功能性噪音後，production runtime error 應為 0。
- 付款結果頁倒數、自動返回與手動返回的競態行為。

## API Mock Contract

共用 fixture 建議集中在 `tests/fixtures/api-mocks.ts`，每個 test 只覆寫必要情境：

| 功能 | Request pattern | 成功 mock 最小回應 | 失敗案例 |
|---|---|---|---|
| 地區 | `**/lazybaobao/regions/get_all` | `{ code: 200, regionsList: [{ id, country, countryCode, usageCap }] }` | 500、空陣列 |
| 分店 | `**/lazybaobao/global-area/get_all_branch` | `{ code: 200, globalAreaList: [{ id, regionsId, branch }] }` | 500 |
| 會員註冊 | `**/lazybaobao/members/register_member` | `{ code: 200, message: '註冊成功' }` | code 400、409、network error |
| 會員登入 | `**/lazybaobao/members/login` | `{ code: 200, members: { id, name, phone, orderCount } }` | code 400、401 |
| 員工登入 | `**/lazybaobao/staff/auth/login` | `{ code: 200, staffList: [{ id, role, name, account, globalAreaId }], mustChangePassword: false }` | 400、403、404 |
| 菜單 | `**/lazybaobao/inventory/menu/**` | 商品清單與分類/風格欄位 | 500，驗證 Demo fallback |
| 購物車 | `**/lazybaobao/cart/sync` | `cartId`、items、subtotal、availablePromotions | 500，驗證 UI 不阻斷 |
| 建單 | `**/lazybaobao/orders/create_orders` | `code: 200`、訂單 id/number | 400、500 |
| 付款 | `**/lazybaobao/orders/pay` | `{ code: 200, message: 'ok' }` | 400、500 |
| 後台資料 | `**/lazybaobao/product/**`、`promotions/**`、`staff/**`、`reports/**` | 對應最小列表/成功 response | 500、空列表 |

所有成功 mock 應同時驗證 request method、必要欄位與關鍵 payload，避免只驗畫面而漏掉 contract regression。

## Fixtures 與測試資料

- `clearSession(page)`：`sessionStorage.clear()` 後 reload，確保測試互不污染。
- `mockRegions(page)`、`mockBranches(page)`：註冊、登入與客戶頁共用。
- `mockMemberAuth(page, role)`：回傳會員登入 response。
- `mockStaffAuth(page, role)`：角色使用 `ADMIN`、`REGION_MANAGER`、`STAFF` 三種 fixture。
- `mockCustomerOrdering(page)`：menu/cart/order/pay 的成功與失敗 variant。
- 所有 fixture 使用測試專用帳號與電話，例如 `e2e-user@example.test`、`0900000000`，不依賴真實帳號。

## 失敗診斷與通過標準

1. 每個 P0 test 必須在 backend 關閉時可重現並通過。
2. 不以固定長度 `waitForTimeout` 作為主要同步方式；優先使用 URL、locator、response 或 modal 可見狀態。
3. 任一 P0 流程若出現非預期 page error、Angular runtime error、錯誤導向或 session 污染即失敗。
4. 測試失敗保留 trace、screenshot 與 HTML report；CI 使用 `retries=2`、`workers=1`。
5. `/payment/cancel` 目前實測呈現「付款成功」，應先建立 regression test，再由產品決定預期規格；在規格確認前不得把它標成通過行為。

## 實作順序

1. 先建立 `tests/fixtures/api-mocks.ts` 與 session cleanup。
2. 將現有註冊範例補成完整 P0：會員登入、員工三角色登入、權限保護、導航。
3. 加入 POS 最小下單/付款流程與 manager dashboard 七個 tab smoke test。
4. 加入 P1 的首次登入改密碼、fallback、錯誤 response 與角色細分。
5. 最後加入 mobile project、console gate、report/trace 與 CI 執行腳本。
