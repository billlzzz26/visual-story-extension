import { type NextRequest, NextResponse } from "next/server";

import { applyNoStoreHeaders } from "@/lib/craft-api/auth/server";

export async function GET(request: NextRequest) {
	// OAuth code/state are opaque — do not strip characters; JSON.stringify in HTML is safe
	const code = request.nextUrl.searchParams.get("code") || "";
	const state = request.nextUrl.searchParams.get("state") || "";

	const html = `<!DOCTYPE html><html><head><title>Authorizing…</title></head><body><script>
var msg = { type: "craft-oauth-callback", code: ${JSON.stringify(code)}, state: ${JSON.stringify(state)} };
var origin = window.location.origin;
if (window.parent && window.parent !== window) window.parent.postMessage(msg, origin);
if (window.opener) { window.opener.postMessage(msg, origin); window.close(); }
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
