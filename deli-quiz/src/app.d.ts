// See https://kit.svelte.dev/docs/types#app
// for information about these interfaces
declare global {
	namespace App {
		// interface Error {}
		// interface Locals {}
		// interface PageData {}
		// interface Platform {}
		interface Game {
			steps: string[];
			order: ProductOrder[];
			productNames: string[];
			orderWeights: number[];
			products: string[];
			faultTolerance: number;
			blade: string[];
			game: Game;
		}
	}
}

export {};
