<script lang="ts" type="module">
	import { tick } from 'svelte';
	import { reduced_motion } from '../../../_sverdle/src/routes/_sverdle/reduced-motion';

	import { Game } from './game';
	import GameComponent from './Game.svelte';

	let { game } = new Game().game;

	let inProgress:boolean;
	$:orderItems = game.order.length
	function start() {
		game.startGame();
		console.log(game.order.length)
		inProgress = game.inProgress
	}
	
	// function step(event: { currentTarget: { id: any; }; }) {
	// 	const str = event.currentTarget.id ? event.currentTarget.id : game.steps[game.steps.length - 1];
	// 	game.addStep(str);
	// }
	$:inProgress = game.steps[0] === 'start'
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
		<GameComponent {game}/>
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
	.game{
		margin-top: 0;
	}
</style>
