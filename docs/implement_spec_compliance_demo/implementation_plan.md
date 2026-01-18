# Spec Validation警告演出 実装計画

## 目的
Specの記述ミス（Validationエラー）をユーザーに明確に伝えるため、エディタ上に視覚的に強い警告（赤オーバーレイ）を表示する。

## 実装内容

### 1. `SpecEditor.svelte` の改修
- **Props追加**: `errors: YamlError[]` プロパティを受け取るようにする。
- **UI追加**: `errors` が存在する場合、エディタ下部またはオーバーレイとして「⚠️ Validation Error」パネルを表示する。
- **デザイン**:
  - 背景: 赤色（`var(--color-accent-error)`）の薄い色
  - アイコン: ⚠️
  - 内容: エラーメッセージと行番号を表示し、クリックで行ジャンプ可能にする。

### 2. `src/routes/editor/+page.svelte` の改修
- `yamlErrors` ステートを `SpecEditor` の `errors` プロパティにバインドする。

## 期待される動作
- YAML構文エラーがある場合、エディタ上に即座に赤い警告が表示される。
- ユーザーはエラー内容をクリックして該当行にジャンプできる（既存の `gotoLine` を利用）。

# HTTPS対応（Mixed Content対策）

## 目的
Aether Console (HTTPS) と Spec-Flow Studio (HTTP) 間の通信で発生するMixed Contentエラー（WebSocket接続失敗）を解消するため、Spec-Flow Studioの開発サーバーをHTTPS化する。

## 実装内容

### 1. 依存関係の追加
- `@vitejs/plugin-basic-ssl` をインストールする。
  - これにより、開発時に自己署名証明書を自動生成してHTTPSサーバーを起動できる。

### 2. `vite.config.ts` の修正
- `basicSsl()` プラグインを追加する。
- 既存のWebSocketプラグインとの互換性を確認する（`ws` は `server` オプションでHTTPSサーバーインスタンスも受け入れるため、大きな変更は不要なはず）。

## 期待される動作
- `npm run dev` で起動すると `https://localhost:3001` でアクセス可能になる。
- ブラウザで「保護されていない通信」の警告が出るが、許可することでアクセス可能。
- Aether Console (HTTPS) への `wss://` 接続がブロックされなくなる。
