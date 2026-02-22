import type { ButtonProps } from "../types/html.js";
import { intrinsic } from "./OxiComponent.js";

export class Button extends intrinsic("button") {
	constructor(text?: string, props?: ButtonProps) {
		super();
		this.withProps({ content: text ?? props?.content });
	}

	onClick(callback: () => void): this {
		this.withProps({ onClick: callback });
		return this;
	}
}
