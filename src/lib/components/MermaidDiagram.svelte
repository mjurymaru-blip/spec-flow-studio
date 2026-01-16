<!--
  Mermaid Diagram Component
  Mermaid図をレンダリングするコンポーネント
-->
<script lang="ts">
	import { onMount } from 'svelte';

	interface Props {
		code: string;
		id?: string;
	}

	let { code, id = 'mermaid-diagram' }: Props = $props();
	let container: HTMLDivElement;
	let svg = $state('');
	let error = $state<string | null>(null);

	onMount(async () => {
		try {
			// Mermaidを動的にインポート
			const mermaid = await import('mermaid');
			mermaid.default.initialize({
				startOnLoad: false,
				theme: 'dark',
				themeVariables: {
					primaryColor: '#0ea5e9',
					primaryTextColor: '#f8fafc',
					primaryBorderColor: '#334155',
					lineColor: '#64748b',
					secondaryColor: '#1e293b',
					tertiaryColor: '#0f172a'
				}
			});

			const { svg: renderedSvg } = await mermaid.default.render(id, code);
			svg = renderedSvg;
			error = null;
		} catch (e) {
			console.error('Mermaid render error:', e);
			error = e instanceof Error ? e.message : 'Mermaid rendering failed';
		}
	});

	// codeが変更されたら再レンダリング
	$effect(() => {
		if (code && container) {
			(async () => {
				try {
					const mermaid = await import('mermaid');
					const uniqueId = `${id}-${Date.now()}`;
					const { svg: renderedSvg } = await mermaid.default.render(uniqueId, code);
					svg = renderedSvg;
					error = null;
				} catch (e) {
					error = e instanceof Error ? e.message : 'Mermaid rendering failed';
				}
			})();
		}
	});
</script>

<div class="mermaid-container" bind:this={container}>
	{#if error}
		<div class="mermaid-error">
			<span class="error-icon">⚠️</span>
			<span class="error-text">{error}</span>
		</div>
	{:else if svg}
		{@html svg}
	{:else}
		<div class="mermaid-loading">Loading diagram...</div>
	{/if}
</div>

<style>
	.mermaid-container {
		display: flex;
		justify-content: center;
		align-items: center;
		min-height: 100px;
		padding: var(--space-4);
		background: var(--color-bg-tertiary);
		border-radius: var(--radius-md);
		overflow: auto;
	}

	.mermaid-container :global(svg) {
		max-width: 100%;
		height: auto;
	}

	.mermaid-error {
		display: flex;
		align-items: center;
		gap: var(--space-2);
		color: var(--color-accent-warning);
		font-size: var(--font-size-sm);
	}

	.mermaid-loading {
		color: var(--color-text-muted);
		font-size: var(--font-size-sm);
	}
</style>
