/**
 * OAuth JWT token verification utilities.
 */

import { jwtVerify } from "jose";

const JWT_ISSUER = process.env.OAUTH_ISSUER || "https://mcp.exa.ai";
const JWKS_ENDPOINT =
	process.env.OAUTH_JWKS_URI || "https://mcp.exa.ai/.well-known/jwks.json";

const jwksCache: ReturnType<typeof createRemoteJWKSet> | null = null;

function createRemoteJWKSet() {
	// Lazy import jose to avoid bundling issues
	return jwtVerify;
}

/**
 * Check if a token looks like a JWT (has 3 parts separated by dots).
 */
export function isJwtToken(token: string): boolean {
	const parts = token.split(".");
	return (
		parts.length === 3 && parts.every((part) => /^[A-Za-z0-9_-]+$/.test(part))
	);
}

/**
 * Verify an OAuth JWT token and return the claims.
 * Returns null if verification fails.
 */
export async function verifyOAuthToken(
	token: string,
): Promise<Record<string, unknown> | null> {
	try {
		// Dynamic import to avoid bundling jose in all cases
		const { createRemoteJWKSet } = await import("jose");

		const jwks = createRemoteJWKSet(new URL(JWKS_ENDPOINT));

		const { payload } = await jwtVerify(token, jwks, {
			issuer: JWT_ISSUER,
			audience: process.env.OAUTH_AUDIENCE || "exa-mcp-api",
		});

		return payload as Record<string, unknown>;
	} catch (error) {
		console.error("[EXA-MCP] OAuth token verification failed:", error);
		return null;
	}
}
