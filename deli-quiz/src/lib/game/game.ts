export class Game {

	products: Product[];
	productNames: string[];
	orderWeights: number[];
	steps: string[] = [];
	order: Order[] = [];
	faultTolerance = 0.05;
	bladeSetting = ['closed', 'thin', 'sandwich', 'thick'];
	blade = 0;
	slicing?: Order;
	slicingIndex?: number;
	slices: number[] = [];
	waste: number[] = [];
	cart: Order[] = [];


	constructor(orderData: OrderData) {
		this.products = orderData.products;
		this.productNames = orderData.productNames;
		this.orderWeights = orderData.orderWeights;
		if (orderData.faultTolerance) {
			this.faultTolerance = orderData.faultTolerance;
		}
		this.generateOrder();
	}

	private step(step: Step) {
		// no repeats
		if ((this.steps.length > 0) && (this.steps[this.steps.length - 1] === step)) return;

		this.steps.push(step.toString());
	}

	select(index: number) {
		this.slicingIndex = index;
		this.slicing = this.getOrderByIndex(index);
		this.step('select');
	}

	setBlade(blade: number) {
		this.blade = blade;
		this.step('blade');
	}

	slice(blade = this.blade, index = this.slicingIndex) {

		if (blade === 0 || typeof index === 'undefined') return;

		const order = this.getOrderByIndex(index);
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

	bag(index:number) {
		const order = { ...this.getOrderByIndex(index) };
		const target = order.orderWeight;
		const actual = this.scaleWeight();

		if (this.withinTolerance(target, actual)) {
			const fulfilled = { ...order, orderWeight: actual };
			this.cart.push(fulfilled);
			this.cleanSlicer();
		} 

		this.step('bag');
	}

	scaleWeight(): number {
		return this.slices.reduce((n, m) => n + m, 0).toFixed3();
	}

	withinTolerance(target = 99, actual = 0) {
		const upper = (target + this.faultTolerance).toFixed3();
		const lower = (target - this.faultTolerance).toFixed3();

		return actual <= upper && actual >= lower;
	}

	generateOrder() {
		// one to four items
		const amount = Math.floor(Math.random() * 4) + 1;

		while (this.order.length < amount) {
			const r = Math.floor(Math.random() * (this.productNames.length));
			const s = Math.floor(Math.random() * (this.orderWeights.length));
			const t = Math.floor(Math.random() * (this.products.length));

			const orderItem = { productName: this.productNames[r], orderWeight: this.orderWeights[s], product: this.products[t] };

			const duplicate = this.order.some((e) => {
				const weight = e.orderWeight === orderItem.orderWeight;
				const product = e.product.product === orderItem.product.product;
				const name = e.productName === orderItem.productName;
				return name || weight || product;
			});

			if (!duplicate) this.order.push(orderItem);
		}

		this.step('start');
	}

	removeSlice(slices = this.slices) { slices[0] ?? slices.pop(); }

	cleanSlicer() {
		this.slicing = undefined;
		this.slicingIndex = undefined;
		this.slices = [];
	}

	getOrderByIndex(index: number) {
		return this.order[index];
	}

}

type Step = string | (() => string);

export interface Product {
	producer?: string;
	product: string;
	slice: number;
	variants?: Product[];
};

export interface Order {
	orderWeight: number;
	productName: string;
	product: Product;
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