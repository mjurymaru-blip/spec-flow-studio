<!--
  Editor Page - Spec-Kit エディタ
  Phase 2で本格実装
-->
<script lang="ts">
	import { Panel } from '$lib/components/ui';
</script>

<div class="page">
	<header class="page__header">
		<h1>エディタ</h1>
		<p class="page__subtitle">Spec-Kit 仕様エディタ</p>
	</header>

	<Panel title="Spec-Kit エディタ" variant="accent">
		<div class="placeholder">
			<span class="placeholder__icon">✎</span>
			<p class="placeholder__text">Phase 2 で実装予定</p>
			<ul class="placeholder__features">
				<li>YAMLシンタックスハイライト</li>
				<li>スキーマバリデーション</li>
				<li>制約可視化パネル</li>
				<li>テンプレート機能</li>
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
