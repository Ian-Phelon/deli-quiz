<script lang="ts">
	import { onMount } from 'svelte';
	import type { Game } from './game';
	export let game: Game;

	let steps: string[];

	let slicer;

	let thickness = 0;

	$:bladeSetting = game.blade[thickness];

	function step(event:Event) {
		//@ts-expect-error
		const str = event.currentTarget.id;
		
		game.addStep(str)
	}
</script>
<div class="ok">
	
	<p class="order">
		{#each game.order as item, i}
			<b>{item.productWeight}</b> of {item.productName}
			{item.product}{i === game.order.length - 1 ? '.' : ', '}
		{/each}
	</p>
	<button id="slice" on:click={step}> a </button>
	<button id="weigh" on:click={step}> b </button>
	
	<button id="bag" on:click={step}> c </button>
	<input
		id="blade"
		type="range"
		min="0"
		max={game.blade.length - 1}
		bind:value={thickness}
		on:click={step}
		bind:this={slicer}
	/>
	<p>
		{bladeSetting}
	</p>
</div>

<style>
	#blade {
		/* rotation causes us to manipulate the height by changing the width */
		transform: rotate(270deg);
		width: 4rem;
		margin-left: -10rem;
		/* touch-action: none; */
	}
	.ok{
		touch-action: none;
	}
</style>
