# Spec-Flow Studio タスクリスト

## 概要
Spec-Flow Studio の開発タスク一覧。完了済み・進行中・将来対応を一元管理。

---

## Phase 1: 基盤構築 ✅
- [x] SvelteKitプロジェクト初期化
- [x] TypeScript型定義 (`src/lib/types/index.ts`)
- [x] Svelte Stores設計 (spec-store, artifact-store, integration-store)
- [x] SF風CSS変数・デザインシステム
- [x] UIコンポーネント (Panel, Button, StatusIndicator)
- [x] レイアウト (Sidebar, StatusBar)
- [x] ルーティング (dashboard, editor, viewer, history, settings)

---

## Phase 2: Spec-Kit Editor ✅
- [x] CodeMirror 6統合 (SpecEditor.svelte)
- [x] YAMLパース・バリデーション (yaml-utils.ts)
- [x] 制約パネル (ConstraintPanel.svelte)
- [x] テンプレート読み込み
- [x] ローカルストレージ自動保存
- [x] エラー表示

---

## Phase 3: AI Generation Engine ✅
- [x] Gemini APIクライアント (gemini.ts)
- [x] APIキー暗号化 (crypto-utils.ts)
- [x] 設定ストア (settings-store.ts, session-store.ts)
- [x] 生成エンドポイント (/api/generate)
- [x] モデル一覧取得 (/api/models)
- [x] プロンプトテンプレート (UI Mock, API Spec)

---

## Phase 3.5: AI生成拡張 ✅
- [x] テストケース生成プロンプト
- [x] ユースケース図(Mermaid)生成プロンプト
- [x] 通信図生成 (buildCommunicationDiagram)
- [x] MermaidDiagramコンポーネント
- [x] エディタに通信図パネル追加

---

## Phase 4: Diff管理・履歴 ✅
- [x] 差分計算 (diff-utils.ts)
- [x] 履歴ストア (history-store.ts)
- [x] Undo/Redo機能
- [x] 履歴ページ (/history)
- [x] コミットボタン

---

## Phase 5: レビュー指摘対応 ✅
- [x] Mermaid再描画デバウンス (300ms)
- [x] ConstraintPanel視覚強調 (赤色・警告メッセージ)

---

## Phase 6: WebSocket統合 ✅
- [x] ViteプラグインWebSocketサーバー (vite.config.ts)
- [x] /api/ws エンドポイント
- [x] Aether Consoleとの接続テスト成功
- [x] CONNECTED/SYNC_REQUEST/SYNC_RESPONSE ハンドリング

---

## Phase 7: GitHub公開 ✅
- [x] README.md更新（スクリーンショット・使い方・Spec-Kit形式）
- [x] GitHubリポジトリ作成・公開

---

## Phase 8: 外部レビュー反映 (2026-01-17)

### 🔴 高優先度 - ユーザー体験向上
- [x] **初回体験改善**: サンプルSpec自動ロード＋ウェルカムバナー
- [x] **constraints可視化強化**: 生成結果に「考慮したconstraint」バッジ表示
- [x] **Spec-Kit schema (Zod)**: 禁止フィールド・危険constraints検出

### 🟡 中優先度 - 開発者体験向上
- [x] **エディタ自動補完**: Spec-Kit形式のautocomplete (CodeMirror拡張)
- [x] **Side-by-Side Diffビューア**: 履歴ページで左右比較表示
- [x] **履歴チェックポイント制**: パッチ増加時のスナップショット保存

### 🟢 低優先度 - アーキテクチャ改善
- [x] **domain層分離**: stores/から判断ロジックをdomain/に移行
- [x] **IndexedDB移行**: localStorage 5MB制限対策
- [x] **WebSocketイベントdebounce/throttle**: 通信頻発時の最適化

---

## 将来対応タスク (Backlog)

### セキュリティ強化
- [x] WebSocket認証 (HMAC-SHA256トークン検証)
- [x] SSR時のStore漏洩リスク対策 (SSRオフで対応済み)
- [x] API CSRF対策
- [ ] Gemini API Proxy化 (本番デプロイ時)
- [ ] WebSocket origin/protocol version検証

### UI/UX改善
- [x] Constraint → YAML行ジャンプ機能
- [x] WebSocket接続状態のUI表示強化
- [x] 操作手順チュートリアル追加
- [ ] アーティファクトのlazy render / 仮想スクロール
- [ ] インタラクティブプレビュー (ui-mockのリンク動作)

### パフォーマンス
- [ ] Editor分割ロード最適化
- [ ] Spec再パース効率化 (変更subtreeのみ更新)

### アーキテクチャ
- [x] アーティファクトのlocalStorage永続化
- [ ] integration-store責務分離 (connection/event/sync)
- [x] 履歴フィルタリング (エージェント別)
- [x] Swagger UI統合

---

## 進捗サマリー
- **開始日**: 2026-01-15
- **最終更新**: 2026-01-17
- **状態**: Phase 1-7 完了、Phase 8 (外部レビュー反映) 開始
- **外部レビュー**: ChatGPT・Geminiにてレビュー完了、改善点をPhase 8に反映
