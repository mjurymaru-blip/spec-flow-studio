/**
 * IndexedDB Storage Utilities
 *
 * localStorageの5MB制限を回避するためのIndexedDB実装
 * アーティファクトや履歴など大容量データ向け
 */

const DB_NAME = 'spec-flow-studio';
const DB_VERSION = 1;

// ストア名
export const STORES = {
    ARTIFACTS: 'artifacts',
    HISTORY: 'history',
    SETTINGS: 'settings'
} as const;

type StoreName = (typeof STORES)[keyof typeof STORES];

let dbInstance: IDBDatabase | null = null;

/**
 * データベースを開く（初期化）
 */
export function openDatabase(): Promise<IDBDatabase> {
    return new Promise((resolve, reject) => {
        if (dbInstance) {
            resolve(dbInstance);
            return;
        }

        const request = indexedDB.open(DB_NAME, DB_VERSION);

        request.onerror = () => {
            console.error('IndexedDB open error:', request.error);
            reject(request.error);
        };

        request.onsuccess = () => {
            dbInstance = request.result;
            resolve(dbInstance);
        };

        request.onupgradeneeded = (event) => {
            const db = (event.target as IDBOpenDBRequest).result;

            // アーティファクトストア
            if (!db.objectStoreNames.contains(STORES.ARTIFACTS)) {
                const artifactStore = db.createObjectStore(STORES.ARTIFACTS, { keyPath: 'id' });
                artifactStore.createIndex('type', 'type', { unique: false });
                artifactStore.createIndex('generatedAt', 'generatedAt', { unique: false });
            }

            // 履歴ストア
            if (!db.objectStoreNames.contains(STORES.HISTORY)) {
                db.createObjectStore(STORES.HISTORY, { keyPath: 'key' });
            }

            // 設定ストア
            if (!db.objectStoreNames.contains(STORES.SETTINGS)) {
                db.createObjectStore(STORES.SETTINGS, { keyPath: 'key' });
            }
        };
    });
}

/**
 * データを保存
 */
export async function saveToIndexedDB<T>(storeName: StoreName, key: string, data: T): Promise<void> {
    const db = await openDatabase();

    return new Promise((resolve, reject) => {
        const transaction = db.transaction(storeName, 'readwrite');
        const store = transaction.objectStore(storeName);

        // keyPathがidのストアでない場合はkeyをセット
        const record = storeName === STORES.ARTIFACTS
            ? data
            : { key, ...data };

        const request = store.put(record);

        request.onerror = () => {
            console.error('IndexedDB save error:', request.error);
            reject(request.error);
        };

        request.onsuccess = () => {
            resolve();
        };
    });
}

/**
 * データを読み込み
 */
export async function loadFromIndexedDB<T>(storeName: StoreName, key: string): Promise<T | null> {
    const db = await openDatabase();

    return new Promise((resolve, reject) => {
        const transaction = db.transaction(storeName, 'readonly');
        const store = transaction.objectStore(storeName);
        const request = store.get(key);

        request.onerror = () => {
            console.error('IndexedDB load error:', request.error);
            reject(request.error);
        };

        request.onsuccess = () => {
            resolve(request.result ?? null);
        };
    });
}

/**
 * すべてのデータを読み込み
 */
export async function loadAllFromIndexedDB<T>(storeName: StoreName): Promise<T[]> {
    const db = await openDatabase();

    return new Promise((resolve, reject) => {
        const transaction = db.transaction(storeName, 'readonly');
        const store = transaction.objectStore(storeName);
        const request = store.getAll();

        request.onerror = () => {
            console.error('IndexedDB loadAll error:', request.error);
            reject(request.error);
        };

        request.onsuccess = () => {
            resolve(request.result ?? []);
        };
    });
}

/**
 * データを削除
 */
export async function deleteFromIndexedDB(storeName: StoreName, key: string): Promise<void> {
    const db = await openDatabase();

    return new Promise((resolve, reject) => {
        const transaction = db.transaction(storeName, 'readwrite');
        const store = transaction.objectStore(storeName);
        const request = store.delete(key);

        request.onerror = () => {
            console.error('IndexedDB delete error:', request.error);
            reject(request.error);
        };

        request.onsuccess = () => {
            resolve();
        };
    });
}

/**
 * ストアをクリア
 */
export async function clearIndexedDBStore(storeName: StoreName): Promise<void> {
    const db = await openDatabase();

    return new Promise((resolve, reject) => {
        const transaction = db.transaction(storeName, 'readwrite');
        const store = transaction.objectStore(storeName);
        const request = store.clear();

        request.onerror = () => {
            console.error('IndexedDB clear error:', request.error);
            reject(request.error);
        };

        request.onsuccess = () => {
            resolve();
        };
    });
}

/**
 * ブラウザ環境チェック
 */
export function isIndexedDBAvailable(): boolean {
    return typeof window !== 'undefined' && 'indexedDB' in window;
}
