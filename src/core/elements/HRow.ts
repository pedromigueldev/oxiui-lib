import { Stack } from "./Stack.js";

export class HRow extends Stack {
	constructor() {
		super();
		this.horizontal().expand();
	}
}
