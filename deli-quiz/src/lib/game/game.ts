export class Game {

	products: Product[];
	showcase: Order[] = [];
	productNames: string[];
	orderWeights: number[];
	steps: string[] = [];
	order: Order[] = [];
	faultTolerance: number;
	bladeSetting = ['closed', 'thin', 'sandwich', 'thick'];
	blade = 0;
	slices: number[] = [];
	waste: number[] = [];
	cart: Order[] = [];
	// showcase: Product[];


	constructor(orderData: OrderData) {
		this.products = orderData.products;
		this.productNames = orderData.productNames;
		this.orderWeights = orderData.orderWeights;
		this.faultTolerance = orderData.faultTolerance;

		this.generateOrder();
	}

	private step(step: Step) {
		// no repeats
		if ((this.steps.length > 0) && (this.steps[this.steps.length - 1] === step)) return;

		this.steps.push(step.toString());
	}

	select() {
		this.step('select');
	}

	setBlade(blade: number) {
		this.blade = blade;
		this.step('blade');
	}

	slice(blade: number, index: number) {

		if (blade === 0) return;

		const order = this.getOrder(index);
		const base = order.slice;
		let weight = 0;

		if (blade === -1) { weight = base; }
		else if (blade === 0) { weight = 0; }
		else if (blade === 1) { weight = base - .004; }
		else if (blade === 3) { weight = base + .004; }
		else { weight = base; }

		weight = weight.toFixed3();

		this.slices.push(weight);

		return weight;
	}

	weigh() {
		this.step('weigh');
	}

	bag(index: number) {
		const order = { ...this.getOrder(index) };
		const target = order.weight;
		const actual = this.scaleWeight();

		this.step('bag');

		// if (!this.withinTolerance(target, actual)|| actual > target) {

		// }

		if (this.withinTolerance(target, actual)) {
			const fulfilled = { ...order, orderWeight: actual };
			if (this.cart.includes(fulfilled)) {
				return false;
			}
			this.cart.push(fulfilled);
			this.cleanSlicer();
		} else {
			return false;
		}

		return true;
	}

	scaleWeight(slices = this.slices): number {
		return slices.reduce((n, m) => n + m, 0).toFixed3();
	}

	withinTolerance(target: number, actual: number) {
		if (actual === 0) return false;

		// const target = orderWeight;
		const upper = (target + this.faultTolerance).toFixed3();
		const lower = (target - this.faultTolerance).toFixed3();

		return actual <= upper && actual >= lower;
	}

	// generateOrder(showcase: Product[],) {
	generateOrder() {
		// one to four items
		const order = rng(4, 1);
		const stock = order * 2;
		// const showcase = [];


		while (this.showcase.length < stock) {
			const r = rng(this.productNames.length);
			// const s = rng(this.orderWeights.length);
			const t = rng(this.products.length);

			const orderItem = { producer: this.productNames[r], ...this.products[t], weight: 0 };

			const duplicate = this.showcase.some((e) => {
				return e.product === orderItem.product;
			});

			if (!duplicate) this.showcase.push(orderItem);
		}

		for (let i = 0; i < order; i++) {
			const weights = [...this.orderWeights];
			this.showcase[i].weight = weights.shuffle().pop() ?? 1;
			this.order[i] = this.showcase[i];
		}

		this.showcase.shuffle();

		this.step('order');
	}

	excessToWaste(slices: number[], target: number) {
		let weight = this.scaleWeight(slices);

		while (!this.withinTolerance(target, weight)) {
			if (weight <= target) { break; }
			const slice = slices.pop() ?? 0;
			weight = this.scaleWeight(slices);
			this.waste.push(slice);
		}
		this.step('waste');
		return slices;
	}

	cleanSlicer() {
		this.slices = [];
	}

	getOrder(index: number) {
		return this.showcase[index];
	}

}

type Step = string | (() => string);

export interface Product {
	producer?: string;
	product: string;
	slice: number;
	id?: string | number;
	variants?: Product[];
};

export interface Order extends Product {
	weight: number;
	// orderWeight: number;
	// productName: string;
	// product: Product;
	//product id instead of name and such?
};

Number.prototype.toFixed3 = function (): number {
	return Math.round(Number(this) * 1000) / 1000;
};

Array.prototype.shuffle = function () {
	return this.sort(() => Math.random() - 0.5);
};

export interface OrderData {
	products: Product[];
	productNames: string[];
	orderWeights: number[];
	faultTolerance: number;
}
/**
 * @param max = 1
 * @param min = 0
 * @returns {number} A single digit number, max and min inclusive
 * 
 */
export function rng(max = 1, min = 0): number {
	return Math.floor(Math.random() * max) + min;
}

export function shuffle<T>(array: T[]) {
	return array.sort(() => Math.random() - 0.5);
}

// function showcase(order: Order[], products:Product[]): Product[] {
// 	const stock = order.length * 2;
// 	const names=[];
// 	order.forEach((e) => { names.push(e.productName); });


// 	return [];
// }