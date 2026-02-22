import type { IntrinsicElements } from "./html.js";

export type StyleProp<P> = P extends { style?: infer ST }
	? ST
	: string | Partial<CSSStyleDeclaration>;

export interface IComponent<K extends keyof IntrinsicElements> {
	index: string;
	props: IntrinsicElements[K];
	cursors: Set<string>;
	type: K;
	down: IComponent<keyof IntrinsicElements>[];
	up?: IComponent<keyof IntrinsicElements>;
	view?: () => void;
	body(fn: (component: this) => void): this;
	onAppear(fn: (component: this) => void): this;
	withProps<T extends Partial<IntrinsicElements[K]>>(newProps: T): this;
	withStyle(style: StyleProp<IntrinsicElements[K]>): this;
	withExtension(extension: (component: this) => void): this;
}

export interface IScreen<K extends keyof IntrinsicElements>
	extends IComponent<K> {
	render(): void;
}
