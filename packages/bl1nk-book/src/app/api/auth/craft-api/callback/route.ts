import { type NextRequest, NextResponse } from "next/server";

import { applyNoStoreHeaders } from "@/lib/craft-api/auth/server";

const ALLOWED_CALLBACK_ORIGIN =
	process.env.NEXT_PUBLIC_CRAFT_ORIGIN || "https://www.craft.do";

export async function GET(request: NextRequest) {
	const code = request.nextUrl.searchParams.get("code") || "";
	const state = request.nextUrl.searchParams.get("state") || "";
	const safeCode = JSON.stringify(code).replace(/</g, "\\u003c");
	const safeState = JSON.stringify(state).replace(/</g, "\\u003c");

	const html = `<!DOCTYPE html><html><head><title>Authorizing…</title></head><body><script>
 var msg = { type: "craft-oauth-callback", code: ${safeCode}, state: ${safeState} };
var allowedOrigin = ${JSON.stringify(ALLOWED_CALLBACK_ORIGIN)};
if (window.opener) { window.opener.postMessage(msg, allowedOrigin); window.close(); }
</script></body></html>`;

	const response = new NextResponse(html, {
		headers: {
			"Content-Type": "text/html; charset=utf-8",
			"Content-Security-Policy":
				"default-src 'none'; script-src 'unsafe-inline'; base-uri 'none'; form-action 'none'; frame-ancestors 'self'",
			"X-Content-Type-Options": "nosniff",
		},
	});
	applyNoStoreHeaders(response.headers);
	return response;
}
