import { SUPPORT_SYSTEM_PROMPT } from '@/lib/agents/skills-data';

export interface SandboxConfig {
  agent: string;
  files?: Array<{ path: string; content: string }>;
  envs?: Record<string, string>;
  setup?: string;
  timeoutMs?: number;
  networkAllowOut?: boolean;
  networkDenyOut?: boolean;
}

export interface SandboxInfo {
  id: string;
  status: 'running' | 'stopped' | 'error';
  agent: string;
  threads: Array<{ id: string; createdAt: string }>;
  error?: string;
}

export class SandboxManager {
  private apiBaseUrl: string;
  private apiKey: string;

  constructor(apiKey?: string) {
    this.apiKey = apiKey || process.env.KILO_API_KEY!;
    this.apiBaseUrl = 'https://api.e2b.dev'; // หรือผู้ให้บริการ Sandbox ที่ใช้
  }

  async createSandbox(config: SandboxConfig): Promise<SandboxInfo> {
    const response = await fetch(`${this.apiBaseUrl}/sandboxes`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${this.apiKey}`,
      },
      body: JSON.stringify(config),
    });

    if (!response.ok) {
      throw new Error(`Failed to create sandbox: ${response.statusText}`);
    }

    return response.json();
  }

  async getSandbox(sandboxId: string): Promise<SandboxInfo> {
    const response = await fetch(`${this.apiBaseUrl}/sandboxes/${sandboxId}`, {
      headers: {
        Authorization: `Bearer ${this.apiKey}`,
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to get sandbox: ${response.statusText}`);
    }

    return response.json();
  }

  async deleteSandbox(sandboxId: string): Promise<void> {
    const response = await fetch(`${this.apiBaseUrl}/sandboxes/${sandboxId}`, {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${this.apiKey}`,
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to delete sandbox: ${response.statusText}`);
    }
  }

  async execCommand(
    sandboxId: string,
    command: string,
    options?: {
      cwd?: string;
      envs?: Record<string, string>;
      timeoutMs?: number;
    }
  ): Promise<{ stdout: string; stderr: string; exitCode: number }> {
    const response = await fetch(`${this.apiBaseUrl}/sandboxes/${sandboxId}/exec`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${this.apiKey}`,
      },
      body: JSON.stringify({
        command,
        ...options,
      }),
    });

    if (!response.ok) {
      throw new Error(`Failed to execute command: ${response.statusText}`);
    }

    return response.json();
  }

  async writeFile(
    sandboxId: string,
    files: Array<{ path: string; content: string }>
  ): Promise<void> {
    const response = await fetch(`${this.apiBaseUrl}/sandboxes/${sandboxId}/files`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${this.apiKey}`,
      },
      body: JSON.stringify({ files }),
    });

    if (!response.ok) {
      throw new Error(`Failed to write files: ${response.statusText}`);
    }
  }

  async readFile(sandboxId: string, path: string): Promise<string> {
    const response = await fetch(
      `${this.apiBaseUrl}/sandboxes/${sandboxId}/files?path=${encodeURIComponent(path)}`,
      {
        headers: {
          Authorization: `Bearer ${this.apiKey}`,
        },
      }
    );

    if (!response.ok) {
      throw new Error(`Failed to read file: ${response.statusText}`);
    }

    const data = await response.json();
    return data.content;
  }

  async cloneGitRepo(
    sandboxId: string,
    url: string,
    options?: {
      path?: string;
      token?: string;
      depth?: number;
    }
  ): Promise<void> {
    const response = await fetch(`${this.apiBaseUrl}/sandboxes/${sandboxId}/git/clone`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${this.apiKey}`,
      },
      body: JSON.stringify({
        url,
        ...options,
      }),
    });

    if (!response.ok) {
      throw new Error(`Failed to clone repository: ${response.statusText}`);
    }
  }

  async injectSkills(sandboxId: string, skills: Array<{ name: string; content: string }>): Promise<void> {
    const files = skills.map((skill) => ({
      path: `/home/user/workspace/.claude/skills/${skill.name.toLowerCase().replace(/\s+/g, '-')}/SKILL.md`,
      content: skill.content,
    }));

    await this.writeFile(sandboxId, files);
  }
}
