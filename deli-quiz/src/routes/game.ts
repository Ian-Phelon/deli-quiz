export class Game {

	steps: string[] = [];
	order: Order[] = [];
	faultTolerance = 0.05;
	blade = ['closed', 'thin', 'sandwich', 'thick'];
	// blade: Blade;
	game: Game;
	inProgress = false;
	slicing?: Order;
	slices: number[] = [];
	// info: string[] = [];
	info = '';
	actions = ['start', 'slice', 'weigh', 'bag'];
	products = [
		{ product: 'Ham', slice: 0.05 }, { product: 'Turkey', slice: 0.05 },
		{ product: 'Swiss', slice: 0.049 }, { product: 'Roast Beef', slice: 0.065 }, { product: 'Salami', slice: 0.025 }, { product: 'Provolone', slice: 0.036 }, { product: 'Cheddar', slice: 0.05 }, { product: 'American', slice: 0.036 },
	];
	orderWeights = [0.25, 0.333, 0.5, 0.666, 0.75, 1];
	productNames = ['Two Man\'s', 'Geraldo\'s', 'Patterson\'s', 'Valley Farms'];
	cart = [];


	constructor() {
		// why
		this.game = this;

	}

	step(step: Step, blade: number, product?: Order) {

		step = step.toString();
		let order = product;
		const orderIndex = this.orderIndex(step);

		if (orderIndex !== -1) { order = this.order[orderIndex]; }

		if (step.includes('select-') && order) {
			this.info = `Selected: ${order.productName} ${order.product.product}`;
			this.onSlicer(order, blade);
		}

		if (step === 'slice' && this.slicing) {
			this.info = `Sliced ${this.slicing.product.slice} of ${this.slicing.product.product}`;
			this.slices.push(this.slicing.product.slice);
		}

		if (step === 'blade' && order) {
			this.onSlicer(order, blade);
		}

		if ((this.steps.length > 0) && (this.steps[this.steps.length - 1] === step)) return;

		this.steps.push(step.toString());
	}

	onSlicer(order: Order, blade: number) {
		this.slicing = undefined;
		const product = { ...order.product };
		const weight = this.sliceWeight(order, blade);

		product.slice = weight;

		const newProduct = { productWeight: order.productWeight, productName: order.productName, product: product };
		this.slicing = newProduct;
	}

	evaluateOrderItem(item: Order) {
		const target = item.productWeight;
		const weight = this.slices.reduce((n, m) => n + m, 0);
		return `Expected: ${item.productWeight} and got ${weight} ${this.withinTolerance(target, weight)}`;
	}

	withinTolerance(target: number, weight: number) {

		let diff = target - weight;
		const upper = target + this.faultTolerance;
		const lower = target - this.faultTolerance;

		diff = Math.round(diff * 1000) / 1000;

		return `${diff === 0
			? 'Perfect!' : weight > upper
				? 'Too Much' : weight < lower
					? 'Too Little' : 'Almost perfect'}`;
	}

	sliceWeight(item: Order, blade: number): number {
		let weight: number;
		const list = this.products;
		const base = list.filter((p) => {
			return p.product === item.product.product;
		})[0].slice;

		if (blade === 0) { weight = 0; }
		else if (blade === 1) { weight = base - .004; }
		else if (blade === 3) { weight = base + .004; }
		else {
			weight = base;
		}
		//	more accurate than toFixed. do this for any amount of decimal places, and a zero for each digit after the decimal (10=1, 100=2, 1000=3) 
		return Math.round(weight * 1000) / 1000;
	}

	orderIndex(step: Step) {
		const match = new RegExp(/select-[0-9]/g).test(step.toString());
		return match ? +(step.toString().split('-')[1]) : - 1;
	}

	// bagUp(orderIndex: number) {
	// 	const index = this.order.indexOf(orderIndex);
	// 	if (index > -1) { // only splice array when item is found
	// 		array.splice(index, 1); // 2nd parameter means remove one item only
	// 	}
	// 	this.order.splice()
	// }

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

		this.step('start', -1);
		this.inProgress = true;
	}

}


type Step = string | (() => string);

interface Product {
	producer?: string;
	product: string;
	slice: number;
	variants?: Product[];
};

export interface Order {
	productWeight: number;
	productName: string;
	product: Product;
};
