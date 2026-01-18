<!--
  Button Component
  SF風のボタンコンポーネント
-->
<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLButtonAttributes } from 'svelte/elements';

	interface Props extends HTMLButtonAttributes {
		variant?: 'primary' | 'secondary' | 'ghost' | 'danger' | 'accent';
		size?: 'sm' | 'md' | 'lg';
		loading?: boolean;
		children?: Snippet;
	}

	let {
		variant = 'primary',
		size = 'md',
		loading = false,
		disabled,
		children,
		...restProps
	}: Props = $props();
</script>

<button
	class="btn btn--{variant} btn--{size}"
	class:btn--loading={loading}
	disabled={disabled || loading}
	{...restProps}
>
	{#if loading}
		<span class="btn__spinner"></span>
	{/if}
	<span class="btn__content" class:btn__content--hidden={loading}>
		{#if children}
			{@render children()}
		{/if}
	</span>
</button>

<style>
	.btn {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		gap: var(--space-2);
		font-family: var(--font-sans);
		font-weight: 500;
		border: 1px solid transparent;
		border-radius: var(--radius-md);
		cursor: pointer;
		transition: all var(--transition-fast);
		position: relative;
		overflow: hidden;
	}

	.btn:disabled {
		opacity: 0.5;
		cursor: not-allowed;
	}

	/* Sizes */
	.btn--sm {
		padding: var(--space-1) var(--space-3);
		font-size: var(--font-size-xs);
	}

	.btn--md {
		padding: var(--space-2) var(--space-4);
		font-size: var(--font-size-sm);
	}

	.btn--lg {
		padding: var(--space-3) var(--space-6);
		font-size: var(--font-size-base);
	}

	/* Variants */
	.btn--primary {
		background: var(--gradient-primary);
		color: white;
		border-color: var(--color-accent-primary);
	}

	.btn--primary:hover:not(:disabled) {
		box-shadow: var(--shadow-glow);
		transform: translateY(-1px);
	}

	.btn--secondary {
		background: var(--color-bg-tertiary);
		color: var(--color-text-primary);
		border-color: var(--color-border-primary);
	}

	.btn--secondary:hover:not(:disabled) {
		background: var(--color-bg-hover);
		border-color: var(--color-accent-primary);
	}

	.btn--ghost {
		background: transparent;
		color: var(--color-text-secondary);
		border-color: transparent;
	}

	.btn--ghost:hover:not(:disabled) {
		background: var(--color-bg-hover);
		color: var(--color-text-primary);
	}

	.btn--danger {
		background: var(--color-accent-error);
		color: white;
		border-color: var(--color-accent-error);
	}

	.btn--danger:hover:not(:disabled) {
		background: #dc2626;
		box-shadow: 0 0 20px rgba(239, 68, 68, 0.3);
	}

	.btn--accent {
		background: linear-gradient(135deg, var(--color-accent-secondary), var(--color-accent-primary));
		color: white;
		border-color: var(--color-accent-secondary);
	}

	.btn--accent:hover:not(:disabled) {
		box-shadow: 0 0 20px rgba(139, 92, 246, 0.4);
		transform: translateY(-1px);
	}

	/* Loading */
	.btn__spinner {
		position: absolute;
		width: 16px;
		height: 16px;
		border: 2px solid transparent;
		border-top-color: currentColor;
		border-radius: 50%;
		animation: spin 0.8s linear infinite;
	}

	.btn__content--hidden {
		visibility: hidden;
	}

	@keyframes spin {
		to {
			transform: rotate(360deg);
		}
	}
</style>
