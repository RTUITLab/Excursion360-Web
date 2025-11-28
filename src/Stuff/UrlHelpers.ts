export function concatUrlPath(baseUrl: string, ...parts: string[]): string {
	if (baseUrl.endsWith("/")) {
		baseUrl = baseUrl.substring(0, baseUrl.lastIndexOf("/"));
	}
	let resultUrl = baseUrl;
	for (let part of parts) {
		if (part.endsWith("/")) {
			part = part.substring(0, part.lastIndexOf("/"));
		}
		if (part.startsWith("/")) {
			part = part.substring(1, part.length);
		}
		resultUrl += `/${part}`;
	}
	return resultUrl;
}
