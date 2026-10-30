# helloqooqtest

簡單留言板，用來測 qooq 本機部署。前後端同一個 Node server，零依賴。

## 技術棧
- Node 18+（內建 `http`，無 npm 套件）；資料存 JSON 檔（`DATA_FILE`，預設 `./data.json`）

## 啟動 / 測試
- 本機：`npm start`（PORT 預設 3000）
- 沒有自動化測試；手動：`curl localhost:3000/api/health` → `{"ok":true}`

## 目錄
- `server.js`：API（`GET/POST /api/messages`、`DELETE /api/messages/:id`、`GET /api/health`）+ 靜態檔
- `public/`：`index.html`、`app.js`（前端）
- `qooq.yaml`：qooq 部署設定（node template、`auto:3000`、volume 掛 `/app/data`）

## 部署（目前只有 SaaS，2026-10-29 起）
- SaaS 專案 `default/helloqooqtest`，帳號 aqp8vwty（新 Google 帳號），host port 19003（網址的 IP 跟著這台的 LAN IP 變，以 `qooq project ls` 為準）
- 改完：`git push`（origin/GitHub）就會自動重部署；強制：`qooq project deploy helloqooqtest -n default --wait`
- 狀態：`qooq project ls`、log：`qooq project logs helloqooqtest -n default`
- local GitOps 已移除（watch target、pre-push hook）；`qooq` remote 與 bare repo 還留著，要恢復就重跑 skill 的 gitops-setup.sh
- 新版本起不來會自動回到上一版（local 與 SaaS 都實測過；換版瞬間約有 8 秒不通）

## 地雷
- `wait-and-verify.sh` 需要環境變數 QOOQ_TOKEN / QOOQ_WATCHER_TOKEN（`source ~/.qooq/dev-env.sh` 後啟動 claude 就有），沒有會明確 401 FAIL。
- SaaS 部署：repo 是 DuDoOxO/helloqooqtest（2026-10-29 改 public；GitHub App 安裝綁在 enoch 帳號，改回 private 則 aqp8vwty 會 build 失敗），origin 走 HTTPS + gh 憑證（SSH 金鑰是另一個帳號）。
  console 一律用 http://localhost:8080 開。`Repository not found` 先看 target 的 auth_type，細節見 docs/saas-deploy-incident-2026-10-24.md
