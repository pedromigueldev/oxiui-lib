import { intrinsicState } from "./OxiComponent.js";

export class OxiView extends intrinsicState("div") {
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
