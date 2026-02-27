import { intrinsicState } from "./OxiComponent.js";

export class OxiView extends intrinsicState("div") {
	constructor() {
		super();
		this.body();
	}
	View() {}

	override body() {
		return super.body(() => this.View());
	}
}
