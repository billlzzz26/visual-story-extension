interface TokenEntry {
  accessToken: string;
  refreshToken?: string;
  expiresAt?: number;
  pkceVerifier?: string;
  state?: string;
}

export class McpOAuthTokenStorage {
  private storage: Map<string, TokenEntry> = new Map();

  async set(serverUrl: string, token: TokenEntry): Promise<void> {
    this.storage.set(serverUrl, token);
  }

  async get(serverUrl: string): Promise<TokenEntry | undefined> {
    return this.storage.get(serverUrl);
  }

  async delete(serverUrl: string): Promise<void> {
    this.storage.delete(serverUrl);
  }

  async clear(): Promise<void> {
    this.storage.clear();
  }
}
