import { run } from './function';

export function sleep(ms: number) {
	return new Promise((resolve) => {
		setTimeout(resolve, Math.max(ms, 0));
	});
}

export class RepeatingTriggerController<F extends Function | ((...args: any) => any) = Function> {
	#fn: F;
	#initialDelay = 500;
	#repeatInterval = 100;
	#repeating = false;
	#timer: any = null;
	constructor(fn: F, initialDelay?: number, repeatInterval?: number) {
		if (typeof fn !== 'function') throw new TypeError('fn must be a function');
		this.#fn = fn;
		if (initialDelay) this.initialDelay = initialDelay;
		if (repeatInterval) this.repeatInterval = repeatInterval;
	}
	start(): void {
		if (this.isRunning) return;
		run(this.#fn);
		this.#timer = setTimeout(() => {
			this.#timer = setInterval(() => run(this.#fn), this.#repeatInterval);
		}, this.#initialDelay);
	}
	stop(): void {
		if (this.#timer === null) return;
		if (this.#repeating) clearInterval(this.#timer);
		else clearTimeout(this.#timer);
		this.#timer = null;
		this.#repeating = false;
	}
	get isRunning(): boolean {
		return this.#timer !== null;
	}
	get fn(): F {
		return this.#fn;
	}
	set fn(fn: F) {
		if (typeof fn !== 'function') return;
		this.#fn = fn;
	}
	get initialDelay() {
		return this.#initialDelay;
	}
	set initialDelay(value: number) {
		if (typeof value !== 'number' || !Number.isFinite(value) || value <= 0) return;
		this.#initialDelay = value;
	}
	get repeatInterval() {
		return this.#repeatInterval;
	}
	set repeatInterval(value: number) {
		if (typeof value !== 'number' || !Number.isFinite(value) || value <= 0) return;
		this.#repeatInterval = value;
	}
}
