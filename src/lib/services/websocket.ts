/**
 * WebSocket Service
 *
 * Aether Console との WebSocket 通信を管理
 */
import { writable, get } from 'svelte/store';
import type {
    ConnectionStatus,
    ConsoleToStudioEvent,
    StudioToConsoleEvent,
    AgentSpec,
    SpecPatch
} from '$lib/types';
import { integrationConfig, updateStatus } from '$lib/stores/integration-store';
import { specs } from '$lib/stores/spec-store';
import { historyStore, patches } from '$lib/stores/history-store';

// 接続状態ストア
export const wsStatus = writable<ConnectionStatus>('disconnected');

// 受信メッセージストア（最新のもの）
export const lastReceivedEvent = writable<ConsoleToStudioEvent | null>(null);

// アクティビティログ（直近の通信イベント）
export const activityLog = writable<{ message: string; type: 'info' | 'success' | 'warning' | 'error'; timestamp: number } | null>(null);

function logActivity(message: string, type: 'info' | 'success' | 'warning' | 'error' = 'info') {
    activityLog.set({ message, type, timestamp: Date.now() });
}

let ws: WebSocket | null = null;
let reconnectTimer: ReturnType<typeof setTimeout> | null = null;
let reconnectAttempts = 0;
const MAX_RECONNECT_ATTEMPTS = 5;
const RECONNECT_DELAY = 3000;

/**
 * WebSocket接続を開始
 */
export function connect() {
    const config = get(integrationConfig);
    if (!config.consoleUrl) {
        console.warn('WebSocket URL is not configured');
        return;
    }

    if (ws && (ws.readyState === WebSocket.CONNECTING || ws.readyState === WebSocket.OPEN)) {
        console.log('WebSocket is already connected or connecting');
        return;
    }

    wsStatus.set('connecting');
    updateStatus('connecting');

    try {
        ws = new WebSocket(config.consoleUrl);

        ws.onopen = () => {
            console.log('WebSocket connected to Aether Console');
            wsStatus.set('connected');
            updateStatus('connected');
            logActivity('Aether Consoleに接続しました', 'success');
            reconnectAttempts = 0;
        };

        ws.onmessage = (event) => {
            try {
                const message = JSON.parse(event.data) as ConsoleToStudioEvent;
                handleMessage(message);
            } catch (e) {
                console.error('Failed to parse WebSocket message:', e);
            }
        };

        ws.onerror = (error) => {
            console.error('WebSocket error:', error);
            wsStatus.set('error');
            updateStatus('error');
        };

        ws.onclose = () => {
            console.log('WebSocket closed');
            wsStatus.set('disconnected');
            updateStatus('disconnected');
            ws = null;
            scheduleReconnect();
        };
    } catch (error) {
        console.error('Failed to create WebSocket:', error);
        wsStatus.set('error');
        updateStatus('error');
    }
}

/**
 * 再接続をスケジュール
 */
function scheduleReconnect() {
    if (reconnectAttempts >= MAX_RECONNECT_ATTEMPTS) {
        console.log('Max reconnect attempts reached');
        return;
    }

    if (reconnectTimer) {
        clearTimeout(reconnectTimer);
    }

    reconnectTimer = setTimeout(() => {
        reconnectAttempts++;
        console.log(`Reconnecting... (attempt ${reconnectAttempts})`);
        connect();
    }, RECONNECT_DELAY);
}

/**
 * 接続を切断
 */
export function disconnect() {
    if (reconnectTimer) {
        clearTimeout(reconnectTimer);
        reconnectTimer = null;
    }

    if (ws) {
        ws.close();
        ws = null;
    }

    wsStatus.set('disconnected');
    updateStatus('disconnected');
}

/**
 * メッセージを送信
 */
export function send(event: StudioToConsoleEvent) {
    if (!ws || ws.readyState !== WebSocket.OPEN) {
        console.warn('WebSocket is not connected');
        return false;
    }

    try {
        ws.send(JSON.stringify(event));

        // ログ表示（イベントタイプに応じてメッセージを変える）
        if (event.type === 'PATCH_CREATED') {
            logActivity('パッチを送信中...', 'info');
        } else if (event.type === 'SPEC_UPDATED') {
            logActivity('Spec更新を同期中...', 'info');
        }

        return true;
    } catch (e) {
        console.error('Failed to send WebSocket message:', e);
        return false;
    }
}

/**
 * 受信メッセージのハンドリング
 */
function handleMessage(event: ConsoleToStudioEvent) {
    lastReceivedEvent.set(event);

    switch (event.type) {
        case 'SYNC_REQUEST':
            // Consoleからの同期リクエストに応答
            const currentSpecs = get(specs);
            const currentPatches = get(patches);
            send({
                type: 'SYNC_RESPONSE',
                agents: currentSpecs,
                patches: currentPatches
            });
            logActivity('同期リクエストを受信しました', 'info');
            break;

        case 'PATCH_APPLIED':
            // Consoleでパッチが適用された通知
            console.log('Patch applied on Console:', event.patch.metadata.name);
            logActivity(`パッチが適用されました: ${event.patch.metadata.name}`, 'success');
            // TODO: 必要に応じてローカル状態を更新
            break;

        case 'PATCH_REVERTED':
            // Consoleでパッチがリバートされた通知
            console.log('Patch reverted on Console:', event.patchId);
            logActivity('パッチが取り消されました', 'warning');
            break;

        case 'AGENT_EXECUTED':
            // エージェント実行通知
            console.log(`Agent ${event.agentName} executed`);
            logActivity(`エージェント実行: ${event.agentName}`, 'info');
            break;

        case 'PROPOSAL_GENERATED':
            // 提案生成通知
            console.log('Proposal generated:', event.proposal);
            logActivity('提案が生成されました', 'success');
            break;

        default:
            console.log('Unknown event type:', event);
    }
}

/**
 * パッチをConsoleに送信
 */
export function sendPatch(patch: SpecPatch) {
    return send({
        type: 'PATCH_CREATED',
        patch
    });
}

/**
 * Spec更新をConsoleに送信
 */
export function sendSpecUpdate(agents: AgentSpec[]) {
    return send({
        type: 'SPEC_UPDATED',
        agents
    });
}
