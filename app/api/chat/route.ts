import { streamText } from "ai";
import { google } from "@ai-sdk/google";
import { openai } from "@ai-sdk/openai";
import { getServerSession } from "next-auth";
import { authOptions } from "@/api/auth/[...nextauth]/route";
import { chatService } from "@/services/chat.service";
import { tools } from "@/server/llm/tools";
import { SYSTEM_PROMPT, LLM_CONFIG } from "@/server/constants/llm.constants";

export const maxDuration = 30;

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return new Response("Unauthorized", { status: 401 });
  }

  const { messages, chatId } = await req.json();
  const userId = session.user.id;

  // Process session ID or create new one
  let activeSessionId = chatId;
  let isNewSession = false;

  if (!activeSessionId) {
    const firstMessage = messages[messages.length - 1].content;
    const metadata = await chatService.generateSessionMetadata(firstMessage);
    const result = await chatService.processMessageStreaming(userId, firstMessage); // This creates session
    activeSessionId = result.sessionId;
    isNewSession = true;
  }

  const result = await streamText({
    model: LLM_CONFIG.model,
    system: SYSTEM_PROMPT,
    messages,
    tools,
    maxSteps: 5,
    onFinish: async ({ text, toolCalls, toolResults }) => {
      try {
        // Save to DB
        const userMessage = messages[messages.length - 1].content;
        await chatService.saveMessagesAfterStreaming(
          userId,
          userMessage,
          text || "Processed tool calls",
          activeSessionId,
          isNewSession
        );
      } catch (error) {
        console.error("Failed to save chat to database:", error);
      }
    },
  });

  return result.toTextStreamResponse({
    headers: {
      "x-session-id": activeSessionId,
    }
  });
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
