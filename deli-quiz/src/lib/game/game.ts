export class Game {

	productNames: string[];
	products: Product[];
	steps: string[] = [];
	order: Order[] = [];
	faultTolerance = 0.05;
	bladeSetting = ['closed', 'thin', 'sandwich', 'thick'];
	blade = 0;
	winning = false;
	// onScale = 0;
	slicing?: Order;
	slicingIndex?: number;
	slices: number[] = [];
	waste: number[] = [];
	actions = ['start', 'slice', 'weigh', 'bag', 'select'];
	orderWeights: number[];
	cart: Order[] = [];
	selectedIndex = 0;


	constructor(orderData: OrderData) {
		this.products = orderData.products;
		this.productNames = orderData.productNames;
		this.orderWeights = orderData.orderWeights;
		this.faultTolerance = orderData.faultTolerance;
		this.generateOrder();
	}

	///////////////////
	private iStep(step: Step) {
		// no repeats
		if ((this.steps.length > 0) && (this.steps[this.steps.length - 1] === step)) return;

		this.steps.push(step.toString());
	}

	setSlicingIndex(index: number) {
		this.slicingIndex = index;
		this.slicing = this.getOrderByIndex(index);
		this.iStep('select');
		console.log(`Selected! slicingIndex: ${index}`, this.getOrderByIndex(index));
	}

	adjustBlade(blade: number) {
		this.blade = blade;
		this.iStep('blade');
		console.log('Set blade:', blade);
		return this.blade;
	}

	slice(blade: number, index = this.slicingIndex) {

		if (typeof index === 'undefined') return;

		const order = this.getOrderByIndex(index);
		const base = order.product.slice;
		let weight = 0;

		if (blade === -1) { weight = base; }
		else if (blade === 0) { weight = 0; }
		else if (blade === 1) { weight = base - .004; }
		else if (blade === 3) { weight = base + .004; }
		else { weight = base; }

		this.slices.push(weight.toFixed3());
		console.log(`Sliced! og: ${base}, current: ${weight}, all: ${this.slices} = ${this.scaleWeight()}`);
		return this.slices;
	}

	iWeigh() {
		//
		console.log('Weighed! ', this.scaleWeight());
		this.iStep('weigh');
		return this.scaleWeight();
	}

	iBag(index: number) {
		console.log('bag?');
		// if (!index) return;
		console.log('bag??????????');
		//validate
		const order = {...this.getOrderByIndex(index)};
		const target = order.orderWeight;
		const actual = this.scaleWeight();
		if (this.withinTolerance(target, actual)) {
			const fulfilled = { ...order, orderWeight: actual };
			this.cart.push(fulfilled);
			this.cleanSlicer();
		}

		console.log('Bagged!', this.cart);
		this.iStep('bag');
		// return this.cart;
	}

	///////////////////


	// step(step: Step, blade: number, order?: Order) {
	// 	const orderIndex = this.orderIndex(order || step);
	// 	step = step.toString();

	// 	if (orderIndex !== -1) order = this.order[orderIndex];

	// 	if (step.includes('select-') && order) {
	// 		this.setSliceWeight(order, blade);
	// 	}

	// 	if (step === 'slice' && this.slicing) {
	// 		if (this.slicing.product.slice !== 0) this.slices.push(this.slicing.product.slice);
	// 	}

	// 	if (step === 'blade' && order) {
	// 		this.setSliceWeight(order, blade);
	// 	}

	// 	if (step === 'bag' && order && this.slicingIndex) {
	// 		//evaluate if the slices' weight is within tolerance
	// 		const result = this.withinTolerance(order.orderWeight, this.scaleWeight());
	// 		/// order index isn't set because this is not select-
	// 		const original = this.order[this.orderIndex(order)];
	// 		if (result.withinTolerance) {
	// 			// this.cart.push({ order: original, description: result.description, withinTolerance: result.withinTolerance });
	// 			this.cart.push(original);
	// 			this.cleanSlicer();
	// 		}
	// 	}
	// 	this.winGame();
	// 	// no repeats
	// 	if ((this.steps.length > 0) && (this.steps[this.steps.length - 1] === step)) return;

	// 	this.steps.push(step.toString());
	// 	if (this.order.length === this.cart.length) this.win = true;

	// }


	winGame(customer = this.order, cart = this.cart) {
		let check = 0;
		customer.forEach((e) => { if (cart.includes(e)) check++; });
		this.winning = check === customer.length && customer.length === cart.length;
		return this.winning;
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
		this.iStep('start');
	}



	removeSlice(slices = this.slices) { slices[0] ?? slices.pop(); }

	cleanSlicer() {
		this.slicing = undefined;
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