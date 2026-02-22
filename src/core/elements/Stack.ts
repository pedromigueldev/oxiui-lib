import { intrinsic } from "./OxiComponent.js";

export class Stack extends intrinsic("div") {
	constructor() {
		super();
		this.withStyle({
			display: "flex",
		});
	}

	verticalAlignment(value: "top" | "center" | "bottom"): this {
		return this.withStyle({
			alignItems:
				value === "top"
					? "flex-start"
					: value === "center"
						? "center"
						: "flex-end",
		});
	}

	horizontalAlignment(value: "left" | "center" | "right"): this {
		return this.withStyle({
			justifyContent:
				value === "left"
					? "flex-start"
					: value === "center"
						? "center"
						: "flex-end",
		});
	}

	expand(): this {
		return this.withStyle({ flex: "1" });
	}

	horizontal(): this {
		return this.withStyle({ flexDirection: "row" });
	}

	vertical(): this {
		return this.withStyle({ flexDirection: "column" });
	}
}
