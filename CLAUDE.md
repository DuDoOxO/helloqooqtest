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

## 部署（qooq 本機 GitOps）
- target/component：`helloqooqtest`（namespace `default`），目前 host port 19000（2026-10-29 重建）
- 改完：`git add -A && git commit -m "..." && git push`，約 30 秒內自動重部署（pre-push hook 會同步推到 qooq remote；hook 不在就要另外 `git push qooq`）
- 新版本起不來會自動回到上一版，該 commit 被記成拒絕，不會再部署
- 狀態：`qooq watch get helloqooqtest`、`qooq component ls`

## 地雷
- `wait-and-verify.sh` 需要環境變數 QOOQ_TOKEN / QOOQ_WATCHER_TOKEN（`source ~/.qooq/dev-env.sh` 後啟動 claude 就有），沒有會明確 401 FAIL。
- SaaS 部署：repo 是 DuDoOxO/helloqooqtest（private），origin 走 HTTPS + gh 憑證（SSH 金鑰是另一個帳號）。
  console 一律用 http://localhost:8080 開。`Repository not found` 先看 target 的 auth_type，細節見 docs/saas-deploy-incident-2026-10-24.md
