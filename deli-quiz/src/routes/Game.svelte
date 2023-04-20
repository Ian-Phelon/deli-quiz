<script lang="ts">
	import { onMount } from 'svelte';
	import type { Game, Order } from './game';
	export let game: Game;

	let steps = game.steps;
	// $: steps = [...game.steps];
	// $: onSlicer = game.slicing;
	// $: info = game.info;
	let info = game.info;
	$: onSlicer = game.slicing;
	let slices = game.slices;

	let thickness = 0;

	$: bladeSetting = game.blade[thickness];

	function step(event: Event) {
		//@ts-expect-error always called with an event
		const str = event.currentTarget.id;
		
		game.step(str, thickness, onSlicer);
		onSlicer = game.slicing
		steps = game.steps;
		info = game.info;
		slices = game.slices;
	}
</script>

<p class="info">
	Steps: {steps}
	<br />
	Info: {info ?? ''}
	<br />
	Slicing: {onSlicer
		? `${onSlicer.productName + ' ' + onSlicer.product.product + ' ' + onSlicer.product.slice}`
		: ''}
		<br />
		Slices: {slices}
</p>
<div class="slicer">
	<p class="order">
		{#each game.order as item, i}
			<b>{item.productWeight}</b> of {item.productName}
			{item.product.product}{i === game.order.length - 1 ? '.' : ', '}
		{/each}
	</p>
	<button id="slice" on:click={step}> slice </button>
	<button id="weigh" on:click={step}> weigh </button>

	<button id="bag" on:click={step}> bag </button>
	<input
		id="blade"
		type="range"
		min="0"
		max={game.blade.length - 1}
		bind:value={thickness}
		on:click={step}
		on:touchend={step}
	/>
	<p>
		{bladeSetting}
	</p>
</div>
<div class="showcase">
	{#each game.order as item, i}
		<button id="select-{i}" on:click={step}>{item.productName + ' ' + item.product.product}</button>
	{/each}
</div>

<style>
	#blade {
		/* rotation causes us to manipulate the height by changing the width */
		transform: rotate(270deg);
		width: 4rem;
		/* margin-left: -10rem; */
		/* touch-action: none; */
	}
	.info {
		word-wrap: break-word;
	}
	.slicer > input {
		touch-action: none;
	}
	/* .showcase > button {
		margin: 4px;
	}
	.slicer > button {
	} */
	button {
		margin: 4px;
	}
</style>
