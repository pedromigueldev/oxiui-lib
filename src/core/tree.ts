import type { IComponent } from "./types/component";
import type { IntrinsicElements } from "./types/html";

const stack: IComponent<keyof IntrinsicElements>[] = [];

export function current() {
	return stack[stack.length - 1];
}

function _open(component: IComponent<keyof IntrinsicElements>) {
	stack.push(component);
}

export function open(component: IComponent<any>) {
	stack.push(component as IComponent<keyof IntrinsicElements>);
}

export function close() {
	stack.pop();
}
