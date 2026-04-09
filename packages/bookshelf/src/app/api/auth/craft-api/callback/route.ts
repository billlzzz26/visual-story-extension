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

 const safeCode = JSON.stringify(code).replace(/</g, "\\u003c");
 const safeState = JSON.stringify(state).replace(/</g, "\\u003c");
 const html = `<!DOCTYPE html><html><head><title>Authorizing…</title></head><body><script>
 var msg = { type: "craft-oauth-callback", code: ${safeCode}, state: ${safeState} };
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
