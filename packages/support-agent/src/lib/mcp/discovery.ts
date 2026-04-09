import { generatePKCE, generateState } from './pkce';

interface AuthorizationServerMetadata {
  authorization_endpoint: string;
  token_endpoint: string;
  registration_endpoint?: string;
}

export class McpAuthorizationDiscovery {
  async discoverAuthorizationServer(
    serverUrl: string,
    wwwAuthenticateHeader: string
  ): Promise<AuthorizationServerMetadata> {
    // Extract resource server from WWW-Authenticate header
    const resourceMatch = wwwAuthenticateHeader.match(/resource_metadata="([^"]+)"/);
    
    if (resourceMatch) {
      const metadataUrl = resourceMatch[1];
      const response = await fetch(metadataUrl);
      return response.json();
    }

    // Fallback to RFC 8414 well-known discovery
    const url = new URL(serverUrl);
    const discoveryUrl = `${url.protocol}//${url.host}/.well-known/oauth-authorization-server`;
    
    try {
      const response = await fetch(discoveryUrl);
      if (response.ok) {
        return response.json();
      }
    } catch (error) {
      console.error('Discovery failed, using default endpoints');
    }

    // Default fallback
    return {
      authorization_endpoint: `${serverUrl}/oauth/authorize`,
      token_endpoint: `${serverUrl}/oauth/token`,
    };
  }
}
