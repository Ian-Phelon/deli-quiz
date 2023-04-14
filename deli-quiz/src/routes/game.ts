export class Game {

	steps: string[];
	order: ProductOrder[];
	productNames: string[];
	orderWeights: number[];
	products: string[];
	faultTolerance: number;

	constructor() {
		this.steps = [];
		this.productNames = ['Two Man\'s', 'Geraldo\'s', 'Patterson\'s', 'Valley Farms'];
		this.products = ['Ham', 'Turkey', 'Swiss', 'Roast Beef', 'Salami', 'Provolone', 'Cheddar'];
		this.orderWeights = [0.25, 0.33, 0.5, 0.66, 0.75, 1];
		this.order = [];
		this.faultTolerance = 0.05;
	}

	generateOrder(names = this.productNames, weights = this.orderWeights, products = this.products) {
		this.order = [];
		// one to four items
		const amount = Math.floor(Math.random() * 4)+1;

		while (this.order.length < amount) {
			const r = Math.floor(Math.random() * (names.length));
			const s = Math.floor(Math.random() * (weights.length));
			const t = Math.floor(Math.random() * (products.length));
			const orderItem = { productName: names[r], productWeight: weights[s], product: products[t] };
			if (orderItem && this.order.indexOf(orderItem) === -1) { this.order.push(orderItem); }
		}

		let firstStep = '';

		this.order.forEach(
			(req, index) => {
				firstStep += `${req.productWeight} of ${req.productName} ${req.product}${(index === (this.order.length - 1)) ? '' : ', '}`;
			});

		this.addStep(firstStep);

		return this.order;
	}

	addStep(step: string) {
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
////


type ProductOrder = {
	productName: string;
	productWeight: number;
	product: string;
};