/**
 * Spec-Flow Studio Type Definitions
 *
 * Aether ConsoleとSpec-Flow Studioの連携用インターフェース定義
 * および Spec-Flow Studio 固有の型定義
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
    impact: 'low' | 'medium' | 'high';
}

/**
 * パッチ（差分の集合）- ハイブリッド形式
 */
export interface SpecPatch {
    kind: 'SpecPatch';
    version: 'v1';
    metadata: {
        id: string;
        name: string;
        createdAt: string; // ISO8601
        author: 'human' | 'ai' | 'system';
    };
    spec: {
        diffs: SpecDiff[];
        summary: string;
        rationale?: string;
        appliedAt?: string; // ISO8601
    };
}

// ========================================
// 連携イベント
// ========================================

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

/**
 * Aether Console → Spec-Flow Studio
 * コンソールからスタジオへ送信するイベント
 */
export type ConsoleToStudioEvent =
    | { type: 'PATCH_APPLIED'; patch: SpecPatch }
    | { type: 'PATCH_REVERTED'; patchId: string }
    | { type: 'AGENT_EXECUTED'; agentName: string; input: string; output: string }
    | { type: 'PROPOSAL_GENERATED'; proposal: string; agentResults: AgentResultSummary[] }
    | { type: 'SYNC_REQUEST' };

/**
 * Spec-Flow Studio → Aether Console
 * スタジオからコンソールへ送信するイベント
 */
export type StudioToConsoleEvent =
    | { type: 'SPEC_UPDATED'; agents: AgentSpec[] }
    | { type: 'PATCH_CREATED'; patch: SpecPatch }
    | { type: 'SCENARIO_CREATED'; scenario: ScenarioSummary }
    | { type: 'SYNC_RESPONSE'; agents: AgentSpec[]; patches: SpecPatch[] };

// ========================================
// 連携設定
// ========================================

/**
 * 連携接続設定
 */
export interface IntegrationConfig {
    /** Aether ConsoleのWebSocket URL */
    consoleUrl: string;
    /** 自動同期を有効にするか */
    autoSync: boolean;
    /** 同期間隔（ミリ秒） */
    syncInterval: number;
}

/**
 * デフォルトの連携設定
 */
export const DEFAULT_INTEGRATION_CONFIG: IntegrationConfig = {
    consoleUrl: 'wss://localhost:3001/api/ws',
    autoSync: false,
    syncInterval: 5000
};

// ========================================
// 生成物（Artifacts）
// ========================================

/**
 * 生成物の種類
 */
export type ArtifactType = 'ui-mock' | 'api-spec' | 'test-case' | 'use-case-diagram';

/**
 * 生成物
 */
export interface Artifact {
    id: string;
    type: ArtifactType;
    name: string;
    content: string;
    generatedAt: string; // ISO8601
    sourceSpec: string; // 生成元のSpec名
    rationale?: string; // AIの生成理由
    consideredConstraints?: string[]; // 生成時に考慮した制約
}

// ========================================
// アプリケーション状態
// ========================================

/**
 * 接続状態
 */
export type ConnectionStatus = 'disconnected' | 'connecting' | 'connected' | 'error';

/**
 * アプリケーション全体の状態
 */
export interface AppState {
    currentSpec: AgentSpec[] | null;
    currentSpecName: string | null;
    artifacts: Artifact[];
    patches: SpecPatch[];
    connectionStatus: ConnectionStatus;
}
