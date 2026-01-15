<!--
  Editor Page
  Spec-Kit エディタの実装
-->
<script lang="ts">
	import { onMount } from 'svelte';
	import { Panel, Button, StatusIndicator } from '$lib/components/ui';
	import { SpecEditor, ConstraintPanel } from '$lib/components/editor';
	import {
		parseSpecYaml,
		getYamlErrors,
		AGENT_TEMPLATE,
		ANALYZER_TEMPLATE
	} from '$lib/utils/yaml-utils';
	import { saveSpecYaml, loadSpecYaml, loadFromStorage } from '$lib/utils/storage-utils';
	import { setSpecs, specs } from '$lib/stores/spec-store';
	import { settings } from '$lib/stores/settings-store';
	import { session } from '$lib/stores/session-store';
	import { decryptData } from '$lib/utils/crypto-utils';
	import { addArtifact } from '$lib/stores/artifact-store';
	import type { YamlError } from '$lib/utils/yaml-utils';
	import type { ArtifactType } from '$lib/types';
	import { goto } from '$app/navigation';

	// 状態
	let yamlContent = $state('');
	let yamlErrors = $state<YamlError[]>([]);
	let isDirty = $state(false);
	let currentTemplate = $state('default');

	// 生成モーダル状態
	let showGenerateModal = $state(false);
	let isGenerating = $state(false);
	let selectedArtifactType = $state<ArtifactType>('ui-mock');
	let tempPassword = $state(''); // セッションにない場合の一時入力用

	// 初期化
	onMount(() => {
		const saved = loadSpecYaml();
		if (saved.yaml) {
			yamlContent = saved.yaml;
			validateYaml(saved.yaml);
		} else {
			yamlContent = AGENT_TEMPLATE;
			validateYaml(AGENT_TEMPLATE);
		}
	});

	// YAMLの検証とパース
	function validateYaml(content: string) {
		const errors = getYamlErrors(content);
		yamlErrors = errors;

		if (errors.length === 0) {
			try {
				const parsedSpecs = parseSpecYaml(content);
				setSpecs(parsedSpecs, 'draft-spec'); // ストア更新
			} catch (e) {
				console.error('Spec parse error:', e);
			}
		}
	}

	// エディタ変更ハンドラ
	function handleChange(newContent: string) {
		yamlContent = newContent;
		isDirty = true;
		validateYaml(newContent);
		// 自動保存 (簡易)
		saveSpecYaml(newContent, 'draft-spec');
	}

	// テンプレート適用
	function applyTemplate() {
		if (confirm('現在の内容を上書きしてテンプレートを適用しますか？')) {
			if (currentTemplate === 'analyzer') {
				yamlContent = ANALYZER_TEMPLATE;
			} else {
				yamlContent = AGENT_TEMPLATE;
			}
			validateYaml(yamlContent);
			saveSpecYaml(yamlContent, 'draft-spec');
			isDirty = false;
		}
	}

	// 生成処理の開始
	function startGeneration() {
		if ($specs.length === 0) {
			alert('有効なエージェント仕様がありません');
			return;
		}
		if (!$settings.hasApiKey) {
			alert('APIキーが設定されていません。設定ページで設定してください。');
			goto('/settings');
			return;
		}
		showGenerateModal = true;
	}

	// Artifact生成実行
	async function handleGenerate() {
		// APIキーの取得（復号化）
		let apiKey = '';
		try {
			const password = $session.encryptionPassword || tempPassword;
			if (!password) {
				alert('APIキーの保護パスワードを入力してください');
				return;
			}

			const encryptedKey = loadFromStorage('spec-flow-studio:api-key-encrypted', '');
			if (!encryptedKey) {
				throw new Error('暗号化されたAPIキーが見つかりません');
			}

			// 復号化試行
			apiKey = await decryptData(encryptedKey, password);

			// 成功したらセッションにパスワード保存
			if (!$session.encryptionPassword) {
				session.setPassword(password);
			}
		} catch (error) {
			console.error(error);
			alert('パスワードが間違っているか、復号化に失敗しました');
			return;
		}

		isGenerating = true;
		try {
			// 最初のAgentSpecを使用（複数対応は今後）
			const targetSpec = $specs[0];

			const response = await fetch('/api/generate', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
					'x-api-key': apiKey
				},
				body: JSON.stringify({
					spec: targetSpec,
					artifactType: selectedArtifactType,
					model: $settings.geminiModel
				})
			});

			if (!response.ok) {
				const error = await response.json();
				throw new Error(error.error || 'Generation failed');
			}

			const { content } = await response.json();

			// Artifactストアに追加
			addArtifact({
				id: crypto.randomUUID(),
				type: selectedArtifactType,
				name: `${targetSpec.displayName} - ${selectedArtifactType}`,
				content: content,
				generatedAt: new Date().toISOString(),
				specId: targetSpec.name
			});

			showGenerateModal = false;
			alert('生成が完了しました！ビューアで確認できます。');
			goto('/viewer'); // ビューアへ遷移
		} catch (error) {
			console.error('Generation error:', error);
			alert(`生成エラー: ${error instanceof Error ? error.message : 'Unknown error'}`);
		} finally {
			isGenerating = false;
			tempPassword = '';
		}
	}
</script>

<div class="editor-page">
	<header class="editor-header">
		<div class="header-left">
			<h1>Spec Editor</h1>
			<StatusIndicator
				status={yamlErrors.length === 0 ? 'success' : 'error'}
				label={yamlErrors.length === 0 ? 'Valid Spec' : `${yamlErrors.length} Errors`}
			/>
		</div>
		<div class="header-right">
			<select bind:value={currentTemplate} class="template-select" title="テンプレート選択">
				<option value="default">Default Template</option>
				<option value="analyzer">Analyzer Agent</option>
			</select>
			<Button variant="secondary" size="sm" onclick={applyTemplate}>Load Template</Button>
			<Button
				variant="accent"
				size="sm"
				disabled={yamlErrors.length > 0 || isGenerating}
				onclick={startGeneration}
			>
				✨ Generate Artifacts
			</Button>
		</div>
	</header>

	<div class="editor-layout">
		<!-- 左側: YAMLエディタ -->
		<div class="editor-main">
			<SpecEditor bind:value={yamlContent} onChange={handleChange} />
		</div>

		<!-- 右側: プレビュー & 情報 -->
		<div class="editor-sidebar">
			<!-- 制約パネル -->
			<div class="sidebar-section">
				<ConstraintPanel specs={$specs} />
			</div>

			<!-- エラーパネル (エラー時のみ表示) -->
			{#if yamlErrors.length > 0}
				<div class="sidebar-section">
					<Panel title="YAML Errors" variant="error" glow>
						<ul class="error-list">
							{#each yamlErrors as error}
								<li class="error-item">
									<span class="error-line">Line {error.line + 1}:</span>
									<span class="error-msg">{error.message}</span>
								</li>
							{/each}
						</ul>
					</Panel>
				</div>
			{/if}

			<!-- パース結果プレビュー (簡易) -->
			<div class="sidebar-section spec-preview">
				<Panel title="Structure Preview">
					<div class="preview-content">
						{#each $specs as agent}
							<div class="agent-preview">
								<span class="agent-icon"
									>{#if agent.role.includes('解析') || agent.displayName.includes('Analyzer')}🔍{:else}🤖{/if}</span
								>
								<span class="agent-name">{agent.displayName}</span>
							</div>
						{/each}
						{#if $specs.length === 0 && yamlErrors.length === 0}
							<p class="text-muted text-center text-sm">No valid agents found</p>
						{/if}
					</div>
				</Panel>
			</div>
		</div>
	</div>

	<!-- 生成モーダル -->
	{#if showGenerateModal}
		<div class="modal-backdrop">
			<div class="modal">
				<h2 class="modal-title">Generate Artifacts</h2>

				<div class="modal-body">
					<div class="form-group">
						<label for="artifactType">生成タイプ</label>
						<select id="artifactType" bind:value={selectedArtifactType} class="form-select">
							<option value="ui-mock">UI Mock (HTML/Tailwind)</option>
							<option value="api-spec">API Specification (OpenAPI)</option>
						</select>
					</div>

					{#if !$session.encryptionPassword}
						<div class="form-group">
							<label for="password">暗号化パスワード</label>
							<input
								id="password"
								type="password"
								bind:value={tempPassword}
								placeholder="APIキー保護パスワードを入力"
								class="form-input"
							/>
							<p class="help-text">APIキーを復号化するために必要です。</p>
						</div>
					{/if}

					<div class="modal-info">
						<p>対象: <strong>{$specs[0]?.displayName || 'Agent'}</strong></p>
						<p>モデル: <strong>{$settings.geminiModel}</strong></p>
					</div>
				</div>

				<div class="modal-footer">
					<Button variant="ghost" onclick={() => (showGenerateModal = false)}>キャンセル</Button>
					<Button
						variant="accent"
						loading={isGenerating}
						disabled={isGenerating || (!$session.encryptionPassword && !tempPassword)}
						onclick={handleGenerate}
					>
						生成開始
					</Button>
				</div>
			</div>
		</div>
	{/if}
</div>

<style>
	.editor-page {
		height: calc(100vh - var(--header-height)); /* 調整 */
		display: flex;
		flex-direction: column;
		gap: var(--space-4);
		animation: fade-in var(--transition-base) ease-out;
		position: relative;
	}

	.editor-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		height: var(--space-10);
	}

	.header-left {
		display: flex;
		align-items: center;
		gap: var(--space-4);
	}

	.header-right {
		display: flex;
		align-items: center;
		gap: var(--space-3);
	}

	.template-select {
		padding: var(--space-2) var(--space-3);
		background: var(--color-bg-tertiary);
		border: 1px solid var(--color-border-primary);
		border-radius: var(--radius-md);
		color: var(--color-text-primary);
		font-family: var(--font-sans);
		font-size: var(--font-size-sm);
	}

	.editor-layout {
		flex: 1;
		display: grid;
		grid-template-columns: 1fr 300px;
		gap: var(--space-4);
		min-height: 0; /* Grid overflow対策 */
	}

	.editor-main {
		height: 100%;
		min-height: 0;
	}

	.editor-sidebar {
		display: flex;
		flex-direction: column;
		gap: var(--space-4);
		overflow-y: auto;
		height: 100%;
	}

	.sidebar-section {
		flex-shrink: 0;
	}

	/* Errors */
	.error-list {
		list-style: none;
		font-size: var(--font-size-xs);
		color: var(--color-accent-error);
	}

	.error-item {
		margin-bottom: var(--space-2);
		padding-bottom: var(--space-2);
		border-bottom: 1px solid rgba(239, 68, 68, 0.2);
	}

	.error-item:last-child {
		border-bottom: none;
		margin-bottom: 0;
		padding-bottom: 0;
	}

	.error-line {
		font-weight: bold;
		margin-right: var(--space-2);
	}

	/* Preview */
	.preview-content {
		display: flex;
		flex-direction: column;
		gap: var(--space-2);
	}

	.agent-preview {
		display: flex;
		align-items: center;
		gap: var(--space-2);
		padding: var(--space-2);
		background: var(--color-bg-primary);
		border-radius: var(--radius-sm);
		border: 1px solid var(--color-border-secondary);
	}

	.agent-name {
		font-size: var(--font-size-sm);
		font-weight: 500;
	}

	/* Responsive */
	@media (max-width: 1024px) {
		.editor-layout {
			grid-template-columns: 1fr;
			grid-template-rows: 1fr auto;
		}

		.editor-sidebar {
			height: auto;
			max-height: 300px;
		}
	}

	/* Modal */
	.modal-backdrop {
		position: fixed;
		top: 0;
		left: 0;
		right: 0;
		bottom: 0;
		background: rgba(0, 0, 0, 0.7);
		backdrop-filter: blur(4px);
		display: flex;
		align-items: center;
		justify-content: center;
		z-index: 1000;
	}

	.modal {
		background: var(--color-bg-secondary);
		border: 1px solid var(--color-border-primary);
		border-radius: var(--radius-lg);
		padding: var(--space-6);
		width: 100%;
		max-width: 400px;
		box-shadow: var(--shadow-xl);
	}

	.modal-title {
		font-size: var(--font-size-lg);
		font-weight: 600;
		margin-bottom: var(--space-4);
		color: var(--color-text-primary);
	}

	.modal-body {
		display: flex;
		flex-direction: column;
		gap: var(--space-4);
		margin-bottom: var(--space-6);
	}

	.form-select,
	.form-input {
		width: 100%;
		padding: var(--space-3);
		background: var(--color-bg-tertiary);
		border: 1px solid var(--color-border-primary);
		border-radius: var(--radius-md);
		color: var(--color-text-primary);
		font-size: var(--font-size-sm);
	}

	.help-text {
		font-size: var(--font-size-xs);
		color: var(--color-text-muted);
		margin-top: var(--space-1);
	}

	.modal-info {
		padding: var(--space-3);
		background: rgba(0, 212, 255, 0.1);
		border-radius: var(--radius-md);
		font-size: var(--font-size-sm);
		display: flex;
		flex-direction: column;
		gap: var(--space-1);
	}

	.modal-footer {
		display: flex;
		justify-content: flex-end;
		gap: var(--space-2);
	}
</style>
