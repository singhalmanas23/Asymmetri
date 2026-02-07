import { streamText, convertToCoreMessages } from "ai";
import { google } from "@ai-sdk/google";
import { openai } from "@ai-sdk/openai";
import { getServerSession } from "next-auth";
import { authOptions } from "@/api/auth/[...nextauth]/route";
import { chatService } from "@/services/chat.service";
import { tools } from "@/server/llm/tools";
import { SYSTEM_PROMPT, LLM_CONFIG } from "@/server/constants/llm.constants";

export const maxDuration = 30;

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return new Response("Unauthorized", { status: 401 });
    }

    const { messages, chatId } = await req.json();
    const userId = session.user.id;

    if (!messages || messages.length === 0) {
      return new Response("No messages provided", { status: 400 });
    }

    // Process session ID or create new one
    let activeSessionId = chatId;
    let isNewSession = false;

    if (!activeSessionId) {
      const firstMessage = messages[messages.length - 1].content;
      let title = "New Chat";
      let description = "New Chat Session";

      try {
        const metadata = await chatService.generateSessionMetadata(firstMessage);
        title = metadata.title;
        description = metadata.description;
      } catch (e) {
        console.warn("Failed to generate metadata, using fallbacks:", e);
      }

      const created = await chatService.createSession(userId, title, description);
      activeSessionId = created.id;
      isNewSession = true;
    }

    const coreMessages = convertToCoreMessages(messages);

    const result = await streamText({
      model: LLM_CONFIG.model as any,
      system: SYSTEM_PROMPT,
      messages: coreMessages,
      tools,
      onFinish: async ({ text, toolCalls, toolResults }) => {
        try {
          // Save the full interaction to the database
          const lastUserMessage = messages[messages.length - 1].content;
          await chatService.saveMessagesAfterStreaming(
            userId,
            lastUserMessage,
            text || (toolCalls?.length ? "Aggregated tool results" : "Empty response"),
            activeSessionId,
            isNewSession
          );
        } catch (error) {
          console.error("Failed to save chat to database:", error);
        }
      },
    });

    return (result as any).toTextStreamResponse({
      headers: {
        "x-session-id": activeSessionId,
      }
    });
  } catch (error) {
    console.error("Chat API error:", error);

    // Check for quota/rate limit errors
    const errorMessage = (error as Error).message || "";
    const isQuotaError =
      errorMessage.includes("quota") ||
      errorMessage.includes("rate") ||
      errorMessage.includes("RESOURCE_EXHAUSTED") ||
      (error as any).statusCode === 429;

    if (isQuotaError) {
      return new Response(
        JSON.stringify({
          error: "API rate limit reached. Please try again in a moment.",
          code: "RATE_LIMIT"
        }),
        { status: 429, headers: { "Content-Type": "application/json" } }
      );
    }

    return new Response(
      JSON.stringify({ error: "Failed to process message", details: (error as Error).message }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}

// Keep the GET handler for fetching sessions
export async function GET(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return new Response("Unauthorized", { status: 401 });

  const { searchParams } = new URL(req.url);
  const limit = parseInt(searchParams.get("limit") || "20");
  const offset = parseInt(searchParams.get("offset") || "0");

  const result = await chatService.getUserSessions(session.user.id, limit, offset);
  return Response.json(result);
}
