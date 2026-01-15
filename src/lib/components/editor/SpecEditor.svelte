<!--
  SpecEditor Component
  CodeMirror 6 を使用したYAMLエディタ
-->
<script lang="ts">
	import { onMount, onDestroy } from 'svelte';
	import { EditorView, basicSetup } from 'codemirror';
	import { EditorState } from '@codemirror/state';
	import { yaml } from '@codemirror/lang-yaml';
	import { oneDark } from '@codemirror/theme-one-dark';
	import { keymap } from '@codemirror/view';
	import { defaultKeymap } from '@codemirror/commands';

	interface Props {
		value: string;
		readonly?: boolean;
		onChange?: (value: string) => void;
	}

	let { value = $bindable(), readonly = false, onChange }: Props = $props();

	let editorElement: HTMLElement;
	let editorView: EditorView;

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
					'.cm-scroller': { fontFamily: 'var(--font-mono)' }
				})
			]
		});

		editorView = new EditorView({
			state,
			parent: editorElement
		});
	});

	// props.value が外部から変更された場合にエディタに反映
	// (エディタ自身の変更による更新ループを防ぐため、内容が異なる場合のみ更新)
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
