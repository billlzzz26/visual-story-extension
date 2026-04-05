// Client-side OAuth helpers for Craft API
// PKCE is handled server-side; refresh tokens are stored in HTTP-only cookies

// ── Redirect URIs ───────────────────────────────────────────────────────

export function getRedirectUri(): string {
  if (typeof window === 'undefined') return ''
  // Use the current page path so this works both inside the parent site
  // (/app-templates/slug) and in standalone downloaded apps (/).
  return `${window.location.origin}${window.location.pathname}`
}

/** Redirect URI for the popup callback route */
function getCallbackUri(): string {
  if (typeof window === 'undefined') return ''
  return `${window.location.origin}/api/auth/craft-api/callback`
}

interface OAuthInitResponse {
  authorizeUrl: string
  state: string
}

interface ErrorResponse {
  error?: string
}

// ── OAuth flow ──────────────────────────────────────────────────────────

export async function initOAuthFlow(): Promise<string> {
  const redirectUri = getRedirectUri()

  const response = await fetch('/api/auth/craft-api/init', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ redirectUri })
  })

  if (!response.ok) {
    const error = (await response.json().catch(() => ({}))) as ErrorResponse
    throw new Error(error.error || 'Failed to initialize OAuth')
  }

  const data = (await response.json()) as OAuthInitResponse

  // Store state in sessionStorage so we can verify it on callback
  sessionStorage.setItem('craft_oauth_state', data.state)

  return data.authorizeUrl
}

/**
 * Initialize OAuth for the popup flow.
 * Redirect URI points to /api/auth/craft-api/callback so the popup callback
 * can postMessage the auth code back to the opener window.
 */
export async function getAuthorizeUrl(): Promise<{ authorizeUrl: string; state: string }> {
  const redirectUri = getCallbackUri()

  const response = await fetch('/api/auth/craft-api/init', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ redirectUri })
  })

  if (!response.ok) {
    const error = (await response.json().catch(() => ({}))) as ErrorResponse
    throw new Error(error.error || 'Failed to initialize OAuth')
  }

  const data = (await response.json()) as OAuthInitResponse
  return { authorizeUrl: data.authorizeUrl, state: data.state }
}

export interface TokenExchangeResult {
  access_token: string
  expires_in?: number
}

export async function exchangeCodeForToken(code: string, state: string): Promise<TokenExchangeResult> {
  const response = await fetch('/api/auth/craft-api/exchange', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ code, state })
  })

  if (!response.ok) {
    const error = (await response.json().catch(() => ({}))) as ErrorResponse
    throw new Error(error.error || 'Token exchange failed')
  }

  return response.json() as Promise<TokenExchangeResult>
}

// ── Server-side token refresh ───────────────────────────────────────────

export interface RefreshResult {
  access_token: string
  expires_in?: number
}

let inFlightRefresh: Promise<RefreshResult> | null = null

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
  if (inFlightRefresh) return inFlightRefresh

  inFlightRefresh = (async () => {
    const response = await fetch('/api/auth/craft-api/refresh', {
      method: 'POST',
      credentials: 'same-origin'
    })

    if (!response.ok) {
      throw new Error('Token refresh failed')
    }

    return response.json() as Promise<RefreshResult>
  })()

  try {
    return await inFlightRefresh
  } finally {
    inFlightRefresh = null
  }
}

// ── Session management ──────────────────────────────────────────────────

/** Clear the server-side refresh cookie */
export async function clearServerSession(): Promise<void> {
  await fetch('/api/auth/craft-api/logout', { method: 'POST' })
}

// ── OAuth state helpers ─────────────────────────────────────────────────

export function getStoredState(): string | null {
  return sessionStorage.getItem('craft_oauth_state')
}

export function clearStoredState() {
  sessionStorage.removeItem('craft_oauth_state')
}
