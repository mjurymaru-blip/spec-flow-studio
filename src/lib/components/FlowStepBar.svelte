<!--
  FlowStepBar Component
  現在のワークフロー位置を表示
  Spec → Generate → Artifact → Diff
-->
<script lang="ts">
	import { page } from '$app/stores';

	// ステップ定義
	const steps = [
		{ id: 'spec', name: 'Spec', icon: '📝', path: '/editor' },
		{ id: 'generate', name: 'Generate', icon: '⚡', path: '/editor' },
		{ id: 'artifact', name: 'Artifact', icon: '📦', path: '/viewer' },
		{ id: 'diff', name: 'Diff', icon: '🔍', path: '/diff' }
	];

	// 現在のステップを判定
	let currentStepIndex = $derived(() => {
		const path = $page.url.pathname;
		if (path.startsWith('/diff')) return 3;
		if (path.startsWith('/viewer')) return 2;
		// エディタの場合は生成モーダルが開いていれば1、そうでなければ0
		return 0;
	});
</script>

<div class="flow-step-bar">
	{#each steps as step, i}
		<a
			href={step.path}
			class="step"
			class:active={i === currentStepIndex()}
			class:completed={i < currentStepIndex()}
		>
			<span class="step-icon">{step.icon}</span>
			<span class="step-name">{step.name}</span>
		</a>
		{#if i < steps.length - 1}
			<div class="step-connector" class:active={i < currentStepIndex()}></div>
		{/if}
	{/each}
</div>

<style>
	.flow-step-bar {
		display: flex;
		align-items: center;
		gap: var(--space-1);
		padding: var(--space-2) var(--space-4);
		background: var(--color-bg-secondary);
		border-radius: var(--radius-lg);
		border: 1px solid var(--color-border-secondary);
	}

	.step {
		display: flex;
		align-items: center;
		gap: var(--space-2);
		padding: var(--space-2) var(--space-3);
		border-radius: var(--radius-md);
		text-decoration: none;
		color: var(--color-text-muted);
		font-size: var(--font-size-xs);
		transition: all 0.2s;
	}

	.step:hover {
		background: var(--color-bg-tertiary);
		color: var(--color-text-secondary);
	}

	.step.active {
		background: rgba(0, 212, 255, 0.1);
		color: var(--color-accent-primary);
	}

	.step.completed {
		color: var(--color-accent-success);
	}

	.step-icon {
		font-size: var(--font-size-base);
	}

	.step-name {
		font-weight: 500;
	}

	.step-connector {
		width: 20px;
		height: 2px;
		background: var(--color-border-secondary);
		transition: background 0.3s;
	}

	.step-connector.active {
		background: var(--color-accent-success);
	}

	/* 小さい画面ではアイコンのみ */
	@media (max-width: 700px) {
		.step-name {
			display: none;
		}

		.step-connector {
			width: 12px;
		}
	}
</style>
