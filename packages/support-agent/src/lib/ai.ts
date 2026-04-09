import { OpenAI } from '@ai-sdk/openai';
import { streamText, StreamTextResult } from 'ai';
import { SUPPORT_SYSTEM_PROMPT } from '@/lib/agents/skills-data';

export interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

export interface ChatOptions {
  messages: ChatMessage[];
  systemPrompt?: string;
  skills?: string[];
  apiKey?: string;
}

export function createOpenAIProvider(apiKey?: string) {
  return new OpenAI({
    apiKey: apiKey || process.env.OPENAI_API_KEY,
  });
}

export async function streamChatResponse(
  options: ChatOptions
): Promise<StreamTextResult<any, any>> {
  const openai = createOpenAIProvider(options.apiKey);

  const systemPrompt = options.systemPrompt || SUPPORT_SYSTEM_PROMPT;
  
  // Inject skills into system prompt if provided
  const enhancedSystemPrompt = options.skills && options.skills.length > 0
    ? `${systemPrompt}\n\n## Available Skills:\n${options.skills.join('\n')}`
    : systemPrompt;

  return streamText({
    model: openai('gpt-4o'),
    system: enhancedSystemPrompt,
    messages: options.messages.map((msg) => ({
      role: msg.role,
      content: msg.content,
    })),
    temperature: 0.7,
    maxTokens: 2048,
  });
}

export function formatMessagesForStreaming(messages: ChatMessage[]): Array<{ role: string; content: string }> {
  return messages.map((msg) => ({
    role: msg.role,
    content: msg.content,
  }));
}
