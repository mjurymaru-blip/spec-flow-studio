/**
 * Config Store
 *
 * Aether Console連携設定を管理
 * integration-storeから責務分離
 */
import { writable } from 'svelte/store';
import type { IntegrationConfig } from '$lib/types';
import { DEFAULT_INTEGRATION_CONFIG } from '$lib/types';

// 連携設定
export const integrationConfig = writable<IntegrationConfig>(DEFAULT_INTEGRATION_CONFIG);

/**
 * 設定を更新
 */
export function updateConfig(updates: Partial<IntegrationConfig>) {
    integrationConfig.update((current) => ({ ...current, ...updates }));
}

/**
 * 設定をリセット
 */
export function resetConfig() {
    integrationConfig.set(DEFAULT_INTEGRATION_CONFIG);
}
