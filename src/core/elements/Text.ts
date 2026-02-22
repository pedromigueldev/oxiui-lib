import type { SemanticText } from "../types/html.js";
import { intrinsic } from "./AbaComponent.js";

export class Text extends intrinsic("semanticText") {
	constructor(text: string | number | (() => string | number)) {
		super();

		this.props = {
			type: "span",
			props: {
				content: text,
			},
		};
	}

	override withStyle(style: string | Partial<CSSStyleDeclaration>): this {
		this.props.props.style = style;
		return this;
	}

	private setType(type: keyof SemanticText) {
		this.props.type = type;
		return this;
	}

	asTitle() {
		return this.setType("h1");
	}

	asSubtitle() {
		return this.setType("h2");
	}

	asH3() {
		return this.setType("h3");
	}

	asH4() {
		return this.setType("h4");
	}

	asH5() {
		return this.setType("h5");
	}

	asBody() {
		return this.setType("body");
	}

	asParagraph() {
		return this.setType("p");
	}
}
