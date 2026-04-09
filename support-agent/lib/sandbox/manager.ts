/**
 * Sandbox Runtime Manager
 * Manages E2B sandbox lifecycle for isolated agent execution
 */

export interface SandboxConfig {
  agent: string;
  files?: Array<{ path: string; content: string }>;
  envs?: Record<string, string>;
  setup?: string;
  timeoutMs?: number;
  networkAllowOut?: string[];
  networkDenyOut?: string[];
}

export interface SandboxInfo {
  id: string;
  status: 'running' | 'stopped' | 'error';
  agent: string;
  createdAt: number;
  threads: ThreadSummary[];
  error?: string;
}

export interface ThreadSummary {
  id: string;
  createdAt: number;
  messageCount: number;
}

export interface ExecResult {
  stdout: string;
  stderr: string;
  exitCode: number;
}

export class SandboxManager {
  private baseUrl: string;
  private apiKey: string;

  constructor(baseUrl: string, apiKey: string) {
    this.baseUrl = baseUrl;
    this.apiKey = apiKey;
  }

  private async request<T>(endpoint: string, options: RequestInit): Promise<T> {
    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        'X-API-Key': this.apiKey,
        ...options.headers,
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Sandbox API error: ${response.status} ${errorText}`);
    }

    return response.json() as Promise<T>;
  }

  /**
   * Create a new sandbox runtime
   */
  async create(config: SandboxConfig): Promise<SandboxInfo> {
    const response = await this.request('/sandboxes', {
      method: 'POST',
      body: JSON.stringify(config),
    });

    return response as SandboxInfo;
  }

  /**
   * Get sandbox status and info
   */
  async get(sandboxId: string): Promise<SandboxInfo> {
    return this.request(`/sandboxes/${sandboxId}`, {
      method: 'GET',
    });
  }

  /**
   * Delete a sandbox and all its threads
   */
  async delete(sandboxId: string): Promise<void> {
    await this.request(`/sandboxes/${sandboxId}`, {
      method: 'DELETE',
    });
  }

  /**
   * Execute a command in the sandbox
   */
  async exec(
    sandboxId: string,
    command: string,
    options?: {
      cwd?: string;
      envs?: Record<string, string>;
      timeoutMs?: number;
    }
  ): Promise<ExecResult> {
    return this.request(`/sandboxes/${sandboxId}/exec`, {
      method: 'POST',
      body: JSON.stringify({
        command,
        ...options,
      }),
    });
  }

  /**
   * Write files to the sandbox filesystem
   */
  async filesWrite(
    sandboxId: string,
    files: Array<{ path: string; content: string }>
  ): Promise<void> {
    await this.request(`/sandboxes/${sandboxId}/files/write`, {
      method: 'POST',
      body: JSON.stringify({ files }),
    });
  }

  /**
   * Read a file from the sandbox filesystem
   */
  async filesRead(sandboxId: string, path: string): Promise<string> {
    const response = await this.request<{ content: string }>(
      `/sandboxes/${sandboxId}/files/read`,
      {
        method: 'POST',
        body: JSON.stringify({ path }),
      }
    );
    return response.content;
  }

  /**
   * Clone a git repository into the sandbox
   */
  async gitClone(
    sandboxId: string,
    url: string,
    options?: {
      path?: string;
      token?: string;
      depth?: number;
    }
  ): Promise<void> {
    await this.request(`/sandboxes/${sandboxId}/git/clone`, {
      method: 'POST',
      body: JSON.stringify({
        url,
        ...options,
      }),
    });
  }

  /**
   * Initialize sandbox with skills files
   */
  async initializeSkills(
    sandboxId: string,
    skills: Array<{ name: string; content: string }>
  ): Promise<void> {
    const files = skills.map(skill => ({
      path: `/home/user/workspace/.claude/skills/${skill.name.toLowerCase().replace(/\s+/g, '-')}/SKILL.md`,
      content: skill.content,
    }));

    await this.filesWrite(sandboxId, files);
  }
}

// Singleton instance (configure with environment variables)
export function createSandboxManager(): SandboxManager {
  const baseUrl = process.env.E2B_BASE_URL || 'https://api.e2b.dev';
  const apiKey = process.env.E2B_API_KEY || '';
  
  if (!apiKey) {
    throw new Error('E2B_API_KEY environment variable is required');
  }

  return new SandboxManager(baseUrl, apiKey);
}
