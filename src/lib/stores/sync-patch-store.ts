/**
 * Patch Store
 *
 * 外部からのパッチ（Aether Console経由）を管理
 * integration-storeから責務分離
 * 
 * 注: history-storeはエディタのローカル履歴を管理
 * こちらはAether Consoleからの同期パッチを管理
 */
import { writable, derived } from 'svelte/store';
import type { SpecPatch } from '$lib/types';

// パッチ履歴
export const syncPatches = writable<SpecPatch[]>([]);

// パッチ数
export const syncPatchCount = derived(syncPatches, ($patches) => $patches.length);

// 適用済みパッチ
export const appliedSyncPatches = derived(syncPatches, ($patches) =>
    $patches.filter((p) => p.spec.appliedAt !== undefined)
);

/**
 * パッチを追加
 */
export function addSyncPatch(patch: SpecPatch) {
    syncPatches.update((current) => [...current, patch]);
}

/**
 * パッチを適用済みにする
 */
export function applySyncPatch(patchId: string) {
    syncPatches.update((current) =>
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
export function removeSyncPatch(patchId: string) {
    syncPatches.update((current) => current.filter((p) => p.metadata.id !== patchId));
}

/**
 * 全てのパッチをクリア
 */
export function clearSyncPatches() {
    syncPatches.set([]);
}
