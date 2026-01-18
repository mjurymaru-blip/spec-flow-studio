<!--
  API Documentation Page
  Swagger UIを使用してAPIドキュメントを表示
-->
<script lang="ts">
	import { onMount } from 'svelte';
	import { browser } from '$app/environment';

	let container: HTMLElement;

	onMount(async () => {
		if (!browser) return;

		// Swagger UI を動的にインポート
		const SwaggerUI = (await import('swagger-ui-dist')).default;

		// CSSを読み込み
		const link = document.createElement('link');
		link.rel = 'stylesheet';
		link.href = '/swagger-ui.css';
		document.head.appendChild(link);

		// Swagger UIを初期化
		SwaggerUI({
			dom_id: '#swagger-ui',
			url: '/openapi.json',
			deepLinking: true,
			presets: [SwaggerUI.presets.apis],
			layout: 'BaseLayout',
			defaultModelsExpandDepth: 2,
			docExpansion: 'list'
		});
	});
</script>

<svelte:head>
	<title>API Documentation - Spec-Flow Studio</title>
</svelte:head>

<div class="api-docs-page">
	<header class="page-header">
		<h1>📚 API Documentation</h1>
		<p class="subtitle">Spec-Flow Studio 内部API仕様</p>
	</header>

	<div id="swagger-ui" bind:this={container}></div>
</div>

<style>
	.api-docs-page {
		animation: fade-in var(--transition-base) ease-out;
	}

	.page-header {
		margin-bottom: var(--space-6);
	}

	.page-header h1 {
		margin-bottom: var(--space-2);
	}

	.subtitle {
		color: var(--color-text-muted);
		font-size: var(--font-size-sm);
	}

	#swagger-ui {
		background: var(--color-bg-secondary);
		border-radius: var(--radius-lg);
		padding: var(--space-4);
	}

	/* Swagger UI テーマカスタマイズ */
	:global(.swagger-ui) {
		font-family: var(--font-sans) !important;
	}

	:global(.swagger-ui .topbar) {
		display: none !important;
	}

	:global(.swagger-ui .info .title) {
		color: var(--color-text-primary) !important;
	}

	:global(.swagger-ui .opblock-tag) {
		color: var(--color-text-primary) !important;
		border-bottom-color: var(--color-border-primary) !important;
	}

	:global(.swagger-ui .opblock) {
		border-radius: var(--radius-md) !important;
		margin-bottom: var(--space-3) !important;
	}

	:global(.swagger-ui .opblock .opblock-summary) {
		border-radius: var(--radius-md) !important;
	}

	:global(.swagger-ui .btn) {
		border-radius: var(--radius-md) !important;
	}
</style>
