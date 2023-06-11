export class Game {

	products: Product[];
	showcase: Product[] = [];
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
		const base = order.product.slice;
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
		const target = order.orderWeight;
		const actual = this.scaleWeight();

		this.step('bag');

		// if (!this.withinTolerance(target, actual)|| actual > target) {

		// }

		if (this.withinTolerance(target, actual)) {
			console.log('fuckerA');
			const fulfilled = { ...order, orderWeight: actual };
			if (this.cart.includes(fulfilled)) {
				console.log('fuckerB');
			}
			this.cart.push(fulfilled);
			console.log('fuckerC');
			this.cleanSlicer();
		} else {
			return false;
		}

		return true;
	}

	scaleWeight(slices = this.slices): number {
		return slices.reduce((n, m) => n + m, 0).toFixed3();
	}

	withinTolerance(orderWeight: number | undefined, actual: number | undefined) {
		if (!orderWeight || !actual || actual === 0) return false;

		const target = orderWeight;
		const upper = (target + this.faultTolerance).toFixed3();
		const lower = (target - this.faultTolerance).toFixed3();

		return actual <= upper && actual >= lower;
	}

	// generateOrder(showcase: Product[],) {
	generateOrder() {
		// one to four items
		const amount = rng(4, 1);
		const stock = amount * 2;
		const showcase = [];


		//if we assign a customer id to a product, we can add it to the showcase
		//with that id instead of the product id. i think we should change the
		//string input on the front end to a number, and make the customer id a
		//string. maybe something like 'customer' lol

		while (this.order.length < amount) {
			const r = rng(this.productNames.length);
			const s = rng(this.orderWeights.length);
			const t = rng(this.products.length);

			const orderItem = { productName: this.productNames[r], orderWeight: this.orderWeights[s], product: this.products[t] };

			const duplicate = this.order.some((e) => {
				const weight = e.orderWeight === orderItem.orderWeight;
				const product = e.product.product === orderItem.product.product;
				const name = e.productName === orderItem.productName;
				return name || weight || product;
			});

			if (!duplicate) this.order.push(orderItem);
		}



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
		// this.order.find((e) => { e.});
		return this.order[index];
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

export interface Order {
	orderWeight: number;
	productName: string;
	product: Product;
	//product id instead of name and such?
};

Number.prototype.toFixed3 = function (): number {
	return Math.round(Number(this) * 1000) / 1000;
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

// function showcase(order: Order[], products:Product[]): Product[] {
// 	const stock = order.length * 2;
// 	const names=[];
// 	order.forEach((e) => { names.push(e.productName); });


// 	return [];
// }