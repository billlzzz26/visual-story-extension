/**
 * CLI Agent Mode Integration
 * Handles agent switching and mode management for CLI interactions
 */

export type AgentMode = 'code' | 'ask' | 'plan' | 'debug' | 'support';

export interface AgentConfig {
  mode: AgentMode;
  skills: string[];
  systemPrompt?: string;
}

export const AGENT_MODES: Record<AgentMode, AgentConfig> = {
  code: {
    mode: 'code',
    skills: ['code-review', 'refactoring', 'testing'],
    systemPrompt: 'You are an expert coding assistant. Help users write, review, and debug code.',
  },
  ask: {
    mode: 'ask',
    skills: ['knowledge-base', 'documentation'],
    systemPrompt: 'You are a helpful assistant. Answer questions clearly and accurately.',
  },
  plan: {
    mode: 'plan',
    skills: ['project-planning', 'task-breakdown'],
    systemPrompt: 'You are a project planning assistant. Help users break down tasks and create roadmaps.',
  },
  debug: {
    mode: 'debug',
    skills: ['debugging', 'error-analysis', 'troubleshooting'],
    systemPrompt: 'You are a debugging expert. Help users identify and fix issues in their code.',
  },
  support: {
    mode: 'support',
    skills: ['Order Lookup', 'Billing Support', 'Technical Support'],
    systemPrompt: `You are a professional support agent. Provide helpful customer support.`,
  },
};

/**
 * Get CLI command for agent mode
 */
export function getAgentCommand(mode: AgentMode): string {
  return `--agent ${mode}`;
}

/**
 * Parse slash command from user input
 */
export function parseSlashCommand(input: string): { command: string; args: string } | null {
  const match = input.match(/^\/(\w+)(?:\s+(.*))?$/);
  if (!match) {
    return null;
  }
  return {
    command: match[1],
    args: match[2] || '',
  };
}

/**
 * Handle agent-related slash commands
 */
export function handleAgentCommand(
  command: string,
  args: string,
  currentMode: AgentMode
): { newMode: AgentMode; message?: string } {
  switch (command) {
    case 'agents':
      // List available agents
      const agentList = Object.values(AGENT_MODES)
        .map(a => `- ${a.mode}: ${a.systemPrompt?.split('.')[0] || 'No description'}`)
        .join('\n');
      return {
        newMode: currentMode,
        message: `Available agents:\n${agentList}\n\nUse /switch <mode> to change agent.`,
      };

    case 'switch':
      // Switch to specified agent mode
      const targetMode = args.toLowerCase() as AgentMode;
      if (AGENT_MODES[targetMode]) {
        return {
          newMode: targetMode,
          message: `Switched to ${targetMode} agent.`,
        };
      }
      throw new Error(`Unknown agent mode: ${args}. Use /agents to see available modes.`);

    case 'newtask':
      // Start new task with current context
      return {
        newMode: currentMode,
        message: 'Starting new task. Previous context will be preserved.',
      };

    case 'smol':
      // Condense context
      return {
        newMode: currentMode,
        message: 'Condensing context to reduce token usage...',
      };

    default:
      throw new Error(`Unknown command: /${command}. Use /agents to see available commands.`);
  }
}

/**
 * Cycle through agent modes (for Tab/Shift+Tab functionality)
 */
export function cycleAgentMode(currentMode: AgentMode, direction: 'next' | 'prev'): AgentMode {
  const modes = Object.keys(AGENT_MODES) as AgentMode[];
  const currentIndex = modes.indexOf(currentMode);
  
  let newIndex: number;
  if (direction === 'next') {
    newIndex = (currentIndex + 1) % modes.length;
  } else {
    newIndex = (currentIndex - 1 + modes.length) % modes.length;
  }
  
  return modes[newIndex];
}

/**
 * Get skills for current agent mode
 */
export function getSkillsForMode(mode: AgentMode): string[] {
  return AGENT_MODES[mode]?.skills || [];
}

/**
 * Get system prompt for current agent mode
 */
export function getSystemPromptForMode(mode: AgentMode): string {
  return AGENT_MODES[mode]?.systemPrompt || '';
}
