<script lang="ts" type="module">
	import { Game, type OrderData, type Product } from '$lib/game/game';
	import GameBoard from '$lib/game/GameBoard.svelte';
	import * as getData from '$lib/game/data/index';

	const { genericProducts, genericProductNames, standardWeights } = getData;

	function genericData(
		products = genericProducts,
		names = genericProductNames,
		weights = standardWeights
	) {
		const generic: Product[] = [];
		products.forEach((e, i) => {
			generic.push({ ...e, id: `${i}` });
		});
		return {
			// id: 'generic',
			products: generic,
			productNames: names,
			orderWeights: weights,
			faultTolerance: 0.05
		};
	}

	const gameData = genericData();

	let game = new Game(gameData);

	let inProgress = false;

	function start() {
		inProgress = !inProgress;
	}
</script>

<svelte:head>
	<title>Deli Quiz</title>
	<meta
		name="description"
		content="Deli Quiz: Virtual deli slicer for practicing weights and measures"
	/>
</svelte:head>

<h1 class="welcome">Deli Quiz</h1>
<section class="game">
	{#if inProgress}
		<GameBoard {game} />
	{:else}
		<button on:click={start}>Start</button>
	{/if}
</section>

<style>
	section {
		display: flex;
		flex-direction: column;
		/* justify-content: center; */
		align-items: center;
		flex: 0.6;
	}

	/* h1 {
		width: 100%;
	} */
	/* 
	.welcome {
		display: block;
		position: relative;
		width: 100%;
		height: 0;
		padding: 0 0 calc(100% * 495 / 2048) 0;
	} */
	.game {
		margin-top: 0;
	}
</style>
