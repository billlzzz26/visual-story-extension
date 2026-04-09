import { generatePKCE, generateState } from './pkce';
import { McpAuthorizationDiscovery } from './discovery';
import { McpOAuthTokenStorage } from './storage';

interface OAuthFlowResult {
  authUrl: string;
  state: string;
  pkceVerifier: string;
}

export class McpOAuthService {
  private discovery = new McpAuthorizationDiscovery();
  private storage = new McpOAuthTokenStorage();

  async initiateOAuthFlow(serverUrl: string, wwwAuthenticateHeader?: string): Promise<OAuthFlowResult> {
    const metadata = await this.discovery.discoverAuthorizationServer(
      serverUrl,
      wwwAuthenticateHeader || ''
    );

    const { verifier, challenge } = generatePKCE();
    const state = generateState();

    // Store PKCE verifier and state for later verification
    await this.storage.set(serverUrl, {
      accessToken: '',
      pkceVerifier: verifier,
      state: state,
    });

    const authUrl = new URL(metadata.authorization_endpoint);
    authUrl.searchParams.set('client_id', process.env.CLIENT_ID!);
    authUrl.searchParams.set('response_type', 'code');
    authUrl.searchParams.set('code_challenge', challenge);
    authUrl.searchParams.set('code_challenge_method', 'S256');
    authUrl.searchParams.set('resource', serverUrl);
    authUrl.searchParams.set('state', state);
    authUrl.searchParams.set('redirect_uri', process.env.REDIRECT_URI!);

    return {
      authUrl: authUrl.toString(),
      state,
      pkceVerifier: verifier,
    };
  }

  async exchangeCodeForToken(
    serverUrl: string,
    code: string,
    state: string
  ): Promise<{ accessToken: string; refreshToken?: string }> {
    const stored = await this.storage.get(serverUrl);

    if (!stored || stored.state !== state) {
      throw new Error('Invalid state parameter - possible CSRF attack');
    }

    const metadata = await this.discovery.discoverAuthorizationServer(serverUrl, '');

    const tokenResponse = await fetch(metadata.token_endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        grant_type: 'authorization_code',
        code,
        redirect_uri: process.env.REDIRECT_URI!,
        code_verifier: stored.pkceVerifier!,
        resource: serverUrl,
      }),
    });

    if (!tokenResponse.ok) {
      throw new Error(`Token exchange failed: ${tokenResponse.statusText}`);
    }

    const data = await tokenResponse.json();

    // Store the tokens
    await this.storage.set(serverUrl, {
      accessToken: data.access_token,
      refreshToken: data.refresh_token,
      expiresAt: data.expires_in ? Date.now() + data.expires_in * 1000 : undefined,
    });

    return {
      accessToken: data.access_token,
      refreshToken: data.refresh_token,
    };
  }

  async getAccessToken(serverUrl: string): Promise<string | undefined> {
    const stored = await this.storage.get(serverUrl);
    
    if (!stored || !stored.accessToken) {
      return undefined;
    }

    // Check if token is expired
    if (stored.expiresAt && Date.now() > stored.expiresAt) {
      // TODO: Implement token refresh logic
      return undefined;
    }

    return stored.accessToken;
  }
}
