/** Accept any localhost/127.0.0.1 origin regardless of port. */
function isLocalOrigin(origin: string): boolean {
	try {
		const { hostname } = new URL(origin);
		return hostname === "localhost" || hostname === "127.0.0.1";
	} catch {
		return false;
	}
}

export class OAuthValidationError extends Error {
	constructor(message: string) {
		super(message);
		this.name = "OAuthValidationError";
	}
}

function getAllowedOrigins(): Set<string> {
	const origins = new Set<string>(["https://www.craft.do"]);

	const configuredHost = process.env.NEXT_PUBLIC_HOST;
	if (configuredHost) {
		try {
			origins.add(new URL(configuredHost).origin);
		} catch {
			// Ignore invalid host config values
		}
	}

	return origins;
}

function isAllowedCallbackPath(pathname: string): boolean {
	if (pathname === "/api/auth/craft-api/callback") return true;
	return (
		pathname.startsWith("/") &&
		!pathname.startsWith("/api/") &&
		!pathname.includes("..")
	);
}

/**
 * Validate redirect URIs used for OAuth initiation.
 * Restricts redirects to this app's known callback endpoints on approved origins.
 */
export function validateOAuthRedirectUri(redirectUri: string): string {
	let parsed: URL;

	try {
		parsed = new URL(redirectUri);
	} catch {
		throw new OAuthValidationError("Invalid redirectUri");
	}

	if (parsed.protocol !== "https:" && parsed.protocol !== "http:") {
		throw new OAuthValidationError(
			"redirectUri must use http or https",
		);
	}

	if (
		!getAllowedOrigins().has(parsed.origin) &&
		!isLocalOrigin(parsed.origin)
	) {
		throw new OAuthValidationError("Unapproved redirectUri origin");
	}

	if (!isAllowedCallbackPath(parsed.pathname)) {
		throw new OAuthValidationError("Unapproved redirectUri path");
	}

	if (parsed.hash) {
		throw new OAuthValidationError(
			"redirectUri must not include a hash fragment",
		);
	}

	return parsed.toString();
}

export function applyNoStoreHeaders(headers: Headers): Headers {
	headers.set("Cache-Control", "no-store");
	headers.set("Pragma", "no-cache");
	return headers;
}
