/**
 * Artifact Store
 *
 * AI生成物を管理するストア（localStorage永続化対応）
 */
import { writable, derived } from 'svelte/store';
import type { Artifact, ArtifactType } from '$lib/types';
import { saveToStorage, loadFromStorage, isBrowser } from '$lib/utils/storage-utils';

const STORAGE_KEY = 'spec-flow-studio:artifacts';

// 初期データをlocalStorageから読み込み
function loadInitialArtifacts(): Artifact[] {
    if (!isBrowser) return [];
    const stored = loadFromStorage<Artifact[]>(STORAGE_KEY, []);
    return stored;
}

// 全ての生成物
export const artifacts = writable<Artifact[]>(loadInitialArtifacts());

// localStorageへの永続化（変更時に自動保存）
if (isBrowser) {
    artifacts.subscribe((value) => {
        saveToStorage(STORAGE_KEY, value);
    });
}

// 生成物が存在するかどうか
export const hasArtifacts = derived(artifacts, ($artifacts) => $artifacts.length > 0);

// 種類別の生成物数
export const artifactCounts = derived(artifacts, ($artifacts) => {
    const counts: Record<ArtifactType, number> = {
        'ui-mock': 0,
        'api-spec': 0,
        'test-case': 0,
        'use-case-diagram': 0
    };
    $artifacts.forEach((a) => {
        counts[a.type]++;
    });
    return counts;
});

// 最新の生成物
export const latestArtifacts = derived(artifacts, ($artifacts) =>
    [...$artifacts].sort((a, b) => new Date(b.generatedAt).getTime() - new Date(a.generatedAt).getTime()).slice(0, 5)
);

/**
 * 生成物を追加
 */
export function addArtifact(artifact: Artifact) {
    artifacts.update((current) => [...current, artifact]);
}

/**
 * 生成物を削除
 */
export function removeArtifact(id: string) {
    artifacts.update((current) => current.filter((a) => a.id !== id));
}

/**
 * 全ての生成物をクリア
 */
export function clearArtifacts() {
    artifacts.set([]);
}

/**
 * 種類でフィルタリング
 */
export function getArtifactsByType(type: ArtifactType): Artifact[] {
    let result: Artifact[] = [];
    artifacts.subscribe((a) => {
        result = a.filter((artifact) => artifact.type === type);
    })();
    return result;
}
