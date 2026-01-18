/**
 * CSRF Client Utilities
 *
 * クライアント側でCSRFトークンを取得・管理するユーティリティ
 */

let csrfToken: string | null = null;
let csrfHeaderName: string = 'x-csrf-token';

/**
 * CSRFトークンを取得（サーバーから取得してキャッシュ）
 */
export async function getCsrfToken(): Promise<string> {
    if (csrfToken) {
        return csrfToken;
    }

    const response = await fetch('/api/csrf');
    if (!response.ok) {
        throw new Error('Failed to fetch CSRF token');
    }

    const data = await response.json();
    csrfToken = data.token;
    csrfHeaderName = data.headerName;

    return csrfToken as string;
}

/**
 * CSRF保護付きでfetchを実行
 */
export async function csrfFetch(
    url: string,
    options: RequestInit = {}
): Promise<Response> {
    const token = await getCsrfToken();

    const headers = new Headers(options.headers);
    headers.set(csrfHeaderName, token);

    return fetch(url, {
        ...options,
        headers,
        credentials: 'same-origin' // Cookieを含める
    });
}

/**
 * キャッシュされたトークンをクリア（ログアウト時など）
 */
export function clearCsrfToken(): void {
    csrfToken = null;
}
