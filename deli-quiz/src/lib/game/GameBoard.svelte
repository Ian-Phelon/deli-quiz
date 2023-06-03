<script lang="ts">
	import type { Game, Order } from '$lib/game/game';
	import { confetti } from '@neoconfetti/svelte';
	import { tick } from 'svelte';

	export let game: Game;

	let onSlicerIndex = 0;
	let slices = game.slices;
	let blade = 0;
	let order = game.slicing;
	let scale = game.scaleWeight();

	let winning = false;
	$: onSlicer = game.order[onSlicerIndex];
	$: canSlice = !order;
	$: bladeSetting = game.bladeSetting[blade];
	let ok = false;

	function select(event: Event) {
		//@ts-expect-error always called with an event
		const str = event.currentTarget.id;
		const index = +str.split('-')[1];
		game.setSlicingIndex(index);
		order = game.slicing;
		onSlicerIndex = index;
	}

	function slice() {
		game.slice(blade);
	}

	function setBlade() {
		game.adjustBlade(blade);
	}

	function bag() {
		game.iBag(onSlicerIndex);
	}

	function weigh() {
		game.iWeigh();
	}

	// function step(event: Event) {
	// 	//@ts-expect-error always called with an event
	// 	const str = event.currentTarget.id;
	// 	slices = game.slices;
	// }
</script>

{#if winning}
	<div class="confetti">
		<div use:confetti />
	</div>
{/if}
<p>
	Splicing: {order
		? `${order.productName + ' ' + order.product.product + ' ' + order.product.slice}`
		: ''}
</p>
<p>Slices: {slices.length}</p>
<p>Scale: {game.scaleWeight()}</p>
<div class="slicer">
	<p class="order">
		{#each game.order as item, i}
			<b>{item.orderWeight}</b> of {item.productName}
			{item.product.product}{i === game.order.length - 1 ? '.' : ', '}
		{/each}
	</p>
	<button
		id="slice"
		on:click={() => {
			game.slice(blade);
		}}
		disabled={canSlice}
	>
		slice
	</button>
	<button id="weigh" on:click={weigh}> weigh </button>
	<button
		id="bag"
		on:click={async () => {
			game.iBag(onSlicerIndex);
			winning = false;
			await tick();
			winning = game.order.length === game.cart.length;
		}}
	>
		bag
	</button>
	<input
		id="blade"
		type="range"
		min="0"
		max={game.bladeSetting.length - 1}
		bind:value={blade}
		on:click={setBlade}
		on:touchend={setBlade}
	/>
	<!-- <Slicer blade={blade} game={game}/> -->
	<p>
		{bladeSetting}
	</p>
</div>
<div class="showcase">
	{#each game.order as item, i}
		<button id="select-{i}" on:click={select}
			>{item.productName + ' ' + item.product.product}</button
		>
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
	p {
		word-break: break-all;
		word-wrap: break-word;
	}
	.slicer > input {
		touch-action: none;
	}
	button {
		margin: 4px;
	}
	:global(body) {
		overflow: hidden;
	}
	.confetti {
		
		/* width: 100%;
		height: 100%; */
		/* overflow: hidden; */
		display: flex;
		justify-content: center;
	}
</style>
