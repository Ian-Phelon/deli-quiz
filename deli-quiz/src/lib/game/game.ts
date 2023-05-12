import * as data from './data/index';

export class Game {

	productNames = data.getNames().length !== 0 ? data.getNames() : data.genericProductNames;
	products = data.getProducts().length !== 0 ? data.getProducts() : data.genericProducts;
	steps: string[] = [];
	order: Order[] = [];
	faultTolerance = 0.05;
	blade = ['closed', 'thin', 'sandwich', 'thick'];
	game: Game;
	win = false;
	onScale = 0;
	slicing?: Order;
	slices: number[] = [];
	waste: number[] = [];
	info?: string;
	warn?: string;
	actions = ['start', 'slice', 'weigh', 'bag', 'select'];
	orderWeights = data.standardWeights;
	cart: Order[] = [];
	selectedIndex = 0;


	constructor() {
		this.game = this;
		this.startGame();
	}


	step(step: Step, blade: number, order?: Order) {


		this.warn = undefined;
		this.info = undefined;

		step = step.toString();

		const orderIndex = this.orderIndex(step);

		if (orderIndex !== -1) { order = this.order[orderIndex]; this.selectedIndex = orderIndex; }

		if (step.includes('select-') && order) {
			this.info = `Selected: ${order.productName} ${order.product.product}`;
			this.onSlicer(order, blade);
		}

		if (step === 'slice' && this.slicing) {
			this.info = `Sliced ${this.slicing.product.slice} of ${this.slicing.product.product}`;
			if (this.slicing.product.slice === 0) {
				this.warn = 'Open the Slicer Blade';
			} else {
				this.slices.push(this.slicing.product.slice);
			};
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
			const result = this.withinTolerance(order.orderWeight, this.scaleWeight());
			const original = this.order[this.selectedIndex];
			if (result.withinTolerance) {
				// this.cart.push({ order: original, description: result.description, withinTolerance: result.withinTolerance });
				this.cart.push(original);
				this.cleanSlicer();
			} else {
				if (result.description === 'Too Much') {
					this.warn = `${this.scaleWeight()} is more than ${original.orderWeight}`;
				}
				//else Too Little
				else {
					this.warn = `${this.scaleWeight()} is less than ${original.orderWeight}`;
				}

			}
			this.info = result.description;
		}

		// this.order.sort((a, b) => { return this.orderSort(a, b); });
		// this.cart.sort((a, b) => { return this.orderSort(a, b); });
		this.winGame();
		// no repeats
		if ((this.steps.length > 0) && (this.steps[this.steps.length - 1] === step)) return;

		this.steps.push(step.toString());
		if (this.order.length === this.cart.length) { this.info = 'Win:endStep'; this.win = true; }

	}


	winGame(customer = this.order, cart = this.cart) {
		let check = 0;
		customer.forEach((e) => { if (cart.includes(e)) check++; });
		this.win = check === customer.length && customer.length === cart.length;
	}
	// this may need to sort by string
	orderSort(e1: Order, e2: Order): number {
		return e1.orderWeight < e2.orderWeight ? 1 : e1.orderWeight > e2.orderWeight ? -1 : 0;
	}

	onSlicer(order: Order, blade: number) {
		this.cleanSlicer();
		const product = { ...order.product };

		product.slice = this.sliceWeight(order, blade);

		const newProduct = { orderWeight: order.orderWeight, productName: order.productName, product: product };
		this.slicing = newProduct;
	}

	scaleWeight(): number {
		return this.slices[0] ? this.slices.reduce((n, m) => n + m, 0).toFixed3() : 0;
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
		// this.order =  this.generateOrder();
		// one to four items
		const amount = Math.floor(Math.random() * 4) + 1;
		while (this.order.length < amount) {
			const r = Math.floor(Math.random() * (this.productNames.length));
			const s = Math.floor(Math.random() * (this.orderWeights.length));
			const t = Math.floor(Math.random() * (this.products.length));
			const orderItem = { productName: this.productNames[r], orderWeight: this.orderWeights[s], product: this.products[t] };
			if (this.order.indexOf(orderItem) === -1) this.order.push(orderItem);
		}
		this.step('start', -1);
	}

	removeSlice() { this.slices[0] ?? this.slices.pop(); }

	cleanSlicer() {
		this.slicing = undefined;
		this.slices = [];
	}

	generateOrder(orderWeights = data.standardWeights,
		productNames = data.getNames().length !== 0 ? data.getNames() : data.genericProductNames,
		products = data.getProducts().length !== 0 ? data.getProducts() : data.genericProducts,
		max = 4) {
		const order: Order[] = [];
		const amount = Math.floor(Math.random() * max) + 1;
		while (order.length < amount) {
			const r = Math.floor(Math.random() * (productNames.length));
			const s = Math.floor(Math.random() * (orderWeights.length));
			const t = Math.floor(Math.random() * (products.length));
			const orderItem = { productName: productNames[r], orderWeight: orderWeights[s], product: products[t] };
			if (order.findIndex((e) => { e.product.product === orderItem.product.product; }) === -1) continue;
			if (order.indexOf(orderItem) === -1) order.push(orderItem);
		}
		return order;
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
	orderWeight: number;
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

class OrderGenerator {
	orderWeights = data.standardWeights;
	productNames = data.getNames()[0] ? data.getNames() : data.genericProductNames;
	products = data.getProducts()[0] ? data.getProducts() : data.genericProducts;
	order: Order[] = [];
	//one to four items, call with a different maximum amount to change
	generateOrder(max = 4) {
		this.order = [];
		const amount = Math.floor(Math.random() * max) + 1;
		while (this.order.length < amount) {
			const r = Math.floor(Math.random() * (this.productNames.length));
			const s = Math.floor(Math.random() * (this.orderWeights.length));
			const t = Math.floor(Math.random() * (this.products.length));
			const orderItem = { productName: this.productNames[r], orderWeight: this.orderWeights[s], product: this.products[t] };
			if (this.order.findIndex((e) => { e.product.product === orderItem.product.product; })) continue;
			if (this.order.indexOf(orderItem) === -1) this.order.push(orderItem);
		}
		return this.order;
	}
}
