<!--
  StatusBar Component
  画面下部のステータスバー
-->
<script lang="ts">
	import { StatusIndicator } from '$lib/components/ui';
	import { connectionStatus } from '$lib/stores/integration-store';
	import { specCount } from '$lib/stores/spec-store';
	import { artifacts } from '$lib/stores/artifact-store';

	// 接続状態をStatusIndicatorのstatus形式に変換
	const statusMap = {
		disconnected: 'offline',
		connecting: 'warning',
		connected: 'success',
		error: 'error'
	} as const;

	let currentStatus = $derived(statusMap[$connectionStatus]);
	let artifactCount = $derived($artifacts.length);
</script>

<footer class="statusbar">
	<div class="statusbar__left">
		<StatusIndicator status={currentStatus} size="sm" pulse={$connectionStatus === 'connected'} />
	</div>

	<div class="statusbar__center">
		<span class="statusbar__info">
			<span class="statusbar__label">Specs:</span>
			<span class="statusbar__value">{$specCount}</span>
		</span>
		<span class="statusbar__divider">|</span>
		<span class="statusbar__info">
			<span class="statusbar__label">Artifacts:</span>
			<span class="statusbar__value">{artifactCount}</span>
		</span>
	</div>

	<div class="statusbar__right">
		<span class="statusbar__time font-mono">
			{new Date().toLocaleTimeString('ja-JP', { hour: '2-digit', minute: '2-digit' })}
		</span>
	</div>
</footer>

<style>
	.statusbar {
		position: fixed;
		bottom: 0;
		left: var(--sidebar-width);
		right: 0;
		height: var(--statusbar-height);
		background: var(--color-bg-secondary);
		border-top: 1px solid var(--color-border-primary);
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: 0 var(--space-4);
		z-index: 100;
	}

	.statusbar__left,
	.statusbar__right {
		display: flex;
		align-items: center;
		gap: var(--space-3);
	}

	.statusbar__center {
		display: flex;
		align-items: center;
		gap: var(--space-3);
	}

	.statusbar__info {
		display: flex;
		align-items: center;
		gap: var(--space-1);
		font-size: var(--font-size-xs);
	}

	.statusbar__label {
		color: var(--color-text-muted);
	}

	.statusbar__value {
		color: var(--color-text-primary);
		font-family: var(--font-mono);
	}

	.statusbar__divider {
		color: var(--color-text-muted);
	}

	.statusbar__time {
		font-size: var(--font-size-xs);
		color: var(--color-text-secondary);
	}
</style>
