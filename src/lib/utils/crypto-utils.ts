/**
 * Crypto Utils
 *
 * Web Crypto API を使用したAES-GCM暗号化ユーティリティ
 */

const ALGORITHM = 'AES-GCM';
const KEY_LENGTH = 256;
const SALT_LENGTH = 16;
const IV_LENGTH = 12;
const ITERATIONS = 100000;

/**
 * パスワードから暗号化キーを生成（PBKDF2）
 */
async function deriveKey(password: string, salt: Uint8Array): Promise<CryptoKey> {
    const enc = new TextEncoder();
    const keyMaterial = await window.crypto.subtle.importKey(
        'raw',
        enc.encode(password),
        'PBKDF2',
        false,
        ['deriveKey']
    );

    return window.crypto.subtle.deriveKey(
        {
            name: 'PBKDF2',
            salt,
            iterations: ITERATIONS,
            hash: 'SHA-256'
        },
        keyMaterial,
        { name: ALGORITHM, length: KEY_LENGTH },
        false,
        ['encrypt', 'decrypt']
    );
}

/**
 * データを暗号化
 * @returns {salt, iv, data} Base64エンコードされた文字列
 */
export async function encryptData(text: string, password: string): Promise<string> {
    const salt = window.crypto.getRandomValues(new Uint8Array(SALT_LENGTH));
    const iv = window.crypto.getRandomValues(new Uint8Array(IV_LENGTH));
    const key = await deriveKey(password, salt);
    const enc = new TextEncoder();

    const encrypted = await window.crypto.subtle.encrypt(
        { name: ALGORITHM, iv },
        key,
        enc.encode(text)
    );

    // salt + iv + encrypted data を結合してBase64化
    const combined = new Uint8Array(salt.length + iv.length + encrypted.byteLength);
    combined.set(salt, 0);
    combined.set(iv, salt.length);
    combined.set(new Uint8Array(encrypted), salt.length + iv.length);

    return btoa(String.fromCharCode(...combined));
}

/**
 * データを復号化
 */
export async function decryptData(encryptedBase64: string, password: string): Promise<string> {
    try {
        const combined = new Uint8Array(
            atob(encryptedBase64)
                .split('')
                .map((c) => c.charCodeAt(0))
        );

        const salt = combined.slice(0, SALT_LENGTH);
        const iv = combined.slice(SALT_LENGTH, SALT_LENGTH + IV_LENGTH);
        const data = combined.slice(SALT_LENGTH + IV_LENGTH);

        const key = await deriveKey(password, salt);

        const decrypted = await window.crypto.subtle.decrypt(
            { name: ALGORITHM, iv },
            key,
            data
        );

        return new TextDecoder().decode(decrypted);
    } catch (error) {
        console.error('Decryption failed:', error);
        throw new Error('パスワードが間違っているか、データが破損しています');
    }
}

/**
 * APIキーが設定されているか確認するためのハッシュ生成
 */
export async function hashKey(text: string): Promise<string> {
    const enc = new TextEncoder();
    const hash = await window.crypto.subtle.digest('SHA-256', enc.encode(text));
    return btoa(String.fromCharCode(...new Uint8Array(hash)));
}
