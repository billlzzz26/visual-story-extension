'use client'

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from 'react'
import { CraftApiClient, type CraftApiError } from '../client'
import {
  clearServerSession,
  clearStoredState,
  exchangeCodeForToken,
  getAuthorizeUrl,
  getStoredState,
  refreshAccessToken
} from './oauth-client'

type AuthStatus = 'disconnected' | 'connecting' | 'connected' | 'error'

interface CraftAuthState {
  status: AuthStatus
  client: CraftApiClient | null
  error: string | null
  connect: () => void
  disconnect: () => void
}

const CraftAuthContext = createContext<CraftAuthState>({
  status: 'disconnected',
  client: null,
  error: null,
  connect: () => {},
  disconnect: () => {}
})

export function useCraftAuth() {
  return useContext(CraftAuthContext)
}

interface CraftAuthProviderProps {
  slug: string
  children: ReactNode
}

export function CraftAuthProvider({ slug, children }: CraftAuthProviderProps) {
  const [status, setStatus] = useState<AuthStatus>('disconnected')
  const [error, setError] = useState<string | null>(null)
  const accessTokenRef = useRef<string | null>(null)
  const [client, setClient] = useState<CraftApiClient | null>(null)

  // Create a connected session with an access token
  const setConnected = useCallback((accessToken: string) => {
    accessTokenRef.current = accessToken

    const onRefresh = async (): Promise<string | null> => {
      try {
        const result = await refreshAccessToken()
        accessTokenRef.current = result.access_token
        return result.access_token
      } catch {
        // Refresh failed — session is dead
        accessTokenRef.current = null
        setClient(null)
        setError('Session expired — please reconnect.')
        setStatus('disconnected')
        return null
      }
    }

    const onError = (apiError: CraftApiError) => {
      // Only handle auth errors that the retry logic couldn't recover from
      if (apiError.status !== 401 && apiError.message !== 'invalid_token') return

      accessTokenRef.current = null
      setClient(null)
      setError('Session expired — please reconnect.')
      setStatus('disconnected')
    }

    setClient(new CraftApiClient(accessToken, onError, onRefresh))
    setStatus('connected')
    setError(null)
  }, [])

  // Restore session from HTTP-only cookie on mount
  useEffect(() => {
    if (accessTokenRef.current) return

    setStatus('connecting')
    refreshAccessToken()
      .then((result) => {
        setConnected(result.access_token)
      })
      .catch(() => {
        // No valid refresh cookie — stay disconnected
        setStatus('disconnected')
      })
  }, [setConnected])

  const handleTokenExchange = useCallback(
    (code: string, state: string) => {
      setStatus('connecting')

      exchangeCodeForToken(code, state)
        .then((tokens) => {
          setConnected(tokens.access_token)
        })
        .catch((err) => {
          setError(err.message || 'Failed to exchange token')
          setStatus('error')
        })
        .finally(() => {
          clearStoredState()
        })
    },
    [setConnected]
  )

  // Listen for postMessage from the popup callback
  useEffect(() => {
    function handleMessage(event: MessageEvent) {
      if (event.origin !== window.location.origin) return
      if (event.data?.type !== 'craft-oauth-callback') return

      const { code, state } = event.data
      const storedState = getStoredState()
      if (storedState !== state) {
        setError('Invalid OAuth state — please try again.')
        setStatus('error')
        return
      }

      handleTokenExchange(code, state)
    }

    window.addEventListener('message', handleMessage)
    return () => window.removeEventListener('message', handleMessage)
  }, [handleTokenExchange])

  // Handle redirect-based callback fallback (?code= in page URL)
  useEffect(() => {
    if (accessTokenRef.current) return

    const params = new URLSearchParams(window.location.search)
    const code = params.get('code')
    const state = params.get('state')

    if (!code || !state) return

    const storedState = getStoredState()
    if (storedState !== state) {
      setError('Invalid OAuth state — please try again.')
      setStatus('error')
      window.history.replaceState({}, '', window.location.pathname)
      return
    }

    window.history.replaceState({}, '', window.location.pathname)
    handleTokenExchange(code, state)
  }, [slug, handleTokenExchange])

  const connect = useCallback(async () => {
    try {
      setError(null)
      setStatus('connecting')

      const { authorizeUrl, state } = await getAuthorizeUrl()
      sessionStorage.setItem('craft_oauth_state', state)

      // Open popup centered on screen
      const w = 500
      const h = 700
      const left = window.screenX + (window.outerWidth - w) / 2
      const top = window.screenY + (window.outerHeight - h) / 2

      const popup = window.open(authorizeUrl, 'craft-auth', `width=${w},height=${h},left=${left},top=${top},popup=yes`)

      if (!popup) {
        setError('Popup blocked — please allow popups and try again.')
        setStatus('error')
        return
      }

      // Poll to detect if user closed the popup without completing auth
      const pollTimer = setInterval(() => {
        if (popup.closed) {
          clearInterval(pollTimer)
          setStatus((s) => (s === 'connecting' ? 'disconnected' : s))
        }
      }, 500)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to start auth flow')
      setStatus('error')
    }
  }, [])

  const disconnect = useCallback(() => {
    accessTokenRef.current = null
    setClient(null)
    setStatus('disconnected')
    setError(null)
    // Clear the server-side HTTP-only cookie
    clearServerSession()
  }, [])

  const value = useMemo(
    () => ({ status, client, error, connect, disconnect }),
    [status, client, error, connect, disconnect]
  )

  return <CraftAuthContext.Provider value={value}>{children}</CraftAuthContext.Provider>
}
