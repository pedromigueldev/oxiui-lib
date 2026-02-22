import { intrinsic } from "./AbaComponent.js";

export class Animation extends intrinsic("div") {
	#transforms = new Map<string, string>();

	constructor() {
		super();
	}

	#applyTransforms() {
		if (this.#transforms.size === 0) {
			this.withStyle({ transform: undefined });
		} else {
			const transformString = Array.from(this.#transforms.values()).join(" ");
			this.withStyle({ transform: transformString });
		}
	}

	transition(sec: number, type: "ease" | "ease-in-out") {
		this.withStyle({
			transition: `all ${sec}s ${type}`,
		});
		return this;
	}

	translate(
		direction: "vertical" | "horizontal" | "perpendicular",
		target: number,
	) {
		let key: string;
		let value: string;
		if (direction === "horizontal") {
			key = "translateX";
			value = `translateX(${target}px)`;
		} else if (direction === "vertical") {
			key = "translateY";
			value = `translateY(${target}px)`;
		} else {
			key = "translateZ";
			value = `translateZ(${target}px)`;
		}
		this.#transforms.set(key, value);
		this.#applyTransforms();
		return this;
	}

	// Convenience methods
	translateX(target: number) {
		return this.translate("horizontal", target);
	}

	translateY(target: number) {
		return this.translate("vertical", target);
	}

	translateZ(target: number) {
		return this.translate("perpendicular", target);
	}

	rotate(deg: number) {
		this.#transforms.set("rotate", `rotate(${deg}deg)`);
		this.#applyTransforms();
		return this;
	}

	scale(factor: number) {
		this.#transforms.set("scale", `scale(${factor})`);
		this.#applyTransforms();
		return this;
	}

	skew(xDeg: number, yDeg?: number) {
		const y = yDeg !== undefined ? yDeg : 0;
		this.#transforms.set("skew", `skew(${xDeg}deg, ${y}deg)`);
		this.#applyTransforms();
		return this;
	}

	// Optional: manually trigger transform application (useful if you've manipulated the map directly)
	applyTransforms() {
		this.#applyTransforms();
		return this;
	}
}
