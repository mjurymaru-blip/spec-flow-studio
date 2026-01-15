<!--
  StatusIndicator Component
  接続状態などを示すインジケーター
-->
<script lang="ts">
	interface Props {
		status: 'success' | 'warning' | 'error' | 'info' | 'offline';
		label?: string;
		pulse?: boolean;
		size?: 'sm' | 'md' | 'lg';
	}

	let { status, label, pulse = false, size = 'md' }: Props = $props();

	const statusColors = {
		success: 'var(--color-accent-success)',
		warning: 'var(--color-accent-warning)',
		error: 'var(--color-accent-error)',
		info: 'var(--color-accent-primary)',
		offline: 'var(--color-text-muted)'
	};

	const statusLabels = {
		success: '接続中',
		warning: '警告',
		error: 'エラー',
		info: '情報',
		offline: 'オフライン'
	};
</script>

<div class="status status--{size}" style="--status-color: {statusColors[status]}">
	<span class="status__dot" class:status__dot--pulse={pulse}></span>
	{#if label !== undefined}
		<span class="status__label">{label}</span>
	{:else}
		<span class="status__label">{statusLabels[status]}</span>
	{/if}
</div>

<style>
	.status {
		display: inline-flex;
		align-items: center;
		gap: var(--space-2);
	}

	.status__dot {
		width: 8px;
		height: 8px;
		border-radius: 50%;
		background-color: var(--status-color);
		flex-shrink: 0;
	}

	.status--sm .status__dot {
		width: 6px;
		height: 6px;
	}

	.status--lg .status__dot {
		width: 10px;
		height: 10px;
	}

	.status__dot--pulse {
		animation: pulse-glow 2s ease-in-out infinite;
		box-shadow: 0 0 8px var(--status-color);
	}

	.status__label {
		font-size: var(--font-size-sm);
		color: var(--color-text-secondary);
	}

	.status--sm .status__label {
		font-size: var(--font-size-xs);
	}

	.status--lg .status__label {
		font-size: var(--font-size-base);
	}

	@keyframes pulse-glow {
		0%, 100% {
			opacity: 1;
			box-shadow: 0 0 4px var(--status-color);
		}
		50% {
			opacity: 0.6;
			box-shadow: 0 0 12px var(--status-color);
		}
	}
</style>
