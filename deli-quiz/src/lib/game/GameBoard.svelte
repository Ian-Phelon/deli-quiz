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
	// let canBag = true;
	let hi = '';
	/* 
	It's the clients job to say that scale is not enough to bag. It's ok if it's over because bag() will just throw away extra slices in the ends bin. Because we're also tying it to the disabled={value}, everything is celebrating opposite day. so, split it up into something? bagAble?
*/
	const fuckMe = (order: number, scale: number) =>
		game.withinTolerance(game.getOrder(order).orderWeight, scale) &&
		game.getOrder(order).orderWeight < scale;
	let winning = false;
	$: slicing = game.order[slicingIndex];
	$: canSlice = !order;
	$: canBag = !game.withinTolerance(order?.orderWeight, scale);
	// $: canBag = !fuckMe(slicingIndex, scale)
	$: bladeSetting = game.bladeSetting[blade];
	let ok = false;

	function select(event: Event) {
		//@ts-expect-error always called with an event
		const str = event.currentTarget.id;
		const index = +str.split('-')[1];
		game.select();
		slicingIndex = index;
		order = game.order[slicingIndex];
	}

	function slice() {
		game.slice(blade, slicingIndex);
		slices = game.slices.length;
	}

	function setBlade() {
		game.setBlade(blade);
	}

	async function bag() {
		const bagged = game.bag(slicingIndex);
		winning = false;

		await tick();
		winning = game.order.length === game.cart.length;
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
	Slicing: {order ? `${order.productName + ' ' + order.product.product}` : ''}
</p>
<p>Slices: {slices}</p>
<p>Scale: {scale}</p>
<div class="slicer">
	<p class="order">
		{#each game.order as item, i}
			<b>{item.orderWeight}</b> of {item.productName}
			{item.product.product}{i === game.order.length - 1 ? '.' : ', '}
		{/each}
	</p>
	<button id="slice" on:click={slice} disabled={canSlice}> slice </button>
	<button id="weigh" on:click={weigh}> weigh </button>
	<button
		id="bag"
		disabled={canBag}
		on:click={async () => {
			const withinTolerance = game.withinTolerance(order?.orderWeight, game.scaleWeight());
			if (withinTolerance) {
				await bag();
				// return;
			}
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
<div>
	<p>{hi}</p>
	<button
		on:click={() => {
			hi = game.withinTolerance(order?.orderWeight, scale).toString();
		}}>hi</button
	>
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
