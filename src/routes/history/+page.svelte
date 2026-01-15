<!--
  History Page - 差分履歴
  Phase 4で本格実装
-->
<script lang="ts">
	import { Panel } from '$lib/components/ui';
</script>

<div class="page">
	<header class="page__header">
		<h1>履歴</h1>
		<p class="page__subtitle">SpecPatch 差分履歴</p>
	</header>

	<Panel title="差分履歴">
		<div class="placeholder">
			<span class="placeholder__icon">⧖</span>
			<p class="placeholder__text">Phase 4 で実装予定</p>
			<ul class="placeholder__features">
				<li>パッチ一覧</li>
				<li>差分ビジュアライズ</li>
				<li>Rollback機能</li>
				<li>Aether Console同期</li>
			</ul>
		</div>
	</Panel>
</div>

<style>
	.page {
		animation: fade-in var(--transition-base) ease-out;
	}

	.page__header {
		margin-bottom: var(--space-8);
	}

	.page__header h1 {
		margin-bottom: var(--space-2);
	}

	.page__subtitle {
		color: var(--color-text-muted);
	}

	.placeholder {
		display: flex;
		flex-direction: column;
		align-items: center;
		text-align: center;
		padding: var(--space-10);
		gap: var(--space-4);
	}

	.placeholder__icon {
		font-size: 3rem;
		color: var(--color-accent-primary);
		opacity: 0.5;
	}

	.placeholder__text {
		font-size: var(--font-size-lg);
		color: var(--color-text-secondary);
	}

	.placeholder__features {
		list-style: none;
		display: flex;
		flex-wrap: wrap;
		justify-content: center;
		gap: var(--space-2);
		margin-top: var(--space-4);
	}

	.placeholder__features li {
		padding: var(--space-2) var(--space-4);
		background: var(--color-bg-tertiary);
		border-radius: var(--radius-md);
		font-size: var(--font-size-sm);
		color: var(--color-text-muted);
	}
</style>
