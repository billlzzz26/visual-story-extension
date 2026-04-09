/**
 * MCP OAuth Token Storage
 * Secure storage for OAuth state, PKCE verifiers, and tokens
 * 
 * In production, this should use encrypted server-side storage or
 * VS Code SecretStorage for CLI applications
 */

export interface TokenData {
  access_token: string;
  token_type: string;
  expires_in?: number;
  refresh_token?: string;
  scope?: string;
  resource?: string;
}

export interface OAuthState {
  verifier: string;
  state: string;
  timestamp: number;
  resource: string;
}

export class McpOAuthTokenStorage {
  private storage: Map<string, any> = new Map();
  private readonly STATE_TTL_MS = 5 * 60 * 1000; // 5 minutes
  private readonly TOKEN_REFRESH_THRESHOLD = 60 * 1000; // 1 minute before expiry

  /**
   * Store OAuth state for later verification
   */
  setState(stateId: string, state: OAuthState): void {
    this.storage.set(`oauth:state:${stateId}`, {
      ...state,
      timestamp: Date.now()
    });
  }

  /**
   * Retrieve and validate OAuth state
   */
  getState(stateId: string): OAuthState | null {
    const stored = this.storage.get(`oauth:state:${stateId}`);
    
    if (!stored) {
      return null;
    }

    // Check if state has expired
    if (Date.now() - stored.timestamp > this.STATE_TTL_MS) {
      this.storage.delete(`oauth:state:${stateId}`);
      return null;
    }

    return stored as OAuthState;
  }

  /**
   * Clear OAuth state after use
   */
  clearState(stateId: string): void {
    this.storage.delete(`oauth:state:${stateId}`);
  }

  /**
   * Store token for a specific resource server
   */
  setToken(resource: string, token: TokenData): void {
    this.storage.set(`oauth:token:${resource}`, {
      ...token,
      receivedAt: Date.now()
    });
  }

  /**
   * Get token for a resource server
   */
  getToken(resource: string): TokenData | null {
    const stored = this.storage.get(`oauth:token:${resource}`);
    
    if (!stored) {
      return null;
    }

    return stored as TokenData;
  }

  /**
   * Check if token is expired or about to expire
   */
  isTokenExpired(token: TokenData): boolean {
    if (!token.expires_in) {
      return false; // No expiry means permanent token
    }

    const stored = this.storage.get(`oauth:token:${token.resource || 'default'}`);
    if (!stored) {
      return true;
    }

    const expiresAt = stored.receivedAt + (token.expires_in * 1000);
    return Date.now() >= (expiresAt - this.TOKEN_REFRESH_THRESHOLD);
  }

  /**
   * Get valid token or null if expired
   */
  getValidToken(resource: string): TokenData | null {
    const token = this.getToken(resource);
    
    if (!token) {
      return null;
    }

    if (this.isTokenExpired(token)) {
      this.storage.delete(`oauth:token:${resource}`);
      return null;
    }

    return token;
  }

  /**
   * Clear all tokens (for logout)
   */
  clearAllTokens(): void {
    for (const key of this.storage.keys()) {
      if (key.startsWith('oauth:token:')) {
        this.storage.delete(key);
      }
    }
  }

  /**
   * Remove token for specific resource
   */
  removeToken(resource: string): void {
    this.storage.delete(`oauth:token:${resource}`);
  }
}

// Singleton instance for application-wide use
export const oauthStorage = new McpOAuthTokenStorage();
