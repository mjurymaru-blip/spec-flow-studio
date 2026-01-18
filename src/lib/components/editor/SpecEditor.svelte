<!--
  SpecEditor Component
  CodeMirror 6 を使用したYAMLエディタ
  行ジャンプ・ハイライト機能付き
  CodeMirrorは動的インポートで遅延読み込み
-->
<script lang="ts">
	import { onMount, onDestroy } from 'svelte';
	import type { EditorView } from '@codemirror/view';
	import type { StateEffect, StateField } from '@codemirror/state';
	import type { DecorationSet } from '@codemirror/view';
	import type { YamlError } from '$lib/utils/yaml-utils';
	import { fade, fly } from 'svelte/transition';

	interface Props {
		value: string;
		errors?: YamlError[];
		readonly?: boolean;
		onChange?: (value: string) => void;
	}

	let { value = $bindable(), errors = [], readonly = false, onChange }: Props = $props();

	let editorElement: HTMLElement;
	let editorView: EditorView | null = null;
	let isLoading = $state(true);

	// 動的に読み込まれるモジュール（モジュールスコープに保存）
	let EditorViewModule: typeof EditorView | null = null;
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	let highlightLineEffect: any = null;

	// エディタの初期化（動的インポート）
	onMount(async () => {
		if (!editorElement) return;

		try {
			// CodeMirrorモジュールを動的に読み込み
			const [
				{ EditorView: EV, basicSetup },
				{ EditorState, StateEffect: SE, StateField: SF },
				{ yaml },
				{ oneDark },
				{ keymap, Decoration },
				{ defaultKeymap },
				{ specKitAutocomplete }
			] = await Promise.all([
				import('codemirror'),
				import('@codemirror/state'),
				import('@codemirror/lang-yaml'),
				import('@codemirror/theme-one-dark'),
				import('@codemirror/view'),
				import('@codemirror/commands'),
				import('$lib/utils/spec-kit-autocomplete')
			]);

			// ハイライト用のEffect
			const highlightEffect = SE.define<{ from: number; to: number } | null>();
			highlightLineEffect = highlightEffect as any;

			// ハイライト用のStateField
			const highlightLineField = SF.define<DecorationSet>({
				create() {
					return Decoration.none;
				},
				update(decorations, tr) {
					for (const e of tr.effects) {
						if (e.is(highlightEffect)) {
							if (e.value) {
								const deco = Decoration.line({ class: 'cm-highlight-line' }).range(e.value.from);
								return Decoration.set([deco]);
							}
							return Decoration.none;
						}
					}
					return decorations;
				},
				provide: (f) => EV.decorations.from(f)
			});

			const state = EditorState.create({
				doc: value,
				extensions: [
					basicSetup,
					keymap.of(defaultKeymap),
					yaml(),
					oneDark,
					specKitAutocomplete,
					highlightLineField,
					EV.updateListener.of((update) => {
						if (update.docChanged) {
							const newValue = update.state.doc.toString();
							value = newValue;
							if (onChange) onChange(newValue);
						}
					}),
					EV.editable.of(!readonly),
					EV.theme({
						'&': { height: '100%', fontSize: '14px' },
						'.cm-scroller': { fontFamily: 'var(--font-mono)' },
						'.cm-highlight-line': {
							backgroundColor: 'rgba(239, 68, 68, 0.3) !important',
							transition: 'background-color 0.3s ease'
						}
					})
				]
			});

			editorView = new EV({
				state,
				parent: editorElement
			});

			EditorViewModule = EV;
			isLoading = false;
		} catch (error) {
			console.error('Failed to load CodeMirror:', error);
			isLoading = false;
		}
	});

	// props.value が外部から変更された場合にエディタに反映
	$effect(() => {
		const currentValue = value; // 明示的にリアクティブ依存を作成
		if (editorView && currentValue !== editorView.state.doc.toString()) {
			editorView.dispatch({
				changes: {
					from: 0,
					to: editorView.state.doc.length,
					insert: currentValue
				}
			});
		}
	});

	onDestroy(() => {
		if (editorView) {
			editorView.destroy();
		}
	});

	/**
	 * 指定行にジャンプ＆ハイライト
	 * @param lineNumber 1-indexed の行番号
	 */
	export function gotoLine(lineNumber: number) {
		if (!editorView) return;

		const doc = editorView.state.doc;
		const lineCount = doc.lines;

		// 範囲チェック
		if (lineNumber < 1 || lineNumber > lineCount) {
			console.warn(`[SpecEditor] Line ${lineNumber} out of range (1-${lineCount})`);
			return;
		}

		const line = doc.line(lineNumber);

		// スクロールして行を中央に表示
		if (!EditorViewModule || !highlightLineEffect) return;
		editorView.dispatch({
			effects: [
				EditorViewModule.scrollIntoView(line.from, { y: 'center' }),
				highlightLineEffect.of({ from: line.from, to: line.to })
			],
			selection: { anchor: line.from }
		});

		// 2秒後にハイライトを解除
		setTimeout(() => {
			if (editorView) {
				editorView.dispatch({
					effects: highlightLineEffect.of(null)
				});
			}
		}, 2000);

		editorView.focus();
	}

	/**
	 * テキストを検索して最初にマッチした行にジャンプ
	 * @param searchText 検索するテキスト
	 */
	export function gotoText(searchText: string) {
		if (!editorView) return;

		const doc = editorView.state.doc;
		const content = doc.toString();
		const index = content.indexOf(searchText);

		if (index === -1) {
			console.warn(`[SpecEditor] Text not found: "${searchText}"`);
			return;
		}

		const line = doc.lineAt(index);
		gotoLine(line.number);
	}
</script>

<div class="editor-container">
	{#if isLoading}
		<div class="editor-loading">
			<div class="loading-spinner"></div>
			<p>エディタを読み込み中...</p>
		</div>
	{/if}
	<div class="editor-mount" bind:this={editorElement} class:hidden={isLoading}></div>

	{#if errors.length > 0}
		<div class="error-overlay" transition:fly={{ y: 20, duration: 300 }}>
			<div class="error-header">
				<span class="error-icon">⚠️</span>
				<span class="error-title">Validation Errors ({errors.length})</span>
			</div>
			<div class="error-list">
				{#each errors as error}
					<button
						class="error-item"
						onclick={() => {
							// エラー行は0-indexedの場合があるので+1を確認。js-yamlのmark.lineは0-indexed
							gotoLine(error.line + 1);
						}}
					>
						<span class="error-location">Line {error.line + 1}:</span>
						<span class="error-message">{error.message}</span>
					</button>
				{/each}
			</div>
		</div>
	{/if}
</div>

<style>
	.editor-container {
		width: 100%;
		height: 100%;
		overflow: hidden;
		border-radius: var(--radius-md);
		border: 1px solid var(--color-border-primary);
		position: relative;
	}

	.editor-mount {
		width: 100%;
		height: 100%;
	}

	.editor-mount.hidden {
		visibility: hidden;
	}

	.editor-loading {
		position: absolute;
		top: 0;
		left: 0;
		width: 100%;
		height: 100%;
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		background: var(--color-bg-secondary);
		gap: var(--space-3);
	}

	.loading-spinner {
		width: 32px;
		height: 32px;
		border: 3px solid var(--color-border-primary);
		border-top-color: var(--color-accent-primary);
		border-radius: 50%;
		animation: spin 1s linear infinite;
	}

	@keyframes spin {
		to {
			transform: rotate(360deg);
		}
	}

	.editor-loading p {
		color: var(--color-text-muted);
		font-size: var(--font-size-sm);
	}

	/* CodeMirrorのスタイル調整 */
	:global(.cm-editor) {
		height: 100%;
	}

	:global(.cm-scroller) {
		overflow: auto;
	}

	/* Error Overlay */
	.error-overlay {
		position: absolute;
		bottom: var(--space-4);
		left: var(--space-4);
		right: var(--space-4);
		background: rgba(40, 10, 10, 0.95);
		border: 1px solid var(--color-accent-error);
		border-radius: var(--radius-md);
		padding: var(--space-3);
		backdrop-filter: blur(4px);
		box-shadow: 0 -4px 20px rgba(0, 0, 0, 0.5);
		z-index: 10;
		max-height: 200px;
		display: flex;
		flex-direction: column;
		gap: var(--space-2);
	}

	.error-header {
		display: flex;
		align-items: center;
		gap: var(--space-2);
		color: var(--color-accent-error);
		font-weight: 600;
		font-size: var(--font-size-sm);
		padding-bottom: var(--space-2);
		border-bottom: 1px solid rgba(239, 68, 68, 0.2);
	}

	.error-list {
		display: flex;
		flex-direction: column;
		gap: var(--space-1);
		overflow-y: auto;
	}

	.error-item {
		display: flex;
		gap: var(--space-2);
		background: transparent;
		border: none;
		color: var(--color-text-primary);
		font-size: var(--font-size-xs);
		text-align: left;
		cursor: pointer;
		padding: var(--space-1) var(--space-2);
		border-radius: var(--radius-sm);
		transition: background 0.2s;
		font-family: var(--font-mono);
	}

	.error-item:hover {
		background: rgba(239, 68, 68, 0.1);
	}

	.error-location {
		color: var(--color-accent-error);
		font-weight: 600;
		white-space: nowrap;
	}

	.error-message {
		color: var(--color-text-secondary);
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}
</style>
