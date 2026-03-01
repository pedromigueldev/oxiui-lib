import { VRow } from "./VRow.js";

export class OxiView extends VRow {
	#$rendered = false;
	constructor(public onInit?: boolean) {
		super();
		this.body();
	}

	View() {}
	override body() {
		if (!this.#$rendered) {
			this.#$rendered = true;
			return super.body(() => this.View());
		}
		return this;
	}
}
