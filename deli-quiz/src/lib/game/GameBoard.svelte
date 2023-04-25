<script lang="ts">
	import type { Game } from '$lib/game/game';
	export let game: Game;

	let steps = game.steps;
	let info = game.info;
	let onSlicer = game.slicing;
	let slices = game.slices;
	let thickness = 0;

	$: bladeSetting = game.blade[thickness];
	// function scale() { return game.scaleWeight();}
	// const scale = () => game.scaleWeight();
	

	function step(event: Event) {
		//@ts-expect-error always called with an event
		const str = event.currentTarget.id;

		game.step(str, thickness, onSlicer);
		onSlicer = game.slicing;
		steps = game.steps;
		info = game.info;
		slices = game.slices;
	}
</script>

<p class="info">
	Steps: {steps}
</p>
<p>Info: {info ?? ''}</p>
<p>
	Slicing: {onSlicer
		? `${onSlicer.productName + ' ' + onSlicer.product.product + ' ' + onSlicer.product.slice}`
		: ''}
</p>
<p>Slices: {slices}</p>
{#if onSlicer}
	<p>{game.scaleWeight()}</p>
{/if}
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
