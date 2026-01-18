<!--
  Viewer Page
  AI生成物ビューア (UI Mock / API Spec)
-->
<script lang="ts">
	import { onDestroy, untrack } from 'svelte';
	import { Panel, Button } from '$lib/components/ui';
	import { artifacts, removeArtifact, latestArtifacts } from '$lib/stores/artifact-store';
	import { SpecEditor } from '$lib/components/editor';
	import MermaidDiagram from '$lib/components/MermaidDiagram.svelte';
	import type { Artifact } from '$lib/types';

	// 状態
	let selectedArtifactId = $state<string | null>(null);
	let viewMode = $state<'preview' | 'code'>('preview');

	// 選択中のArtifact
	let selectedArtifact = $derived.by(() => {
		if ($artifacts.length === 0) return null;
		if (selectedArtifactId) {
			return $artifacts.find((a) => a.id === selectedArtifactId) || $artifacts[0];
		}
		return $artifacts[$artifacts.length - 1]; // デフォルトで最新
	});

	// Artifact選択ハンドラ
	function selectArtifact(id: string) {
		selectedArtifactId = id;
	}

	// 削除ハンドラ
	function handleDelete(id: string) {
		console.log('[Viewer] handleDelete called with id:', id);
		if (confirm('この生成物を削除しますか？')) {
			console.log('[Viewer] confirm returned true, calling removeArtifact');
			removeArtifact(id);
			console.log('[Viewer] removeArtifact called, artifacts count:', $artifacts.length);
			if (selectedArtifactId === id) {
				selectedArtifactId = null;
			}
		}
	}

	// UI Mock プレビュー用のBlob URL
	let previewUrl = $state<string | null>(null);
	let lastArtifactId: string | null = null;
	let interactiveMode = $state(false); // インタラクティブモード（リンク動作有効）

	// selectedArtifact の ID を追跡して previewUrl を更新
	$effect(() => {
		const artifactId = selectedArtifact?.id ?? null;
		const artifactType = selectedArtifact?.type;
		const artifactContent = selectedArtifact?.content;

		// IDが変わっていなければ何もしない（untrackで追跡対象から外す）
		const shouldUpdate = untrack(() => artifactId !== lastArtifactId);
		if (!shouldUpdate) {
			return;
		}

		// 前のURLをクリーンアップ（untrackで追跡対象から外す）
		untrack(() => {
			if (previewUrl) {
				URL.revokeObjectURL(previewUrl);
			}
		});

		// 新しいURLを生成
		if (artifactType === 'ui-mock' && artifactContent) {
			const blob = new Blob([artifactContent], { type: 'text/html' });
			previewUrl = URL.createObjectURL(blob);
		} else {
			previewUrl = null;
		}

		lastArtifactId = artifactId;
	});

	onDestroy(() => {
		if (previewUrl) URL.revokeObjectURL(previewUrl);
	});
</script>

<div class="viewer-page">
	<header class="viewer-header">
		<h1>生成物ビューア</h1>

		{#if selectedArtifact}
			<div class="header-controls">
				<div class="view-mode-toggle">
					<button
						class="toggle-btn"
						class:active={viewMode === 'preview'}
						onclick={() => (viewMode = 'preview')}
					>
						Preview
					</button>
					<button
						class="toggle-btn"
						class:active={viewMode === 'code'}
						onclick={() => (viewMode = 'code')}
					>
						Code
					</button>
				</div>
				<Button
					variant="danger"
					size="sm"
					onclick={() => selectedArtifact && handleDelete(selectedArtifact.id)}>削除</Button
				>
			</div>
		{/if}
	</header>

	<div class="viewer-layout">
		<!-- 左側: Artifactリスト -->
		<div class="viewer-sidebar">
			<Panel title="Artifacts" class="h-full">
				<div class="artifact-list">
					{#each $artifacts as artifact}
						<button
							class="artifact-item"
							class:active={selectedArtifact?.id === artifact.id}
							onclick={() => selectArtifact(artifact.id)}
						>
							<div class="artifact-icon">
								{#if artifact.type === 'ui-mock'}🎨{:else}📄{/if}
							</div>
							<div class="artifact-info">
								<span class="artifact-name">{artifact.name}</span>
								<span class="artifact-date">
									{new Date(artifact.generatedAt).toLocaleTimeString()}
								</span>
							</div>
						</button>
					{/each}

					{#if $artifacts.length === 0}
						<div class="empty-list">
							<p>生成物がありません</p>
							<a href="/editor" class="text-accent underline">エディタで生成</a>
						</div>
					{/if}
				</div>
			</Panel>
		</div>

		<!-- 右側: ビューアエリア -->
		<div class="viewer-main">
			{#if selectedArtifact}
				<div class="artifact-content">
					<!-- Constraints Badge -->
					{#if selectedArtifact.consideredConstraints && selectedArtifact.consideredConstraints.length > 0}
						<div class="constraints-badge">
							<span class="badge-icon">🛡️</span>
							<span class="badge-label">考慮した制約:</span>
							<div class="constraint-tags">
								{#each selectedArtifact.consideredConstraints as constraint}
									<span class="constraint-tag">{constraint}</span>
								{/each}
							</div>
						</div>
					{/if}

					<!-- Preview Mode -->
					<div class="content-view" class:hidden={viewMode !== 'preview'}>
						{#if selectedArtifact.type === 'ui-mock'}
							<div class="preview-container">
								<div class="preview-toolbar">
									<label class="interactive-toggle">
										<input type="checkbox" bind:checked={interactiveMode} />
										<span>🔗 インタラクティブモード</span>
									</label>
									<span class="toolbar-hint">
										{interactiveMode ? 'リンクが動作します' : 'リンクは無効です'}
									</span>
								</div>
								{#if previewUrl}
									{#if interactiveMode}
										<iframe
											src={previewUrl}
											title="UI Preview (Interactive)"
											class="preview-iframe interactive"
										></iframe>
									{:else}
										<iframe
											src={previewUrl}
											title="UI Preview"
											class="preview-iframe"
											sandbox="allow-same-origin"
										></iframe>
									{/if}
								{/if}
							</div>
						{:else if selectedArtifact.type === 'api-spec'}
							<div class="api-preview-placeholder">
								<p>OpenAPIプレビューは現在コードモードのみ対応しています。</p>
								<Button size="sm" onclick={() => (viewMode = 'code')}>コードを表示</Button>
							</div>
						{:else if selectedArtifact.type === 'use-case-diagram'}
							<div class="mermaid-preview">
								<MermaidDiagram
									code={selectedArtifact.content}
									id="usecase-{selectedArtifact.id}"
								/>
							</div>
						{:else}
							<div class="text-preview">
								<pre>{selectedArtifact.content}</pre>
							</div>
						{/if}
					</div>

					<!-- Code Mode -->
					<div class="content-view" class:hidden={viewMode !== 'code'}>
						<SpecEditor value={selectedArtifact.content} readonly={true} />
					</div>
				</div>
			{:else}
				<div class="empty-state">
					<p>左側のリストから生成物を選択するか、エディタで新しく生成してください。</p>
				</div>
			{/if}
		</div>
	</div>
</div>

<style>
	.viewer-page {
		height: calc(100vh - var(--header-height));
		display: flex;
		flex-direction: column;
		gap: var(--space-4);
		animation: fade-in var(--transition-base) ease-out;
	}

	.viewer-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		height: var(--space-10);
	}

	.header-controls {
		display: flex;
		align-items: center;
		gap: var(--space-4);
	}

	.view-mode-toggle {
		display: flex;
		background: var(--color-bg-tertiary);
		border-radius: var(--radius-md);
		padding: 2px;
		border: 1px solid var(--color-border-primary);
	}

	.toggle-btn {
		padding: var(--space-1) var(--space-3);
		border: none;
		background: transparent;
		color: var(--color-text-secondary);
		border-radius: var(--radius-sm);
		cursor: pointer;
		font-size: var(--font-size-sm);
		transition: all 0.2s;
	}

	.toggle-btn.active {
		background: var(--color-bg-primary);
		color: var(--color-text-primary);
		box-shadow: 0 1px 2px rgba(0, 0, 0, 0.2);
	}

	.viewer-layout {
		flex: 1;
		display: grid;
		grid-template-columns: 250px 1fr;
		gap: var(--space-4);
		min-height: 0;
	}

	/* Sidebar */
	.viewer-sidebar {
		height: 100%;
		overflow-y: auto;
	}

	:global(.h-full) {
		height: 100%;
	}

	.artifact-list {
		display: flex;
		flex-direction: column;
		gap: var(--space-2);
	}

	.artifact-item {
		display: flex;
		align-items: center;
		gap: var(--space-3);
		padding: var(--space-3);
		background: transparent;
		border: 1px solid transparent;
		border-radius: var(--radius-md);
		cursor: pointer;
		text-align: left;
		transition: all 0.2s;
		width: 100%;
	}

	.artifact-item:hover {
		background: var(--color-bg-hover);
	}

	.artifact-item.active {
		background: rgba(0, 212, 255, 0.1);
		border-color: var(--color-accent-primary);
	}

	.artifact-icon {
		font-size: var(--font-size-lg);
	}

	.artifact-info {
		display: flex;
		flex-direction: column;
		overflow: hidden;
	}

	.artifact-name {
		font-size: var(--font-size-sm);
		color: var(--color-text-primary);
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
	}

	.artifact-date {
		font-size: var(--font-size-xs);
		color: var(--color-text-muted);
	}

	.empty-list {
		padding: var(--space-4);
		text-align: center;
		color: var(--color-text-muted);
		font-size: var(--font-size-sm);
	}

	/* Main */
	.viewer-main {
		background: var(--color-bg-secondary);
		border: 1px solid var(--color-border-primary);
		border-radius: var(--radius-lg);
		overflow: hidden;
		display: flex;
		flex-direction: column;
	}

	.artifact-content {
		flex: 1;
		display: flex;
		flex-direction: column;
		overflow: hidden;
	}

	.content-view {
		flex: 1;
		display: flex;
		flex-direction: column;
		overflow: hidden;
		height: 100%;
	}

	.content-view.hidden {
		display: none;
	}

	.preview-container {
		flex: 1;
		background: white; /* プレビューは見やすく白背景 */
	}

	.preview-iframe {
		width: 100%;
		height: 100%;
		border: none;
	}

	.api-preview-placeholder {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		height: 100%;
		gap: var(--space-4);
		color: var(--color-text-muted);
	}

	.text-preview {
		padding: var(--space-4);
		overflow: auto;
		font-family: var(--font-mono);
		white-space: pre-wrap;
	}

	.empty-state {
		display: flex;
		align-items: center;
		justify-content: center;
		height: 100%;
		color: var(--color-text-secondary);
	}

	.text-accent {
		color: var(--color-accent-primary);
	}

	.underline {
		text-decoration: underline;
	}

	/* Constraints Badge */
	.constraints-badge {
		display: flex;
		align-items: flex-start;
		gap: var(--space-2);
		padding: var(--space-3);
		background: linear-gradient(135deg, rgba(239, 68, 68, 0.1), rgba(251, 146, 60, 0.1));
		border: 1px solid var(--color-accent-error);
		border-radius: var(--radius-md);
		margin-bottom: var(--space-3);
	}

	.badge-icon {
		font-size: 1.2rem;
	}

	.badge-label {
		font-size: var(--font-size-sm);
		font-weight: 600;
		color: var(--color-accent-error);
		white-space: nowrap;
	}

	.constraint-tags {
		display: flex;
		flex-wrap: wrap;
		gap: var(--space-1);
	}

	.constraint-tag {
		padding: var(--space-1) var(--space-2);
		background: rgba(239, 68, 68, 0.2);
		border-radius: var(--radius-sm);
		font-size: var(--font-size-xs);
		color: var(--color-text-primary);
	}

	.mermaid-preview {
		padding: var(--space-4);
		background: var(--color-bg-secondary);
		border-radius: var(--radius-md);
		overflow: auto;
		max-height: 600px;
	}

	.preview-toolbar {
		display: flex;
		align-items: center;
		gap: var(--space-4);
		padding: var(--space-2) var(--space-3);
		background: var(--color-bg-tertiary);
		border-bottom: 1px solid var(--color-border-primary);
	}

	.interactive-toggle {
		display: flex;
		align-items: center;
		gap: var(--space-2);
		cursor: pointer;
		font-size: var(--font-size-sm);
		color: var(--color-text-secondary);
	}

	.interactive-toggle input {
		width: 16px;
		height: 16px;
		accent-color: var(--color-accent-primary);
	}

	.interactive-toggle span {
		user-select: none;
	}

	.toolbar-hint {
		font-size: var(--font-size-xs);
		color: var(--color-text-muted);
	}

	.preview-iframe.interactive {
		border: 2px solid var(--color-accent-primary);
	}
</style>
