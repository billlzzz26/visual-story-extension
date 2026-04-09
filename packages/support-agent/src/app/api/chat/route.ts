import { StreamingTextResponse, streamText } from 'ai';
import { OpenAI } from '@ai-sdk/openai';
import { McpOAuthService } from '@/lib/mcp/oauth-service';
import { SandboxManager } from '@/lib/sandbox/manager';
import { SUPPORT_SYSTEM_PROMPT, ORDER_LOOKUP_SKILL, BILLING_SKILL, TECHNICAL_SKILL } from '@/lib/agents/skills-data';
import { getAgentModeById, parseSlashCommand } from '@/lib/agents/cli-bridge';

export const runtime = 'edge';
export const maxDuration = 60;

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const oauthService = new McpOAuthService();
const sandboxManager = new SandboxManager();

// Store active sessions in memory (use Redis in production)
const activeSessions = new Map<string, { sandboxId: string; sessionId: string; mode: string }>();

export async function POST(req: Request) {
  try {
    const { messages, sessionId, mode = 'support', skills = [] } = await req.json();

    // Handle slash commands
    const lastMessage = messages[messages.length - 1];
    const slashCommand = parseSlashCommand(lastMessage.content);

    if (slashCommand) {
      return await handleSlashCommand(slashCommand, sessionId, mode);
    }

    // Get or create session
    let session = activeSessions.get(sessionId);
    
    if (!session) {
      // Create new sandbox for this session
      const sandbox = await sandboxManager.createSandbox({
        agent: mode,
        envs: {
          KILO_API_KEY: process.env.KILO_API_KEY!,
        },
        timeoutMs: 300000, // 5 minutes
      });

      // Inject skills into sandbox
      const skillContents = [
        { name: 'Order Lookup', content: ORDER_LOOKUP_SKILL },
        { name: 'Billing Support', content: BILLING_SKILL },
        { name: 'Technical Support', content: TECHNICAL_SKILL },
        ...skills.map((s: { name: string; content: string }) => ({ name: s.name, content: s.content })),
      ];

      await sandboxManager.injectSkills(sandbox.id, skillContents);

      session = {
        sandboxId: sandbox.id,
        sessionId: sessionId || crypto.randomUUID(),
        mode,
      };

      activeSessions.set(session.sessionId, session);
    }

    // Check if OAuth is required for MCP server access
    const mcpServerUrl = process.env.DOCS_URL;
    if (mcpServerUrl) {
      const accessToken = await oauthService.getAccessToken(mcpServerUrl);
      
      if (!accessToken) {
        // Return OAuth URL to client
        return new Response(
          JSON.stringify({
            requiresOAuth: true,
            oauthUrl: await oauthService.initiateOAuthFlow(mcpServerUrl),
          }),
          { status: 401, headers: { 'Content-Type': 'application/json' } }
        );
      }
    }

    // Build system prompt with agent mode
    const agentMode = getAgentModeById(mode);
    const systemPrompt = agentMode
      ? `${SUPPORT_SYSTEM_PROMPT}\n\nCurrent Mode: ${agentMode.name}\n${agentMode.description}`
      : SUPPORT_SYSTEM_PROMPT;

    // Stream response using Vercel AI SDK
    const result = await streamText({
      model: openai('gpt-4o'),
      system: systemPrompt,
      messages: messages.map((m: { role: string; content: string }) => ({
        role: m.role,
        content: m.content,
      })),
      temperature: 0.7,
      maxTokens: 2048,
    });

    return result.toDataStreamResponse();
  } catch (error) {
    console.error('Chat API error:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}

async function handleSlashCommand(
  command: { command: string; args?: string },
  sessionId: string,
  currentMode: string
): Promise<Response> {
  switch (command.command) {
    case 'agents':
      // Return list of available agents
      return new Response(
        JSON.stringify({
          type: 'agent_list',
          message: 'Available agents: support, code, planner, debug',
        }),
        { status: 200, headers: { 'Content-Type': 'application/json' } }
      );

    case 'newtask':
      // Clear session context but keep sandbox
      activeSessions.delete(sessionId);
      return new Response(
        JSON.stringify({
          type: 'new_task',
          message: 'Started new task with fresh context',
        }),
        { status: 200, headers: { 'Content-Type': 'application/json' } }
      );

    case 'smol':
      // Context condensation request
      return new Response(
        JSON.stringify({
          type: 'condense',
          message: 'Context window will be condensed',
        }),
        { status: 200, headers: { 'Content-Type': 'application/json' } }
      );

    default:
      return new Response(
        JSON.stringify({ error: `Unknown command: /${command.command}` }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
  }
}

export async function GET() {
  return new Response(
    JSON.stringify({
      message: 'Support Agent API is running',
      version: '1.0.0',
      features: ['MCP OAuth', 'Sandbox Runtime', 'CLI Agent Mode', 'Skills System'],
    }),
    { status: 200, headers: { 'Content-Type': 'application/json' } }
  );
}
