<!--
  Sidebar Component
  ナビゲーションサイドバー
-->
<script lang="ts">
	import { page } from '$app/stores';

	const navItems = [
		{ href: '/', label: 'ダッシュボード', icon: '◈' },
		{ href: '/editor', label: 'エディタ', icon: '✎' },
		{ href: '/viewer', label: 'ビューア', icon: '◎' },
		{ href: '/history', label: '履歴', icon: '⧖' },
		{ href: '/api-docs', label: 'API Docs', icon: '📚' },
		{ href: '/settings', label: '設定', icon: '⚙' }
	];
</script>

<aside class="sidebar">
	<div class="sidebar__logo">
		<span class="sidebar__logo-icon">◇</span>
		<span class="sidebar__logo-text">Spec-Flow</span>
	</div>

	<nav class="sidebar__nav">
		{#each navItems as item}
			<a
				href={item.href}
				class="sidebar__link"
				class:sidebar__link--active={$page.url.pathname === item.href}
			>
				<span class="sidebar__link-icon">{item.icon}</span>
				<span class="sidebar__link-label">{item.label}</span>
			</a>
		{/each}
	</nav>

	<div class="sidebar__footer">
		<span class="sidebar__version">v0.1.0</span>
	</div>
</aside>

<style>
	.sidebar {
		position: fixed;
		top: 0;
		left: 0;
		width: var(--sidebar-width);
		height: 100vh;
		background: var(--gradient-panel);
		border-right: 1px solid var(--color-border-primary);
		display: flex;
		flex-direction: column;
		z-index: 100;
	}

	.sidebar__logo {
		padding: var(--space-5);
		display: flex;
		align-items: center;
		gap: var(--space-3);
		border-bottom: 1px solid var(--color-border-secondary);
	}

	.sidebar__logo-icon {
		font-size: var(--font-size-2xl);
		color: var(--color-accent-primary);
		animation: pulse-glow 3s ease-in-out infinite;
	}

	.sidebar__logo-text {
		font-size: var(--font-size-lg);
		font-weight: 600;
		color: var(--color-text-primary);
	}

	.sidebar__nav {
		flex: 1;
		padding: var(--space-4);
		display: flex;
		flex-direction: column;
		gap: var(--space-1);
	}

	.sidebar__link {
		display: flex;
		align-items: center;
		gap: var(--space-3);
		padding: var(--space-3) var(--space-4);
		border-radius: var(--radius-md);
		color: var(--color-text-secondary);
		text-decoration: none;
		transition: all var(--transition-fast);
	}

	.sidebar__link:hover {
		background: var(--color-bg-hover);
		color: var(--color-text-primary);
	}

	.sidebar__link--active {
		background: rgba(0, 212, 255, 0.1);
		color: var(--color-accent-primary);
		border-left: 2px solid var(--color-accent-primary);
	}

	.sidebar__link-icon {
		font-size: var(--font-size-lg);
		width: 24px;
		text-align: center;
	}

	.sidebar__link-label {
		font-size: var(--font-size-sm);
		font-weight: 500;
	}

	.sidebar__footer {
		padding: var(--space-4);
		border-top: 1px solid var(--color-border-secondary);
		text-align: center;
	}

	.sidebar__version {
		font-size: var(--font-size-xs);
		color: var(--color-text-muted);
		font-family: var(--font-mono);
	}

	@keyframes pulse-glow {
		0%,
		100% {
			text-shadow: 0 0 5px var(--color-accent-primary);
		}
		50% {
			text-shadow: 0 0 15px var(--color-accent-primary);
		}
	}
</style>
