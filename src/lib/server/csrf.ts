/**
 * CSRF Protection Utilities
 *
 * Double-Submit Cookie方式でCSRF対策を実装
 * - サーバー: CSRFトークンをCookieにセット
 * - クライアント: リクエスト時にCookieの値をヘッダーに含める
 * - サーバー: CookieとヘッダーのトークンをRevalidate
 */

const CSRF_COOKIE_NAME = 'csrf-token';
const CSRF_HEADER_NAME = 'x-csrf-token';

/**
 * CSRFトークンを生成
 */
export function generateCsrfToken(): string {
    const array = new Uint8Array(32);
    crypto.getRandomValues(array);
    return Array.from(array, (b) => b.toString(16).padStart(2, '0')).join('');
}

/**
 * リクエストからCSRFトークンを検証
 * Cookie と Header の値が一致することを確認
 */
export function validateCsrfToken(request: Request): boolean {
    const cookieHeader = request.headers.get('cookie');
    const csrfHeader = request.headers.get(CSRF_HEADER_NAME);

    if (!cookieHeader || !csrfHeader) {
        return false;
    }

    // Cookieからトークンを抽出
    const cookies = parseCookies(cookieHeader);
    const cookieToken = cookies[CSRF_COOKIE_NAME];

    if (!cookieToken) {
        return false;
    }

    // Timing-safe comparison
    return timingSafeEqual(cookieToken, csrfHeader);
}

/**
 * Cookie文字列をパース
 */
function parseCookies(cookieHeader: string): Record<string, string> {
    const cookies: Record<string, string> = {};
    for (const cookie of cookieHeader.split(';')) {
        const [name, ...rest] = cookie.trim().split('=');
        if (name && rest.length > 0) {
            cookies[name] = rest.join('=');
        }
    }
    return cookies;
}

/**
 * Timing-safe 文字列比較
 */
function timingSafeEqual(a: string, b: string): boolean {
    if (a.length !== b.length) {
        return false;
    }

    let result = 0;
    for (let i = 0; i < a.length; i++) {
        result |= a.charCodeAt(i) ^ b.charCodeAt(i);
    }
    return result === 0;
}

/**
 * CSRFトークンをSet-Cookie形式で返す
 */
export function createCsrfCookie(token: string): string {
    return `${CSRF_COOKIE_NAME}=${token}; Path=/; HttpOnly=false; SameSite=Strict; Secure`;
}

/**
 * CSRFヘッダー名を取得
 */
export function getCsrfHeaderName(): string {
    return CSRF_HEADER_NAME;
}

/**
 * CSRF Cookie名を取得
 */
export function getCsrfCookieName(): string {
    return CSRF_COOKIE_NAME;
}
