import type { IComponent } from "../types/component.js";
import type {
	CommonProps,
	InputProps,
	IntrinsicElements,
} from "../types/html.js";

export class HTMLRenderer {
	private rootBody: HTMLElement;
	private oldRoot?: IComponent<keyof IntrinsicElements>;
	private nodeMap: Map<string, HTMLElement> = new Map();

	constructor(rootId: string = "app") {
		const el = document.getElementById(rootId);
		if (!el) throw new Error(`Root element #${rootId} not found`);
		this.rootBody = el;
	}

	render(
		stateId: string,
		readers: Set<string>,
		tree: IComponent<keyof IntrinsicElements>,
	) {
		if (!this.oldRoot) {
			this.oldRoot = this.cloneTree(tree);
			this.replaceRoot(this.oldRoot);
			return;
		}

		const affected = this.findAllByState(this.oldRoot, stateId);
		const topMost = this.getTopMost(Array.from(affected).map((n) => n.index));

		for (const index of topMost) {
			const newNode = this.findByIndex(tree, index);
			const oldNode = this.findByIndex(this.oldRoot, index);

			if (newNode && oldNode && this.structureChanged(oldNode, newNode)) {
				this.replaceNode(index, newNode);
				this.oldRoot = this.cloneTree(tree);
				this.nodeMap.forEach((e, k) => {
					if (!this.oldRoot || !this.findByIndex(this.oldRoot, k)) {
						this.nodeMap.delete(k);
					}
				});
				return;
			}
		}

		for (const id of readers) {
			const compNode = this.findByIndex(tree, id);
			if (!compNode) continue;

			const domNode = this.nodeMap.get(id);
			if (!domNode) continue;

			this.applyProps(domNode, compNode);
		}

		console.log(this.nodeMap);
	}

	private findByIndex(
		node: IComponent<keyof IntrinsicElements>,
		index: string,
	): IComponent<keyof IntrinsicElements> | undefined {
		if (node.index === index) return node;

		for (const child of node.down) {
			const found = this.findByIndex(child, index);
			if (found) return found;
		}

		return undefined;
	}

	private findAllByState(
		node: IComponent<keyof IntrinsicElements>,
		index: string,
		acc: Set<IComponent<keyof IntrinsicElements>> = new Set(),
	): Set<IComponent<keyof IntrinsicElements>> {
		if (node.cursors?.has(index)) {
			acc.add(node);
		}

		for (const child of node.down) {
			this.findAllByState(child, index, acc);
		}

		return acc;
	}

	private structureChanged(
		prev: IComponent<keyof IntrinsicElements> | undefined,
		next: IComponent<keyof IntrinsicElements>,
	): boolean {
		if (!prev) return true;
		if (prev.type !== next.type) return true;
		if (prev.down.length !== next.down.length) return true;

		for (let i = 0; i < next.down.length; i++) {
			if (next.down[i] !== undefined) {
				if (
					this.structureChanged(
						prev.down[i],
						next.down[i] as IComponent<keyof IntrinsicElements>,
					)
				) {
					return true;
				}
			}
		}

		return false;
	}

	private cloneTree(
		node: IComponent<keyof IntrinsicElements>,
	): IComponent<keyof IntrinsicElements> {
		return {
			type: node.type,
			index: node.index,
			cursors: new Set(node.cursors),
			down: node.down.map((n) => this.cloneTree(n)),
			props: node.props,
		} as IComponent<keyof IntrinsicElements>;
	}

	private renderNode(node: IComponent<keyof IntrinsicElements>): HTMLElement {
		if (node.type === "semanticText") return this.renderTextNode(node);

		const element = document.createElement(node.type);
		element.setAttribute("id", node.index);

		this.nodeMap.set(node.index, element);

		this.applyProps(element, node);

		for (const child of node.down) {
			element.appendChild(this.renderNode(child));
		}

		return element;
	}

	private renderTextNode(
		node: IComponent<keyof IntrinsicElements>,
	): HTMLElement {
		const props = node.props as IntrinsicElements["semanticText"];

		const element = document.createElement(props.type);
		element.setAttribute("id", node.index);
		this.nodeMap.set(node.index, element);

		this.applyProps(element, node);

		for (const child of node.down) {
			element.appendChild(this.renderNode(child));
		}

		return element;
	}

	private replaceRoot(component: IComponent<keyof IntrinsicElements>) {
		const fragment = document.createDocumentFragment();

		for (const child of component.down) {
			fragment.appendChild(this.renderNode(child));
		}

		this.rootBody.replaceChildren(fragment);
	}

	private replaceNode(
		index: string,
		node: IComponent<keyof IntrinsicElements>,
	) {
		if (index === "0") this.replaceRoot(node);
		const oldNode = this.oldRoot && this.findByIndex(this.oldRoot, index);
		if (!oldNode) return;

		const domNode = this.nodeMap.get(oldNode.index);
		if (!domNode) return;

		const newDom = this.renderNode(node);
		domNode.replaceWith(newDom);
	}

	private getTopMost(indices: string[]): string[] {
		const sorted = indices.sort((a, b) => a.length - b.length);
		const result: string[] = [];

		for (const value of sorted) {
			const isChild = result.some((parent) => value.startsWith(parent + "."));
			if (!isChild) result.push(value);
		}

		return result;
	}

	private applyProps(
		element: HTMLElement,
		node: IComponent<keyof IntrinsicElements>,
	) {
		if (!node.props) return;

		const props: CommonProps =
			node.type === "semanticText"
				? (node.props as IntrinsicElements["semanticText"]).props
				: (node.props as CommonProps);

		this.applyCommonProps(element, props);

		if (node.type === "input") {
			this.applyInputProps(element as HTMLInputElement, props as InputProps);
		}
	}

	private applyCommonProps(element: HTMLElement, props: CommonProps) {
		if (props.content !== undefined) {
			const value =
				typeof props.content === "function" ? props.content() : props.content;

			element.textContent = String(value);
		}

		this.applyStyle(element, props.style);

		if (props.id) element.id = props.id;
		if (props.class) element.className = props.class;
		if (props.title) element.title = props.title;
		if (props.hidden !== undefined) element.hidden = props.hidden;

		element.onclick = props.onClick ?? null;
		element.onchange = props.onChange ?? null;
		element.onfocus = props.onFocus ?? null;
		element.onblur = props.onBlur ?? null;
		element.onkeydown = props.onKeyDown ?? null;
		element.onkeyup = props.onKeyUp ?? null;

		element.oninput = (ev: Event) => props.onInput?.(ev as InputEvent) ?? null;
	}

	private applyStyle(
		element: HTMLElement,
		style?: string | Partial<CSSStyleDeclaration>,
	) {
		if (!style) return;

		if (typeof style === "string") {
			element.setAttribute("style", style);
		} else {
			Object.assign(element.style, style);
		}
	}

	private applyInputProps(element: HTMLInputElement, props: InputProps) {
		if (props.value !== undefined) {
			element.value = String(props.value);
		}

		element.oninput = (ev: Event) => {
			const input = ev.target as HTMLInputElement;
			props.onTextChange?.(input.value);
			props.onInput?.(ev as InputEvent);
		};
	}
}
