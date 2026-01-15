# Phase 4: Diff Management & Integration タスクリスト

## 概要
Spec-Kitの核心である「Diff駆動開発」の中核機能を実装。エージェント仕様のDesired（あるべき姿）とActual（現状）の差分を検出し、SpecPatch形式で管理する。また、Aether ConsoleとのWebSocket統合を完成させる。

---

## タスク

### 4.1 SpecPatch 実装 (Hybrid Format)
- [ ] SpecPatch 生成ロジック (`diff-utils.ts`)
  - 構造的差分 (JSON Patch like) の検出
  - 自然言語要約の生成 (AI支援)
- [ ] パッチ適用ロジック
- [ ] ロールバック機能

### 4.2 履歴管理 (Time Travel)
- [ ] 履歴ストア拡張 (`history-store.ts`)
- [ ] 履歴ビューアページ (`/history`) 実装
  - タイムライン表示
  - バージョン間の差分可視化

### 4.3 Aether Console 統合 (WebSocket)
- [ ] WebSocket クライアント実装 (`websocket.ts`)
- [ ] Aether Console へのパッチ送信
- [ ] Aether Console からの状態受信 (Actual State)

### 4.4 統合テスト & Polish
- [ ] E2Eテストシナリオ
- [ ] UI/UXの最終調整

---

## 進捗
- 開始日: 2026-01-16
- 完了予定: 1週間
- 状態: **計画中**
