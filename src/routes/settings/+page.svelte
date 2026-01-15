<!--
  Settings Page - 設定
-->
<script lang="ts">
	import { Panel, Button } from '$lib/components/ui';
	import { integrationConfig, updateConfig } from '$lib/stores/integration-store';

	let consoleUrl = $state($integrationConfig.consoleUrl);
	let autoSync = $state($integrationConfig.autoSync);
	let syncInterval = $state($integrationConfig.syncInterval);

	function saveSettings() {
		updateConfig({
			consoleUrl,
			autoSync,
			syncInterval
		});
		// TODO: 保存成功のフィードバック
	}
</script>

<div class="page">
	<header class="page__header">
		<h1>設定</h1>
		<p class="page__subtitle">アプリケーション設定</p>
	</header>

	<div class="settings-grid">
		<Panel title="Aether Console 連携">
			<form class="settings-form" onsubmit={(e) => { e.preventDefault(); saveSettings(); }}>
				<div class="form-group">
					<label for="consoleUrl">Console URL</label>
					<input
						id="consoleUrl"
						type="text"
						bind:value={consoleUrl}
						placeholder="ws://localhost:5173/api/ws"
					/>
				</div>

				<div class="form-group form-group--inline">
					<input
						id="autoSync"
						type="checkbox"
						bind:checked={autoSync}
					/>
					<label for="autoSync">自動同期を有効にする</label>
				</div>

				<div class="form-group">
					<label for="syncInterval">同期間隔 (ms)</label>
					<input
						id="syncInterval"
						type="number"
						bind:value={syncInterval}
						min="1000"
						max="60000"
						step="1000"
					/>
				</div>

				<div class="form-actions">
					<Button type="submit" variant="primary">保存</Button>
				</div>
			</form>
		</Panel>

		<Panel title="データ管理">
			<div class="data-actions">
				<div class="data-action">
					<div class="data-action__info">
						<h4>ローカルデータのエクスポート</h4>
						<p>Spec、生成物、パッチ履歴をJSONでエクスポート</p>
					</div>
					<Button variant="secondary" size="sm">エクスポート</Button>
				</div>

				<div class="data-action">
					<div class="data-action__info">
						<h4>ローカルデータのインポート</h4>
						<p>エクスポートしたJSONファイルを読み込み</p>
					</div>
					<Button variant="secondary" size="sm">インポート</Button>
				</div>

				<div class="data-action data-action--danger">
					<div class="data-action__info">
						<h4>全データを削除</h4>
						<p>ローカルに保存された全てのデータを削除</p>
					</div>
					<Button variant="danger" size="sm">削除</Button>
				</div>
			</div>
		</Panel>
	</div>
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

	.settings-grid {
		display: flex;
		flex-direction: column;
		gap: var(--space-6);
		max-width: 600px;
	}

	/* Form */
	.settings-form {
		display: flex;
		flex-direction: column;
		gap: var(--space-5);
	}

	.form-group {
		display: flex;
		flex-direction: column;
		gap: var(--space-2);
	}

	.form-group--inline {
		flex-direction: row;
		align-items: center;
	}

	.form-group label {
		font-size: var(--font-size-sm);
		color: var(--color-text-secondary);
	}

	.form-group input[type="text"],
	.form-group input[type="number"] {
		padding: var(--space-3);
		background: var(--color-bg-tertiary);
		border: 1px solid var(--color-border-primary);
		border-radius: var(--radius-md);
		color: var(--color-text-primary);
		font-family: var(--font-mono);
		font-size: var(--font-size-sm);
	}

	.form-group input[type="text"]:focus,
	.form-group input[type="number"]:focus {
		outline: none;
		border-color: var(--color-accent-primary);
		box-shadow: 0 0 0 2px rgba(0, 212, 255, 0.2);
	}

	.form-group input[type="checkbox"] {
		accent-color: var(--color-accent-primary);
	}

	.form-actions {
		margin-top: var(--space-4);
	}

	/* Data Actions */
	.data-actions {
		display: flex;
		flex-direction: column;
		gap: var(--space-4);
	}

	.data-action {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: var(--space-4);
		background: var(--color-bg-tertiary);
		border-radius: var(--radius-md);
	}

	.data-action--danger {
		border: 1px solid rgba(239, 68, 68, 0.3);
	}

	.data-action__info h4 {
		font-size: var(--font-size-sm);
		margin-bottom: var(--space-1);
	}

	.data-action__info p {
		font-size: var(--font-size-xs);
		color: var(--color-text-muted);
	}
</style>
