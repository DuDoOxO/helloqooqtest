# helloqooqtest 部署到 qooq SaaS 失敗紀錄（2026-10-24）

症狀從頭到尾都是同一句：
`resolve remote head: list remote refs: authentication required: Repository not found.`
但背後疊了四個不同的原因，排掉一個、下一個才看得到。

## 時間線與原因

| # | 原因 | 怎麼發現 | 狀態 |
|---|---|---|---|
| 1 | **SSH 金鑰對應錯帳號**：SSH 登入的是 `enoch-guo`，repo 建在 `DuDoOxO` 底下，第一次 push 失敗 | `ssh -T git@github.com` | 已繞過：這個專案的 origin 改走 HTTPS，用 gh（DuDoOxO）的憑證，只改本專案設定 |
| 2 | **GitHub App 早就裝在 DuDoOxO 上，但 qooq 不知道**：GitHub 顯示 Configure 頁，勾選 repo 後不會導回 qooq（dev App 沒勾 Redirect on update，也沒接 webhook） | control log 裡 `/auth/github/install/callback` 被打到 0 次 | 已繞過：在 GitHub 上 Uninstall，再從 console 重裝 |
| 3 | **localhost 和 127.0.0.1 混用**：Google 登入導回 localhost，GitHub App 的 Setup URL 是 127.0.0.1。cookie 依 host 分開存，所以登入和安裝總有一個會報 `oauth_state_invalid` | control log 第 1707 行（127.0.0.1 → 400）、第 1760 行（localhost → 400） | 已繞過：App 的 Setup URL 改成 `http://localhost:8080/auth/github/install/callback`，01:20 安裝導回成功（302，installation 174564449） |
| 4 | **專案建立時被固定成 `auth_type=none`**：專案是在 App 安裝**之前**建立的，watcher 永遠用匿名身分 clone，從不跟 control 要 token。之後怎麼安裝 App 都沒用 | 比對 `qooq watch get`：會動的 hello-qooq 是 `github-app`，helloqooqtest 是 `none` | 已修（qooq e630b77）：觸發部署時自動升級成 github-app；新建立的 github.com 專案一律用 github-app。10/24 驗收：auth_type 變成 github-app，build 成功，HTTP 200 |

另外有一個錯誤訊息的問題：上面四種原因，最後都變成同一句 git 的 `Repository not found`，看不出該修哪裡。

## 已回報給 main-dev 的 qooq 問題

1. GitHub 上的授權變更不會同步回 qooq（webhook 沒接、Configure 頁不會導回）
2. 錯誤訊息不分原因
3. console 看不到 App 讀得到哪些 repo
4. 各個導回網址的 host 不一致時沒有檢查，也沒有提示

## 下次怎麼避免

- 本機的 qooq console 一律用 **http://localhost:8080** 開
- 部署失敗、出現 `Repository not found` 時，先看 `qooq watch get <target>` 的 `auth_type`

## 仍未解決（需要決定做法）

- 從 GitHub 直接安裝、或 GitHub 只顯示設定頁時，還沒有安全的方式把那個安裝連到 qooq 帳號（要先證明按的人管得到那個 GitHub 帳號）
- 舊安裝 171307705（enoch 帳號）在 DB 裡仍標成有效；本機沒設 webhook，所以不會自動同步
