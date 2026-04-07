import { NextResponse } from "next/server";

import { applyNoStoreHeaders } from "@/lib/craft-api/auth/server";

const REFRESH_COOKIE = "craft_refresh_session";

export async function POST() {
	const response = NextResponse.json({ ok: true });
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
