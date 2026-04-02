import { cookies } from 'next/headers'
import { NextResponse, type NextRequest } from 'next/server'

import { applyNoStoreHeaders } from '@/lib/craft-api/auth/server'

const CONNECT_BASE_URL = process.env['NEXT_PUBLIC_CRAFT_CONNECT_URL'] || 'https://connect.craft.do'
const OAUTH_COOKIE = 'craft_oauth_session'
const REFRESH_COOKIE = 'craft_refresh_session'

function clearOAuthSessionCookie(response: NextResponse) {
  response.cookies.set(OAUTH_COOKIE, '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 0,
  })
}

export async function POST(request: NextRequest) {
  try {
    const { code, state } = await request.json()
    if (!code || !state) {
      const response = NextResponse.json({ error: 'Missing code or state' }, { status: 400 })
      applyNoStoreHeaders(response.headers)
      return response
    }

    const cookieStore = await cookies()
    const sessionCookie = cookieStore.get(OAUTH_COOKIE)
    if (!sessionCookie?.value) {
      const response = NextResponse.json({ error: 'OAuth session expired' }, { status: 400 })
      applyNoStoreHeaders(response.headers)
      return response
    }

    const session = JSON.parse(sessionCookie.value) as {
      codeVerifier: string; clientId: string; redirectUri: string; state: string
    }

    if (session.state !== state) {
      const response = NextResponse.json({ error: 'Invalid OAuth state' }, { status: 400 })
      clearOAuthSessionCookie(response)
      applyNoStoreHeaders(response.headers)
      return response
    }

    const tokenResponse = await fetch(`${CONNECT_BASE_URL}/my/auth/token`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        grant_type: 'authorization_code',
        code,
        code_verifier: session.codeVerifier,
        client_id: session.clientId,
        redirect_uri: session.redirectUri,
      }),
    })

    if (!tokenResponse.ok) {
      const err = await tokenResponse.json().catch(() => ({}))
      const response = NextResponse.json({ error: err.error || 'Token exchange failed' }, { status: tokenResponse.status })
      clearOAuthSessionCookie(response)
      applyNoStoreHeaders(response.headers)
      return response
    }

    const tokens = await tokenResponse.json()
    const response = NextResponse.json({
      access_token: tokens.access_token,
      expires_in: tokens.expires_in,
    })
    response.cookies.set(REFRESH_COOKIE, JSON.stringify({
      refreshToken: tokens.refresh_token,
      clientId: session.clientId,
    }), {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      path: '/api/auth/craft-api',
      maxAge: 30 * 24 * 60 * 60,
    })
    clearOAuthSessionCookie(response)
    applyNoStoreHeaders(response.headers)
    return response
  } catch (error) {
    console.error('[craft-api/exchange]', error)
    const response = NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    applyNoStoreHeaders(response.headers)
    return response
  }
}
