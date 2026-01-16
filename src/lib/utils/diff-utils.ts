/**
 * Diff Utils
 *
 * Spec-Kitの差分検出とパッチ生成・適用ロジック
 */
import type { AgentSpec, SpecDiff, SpecPatch } from '$lib/types';

/**
 * 2つのAgentSpec配列を比較し、差分を検出してSpecPatchを生成
 */
export function generateSpecPatch(
    before: AgentSpec[],
    after: AgentSpec[],
    options?: { name?: string; author?: 'human' | 'ai' | 'system' }
): SpecPatch {
    const diffs: SpecDiff[] = [];
    const beforeMap = new Map(before.map((s) => [s.name, s]));
    const afterMap = new Map(after.map((s) => [s.name, s]));

    // 削除されたエージェント
    for (const [name, spec] of beforeMap) {
        if (!afterMap.has(name)) {
            diffs.push({
                id: `diff-${crypto.randomUUID().slice(0, 8)}`,
                agentName: name,
                operation: 'remove',
                path: 'agent',
                before: spec,
                after: undefined,
                impact: 'high'
            });
        }
    }

    // 追加されたエージェント
    for (const [name, spec] of afterMap) {
        if (!beforeMap.has(name)) {
            diffs.push({
                id: `diff-${crypto.randomUUID().slice(0, 8)}`,
                agentName: name,
                operation: 'add',
                path: 'agent',
                before: undefined,
                after: spec,
                impact: 'high'
            });
        }
    }

    // 変更されたエージェント
    for (const [name, afterSpec] of afterMap) {
        const beforeSpec = beforeMap.get(name);
        if (beforeSpec) {
            const fieldDiffs = detectFieldChanges(name, beforeSpec, afterSpec);
            diffs.push(...fieldDiffs);
        }
    }

    // 自然言語サマリーの生成
    const summary = generateSummary(diffs);

    return {
        kind: 'SpecPatch',
        version: 'v1',
        metadata: {
            id: `patch-${crypto.randomUUID().slice(0, 8)}`,
            name: options?.name || summary.slice(0, 50),
            createdAt: new Date().toISOString(),
            author: options?.author || 'human'
        },
        spec: {
            diffs,
            summary
        }
    };
}

/**
 * エージェント内のフィールド変更を検出
 */
function detectFieldChanges(agentName: string, before: AgentSpec, after: AgentSpec): SpecDiff[] {
    const diffs: SpecDiff[] = [];

    // role
    if (before.role !== after.role) {
        diffs.push(createDiff(agentName, 'spec.role', before.role, after.role, 'medium'));
    }

    // displayName
    if (before.displayName !== after.displayName) {
        diffs.push(createDiff(agentName, 'spec.displayName', before.displayName, after.displayName, 'low'));
    }

    // constraints (配列比較)
    const constraintDiffs = detectArrayChanges(
        agentName,
        'spec.constraints',
        before.constraints,
        after.constraints,
        'medium' // 制約変更は中程度の影響
    );
    diffs.push(...constraintDiffs);

    // capabilities (配列比較)
    const capabilityDiffs = detectArrayChanges(
        agentName,
        'spec.capabilities',
        before.capabilities,
        after.capabilities,
        'low'
    );
    diffs.push(...capabilityDiffs);

    // communication.canSendTo
    const sendToDiffs = detectArrayChanges(
        agentName,
        'spec.communication.canSendTo',
        before.communication.canSendTo,
        after.communication.canSendTo,
        'medium'
    );
    diffs.push(...sendToDiffs);

    // communication.canReceiveFrom
    const receiveFromDiffs = detectArrayChanges(
        agentName,
        'spec.communication.canReceiveFrom',
        before.communication.canReceiveFrom,
        after.communication.canReceiveFrom,
        'medium'
    );
    diffs.push(...receiveFromDiffs);

    return diffs;
}

/**
 * 配列の変更を検出
 */
function detectArrayChanges(
    agentName: string,
    basePath: string,
    before: string[],
    after: string[],
    defaultImpact: 'low' | 'medium' | 'high'
): SpecDiff[] {
    const diffs: SpecDiff[] = [];
    const beforeSet = new Set(before);
    const afterSet = new Set(after);

    // 削除された要素
    for (const item of before) {
        if (!afterSet.has(item)) {
            diffs.push(createDiff(agentName, `${basePath}[]`, item, undefined, defaultImpact, 'remove'));
        }
    }

    // 追加された要素
    for (const item of after) {
        if (!beforeSet.has(item)) {
            diffs.push(createDiff(agentName, `${basePath}[]`, undefined, item, defaultImpact, 'add'));
        }
    }

    return diffs;
}

/**
 * SpecDiffオブジェクトを作成
 */
function createDiff(
    agentName: string,
    path: string,
    before: unknown,
    after: unknown,
    impact: 'low' | 'medium' | 'high',
    operation?: 'add' | 'remove' | 'modify'
): SpecDiff {
    let op: 'add' | 'remove' | 'modify' = operation || 'modify';
    if (!operation) {
        if (before === undefined) op = 'add';
        else if (after === undefined) op = 'remove';
        else op = 'modify';
    }

    return {
        id: `diff-${crypto.randomUUID().slice(0, 8)}`,
        agentName,
        operation: op,
        path,
        before,
        after,
        impact
    };
}

/**
 * 差分から自然言語サマリーを生成
 */
function generateSummary(diffs: SpecDiff[]): string {
    if (diffs.length === 0) return '変更なし';

    const parts: string[] = [];
    const agentAdded = diffs.filter((d) => d.path === 'agent' && d.operation === 'add');
    const agentRemoved = diffs.filter((d) => d.path === 'agent' && d.operation === 'remove');
    const fieldChanges = diffs.filter((d) => d.path !== 'agent');

    if (agentAdded.length > 0) {
        parts.push(`${agentAdded.map((d) => d.agentName).join(', ')} を追加`);
    }
    if (agentRemoved.length > 0) {
        parts.push(`${agentRemoved.map((d) => d.agentName).join(', ')} を削除`);
    }
    if (fieldChanges.length > 0) {
        const agents = [...new Set(fieldChanges.map((d) => d.agentName))];
        parts.push(`${agents.join(', ')} のフィールドを ${fieldChanges.length} 件変更`);
    }

    return parts.join(' / ');
}

/**
 * パッチを適用してAgentSpec配列を更新
 */
export function applySpecPatch(specs: AgentSpec[], patch: SpecPatch): AgentSpec[] {
    let result = [...specs];

    for (const diff of patch.spec.diffs) {
        if (diff.path === 'agent') {
            // エージェント全体の追加/削除
            if (diff.operation === 'add' && diff.after) {
                result.push(diff.after as AgentSpec);
            } else if (diff.operation === 'remove') {
                result = result.filter((s) => s.name !== diff.agentName);
            }
        } else {
            // フィールドレベルの変更
            result = result.map((spec) => {
                if (spec.name !== diff.agentName) return spec;
                return applyFieldDiff(spec, diff);
            });
        }
    }

    return result;
}

/**
 * フィールドレベルの差分を適用
 */
function applyFieldDiff(spec: AgentSpec, diff: SpecDiff): AgentSpec {
    const updated = { ...spec };

    // パスに基づいて適用
    if (diff.path === 'spec.role') {
        updated.role = diff.after as string;
    } else if (diff.path === 'spec.displayName') {
        updated.displayName = diff.after as string;
    } else if (diff.path === 'spec.constraints[]') {
        updated.constraints = applyArrayDiff(updated.constraints, diff);
    } else if (diff.path === 'spec.capabilities[]') {
        updated.capabilities = applyArrayDiff(updated.capabilities, diff);
    } else if (diff.path === 'spec.communication.canSendTo[]') {
        updated.communication = {
            ...updated.communication,
            canSendTo: applyArrayDiff(updated.communication.canSendTo, diff)
        };
    } else if (diff.path === 'spec.communication.canReceiveFrom[]') {
        updated.communication = {
            ...updated.communication,
            canReceiveFrom: applyArrayDiff(updated.communication.canReceiveFrom, diff)
        };
    }

    return updated;
}

/**
 * 配列への差分適用
 */
function applyArrayDiff(arr: string[], diff: SpecDiff): string[] {
    if (diff.operation === 'add' && diff.after) {
        return [...arr, diff.after as string];
    } else if (diff.operation === 'remove' && diff.before) {
        return arr.filter((item) => item !== diff.before);
    }
    return arr;
}

/**
 * パッチを逆適用（ロールバック用）
 */
export function revertSpecPatch(specs: AgentSpec[], patch: SpecPatch): AgentSpec[] {
    // 逆順で、操作を反転して適用
    const reversedDiffs = [...patch.spec.diffs].reverse().map((diff) => ({
        ...diff,
        operation: reverseOperation(diff.operation),
        before: diff.after,
        after: diff.before
    }));

    const reversedPatch: SpecPatch = {
        ...patch,
        spec: {
            ...patch.spec,
            diffs: reversedDiffs
        }
    };

    return applySpecPatch(specs, reversedPatch);
}

function reverseOperation(op: 'add' | 'remove' | 'modify'): 'add' | 'remove' | 'modify' {
    if (op === 'add') return 'remove';
    if (op === 'remove') return 'add';
    return 'modify';
}

/**
 * パッチが空（変更なし）かどうかを確認
 */
export function isPatchEmpty(patch: SpecPatch): boolean {
    return patch.spec.diffs.length === 0;
}
