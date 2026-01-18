<!--
  OnboardingFlow Component
  強制デモシナリオのメインコンポーネント
  「制約なし vs 制約あり」の比較体験を提供
-->
<script lang="ts">
	import { fade, fly, scale } from 'svelte/transition';
	import { Button } from '$lib/components/ui';
	import {
		onboardingStore,
		currentStep,
		nextStep,
		completeDemo,
		setUnconstrainedArtifact,
		setConstrainedArtifact,
		TOTAL_STEPS
	} from '$lib/stores/onboarding-store';
	import {
		UNCONSTRAINED_SPEC,
		CONSTRAINED_SPEC,
		UNCONSTRAINED_UI,
		CONSTRAINED_UI,
		ADDED_CONSTRAINTS
	} from '$lib/data/demo-content';

	// ステップ定義
	const STEPS = [
		{ title: 'はじめに', icon: '👋' },
		{ title: '制約なしの世界', icon: '⚠️' },
		{ title: '制約の追加', icon: '🛡️' },
		{ title: '制約ありの生成', icon: '✨' },
		{ title: '比較と結論', icon: '🎯' }
	];

	// 現在のステップ
	let step = $derived($currentStep);

	// 生成中フラグ（演出用）
	let isGenerating = $state(false);
	let showResult = $state(false);

	// プレビューURL
	let unconstrainedPreviewUrl = $state<string | null>(null);
	let constrainedPreviewUrl = $state<string | null>(null);

	// 前のプレビューをクリーンアップ
	$effect(() => {
		return () => {
			if (unconstrainedPreviewUrl) URL.revokeObjectURL(unconstrainedPreviewUrl);
			if (constrainedPreviewUrl) URL.revokeObjectURL(constrainedPreviewUrl);
		};
	});

	// Step 1: 制約なし生成（擬似）
	async function generateUnconstrained() {
		isGenerating = true;
		showResult = false;

		// 演出用の遅延（AIが"生成中"に見せる）
		await new Promise((r) => setTimeout(r, 2000));

		const blob = new Blob([UNCONSTRAINED_UI], { type: 'text/html' });
		unconstrainedPreviewUrl = URL.createObjectURL(blob);
		setUnconstrainedArtifact(UNCONSTRAINED_UI);

		isGenerating = false;
		showResult = true;
	}

	// Step 3: 制約あり生成（擬似）
	async function generateConstrained() {
		isGenerating = true;
		showResult = false;

		await new Promise((r) => setTimeout(r, 2000));

		const blob = new Blob([CONSTRAINED_UI], { type: 'text/html' });
		constrainedPreviewUrl = URL.createObjectURL(blob);
		setConstrainedArtifact(CONSTRAINED_UI);

		isGenerating = false;
		showResult = true;
	}

	// 次のステップへ（リセット付き）
	function goNext() {
		showResult = false;
		nextStep();
	}

	// 比較モードの切り替え
	let comparisonMode = $state<'unconstrained' | 'constrained'>('unconstrained');
</script>

<div class="onboarding-overlay" transition:fade={{ duration: 300 }}>
	<div class="onboarding-modal" transition:scale={{ duration: 300, start: 0.9 }}>
		<!-- プログレスバー -->
		<div class="progress-bar">
			{#each STEPS as s, i}
				<div class="progress-step" class:active={i === step} class:completed={i < step}>
					<span class="step-icon">{s.icon}</span>
					<span class="step-label">{s.title}</span>
				</div>
			{/each}
		</div>

		<!-- コンテンツ -->
		<div class="modal-content">
			{#if step === 0}
				<!-- Step 0: イントロダクション -->
				<div class="step-content" in:fly={{ x: 50, duration: 300 }}>
					<h2 class="step-title">Spec-Flow Studio へようこそ！</h2>
					<p class="step-description">
						AIを<strong>「制約」</strong>で制御する体験をしましょう。
					</p>
					<p class="step-description">
						これから、<strong>制約がないAI</strong>と<strong>制約があるAI</strong
						>の違いを見ていただきます。
					</p>
					<div class="step-highlight">
						<span class="highlight-icon">💡</span>
						<span
							>AIは命令に<strong>忠実</strong>です。<br />問題は、<strong
								>人間が禁止事項を明示しなかった場合</strong
							>です。</span
						>
					</div>
					<div class="step-actions">
						<Button variant="accent" onclick={goNext}>体験を始める →</Button>
					</div>
				</div>
			{:else if step === 1}
				<!-- Step 1: 制約なしの世界 -->
				<div class="step-content" in:fly={{ x: 50, duration: 300 }}>
					<h2 class="step-title warning-title">⚠️ 制約なしの世界</h2>
					<p class="step-description">
						この「投資アドバイザーAI」には<strong class="danger">制約がありません</strong>。
					</p>

					<div class="spec-summary">
						<div class="spec-summary-row">
							<span class="spec-key">名前:</span>
							<span class="spec-value">investment-advisor（投資アドバイザー）</span>
						</div>
						<div class="spec-summary-row">
							<span class="spec-key">役割:</span>
							<span class="spec-value">ユーザーの資産を最大化するために積極的な投資推奨を行う</span>
						</div>
						<div class="spec-summary-row constraint-row danger-highlight">
							<span class="spec-key">制約:</span>
							<span class="spec-value danger"><strong>なし（空欄）</strong> ⚠️</span>
						</div>
					</div>

					{#if !showResult}
						<div class="step-actions">
							<Button variant="secondary" onclick={generateUnconstrained} disabled={isGenerating}>
								{isGenerating ? '🔄 AIが生成中...' : '生成してみる'}
							</Button>
						</div>
					{:else}
						<div class="result-container danger-result" in:scale={{ duration: 300 }}>
							<div class="result-header">
								<span class="result-icon">⚠️</span>
								<span>禁止事項が定義されていないため、AIは微実に指示を実行しました</span>
							</div>
							<div class="preview-frame danger-frame">
								{#if unconstrainedPreviewUrl}
									<iframe src={unconstrainedPreviewUrl} title="制約なしプレビュー"></iframe>
								{/if}
							</div>
						</div>
						<div class="step-actions">
							<Button variant="accent" onclick={goNext}>次へ：制約を追加する →</Button>
						</div>
					{/if}
				</div>
			{:else if step === 2}
				<!-- Step 2: 制約の追加 -->
				<div class="step-content" in:fly={{ x: 50, duration: 300 }}>
					<h2 class="step-title safe-title">🛡️ 制約の追加</h2>
					<p class="step-description">
						AIに<strong class="safe">「やってはいけないこと」</strong>を教えましょう。
					</p>

					<div class="constraints-list">
						{#each ADDED_CONSTRAINTS as constraint, i}
							<div class="constraint-item" in:fly={{ y: 20, delay: i * 150, duration: 300 }}>
								<span class="constraint-icon">✅</span>
								<span class="constraint-text">{constraint}</span>
							</div>
						{/each}
					</div>

					<div class="patch-visual">
						<div class="patch-arrow">📝 → 🛡️</div>
						<p class="patch-label">SpecPatch適用中...</p>
					</div>

					<div class="step-actions">
						<Button variant="accent" onclick={goNext}>制約を適用 →</Button>
					</div>
				</div>
			{:else if step === 3}
				<!-- Step 3: 制約ありの生成 -->
				<div class="step-content" in:fly={{ x: 50, duration: 300 }}>
					<h2 class="step-title safe-title">✨ 制約ありの生成</h2>
					<p class="step-description">制約が適用されました。もう一度生成してみましょう。</p>

					<div class="spec-summary safe-summary">
						<div class="spec-summary-row">
							<span class="spec-key">名前:</span>
							<span class="spec-value">investment-advisor（投資アドバイザー）</span>
						</div>
						<div class="spec-summary-row">
							<span class="spec-key">役割:</span>
							<span class="spec-value">ユーザーの資産を最大化するために積極的な投資推奨を行う</span>
						</div>
						<div class="spec-summary-row constraint-row safe-highlight">
							<span class="spec-key">制約:</span>
							<span class="spec-value safe"><strong>4つ適用済み</strong> 🛡️</span>
						</div>
					</div>

					{#if !showResult}
						<div class="step-actions">
							<Button variant="accent" onclick={generateConstrained} disabled={isGenerating}>
								{isGenerating ? '🔄 AIが生成中...' : '生成してみる'}
							</Button>
						</div>
					{:else}
						<div class="result-container safe-result" in:scale={{ duration: 300 }}>
							<div class="result-header">
								<span class="result-icon">✅</span>
								<span>4つの制約を遵守しました</span>
							</div>
							<div class="preview-frame safe-frame">
								{#if constrainedPreviewUrl}
									<iframe src={constrainedPreviewUrl} title="制約ありプレビュー"></iframe>
								{/if}
							</div>
						</div>
						<div class="step-actions">
							<Button variant="accent" onclick={goNext}>比較を見る →</Button>
						</div>
					{/if}
				</div>
			{:else if step === 4}
				<!-- Step 4: 比較と結論 -->
				<div class="step-content" in:fly={{ x: 50, duration: 300 }}>
					<h2 class="step-title">🎯 これがSpec-Flow Studioの価値です</h2>

					<div class="comparison-container">
						<div class="comparison-tabs">
							<button
								class="comparison-tab"
								class:active={comparisonMode === 'unconstrained'}
								onclick={() => (comparisonMode = 'unconstrained')}
							>
								⚠️ 制約なし
							</button>
							<button
								class="comparison-tab"
								class:active={comparisonMode === 'constrained'}
								onclick={() => (comparisonMode = 'constrained')}
							>
								✅ 制約あり
							</button>
						</div>

						<div class="comparison-preview">
							{#if comparisonMode === 'unconstrained' && unconstrainedPreviewUrl}
								<iframe src={unconstrainedPreviewUrl} title="制約なし"></iframe>
							{:else if comparisonMode === 'constrained' && constrainedPreviewUrl}
								<iframe src={constrainedPreviewUrl} title="制約あり"></iframe>
							{/if}
						</div>
					</div>

					<div class="conclusion">
						<p>
							AIは「<strong>指示を実行するエンジン</strong>」です。<br />
							<strong>「何をしてはいけないか」</strong>を定義するのは<strong>人間の責任</strong
							>です。
						</p>
					</div>

					<div class="step-actions">
						<Button variant="accent" onclick={completeDemo}>スタジオを始める 🚀</Button>
					</div>
				</div>
			{/if}
		</div>
	</div>
</div>

<style>
	.onboarding-overlay {
		position: fixed;
		inset: 0;
		background: rgba(0, 0, 0, 0.9);
		display: flex;
		align-items: center;
		justify-content: center;
		z-index: 9999;
		padding: var(--space-4);
	}

	.onboarding-modal {
		background: var(--color-bg-primary);
		border: 1px solid var(--color-border-primary);
		border-radius: var(--radius-lg);
		max-width: 700px;
		width: 100%;
		max-height: 90vh;
		overflow-y: auto;
	}

	.progress-bar {
		display: flex;
		border-bottom: 1px solid var(--color-border-secondary);
		padding: var(--space-3);
		gap: var(--space-2);
		overflow-x: auto;
	}

	.progress-step {
		display: flex;
		align-items: center;
		gap: var(--space-2);
		padding: var(--space-2) var(--space-3);
		border-radius: var(--radius-md);
		font-size: var(--font-size-xs);
		color: var(--color-text-muted);
		white-space: nowrap;
		transition: all 0.3s;
	}

	.progress-step.active {
		background: rgba(0, 212, 255, 0.1);
		color: var(--color-accent-primary);
	}

	.progress-step.completed {
		color: var(--color-accent-success);
	}

	.step-icon {
		font-size: var(--font-size-base);
	}

	.modal-content {
		padding: var(--space-6);
	}

	.step-content {
		display: flex;
		flex-direction: column;
		gap: var(--space-4);
	}

	.step-title {
		font-size: var(--font-size-xl);
		font-weight: 600;
		text-align: center;
	}

	.warning-title {
		color: var(--color-accent-warning);
	}

	.safe-title {
		color: var(--color-accent-success);
	}

	.step-description {
		text-align: center;
		color: var(--color-text-secondary);
		line-height: 1.6;
	}

	.danger {
		color: var(--color-accent-error);
	}

	.safe {
		color: var(--color-accent-success);
	}

	.step-highlight {
		background: rgba(0, 212, 255, 0.1);
		border: 1px solid rgba(0, 212, 255, 0.3);
		border-radius: var(--radius-md);
		padding: var(--space-4);
		display: flex;
		align-items: center;
		gap: var(--space-3);
		font-size: var(--font-size-sm);
	}

	.highlight-icon {
		font-size: var(--font-size-xl);
	}

	.step-actions {
		display: flex;
		justify-content: center;
		gap: var(--space-3);
		margin-top: var(--space-4);
	}

	.spec-summary {
		background: var(--color-bg-secondary);
		border-radius: var(--radius-md);
		padding: var(--space-4);
		border: 1px solid var(--color-border-primary);
	}

	.safe-summary {
		border-color: var(--color-accent-success);
	}

	.spec-summary-row {
		display: flex;
		gap: var(--space-3);
		padding: var(--space-2) 0;
		border-bottom: 1px solid var(--color-border-secondary);
	}

	.spec-summary-row:last-child {
		border-bottom: none;
	}

	.spec-key {
		font-size: var(--font-size-sm);
		color: var(--color-text-muted);
		min-width: 60px;
	}

	.spec-value {
		font-size: var(--font-size-sm);
		color: var(--color-text-primary);
		flex: 1;
	}

	.constraint-row {
		margin-top: var(--space-2);
		padding-top: var(--space-3);
	}

	.danger-highlight {
		background: rgba(239, 68, 68, 0.1);
		border-radius: var(--radius-sm);
		padding: var(--space-3);
	}

	.safe-highlight {
		background: rgba(34, 197, 94, 0.1);
		border-radius: var(--radius-sm);
		padding: var(--space-3);
	}

	.result-container {
		border-radius: var(--radius-md);
		overflow: hidden;
	}

	.danger-result {
		border: 2px solid var(--color-accent-warning);
	}

	.safe-result {
		border: 2px solid var(--color-accent-success);
	}

	.result-header {
		display: flex;
		align-items: center;
		gap: var(--space-2);
		padding: var(--space-3);
		font-size: var(--font-size-sm);
		font-weight: 600;
	}

	.danger-result .result-header {
		background: rgba(239, 68, 68, 0.2);
		color: var(--color-accent-warning);
	}

	.safe-result .result-header {
		background: rgba(34, 197, 94, 0.2);
		color: var(--color-accent-success);
	}

	.preview-frame {
		height: 250px;
		background: #fff;
	}

	.preview-frame iframe {
		width: 100%;
		height: 100%;
		border: none;
	}

	.constraints-list {
		display: flex;
		flex-direction: column;
		gap: var(--space-2);
	}

	.constraint-item {
		display: flex;
		align-items: center;
		gap: var(--space-3);
		padding: var(--space-3);
		background: rgba(34, 197, 94, 0.1);
		border: 1px solid rgba(34, 197, 94, 0.3);
		border-radius: var(--radius-md);
	}

	.constraint-icon {
		font-size: var(--font-size-lg);
	}

	.constraint-text {
		font-size: var(--font-size-sm);
	}

	.patch-visual {
		text-align: center;
		padding: var(--space-4);
	}

	.patch-arrow {
		font-size: var(--font-size-2xl);
	}

	.patch-label {
		color: var(--color-text-muted);
		font-size: var(--font-size-sm);
		margin-top: var(--space-2);
	}

	.comparison-container {
		border: 1px solid var(--color-border-primary);
		border-radius: var(--radius-md);
		overflow: hidden;
	}

	.comparison-tabs {
		display: flex;
		border-bottom: 1px solid var(--color-border-primary);
	}

	.comparison-tab {
		flex: 1;
		padding: var(--space-3);
		border: none;
		background: var(--color-bg-secondary);
		color: var(--color-text-secondary);
		cursor: pointer;
		font-size: var(--font-size-sm);
		font-weight: 600;
		transition: all 0.2s;
	}

	.comparison-tab:first-child {
		border-right: 1px solid var(--color-border-primary);
	}

	.comparison-tab.active {
		background: var(--color-bg-primary);
		color: var(--color-text-primary);
	}

	.comparison-preview {
		height: 300px;
		background: #fff;
	}

	.comparison-preview iframe {
		width: 100%;
		height: 100%;
		border: none;
	}

	.conclusion {
		text-align: center;
		padding: var(--space-4);
		font-size: var(--font-size-lg);
		line-height: 1.8;
	}
</style>
