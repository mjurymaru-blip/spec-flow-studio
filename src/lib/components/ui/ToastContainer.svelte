<!--
  ToastContainer Component
  トースト通知を画面右上に表示
-->
<script lang="ts">
	import Toast from './Toast.svelte';
	import { toasts, hideToast, type ToastItem } from '$lib/stores/toast-store';
</script>

<div class="toast-container">
	{#each $toasts as toast (toast.id)}
		<Toast
			message={toast.message}
			type={toast.type}
			icon={toast.icon}
			subMessage={toast.subMessage}
			duration={toast.duration}
			onClose={() => hideToast(toast.id)}
		/>
	{/each}
</div>

<style>
	.toast-container {
		position: fixed;
		top: var(--space-4);
		right: var(--space-4);
		z-index: 9998;
		display: flex;
		flex-direction: column;
		gap: var(--space-3);
		pointer-events: none;
	}

	.toast-container :global(.toast) {
		pointer-events: auto;
	}
</style>
