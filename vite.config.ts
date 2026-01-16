import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';
import { WebSocketServer } from 'ws';
import type { ViteDevServer } from 'vite';

// 接続中のクライアント
const clients = new Set<import('ws').WebSocket>();

// WebSocket Vite Plugin (開発環境用)
function webSocketPlugin() {
	return {
		name: 'websocket-plugin',
		configureServer(server: ViteDevServer) {
			if (!server.httpServer) return;

			const wss = new WebSocketServer({
				server: server.httpServer,
				path: '/api/ws'
			});

			wss.on('connection', (ws) => {
				console.log('[WebSocket] Client connected');
				clients.add(ws);

				// ウェルカムメッセージ
				ws.send(JSON.stringify({
					type: 'CONNECTED',
					message: 'Welcome to Spec-Flow Studio',
					timestamp: new Date().toISOString()
				}));

				ws.on('message', (data) => {
					try {
						const message = JSON.parse(data.toString());
						console.log('[WebSocket] Received:', message.type);

						// メッセージハンドリング
						handleMessage(ws, message);
					} catch (e) {
						console.error('[WebSocket] Parse error:', e);
					}
				});

				ws.on('close', () => {
					console.log('[WebSocket] Client disconnected');
					clients.delete(ws);
				});

				ws.on('error', (error) => {
					console.error('[WebSocket] Error:', error);
					clients.delete(ws);
				});
			});

			console.log('[WebSocket] Server initialized on /api/ws');
		}
	};
}

// メッセージハンドラ
function handleMessage(ws: import('ws').WebSocket, message: any) {
	switch (message.type) {
		case 'SYNC_REQUEST':
			// 同期リクエストに応答
			ws.send(JSON.stringify({
				type: 'SYNC_RESPONSE',
				agents: [], // TODO: 実際のSpec-Storeから取得
				patches: [],
				timestamp: new Date().toISOString()
			}));
			console.log('[WebSocket] Sent SYNC_RESPONSE');
			break;

		case 'PATCH_APPLIED':
			console.log('[WebSocket] Patch applied:', message.patch?.name);
			// ブロードキャスト
			broadcast({ type: 'PATCH_APPLIED_ACK', patchId: message.patch?.id });
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
