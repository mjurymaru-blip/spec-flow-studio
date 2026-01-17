// SSRを無効化し、クライアントサイドのみでレンダリング
// これによりlocalStorageやWebSocket関連のSSRエラーを回避
export const ssr = false;
export const prerender = false;
