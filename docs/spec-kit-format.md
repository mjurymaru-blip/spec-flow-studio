# Spec-Kit エージェント定義形式（Draft）

## 概要

Spec-Kitは、AIエージェントの役割・能力・制約を宣言的に定義するフォーマット。
Aether ConsoleとSpec-Flow Studioの両方で共通利用する。

---

## 基本構造

```yaml
# agent.spec.yaml
kind: Agent
version: v1
metadata:
  name: analyzer
  displayName: "Analyzer"
  description: "情報解析エージェント"
  icon: "🔍"

spec:
  role: |
    入力データを分析し、構造化された情報を抽出する。
    パターンや異常を検出し、他のエージェントに報告する。

  capabilities:
    - data-analysis
    - pattern-recognition
    - anomaly-detection

  constraints:
    - "推測で情報を補完しない"
    - "確信度が低い場合は明示する"

  inputs:
    - type: text
      description: "分析対象のテキストデータ"
    - type: structured-data
      description: "JSON形式の構造化データ"

  outputs:
    - type: analysis-report
      schema:
        findings: string[]
        confidence: number
        anomalies: string[]

  triggers:
    - event: data-received
      action: analyze
    - event: request-from-planner
      action: deep-analyze

  communication:
    canSendTo:
      - predictor
      - planner
      - monitor
    canReceiveFrom:
      - planner
      - monitor

  # Aether Consoleへの公開設定
  observability:
    expose:
      - status
      - progress
      - metrics.errorRate
    logLevel: info
```

---

## エージェント間通信

```yaml
# message.spec.yaml
kind: Message
version: v1
metadata:
  id: "msg-001"
  from: analyzer
  to: predictor
  timestamp: "2026-01-14T00:30:00Z"

spec:
  type: analysis-complete
  priority: normal
  content:
    summary: "データ分析完了"
    findings:
      - "トラフィックパターンに異常なし"
      - "CPU使用率が通常より20%高い"
    confidence: 0.85
    requestPrediction: true
```

---

## エージェント状態

```yaml
# state.spec.yaml
kind: AgentState
version: v1
metadata:
  agentName: analyzer
  timestamp: "2026-01-14T00:30:00Z"

spec:
  status: active  # active | idle | warning | error | offline
  currentTask: "analyzing-input-001"
  progress: 0.65
  lastActivity: "2026-01-14T00:29:55Z"
  metrics:
    tasksCompleted: 42
    averageResponseTime: 1.2s
    errorRate: 0.02
```

---

## シナリオ定義（Phase 2用）

```yaml
# scenario.spec.yaml
kind: Scenario
version: v1
metadata:
  name: "basic-analysis-flow"
  description: "基本的な分析フロー"

spec:
  steps:
    - time: 0
      action: set-state
      agent: analyzer
      state: { status: idle }

    - time: 1000
      action: set-state
      agent: analyzer
      state: { status: active, currentTask: "analyzing-input" }

    - time: 2000
      action: send-message
      from: analyzer
      to: predictor
      message:
        type: analysis-complete
        content: { summary: "分析完了", confidence: 0.9 }

    - time: 3000
      action: set-state
      agent: predictor
      state: { status: active }

    - time: 5000
      action: console-log
      message: "[Predictor] 予測モデルを実行中..."
```

---

## 設計原則

1. **宣言的**: 「何をするか」を記述、「どうやるか」は実装が決める
2. **型安全**: スキーマでinput/outputを明確化
3. **疎結合**: エージェント間はメッセージで通信
4. **可視化しやすい**: Aether Consoleでの表示を意識した構造

---

## 今後の検討事項

- [ ] スキーマバリデーション（JSON Schema / Zod）
- [ ] エージェントのホットリロード
- [ ] 会話履歴の永続化
- [ ] 複数シナリオの切り替え
