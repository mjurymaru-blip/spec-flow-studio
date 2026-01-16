<!--
  History Page
  パッチ履歴のタイムライン表示とタイムトラベル
-->
<script lang="ts">
	import { Panel, Button } from '$lib/components/ui';
	import {
		historyStore,
		patches,
		currentPatchIndex,
		canUndo,
		canRedo
	} from '$lib/stores/history-store';
	import { specs, setSpecs } from '$lib/stores/spec-store';
	import type { SpecPatch } from '$lib/types';

	// Undo
	function handleUndo() {
		const newSpecs = historyStore.undo();
		if (newSpecs) {
			setSpecs(newSpecs, 'draft-spec');
		}
	}

	// Redo
	function handleRedo() {
		const newSpecs = historyStore.redo();
		if (newSpecs) {
			setSpecs(newSpecs, 'draft-spec');
		}
	}

	// 特定のパッチにロールバック
	function handleRevertTo(patchId: string) {
		if (confirm('このバージョンに戻しますか？現在の変更は失われます。')) {
			const newSpecs = historyStore.revertTo(patchId);
			if (newSpecs) {
				setSpecs(newSpecs, 'draft-spec');
			}
		}
	}

	// 影響度に応じた色
	function getImpactColor(impact: 'low' | 'medium' | 'high'): string {
		switch (impact) {
			case 'high':
				return 'var(--color-accent-error)';
			case 'medium':
				return 'var(--color-accent-warning)';
			default:
				return 'var(--color-accent-success)';
		}
	}

	// 操作に応じたアイコン
	function getOperationIcon(op: 'add' | 'remove' | 'modify'): string {
		switch (op) {
			case 'add':
				return '+';
			case 'remove':
				return '−';
			default:
				return '~';
		}
	}
</script>

<div class="history-page">
	<header class="page-header">
		<div class="header-left">
			<h1>履歴</h1>
			<span class="patch-count">{$patches.length} パッチ</span>
		</div>
		<div class="header-right">
			<Button variant="secondary" size="sm" onclick={handleUndo} disabled={!$canUndo}>
				↶ 元に戻す
			</Button>
			<Button variant="secondary" size="sm" onclick={handleRedo} disabled={!$canRedo}>
				やり直す ↷
			</Button>
		</div>
	</header>

	<div class="history-content">
		{#if $patches.length === 0}
			<Panel>
				<div class="empty-state">
					<p>履歴がありません</p>
					<p class="text-muted">
						エディタで変更を加えて「コミット」すると、ここに履歴が表示されます。
					</p>
				</div>
			</Panel>
		{:else}
			<div class="timeline">
				{#each $patches as patch, index}
					<div class="timeline-item" class:current={index === $currentPatchIndex}>
						<div class="timeline-marker">
							<div class="marker-dot"></div>
							{#if index < $patches.length - 1}
								<div class="marker-line"></div>
							{/if}
						</div>
						<div class="timeline-content">
							<Panel>
								<div class="patch-header">
									<div class="patch-info">
										<span class="patch-name">{patch.metadata.name}</span>
										<span class="patch-meta">
											{new Date(patch.metadata.createdAt).toLocaleString()} ・ {patch.metadata
												.author}
										</span>
									</div>
									{#if index !== $currentPatchIndex}
										<Button
											variant="ghost"
											size="sm"
											onclick={() => handleRevertTo(patch.metadata.id)}
										>
											戻す
										</Button>
									{:else}
										<span class="current-badge">現在</span>
									{/if}
								</div>

								<p class="patch-summary">{patch.spec.summary}</p>

								{#if patch.spec.rationale}
									<p class="patch-rationale">理由: {patch.spec.rationale}</p>
								{/if}

								<div class="diff-list">
									{#each patch.spec.diffs as diff}
										<div class="diff-item">
											<span class="diff-op" style="color: {getImpactColor(diff.impact)}">
												{getOperationIcon(diff.operation)}
											</span>
											<span class="diff-agent">{diff.agentName}</span>
											<span class="diff-path">{diff.path}</span>
											{#if diff.operation === 'add' && diff.after}
												<span class="diff-value add">"{diff.after}"</span>
											{:else if diff.operation === 'remove' && diff.before}
												<span class="diff-value remove">"{diff.before}"</span>
											{:else if diff.operation === 'modify'}
												<span class="diff-value remove">"{diff.before}"</span>
												→
												<span class="diff-value add">"{diff.after}"</span>
											{/if}
										</div>
									{/each}
								</div>
							</Panel>
						</div>
					</div>
				{/each}
			</div>
		{/if}
	</div>
</div>

<style>
	.history-page {
		animation: fade-in var(--transition-base) ease-out;
	}

	.page-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: var(--space-6);
	}

	.header-left {
		display: flex;
		align-items: baseline;
		gap: var(--space-3);
	}

	.patch-count {
		font-size: var(--font-size-sm);
		color: var(--color-text-muted);
	}

	.header-right {
		display: flex;
		gap: var(--space-2);
	}

	.empty-state {
		text-align: center;
		padding: var(--space-8);
		color: var(--color-text-secondary);
	}

	.text-muted {
		color: var(--color-text-muted);
		font-size: var(--font-size-sm);
		margin-top: var(--space-2);
	}

	/* Timeline */
	.timeline {
		display: flex;
		flex-direction: column;
		gap: var(--space-4);
	}

	.timeline-item {
		display: flex;
		gap: var(--space-4);
	}

	.timeline-item.current .marker-dot {
		background: var(--color-accent-primary);
		box-shadow: 0 0 8px var(--color-accent-primary);
	}

	.timeline-marker {
		display: flex;
		flex-direction: column;
		align-items: center;
		width: 20px;
		flex-shrink: 0;
	}

	.marker-dot {
		width: 12px;
		height: 12px;
		border-radius: 50%;
		background: var(--color-border-primary);
		border: 2px solid var(--color-bg-secondary);
	}

	.marker-line {
		flex: 1;
		width: 2px;
		background: var(--color-border-secondary);
		margin-top: var(--space-2);
	}

	.timeline-content {
		flex: 1;
		max-width: 600px;
	}

	/* Patch Card */
	.patch-header {
		display: flex;
		justify-content: space-between;
		align-items: flex-start;
		margin-bottom: var(--space-3);
	}

	.patch-info {
		display: flex;
		flex-direction: column;
		gap: var(--space-1);
	}

	.patch-name {
		font-weight: 600;
		color: var(--color-text-primary);
	}

	.patch-meta {
		font-size: var(--font-size-xs);
		color: var(--color-text-muted);
	}

	.current-badge {
		font-size: var(--font-size-xs);
		padding: var(--space-1) var(--space-2);
		background: rgba(0, 212, 255, 0.2);
		color: var(--color-accent-primary);
		border-radius: var(--radius-sm);
	}

	.patch-summary {
		font-size: var(--font-size-sm);
		color: var(--color-text-secondary);
		margin-bottom: var(--space-2);
	}

	.patch-rationale {
		font-size: var(--font-size-xs);
		color: var(--color-text-muted);
		font-style: italic;
		margin-bottom: var(--space-3);
	}

	/* Diff List */
	.diff-list {
		display: flex;
		flex-direction: column;
		gap: var(--space-2);
		padding-top: var(--space-3);
		border-top: 1px solid var(--color-border-secondary);
	}

	.diff-item {
		display: flex;
		align-items: center;
		gap: var(--space-2);
		font-size: var(--font-size-xs);
		font-family: var(--font-mono);
	}

	.diff-op {
		font-weight: bold;
		width: 16px;
		text-align: center;
	}

	.diff-agent {
		color: var(--color-accent-secondary);
	}

	.diff-path {
		color: var(--color-text-muted);
	}

	.diff-value {
		padding: 0 var(--space-1);
		border-radius: var(--radius-sm);
	}

	.diff-value.add {
		background: rgba(16, 185, 129, 0.2);
		color: var(--color-accent-success);
	}

	.diff-value.remove {
		background: rgba(239, 68, 68, 0.2);
		color: var(--color-accent-error);
		text-decoration: line-through;
	}
</style>
