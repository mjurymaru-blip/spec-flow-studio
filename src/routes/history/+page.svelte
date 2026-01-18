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

	// Side-by-Side Diff モーダル
	let showDiffModal = $state(false);
	let selectedPatch = $state<SpecPatch | null>(null);

	function openDiffModal(patch: SpecPatch) {
		selectedPatch = patch;
		showDiffModal = true;
	}

	function closeDiffModal() {
		showDiffModal = false;
		selectedPatch = null;
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

								<button class="view-diff-btn" onclick={() => openDiffModal(patch)}>
									🔍 詳細比較
								</button>
							</Panel>
						</div>
					</div>
				{/each}
			</div>
		{/if}
	</div>
</div>

<!-- Side-by-Side Diff モーダル -->
{#if showDiffModal && selectedPatch}
	<div
		class="modal-backdrop"
		onclick={closeDiffModal}
		onkeydown={(e) => e.key === 'Escape' && closeDiffModal()}
		role="presentation"
		tabindex="-1"
	>
		<div class="diff-modal" onclick={(e) => e.stopPropagation()} role="dialog" tabindex="0">
			<div class="modal-header">
				<h2>🔍 Side-by-Side 比較</h2>
				<span class="modal-subtitle">{selectedPatch.metadata.name}</span>
				<button class="close-btn" onclick={closeDiffModal}>✕</button>
			</div>

			<div class="diff-container">
				{#each selectedPatch.spec.diffs as diff}
					<div class="diff-row">
						<div class="diff-header">
							<span class="diff-op-badge" style="background: {getImpactColor(diff.impact)}">
								{getOperationIcon(diff.operation)}
							</span>
							<span class="diff-agent">{diff.agentName}</span>
							<span class="diff-path">{diff.path}</span>
						</div>
						<div class="side-by-side">
							<div class="diff-pane before">
								<div class="pane-label">変更前</div>
								<pre class="pane-content">{diff.before ?? '(なし)'}</pre>
							</div>
							<div class="diff-arrow">→</div>
							<div class="diff-pane after">
								<div class="pane-label">変更後</div>
								<pre class="pane-content">{diff.after ?? '(なし)'}</pre>
							</div>
						</div>
					</div>
				{/each}
			</div>

			<div class="modal-footer">
				<Button variant="secondary" onclick={closeDiffModal}>閉じる</Button>
			</div>
		</div>
	</div>
{/if}

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

	/* View Diff Button */
	.view-diff-btn {
		margin-top: var(--space-3);
		padding: var(--space-2) var(--space-3);
		background: var(--color-bg-tertiary);
		border: 1px solid var(--color-border-primary);
		border-radius: var(--radius-md);
		color: var(--color-text-secondary);
		font-size: var(--font-size-xs);
		cursor: pointer;
		transition: all 0.2s;
	}

	.view-diff-btn:hover {
		background: var(--color-bg-hover);
		border-color: var(--color-accent-primary);
		color: var(--color-accent-primary);
	}

	/* Modal */
	.modal-backdrop {
		position: fixed;
		inset: 0;
		background: rgba(0, 0, 0, 0.7);
		display: flex;
		align-items: center;
		justify-content: center;
		z-index: 1000;
		animation: fade-in 0.2s ease-out;
	}

	.diff-modal {
		background: var(--color-bg-primary);
		border: 1px solid var(--color-border-primary);
		border-radius: var(--radius-lg);
		width: 90%;
		max-width: 900px;
		max-height: 80vh;
		display: flex;
		flex-direction: column;
		animation: slide-up 0.3s ease-out;
	}

	@keyframes slide-up {
		from {
			opacity: 0;
			transform: translateY(20px);
		}
		to {
			opacity: 1;
			transform: translateY(0);
		}
	}

	.modal-header {
		display: flex;
		align-items: center;
		gap: var(--space-3);
		padding: var(--space-4);
		border-bottom: 1px solid var(--color-border-primary);
	}

	.modal-header h2 {
		font-size: var(--font-size-lg);
		margin: 0;
	}

	.modal-subtitle {
		font-size: var(--font-size-sm);
		color: var(--color-text-muted);
	}

	.close-btn {
		margin-left: auto;
		background: none;
		border: none;
		color: var(--color-text-muted);
		font-size: var(--font-size-lg);
		cursor: pointer;
		padding: var(--space-1);
		border-radius: var(--radius-sm);
	}

	.close-btn:hover {
		color: var(--color-text-primary);
		background: var(--color-bg-hover);
	}

	.diff-container {
		flex: 1;
		overflow-y: auto;
		padding: var(--space-4);
		display: flex;
		flex-direction: column;
		gap: var(--space-4);
	}

	.diff-row {
		background: var(--color-bg-secondary);
		border-radius: var(--radius-md);
		padding: var(--space-3);
	}

	.diff-header {
		display: flex;
		align-items: center;
		gap: var(--space-2);
		margin-bottom: var(--space-3);
		padding-bottom: var(--space-2);
		border-bottom: 1px solid var(--color-border-secondary);
	}

	.diff-op-badge {
		width: 24px;
		height: 24px;
		border-radius: var(--radius-sm);
		display: flex;
		align-items: center;
		justify-content: center;
		color: white;
		font-weight: bold;
		font-size: var(--font-size-sm);
	}

	.side-by-side {
		display: grid;
		grid-template-columns: 1fr auto 1fr;
		gap: var(--space-3);
		align-items: stretch;
	}

	.diff-pane {
		background: var(--color-bg-tertiary);
		border-radius: var(--radius-md);
		overflow: hidden;
	}

	.diff-pane.before {
		border-left: 3px solid var(--color-accent-error);
	}

	.diff-pane.after {
		border-left: 3px solid var(--color-accent-success);
	}

	.pane-label {
		padding: var(--space-2) var(--space-3);
		background: var(--color-bg-hover);
		font-size: var(--font-size-xs);
		font-weight: 600;
		color: var(--color-text-muted);
	}

	.pane-content {
		padding: var(--space-3);
		font-family: var(--font-mono);
		font-size: var(--font-size-sm);
		white-space: pre-wrap;
		word-break: break-word;
		margin: 0;
		min-height: 60px;
	}

	.diff-arrow {
		display: flex;
		align-items: center;
		justify-content: center;
		font-size: var(--font-size-xl);
		color: var(--color-text-muted);
	}

	.modal-footer {
		padding: var(--space-4);
		border-top: 1px solid var(--color-border-primary);
		display: flex;
		justify-content: flex-end;
	}
</style>
