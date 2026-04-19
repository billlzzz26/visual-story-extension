// Client-side OAuth helpers for Craft API
// PKCE is handled server-side; refresh tokens are stored in HTTP-only cookies

// ── Redirect URIs ───────────────────────────────────────────────────────

export function getRedirectUri(): string {
	if (typeof window === "undefined") return "";
	// Use the current page path so this works both inside the parent site
	// (/app-templates/slug) and in standalone downloaded apps (/).
	return `${window.location.origin}${window.location.pathname}`;
}

/** Redirect URI for the popup callback route */
function getCallbackUri(): string {
	if (typeof window === "undefined") return "";
	return `${window.location.origin}/api/auth/craft-api/callback`;
}

interface OAuthInitResponse {
	authorizeUrl: string;
	state: string;
}

interface ErrorResponse {
	error?: string;
}

// ── OAuth flow ──────────────────────────────────────────────────────────

export async function initOAuthFlow(): Promise<string> {
	const redirectUri = getRedirectUri();

	try {
		const response = await fetch("/api/auth/craft-api/init", {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({ redirectUri }),
		});

		if (!response.ok) {
			const error = (await response.json().catch(() => ({}))) as ErrorResponse;
			throw new Error(error.error || "Failed to initialize OAuth");
		}

		const data = (await response.json()) as OAuthInitResponse;

		// Store state in sessionStorage so we can verify it on callback
		sessionStorage.setItem("craft_oauth_state", data.state);

		return data.authorizeUrl;
	} catch (error) {
		if (
			error instanceof Error &&
			error.message.includes("Failed to initialize OAuth")
		) {
			throw error; // Re-throw our own errors
		}
		throw new Error(
			`Network error during OAuth initialization: ${error instanceof Error ? error.message : "Unknown error"}`,
		);
	}
}

/**
 * Initialize OAuth for the popup flow.
 * Redirect URI points to /api/auth/craft-api/callback so the popup callback
 * can postMessage the auth code back to the opener window.
 */
export async function getAuthorizeUrl(): Promise<{
	authorizeUrl: string;
	state: string;
}> {
	const redirectUri = getCallbackUri();

	try {
		const response = await fetch("/api/auth/craft-api/init", {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({ redirectUri }),
		});

		if (!response.ok) {
			const error = (await response.json().catch(() => ({}))) as ErrorResponse;
			throw new Error(error.error || "Failed to initialize OAuth");
		}

		const data = (await response.json()) as OAuthInitResponse;
		return { authorizeUrl: data.authorizeUrl, state: data.state };
	} catch (error) {
		if (
			error instanceof Error &&
			error.message.includes("Failed to initialize OAuth")
		) {
			throw error; // Re-throw our own errors
		}
		throw new Error(
			`Network error during OAuth initialization: ${error instanceof Error ? error.message : "Unknown error"}`,
		);
	}
}

export interface TokenExchangeResult {
	access_token: string;
	expires_in?: number;
}

export async function exchangeCodeForToken(
	code: string,
	state: string,
): Promise<TokenExchangeResult> {
	try {
		const response = await fetch("/api/auth/craft-api/exchange", {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({ code, state }),
		});

		if (!response.ok) {
			const error = (await response.json().catch(() => ({}))) as ErrorResponse;
			throw new Error(error.error || "Token exchange failed");
		}

		return response.json() as Promise<TokenExchangeResult>;
	} catch (error) {
		if (
			error instanceof Error &&
			error.message.includes("Token exchange failed")
		) {
			throw error; // Re-throw our own errors
		}
		throw new Error(
			`Network error during token exchange: ${error instanceof Error ? error.message : "Unknown error"}`,
		);
	}
}

// ── Server-side token refresh ───────────────────────────────────────────

export interface RefreshResult {
	access_token: string;
	expires_in?: number;
}

let inFlightRefresh: Promise<RefreshResult> | null = null;

/**
 * Refresh the access token via the server-side refresh route.
 * The refresh token is stored in an HTTP-only cookie — the browser
 * sends it automatically, and JS never sees it.
 *
 * Important: refresh tokens may rotate on every use. If multiple parts of the
 * UI trigger refresh simultaneously (for example due to React dev remounts),
 * only allow one network refresh at a time and share the result.
 */
export async function refreshAccessToken(): Promise<RefreshResult> {
	if (inFlightRefresh) return inFlightRefresh;

	inFlightRefresh = (async () => {
		try {
			const response = await fetch("/api/auth/craft-api/refresh", {
				method: "POST",
				credentials: "same-origin",
			});

			if (!response.ok) {
				throw new Error("Token refresh failed");
			}

			return response.json() as Promise<RefreshResult>;
		} catch (error) {
			throw new Error(
				`Network error during token refresh: ${error instanceof Error ? error.message : "Unknown error"}`,
			);
		}
	})();

	try {
		return await inFlightRefresh;
	} finally {
		inFlightRefresh = null;
	}
}

// ── Session management ──────────────────────────────────────────────────

/** Clear the server-side refresh cookie */
export async function clearServerSession(): Promise<void> {
	try {
		await fetch("/api/auth/craft-api/logout", { method: "POST" });
	} catch (error) {
		console.warn("Failed to clear server session:", error);
		// Don't throw - session clearing is not critical
	}
}

// ── OAuth state helpers ─────────────────────────────────────────────────

/** Retrieve the stored OAuth state from sessionStorage (browser-only). */
export function getOAuthState(): string | null {
	if (typeof window === "undefined") return null;
	try {
		return window.sessionStorage.getItem("craft_oauth_state");
	} catch {
		return null;
	}
}

/** Clear the OAuth state from sessionStorage (browser-only). */
export function clearOAuthState(): void {
	if (typeof window === "undefined") return;
	try {
		window.sessionStorage.removeItem("craft_oauth_state");
	} catch {
		// Ignore storage access failures during cleanup
	}
}

/** Alias for getOAuthState for backwards compatibility */
export function getStoredState(): string | null {
	return getOAuthState();
}

/** Alias for clearOAuthState for backwards compatibility */
export function clearStoredState(): void {
	clearOAuthState();
}
