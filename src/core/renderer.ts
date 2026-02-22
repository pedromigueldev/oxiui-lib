let globalCursor = 0;

export function getGlobalCursor() {
	return globalCursor;
}
export function nextCursor() {
	return globalCursor++;
}

export function resetCursor() {
	globalCursor = 0;
}
