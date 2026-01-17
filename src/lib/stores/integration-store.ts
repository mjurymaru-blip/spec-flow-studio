/**
 * Integration Store
 *
 * Aether Consoleとの連携状態を管理するストア
 */
import { writable, derived } from 'svelte/store';
import type { ConnectionStatus, IntegrationConfig, SpecPatch } from '$lib/types';
import { DEFAULT_INTEGRATION_CONFIG } from '$lib/types';

// 接続状態
export const connectionStatus = writable<ConnectionStatus>('disconnected');

// 連携設定
export const integrationConfig = writable<IntegrationConfig>(DEFAULT_INTEGRATION_CONFIG);

// パッチ履歴
export const patches = writable<SpecPatch[]>([]);

// 接続中かどうか
export const isConnected = derived(connectionStatus, ($status) => $status === 'connected');

// 接続中（試行中）かどうか
export const isConnecting = derived(connectionStatus, ($status) => $status === 'connecting');

// エラー状態かどうか
export const hasError = derived(connectionStatus, ($status) => $status === 'error');

// パッチ数
export const patchCount = derived(patches, ($patches) => $patches.length);

// 適用済みパッチ
export const appliedPatches = derived(patches, ($patches) =>
    $patches.filter((p) => p.spec.appliedAt !== undefined)
);

/**
 * 接続状態を更新
 */
export function setConnectionStatus(status: ConnectionStatus) {
    connectionStatus.set(status);
}

// updateStatus はsetConnectionStatusのエイリアス（後方互換性）
export const updateStatus = setConnectionStatus;

/**
 * 設定を更新
 */
export function updateConfig(updates: Partial<IntegrationConfig>) {
    integrationConfig.update((current) => ({ ...current, ...updates }));
}

/**
 * パッチを追加
 */
export function addPatch(patch: SpecPatch) {
    patches.update((current) => [...current, patch]);
}

/**
 * パッチを適用済みにする
 */
export function applyPatch(patchId: string) {
    patches.update((current) =>
        current.map((p) =>
            p.metadata.id === patchId
                ? { ...p, spec: { ...p.spec, appliedAt: new Date().toISOString() } }
                : p
        )
    );
}

/**
 * パッチを削除
 */
export function removePatch(patchId: string) {
    patches.update((current) => current.filter((p) => p.metadata.id !== patchId));
}

/**
 * 全てのパッチをクリア
 */
export function clearPatches() {
    patches.set([]);
}
