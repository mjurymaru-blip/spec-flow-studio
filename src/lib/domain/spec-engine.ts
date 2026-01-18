/**
 * Spec Engine
 *
 * Spec-Kit関連のドメインロジックを集約
 * ストアから判断ロジックを分離し、再利用性とテスト容易性を向上
 */
import type { AgentSpec, SpecPatch, SpecDiff } from '$lib/types';
import {
    validateSpecKitFully,
    type ValidationResult,
    type ValidationWarning
} from '$lib/utils/spec-kit-schema';

// ========================================
// Spec バリデーション
// ========================================

/**
 * 複数エージェントのバリデーション
 */
export function validateSpecs(specs: AgentSpec[]): ValidationResult {
    return validateSpecKitFully({ agents: specs });
}

/**
 * 単一エージェントのバリデーション
 */
export function validateSingleSpec(spec: AgentSpec): ValidationResult {
    return validateSpecKitFully({ agents: [spec] });
}

// ========================================
// Spec 分析
// ========================================

/**
 * すべてのconstraintsを抽出
 */
export function extractAllConstraints(specs: AgentSpec[]): string[] {
    return specs.flatMap(spec => spec.constraints || []);
}

/**
 * すべてのcapabilitiesを抽出
 */
export function extractAllCapabilities(specs: AgentSpec[]): string[] {
    return specs.flatMap(spec => spec.capabilities || []);
}

/**
 * エージェント間の通信グラフを構築
 */
export interface CommunicationEdge {
    from: string;
    to: string;
}

export function buildCommunicationGraph(specs: AgentSpec[]): CommunicationEdge[] {
    const edges: CommunicationEdge[] = [];

    for (const spec of specs) {
        for (const target of spec.communication?.canSendTo || []) {
            edges.push({ from: spec.name, to: target });
        }
    }

    return edges;
}

/**
 * 孤立したエージェント（通信のないエージェント）を検出
 */
export function findIsolatedAgents(specs: AgentSpec[]): string[] {
    const connectedAgents = new Set<string>();

    for (const spec of specs) {
        const canSend = spec.communication?.canSendTo || [];
        const canReceive = spec.communication?.canReceiveFrom || [];

        if (canSend.length > 0 || canReceive.length > 0) {
            connectedAgents.add(spec.name);
            canSend.forEach(name => connectedAgents.add(name));
            canReceive.forEach(name => connectedAgents.add(name));
        }
    }

    return specs
        .filter(spec => !connectedAgents.has(spec.name))
        .map(spec => spec.name);
}

// ========================================
// Patch 評価
// ========================================

/**
 * パッチの影響度を評価
 */
export function evaluatePatchImpact(patch: SpecPatch): 'low' | 'medium' | 'high' {
    const diffs = patch.spec.diffs;

    // 高影響: constraints変更、複数エージェント変更
    const hasConstraintChange = diffs.some(d => d.path.includes('constraints'));
    const uniqueAgents = new Set(diffs.map(d => d.agentName));

    if (hasConstraintChange) return 'high';
    if (uniqueAgents.size > 2) return 'high';
    if (diffs.some(d => d.impact === 'high')) return 'high';

    // 中影響: role変更、capability変更
    const hasRoleChange = diffs.some(d => d.path.includes('role'));
    const hasCapabilityChange = diffs.some(d => d.path.includes('capabilities'));

    if (hasRoleChange || hasCapabilityChange) return 'medium';
    if (uniqueAgents.size > 1) return 'medium';

    return 'low';
}

/**
 * パッチのサマリーを自動生成
 */
export function generatePatchSummary(diffs: SpecDiff[]): string {
    if (diffs.length === 0) return '変更なし';

    const operations = {
        add: diffs.filter(d => d.operation === 'add').length,
        modify: diffs.filter(d => d.operation === 'modify').length,
        remove: diffs.filter(d => d.operation === 'remove').length
    };

    const parts: string[] = [];
    if (operations.add > 0) parts.push(`${operations.add}件追加`);
    if (operations.modify > 0) parts.push(`${operations.modify}件変更`);
    if (operations.remove > 0) parts.push(`${operations.remove}件削除`);

    const affectedAgents = [...new Set(diffs.map(d => d.agentName))];
    const agentText = affectedAgents.length <= 2
        ? affectedAgents.join(', ')
        : `${affectedAgents.slice(0, 2).join(', ')} 他${affectedAgents.length - 2}件`;

    return `${agentText}: ${parts.join(', ')}`;
}
