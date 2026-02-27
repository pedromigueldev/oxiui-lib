import { scheduleEffect } from "../scheduler.js";
import { Signal } from "../signals.js";
import { close, current, open } from "../tree.js";
import type { IComponent, StyleProp } from "../types/component.js";
import type { CommonProps, IntrinsicElements } from "../types/html.js";

export class OxiComponent<K extends keyof IntrinsicElements>
	implements IComponent<K>
{
	#__states = new Map<string | symbol, Signal<unknown>>();
	type: K;
	props: IntrinsicElements[K];
	up?: IComponent<keyof IntrinsicElements>;
	down: IComponent<keyof IntrinsicElements>[] = [];
	cursors: Set<string> = new Set();
	index: string;
	view?: (() => void) | undefined;

	constructor(type: K, props?: IntrinsicElements[K]) {
		const parent = current() as IComponent<keyof IntrinsicElements> | undefined;

		this.type = type;
		this.props = props ?? ({} as IntrinsicElements[K]);
		this.up = parent;

		const position = parent ? parent.down.length : 0;
		this.index = parent ? `${parent.index}.${position}` : "0";

		parent?.down.push(this as IComponent<K>);
	}

	body(fn?: (component: this) => void) {
		open(this);
		fn?.(this);
		close();
		return this;
	}

	onAppear(fn: (component: this) => void) {
		open(this);
		scheduleEffect(() => fn(this));
		close();
		return this;
	}

	withProps<T extends Partial<IntrinsicElements[K]>>(newProps: T) {
		open(this);
		this.props = { ...this.props, ...newProps };
		close();
		return this;
	}

	withStyle(style: StyleProp<IntrinsicElements[K]>) {
		open(this);

		const currentStyle = (this.props as CommonProps).style;

		if (typeof style === "object" && typeof currentStyle === "object") {
			this.props = {
				...this.props,
				style: { ...currentStyle, ...style },
			};
		} else {
			this.props = {
				...this.props,
				style,
			};
		}

		close();
		return this;
	}

	withExtension(extension: (component: this) => void): this {
		open(this);
		extension(this);
		close();
		return this;
	}

	withState(): this {
		return new Proxy(this, {
			get(target, prop, receiver) {
				if (typeof prop === "string" && prop.startsWith("$")) {
					let signal = target.#__states.get(prop);

					if (!signal) {
						open(target);
						signal = new Signal(Reflect.get(target, prop, receiver));
						target.#__states.set(prop, signal);
						close();
					}

					return signal.value;
				}

				return Reflect.get(target, prop, receiver);
			},

			set(target, prop, value, receiver) {
				if (typeof prop === "string" && prop.startsWith("$")) {
					let signal = target.#__states.get(prop);

					open(target);
					if (!signal) {
						signal = new Signal(value);
						target.#__states.set(prop, signal);
					} else {
						signal.value = value;
					}
					close();
					return true;
				}

				return Reflect.set(target, prop, value, receiver);
			},
		}) as this;
	}
}

export function intrinsic<K extends keyof IntrinsicElements>(type: K) {
	return class extends OxiComponent<K> {
		constructor(props?: IntrinsicElements[K]) {
			super(type, props);
		}
	};
}

export function intrinsicState<K extends keyof IntrinsicElements>(type: K) {
	return class extends OxiComponent<K> {
		constructor(props?: IntrinsicElements[K]) {
			super(type, props);
			// biome-ignore lint: correctness/noConstructorReturn
			return this.withState();
		}
	};
}
