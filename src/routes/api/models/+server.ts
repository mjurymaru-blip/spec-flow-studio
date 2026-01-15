import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { listModels } from '$lib/server/gemini';

export const GET: RequestHandler = async ({ request }) => {
    const apiKey = request.headers.get('x-api-key');

    if (!apiKey) {
        return json({ error: 'API Key is required' }, { status: 401 });
    }

    try {
        const models = await listModels(apiKey);
        return json({ models });
    } catch (error) {
        console.error('Model List API Error:', error);
        return json({ error: 'Failed to fetch models', details: error instanceof Error ? error.message : String(error) }, { status: 500 });
    }
};
