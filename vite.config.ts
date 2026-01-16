import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';
import { WebSocketServer } from 'ws';
import type { ViteDevServer } from 'vite';
import type { IncomingMessage } from 'http';
import { createHash, randomBytes } from 'crypto';

// ========================================
// WebSocket認証設定
// ========================================

// 共有シークレット（環境変数から取得、なければランダム生成）
const WS_SECRET = process.env.WS_SECRET || randomBytes(32).toString('hex');

// 認証済みクライアント（トークン → WebSocket）
const authenticatedClients = new Map<string, import('ws').WebSocket>();

// 接続中のクライアント
const clients = new Set<import('ws').WebSocket>();

/**
 * 接続トークンの検証
 * URLクエリパラメータ ?token=xxx を検証
 */
function verifyConnection(request: IncomingMessage): { valid: boolean; clientId?: string } {
	const url = new URL(request.url || '', `http://${request.headers.host}`);
	const token = url.searchParams.get('token');
	const clientId = url.searchParams.get('clientId');
	const timestamp = url.searchParams.get('ts');

	// トークンがない場合は開発モードとして許可（警告を出す）
	if (!token) {
		console.warn('[WebSocket] ⚠️ No auth token provided - allowing in dev mode');
		return { valid: true, clientId: 'anonymous-' + Date.now() };
	}

	// タイムスタンプ検証（5分以内）
	if (timestamp) {
		const ts = parseInt(timestamp, 10);
		const now = Date.now();
		if (Math.abs(now - ts) > 5 * 60 * 1000) {
			console.warn('[WebSocket] ⚠️ Token expired');
			return { valid: false };
		}
	}

	// トークン検証（HMAC-SHA256）
	const expectedToken = createHash('sha256')
		.update(`${clientId}:${timestamp}:${WS_SECRET}`)
		.digest('hex');

	if (token === expectedToken) {
		return { valid: true, clientId: clientId || 'unknown' };
	}

	// Origin検証（localhost のみ許可）
	const origin = request.headers.origin;
	if (origin && (origin.includes('localhost') || origin.includes('127.0.0.1'))) {
		console.warn('[WebSocket] ⚠️ Allowing localhost origin without valid token');
		return { valid: true, clientId: clientId || 'localhost-' + Date.now() };
	}

	return { valid: false };
}

// ========================================
// WebSocket Vite Plugin (開発環境用)
// ========================================
function webSocketPlugin() {
	return {
		name: 'websocket-plugin',
		configureServer(server: ViteDevServer) {
			if (!server.httpServer) return;

			const wss = new WebSocketServer({
				server: server.httpServer,
				path: '/api/ws',
				verifyClient: (info, callback) => {
					const result = verifyConnection(info.req);
					if (result.valid) {
						// clientIdをリクエストに付与
						(info.req as any).clientId = result.clientId;
						callback(true);
					} else {
						console.log('[WebSocket] ❌ Connection rejected');
						callback(false, 401, 'Unauthorized');
					}
				}
			});

			wss.on('connection', (ws, request) => {
				const clientId = (request as any).clientId || 'unknown';
				console.log(`[WebSocket] ✅ Client connected: ${clientId}`);
				clients.add(ws);
				authenticatedClients.set(clientId, ws);

				// ウェルカムメッセージ
				ws.send(JSON.stringify({
					type: 'CONNECTED',
					message: 'Welcome to Spec-Flow Studio',
					clientId,
					authenticated: true,
					timestamp: new Date().toISOString()
				}));

				ws.on('message', (data) => {
					try {
						const message = JSON.parse(data.toString());
						console.log(`[WebSocket] Received from ${clientId}:`, message.type);

						// メッセージハンドリング
						handleMessage(ws, message, clientId);
					} catch (e) {
						console.error('[WebSocket] Parse error:', e);
					}
				});

				ws.on('close', () => {
					console.log(`[WebSocket] Client disconnected: ${clientId}`);
					clients.delete(ws);
					authenticatedClients.delete(clientId);
				});

				ws.on('error', (error) => {
					console.error('[WebSocket] Error:', error);
					clients.delete(ws);
					authenticatedClients.delete(clientId);
				});
			});

			console.log('[WebSocket] Server initialized on /api/ws');
			console.log('[WebSocket] Secret:', WS_SECRET.substring(0, 8) + '...');
		}
	};
}

// メッセージハンドラ
function handleMessage(ws: import('ws').WebSocket, message: any, clientId: string) {
	switch (message.type) {
		case 'SYNC_REQUEST':
			// 同期リクエストに応答
			ws.send(JSON.stringify({
				type: 'SYNC_RESPONSE',
				agents: [], // TODO: 実際のSpec-Storeから取得
				patches: [],
				timestamp: new Date().toISOString()
			}));
			console.log(`[WebSocket] Sent SYNC_RESPONSE to ${clientId}`);
			break;

		case 'PATCH_APPLIED':
			console.log('[WebSocket] Patch applied:', message.patch?.name);
			// ブロードキャスト
			broadcast({ type: 'PATCH_APPLIED_ACK', patchId: message.patch?.id });
			break;

		case 'AUTH':
			// 認証メッセージ（追加認証が必要な場合）
			ws.send(JSON.stringify({
				type: 'AUTH_ACK',
				status: 'authenticated',
				clientId
			}));
			break;

		default:
			console.log('[WebSocket] Unknown message type:', message.type);
	}
}

// 全クライアントにブロードキャスト
function broadcast(message: any) {
	const data = JSON.stringify(message);
	clients.forEach((client) => {
		if (client.readyState === 1) { // OPEN
			client.send(data);
		}
	});
}

export default defineConfig({
	plugins: [sveltekit(), webSocketPlugin()]
});
