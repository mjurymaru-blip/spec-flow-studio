# Phase 4 実装計画: 差分管理と統合

## 目標
Spec-Flow Studioの核心機能である「Diff駆動開発」を実装する。  
エージェント仕様の変更を検出し、`SpecPatch`形式で記録・管理する。  
また、履歴管理（タイムトラベル）とAether ConsoleとのWebSocket連携を完成させる。

## ユーザー確認事項

> [!IMPORTANT]
> **WebSocket統合**: 完全な検証にはAether Consoleの起動が必要です。  
> Aether Consoleが利用できない場合は、WebSocket接続をモック化してローカルテストを行います。

---

## 変更内容

### コアロジック (Diffエンジン)

#### [NEW] [diff-utils.ts](file:///home/gemini1/workspace3/spec-flow-studio/src/lib/utils/diff-utils.ts)
- `generateSpecPatch(before, after)` の実装
  - エージェントの追加・削除・変更を検出
  - フィールドレベルの変更を検出（constraints, capabilitiesなど）
  - 影響度（impact）をヒューリスティックに算出
- `applySpecPatch(spec, patch)` の実装
  - パッチを適用して状態を更新

---

### 状態管理 (履歴)

#### [NEW] [history-store.ts](file:///home/gemini1/workspace3/spec-flow-studio/src/lib/stores/history-store.ts)
- `SpecPatch` のタイムラインを保存
- Undo / Redo アクションの実装
- `localStorage` への永続化

---

### UIコンポーネント

#### [NEW] [history/+page.svelte](file:///home/gemini1/workspace3/spec-flow-studio/src/routes/history/+page.svelte)
- パッチのタイムライン表示
- 選択したパッチの詳細表示（自然言語要約 + 構造差分）
- 「このバージョンに戻す」ボタン

#### [MODIFY] [editor/+page.svelte](file:///home/gemini1/workspace3/spec-flow-studio/src/routes/editor/+page.svelte)
- 保存時（または「コミット」ボタン押下時）にDiff生成をトリガー
- `history-store` との連携

---

### 統合 (WebSocket)

#### [NEW] [websocket.ts](file:///home/gemini1/workspace3/spec-flow-studio/src/lib/services/websocket.ts)
- Spec-Flow Studio ↔ Aether Console 接続
- メッセージタイプ: `PATCH_CREATED`, `SYNC_REQUEST`, `SYNC_RESPONSE`

---

## 検証計画

### 自動テスト
- **Diffロジック**: `diff-utils.ts` のユニットテスト
  - エージェント追加・削除の検出確認
  - ネストされたフィールド変更（constraintsなど）の検出確認
  - パッチ適用後、元の状態が復元できることを確認

### 手動検証
1. **Diff生成**
   - エディタでSpecを変更
   - 履歴ビューに新しいパッチが作成されることを確認
   - SummaryとDiffsの内容が正しいことを確認
2. **タイムトラベル**
   - 複数回変更を加える
   - 「Undo」または古いパッチを選択
   - エディタの内容が以前の状態に戻ることを確認
3. **永続化**
   - ページをリロード
   - 履歴と現在の状態が復元されていることを確認
