/** Azure OpenAI pricing per 1M tokens (Global Standard).
 *  Source: https://azure.microsoft.com/en-us/pricing/details/cognitive-services/openai-service/
 *  Last updated: July 2025 */

export interface ModelPricing {
  input: number;      // $ per 1M input tokens
  cachedInput: number; // $ per 1M cached input tokens
  output: number;     // $ per 1M output tokens
}

export interface ImageModelPricing {
  inputText: number;       // $ per 1M input text tokens
  cachedInputText: number; // $ per 1M cached input text tokens
  outputImage: number;     // $ per 1M output image tokens
}

const chatPricing: Record<string, ModelPricing> = {
  'gpt-4.1-mini':  { input: 0.40,  cachedInput: 0.10,  output: 1.60 },
  'gpt-4.1-nano':  { input: 0.10,  cachedInput: 0.03,  output: 0.40 },
  'gpt-5-mini':    { input: 0.25,  cachedInput: 0.03,  output: 2.00 },
  'gpt-5-nano':    { input: 0.05,  cachedInput: 0.01,  output: 0.40 },
  'gpt-5.4-mini':  { input: 0.25,  cachedInput: 0.03,  output: 2.00 }, // estimated, same as gpt-5-mini
  'gpt-5.4-nano':  { input: 0.05,  cachedInput: 0.01,  output: 0.40 }, // estimated, same as gpt-5-nano
};

const imagePricing: Record<string, ImageModelPricing> = {
  'gpt-image-1.5': { inputText: 5.00, cachedInputText: 1.25, outputImage: 32.00 },
  'gpt-image-1':   { inputText: 5.00, cachedInputText: 1.25, outputImage: 40.00 },
};

export interface TokenUsage {
  model: string;
  inputTokens: number;
  outputTokens: number;
  cachedTokens: number;
}

export function computeChatCost(usage: TokenUsage): number {
  const pricing = chatPricing[usage.model];
  if (!pricing) return 0;

  const billableInput = usage.inputTokens - usage.cachedTokens;
  return (
    (billableInput / 1_000_000) * pricing.input +
    (usage.cachedTokens / 1_000_000) * pricing.cachedInput +
    (usage.outputTokens / 1_000_000) * pricing.output
  );
}

export function computeImageCost(usage: TokenUsage): number {
  const pricing = imagePricing[usage.model];
  if (!pricing) return 0;

  const billableInput = usage.inputTokens - usage.cachedTokens;
  return (
    (billableInput / 1_000_000) * pricing.inputText +
    (usage.cachedTokens / 1_000_000) * pricing.cachedInputText +
    (usage.outputTokens / 1_000_000) * pricing.outputImage
  );
}

export function formatCost(cost: number): string {
  return `$${cost.toFixed(2)}`;
}

export function formatTokens(n: number): string {
  if (n >= 1000) return `${(n / 1000).toFixed(1)}k`;
  return String(n);
}
