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
- [x] README.md更新
- [x] GitHubリポジトリ作成・公開

---

## 将来対応タスク (Backlog)

### セキュリティ強化 (高優先度)
- [x] WebSocket認証 (HMAC-SHA256トークン検証)
- [ ] SSR時のStore漏洩リスク対策
- [ ] API CSRF対策

### UI/UX改善 (中優先度)
- [ ] Constraint → YAML行ジャンプ機能
- [x] WebSocket接続状態のUI表示強化
- [ ] 操作手順チュートリアル/GIF追加

### パフォーマンス (中優先度)
- [ ] 履歴のチェックポイント制 (大量パッチ対応)
- [ ] Editor分割ロード最適化
- [ ] WebSocketイベントのthrottle/debounce

### アーキテクチャ (低優先度)
- [ ] integration-store責務分離 (connection/event/sync)
- [ ] 履歴フィルタリング (エージェント別)
- [ ] IndexedDB移行 (localStorage 5MB制限対策)
- [ ] Gemini API Proxy化 (本番デプロイ時)
- [ ] Swagger UI統合

---

## 進捗サマリー
- **開始日**: 2026-01-15
- **最終更新**: 2026-01-17
- **状態**: Phase 1-7 完了、Backlog対応中
