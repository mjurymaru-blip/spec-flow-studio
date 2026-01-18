<!--
  Toast Component
  成功・警告・エラーのトースト通知
-->
<script lang="ts">
	import { fade, fly } from 'svelte/transition';

	interface Props {
		message: string;
		type?: 'success' | 'warning' | 'error' | 'info';
		icon?: string;
		subMessage?: string;
		duration?: number;
		onClose?: () => void;
	}

	let { message, type = 'success', icon, subMessage, duration = 4000, onClose }: Props = $props();

	// 自動クローズ
	$effect(() => {
		if (duration > 0) {
			const timer = setTimeout(() => {
				onClose?.();
			}, duration);
			return () => clearTimeout(timer);
		}
	});

	// デフォルトアイコン
	const defaultIcons: Record<string, string> = {
		success: '✅',
		warning: '⚠️',
		error: '❌',
		info: 'ℹ️'
	};

	let displayIcon = $derived(icon ?? defaultIcons[type]);
</script>

<div
	class="toast toast-{type}"
	role="alert"
	in:fly={{ y: -20, duration: 300 }}
	out:fade={{ duration: 200 }}
>
	<span class="toast-icon">{displayIcon}</span>
	<div class="toast-content">
		<p class="toast-message">{message}</p>
		{#if subMessage}
			<p class="toast-sub">{subMessage}</p>
		{/if}
	</div>
	<button class="toast-close" onclick={onClose}>×</button>
</div>

<style>
	.toast {
		display: flex;
		align-items: flex-start;
		gap: var(--space-3);
		padding: var(--space-4);
		border-radius: var(--radius-md);
		background: var(--color-bg-secondary);
		border: 1px solid var(--color-border-primary);
		box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
		max-width: 400px;
		animation: pulse-glow 0.5s ease-out;
	}

	@keyframes pulse-glow {
		0% {
			transform: scale(0.95);
			opacity: 0;
		}
		50% {
			transform: scale(1.02);
		}
		100% {
			transform: scale(1);
			opacity: 1;
		}
	}

	.toast-success {
		border-color: var(--color-accent-success);
		background: linear-gradient(135deg, rgba(34, 197, 94, 0.1), var(--color-bg-secondary));
	}

	.toast-warning {
		border-color: var(--color-accent-warning);
		background: linear-gradient(135deg, rgba(251, 191, 36, 0.1), var(--color-bg-secondary));
	}

	.toast-error {
		border-color: var(--color-accent-error);
		background: linear-gradient(135deg, rgba(239, 68, 68, 0.1), var(--color-bg-secondary));
	}

	.toast-info {
		border-color: var(--color-accent-primary);
		background: linear-gradient(135deg, rgba(0, 212, 255, 0.1), var(--color-bg-secondary));
	}

	.toast-icon {
		font-size: var(--font-size-xl);
		animation: bounce 0.5s ease-out;
	}

	@keyframes bounce {
		0%,
		100% {
			transform: translateY(0);
		}
		50% {
			transform: translateY(-5px);
		}
	}

	.toast-content {
		flex: 1;
	}

	.toast-message {
		font-size: var(--font-size-sm);
		font-weight: 600;
		color: var(--color-text-primary);
		margin: 0;
	}

	.toast-sub {
		font-size: var(--font-size-xs);
		color: var(--color-text-muted);
		margin: var(--space-1) 0 0;
	}

	.toast-close {
		background: transparent;
		border: none;
		color: var(--color-text-muted);
		font-size: var(--font-size-lg);
		cursor: pointer;
		padding: 0;
		line-height: 1;
	}

	.toast-close:hover {
		color: var(--color-text-primary);
	}
</style>
