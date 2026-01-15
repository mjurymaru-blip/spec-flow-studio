/**
 * Spec-Flow Studio Integration Types
 * 
 * Aether ConsoleとSpec-Flow Studioの連携用インターフェース定義
 * Spec-Flow Studio側でも同じ型定義を使用する
 */

// ========================================
// Spec-Kit形式（共通データモデル）
// ========================================

/**
 * エージェント仕様
 */
export interface AgentSpec {
    name: string;
    displayName: string;
    role: string;
    capabilities: string[];
    constraints: string[];
    communication: {
        canSendTo: string[];
        canReceiveFrom: string[];
    };
}

/**
 * Spec差分（仕様変更）
 */
export interface SpecDiff {
    id: string;
    agentName: string;
    operation: 'add' | 'remove' | 'modify';
    path: string;
    before?: unknown;
    after?: unknown;
    description: string;
    impact: 'low' | 'medium' | 'high';
}

/**
 * パッチ（差分の集合）
 */
export interface SpecPatch {
    id: string;
    name: string;
    description: string;
    diffs: SpecDiff[];
    appliedAt?: Date;
}

// ========================================
// 連携イベント
// ========================================

/**
 * Aether Console → Spec-Flow Studio
 * コンソールからスタジオへ送信するイベント
 */
export type ConsoleToStudioEvent =
    | { type: 'PATCH_APPLIED'; patch: SpecPatch }
    | { type: 'PATCH_REVERTED'; patchId: string }
    | { type: 'AGENT_EXECUTED'; agentName: string; input: string; output: string }
    | { type: 'PROPOSAL_GENERATED'; proposal: string; agentResults: AgentResultSummary[] }
    | { type: 'SYNC_REQUEST'; };

/**
 * Spec-Flow Studio → Aether Console
 * スタジオからコンソールへ送信するイベント
 */
export type StudioToConsoleEvent =
    | { type: 'SPEC_UPDATED'; agents: AgentSpec[] }
    | { type: 'PATCH_CREATED'; patch: SpecPatch }
    | { type: 'SCENARIO_CREATED'; scenario: ScenarioSummary }
    | { type: 'SYNC_RESPONSE'; agents: AgentSpec[]; patches: SpecPatch[] };

/**
 * エージェント実行結果の概要
 */
export interface AgentResultSummary {
    agentName: string;
    displayName: string;
    status: 'completed' | 'error';
    responseSummary: string;
}

/**
 * シナリオの概要
 */
export interface ScenarioSummary {
    id: string;
    name: string;
    description: string;
    messageCount: number;
}

// ========================================
// 連携設定
// ========================================

/**
 * 連携接続設定
 */
export interface IntegrationConfig {
    /** Spec-Flow StudioのWebSocket URL */
    studioUrl: string;
    /** 自動同期を有効にするか */
    autoSync: boolean;
    /** 同期間隔（ミリ秒） */
    syncInterval: number;
}

/**
 * デフォルトの連携設定
 */
export const DEFAULT_INTEGRATION_CONFIG: IntegrationConfig = {
    studioUrl: 'ws://localhost:3001/api/ws',
    autoSync: false,
    syncInterval: 5000
};
