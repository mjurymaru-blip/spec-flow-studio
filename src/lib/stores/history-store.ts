import { writable, derived, get } from 'svelte/store';
import type { SpecPatch, AgentSpec } from '$lib/types';
import { saveToStorage, loadFromStorage } from '$lib/utils/storage-utils';
import { generateSpecPatch, applySpecPatch, revertSpecPatch, isPatchEmpty } from '$lib/utils/diff-utils';

const STORAGE_KEY = 'spec-flow-studio:history';
const CHECKPOINT_INTERVAL = 10; // 10パッチごとにチェックポイントを作成

interface Checkpoint {
    patchIndex: number; // このチェックポイントが有効なパッチインデックス
    specs: AgentSpec[]; // その時点のSpecs状態
}

interface HistoryState {
    patches: SpecPatch[];
    currentIndex: number; // 現在適用されているパッチのインデックス (-1 = 初期状態)
    baseSpecs: AgentSpec[]; // 履歴の起点となるSpecs
    checkpoints: Checkpoint[]; // パフォーマンス最適化用のチェックポイント
}

const DEFAULT_STATE: HistoryState = {
    patches: [],
    currentIndex: -1,
    baseSpecs: [],
    checkpoints: []
};

function createHistoryStore() {
    const stored = loadFromStorage<HistoryState>(STORAGE_KEY, DEFAULT_STATE);
    const { subscribe, set, update } = writable<HistoryState>(stored);

    // 状態が変更されるたびに永続化
    subscribe((state) => {
        saveToStorage(STORAGE_KEY, state);
    });

    return {
        subscribe,

        /**
         * 履歴の初期化（エディタ初回ロード時に呼ぶ）
         */
        initialize: (specs: AgentSpec[]) => {
            update((state) => {
                if (state.patches.length === 0) {
                    return { ...state, baseSpecs: specs };
                }
                return state;
            });
        },

        /**
         * 新しいパッチを記録
         */
        commit: (beforeSpecs: AgentSpec[], afterSpecs: AgentSpec[], name?: string): SpecPatch | null => {
            const patch = generateSpecPatch(beforeSpecs, afterSpecs, { name, author: 'human' });

            if (isPatchEmpty(patch)) {
                return null; // 変更なし
            }

            update((state) => {
                // 現在位置より後のパッチを破棄（ブランチを切らない）
                const newPatches = state.patches.slice(0, state.currentIndex + 1);
                newPatches.push(patch);
                const newIndex = newPatches.length - 1;

                // 破棄されたパッチに関連するチェックポイントも削除
                let newCheckpoints = state.checkpoints.filter(cp => cp.patchIndex <= state.currentIndex);

                // チェックポイント作成（CHECKPOINT_INTERVALごと）
                if (newIndex > 0 && newIndex % CHECKPOINT_INTERVAL === 0) {
                    newCheckpoints = [...newCheckpoints, {
                        patchIndex: newIndex,
                        specs: afterSpecs
                    }];
                }

                return {
                    ...state,
                    patches: newPatches,
                    currentIndex: newIndex,
                    checkpoints: newCheckpoints
                };
            });

            return patch;
        },

        /**
         * Undo: 1つ前の状態に戻る
         */
        undo: (): AgentSpec[] | null => {
            const state = get({ subscribe });
            if (state.currentIndex < 0) return null; // これ以上戻れない

            const targetIndex = state.currentIndex - 1;
            const specs = rebuildSpecs(state.baseSpecs, state.patches, targetIndex, state.checkpoints);

            update((s) => ({ ...s, currentIndex: targetIndex }));
            return specs;
        },

        /**
         * Redo: 1つ先の状態に進む
         */
        redo: (): AgentSpec[] | null => {
            const state = get({ subscribe });
            if (state.currentIndex >= state.patches.length - 1) return null; // これ以上進めない

            const targetIndex = state.currentIndex + 1;
            const specs = rebuildSpecs(state.baseSpecs, state.patches, targetIndex, state.checkpoints);

            update((s) => ({ ...s, currentIndex: targetIndex }));
            return specs;
        },

        /**
         * 特定のパッチまで巻き戻す
         */
        revertTo: (patchId: string): AgentSpec[] | null => {
            const state = get({ subscribe });
            const targetIndex = state.patches.findIndex((p) => p.metadata.id === patchId);
            if (targetIndex === -1) return null;

            const specs = rebuildSpecs(state.baseSpecs, state.patches, targetIndex, state.checkpoints);
            update((s) => ({ ...s, currentIndex: targetIndex }));
            return specs;
        },

        /**
         * 現在の状態を取得
         */
        getCurrentSpecs: (): AgentSpec[] => {
            const state = get({ subscribe });
            return rebuildSpecs(state.baseSpecs, state.patches, state.currentIndex, state.checkpoints);
        },

        /**
         * 履歴をクリア
         */
        clear: () => {
            set(DEFAULT_STATE);
        }
    };
}

/**
 * baseSpecsにパッチを順番に適用してtargetIndexまでの状態を再構築
 * チェックポイントがあれば最も近いチェックポイントから開始
 */
function rebuildSpecs(
    baseSpecs: AgentSpec[],
    patches: SpecPatch[],
    targetIndex: number,
    checkpoints: Checkpoint[] = []
): AgentSpec[] {
    // ターゲットより手前で最も近いチェックポイントを探す
    let startSpecs = [...baseSpecs];
    let startIndex = 0;

    for (const cp of checkpoints) {
        if (cp.patchIndex <= targetIndex && cp.patchIndex >= startIndex) {
            startSpecs = [...cp.specs];
            startIndex = cp.patchIndex + 1;
        }
    }

    // チェックポイントからターゲットまでパッチを適用
    let specs = startSpecs;
    for (let i = startIndex; i <= targetIndex && i < patches.length; i++) {
        specs = applySpecPatch(specs, patches[i]);
    }
    return specs;
}

export const historyStore = createHistoryStore();

// 派生ストア: Undo可能かどうか
export const canUndo = derived(historyStore, ($history) => $history.currentIndex >= 0);

// 派生ストア: Redo可能かどうか
export const canRedo = derived(
    historyStore,
    ($history) => $history.currentIndex < $history.patches.length - 1
);

// 派生ストア: パッチ一覧
export const patches = derived(historyStore, ($history) => $history.patches);

// 派生ストア: 現在のインデックス
export const currentPatchIndex = derived(historyStore, ($history) => $history.currentIndex);
