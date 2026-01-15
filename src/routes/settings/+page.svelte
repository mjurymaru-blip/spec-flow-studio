<!--
  Settings Page - 設定
-->
<script lang="ts">
	import { Panel, Button, StatusIndicator } from '$lib/components/ui';
	import { integrationConfig, updateConfig } from '$lib/stores/integration-store';
	import { settings } from '$lib/stores/settings-store';
	import { session } from '$lib/stores/session-store';
	import { encryptData, decryptData } from '$lib/utils/crypto-utils';
	import { saveToStorage, loadFromStorage, STORAGE_KEYS } from '$lib/utils/storage-utils';

	// Aether Console Settings
	let consoleUrl = $state($integrationConfig.consoleUrl);
	let autoSync = $state($integrationConfig.autoSync);
	let syncInterval = $state($integrationConfig.syncInterval);

	function saveIntegrationSettings() {
		updateConfig({
			consoleUrl,
			autoSync,
			syncInterval
		});
		alert('連携設定を保存しました');
	}

	// AI Settings
	let apiKeyInput = $state('');
	let passwordInput = $state('');
	let isApiKeyLoading = $state(false);
	let isModelRefreshing = $state(false);

	async function saveApiKey() {
		if (!apiKeyInput || !passwordInput) {
			alert('APIキーとパスワードを入力してください');
			return;
		}

		isApiKeyLoading = true;
		try {
			// 暗号化して保存
			const encrypted = await encryptData(apiKeyInput, passwordInput);
			saveToStorage('spec-flow-studio:api-key-encrypted', encrypted);

			// パスワードをセッションに保持
			session.setPassword(passwordInput);

			// 設定更新
			settings.updateSettings({ hasApiKey: true });

			// モデル一覧の取得を試行
			await refreshModels(apiKeyInput);

			// 入力クリア
			apiKeyInput = '';
			passwordInput = '';

			alert('APIキーを暗号化して保存し、モデル一覧を更新しました');
		} catch (error) {
			console.error(error);
			alert('APIキーの保存に失敗しました');
		} finally {
			isApiKeyLoading = false;
		}
	}

	async function refreshModels(apiKeyRaw?: string) {
		let apiKey = apiKeyRaw;

		// 引数がない場合は保存されたキーを復号化して使用
		if (!apiKey && $settings.hasApiKey && $session.encryptionPassword) {
			const encryptedKey = loadFromStorage('spec-flow-studio:api-key-encrypted', '');
			if (encryptedKey) {
				try {
					apiKey = await decryptData(encryptedKey, $session.encryptionPassword);
				} catch (e) {
					console.error('Failed to decrypt API key for model refresh', e);
				}
			}
		}

		if (!apiKey) {
			console.log('Skipping model refresh: No API key available');
			return;
		}

		isModelRefreshing = true;
		try {
			const res = await fetch('/api/models', {
				headers: { 'x-api-key': apiKey }
			});
			if (res.ok) {
				const data = await res.json();
				const models = data.models.map((m: any) => m.name);
				if (models.length > 0) {
					settings.updateSettings({ availableModels: models });
					// 現在選択されているモデルがリストになければ、リストの最初を選択
					if (!$settings.geminiModel || !models.includes($settings.geminiModel)) {
						settings.updateSettings({ geminiModel: models[0] });
					}
				}
			}
		} catch (e) {
			console.error('Failed to refresh models', e);
		} finally {
			isModelRefreshing = false;
		}
	}

	// 手動更新ボタン用ハンドラ
	async function handleRefreshClick() {
		if (!$session.encryptionPassword) {
			alert('モデル一覧を更新するには、まずAPIキーを保存（または再入力）してください');
			return;
		}
		await refreshModels();
		alert('モデル一覧を更新しました');
	}

	function handleModelChange(e: Event) {
		const select = e.target as HTMLSelectElement;
		settings.updateSettings({ geminiModel: select.value });
	}
</script>

<div class="page">
	<header class="page__header">
		<h1>設定</h1>
		<p class="page__subtitle">アプリケーション設定</p>
	</header>

	<div class="settings-grid">
		<!-- AI設定 -->
		<Panel title="AI 生成設定 (Gemini API)">
			<div class="settings-form">
				<div class="form-group">
					<div class="model-select-header">
						<label for="geminiModel">使用モデル</label>
						<button
							class="refresh-btn"
							onclick={handleRefreshClick}
							disabled={isModelRefreshing || !$settings.hasApiKey}
							title="モデル一覧を更新"
						>
							{#if isModelRefreshing}
								⟳ Updating...
							{:else}
								⟳ モデル一覧を更新
							{/if}
						</button>
					</div>
					<select
						id="geminiModel"
						value={$settings.geminiModel}
						onchange={handleModelChange}
						class="form-select"
					>
						{#each $settings.availableModels as model}
							<option value={model}>{model}</option>
						{/each}
					</select>
				</div>

				<div class="api-key-section">
					<div class="status-row">
						<span class="status-label">APIキー状態:</span>
						<StatusIndicator
							status={$settings.hasApiKey ? 'success' : 'warning'}
							label={$settings.hasApiKey ? '設定済み (暗号化)' : '未設定'}
						/>
					</div>

					<div class="form-group">
						<label for="apiKey">Gemini API Key</label>
						<input
							id="apiKey"
							type="password"
							bind:value={apiKeyInput}
							placeholder={$settings.hasApiKey ? '••••••••••••••••' : 'AIza...'}
						/>
					</div>

					<div class="form-group">
						<label for="password">暗号化パスワード</label>
						<input
							id="password"
							type="password"
							bind:value={passwordInput}
							placeholder="APIキーを保護するためのパスワード"
						/>
						<p class="help-text">
							※ APIキーはこのパスワードで暗号化され、ブラウザのLocalStorageに保存されます。<br />
							※ サーバーには暗号化された状態でも保存されません。<br />
							※ 生成機能を使用するたびにこのパスワードが必要になります（セッション中は保持）。
						</p>
					</div>

					<div class="form-actions">
						<Button
							variant="primary"
							onclick={saveApiKey}
							disabled={!apiKeyInput || !passwordInput || isApiKeyLoading}
							loading={isApiKeyLoading}
						>
							APIキーを保存
						</Button>
					</div>
				</div>
			</div>
		</Panel>

		<!-- Aether Console 連携 -->
		<Panel title="Aether Console 連携">
			<form
				class="settings-form"
				onsubmit={(e) => {
					e.preventDefault();
					saveIntegrationSettings();
				}}
			>
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
					<input id="autoSync" type="checkbox" bind:checked={autoSync} />
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
					<Button type="submit" variant="secondary">連携設定を保存</Button>
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

	.model-select-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: var(--space-2);
	}

	.refresh-btn {
		background: none;
		border: none;
		color: var(--color-accent-primary);
		font-size: var(--font-size-xs);
		cursor: pointer;
		padding: 0;
		opacity: 0.8;
		transition: opacity 0.2s;
	}

	.refresh-btn:hover {
		opacity: 1;
		text-decoration: underline;
	}

	.refresh-btn:disabled {
		opacity: 0.5;
		cursor: not-allowed;
		text-decoration: none;
	}

	.form-group label {
		font-size: var(--font-size-sm);
		color: var(--color-text-secondary);
	}

	.form-group input[type='text'],
	.form-group input[type='password'],
	.form-group input[type='number'],
	.form-select {
		padding: var(--space-3);
		background: var(--color-bg-tertiary);
		border: 1px solid var(--color-border-primary);
		border-radius: var(--radius-md);
		color: var(--color-text-primary);
		font-family: var(--font-mono);
		font-size: var(--font-size-sm);
		width: 100%;
	}

	.form-group input:focus,
	.form-select:focus {
		outline: none;
		border-color: var(--color-accent-primary);
		box-shadow: 0 0 0 2px rgba(0, 212, 255, 0.2);
	}

	.form-group input[type='checkbox'] {
		accent-color: var(--color-accent-primary);
		width: auto;
	}

	.help-text {
		font-size: var(--font-size-xs);
		color: var(--color-text-muted);
		line-height: 1.4;
		margin-top: var(--space-1);
	}

	.status-row {
		display: flex;
		align-items: center;
		gap: var(--space-3);
		margin-bottom: var(--space-4);
		padding-bottom: var(--space-4);
		border-bottom: 1px solid var(--color-border-secondary);
	}

	.status-label {
		font-size: var(--font-size-sm);
		color: var(--color-text-secondary);
	}

	.form-actions {
		display: flex;
		justify-content: flex-end;
		margin-top: var(--space-2);
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
