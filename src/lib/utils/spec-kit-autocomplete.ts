/**
 * Spec-Kit Autocomplete
 *
 * CodeMirror 6用のSpec-Kit YAML自動補完拡張
 */
import { autocompletion, type CompletionContext, type Completion } from '@codemirror/autocomplete';

/**
 * Spec-Kitのトップレベルキーワード
 */
const TOP_LEVEL_KEYWORDS: Completion[] = [
    { label: 'kind', type: 'keyword', detail: 'ドキュメント種別', apply: 'kind: Agent' },
    { label: 'version', type: 'keyword', detail: 'バージョン', apply: 'version: v1' },
    { label: 'metadata', type: 'keyword', detail: 'メタデータセクション' },
    { label: 'spec', type: 'keyword', detail: '仕様セクション' }
];

/**
 * metadataセクションのキーワード
 */
const METADATA_KEYWORDS: Completion[] = [
    { label: 'name', type: 'property', detail: 'エージェント識別子', apply: 'name: ' },
    { label: 'displayName', type: 'property', detail: '表示名', apply: 'displayName: "' },
    { label: 'description', type: 'property', detail: '説明', apply: 'description: "' },
    { label: 'icon', type: 'property', detail: 'アイコン', apply: 'icon: "🤖"' }
];

/**
 * specセクションのキーワード
 */
const SPEC_KEYWORDS: Completion[] = [
    { label: 'role', type: 'property', detail: 'エージェントの役割', apply: 'role: |' },
    { label: 'capabilities', type: 'property', detail: '実行可能な機能', apply: 'capabilities:' },
    { label: 'constraints', type: 'property', detail: '行動制約', apply: 'constraints:' },
    { label: 'inputs', type: 'property', detail: '入力定義', apply: 'inputs:' },
    { label: 'outputs', type: 'property', detail: '出力定義', apply: 'outputs:' },
    { label: 'communication', type: 'property', detail: '通信設定', apply: 'communication:' }
];

/**
 * communicationセクションのキーワード
 */
const COMMUNICATION_KEYWORDS: Completion[] = [
    { label: 'canSendTo', type: 'property', detail: '送信先エージェント', apply: 'canSendTo:' },
    { label: 'canReceiveFrom', type: 'property', detail: '受信元エージェント', apply: 'canReceiveFrom:' }
];

/**
 * capabilities候補
 */
const CAPABILITY_VALUES: Completion[] = [
    { label: 'data-analysis', type: 'value', detail: 'データ分析' },
    { label: 'pattern-recognition', type: 'value', detail: 'パターン認識' },
    { label: 'anomaly-detection', type: 'value', detail: '異常検出' },
    { label: 'natural-language-processing', type: 'value', detail: '自然言語処理' },
    { label: 'summarization', type: 'value', detail: '要約' },
    { label: 'classification', type: 'value', detail: '分類' },
    { label: 'prediction', type: 'value', detail: '予測' },
    { label: 'recommendation', type: 'value', detail: '推薦' }
];

/**
 * constraints候補（推奨）
 */
const CONSTRAINT_VALUES: Completion[] = [
    { label: '推測で情報を補完しない', type: 'value', detail: '推奨制約', apply: '- "推測で情報を補完しない"' },
    { label: '確信度が低い場合は明示する', type: 'value', detail: '推奨制約', apply: '- "確信度が低い場合は明示する"' },
    { label: '外部APIを勝手に呼び出さない', type: 'value', detail: '推奨制約', apply: '- "外部APIを勝手に呼び出さない"' },
    { label: 'ユーザーの明示的な指示なしに実行しない', type: 'value', detail: '推奨制約', apply: '- "ユーザーの明示的な指示なしに実行しない"' },
    { label: '個人情報を外部に送信しない', type: 'value', detail: 'セキュリティ制約', apply: '- "個人情報を外部に送信しない"' }
];

/**
 * 現在行のコンテキストを判定
 */
function getContext(doc: string, pos: number): 'top' | 'metadata' | 'spec' | 'communication' | 'capabilities' | 'constraints' | 'unknown' {
    const beforeCursor = doc.slice(0, pos);
    const lines = beforeCursor.split('\n');

    // 直近のセクションを探す
    let currentSection: string | null = null;
    let indentLevel = 0;

    for (let i = lines.length - 1; i >= 0; i--) {
        const line = lines[i];
        const trimmed = line.trim();

        if (!trimmed || trimmed.startsWith('#')) continue;

        // インデントを計算
        const lineIndent = line.search(/\S|$/);

        // キーワードを検出
        if (trimmed.match(/^metadata:/)) {
            return 'metadata';
        }
        if (trimmed.match(/^spec:/)) {
            return 'spec';
        }
        if (trimmed.match(/^communication:/)) {
            return 'communication';
        }
        if (trimmed.match(/^capabilities:/)) {
            return 'capabilities';
        }
        if (trimmed.match(/^constraints:/)) {
            return 'constraints';
        }

        // トップレベルのキーワード
        if (lineIndent === 0 && trimmed.match(/^(kind|version):/)) {
            if (lines[lines.length - 1].trim() === '' || lines[lines.length - 1].search(/\S|$/) === 0) {
                return 'top';
            }
        }
    }

    return lines[lines.length - 1].search(/\S|$/) === 0 ? 'top' : 'unknown';
}

/**
 * Spec-Kit用自動補完関数
 */
function specKitCompletions(context: CompletionContext) {
    const word = context.matchBefore(/[\w-]*/);
    if (!word || (word.from === word.to && !context.explicit)) return null;

    const doc = context.state.doc.toString();
    const currentContext = getContext(doc, context.pos);

    let options: Completion[] = [];

    switch (currentContext) {
        case 'top':
            options = TOP_LEVEL_KEYWORDS;
            break;
        case 'metadata':
            options = METADATA_KEYWORDS;
            break;
        case 'spec':
            options = SPEC_KEYWORDS;
            break;
        case 'communication':
            options = COMMUNICATION_KEYWORDS;
            break;
        case 'capabilities':
            options = CAPABILITY_VALUES;
            break;
        case 'constraints':
            options = CONSTRAINT_VALUES;
            break;
        default:
            // フォールバック: すべての候補を表示
            options = [
                ...TOP_LEVEL_KEYWORDS,
                ...METADATA_KEYWORDS,
                ...SPEC_KEYWORDS,
                ...COMMUNICATION_KEYWORDS
            ];
    }

    return {
        from: word.from,
        options,
        validFor: /^[\w-]*$/
    };
}

/**
 * Spec-Kit自動補完拡張
 */
export const specKitAutocomplete = autocompletion({
    override: [specKitCompletions],
    defaultKeymap: true,
    activateOnTyping: true,
    maxRenderedOptions: 20
});
