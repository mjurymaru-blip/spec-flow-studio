/**
 * Gemini Proxy Configuration
 *
 * プロキシモードでのGemini API設定
 * 本番環境ではサーバー側でAPIキーを管理
 */

/**
 * プロキシモードかどうかを判定
 * GEMINI_API_KEY環境変数が設定されていればプロキシモード
 */
export function isProxyMode(): boolean {
    return !!import.meta.env.GEMINI_API_KEY || !!process.env.GEMINI_API_KEY;
}

/**
 * サーバー設定のAPIキーを取得
 * プロキシモードでない場合はnullを返す
 */
export function getServerApiKey(): string | null {
    return import.meta.env.GEMINI_API_KEY || process.env.GEMINI_API_KEY || null;
}

/**
 * プロキシモードの設定
 */
export interface ProxyConfig {
    enabled: boolean;
    rateLimit: {
        maxRequestsPerMinute: number;
        maxTokensPerDay: number;
    };
    allowedOrigins: string[];
}

/**
 * デフォルトのプロキシ設定
 */
export const defaultProxyConfig: ProxyConfig = {
    enabled: false,
    rateLimit: {
        maxRequestsPerMinute: 10,
        maxTokensPerDay: 100000
    },
    allowedOrigins: [
        'http://localhost:3001',
        'http://localhost:5173'
    ]
};

/**
 * 環境変数から設定を読み込み
 */
export function loadProxyConfig(): ProxyConfig {
    const serverKey = getServerApiKey();

    return {
        enabled: !!serverKey,
        rateLimit: {
            maxRequestsPerMinute: parseInt(process.env.RATE_LIMIT_RPM || '10', 10),
            maxTokensPerDay: parseInt(process.env.RATE_LIMIT_TOKENS || '100000', 10)
        },
        allowedOrigins: process.env.ALLOWED_ORIGINS
            ? process.env.ALLOWED_ORIGINS.split(',')
            : defaultProxyConfig.allowedOrigins
    };
}
