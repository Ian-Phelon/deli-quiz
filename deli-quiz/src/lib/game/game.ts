export class Game {

	products: Product[];
	showcase: Order[] = [];
	productNames: string[];
	orderWeights: number[];
	steps: string[] = [];
	order: Order[] = [];
	faultTolerance: number;
	sliceIncrement: number;
	bladeSetting = ['closed', 'thin', 'sandwich', 'thick'];
	blade = 0;
	slices: number[] = [];
	waste: number[] = [];
	cart: Order[] = [];

	constructor(orderData: OrderData) {
		this.products = orderData.products;
		this.productNames = orderData.productNames;
		this.orderWeights = orderData.orderWeights;
		this.faultTolerance = orderData.faultTolerance;
		this.sliceIncrement = orderData.sliceIncrement;

		this.generateOrder();
	}

	private step(step: Step) {
		// no repeats
		if ((this.steps.length > 0) && (this.steps[this.steps.length - 1] === step)) return;

		this.steps.push(step.toString());
	}

	setBlade(blade: number) {
		this.blade = blade;
		this.step('blade');
		return this.blade;
	}

	slice(blade: number, index: number) {
		this.step('slice');

		if (blade === 0) return 0;

		const order = this.showcase[index];
		const base = order.slice;
		const slice = this.adjustedSlice(blade, base, this.sliceIncrement);

		this.slices.push(slice.toFixed3());

		return this.slices.length;
	}

	weigh() {
		this.step('weigh');
		return this.scaleWeight();
	}

	bag(index: number) {
		this.step('bag');

		const order = { ...this.showcase[index] };
		const target = order.weight;

		const fulfillOrder = (input: Order, weight: number) => { return { ...input, weight: weight }; };

		if (this.scaleWeight() > target) {
			this.excessToWaste(target);
		}

		const actual = this.scaleWeight()
		const withinTolerance = this.withinTolerance(target, actual);

		if (withinTolerance) {
			const fulfilled = fulfillOrder(order, actual);
			if (this.cart.includes(fulfilled)) {
				return false;
			}
			this.cart.push(fulfilled);
			this.cleanSlicer();
			return true;
		}
		return false;
	}

	scaleWeight(slices = this.slices): number {
		return slices.reduce((n, m) => n + m, 0).toFixed3();
	}

	withinTolerance(target: number, actual = this.scaleWeight()) {
		if (actual === 0) return false;

		const upper = (target + this.faultTolerance).toFixed3();
		const lower = (target - this.faultTolerance).toFixed3();

		return actual <= upper && actual >= lower;
	}

	generateOrder() {
		// one to four items
		// const order = rng(4, 1);
		const order = 1;
		const stock = order * 2;

		while (this.showcase.length < stock) {
			const r = rng(this.productNames.length);
			const s = rng(this.products.length);

			const orderItem = { producer: this.productNames[r], ...this.products[s], weight: 0 };

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

	excessToWaste(target: number, slices = this.slices) {
		this.step('waste');

		let weight = this.scaleWeight();
		let withinTolerance = this.withinTolerance(target, weight);

		while (!withinTolerance) {
			const slice = this.slices.pop() ?? this.sliceIncrement;
			weight = this.scaleWeight(slices);
			this.waste.push(slice);
			withinTolerance = this.withinTolerance(target, weight) || weight < target;
		}
		while (weight < target) {
			this.slices.push(this.sliceIncrement);
			weight = this.scaleWeight();
		}

		return slices;
	}

	cleanSlicer() {
		this.slices = [];
	}

	selectOrder(index: number) {
		this.step('select');
		const show = this.showcase[index];
		return this.order.indexOf(show);
	}

	adjustedSlice(blade: number, base: number, increment: number) {
		let weight;
		if (blade === 0) { weight = 0; }
		else if (blade === 1) { weight = base - increment; }
		else if (blade === 3) { weight = base + increment; }
		else { weight = base; }
		return weight;
	}

	orderToString(index: number) {
		if (index === -1) return 'Nothing to slice.';
		const order = this.showcase[index];
		return order.weight === 0 ? `${order.producer} ${order.product} was not ordered.` : `${order.weight} of ${order.producer} ${order.product}`;
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
	// stringified(): string;
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
	sliceIncrement: number;
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