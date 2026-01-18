<!--
  Dashboard Page
  ダッシュボード - 現在のSpec名、Artifact一覧、接続状態を表示
-->
<script lang="ts">
	import { Panel, Button, StatusIndicator } from '$lib/components/ui';
	import { OnboardingFlow } from '$lib/components/onboarding';
	import { specs, currentSpecName, hasSpec } from '$lib/stores/spec-store';
	import { latestArtifacts, artifactCounts, hasArtifacts } from '$lib/stores/artifact-store';
	import { connectionStatus, patchCount } from '$lib/stores/integration-store';
	import { isOnboardingActive } from '$lib/stores/onboarding-store';

	const statusMap = {
		disconnected: 'offline',
		connecting: 'warning',
		connected: 'success',
		error: 'error'
	} as const;

	const artifactTypeLabels = {
		'ui-mock': 'UIモック',
		'api-spec': 'API仕様',
		'test-case': 'テストケース',
		'use-case': 'ユースケース'
	};

	let currentStatus = $derived(statusMap[$connectionStatus]);
</script>

<!-- 強制デモシナリオ（初回のみ） -->
{#if $isOnboardingActive}
	<OnboardingFlow />
{/if}

<div class="dashboard">
	<header class="dashboard__header">
		<h1>ダッシュボード</h1>
		<p class="dashboard__subtitle">Spec-Flow Studio へようこそ</p>
	</header>

	<div class="dashboard__grid">
		<!-- 現在のSpec -->
		<Panel title="現在の仕様" variant="accent" glow={$hasSpec}>
			{#if $hasSpec}
				<div class="spec-info">
					<div class="spec-info__name">{$currentSpecName || 'Untitled'}</div>
					<div class="spec-info__count">{$specs.length} エージェント</div>
					<div class="spec-info__agents">
						{#each $specs as agent}
							<span class="spec-info__agent">{agent.displayName}</span>
						{/each}
					</div>
				</div>
			{:else}
				<div class="empty-state">
					<span class="empty-state__icon">◇</span>
					<p class="empty-state__text">仕様が読み込まれていません</p>
					<Button variant="primary" size="sm">エディタを開く</Button>
				</div>
			{/if}
		</Panel>

		<!-- 接続状態 -->
		<Panel title="Aether Console 接続">
			<div class="connection-info">
				<StatusIndicator
					status={currentStatus}
					pulse={$connectionStatus === 'connected'}
					size="lg"
				/>
				<div class="connection-info__details">
					{#if $connectionStatus === 'connected'}
						<p>Aether Console と接続中</p>
						<span class="connection-info__patches">{$patchCount} パッチ</span>
					{:else if $connectionStatus === 'connecting'}
						<p>接続を試行中...</p>
					{:else if $connectionStatus === 'error'}
						<p class="text-error">接続エラー</p>
						<Button variant="secondary" size="sm">再接続</Button>
					{:else}
						<p>未接続</p>
						<Button variant="primary" size="sm">接続</Button>
					{/if}
				</div>
			</div>
		</Panel>

		<!-- 生成物サマリー -->
		<Panel title="生成物">
			{#if $hasArtifacts}
				<div class="artifacts-summary">
					<div class="artifacts-summary__counts">
						{#each Object.entries($artifactCounts) as [type, count]}
							<div class="artifacts-summary__item">
								<span class="artifacts-summary__count">{count}</span>
								<span class="artifacts-summary__type"
									>{artifactTypeLabels[type as keyof typeof artifactTypeLabels]}</span
								>
							</div>
						{/each}
					</div>
				</div>
			{:else}
				<div class="empty-state">
					<span class="empty-state__icon">◎</span>
					<p class="empty-state__text">生成物はありません</p>
					<p class="empty-state__hint">エディタで仕様を作成し、AIで生成してください</p>
				</div>
			{/if}
		</Panel>

		<!-- 最近の生成物 -->
		<Panel title="最近の生成物" class="dashboard__recent">
			{#if $latestArtifacts.length > 0}
				<ul class="recent-list">
					{#each $latestArtifacts as artifact}
						<li class="recent-list__item">
							<span class="recent-list__type">{artifactTypeLabels[artifact.type]}</span>
							<span class="recent-list__name">{artifact.name}</span>
							<span class="recent-list__time font-mono">
								{new Date(artifact.generatedAt).toLocaleDateString('ja-JP')}
							</span>
						</li>
					{/each}
				</ul>
			{:else}
				<p class="text-muted">まだ生成物がありません</p>
			{/if}
		</Panel>
	</div>
</div>

<style>
	.dashboard {
		animation: fade-in var(--transition-base) ease-out;
	}

	.dashboard__header {
		margin-bottom: var(--space-8);
	}

	.dashboard__header h1 {
		margin-bottom: var(--space-2);
	}

	.dashboard__subtitle {
		color: var(--color-text-muted);
	}

	.dashboard__grid {
		display: grid;
		grid-template-columns: repeat(2, 1fr);
		gap: var(--space-6);
	}

	.dashboard__recent {
		grid-column: span 2;
	}

	/* Spec Info */
	.spec-info__name {
		font-size: var(--font-size-xl);
		font-weight: 600;
		color: var(--color-accent-primary);
		margin-bottom: var(--space-2);
	}

	.spec-info__count {
		font-size: var(--font-size-sm);
		color: var(--color-text-secondary);
		margin-bottom: var(--space-3);
	}

	.spec-info__agents {
		display: flex;
		flex-wrap: wrap;
		gap: var(--space-2);
	}

	.spec-info__agent {
		padding: var(--space-1) var(--space-2);
		background: var(--color-bg-tertiary);
		border-radius: var(--radius-sm);
		font-size: var(--font-size-xs);
		color: var(--color-text-secondary);
	}

	/* Connection Info */
	.connection-info {
		display: flex;
		flex-direction: column;
		gap: var(--space-4);
	}

	.connection-info__details {
		display: flex;
		flex-direction: column;
		gap: var(--space-2);
	}

	.connection-info__patches {
		font-size: var(--font-size-sm);
		color: var(--color-text-muted);
		font-family: var(--font-mono);
	}

	/* Artifacts Summary */
	.artifacts-summary__counts {
		display: grid;
		grid-template-columns: repeat(2, 1fr);
		gap: var(--space-4);
	}

	.artifacts-summary__item {
		display: flex;
		flex-direction: column;
		align-items: center;
		padding: var(--space-4);
		background: var(--color-bg-tertiary);
		border-radius: var(--radius-md);
	}

	.artifacts-summary__count {
		font-size: var(--font-size-2xl);
		font-weight: 600;
		color: var(--color-accent-primary);
		font-family: var(--font-mono);
	}

	.artifacts-summary__type {
		font-size: var(--font-size-xs);
		color: var(--color-text-muted);
		margin-top: var(--space-1);
	}

	/* Empty State */
	.empty-state {
		display: flex;
		flex-direction: column;
		align-items: center;
		text-align: center;
		padding: var(--space-6);
		gap: var(--space-3);
	}

	.empty-state__icon {
		font-size: var(--font-size-3xl);
		color: var(--color-text-muted);
	}

	.empty-state__text {
		color: var(--color-text-secondary);
	}

	.empty-state__hint {
		font-size: var(--font-size-sm);
		color: var(--color-text-muted);
	}

	/* Recent List */
	.recent-list {
		list-style: none;
	}

	.recent-list__item {
		display: flex;
		align-items: center;
		gap: var(--space-4);
		padding: var(--space-3) 0;
		border-bottom: 1px solid var(--color-border-secondary);
	}

	.recent-list__item:last-child {
		border-bottom: none;
	}

	.recent-list__type {
		font-size: var(--font-size-xs);
		color: var(--color-accent-primary);
		background: rgba(0, 212, 255, 0.1);
		padding: var(--space-1) var(--space-2);
		border-radius: var(--radius-sm);
		min-width: 80px;
		text-align: center;
	}

	.recent-list__name {
		flex: 1;
		color: var(--color-text-primary);
	}

	.recent-list__time {
		font-size: var(--font-size-xs);
		color: var(--color-text-muted);
	}

	/* Responsive */
	@media (max-width: 900px) {
		.dashboard__grid {
			grid-template-columns: 1fr;
		}

		.dashboard__recent {
			grid-column: span 1;
		}
	}
</style>
