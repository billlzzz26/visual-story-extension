import { cookies } from "next/headers";
import { NextResponse } from "next/server";

import { applyNoStoreHeaders } from "@/lib/craft-api/auth/server";

const CONNECT_BASE_URL =
	process.env.NEXT_PUBLIC_CRAFT_CONNECT_URL || "https://connect.craft.do";
const REFRESH_COOKIE = "craft_refresh_session";

export async function POST() {
	try {
		const cookieStore = await cookies();
		const sessionCookie = cookieStore.get(REFRESH_COOKIE);
		if (!sessionCookie?.value) {
			const response = NextResponse.json(
				{ error: "No refresh session" },
				{ status: 401 },
			);
			applyNoStoreHeaders(response.headers);
			return response;
		}

  let session: {
      refreshToken: string;
      clientId: string;
  };
  try {
      session = JSON.parse(sessionCookie.value) as {
          refreshToken: string;
          clientId: string;
      };
  } catch {
      const response = NextResponse.json(
          { error: "Invalid refresh session" },
          { status: 401 },
      );
      response.cookies.set(REFRESH_COOKIE, "", {
          httpOnly: true,
          secure: process.env.NODE_ENV === "production",
          sameSite: "strict",
          path: "/api/auth/craft-api",
          maxAge: 0,
      });
      applyNoStoreHeaders(response.headers);
      return response;
  }

		const tokenResponse = await fetch(`${CONNECT_BASE_URL}/my/auth/token`, {
			method: "POST",
			headers: { "Content-Type": "application/x-www-form-urlencoded" },
			body: new URLSearchParams({
				grant_type: "refresh_token",
				refresh_token: session.refreshToken,
				client_id: session.clientId,
			}),
		});

		if (!tokenResponse.ok) {
			const response = NextResponse.json(
				{ error: "Refresh failed" },
				{ status: 401 },
			);
			response.cookies.set(REFRESH_COOKIE, "", {
				httpOnly: true,
				secure: process.env.NODE_ENV === "production",
				sameSite: "strict",
				path: "/api/auth/craft-api",
				maxAge: 0,
			});
			applyNoStoreHeaders(response.headers);
			return response;
		}

		const tokens = await tokenResponse.json();
		const response = NextResponse.json({
			access_token: tokens.access_token,
			expires_in: tokens.expires_in,
		});
		response.cookies.set(
			REFRESH_COOKIE,
			JSON.stringify({
				refreshToken: tokens.refresh_token ?? session.refreshToken,
				clientId: session.clientId,
			}),
			{
				httpOnly: true,
				secure: process.env.NODE_ENV === "production",
				sameSite: "strict",
				path: "/api/auth/craft-api",
				maxAge: 30 * 24 * 60 * 60,
			},
		);
		applyNoStoreHeaders(response.headers);
		return response;
	} catch (error) {
		console.error("[craft-api/refresh]", error);
		const response = NextResponse.json(
			{ error: "Internal server error" },
			{ status: 500 },
		);
		applyNoStoreHeaders(response.headers);
		return response;
	}
}
