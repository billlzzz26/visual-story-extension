import { createHash, randomBytes } from "node:crypto";
import { cookies } from "next/headers";
import { type NextRequest, NextResponse } from "next/server";

import {
	OAuthValidationError,
	applyNoStoreHeaders,
	validateOAuthRedirectUri,
} from "@/lib/craft-api/auth/server";

const CONNECT_BASE_URL =
	process.env.NEXT_PUBLIC_CRAFT_CONNECT_URL || "https://connect.craft.do";
const STATIC_CLIENT_ID = process.env.CRAFT_OAUTH_CLIENT_ID || "";
const OAUTH_COOKIE = "craft_oauth_session";

function base64URLEncode(buffer: Buffer): string {
	return buffer.toString("base64url");
}

function generatePKCE() {
	const codeVerifier = base64URLEncode(randomBytes(32));
	const codeChallenge = base64URLEncode(
		createHash("sha256").update(codeVerifier).digest(),
	);
	return { codeVerifier, codeChallenge };
}

async function registerClient(redirectUri: string) {
	const response = await fetch(`${CONNECT_BASE_URL}/my/auth/register`, {
		method: "POST",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify({
			client_name: "Article Workspace",
			redirect_uris: [redirectUri],
			grant_types: ["authorization_code", "refresh_token"],
			response_types: ["code"],
			token_endpoint_auth_method: "none",
		}),
	});
	if (!response.ok)
		throw new Error(`Client registration failed: ${response.status}`);
	const data = await response.json();
	return { client_id: data.client_id };
}

export async function POST(request: NextRequest) {
	try {
		let body: { redirectUri?: string };
		try {
			body = (await request.json()) as { redirectUri?: string };
		} catch {
			throw new OAuthValidationError("Invalid request body");
		}
		const redirectUri = validateOAuthRedirectUri(body?.redirectUri || "");

		let clientId = STATIC_CLIENT_ID;
		if (!clientId) {
			const reg = await registerClient(redirectUri);
			clientId = reg.client_id;
		}

		const { codeVerifier, codeChallenge } = generatePKCE();
		const state = base64URLEncode(randomBytes(16));

		const authorizeUrl = new URL(`${CONNECT_BASE_URL}/my/auth/authorize`);
		authorizeUrl.searchParams.set("response_type", "code");
		authorizeUrl.searchParams.set("client_id", clientId);
		authorizeUrl.searchParams.set("redirect_uri", redirectUri);
		authorizeUrl.searchParams.set("code_challenge", codeChallenge);
		authorizeUrl.searchParams.set("code_challenge_method", "S256");
		authorizeUrl.searchParams.set("state", state);

		const cookieStore = await cookies();
		cookieStore.set(
			OAUTH_COOKIE,
			JSON.stringify({ codeVerifier, clientId, redirectUri, state }),
			{
				httpOnly: true,
				secure: process.env.NODE_ENV === "production",
				sameSite: "lax",
				path: "/",
				maxAge: 600,
			},
		);

		const response = NextResponse.json({
			authorizeUrl: authorizeUrl.toString(),
			state,
		});
		applyNoStoreHeaders(response.headers);
		return response;
	} catch (error) {
		console.error("[craft-api/init]", error);
		const response = NextResponse.json(
			{ error: error instanceof Error ? error.message : "Failed" },
			{ status: error instanceof OAuthValidationError ? 400 : 500 },
		);
		applyNoStoreHeaders(response.headers);
		return response;
	}
}
