<script lang="ts">
	import '../app.css';
	import Sidebar from '$lib/components/Sidebar.svelte';
	import StatusBar from '$lib/components/StatusBar.svelte';

	let { children } = $props();
</script>

<svelte:head>
	<title>Spec-Flow Studio</title>
</svelte:head>

<div class="app">
	<Sidebar />
	<main class="main">
		{@render children()}
	</main>
	<StatusBar />
</div>

<style>
	.app {
		min-height: 100vh;
		background: var(--color-bg-primary);
	}

	.main {
		margin-left: var(--sidebar-width);
		min-height: 100vh;
		padding: var(--space-6);
		padding-bottom: calc(var(--statusbar-height) + var(--space-6));
	}

	/* 背景のグロー効果 */
	.app::before {
		content: '';
		position: fixed;
		top: 0;
		left: 0;
		right: 0;
		bottom: 0;
		background: var(--gradient-glow);
		pointer-events: none;
		z-index: -1;
	}
</style>
