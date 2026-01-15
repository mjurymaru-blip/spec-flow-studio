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
		stringifySpecs,
		getYamlErrors,
		AGENT_TEMPLATE,
		ANALYZER_TEMPLATE
	} from '$lib/utils/yaml-utils';
	import { saveSpecYaml, loadSpecYaml } from '$lib/utils/storage-utils';
	import { setSpecs, specs } from '$lib/stores/spec-store';
	import type { YamlError } from '$lib/utils/yaml-utils';

	// 状態
	let yamlContent = $state('');
	let yamlErrors = $state<YamlError[]>([]);
	let isDirty = $state(false);
	let currentTemplate = $state('default');

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
			<select bind:value={currentTemplate} class="template-select">
				<option value="default">Default Template</option>
				<option value="analyzer">Analyzer Agent</option>
			</select>
			<Button variant="secondary" size="sm" onclick={applyTemplate}>Load Template</Button>
			<Button variant="primary" size="sm" disabled={yamlErrors.length > 0}
				>Generate Artifacts</Button
			>
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
</div>

<style>
	.editor-page {
		height: calc(100vh - var(--header-height)); /* 調整 */
		display: flex;
		flex-direction: column;
		gap: var(--space-4);
		animation: fade-in var(--transition-base) ease-out;
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
</style>
