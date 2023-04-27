export class Game {

	steps: string[] = [];
	order: Order[] = [];
	faultTolerance = 0.05;
	blade = ['closed', 'thin', 'sandwich', 'thick'];
	game: Game;
	inProgress = false;
	win = false;
	onScale = 0;
	slicing?: Order;
	slices: number[] = [];
	waste: number[] = [];
	info?: string;
	warn?: string;
	actions = ['start', 'slice', 'weigh', 'bag', 'select'];
	products = [
		{ product: 'Ham', slice: 0.05 }, { product: 'Turkey', slice: 0.05 },
		{ product: 'Swiss', slice: 0.049 }, { product: 'Roast Beef', slice: 0.065 }, { product: 'Salami', slice: 0.025 }, { product: 'Provolone', slice: 0.036 }, { product: 'Cheddar', slice: 0.05 }, { product: 'American', slice: 0.036 },
	];
	orderWeights = [0.25, 0.333, 0.5, 0.666, 0.75, 1];
	productNames = ['Two Man\'s', 'Geraldo\'s', 'Patterson\'s', 'Valley Farms'];
	cart: Order[] = [];


	constructor() {
		this.game = this;
	}

	step(step: Step, blade: number, order?: Order) {

		this.warn = undefined;
		this.info = undefined;

		step = step.toString();

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

		if (step === 'blade') {
			if (order) {
				this.onSlicer(order, blade);
			}
			else {
				this.warn = 'No Product Selected';
			}
			this.info = `Blade set to ${this.blade[blade]}`;

		}

		if (step === 'weigh') {
			this.info = `Scale: ${this.scaleWeight()}`;
			// set a warning, add a step, and exit the function?
			if (!this.slicing || !order) {
				this.warn = 'Nothing sliced yet';
			}
			this.onScale = this.scaleWeight();
		}

		if (step === 'bag' && order) {
			//evaluate if the slices' weight is within tolerance
			const result = this.withinTolerance(order.productWeight, this.scaleWeight());
			const original = this.order[orderIndex];
			///TODO:	this currently does not account for almost perfect
			if (result.withinTolerance || result.description === 'Perfect!') {
				// this.cart.push({ order: original, description: result.description, withinTolerance: result.withinTolerance });
				this.slicing = undefined;
				this.slices = [];
				this.cart.push(order);
			} else {
				if (result.description === 'Too Much') {
					this.warn = `${this.scaleWeight()} is more than ${original.productWeight}`;
				}
				//else Too Little
				else {
					this.warn = `${this.scaleWeight()} is less than ${original.productWeight}`;
				}

			}
			this.info = result.description;
		}

		// if (!order && step !== 'start') return;
		if ((this.steps.length > 0) && (this.steps[this.steps.length - 1] === step)) return;

		this.steps.push(step.toString());
		if (this.order.length === this.cart.length) { this.info = 'Win'; this.win = true; }
	}

	onSlicer(order: Order, blade: number) {
		this.slicing = undefined;
		const product = { ...order.product };

		product.slice = this.sliceWeight(order, blade);

		const newProduct = { productWeight: order.productWeight, productName: order.productName, product: product };
		this.slicing = newProduct;
	}

	scaleWeight(): number {
		if (this.slices.length === 0) return 0;
		return this.slices.reduce((n, m) => n + m, 0).toFixed3();
	}

	withinTolerance(target: number, weight: number): { withinTolerance: boolean; description: string; } {
		const diff = (target - weight).toFixed3();
		const upper = (target + this.faultTolerance).toFixed3();
		const lower = (target - this.faultTolerance).toFixed3();
		const description = `${diff === 0
			? 'Perfect!' : weight > upper
				? 'Too Much' : weight < lower
					? 'Too Little' : 'Almost perfect'}`;

		return {
			withinTolerance: diff === 0 || (weight <= upper && weight >= lower),
			description: description
		};
	}

	sliceWeight(item: Order, blade: number): number {
		let weight;
		const list = this.products;
		const base = list.filter((p) => {
			return p.product === item.product.product;
		})[0].slice;

		if (blade === -1) { weight = item.product.slice; }
		else if (blade === 0) { weight = 0; }
		else if (blade === 1) { weight = base - .004; }
		else if (blade === 3) { weight = base + .004; }
		else {
			weight = base;
		}
		return weight.toFixed3();
	}

	/**returns -1 if step !== select-x, x if true */
	orderIndex(step: Step) {
		const match = new RegExp(/select-[0-9]/g).test(step.toString());
		return match ? +(step.toString().split('-')[1]) : - 1;
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
			if (this.order.indexOf(orderItem) === -1) this.order.push(orderItem); 
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

interface Order {
	productWeight: number;
	productName: string;
	product: Product;
};

// interface FulfilledOrder {
// 	order: Order,
// 	withinTolerance: boolean,
// 	description: string;

// }

Number.prototype.toFixed3 = function (): number {
	return Math.round(Number(this) * 1000) / 1000;
};