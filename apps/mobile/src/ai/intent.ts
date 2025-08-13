export type ParsedIntent = {
	timeBudget?: number;
	focusTag?: string;
	muteMins?: number;
};

function extractNumber(text: string, pattern: RegExp): number | undefined {
	const match = text.match(pattern);
	if (!match) return undefined;
	const numStr = match[1] || match[2];
	const num = Number(numStr);
	return Number.isFinite(num) && num > 0 ? Math.floor(num) : undefined;
}

function extractMute(text: string): number | undefined {
	// Examples: "silencio 30", "silenciar 45 min", "mute 15 minutos"
	const mutePattern = /(?:silencio|silenciar|mute|mutear|callar)\s*(?:por\s*)?(\d{1,3})(?:\s*(?:min|mins|minutos|m))?\b/i;
	return extractNumber(text, mutePattern);
}

function extractTimeBudget(text: string): number | undefined {
	// Prefer contextual matches: "tengo 20 min", "me quedan 25 minutos", "solo 15 min"
	const contextual = /(?:tengo|me\s+quedan|dispongo\s+de|solo|sólo|cuento\s+con|quedan|queda)\s*(\d{1,3})\s*(?:min|mins|minutos|m)\b/i;
	const contextualNum = extractNumber(text, contextual);
	if (contextualNum) return contextualNum;
	// Fallback bare duration if not a mute command: "20 min"
	const bare = /(\d{1,3})\s*(?:min|mins|minutos|m)\b/i;
	if (/(?:silencio|silenciar|mute|mutear|callar)/i.test(text)) return undefined;
	return extractNumber(text, bare);
}

function extractFocus(text: string): string | undefined {
	// Examples: "solo cardio", "enfoque ventas", "foco diseño"
	const m = text.match(/(?:solo|sólo|únicamente|unicamente|enfoque|enfocar|foco)\s+([a-z0-9_\-áéíóúñü]{2,})/i);
	if (!m) return undefined;
	const tag = (m[1] || '').trim().toLowerCase();
	return tag || undefined;
}

export function parseIntent(rawText: string): ParsedIntent {
	const text = (rawText || '').toLowerCase().trim();
	if (!text) return {};
	const muteMins = extractMute(text);
	const timeBudget = extractTimeBudget(text);
	const focusTag = extractFocus(text);
	return { timeBudget, focusTag, muteMins };
}