/**
 * Event Utilities
 *
 * debounce/throttleなどのイベント制御ユーティリティ
 * WebSocketやUI更新の最適化に使用
 */

/**
 * Debounce: 最後の呼び出しからwaitミリ秒後に実行
 * 連続した呼び出しを1回にまとめる
 */
export function debounce<T extends (...args: unknown[]) => void>(
    fn: T,
    wait: number
): (...args: Parameters<T>) => void {
    let timeoutId: ReturnType<typeof setTimeout> | null = null;

    return (...args: Parameters<T>) => {
        if (timeoutId) {
            clearTimeout(timeoutId);
        }
        timeoutId = setTimeout(() => {
            fn(...args);
            timeoutId = null;
        }, wait);
    };
}

/**
 * Throttle: waitミリ秒に1回だけ実行
 * 高頻度の呼び出しを間引く
 */
export function throttle<T extends (...args: unknown[]) => void>(
    fn: T,
    wait: number
): (...args: Parameters<T>) => void {
    let isThrottled = false;
    let lastArgs: Parameters<T> | null = null;

    return (...args: Parameters<T>) => {
        if (isThrottled) {
            lastArgs = args;
            return;
        }

        fn(...args);
        isThrottled = true;

        setTimeout(() => {
            isThrottled = false;
            if (lastArgs) {
                fn(...lastArgs);
                lastArgs = null;
            }
        }, wait);
    };
}

/**
 * requestAnimationFrameベースのthrottle
 * 描画更新に最適化
 */
export function rafThrottle<T extends (...args: unknown[]) => void>(
    fn: T
): (...args: Parameters<T>) => void {
    let rafId: number | null = null;
    let lastArgs: Parameters<T> | null = null;

    return (...args: Parameters<T>) => {
        lastArgs = args;

        if (rafId) {
            return;
        }

        rafId = requestAnimationFrame(() => {
            if (lastArgs) {
                fn(...lastArgs);
            }
            rafId = null;
            lastArgs = null;
        });
    };
}

/**
 * バッチ処理: 複数の更新を1回にまとめる
 */
export function createBatcher<T>(
    processBatch: (items: T[]) => void,
    wait: number
): (item: T) => void {
    let batch: T[] = [];
    let timeoutId: ReturnType<typeof setTimeout> | null = null;

    return (item: T) => {
        batch.push(item);

        if (timeoutId) {
            return;
        }

        timeoutId = setTimeout(() => {
            processBatch(batch);
            batch = [];
            timeoutId = null;
        }, wait);
    };
}
