# Phase 1: 基盤構築 タスクリスト

## 概要
プロジェクト基盤・デザインシステム・基本レイアウトの完成

---

## タスク

### 1.1 プロジェクト構成整理
- [x] ディレクトリ構造の作成（`$lib/components`, `$lib/stores`, `$lib/types`, `$lib/services`, `$lib/utils`）
- [x] 基本ファイルの配置

### 1.2 共通型定義
- [x] `$lib/types/index.ts` に `integration.ts` の内容を移動・拡張
- [x] AgentSpec, SpecDiff, SpecPatch, Artifact, ConnectionStatus, AppState の型定義

### 1.3 デザインシステム
- [x] `app.css` にSF風CSS変数を定義
- [x] 共通コンポーネント作成（Panel, Button, StatusIndicator）

### 1.4 基本レイアウト
- [x] `+layout.svelte` にサイドバー + メインエリア + ステータスバー
- [x] レスポンシブ対応

### 1.5 PWA設定
- [x] `manifest.json` 作成
- [ ] Service Worker設定（vite-plugin-pwa）※後日対応

### 1.6 ルーティング
- [x] `/editor` ページ（Spec-Kit エディタ）
- [x] `/viewer` ページ（生成物ビューア）
- [x] `/history` ページ（差分履歴）
- [x] `/settings` ページ（設定）

### 1.7 ダッシュボード初期表示
- [x] `+page.svelte` に現在のSpec名、Artifact一覧、接続状態を表示

---

## 進捗
- 開始日: 2026-01-15
- 完了日: 2026-01-15
- 状態: **完了**（Service Worker設定のみ後日対応）

## 動作確認
- 開発サーバー: `npm run dev -- --port 3001`
- 全ページの表示確認済み
- SF風ダークテーマ適用確認済み
