import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { generateContent } from '$lib/server/gemini';
import { getServerApiKey, loadProxyConfig } from '$lib/server/gemini-proxy';
import { buildUiPrompt, buildApiPrompt, buildTestCasePrompt, buildUseCasePrompt } from '$lib/utils/prompt-utils';
import type { AgentSpec } from '$lib/types';

export const POST: RequestHandler = async ({ request }) => {
    // プロキシモード: サーバー設定のAPIキーを優先
    const serverApiKey = getServerApiKey();
    const clientApiKey = request.headers.get('x-api-key');
    const apiKey = serverApiKey || clientApiKey;

    if (!apiKey) {
        return json({ error: 'API Key is required' }, { status: 401 });
    }

    // オリジン検証（プロキシモード時）
    if (serverApiKey) {
        const config = loadProxyConfig();
        const origin = request.headers.get('origin');
        if (origin && !config.allowedOrigins.includes(origin)) {
            return json({ error: 'Origin not allowed' }, { status: 403 });
        }
    }

    try {
        const { spec, specs, artifactType, model } = await request.json();
        const agentSpec = spec as AgentSpec;
        const agentSpecs = specs as AgentSpec[] | undefined;

        let prompt = '';

        switch (artifactType) {
            case 'ui-mock':
                prompt = buildUiPrompt(agentSpec);
                break;
            case 'api-spec':
                prompt = buildApiPrompt(agentSpec);
                break;
            case 'test-case':
                prompt = buildTestCasePrompt(agentSpec);
                break;
            case 'use-case-diagram':
                if (!agentSpecs || agentSpecs.length === 0) {
                    return json({ error: 'Multiple specs required for use-case diagram' }, { status: 400 });
                }
                prompt = buildUseCasePrompt(agentSpecs);
                break;
            default:
                return json({ error: 'Invalid artifact type' }, { status: 400 });
        }

        const result = await generateContent({
            apiKey,
            modelName: model || 'gemini-2.0-flash-exp',
            prompt
        });

        // コードブロックの除去 (```html ... ``` -> ...)
        let content = result;
        // Markdownコードブロック除去の簡易正規表現
        const codeBlockRegex = /^```(?:html|yaml|json|markdown|mermaid)?\s*([\s\S]*?)```$/;
        const match = content.match(codeBlockRegex);
        if (match) {
            content = match[1].trim();
        }

        return json({ content });

    } catch (error) {
        console.error('API Error:', error);
        return json({ error: 'Generation failed', details: error instanceof Error ? error.message : String(error) }, { status: 500 });
    }
};
