<!--
  ConstraintPanel Component
  制約事項（Constraints）を可視化・強調表示するパネル
  ※ AIが従うべき「絶対条件」として視覚的に強調
  ※ クリックでエディタの該当行にジャンプ
-->
<script lang="ts">
	import { Panel } from '$lib/components/ui';
	import type { AgentSpec } from '$lib/types';

	interface ConstraintItem {
		agentName: string;
		content: string;
		index: number; // constraints配列内のインデックス
	}

	interface Props {
		specs: AgentSpec[];
		onConstraintClick?: (agentName: string, constraintText: string) => void;
	}

	let { specs, onConstraintClick }: Props = $props();

	// 全エージェントの制約を収集（インデックス付き）
	let allConstraints = $derived(
		specs.flatMap((agent) =>
			agent.constraints.map((constraint, index) => ({
				agentName: agent.displayName,
				content: constraint,
				index
			}))
		)
	);

	function handleClick(item: ConstraintItem) {
		if (onConstraintClick) {
			onConstraintClick(item.agentName, item.content);
		}
	}
</script>

<Panel
	title="⚠️ 制約事項 (Constraints)"
	variant="error"
	glow={allConstraints.length > 0}
	class="constraint-panel"
>
	{#if allConstraints.length > 0}
		<div class="constraint-warning">
			<span class="warning-icon">🚫</span>
			<span class="warning-text">これらの制約を破る生成は破棄されます</span>
		</div>
		<div class="constraints-list">
			{#each allConstraints as item}
				<button
					class="constraint-item"
					onclick={() => handleClick(item)}
					title="クリックしてエディタの該当行にジャンプ"
				>
					<span class="constraint-agent">{item.agentName}</span>
					<span class="constraint-content">{item.content}</span>
					<span class="constraint-jump-icon">↗</span>
				</button>
			{/each}
		</div>
		<p class="constraint-hint">クリックで該当行にジャンプ</p>
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

	.constraint-warning {
		display: flex;
		align-items: center;
		gap: var(--space-2);
		padding: var(--space-2) var(--space-3);
		background: rgba(239, 68, 68, 0.2);
		border: 1px solid var(--color-accent-error);
		border-radius: var(--radius-sm);
		margin-bottom: var(--space-3);
		animation: pulse-warning 2s infinite;
	}

	@keyframes pulse-warning {
		0%,
		100% {
			opacity: 1;
		}
		50% {
			opacity: 0.7;
		}
	}

	.warning-icon {
		font-size: var(--font-size-lg);
	}

	.warning-text {
		font-size: var(--font-size-xs);
		font-weight: 600;
		color: var(--color-accent-error);
	}

	.constraints-list {
		display: flex;
		flex-direction: column;
		gap: var(--space-2);
		overflow-y: auto;
		max-height: 200px;
	}

	.constraint-item {
		display: flex;
		align-items: flex-start;
		gap: var(--space-3);
		padding: var(--space-2) var(--space-3);
		background: rgba(239, 68, 68, 0.1);
		border: none;
		border-left: 3px solid var(--color-accent-error);
		border-radius: var(--radius-sm);
		cursor: pointer;
		text-align: left;
		transition: all var(--transition-fast);
		width: 100%;
	}

	.constraint-item:hover {
		background: rgba(239, 68, 68, 0.25);
		transform: translateX(2px);
	}

	.constraint-item:active {
		transform: translateX(4px);
	}

	.constraint-agent {
		font-size: var(--font-size-xs);
		font-weight: 600;
		color: var(--color-accent-error);
		background: rgba(0, 0, 0, 0.3);
		padding: 2px 6px;
		border-radius: var(--radius-sm);
		white-space: nowrap;
		flex-shrink: 0;
	}

	.constraint-content {
		font-size: var(--font-size-sm);
		color: var(--color-text-primary);
		line-height: 1.4;
		flex: 1;
	}

	.constraint-jump-icon {
		font-size: var(--font-size-sm);
		color: var(--color-text-muted);
		opacity: 0;
		transition: opacity var(--transition-fast);
	}

	.constraint-item:hover .constraint-jump-icon {
		opacity: 1;
	}

	.constraint-hint {
		font-size: var(--font-size-xs);
		color: var(--color-text-muted);
		text-align: center;
		margin-top: var(--space-2);
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
