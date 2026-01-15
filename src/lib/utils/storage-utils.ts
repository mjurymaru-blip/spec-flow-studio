/**
 * Local Storage Utilities
 *
 * Spec、設定などのローカル保存用ユーティリティ
 */

const STORAGE_KEYS = {
    SPECS: 'spec-flow-studio:specs',
    SPEC_NAME: 'spec-flow-studio:spec-name',
    ARTIFACTS: 'spec-flow-studio:artifacts',
    PATCHES: 'spec-flow-studio:patches',
    SETTINGS: 'spec-flow-studio:settings'
} as const;

/**
 * ローカルストレージに保存
 */
export function saveToStorage<T>(key: string, data: T): void {
    try {
        localStorage.setItem(key, JSON.stringify(data));
    } catch (error) {
        console.error('Failed to save to localStorage:', error);
    }
}

/**
 * ローカルストレージから読み込み
 */
export function loadFromStorage<T>(key: string, defaultValue: T): T {
    try {
        const item = localStorage.getItem(key);
        if (item === null) {
            return defaultValue;
        }
        return JSON.parse(item) as T;
    } catch (error) {
        console.error('Failed to load from localStorage:', error);
        return defaultValue;
    }
}

/**
 * ローカルストレージから削除
 */
export function removeFromStorage(key: string): void {
    try {
        localStorage.removeItem(key);
    } catch (error) {
        console.error('Failed to remove from localStorage:', error);
    }
}

/**
 * Spec YAMLを保存
 */
export function saveSpecYaml(yaml: string, name?: string): void {
    saveToStorage(STORAGE_KEYS.SPECS, yaml);
    if (name) {
        saveToStorage(STORAGE_KEYS.SPEC_NAME, name);
    }
}

/**
 * Spec YAMLを読み込み
 */
export function loadSpecYaml(): { yaml: string; name: string | null } {
    return {
        yaml: loadFromStorage(STORAGE_KEYS.SPECS, ''),
        name: loadFromStorage<string | null>(STORAGE_KEYS.SPEC_NAME, null)
    };
}

/**
 * 全データをエクスポート
 */
export function exportAllData(): string {
    const data = {
        specs: loadFromStorage(STORAGE_KEYS.SPECS, ''),
        specName: loadFromStorage(STORAGE_KEYS.SPEC_NAME, null),
        artifacts: loadFromStorage(STORAGE_KEYS.ARTIFACTS, []),
        patches: loadFromStorage(STORAGE_KEYS.PATCHES, []),
        settings: loadFromStorage(STORAGE_KEYS.SETTINGS, {}),
        exportedAt: new Date().toISOString()
    };
    return JSON.stringify(data, null, 2);
}

/**
 * データをインポート
 */
export function importAllData(jsonString: string): void {
    try {
        const data = JSON.parse(jsonString);
        if (data.specs) saveToStorage(STORAGE_KEYS.SPECS, data.specs);
        if (data.specName) saveToStorage(STORAGE_KEYS.SPEC_NAME, data.specName);
        if (data.artifacts) saveToStorage(STORAGE_KEYS.ARTIFACTS, data.artifacts);
        if (data.patches) saveToStorage(STORAGE_KEYS.PATCHES, data.patches);
        if (data.settings) saveToStorage(STORAGE_KEYS.SETTINGS, data.settings);
    } catch (error) {
        console.error('Failed to import data:', error);
        throw new Error('Invalid JSON format');
    }
}

/**
 * 全データを削除
 */
export function clearAllData(): void {
    Object.values(STORAGE_KEYS).forEach((key) => {
        removeFromStorage(key);
    });
}

export { STORAGE_KEYS };
