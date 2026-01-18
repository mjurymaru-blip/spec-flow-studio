/**
 * CSRF Token API
 *
 * CSRFトークンを発行するエンドポイント
 * クライアントはこのエンドポイントを呼び出してトークンを取得
 */
import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { generateCsrfToken, createCsrfCookie, getCsrfHeaderName } from '$lib/server/csrf';

export const GET: RequestHandler = async () => {
    const token = generateCsrfToken();

    return json(
        {
            token,
            headerName: getCsrfHeaderName()
        },
        {
            headers: {
                'Set-Cookie': createCsrfCookie(token)
            }
        }
    );
};
