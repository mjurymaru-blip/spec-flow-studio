# Phase 5: レビュー指摘対応 タスクリスト

## 概要
ChatGPT / Gemini によるコードレビュー結果を元に、改善を実施。

---

## 即時対応タスク

### 5.1 Mermaidデバウンス
- [x] エディタ入力ごとの再描画を防ぐ
- [x] 300ms のデバウンス追加

### 5.2 constraints UI強調
- [x] ConstraintPanelの視覚的強調（赤枠・警告アイコン・パルスアニメーション）
- [x] 「この制約を破る生成は破棄されます」のメッセージ追加

---

## 将来対応タスク (Backlog)

### 5.3 integration-store 責務分離
- [ ] connection-store.ts (接続状態)
- [ ] event-store.ts (受信イベント)
- [ ] sync-controller.ts (同期ロジック)

### 5.4 履歴フィルタリング
- [ ] エージェント名でのパッチ絞り込み

### 5.5 IndexedDB移行
- [ ] localStorage → IndexedDB への移行
- [ ] 大容量Artifactのサポート

### 5.6 Gemini API Proxy化
- [ ] Edge Functionでの薄いProxy実装
- [ ] レート制限 (IP/Session)
- [ ] プロンプト検証

### 5.7 Swagger UI統合
- [ ] OpenAPI仕様のビジュアルビューア

---

## 進捗
- 開始日: 2026-01-16
- 完了日: 2026-01-16
- 状態: **完了** (即時対応分)
