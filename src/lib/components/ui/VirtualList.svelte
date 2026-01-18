<!--
  VirtualList Component
  仮想スクロールを提供する汎用コンポーネント
  大量のアイテムを効率的にレンダリング
-->
<script lang="ts" generics="T">
	import { onMount } from 'svelte';

	interface Props {
		items: T[];
		itemHeight: number;
		containerHeight?: number;
		overscan?: number;
		children: (item: T, index: number) => any;
	}

	let { items, itemHeight, containerHeight = 400, overscan = 3, children }: Props = $props();

	let scrollContainer: HTMLElement;
	let scrollTop = $state(0);

	// 表示範囲を計算
	const visibleItems = $derived.by(() => {
		const startIndex = Math.max(0, Math.floor(scrollTop / itemHeight) - overscan);
		const visibleCount = Math.ceil(containerHeight / itemHeight) + 2 * overscan;
		const endIndex = Math.min(items.length, startIndex + visibleCount);

		return items.slice(startIndex, endIndex).map((item, i) => ({
			item,
			index: startIndex + i,
			style: `position: absolute; top: ${(startIndex + i) * itemHeight}px; width: 100%;`
		}));
	});

	// 全体の高さ
	const totalHeight = $derived(items.length * itemHeight);

	function handleScroll(event: Event) {
		const target = event.target as HTMLElement;
		scrollTop = target.scrollTop;
	}

	onMount(() => {
		if (scrollContainer) {
			scrollTop = scrollContainer.scrollTop;
		}
	});
</script>

<div
	class="virtual-list-container"
	bind:this={scrollContainer}
	onscroll={handleScroll}
	style="height: {containerHeight}px;"
>
	<div class="virtual-list-inner" style="height: {totalHeight}px;">
		{#each visibleItems as { item, index, style } (index)}
			<div class="virtual-list-item" {style}>
				{@render children(item, index)}
			</div>
		{/each}
	</div>
</div>

<style>
	.virtual-list-container {
		overflow-y: auto;
		position: relative;
	}

	.virtual-list-inner {
		position: relative;
	}

	.virtual-list-item {
		box-sizing: border-box;
	}
</style>
