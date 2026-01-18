/**
 * Integration Store
 *
 * Aether Consoleとの連携状態を管理するストア
 * 
 * 責務分離により以下のストアに分割:
 * - connection-store: 接続状態管理
 * - config-store: 設定管理
 * - sync-patch-store: 外部パッチ管理
 * 
 * このファイルは後方互換性のため、すべてを再エクスポート
 */

// Connection (接続状態)
export {
    connectionStatus,
    isConnected,
    isConnecting,
    hasError,
    setConnectionStatus,
    updateStatus
} from './connection-store';

// Config (設定)
export {
    integrationConfig,
    updateConfig,
    resetConfig
} from './config-store';

// Sync Patches (外部パッチ)
export {
    syncPatches as patches,
    syncPatchCount as patchCount,
    appliedSyncPatches as appliedPatches,
    addSyncPatch as addPatch,
    applySyncPatch as applyPatch,
    removeSyncPatch as removePatch,
    clearSyncPatches as clearPatches
} from './sync-patch-store';
