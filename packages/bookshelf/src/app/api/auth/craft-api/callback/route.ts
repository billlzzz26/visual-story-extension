import { type NextRequest, NextResponse } from "next/server";

import { applyNoStoreHeaders } from "@/lib/craft-api/auth/server";

export async function GET(request: NextRequest) {
	const code = request.nextUrl.searchParams.get("code");
	const state = request.nextUrl.searchParams.get("state");

	if (!code || !state) {
		const badRequest = new NextResponse("Invalid OAuth callback parameters.", {
			status: 400,
			headers: {
				"Content-Type": "text/plain; charset=utf-8",
				"X-Content-Type-Options": "nosniff",
			},
		});
		applyNoStoreHeaders(badRequest.headers);
		return badRequest;
	}

	const redirectUrl = new URL("/auth/craft-api/callback", request.nextUrl.origin);
	redirectUrl.searchParams.set("code", code);
	redirectUrl.searchParams.set("state", state);

	const response = NextResponse.redirect(redirectUrl, 302);
	applyNoStoreHeaders(response.headers);
	return response;
}
