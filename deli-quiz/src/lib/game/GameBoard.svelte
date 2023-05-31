<script lang="ts">
	import type { Game, Order } from '$lib/game/game';

	export let game: Game;

	let onSlicerIndex = 0;
	let slices = game.slices;
	let blade = 0;


	$: onSlicer = game.order[onSlicerIndex];
	$: canSlice = game.slicingIndex !== undefined;
	$: bladeSetting = game.bladeSetting[blade];
	let ok = false;

	function select(event: Event) {
		//@ts-expect-error always called with an event
		const str = event.currentTarget.id;
		onSlicerIndex = +str.split('-')[1];
		game.setSlicingIndex(onSlicerIndex);
		// console.log(game.slicingIndex, onSlicerIndex);
	}

	function slice() {
		game.iSlice(blade);
	}

	function setBlade(){
		game.adjustBlade(blade)
	}

	function step(event: Event) {
		//@ts-expect-error always called with an event
		const str = event.currentTarget.id;
		slices = game.slices;
	}
</script>

<!-- <p>
	Slicing: {onSlicer
		? `${onSlicer.productName + ' ' + onSlicer.product.product + ' ' + onSlicer.product.slice}`
		: ''}
</p>
<p>Slices: {slices.length}</p>
<p>Scale: {game.onScale}</p> -->
<div class="slicer">
	<p class="order">
		{#each game.order as item, i}
			<b>{item.orderWeight}</b> of {item.productName}
			{item.product.product}{i === game.order.length - 1 ? '.' : ', '}
		{/each}
	</p>
	<button id="slice" on:click={slice} disabled={ok}> slice </button>
	<button id="weigh" on:click={step}> weigh </button>
	<button id="bag" on:click={step}> bag </button>
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
</style>
