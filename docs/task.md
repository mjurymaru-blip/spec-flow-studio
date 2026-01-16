# Phase 4: Diff Management & Integration タスクリスト

## 概要
Spec-Kitの核心である「Diff駆動開発」の中核機能を実装。エージェント仕様のDesired（あるべき姿）とActual（現状）の差分を検出し、SpecPatch形式で管理する。

---

## タスク

### 4.1 Diffエンジン (diff-utils.ts)
- [x] `generateSpecPatch()` - 差分検出ロジック
- [x] `applySpecPatch()` - パッチ適用ロジック
- [x] `revertSpecPatch()` - ロールバック用

### 4.2 履歴管理 (history-store.ts)
- [x] パッチタイムラインの保存
- [x] Undo / Redo アクション
- [x] localStorage への永続化

### 4.3 履歴UI (history/+page.svelte)
- [x] タイムライン表示
- [x] パッチ詳細表示
- [x] 「このバージョンに戻す」ボタン

### 4.4 エディタ連携 (editor/+page.svelte)
- [x] 「コミット」ボタン追加
- [x] Undo/Redo ボタン追加
- [x] history-store との連携

### 4.5 WebSocket統合 (websocket.ts)
- [x] WebSocket クライアント実装
- [x] Aether Console へのパッチ送信機能
- [x] 状態受信ハンドラ (Actual State)

---

## 進捗
- 開始日: 2026-01-16
- 完了日: 2026-01-16
- 状態: **完了**
- 成果物: `diff-utils.ts`, `history-store.ts`, `history/+page.svelte`, `websocket.ts`
