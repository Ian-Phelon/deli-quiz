<script lang="ts">
	import type { Game, Order } from '$lib/game/game';
	import { confetti } from '@neoconfetti/svelte';
	import { tick } from 'svelte';
	import { createEventDispatcher } from 'svelte';

	export let game: Game;

	let winning = false;
	let slices = 0;
	let blade = 0;
	let scale = 0;
	let slicingIndex = -1;
	let info = '';
	$: info = game.orderToString(slicingIndex);
	$: if (slices > 0) {
		scale = game.scaleWeight();
	}
	$: bladeSetting = game.bladeSetting[blade];
	$: if (game.cart.length === game.order.length) {
		winGame();
	}

	function select(event: Event & { currentTarget: EventTarget & HTMLButtonElement }) {
		const showcaseIndex = +event.currentTarget.id.split('-')[1];
		const orderIndex = game.selectOrder(showcaseIndex);

		info = game.orderToString(showcaseIndex);
		if (orderIndex < 0) {
			const product = game.showcase[showcaseIndex];
			// info = `${product.producer} ${product.product} was not ordered.`;
			slicingIndex = -1;
			event.currentTarget.disabled = true;
		} else {
			slicingIndex = showcaseIndex;
		}
	}

	function slice() {
		game.slice(blade, slicingIndex);
		slices = game.slices.length;
	}

	function setBlade() {
		blade = game.setBlade(blade);
	}

	async function bag() {
		winning = false;
		let bagged = false;

		const target = game.showcase[slicingIndex].weight;
		const actual = game.scaleWeight();

		const withinTolerance = game.withinTolerance(target, actual) || actual >= target;

		if (!withinTolerance) {
			info = `Not Enough`;
		}

		bagged = game.bag(slicingIndex);

		if (bagged) {
			slicingIndex = -1;
		}

		await tick();

		const fulfilled = game.cart.length === game.order.length;

		winning = bagged && fulfilled;
	}

	function weigh() {
		scale = game.weigh();
	}

	const dispatch = createEventDispatcher();

	function winGame() {
		dispatch('win', {
			win: true
		});
	}
</script>

{#if winning}
	<div class="confetti">
		<div use:confetti />
	</div>
{/if}

<p>{info}</p>

<p>Slices: {slices}</p>
<p>Scale: {scale}</p>
<div class="slicer">
	<p class="order">
		{#each game.order as item, i}
			<b>{item.weight}</b> of {item.producer}
			{item.product}{i === game.order.length - 1 ? '.' : ', '}
		{/each}
	</p>
	<button
		id="slice"
		on:click={slice}
		disabled={slicingIndex === -1 || (blade === 0 && slicingIndex !== -1)}
	>
		slice
	</button>
	<button id="weigh" on:click={weigh} disabled={slices === 0}> weigh </button>
	<button id="bag" on:click={bag} disabled={slicingIndex === -1 || slices === 0}> bag </button>
	<input
		id="blade"
		type="range"
		min="0"
		max={game.bladeSetting.length - 1}
		bind:value={blade}
		on:click={setBlade}
		on:touchend={setBlade}
	/>
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
