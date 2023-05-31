<script lang="ts" type="module">
	import { Game, type OrderData } from '$lib/game/game';
	import GameBoard from '$lib/game/GameBoard.svelte';
	import * as gameData from '$lib/game/data/index';
	import { confetti } from '@neoconfetti/svelte';

	const { genericProducts, genericProductNames, standardWeights } = gameData;

	const ok: OrderData = {
		products: genericProducts,
		productNames: genericProductNames,
		orderWeights: standardWeights,
		faultTolerance: 0.5
	};

	let game = new Game(ok);

	let inProgress = false;
	let win = game.win;
	$: winning = () => game.win;

	function start() {
		inProgress = !inProgress;
		// win = true;
	}

	// function step(event: { currentTarget: { id: any; }; }) {
	// 	const str = event.currentTarget.id ? event.currentTarget.id : game.steps[game.steps.length - 1];
	// 	game.addStep(str);
	// }
	// $: inProgress = game.steps[0] === 'start';
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
		{#if winning()}
			<div>
				<div use:confetti />
			</div>
		{/if}
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
