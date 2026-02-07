import { openai } from "@ai-sdk/openai";
import { google } from "@ai-sdk/google";

export enum LLMProvider {
  OPENAI = "OPENAI",
  GEMINI = "GEMINI",
}

function normalizeProvider(provider?: string): LLMProvider {
  if (!provider) return LLMProvider.GEMINI;
  return provider.toUpperCase() === LLMProvider.OPENAI
    ? LLMProvider.OPENAI
    : LLMProvider.GEMINI;
}

export function getLlmConfig(provider?: string) {
  const normalizedProvider = normalizeProvider(provider);

  // ---- OPENAI ----
  if (normalizedProvider === LLMProvider.OPENAI) {
    return {
      model: openai("gpt-4o"),
      temperature: 0.7,
      apiKeyRequired: "OPENAI_API_KEY",
      name: "OpenAI",
    } as const;
  }

  // ---- GEMINI ----
  return {
    model: google("gemini-2.0-flash"),
    temperature: 0.7,
    apiKeyRequired: "GOOGLE_GENERATIVE_AI_API_KEY",
    name: "Gemini",
  } as const;
}

export const LLM_CONFIG = getLlmConfig(process.env.LLM_PROVIDER);

export const SYSTEM_PROMPT = `
You are a helpful, intelligent AI assistant.

Keep responses under 500 characters.
Do not over-explain.

Only use tools when explicitly asked for:
- weather
- stock prices
- Formula 1 schedules

For everything else, answer directly and naturally.
`;
