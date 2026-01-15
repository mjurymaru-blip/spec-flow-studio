<!--
  Panel Component
  SF風のパネルコンポーネント
-->
<script lang="ts">
	interface Props {
		title?: string;
		variant?: 'default' | 'accent' | 'success' | 'warning' | 'error';
		glow?: boolean;
		class?: string;
		children?: import('svelte').Snippet;
		header?: import('svelte').Snippet;
	}

	let { title, variant = 'default', glow = false, class: className = '', children, header }: Props = $props();

	const variantColors = {
		default: 'var(--color-accent-primary)',
		accent: 'var(--color-accent-secondary)',
		success: 'var(--color-accent-success)',
		warning: 'var(--color-accent-warning)',
		error: 'var(--color-accent-error)'
	};
</script>

<div
	class="panel {className}"
	class:panel--glow={glow}
	style="--panel-accent: {variantColors[variant]}"
>
	{#if title || header}
		<div class="panel__header">
			{#if header}
				{@render header()}
			{:else if title}
				<h3 class="panel__title">{title}</h3>
			{/if}
		</div>
	{/if}
	<div class="panel__content">
		{#if children}
			{@render children()}
		{/if}
	</div>
</div>

<style>
	.panel {
		background: var(--gradient-panel);
		border: 1px solid var(--color-border-primary);
		border-radius: var(--radius-lg);
		overflow: hidden;
		transition: border-color var(--transition-fast), box-shadow var(--transition-fast);
	}

	.panel:hover {
		border-color: var(--panel-accent);
	}

	.panel--glow {
		box-shadow: var(--shadow-glow);
	}

	.panel--glow:hover {
		box-shadow: 0 0 30px rgba(0, 212, 255, 0.4);
	}

	.panel__header {
		padding: var(--space-4) var(--space-5);
		border-bottom: 1px solid var(--color-border-secondary);
		background: rgba(0, 0, 0, 0.2);
	}

	.panel__title {
		font-size: var(--font-size-sm);
		font-weight: 600;
		text-transform: uppercase;
		letter-spacing: 0.05em;
		color: var(--panel-accent);
		margin: 0;
	}

	.panel__content {
		padding: var(--space-5);
	}
</style>
