import { Logger } from './log';

const logger = new Logger('abm-utils/id');

export class IDGenerator {
	#current: bigint;
	constructor(begin: number | bigint = 0n) {
		if (typeof begin === 'number') {
			if (Number.isFinite(begin)) begin = BigInt(Math.round(begin));
			else {
				logger.warn(new Error('Invalid begin value', { cause: begin }));
				begin = 0n;
			}
		}
		if (typeof begin !== 'bigint') begin = 0n;
		this.#current = begin;
	}
	get current() {
		return this.#current;
	}
	next() {
		this.#current += 1n;
		return this.#current.toString(36);
	}
}
