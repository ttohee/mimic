/// <reference types="vite/client" />
import Anthropic from '@anthropic-ai/sdk';

const client = new Anthropic({
  apiKey: import.meta.env.VITE_CLAUDE_API_KEY,
  dangerouslyAllowBrowser: true,
});

export async function claudeComplete(
  messages: Array<{ role: 'user' | 'assistant'; content: string }>,
  system?: string,
): Promise<string> {
  const response = await client.messages.create({
    model: 'claude-haiku-4-5',
    max_tokens: 256,
    system,
    messages,
  });
  const block = response.content[0];
  return block.type === 'text' ? block.text : '';
}
