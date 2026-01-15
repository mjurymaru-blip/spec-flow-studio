/**
 * Artifact Store
 *
 * AI生成物を管理するストア
 */
import { writable, derived } from 'svelte/store';
import type { Artifact, ArtifactType } from '$lib/types';

// 全ての生成物
export const artifacts = writable<Artifact[]>([]);

// 生成物が存在するかどうか
export const hasArtifacts = derived(artifacts, ($artifacts) => $artifacts.length > 0);

// 種類別の生成物数
export const artifactCounts = derived(artifacts, ($artifacts) => {
    const counts: Record<ArtifactType, number> = {
        'ui-mock': 0,
        'api-spec': 0,
        'test-case': 0,
        'use-case': 0
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
