import { generatePKCE, generateState } from './pkce';
import { McpAuthorizationDiscovery } from './discovery';
import { oauthStorage, type TokenData } from './storage';

export interface OAuthConfig {
  clientId: string;
  redirectUri: string;
  scopes?: string[];
}

export class McpOAuthService {
  private discovery = new McpAuthorizationDiscovery();

  constructor(private config: OAuthConfig) {}

  /**
   * Initiate OAuth flow and return authorization URL
   */
  async initiateOAuthFlow(serverUrl: string, wwwAuthenticateHeader?: string): Promise<string> {
    const metadata = await this.discovery.discoverAuthorizationServer(serverUrl, wwwAuthenticateHeader);
    const { verifier, challenge } = generatePKCE();
    const state = generateState();
    
    // Store state and verifier for later verification
    oauthStorage.setState(state, {
      verifier,
      state,
      timestamp: Date.now(),
      resource: serverUrl
    });
    
    const authUrl = new URL(metadata.authorization_endpoint);
    authUrl.searchParams.set("client_id", this.config.clientId);
    authUrl.searchParams.set("response_type", "code");
    authUrl.searchParams.set("code_challenge", challenge);
    authUrl.searchParams.set("code_challenge_method", "S256");
    authUrl.searchParams.set("resource", serverUrl);
    authUrl.searchParams.set("state", state);
    
    if (this.config.redirectUri) {
      authUrl.searchParams.set("redirect_uri", this.config.redirectUri);
    }
    
    if (this.config.scopes && this.config.scopes.length > 0) {
      authUrl.searchParams.set("scope", this.config.scopes.join(' '));
    }

    return authUrl.toString();
  }

  /**
   * Handle OAuth callback and exchange code for token
   */
  async handleCallback(
    callbackUrl: string,
    serverUrl: string
  ): Promise<TokenData> {
    const url = new URL(callbackUrl);
    const code = url.searchParams.get('code');
    const state = url.searchParams.get('state');
    const error = url.searchParams.get('error');
    
    if (error) {
      throw new Error(`OAuth error: ${error}`);
    }
    
    if (!code || !state) {
      throw new Error('Invalid callback: missing code or state');
    }
    
    // Verify state matches
    const storedState = oauthStorage.getState(state);
    if (!storedState) {
      throw new Error('Invalid or expired state parameter');
    }
    
    if (storedState.state !== state) {
      throw new Error('State mismatch - possible CSRF attack');
    }
    
    // Clear state after use
    oauthStorage.clearState(state);
    
    // Discover token endpoint
    const metadata = await this.discovery.discoverAuthorizationServer(serverUrl);
    
    // Exchange code for token
    const tokenResponse = await fetch(metadata.token_endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        grant_type: 'authorization_code',
        code,
        redirect_uri: this.config.redirectUri,
        code_verifier: storedState.verifier,
        resource: serverUrl,
        client_id: this.config.clientId,
      }),
    });
    
    if (!tokenResponse.ok) {
      const errorText = await tokenResponse.text();
      throw new Error(`Token exchange failed: ${tokenResponse.status} ${errorText}`);
    }
    
    const tokenData = await tokenResponse.json() as TokenData;
    
    // Store token for future use
    oauthStorage.setToken(serverUrl, {
      ...tokenData,
      resource: serverUrl
    });
    
    return tokenData;
  }

  /**
   * Get valid access token for a resource server
   * Will refresh if expired (if refresh token available)
   */
  async getAccessToken(serverUrl: string): Promise<string> {
    let token = oauthStorage.getValidToken(serverUrl);
    
    if (token) {
      return token.access_token;
    }
    
    // Try to refresh if we have a refresh token
    const storedToken = oauthStorage.getToken(serverUrl);
    if (storedToken?.refresh_token) {
      token = await this.refreshToken(serverUrl, storedToken.refresh_token);
      return token.access_token;
    }
    
    throw new Error('No valid token available. Please re-authenticate.');
  }

  /**
   * Refresh access token using refresh token
   */
  async refreshToken(serverUrl: string, refreshToken: string): Promise<TokenData> {
    const metadata = await this.discovery.discoverAuthorizationServer(serverUrl);
    
    const tokenResponse = await fetch(metadata.token_endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        grant_type: 'refresh_token',
        refresh_token: refreshToken,
        resource: serverUrl,
        client_id: this.config.clientId,
      }),
    });
    
    if (!tokenResponse.ok) {
      // Refresh failed, clear old token
      oauthStorage.removeToken(serverUrl);
      throw new Error(`Token refresh failed: ${tokenResponse.status}`);
    }
    
    const tokenData = await tokenResponse.json() as TokenData;
    
    // Store new token
    oauthStorage.setToken(serverUrl, {
      ...tokenData,
      resource: serverUrl
    });
    
    return tokenData;
  }

  /**
   * Check if user is authenticated for a resource server
   */
  isAuthenticated(serverUrl: string): boolean {
    return oauthStorage.getValidToken(serverUrl) !== null;
  }

  /**
   * Logout - clear all tokens for a resource server
   */
  logout(serverUrl: string): void {
    oauthStorage.removeToken(serverUrl);
  }
}
