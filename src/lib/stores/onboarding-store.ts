/**
 * Onboarding Store
 *
 * 初回デモシナリオの状態管理
 */
import { writable, derived } from 'svelte/store';
import { browser } from '$app/environment';

const STORAGE_KEY = 'spec-flow-demo-completed';

// 初回デモの状態
interface OnboardingState {
    hasCompletedDemo: boolean;
    currentStep: number;
    isActive: boolean;
    unconstrainedArtifact: string | null;
    constrainedArtifact: string | null;
}

// 初期状態
function getInitialState(): OnboardingState {
    if (browser) {
        const completed = localStorage.getItem(STORAGE_KEY) === 'true';
        return {
            hasCompletedDemo: completed,
            currentStep: 0,
            isActive: !completed,
            unconstrainedArtifact: null,
            constrainedArtifact: null
        };
    }
    return {
        hasCompletedDemo: false,
        currentStep: 0,
        isActive: true,
        unconstrainedArtifact: null,
        constrainedArtifact: null
    };
}

// ストア
export const onboardingStore = writable<OnboardingState>(getInitialState());

// 派生ストア
export const isOnboardingActive = derived(onboardingStore, ($s) => $s.isActive);
export const currentStep = derived(onboardingStore, ($s) => $s.currentStep);
export const hasCompletedDemo = derived(onboardingStore, ($s) => $s.hasCompletedDemo);

// ステップ数
export const TOTAL_STEPS = 5;

/**
 * 次のステップへ進む
 */
export function nextStep() {
    onboardingStore.update((s) => ({
        ...s,
        currentStep: Math.min(s.currentStep + 1, TOTAL_STEPS - 1)
    }));
}

/**
 * 前のステップへ戻る
 */
export function prevStep() {
    onboardingStore.update((s) => ({
        ...s,
        currentStep: Math.max(s.currentStep - 1, 0)
    }));
}

/**
 * 制約なしArtifactを設定
 */
export function setUnconstrainedArtifact(content: string) {
    onboardingStore.update((s) => ({
        ...s,
        unconstrainedArtifact: content
    }));
}

/**
 * 制約ありArtifactを設定
 */
export function setConstrainedArtifact(content: string) {
    onboardingStore.update((s) => ({
        ...s,
        constrainedArtifact: content
    }));
}

/**
 * デモを完了
 */
export function completeDemo() {
    if (browser) {
        localStorage.setItem(STORAGE_KEY, 'true');
    }
    onboardingStore.update((s) => ({
        ...s,
        hasCompletedDemo: true,
        isActive: false
    }));
}

/**
 * デモをリセット（設定ページから再体験用）
 */
export function resetDemo() {
    if (browser) {
        localStorage.removeItem(STORAGE_KEY);
    }
    onboardingStore.set({
        hasCompletedDemo: false,
        currentStep: 0,
        isActive: true,
        unconstrainedArtifact: null,
        constrainedArtifact: null
    });
}

/**
 * デモをスキップ（開発用）
 */
export function skipDemo() {
    completeDemo();
}
