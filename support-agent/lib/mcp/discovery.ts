/**
 * MCP Authorization Discovery
 * Implements RFC 9728 and RFC 8414 for OAuth 2.1 Authorization Server discovery
 */

export interface AuthorizationServerMetadata {
  issuer: string;
  authorization_endpoint: string;
  token_endpoint: string;
  registration_endpoint?: string;
  scopes_supported?: string[];
  response_types_supported: string[];
  grant_types_supported?: string[];
  code_challenge_methods_supported?: string[];
}

export class McpAuthorizationDiscovery {
  /**
   * Discover authorization server metadata from WWW-Authenticate header or well-known endpoint
   */
  async discoverAuthorizationServer(
    serverUrl: string,
    wwwAuthenticateHeader?: string
  ): Promise<AuthorizationServerMetadata> {
    // Extract resource server from WWW-Authenticate header if provided
    let authServerUrl = serverUrl;
    
    if (wwwAuthenticateHeader) {
      const resourceMatch = wwwAuthenticateHeader.match(/resource="([^"]+)"/);
      if (resourceMatch) {
        authServerUrl = resourceMatch[1];
      }
    }

    // Try RFC 9728 protected resource metadata first
    try {
      const protectedResourceUrl = new URL('/.well-known/oauth-protected-resource', authServerUrl);
      const protectedResourceResponse = await fetch(protectedResourceUrl.toString());
      
      if (protectedResourceResponse.ok) {
        const protectedResourceData = await protectedResourceResponse.json();
        if (protectedResourceData.authorization_servers?.[0]) {
          authServerUrl = protectedResourceData.authorization_servers[0];
        }
      }
    } catch (error) {
      // Fall through to standard discovery
      console.debug('Protected resource metadata not available, using standard discovery');
    }

    // RFC 8414 Authorization Server Metadata discovery
    const metadataUrl = new URL('/.well-known/oauth-authorization-server', authServerUrl);
    const response = await fetch(metadataUrl.toString());
    
    if (!response.ok) {
      throw new Error(`Failed to discover authorization server metadata: ${response.status} ${response.statusText}`);
    }

    const metadata = await response.json() as AuthorizationServerMetadata;
    
    // Validate required fields
    if (!metadata.authorization_endpoint || !metadata.token_endpoint) {
      throw new Error('Invalid authorization server metadata: missing required endpoints');
    }

    return metadata;
  }

  /**
   * Get supported scopes from authorization server
   */
  async getSupportedScopes(serverUrl: string): Promise<string[]> {
    const metadata = await this.discoverAuthorizationServer(serverUrl);
    return metadata.scopes_supported || [];
  }

  /**
   * Check if PKCE S256 is supported
   */
  async isPKCESupported(serverUrl: string): Promise<boolean> {
    const metadata = await this.discoverAuthorizationServer(serverUrl);
    return metadata.code_challenge_methods_supported?.includes('S256') ?? false;
  }
}
