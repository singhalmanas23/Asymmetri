import { openai } from "@ai-sdk/openai";
import { google } from "@ai-sdk/google";
import { groq } from "@ai-sdk/groq";

export enum LLMProvider {
  OPENAI = "OPENAI",
  GEMINI = "GEMINI",
  GROQ = "GROQ",
}

function normalizeProvider(provider?: string): LLMProvider {
  if (!provider) return LLMProvider.GEMINI;
  const p = provider.toUpperCase();
  if (p === LLMProvider.OPENAI) return LLMProvider.OPENAI;
  if (p === LLMProvider.GROQ) return LLMProvider.GROQ;
  return LLMProvider.GEMINI;
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

  // ---- GROQ (Free Tier Option) ----
  if (normalizedProvider === LLMProvider.GROQ) {
    return {
      model: groq("llama-3.3-70b-versatile"), // Powerful Llama model for free
      temperature: 0.7,
      apiKeyRequired: "GROQ_API_KEY",
      name: "Groq (Llama 3)",
    } as const;
  }

  // ---- GEMINI ----
  return {
    model: google("gemini-1.5-flash-latest"),
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

Use tools whenever relevant to provide accurate information about weather, stocks, or Formula 1.
For other queries, answer directly and naturally.
`;
