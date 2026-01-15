import { writable } from 'svelte/store';
import { saveToStorage, loadFromStorage, STORAGE_KEYS } from '$lib/utils/storage-utils';

export interface Settings {
    // Gemini API
    geminiModel: string;
    hasApiKey: boolean;
    availableModels: string[]; // 利用可能なモデル名のリスト
}

const DEFAULT_SETTINGS: Settings = {
    geminiModel: 'gemini-2.0-flash-exp', // デフォルトフォールバック
    hasApiKey: false,
    availableModels: [
        'gemini-2.0-flash-exp',
        'gemini-1.5-pro',
        'gemini-1.5-flash',
        'gemini-1.0-pro'
    ] // 初期フォールバックリスト
};

function createSettingsStore() {
    const stored = loadFromStorage<Settings>(STORAGE_KEYS.SETTINGS, DEFAULT_SETTINGS);

    // 以前のバージョンとの互換性確保（availableModelsがない場合など）
    const initialValue = {
        ...DEFAULT_SETTINGS,
        ...stored,
        availableModels: stored.availableModels?.length > 0 ? stored.availableModels : DEFAULT_SETTINGS.availableModels
    };

    const { subscribe, set, update } = writable<Settings>(initialValue);

    return {
        subscribe,
        updateSettings: (newSettings: Partial<Settings>) => {
            update(current => {
                const updated = { ...current, ...newSettings };
                saveToStorage(STORAGE_KEYS.SETTINGS, updated);
                return updated;
            });
        },
        reset: () => {
            set(DEFAULT_SETTINGS);
            saveToStorage(STORAGE_KEYS.SETTINGS, DEFAULT_SETTINGS);
        }
    };
}

export const settings = createSettingsStore();
