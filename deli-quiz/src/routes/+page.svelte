<script lang="ts" type="module">
	import { reduced_motion } from '../../../_sverdle/src/routes/_sverdle/reduced-motion';

	import { Game } from './game';

	let game = new Game();

	let order;

	$: sure = game.order.toString();
	let steps = JSON.stringify(game.steps);

	function haha() {
		game.generateOrder();
		order = game.order;
		console.log(game.order.toString());
	}

	// export let form: ActionData;
</script>

<svelte:head>
	<title>Home</title>
	<meta name="description" content="Svelte demo app" />
</svelte:head>

<section>
	<h1 class="welcome">Deli Quiz</h1>
	{#if order}
		{#each order as item}
			<p>{item.productWeight} of {item.productName} {item.product}</p>
		{/each}
		{:else}
		<p>order</p>
	{/if}
	<!-- <p>{order}</p> -->
	<button on:click={() => haha()}>gen</button>
</section>

<style>
	section {
		display: flex;
		flex-direction: column;
		justify-content: center;
		align-items: center;
		flex: 0.6;
	}

	h1 {
		width: 100%;
	}

	.welcome {
		display: block;
		position: relative;
		width: 100%;
		height: 0;
		padding: 0 0 calc(100% * 495 / 2048) 0;
	}
</style>
