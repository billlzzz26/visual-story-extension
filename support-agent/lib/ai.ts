import { openai } from '@ai-sdk/openai';
import { streamText, type CoreMessage } from 'ai';
import { SUPPORT_SYSTEM_PROMPT, ALL_SKILLS } from '@/lib/agents/skills-data';
import { getSkillsForMode, getSystemPromptForMode, type AgentMode } from '@/lib/agents/cli-bridge';
import { createSandboxManager } from '@/lib/sandbox/manager';
import { oauthStorage } from '@/lib/mcp/storage';

export interface ChatRequest {
  messages: Array<{ role: string; content: string }>;
  mode?: AgentMode;
  sandboxId?: string;
}

/**
 * Initialize sandbox and inject skills
 */
async function initializeSandbox(mode: AgentMode): Promise<string> {
  const sandboxManager = createSandboxManager();
  const skills = getSkillsForMode(mode);
  
  // Create sandbox with agent config
  const sandbox = await sandboxManager.create({
    agent: mode,
    envs: {
      KILO_API_KEY: process.env.KILO_API_KEY || '',
    },
  });

  // Inject skills into sandbox
  if (skills.length > 0) {
    const skillData = skills.map(skillName => {
      const skill = ALL_SKILLS.find(s => s.name === skillName);
      return {
        name: skillName,
        content: skill?.content || `# ${skillName}\nNo content available`,
      };
    });

    await sandboxManager.initializeSkills(sandbox.id, skillData);
  }

  return sandbox.id;
}

/**
 * Build system prompt with skills context
 */
function buildSystemPrompt(mode: AgentMode, activeSkills?: string[]): string {
  const basePrompt = getSystemPromptForMode(mode) || SUPPORT_SYSTEM_PROMPT;
  
  if (!activeSkills || activeSkills.length === 0) {
    return basePrompt;
  }

  const skillsContext = activeSkills
    .map(skillName => {
      const skill = ALL_SKILLS.find(s => s.name === skillName);
      return skill ? `\n\n## ${skillName}\n${skill.content}` : '';
    })
    .join('');

  return `${basePrompt}\n\n# Available Skills${skillsContext}`;
}

/**
 * Check for OAuth token requirement in API calls
 */
async function getOAuthToken(apiEndpoint?: string): Promise<string | undefined> {
  if (!apiEndpoint) {
    return undefined;
  }

  const token = oauthStorage.getValidToken(apiEndpoint);
  return token?.access_token;
}

/**
 * Main chat handler with Vercel AI SDK streaming
 */
export async function handleChat(request: ChatRequest) {
  const { messages, mode = 'support', sandboxId: existingSandboxId } = request;

  let sandboxId = existingSandboxId;

  // Initialize sandbox if not provided
  if (!sandboxId) {
    sandboxId = await initializeSandbox(mode);
  }

  // Get active skills for this mode
  const activeSkills = getSkillsForMode(mode);

  // Build system prompt with skills
  const systemPrompt = buildSystemPrompt(mode, activeSkills);

  // Convert messages to CoreMessage format
  const coreMessages: CoreMessage[] = [
    { role: 'system', content: systemPrompt },
    ...messages.map(m => ({
      role: m.role as 'user' | 'assistant',
      content: m.content,
    })),
  ];

  // Stream response using Vercel AI SDK
  const result = streamText({
    model: openai('gpt-4o'),
    messages: coreMessages,
    temperature: 0.7,
    maxTokens: 2000,
    onFinish: async ({ text, finishReason }) => {
      // Log completion for analytics
      console.log(`Chat completed: ${finishReason}, tokens used`);
    },
  });

  // Return stream for AI SDK's useChat hook
  return result.toAIStreamResponse();
}

/**
 * Handle skill injection during conversation
 */
export async function injectSkill(
  sandboxId: string,
  skillName: string,
  skillContent: string
): Promise<void> {
  const sandboxManager = createSandboxManager();
  
  await sandboxManager.filesWrite(sandboxId, [
    {
      path: `/home/user/workspace/.claude/skills/${skillName.toLowerCase().replace(/\s+/g, '-')}/SKILL.md`,
      content: skillContent,
    },
  ]);
}

/**
 * Execute command in sandbox (for testing APIs mentioned in skills)
 */
export async function executeInSandbox(
  sandboxId: string,
  command: string,
  options?: { cwd?: string; envs?: Record<string, string> }
): Promise<{ stdout: string; stderr: string; exitCode: number }> {
  const sandboxManager = createSandboxManager();
  return sandboxManager.exec(sandboxId, command, options);
}
