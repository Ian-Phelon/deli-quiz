export const products = ['Ham', 'Turkey', 'Swiss', 'Roast Beef', 'Salami', 'Provolone', 'Cheddar'];

export const productNames = ['Two Man\'s', 'Geraldo\'s', 'Patterson\'s', 'Valley Farms'];

export const orderWeights = [0.25, 0.33, 0.5, 0.66, 0.75, 1];

export const blade = ['closed', 'thin', 'sandwich', 'thick'];

type Product = {
	product: string,
	slice: number;
};

type ProductOrder = {
	productName: string;
	productWeight: number;
	product: string;
};

export type Step = 'start' | 'blade' | 'slice' | 'bag' | 'next';

export class Game {

	steps: string[];
	order: ProductOrder[];
	productNames: string[];
	orderWeights: number[];
	products: string[];
	faultTolerance: number;
	blade: string[];
	game: Game;
	inProgress = false;
	slicing: Product[];

	constructor() {
		this.steps = [];
		this.productNames = productNames;
		this.products = products;
		this.orderWeights = orderWeights;
		this.order = [];
		this.faultTolerance = 0.05;
		this.blade = blade;
		this.slicing = [];

		// why
		this.game = this;
	}

	startGame() {
		this.order = [];
		// one to four items
		const amount = Math.floor(Math.random() * 4) + 1;
		while (this.order.length < amount) {
			const r = Math.floor(Math.random() * (this.productNames.length));
			const s = Math.floor(Math.random() * (this.orderWeights.length));
			const t = Math.floor(Math.random() * (this.products.length));
			const orderItem = { productName: this.productNames[r], productWeight: this.orderWeights[s], product: this.products[t] };
			if (orderItem && this.order.indexOf(orderItem) === -1) { this.order.push(orderItem); }
		}

		this.addStep('start');
		this.inProgress = true;

	}

	addStep(step: Step) {

		switch (step) {
			case 'slice':

				break;

			default:
				break;
		}

		if ((this.steps.length > 0) && (this.steps[this.steps.length - 1] === step)) return;

		this.steps.push(step);
	}

	withinTolerance(target: number, weight: number) {

		const diff = target - weight;
		const upper = target + this.faultTolerance;
		const lower = target - this.faultTolerance;

		return `${diff === 0
			? 'Perfect!' : weight > upper
				? 'Too Much' : weight < lower
					? 'Too Little' : 'Almost perfect'}`;
	}

}
