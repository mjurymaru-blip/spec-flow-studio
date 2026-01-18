/**
 * Spec-Kit Schema Validation
 *
 * Zodを使用したSpec-Kit YAML形式のバリデーション
 * 禁止フィールドや危険なconstraintsの検出も行う
 */
import { z } from 'zod';

// ========================================
// 基本スキーマ
// ========================================

/**
 * 通信設定のスキーマ
 */
export const CommunicationSchema = z.object({
    canSendTo: z.array(z.string()).default([]),
    canReceiveFrom: z.array(z.string()).default([])
});

/**
 * エージェント仕様のスキーマ
 */
export const AgentSpecSchema = z.object({
    name: z.string().min(1, 'name は必須です'),
    displayName: z.string().min(1, 'displayName は必須です'),
    role: z.string().min(1, 'role は必須です'),
    capabilities: z.array(z.string()).default([]),
    constraints: z.array(z.string()).default([]),
    communication: CommunicationSchema.default({
        canSendTo: [],
        canReceiveFrom: []
    })
});

/**
 * Spec-Kit全体のスキーマ（複数エージェント）
 */
export const SpecKitSchema = z.object({
    agents: z.array(AgentSpecSchema).min(1, '少なくとも1つのエージェントが必要です')
});

// ========================================
// 危険パターンの検出
// ========================================

/**
 * 危険なcapabilitiesのパターン
 */
const DANGEROUS_CAPABILITIES = [
    'file-system-access',
    'network-unrestricted',
    'execute-code',
    'sudo',
    'root-access',
    'shell-command'
];

/**
 * 必須constraintsのパターン（推奨）
 */
const RECOMMENDED_CONSTRAINTS = [
    /外部API|external\s*API/i,
    /確信度|confidence/i,
    /推測|guess|assume/i
];

/**
 * 禁止フィールドのリスト
 */
const FORBIDDEN_FIELDS = [
    'apiKey',
    'password',
    'secret',
    'token',
    'credentials'
];

// ========================================
// バリデーション結果の型
// ========================================

export interface ValidationWarning {
    type: 'missing_constraint' | 'dangerous_capability' | 'forbidden_field';
    message: string;
    severity: 'warning' | 'error';
    agentName?: string;
}

export interface ValidationResult {
    success: boolean;
    errors: string[];
    warnings: ValidationWarning[];
    data?: z.infer<typeof SpecKitSchema>;
}

// ========================================
// バリデーション関数
// ========================================

/**
 * Spec-Kitの構造をバリデーション
 */
export function validateSpecKit(data: unknown): ValidationResult {
    const result = SpecKitSchema.safeParse(data);

    if (!result.success) {
        return {
            success: false,
            errors: result.error.issues.map((e) => `${e.path.join('.')}: ${e.message}`),
            warnings: []
        };
    }

    // 追加のセキュリティチェック
    const warnings: ValidationWarning[] = [];

    for (const agent of result.data.agents) {
        // 危険なcapabilitiesのチェック
        for (const cap of agent.capabilities) {
            if (DANGEROUS_CAPABILITIES.some(dc => cap.toLowerCase().includes(dc.toLowerCase()))) {
                warnings.push({
                    type: 'dangerous_capability',
                    message: `エージェント "${agent.name}" に危険な capability "${cap}" が定義されています`,
                    severity: 'warning',
                    agentName: agent.name
                });
            }
        }

        // 必須constraintsの欠如チェック
        const hasConstraints = agent.constraints.length > 0;
        if (!hasConstraints) {
            warnings.push({
                type: 'missing_constraint',
                message: `エージェント "${agent.name}" に constraints が定義されていません。AIの行動制約を追加することを推奨します`,
                severity: 'warning',
                agentName: agent.name
            });
        }
    }

    return {
        success: true,
        errors: [],
        warnings,
        data: result.data
    };
}

/**
 * 単一エージェントのバリデーション
 */
export function validateAgent(data: unknown): ValidationResult {
    const result = AgentSpecSchema.safeParse(data);

    if (!result.success) {
        return {
            success: false,
            errors: result.error.issues.map((e) => `${e.path.join('.')}: ${e.message}`),
            warnings: []
        };
    }

    return {
        success: true,
        errors: [],
        warnings: [],
        data: { agents: [result.data] }
    };
}

/**
 * YAMLオブジェクトから禁止フィールドを検出
 */
export function detectForbiddenFields(obj: Record<string, unknown>, path = ''): ValidationWarning[] {
    const warnings: ValidationWarning[] = [];

    for (const [key, value] of Object.entries(obj)) {
        const currentPath = path ? `${path}.${key}` : key;

        // 禁止フィールドのチェック
        if (FORBIDDEN_FIELDS.some(f => key.toLowerCase().includes(f.toLowerCase()))) {
            warnings.push({
                type: 'forbidden_field',
                message: `禁止フィールド "${key}" が検出されました (${currentPath})。セキュリティ上の理由により、このフィールドはSpec-Kitに含めないでください`,
                severity: 'error'
            });
        }

        // 再帰的にチェック
        if (value && typeof value === 'object' && !Array.isArray(value)) {
            warnings.push(...detectForbiddenFields(value as Record<string, unknown>, currentPath));
        }
    }

    return warnings;
}

/**
 * 完全なバリデーション（構造 + セキュリティチェック）
 */
export function validateSpecKitFully(rawData: unknown): ValidationResult {
    // 禁止フィールドのチェック
    const forbiddenWarnings = rawData && typeof rawData === 'object'
        ? detectForbiddenFields(rawData as Record<string, unknown>)
        : [];

    // 禁止フィールドがあればエラー
    if (forbiddenWarnings.some(w => w.severity === 'error')) {
        return {
            success: false,
            errors: forbiddenWarnings.filter(w => w.severity === 'error').map(w => w.message),
            warnings: forbiddenWarnings.filter(w => w.severity === 'warning')
        };
    }

    // 構造バリデーション
    const result = validateSpecKit(rawData);

    return {
        ...result,
        warnings: [...forbiddenWarnings, ...result.warnings]
    };
}
