/**
 * Toast Store
 * トースト通知の状態管理
 */
import { writable } from 'svelte/store';

export interface ToastItem {
    id: string;
    message: string;
    type: 'success' | 'warning' | 'error' | 'info';
    icon?: string;
    subMessage?: string;
    duration?: number;
}

// トースト一覧
export const toasts = writable<ToastItem[]>([]);

// ID生成
let toastId = 0;

/**
 * トーストを表示
 */
export function showToast(options: Omit<ToastItem, 'id'>): string {
    const id = `toast-${++toastId}`;
    const toast: ToastItem = {
        id,
        duration: 4000,
        ...options
    };

    toasts.update((t) => [...t, toast]);
    return id;
}

/**
 * 成功トースト（制約遵守メッセージ付き）
 */
export function showSuccessToast(message: string, constraintCount?: number): string {
    return showToast({
        message,
        type: 'success',
        icon: '🛡️',
        subMessage: constraintCount
            ? `${constraintCount}つの制約を遵守しました`
            : undefined
    });
}

/**
 * 警告トースト
 */
export function showWarningToast(message: string, subMessage?: string): string {
    return showToast({
        message,
        type: 'warning',
        subMessage
    });
}

/**
 * エラートースト
 */
export function showErrorToast(message: string, subMessage?: string): string {
    return showToast({
        message,
        type: 'error',
        subMessage
    });
}

/**
 * トーストを非表示
 */
export function hideToast(id: string): void {
    toasts.update((t) => t.filter((toast) => toast.id !== id));
}

/**
 * 全トーストをクリア
 */
export function clearToasts(): void {
    toasts.set([]);
}
