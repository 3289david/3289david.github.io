import { env } from 'cloudflare:workers';

export type WebsiteActionResult = {
  executionId: string;
  status: 'completed' | 'failed' | 'pending' | 'unknown' | 'rejected';
  data?: unknown; error?: string; code?: string;
};
type ConnectorBinding = {
  execute(input: { actionId: string; executionId: string; inputs: Record<string, unknown> }): Promise<WebsiteActionResult>;
  verifyEvent(body: string, signature: string): Promise<boolean>;
};

export function projectSecret(name: string): string {
  const value: unknown = Reflect.get(env, name);
  if (typeof value !== 'string' || !value) throw new Error('This service has not been configured yet.');
  return value;
}

export async function executeWebsiteAction(input: { actionId: string; executionId: string; inputs: Record<string, unknown> }): Promise<WebsiteActionResult> {
  const binding = (env as { REVAMP_CONNECTORS?: ConnectorBinding }).REVAMP_CONNECTORS;
  if (!binding) throw new Error('This website action has not been enabled yet.');
  return binding.execute(input);
}
