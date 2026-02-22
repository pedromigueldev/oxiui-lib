export function createStyle<
	T extends Record<string, Partial<CSSStyleDeclaration>>,
>(style: T): T {
	return style;
}
