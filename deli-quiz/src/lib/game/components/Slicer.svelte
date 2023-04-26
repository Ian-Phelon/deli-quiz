<script lang="ts">
	import type { Game } from '$lib/game/game';
	export let blade: number;
	// export let step: (event: Event) => void;
	export let game: Game;

	function step(event: Event) {
		//@ts-expect-error always called with an event
		const str = event.currentTarget.id;

		game.step(str,blade)
	}
</script>

<input
	id="blade"
	type="range"
	min="0"
	max={game.blade.length - 1}
	bind:value={blade}
	on:click={step}
	on:touchend={step}
/>

<style>
	#blade {
		/* rotation causes us to manipulate the height by changing the width */
		transform: rotate(270deg);
		width: 4rem;
		/* margin-left: -10rem; */
		/* touch-action: none; */
	}
</style>
