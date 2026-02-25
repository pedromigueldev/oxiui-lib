import type { ContainerState } from "./elements";
import { resetCursor } from "./renderer";
import type { IComponent } from "./types/component";
import type { IntrinsicElements } from "./types/html";

type RenderCallback = (
	stateId: string,
	readers: Set<string>,
	root: IComponent<keyof IntrinsicElements>,
) => void;

let running = false;
let app: ContainerState | null = null;
let renderCallback: RenderCallback | null = null;
const postRenderQueue: (() => void)[] = [];
const resetTree = () => {
	if (app?.down) {
		app.down = [];
	}
};

export function initScheduler(
	App: new () => ContainerState,
	renderer: RenderCallback,
) {
	app = new App();
	renderCallback = renderer;
	performRender("", new Set());
}

export function scheduleEffect(fn: () => void) {
	postRenderQueue.push(fn);
}

function findByIndex(
	node: IComponent<keyof IntrinsicElements>,
	index: string,
): IComponent<keyof IntrinsicElements> | null {
	if (node.index === index) return node;

	for (const child of node.down) {
		const found = findByIndex(child, index);
		if (found) return found;
	}

	return null;
}

function clearCursors(node?: IComponent<keyof IntrinsicElements>) {
	if (!node) return;

	node.cursors?.clear();

	for (const child of node.down) {
		clearCursors(child);
	}
}

function performRender(stateId: string, readers: Set<string>) {
	if (!app || !renderCallback) return;
	console.clear();
	app.body();
	renderCallback(stateId, readers, app as IComponent<keyof IntrinsicElements>);
	postRenderQueue.forEach((fn) => {
		fn();
	});
	postRenderQueue.length = 0;
	clearCursors(app as IComponent<keyof IntrinsicElements>);
}

export function rerender(stateId: string, readers: Set<string>) {
	if (!renderCallback || !app) return;
	if (running) return;

	const validComponents: Set<string> = new Set();

	readers.forEach((id) => {
		if (findByIndex(app as IComponent<keyof IntrinsicElements>, id)) {
			validComponents.add(id);
		}
	});

	running = true;

	setTimeout(() => {
		running = false;
		resetTree();
		resetCursor();
		performRender(stateId, validComponents);
	}, 0);
}

let immediateRunning = false;
let frameId: number | null = null;

export function startImmediateMode() {
	if (!app || !renderCallback) return;
	if (immediateRunning) return;

	immediateRunning = true;

	const loop = () => {
		if (!immediateRunning || !app) return;

		resetTree();
		resetCursor();
		app.body();
		renderCallback?.("", new Set(), app as IComponent<keyof IntrinsicElements>);
		postRenderQueue.forEach((fn) => {
			fn();
		});
		postRenderQueue.length = 0;
		clearCursors(app as IComponent<keyof IntrinsicElements>);
		frameId = requestAnimationFrame(loop);
	};

	frameId = requestAnimationFrame(loop);
}

export function stopImmediateMode() {
	immediateRunning = false;

	if (frameId !== null) {
		cancelAnimationFrame(frameId);
		frameId = null;
	}
}
