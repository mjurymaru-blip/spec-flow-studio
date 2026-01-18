/**
 * Demo Content
 *
 * 強制デモシナリオ用のMockコンテンツ
 * 「金融ダッシュボード」テーマ
 */

// 制約なしSpec（危険）
export const UNCONSTRAINED_SPEC = `kind: Agent
version: v1
metadata:
  name: investment-advisor
  displayName: "投資アドバイザー"
  description: "ユーザーに投資推奨を行うAI"

spec:
  role: |
    ユーザーの資産を最大化するために
    積極的な投資推奨を行う。

  capabilities:
    - market-analysis
    - portfolio-recommendation
    - transaction-execution

  constraints: []  # ⚠️ 制約なし！
`;

// 制約ありSpec（安全）
export const CONSTRAINED_SPEC = `kind: Agent
version: v1
metadata:
  name: investment-advisor
  displayName: "投資アドバイザー"
  description: "ユーザーに投資推奨を行うAI"

spec:
  role: |
    ユーザーの資産を最大化するために
    積極的な投資推奨を行う。

  capabilities:
    - market-analysis
    - portfolio-recommendation
    - transaction-execution

  constraints:
    - "ユーザーの同意なく取引を実行しない"
    - "リスク説明を必ず表示する"
    - "煽り表現や誇大広告を使用しない"
    - "ユーザーの全資産を一度に投資させない"
`;

// 追加される制約（SpecPatch風に表示）
export const ADDED_CONSTRAINTS = [
    'ユーザーの同意なく取引を実行しない',
    'リスク説明を必ず表示する',
    '煽り表現や誇大広告を使用しない',
    'ユーザーの全資産を一度に投資させない'
];

// 制約なし版のUI Mock（問題のあるUI - マイルド版）
export const UNCONSTRAINED_UI = `<!DOCTYPE html>
<html lang="ja">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>投資アシスタント</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
            background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
            color: #e0e0e0;
            min-height: 100vh;
            padding: 20px;
        }
        .container { max-width: 600px; margin: 0 auto; }
        .header {
            display: flex;
            align-items: center;
            gap: 12px;
            margin-bottom: 24px;
        }
        .header-icon {
            width: 40px; height: 40px;
            background: linear-gradient(135deg, #e94560, #ff6b6b);
            border-radius: 10px;
            display: flex; align-items: center; justify-content: center;
            font-size: 20px;
        }
        .header h1 { font-size: 20px; font-weight: 600; }
        .card {
            background: rgba(255,255,255,0.05);
            border: 1px solid rgba(255,255,255,0.1);
            border-radius: 12px;
            padding: 20px;
            margin-bottom: 16px;
        }
        .card-title { font-size: 14px; color: #888; margin-bottom: 8px; }
        .balance { font-size: 32px; font-weight: 600; color: #fff; }
        .recommendation { border-left: 3px solid #e94560; padding-left: 16px; }
        .optimal-label {
            display: inline-block;
            background: #e94560;
            color: white;
            font-size: 11px;
            padding: 4px 8px;
            border-radius: 4px;
            margin-bottom: 8px;
        }
        .action-text { font-size: 16px; font-weight: 600; color: #fff; }
        .action-detail { font-size: 14px; color: #aaa; margin-top: 4px; }
        .expected-return {
            background: rgba(233, 69, 96, 0.2);
            border: 1px solid rgba(233, 69, 96, 0.5);
            border-radius: 8px;
            padding: 12px 16px;
            font-size: 18px;
            color: #e94560;
            font-weight: 600;
            text-align: center;
            margin-bottom: 16px;
        }
        .action-button {
            width: 100%;
            padding: 16px 24px;
            border-radius: 8px;
            font-size: 16px;
            font-weight: 600;
            cursor: pointer;
            border: none;
            background: linear-gradient(135deg, #e94560, #ff6b6b);
            color: white;
        }
        .footnote { font-size: 11px; color: #666; text-align: center; margin-top: 16px; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <div class="header-icon">📈</div>
            <h1>投資アシスタント</h1>
        </div>
        <div class="card">
            <div class="card-title">利用可能資産</div>
            <div class="balance">¥1,234,567</div>
        </div>
        <div class="card recommendation">
            <span class="optimal-label">AI推奨：最適戦略</span>
            <div class="action-text">全資産の一括投資</div>
            <div class="action-detail">過去データ分析に基づく最適解</div>
        </div>
        <div class="expected-return">期待リターン: +127%</div>
        <button class="action-button">戦略を実行する</button>
        <p class="footnote">※過去実績に基づくAI算出値</p>
    </div>
</body>
</html>`;

// 制約あり版のUI Mock（安全で整った）
export const CONSTRAINED_UI = `<!DOCTYPE html>
<html lang="ja">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>投資アドバイザー</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
            background: linear-gradient(135deg, #0a0a1a 0%, #1a1a3a 100%);
            color: #e0e0e0;
            min-height: 100vh;
            padding: 20px;
        }
        .container {
            max-width: 600px;
            margin: 0 auto;
        }
        .header {
            display: flex;
            align-items: center;
            gap: 12px;
            margin-bottom: 24px;
        }
        .header-icon {
            width: 40px;
            height: 40px;
            background: linear-gradient(135deg, #00d4ff, #0099ff);
            border-radius: 10px;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 20px;
        }
        .header h1 {
            font-size: 20px;
            font-weight: 600;
        }
        .card {
            background: rgba(255,255,255,0.05);
            border: 1px solid rgba(255,255,255,0.1);
            border-radius: 12px;
            padding: 20px;
            margin-bottom: 16px;
        }
        .card-title {
            font-size: 14px;
            color: #888;
            margin-bottom: 8px;
        }
        .balance {
            font-size: 28px;
            font-weight: 600;
            color: #fff;
        }
        .recommendation {
            border-left: 3px solid #00d4ff;
            padding-left: 16px;
        }
        .stock-name {
            font-size: 16px;
            font-weight: 600;
            color: #00d4ff;
        }
        .stock-info {
            font-size: 14px;
            color: #aaa;
            margin-top: 4px;
        }
        .warning {
            background: rgba(255, 193, 7, 0.1);
            border: 1px solid rgba(255, 193, 7, 0.3);
            border-radius: 8px;
            padding: 12px 16px;
            display: flex;
            align-items: center;
            gap: 10px;
            font-size: 13px;
            color: #ffc107;
            margin-bottom: 16px;
        }
        .buttons {
            display: flex;
            gap: 12px;
        }
        .btn {
            flex: 1;
            padding: 14px 20px;
            border-radius: 8px;
            font-size: 14px;
            font-weight: 600;
            cursor: pointer;
            border: none;
            transition: all 0.2s;
        }
        .btn-secondary {
            background: rgba(255,255,255,0.1);
            color: #fff;
        }
        .btn-primary {
            background: linear-gradient(135deg, #00d4ff, #0099ff);
            color: #000;
        }
        .constraint-badge {
            display: inline-flex;
            align-items: center;
            gap: 6px;
            background: rgba(0, 212, 255, 0.1);
            border: 1px solid rgba(0, 212, 255, 0.3);
            border-radius: 20px;
            padding: 6px 12px;
            font-size: 11px;
            color: #00d4ff;
            margin-top: 16px;
        }
        .blocked-actions {
            background: rgba(239, 68, 68, 0.1);
            border: 1px solid rgba(239, 68, 68, 0.3);
            border-radius: 8px;
            padding: 12px 16px;
            margin-bottom: 16px;
        }
        .blocked-title {
            font-size: 12px;
            font-weight: 600;
            color: #ef4444;
            margin-bottom: 8px;
        }
        .blocked-list {
            list-style: none;
            font-size: 11px;
            color: #aaa;
        }
        .blocked-list li {
            padding: 2px 0;
        }
        .blocked-list li::before {
            content: "✗ ";
            color: #ef4444;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <div class="header-icon">📊</div>
            <h1>投資アドバイザー</h1>
        </div>
        
        <div class="card">
            <div class="card-title">総資産</div>
            <div class="balance">¥1,234,567</div>
        </div>
        
        <div class="card recommendation">
            <div class="card-title">本日のおすすめ（参考情報）</div>
            <div class="stock-name">テクノロジーETF</div>
            <div class="stock-info">過去1年リターン: +12.3% | リスクレベル: 中</div>
        </div>
        
        <div class="warning">
            ⚠️ 投資には元本割れの可能性があります。ご自身の判断でお願いします。
        </div>
        
        <div class="blocked-actions">
            <div class="blocked-title">⛔ 制約により禁止された行為</div>
            <ul class="blocked-list">
                <li>全資産の一括投資の推奨</li>
                <li>断定的な利益表現</li>
                <li>リスク非表示での推奨</li>
            </ul>
        </div>
        
        <div class="buttons">
            <button class="btn btn-secondary">リスクを確認</button>
            <button class="btn btn-primary">詳細を見る</button>
        </div>
        
        <div class="constraint-badge">
            🛡️ 4つの制約を遵守しています
        </div>
    </div>
</body>
</html>`;
