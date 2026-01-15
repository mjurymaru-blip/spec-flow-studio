<!--
  ConstraintPanel Component
  制約事項（Constraints）を可視化・強調表示するパネル
-->
<script lang="ts">
	import { Panel } from '$lib/components/ui';
	import type { AgentSpec } from '$lib/types';

	interface Props {
		specs: AgentSpec[];
	}

	let { specs }: Props = $props();

	// 全エージェントの制約を収集
	let allConstraints = $derived(
		specs.flatMap((agent) =>
			agent.constraints.map((constraint) => ({
				agentName: agent.displayName,
				content: constraint
			}))
		)
	);
</script>

<Panel
	title="制約事項 (Constraints)"
	variant="warning"
	glow={allConstraints.length > 0}
	class="constraint-panel"
>
	{#if allConstraints.length > 0}
		<div class="constraints-list">
			{#each allConstraints as item}
				<div class="constraint-item">
					<span class="constraint-agent">{item.agentName}</span>
					<span class="constraint-content">{item.content}</span>
				</div>
			{/each}
		</div>
	{:else}
		<div class="empty-constraints">
			<span class="empty-icon">✓</span>
			<p>制約事項は定義されていません</p>
		</div>
	{/if}
</Panel>

<style>
	.constraint-panel {
		height: 100%;
		overflow: hidden;
		display: flex;
		flex-direction: column;
	}

	.constraints-list {
		display: flex;
		flex-direction: column;
		gap: var(--space-2);
		overflow-y: auto;
		max-height: 200px; /* 必要に応じて調整 */
	}

	.constraint-item {
		display: flex;
		align-items: flex-start;
		gap: var(--space-3);
		padding: var(--space-2) var(--space-3);
		background: rgba(245, 158, 11, 0.1); /* Warning color alpha */
		border-left: 3px solid var(--color-accent-warning);
		border-radius: var(--radius-sm);
	}

	.constraint-agent {
		font-size: var(--font-size-xs);
		font-weight: 600;
		color: var(--color-accent-warning);
		background: rgba(0, 0, 0, 0.3);
		padding: 2px 6px;
		border-radius: var(--radius-sm);
		white-space: nowrap;
	}

	.constraint-content {
		font-size: var(--font-size-sm);
		color: var(--color-text-primary);
		line-height: 1.4;
	}

	.empty-constraints {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		padding: var(--space-4);
		color: var(--color-text-muted);
		gap: var(--space-2);
	}

	.empty-icon {
		font-size: var(--font-size-xl);
		color: var(--color-accent-success);
	}
</style>
