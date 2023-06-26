<script lang="ts">
	import type { Game, Order } from '$lib/game/game';
	import { confetti } from '@neoconfetti/svelte';
	import { tick } from 'svelte';

	export let game: Game;

	let slicingIndex = 0;
	let slices = 0;
	let blade = 0;
	let scale = 0;
	let order: Order;
	let haha: Order | string | undefined;
	let winning = false;
	$: canSlice = !order;
	$: canBag =
		scale > game.getOrder(slicingIndex).weight || !game.withinTolerance(order?.weight, scale);
	$: bladeSetting = game.bladeSetting[blade];

	

	function select(event: Event) {
		//@ts-expect-error always called with an event
		const id = event.currentTarget.id;
		//
		const index = +id.split('-')[1];
		game.select();
		slicingIndex = index;
		if (game.showcase[slicingIndex].weight === 0) {
			//@ts-expect-error always called with an event
			event.currentTarget.disabled = true
		}
		if (game.showcase[slicingIndex].weight > 0) order = game.showcase[slicingIndex];
	}

	function isSelectable(weight: number) {
		return weight > 0;
	}

	function slice() {
		game.slice(blade, slicingIndex);
		slices = game.slices.length;
	}

	function setBlade() {
		game.setBlade(blade);
	}

	async function bag() {
		winning = false;
		const bagged = game.bag(slicingIndex);
		await tick();
		winning = bagged && game.order.length === game.cart.length;
	}

	function weigh() {
		game.weigh();
		scale = game.scaleWeight();
	}
</script>

{#if winning}
	<div class="confetti">
		<div use:confetti />
	</div>
{/if}
<p>
	Slicing: {order ? `${order.producer + ' ' + order.product}` : ''}
</p>
<p>Slices: {slices}</p>
<p>Scale: {scale}</p>
<div class="slicer">
	<p class="order">
		{#each game.order as item, i}
			<b>{item.weight}</b> of {item.producer}
			{item.product}{i === game.order.length - 1 ? '.' : ', '}
		{/each}
	</p>
	<button id="slice" on:click={slice} disabled={canSlice}> slice </button>
	<button id="weigh" on:click={weigh}> weigh </button>
	<button id="bag" disabled={canBag} on:click={bag}> bag </button>
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
	{#each game.showcase as item, i}
		<button id="select-{i}" on:click|preventDefault={select}  
			>{item.producer + ' ' + item.product}</button
		>
	{/each}
</div>

<style>
	#blade {
		width: 4rem;
		transform: rotate(270deg);
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
