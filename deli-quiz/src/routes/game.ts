export const products: Product[] = [
	{ product: 'Ham', slice: 0.05 }, { product: 'Turkey', slice: 0.05 },
	{ product: 'Swiss', slice: 0.049 }, { product: 'Roast Beef', slice: 0.065 }, { product: 'Salami', slice: 0.025 }, { product: 'Provolone', slice: 0.036 }, { product: 'Cheddar', slice: 0.05 }, { product: 'American', slice: 0.036 },
];

export const productNames = ['Two Man\'s', 'Geraldo\'s', 'Patterson\'s', 'Valley Farms'];

export const orderWeights = [0.25, 0.333, 0.5, 0.666, 0.75, 1];

export const blade = ['closed', 'thin', 'sandwich', 'thick'];

// export const selectIndex = (str: string) => new
//  RegExp(/select-[0-9]/g).test(str) ? -1 : +str.split('-')[1];

// type Blade = typeof blade[number];

// export const sliceWeight = [0.02, 0.5,];
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

	constructor() {
		// why
		this.game = this;

	}



	/**
	 *	Take a step and parse it to commit an action. We always have a step. 
	 *	@param step what step? => add to steps[]
	 *	@param bladeThickness get blade thickness from range slider => indicates a
	 *	modifier is needed on the slice weight of the product.product.slice
	 *	@param product an Order item => combined with bladeThickness, step() will
	 *	set the value to be inserted into game.slices[]
	*/
	step(step: Step, blade: number, product?: Order) {
		console.log('stepping', step);
		step = step.toString();
		let order = product;
		// step was called with a product
		this.info = 'Select Product';
		const orderIndex = this.orderIndex(step);
		if (orderIndex !== -1) { order = this.order[orderIndex]; }

		if (order) {
			this.slicing = this.onSlicer(order, blade);
			// order = 




			//step was not called with a product, so we have to find one

			if (step.includes('select-')) {
				this.info = `Selected`;
				const weight = this.sliceWeight(order, blade);
				if (typeof weight === 'string') { this.info = weight; }
				else {
					this.onSlicer(order, blade);
				}
			}

		}
		if (step === 'slice' && this.slicing) {
			this.info = `Sliced ${this.slicing.product.slice}`;
			this.slices.push(this.slicing.product.slice);
		}


		if (step === 'blade' && order) {
			this.onSlicer(order, blade);
			console.log('blade', this.slicing);
		}


		if ((this.steps.length > 0) && (this.steps[this.steps.length - 1] === step)) return;
		this.steps.push(step.toString());
	}


	/** 
	 * returns a new Order with an adjusted slice weight and sets this.slicing to
	 * the new order
	*/
	onSlicer(order: Order, blade: number): Order {
		const product = order.product;
		const weight = +this.sliceWeight(order, blade);
		product.slice = weight;
		const newProduct = { productWeight: order.productWeight, productName: order.productName, product: product };
		this.slicing = newProduct;
		return newProduct;
	}

	evaluateOrderItem(item: Order) {
		const target = item.productWeight;
		const weight = this.slices.reduce((n, m) => n + m, 0);
		return this.withinTolerance(target, weight);
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

	sliceWeight(item: Order, blade: number) {

		let weight;
		const ok = item.product.product;
		console.log('ok', ok);
		switch (blade) {
			case 0:
				weight = 0;
				break;
			case 1:
				weight = item.product.slice - .004;
				// this.info = 'Thin Slices';
				break;
			case 2:
				weight = products.filter((p) => { p.product == item.product.product; }).slice;
				break;
			case 3:
				weight = item.product.slice + .004;
				// this.info = 'Thick Slices';
				break;
			default:
				weight = products.filter((p) => { p.product == item.product.product; }).slice;
				// this.info = 'Sandwich Slices';
				break;
		}

		return weight;
	}

	/** 
	 * @description tests if the step starts with select- and ends in a number
	 * @description true: returns an order[] index number
	 * @description false: returns -1
	*/
	orderIndex(step: Step) {
		const match = new RegExp(/select-[0-9]/g).test(step.toString());
		return match ? +step.toString().split('-')[1] : - 1;
	}

	startGame() {
		this.order = [];
		// one to four items
		const amount = Math.floor(Math.random() * 4) + 1;
		while (this.order.length < amount) {
			const r = Math.floor(Math.random() * (productNames.length));
			const s = Math.floor(Math.random() * (orderWeights.length));
			const t = Math.floor(Math.random() * (products.length));
			const orderItem = { productName: productNames[r], productWeight: orderWeights[s], product: products[t] };
			if (orderItem && this.order.indexOf(orderItem) === -1) { this.order.push(orderItem); }
		}

		this.step('start', -1);
		this.inProgress = true;
	}

}
