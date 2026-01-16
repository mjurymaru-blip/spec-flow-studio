<!--
  SpecEditor Component
  CodeMirror 6 を使用したYAMLエディタ
  行ジャンプ・ハイライト機能付き
-->
<script lang="ts">
	import { onMount, onDestroy } from 'svelte';
	import { EditorView, basicSetup } from 'codemirror';
	import { EditorState, StateEffect, StateField } from '@codemirror/state';
	import { yaml } from '@codemirror/lang-yaml';
	import { oneDark } from '@codemirror/theme-one-dark';
	import { keymap, Decoration, type DecorationSet } from '@codemirror/view';
	import { defaultKeymap } from '@codemirror/commands';

	interface Props {
		value: string;
		readonly?: boolean;
		onChange?: (value: string) => void;
	}

	let { value = $bindable(), readonly = false, onChange }: Props = $props();

	let editorElement: HTMLElement;
	let editorView: EditorView;

	// ハイライト用のEffect
	const highlightLineEffect = StateEffect.define<{ from: number; to: number } | null>();

	// ハイライト用のStateField
	const highlightLineField = StateField.define<DecorationSet>({
		create() {
			return Decoration.none;
		},
		update(decorations, tr) {
			for (const e of tr.effects) {
				if (e.is(highlightLineEffect)) {
					if (e.value) {
						const deco = Decoration.line({ class: 'cm-highlight-line' }).range(e.value.from);
						return Decoration.set([deco]);
					}
					return Decoration.none;
				}
			}
			return decorations;
		},
		provide: (f) => EditorView.decorations.from(f)
	});

	// エディタの初期化
	onMount(() => {
		if (!editorElement) return;

		const state = EditorState.create({
			doc: value,
			extensions: [
				basicSetup,
				keymap.of(defaultKeymap),
				yaml(),
				oneDark,
				highlightLineField,
				EditorView.updateListener.of((update) => {
					if (update.docChanged) {
						const newValue = update.state.doc.toString();
						value = newValue; // 双方向バインディング更新
						if (onChange) onChange(newValue);
					}
				}),
				EditorView.editable.of(!readonly),
				EditorView.theme({
					'&': { height: '100%', fontSize: '14px' },
					'.cm-scroller': { fontFamily: 'var(--font-mono)' },
					'.cm-highlight-line': {
						backgroundColor: 'rgba(239, 68, 68, 0.3) !important',
						transition: 'background-color 0.3s ease'
					}
				})
			]
		});

		editorView = new EditorView({
			state,
			parent: editorElement
		});
	});

	// props.value が外部から変更された場合にエディタに反映
	$effect(() => {
		if (editorView && value !== editorView.state.doc.toString()) {
			editorView.dispatch({
				changes: {
					from: 0,
					to: editorView.state.doc.length,
					insert: value
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
		editorView.dispatch({
			effects: [
				EditorView.scrollIntoView(line.from, { y: 'center' }),
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

<div class="editor-container" bind:this={editorElement}></div>

<style>
	.editor-container {
		width: 100%;
		height: 100%;
		overflow: hidden;
		border-radius: var(--radius-md);
		border: 1px solid var(--color-border-primary);
	}

	/* CodeMirrorのスタイル調整 */
	:global(.cm-editor) {
		height: 100%;
	}

	:global(.cm-scroller) {
		overflow: auto;
	}
</style>
