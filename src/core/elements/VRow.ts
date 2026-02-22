import { Stack } from "./Stack.js";

export class VRow extends Stack {
	constructor() {
		super();
		this.vertical().expand();
	}
}
