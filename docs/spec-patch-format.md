# SpecPatch 形式定義

## 概要

SpecPatchは、Spec-Kit仕様の差分を管理するためのハイブリッド形式。
機械的な処理と人間・AIの理解の両方に対応する。

---

## 基本構造

```yaml
kind: SpecPatch
version: v1
metadata:
  id: patch-001
  name: "推測禁止制約の追加"
  createdAt: 2026-01-15T23:00:00Z
  author: human  # human | ai | system

spec:
  # 構造的差分（機械処理用）
  diffs:
    - id: diff-001
      agentName: analyzer
      operation: add        # add | remove | modify
      path: spec.constraints
      before: null
      after: "外部データを推測で補完しない"
      impact: medium        # low | medium | high
  
  # 自然言語要約（人間・AI理解用）
  summary: "Analyzerエージェントに推測禁止の制約を追加"
  rationale: "過度な推論による誤分析を防ぐため"
  
  # 適用状態
  appliedAt: null           # 適用日時（未適用はnull）
```

---

## フィールド定義

### metadata

| フィールド | 型 | 必須 | 説明 |
|-----------|-----|------|------|
| `id` | string | ✓ | パッチの一意識別子 |
| `name` | string | ✓ | パッチの短い名前 |
| `createdAt` | ISO8601 | ✓ | 作成日時 |
| `author` | enum | ✓ | 作成者種別 (`human` / `ai` / `system`) |

### spec.diffs[]

| フィールド | 型 | 必須 | 説明 |
|-----------|-----|------|------|
| `id` | string | ✓ | 差分の一意識別子 |
| `agentName` | string | ✓ | 対象エージェント名 |
| `operation` | enum | ✓ | 操作種別 (`add` / `remove` / `modify`) |
| `path` | string | ✓ | 変更パス（JSONPath形式） |
| `before` | any | - | 変更前の値（add時はnull） |
| `after` | any | - | 変更後の値（remove時はnull） |
| `impact` | enum | ✓ | 影響度 (`low` / `medium` / `high`) |

### spec（トップレベル）

| フィールド | 型 | 必須 | 説明 |
|-----------|-----|------|------|
| `diffs` | array | ✓ | 差分の配列 |
| `summary` | string | ✓ | 変更の自然言語要約 |
| `rationale` | string | - | 変更理由（なぜこの変更が必要か） |
| `appliedAt` | ISO8601 | - | 適用日時（未適用はnull） |

---

## 操作例

### 1. 制約の追加

```yaml
diffs:
  - id: diff-001
    agentName: analyzer
    operation: add
    path: spec.constraints
    before: null
    after: "外部データを推測で補完しない"
    impact: medium
```

### 2. 能力の変更

```yaml
diffs:
  - id: diff-002
    agentName: predictor
    operation: modify
    path: spec.capabilities[0]
    before: "trend-prediction"
    after: "advanced-trend-prediction"
    impact: low
```

### 3. 通信先の削除

```yaml
diffs:
  - id: diff-003
    agentName: monitor
    operation: remove
    path: spec.communication.canSendTo[2]
    before: "deprecated-agent"
    after: null
    impact: high
```

---

## TypeScript型定義

```typescript
export interface SpecPatch {
  kind: 'SpecPatch';
  version: 'v1';
  metadata: {
    id: string;
    name: string;
    createdAt: string;  // ISO8601
    author: 'human' | 'ai' | 'system';
  };
  spec: {
    diffs: SpecDiff[];
    summary: string;
    rationale?: string;
    appliedAt?: string;  // ISO8601
  };
}

export interface SpecDiff {
  id: string;
  agentName: string;
  operation: 'add' | 'remove' | 'modify';
  path: string;
  before?: unknown;
  after?: unknown;
  impact: 'low' | 'medium' | 'high';
}
```

---

## Aether Console連携

### パッチ適用イベント

```typescript
// Console → Studio
{ type: 'PATCH_APPLIED', patch: SpecPatch }

// Studio → Console
{ type: 'PATCH_CREATED', patch: SpecPatch }
```

### Rollback

Rollbackは、指定したパッチまでの全パッチを逆順で `remove` / `add` を反転して適用する。

---

## 設計原則

1. **ハイブリッド**: 構造diff（機械用）+ 自然言語（人間・AI用）
2. **追跡可能**: 誰が・いつ・なぜ変更したかを記録
3. **可逆**: Rollbackに必要な情報を保持
4. **連携対応**: Aether Consoleのイベント形式と互換
