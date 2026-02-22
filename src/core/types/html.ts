export type EventHandler<E = Event> = (event: E) => void;

export type CommonProps = {
	id?: string;
	class?: string;
	style?: Partial<CSSStyleDeclaration>;
	title?: string;
	hidden?: boolean;

	onClick?: EventHandler<MouseEvent>;
	onInput?: EventHandler<InputEvent>;
	onChange?: EventHandler<Event>;
	onFocus?: EventHandler<FocusEvent>;
	onBlur?: EventHandler<FocusEvent>;
	onKeyDown?: EventHandler<KeyboardEvent>;
	onKeyUp?: EventHandler<KeyboardEvent>;

	content?: string | number | (() => string | number);
};

export type ButtonProps = CommonProps & {
	type?: "button" | "submit" | "reset";
	disabled?: boolean;
};

export type InputProps = CommonProps & {
	type?:
		| "text"
		| "email"
		| "password"
		| "number"
		| "date"
		| "time"
		| "datetime-local"
		| "month"
		| "week"
		| "url"
		| "search"
		| "tel"
		| "color";
	value?: string | number;
	placeholder?: string;
	required?: boolean;
	onTextChange?: EventHandler<string>;
};

export type SemanticText = {
	h1: CommonProps;
	h2: CommonProps;
	h3: CommonProps;
	h4: CommonProps;
	h5: CommonProps;
	body: CommonProps;
	p: CommonProps;
	span: CommonProps;
};

export type IntrinsicElements = {
	root: CommonProps;
	div: CommonProps;
	span: CommonProps;
	semanticText: {
		type: keyof SemanticText;
		props: CommonProps;
	};
	animation: CommonProps;
	button: ButtonProps;
	input: InputProps;
	form: CommonProps;
	label: CommonProps;
	a: CommonProps & { href?: string; target?: string };
	img: CommonProps & { src: string; alt?: string };
	textarea: CommonProps & { value?: string };
	text: { text: string };
};

function isObject(value: unknown): value is Record<string, unknown> {
	return typeof value === "object" && value !== null && !Array.isArray(value);
}

export function isCommonProps(props: unknown): props is CommonProps {
	if (!isObject(props)) return false;

	if ("id" in props && typeof props.id !== "string") return false;
	if ("class" in props && typeof props.class !== "string") return false;
	if ("title" in props && typeof props.title !== "string") return false;
	if ("hidden" in props && typeof props.hidden !== "boolean") return false;

	if ("content" in props) {
		const c = props.content;
		const valid =
			typeof c === "string" || typeof c === "number" || typeof c === "function";
		if (!valid) return false;
	}

	return true;
}
