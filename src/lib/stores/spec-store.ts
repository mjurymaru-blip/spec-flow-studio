/**
 * Spec Store
 *
 * 現在編集中のSpec-Kit仕様を管理するストア
 */
import { writable, derived } from 'svelte/store';
import type { AgentSpec } from '$lib/types';

// 現在のSpec一覧
export const specs = writable<AgentSpec[]>([]);

// 現在のSpec名（ファイル名など）
export const currentSpecName = writable<string | null>(null);

// Specが存在するかどうか
export const hasSpec = derived(specs, ($specs) => $specs.length > 0);

// Spec数
export const specCount = derived(specs, ($specs) => $specs.length);

/**
 * Specを設定
 */
export function setSpecs(newSpecs: AgentSpec[], name?: string) {
    specs.set(newSpecs);
    if (name) {
        currentSpecName.set(name);
    }
}

/**
 * Specをクリア
 */
export function clearSpecs() {
    specs.set([]);
    currentSpecName.set(null);
}

/**
 * 単一のエージェントを追加
 */
export function addAgent(agent: AgentSpec) {
    specs.update((current) => [...current, agent]);
}

/**
 * エージェントを更新
 */
export function updateAgent(name: string, updates: Partial<AgentSpec>) {
    specs.update((current) =>
        current.map((agent) => (agent.name === name ? { ...agent, ...updates } : agent))
    );
}

/**
 * エージェントを削除
 */
export function removeAgent(name: string) {
    specs.update((current) => current.filter((agent) => agent.name !== name));
}
