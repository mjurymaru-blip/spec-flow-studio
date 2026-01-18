# Spec-Flow Studio Connection Specification

Spec-Flow StudioとAether Console（または他のクライアント）間のWebSocket通信仕様書。

## 接続情報

- **Endpoint**: `/api/ws`
- **Protocol**: WebSocket Secure (wss)
- **Port**: 3001 (Default) or 5173 (Vite HMR port if proxied)

### 認証（Optional）

セキュリティが有効な場合、以下のヘッダーが必要です。

- `x-ws-secret`: 環境変数 `WS_SECRET` で設定された値

## データ形式

すべてのメッセージはJSON形式でやり取りされます。

```typescript
{
  type: string;
  [key: string]: any;
}
```

## イベント一覧

### 1. Studio → Console (送信)

Spec-Flow Studioから外部へ送信されるイベント。

#### `SPEC_UPDATED`
Specの全量が更新された際に送信されます。

```json
{
  "type": "SPEC_UPDATED",
  "agents": [
    {
      "name": "analyzer",
      "displayName": "Analyzer",
      "role": "...",
      "capabilities": ["..."],
      "constraints": ["..."],
      "communication": { ... }
    }
  ]
}
```

#### `PATCH_CREATED`
新しいSpecパッチ（差分）が作成された際に送信されます。

```json
{
  "type": "PATCH_CREATED",
  "patch": {
    "kind": "SpecPatch",
    "version": "v1",
    "metadata": {
      "id": "uuid...",
      "name": "Update constraints",
      "createdAt": "2026-01-18T12:00:00Z",
      "author": "human"
    },
    "spec": {
      "diffs": [...],
      "summary": "..."
    }
  }
}
```

#### `SYNC_RESPONSE`
`SYNC_REQUEST` に対する応答として送信されます。

```json
{
  "type": "SYNC_RESPONSE",
  "agents": [...],
  "patches": [...]
}
```

---

### 2. Console → Studio (受信)

Spec-Flow Studioが外部から受信するイベント。

#### `SYNC_REQUEST`
同期を要求する際に送信します。Studioは `SYNC_RESPONSE` を返します。

```json
{
  "type": "SYNC_REQUEST"
}
```

#### `PATCH_APPLIED`
Console側でパッチが適用されたことを通知します。

```json
{
  "type": "PATCH_APPLIED",
  "patch": { ... }
}
```

#### `PATCH_REVERTED`
Console側でパッチが取り消されたことを通知します。

```json
{
  "type": "PATCH_REVERTED",
  "patchId": "uuid..."
}
```

#### `AGENT_EXECUTED`
エージェントが実行されたことを通知します（ログ表示用）。

```json
{
  "type": "AGENT_EXECUTED",
  "agentName": "analyzer",
  "input": "...",
  "output": "..."
}
```

#### `PROPOSAL_GENERATED`
AIが改善提案を生成したことを通知します。

```json
{
  "type": "PROPOSAL_GENERATED",
  "proposal": "提案内容...",
  "agentResults": [...]
}
```

## 実装ガイド（Aether Console側）

Aether Console側では、以下のようにWebSocketクライアントを実装してください。
※自己署名証明書を使用している場合、開発環境では `NODE_TLS_REJECT_UNAUTHORIZED=0` 等で証明書検証をスキップする必要があるかもしれません。

```typescript
const ws = new WebSocket('wss://localhost:3001/api/ws');

ws.onopen = () => {
    // 接続時に同期リクエストを送信
    ws.send(JSON.stringify({ type: 'SYNC_REQUEST' }));
};

ws.onmessage = (event) => {
    const data = JSON.parse(event.data);
    
    if (data.type === 'SPEC_UPDATED') {
        // Specストアを更新
        updateSpecs(data.agents);
    } else if (data.type === 'PATCH_CREATED') {
        // パッチを適用待ちリストに追加
        addPendingPatch(data.patch);
    }
};
```
