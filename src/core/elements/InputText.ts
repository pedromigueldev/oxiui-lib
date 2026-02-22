import { intrinsic } from "./AbaComponent.js";

export class TextInput extends intrinsic("input") {
	constructor() {
		super();
	}

	value(value: string | number) {
		this.props.value = value;
		return this;
	}

	placeholder(text: string) {
		this.props.placeholder = text;
		return this;
	}

	required(required: boolean = true) {
		this.props.required = required;
		return this;
	}

	onChangeText(fn: (value: string) => void) {
		this.props.onTextChange = (text: string) => {
			fn(text);
		};
		return this;
	}
}
