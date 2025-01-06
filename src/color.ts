import { clamp, range, wrapInRange } from './math';

export type RGB = [red: number, green: number, blue: number];
export type RGBA = [red: number, green: number, blue: number, alpha: number];
export type HSL = [hue: number, saturation: number, lightness: number];
export type HSLA = [hue: number, saturation: number, lightness: number, alpha: number];

function quantify(value: number): number {
	return clamp(0, Math.round(value), 255);
}

function hex2num(str: string, offset: number, step: number): number[] {
	const slices = [];
	while (offset + step <= str.length) {
		const a = offset;
		offset += step;
		const b = offset;
		slices.push(str.slice(a, b));
	}
	return slices
		.map((v) => (step === 1 ? v.repeat(2) : v))
		.map((v) => parseInt(v, 16))
		.map(quantify);
}

function num2hex(value: number[]): string {
	return value.map((v) => v.toString(16).padStart(2, '0')).join('');
}

export function rgb2hsl(rgb: RGB | RGBA): HSL {
	rgb = rgb.slice(0, 3).map((v) => v / 255) as RGB;
	const max = Math.max(...rgb);
	const min = Math.min(...rgb);
	const hsl: HSL = [0, 0, (max + min) / 2];
	if (max === min) return hsl;
	const d = max - min;
	hsl[1] = hsl[2] > 0.5 ? d / (2 - max - min) : d / (max + min);
	switch (rgb.indexOf(max)) {
		case 0:
			hsl[0] = (rgb[1] - rgb[2]) / d + (rgb[1] < rgb[2] ? 6 : 0);
			break;
		case 1:
			hsl[0] = (rgb[2] - rgb[0]) / d + 2;
			break;
		case 2:
			hsl[0] = (rgb[0] - rgb[1]) / d + 4;
			break;
	}
	hsl[0] *= 60;
	return hsl;
}

export function hsl2rgb(hsl: HSL | HSLA): RGB {
	let [hue, saturation, lightness] = hsl;
	hue = wrapInRange(hue, 360);
	saturation = clamp(0, saturation, 1);
	lightness = clamp(0, lightness, 1);
	const c = (1 - Math.abs(2 * lightness - 1)) * saturation; // Chroma
	const x = c * (1 - Math.abs(((hue / 60) % 2) - 1));
	const m = lightness - c / 2;

	let r: number;
	let g: number;
	let b: number;

	if (hue >= 0 && hue < 60) {
		r = c;
		g = x;
		b = 0;
	} else if (hue >= 60 && hue < 120) {
		r = x;
		g = c;
		b = 0;
	} else if (hue >= 120 && hue < 180) {
		r = 0;
		g = c;
		b = x;
	} else if (hue >= 180 && hue < 240) {
		r = 0;
		g = x;
		b = c;
	} else if (hue >= 240 && hue < 300) {
		r = x;
		g = 0;
		b = c;
	} else {
		r = c;
		g = 0;
		b = x;
	}

	// Convert to 0-255 range
	const red = Math.round((r + m) * 255);
	const green = Math.round((g + m) * 255);
	const blue = Math.round((b + m) * 255);

	return [red, green, blue];
}

export class Color {
	#rgba: RGBA = [0, 0, 0, 255];
	clone(): Color {
		return new Color().rgba(this.#rgba);
	}
	rgb(): RGB;
	rgb(value: RGB): this;
	rgb(value?: RGB): this | RGB {
		if (!value) {
			return this.#rgba.slice(0, 3) as RGB;
		}
		this.#rgba = [...value.map(quantify), 255] as RGBA;
		return this;
	}
	rgba(): RGBA;
	rgba(value: RGBA): this;
	rgba(value?: RGBA): this | RGBA {
		if (!value) {
			return [...this.#rgba];
		}
		this.#rgba = value.map(quantify) as RGBA;
		return this;
	}
	hex(): string;
	hex(value: string): this;
	hex(value?: string): this | string {
		if (!value) {
			return `#${num2hex(this.#rgba.slice(0, 3))}`;
		}
		const offset = value.startsWith('#') ? 1 : 0;
		if (value.length < offset + 3) throw new Error('Invalid hex value');
		if (value.length > offset + 6) value = value.slice(0, offset + 6);
		this.#rgba = [...hex2num(value, offset, value.length < 6 + offset ? 1 : 2), 255] as RGBA;
		return this;
	}
	hexa(): string;
	hexa(value: string): this;
	hexa(value?: string): this | string {
		if (!value) {
			return `#${num2hex(this.#rgba)}`;
		}
		const offset = value.startsWith('#') ? 1 : 0;
		if (value.length < offset + 4) throw new Error('Invalid hex value');
		if (value.length > offset + 8) value = value.slice(0, offset + 8);
		this.#rgba = hex2num(value, offset, value.length < 8 + offset ? 1 : 2) as RGBA;
		return this;
	}
	hsl(): HSL;
	hsl(value: HSL): this;
	hsl(value?: HSL): this | HSL {
		if (!value) {
			return rgb2hsl(this.#rgba);
		}
		this.#rgba = [...hsl2rgb(value), 255];
		return this;
	}
	hsla(): HSLA;
	hsla(value: HSLA): this;
	hsla(value?: HSLA): this | HSLA {
		if (!value) {
			return [...rgb2hsl(this.#rgba), this.#rgba[3] / 255];
		}
		this.#rgba = [...hsl2rgb(value), quantify(value[3] * 255)];
		return this;
	}
	isDark() {
		const rgb = this.#rgba.slice(0, 3).map((v) => v / 255);
		return Math.max(...rgb) + Math.min(...rgb) < 1;
	}
	alpha(): number;
	alpha(value: number): this;
	alpha(value?: number): this | number {
		if (value === undefined) return this.#rgba[3] / 255;
		this.#rgba[3] = quantify(value * 255);
		return this;
	}
	alphaByte(): number;
	alphaByte(value: number): this;
	alphaByte(value?: number): this | number {
		if (value === undefined) return this.#rgba[3];
		this.#rgba[3] = quantify(value);
		return this;
	}
	static hex(value: string): Color {
		return new Color().hex(value);
	}
	static hexa(value: string): Color {
		return new Color().hexa(value);
	}
	static rgb(value: RGB): Color {
		return new Color().rgb(value);
	}
	static rgba(value: RGBA): Color {
		return new Color().rgba(value);
	}
	static hsl(value: HSL): Color {
		return new Color().hsl(value);
	}
	static hsla(value: HSLA): Color {
		return new Color().hsla(value);
	}
	getTokens(): Record<string, string> {
		const hex = this.hex();
		const alphasOfTheme: Record<string, string> = {};
		for (const i of range(1, 15).map((v) => v.toString(16))) {
			alphasOfTheme[`--theme-a${i}`] = `${hex}${i}0`;
		}
		return {
			'--theme': hex,
			'--theme-text': this.isDark() ? '#fff' : '#000',
			...alphasOfTheme,
		};
	}
}
