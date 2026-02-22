import { nextCursor } from "./renderer.js";
import { rerender } from "./scheduler.js";
import { current } from "./tree.js";

type SignalState<T> = {
	value: T;
};

export class Signal<T> {
	public constructor(public initial: T) {
		this.cursor = nextCursor();
		if (!Signal.#memory.has(this.cursor)) {
			Signal.#memory.set(this.cursor, { value: initial });
		}
		this.state = Signal.#memory.get(this.cursor) as SignalState<T>;
	}
	private state: SignalState<T>;
	private cursor: number;

	public get value(): T {
		const reader = Signal.getCurrentReaderWithCursorId(this.cursor);
		if (!Signal.#readers.has(reader)) {
			Signal.#readers.add(reader);
		}
		return this.state.value;
	}

	public set value(v: T) {
		this.state.value = v;
		if (this.cursor) {
			rerender(`${this.cursor}`, Signal.getReadersWithCursor(this.cursor));
			console.log(this.cursor, current());
		}

		Signal.clearReaders();
	}

	static #memory = new Map<number, { value: unknown }>();
	static #readers = new Set<string>();

	private static clearReaders() {
		Signal.#readers.clear();
	}

	private static getCurrentReaderWithCursorId(cursor: number) {
		const callee = current();
		callee?.cursors?.add(cursor.toString());
		const c = (callee?.down?.length ?? 0) - 1;
		return `${callee?.index}.${(c < 0 ? 0 : c).toString()}-${cursor}`;
	}

	private static getReadersWithCursor(cursor: number) {
		return new Set(
			Array.from(Signal.#readers)
				.filter((r) => r.endsWith(`-${cursor}`))
				.map((v) => v.split("-")[0])
				.filter((v): v is string => v !== undefined),
		);
	}

	public static create<T>(initial: T): [() => T, (v: T) => void] {
		const cursor = nextCursor();
		if (!Signal.#memory.has(cursor)) {
			Signal.#memory.set(cursor, { value: initial });
		}
		const state = Signal.#memory.get(cursor) as SignalState<T>;

		const read = () => {
			const reader = Signal.getCurrentReaderWithCursorId(cursor);
			if (!Signal.#readers.has(reader)) {
				Signal.#readers.add(reader);
			}
			return state.value;
		};

		const write = (v: T) => {
			state.value = v;
			rerender(`${cursor}`, Signal.getReadersWithCursor(cursor));
			Signal.clearReaders();
		};

		return [read, write];
	}
}
