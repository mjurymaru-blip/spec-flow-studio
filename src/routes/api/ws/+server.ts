/**
 * WebSocket Server Endpoint
 *
 * Aether Console からの接続を受け付けるWebSocketサーバー
 * SvelteKit の server-sent events を使用したシンプルな実装
 *
 * 注意: SvelteKit は現時点で native WebSocket をサポートしていないため、
 * 完全なWebSocket実装には別途サーバー（ws パッケージなど）が必要。
 * この実装はプレースホルダーとして、SSE (Server-Sent Events) を使用した
 * 一方向通信のデモです。
 */
import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

// 接続中のクライアント情報
const clients = new Set<ReadableStreamDefaultController>();

export const GET: RequestHandler = async ({ request }) => {
	// SSE (Server-Sent Events) として応答
	const stream = new ReadableStream({
		start(controller) {
			clients.add(controller);

			// 接続確認メッセージ
			const welcome = `data: ${JSON.stringify({ type: 'CONNECTED', message: 'Welcome to Spec-Flow Studio' })}\n\n`;
			controller.enqueue(new TextEncoder().encode(welcome));

			// クリーンアップ
			request.signal.addEventListener('abort', () => {
				clients.delete(controller);
				controller.close();
			});
		}
	});

	return new Response(stream, {
		headers: {
			'Content-Type': 'text/event-stream',
			'Cache-Control': 'no-cache',
			'Connection': 'keep-alive'
		}
	});
};

// POST: Aether Console からのメッセージ受信
export const POST: RequestHandler = async ({ request }) => {
	try {
		const event = await request.json();
		console.log('[WebSocket Endpoint] Received event:', event.type);

		// 全クライアントにブロードキャスト
		const message = `data: ${JSON.stringify(event)}\n\n`;
		const encoded = new TextEncoder().encode(message);
		clients.forEach((controller) => {
			try {
				controller.enqueue(encoded);
			} catch (e) {
				// クライアントが切断されている可能性
				clients.delete(controller);
			}
		});

		return json({ success: true, clientCount: clients.size });
	} catch (error) {
		console.error('[WebSocket Endpoint] Error:', error);
		return json({ error: 'Failed to process event' }, { status: 500 });
	}
};
