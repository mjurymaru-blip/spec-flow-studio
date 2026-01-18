/**
 * Connection Store
 *
 * Aether Consoleとの接続状態を管理
 * integration-storeから責務分離
 */
import { writable, derived } from 'svelte/store';
import type { ConnectionStatus } from '$lib/types';

// 接続状態
export const connectionStatus = writable<ConnectionStatus>('disconnected');

// 接続中かどうか
export const isConnected = derived(connectionStatus, ($status) => $status === 'connected');

// 接続中（試行中）かどうか
export const isConnecting = derived(connectionStatus, ($status) => $status === 'connecting');

// エラー状態かどうか
export const hasError = derived(connectionStatus, ($status) => $status === 'error');

/**
 * 接続状態を更新
 */
export function setConnectionStatus(status: ConnectionStatus) {
    connectionStatus.set(status);
}

// 後方互換性のためのエイリアス
export const updateStatus = setConnectionStatus;
