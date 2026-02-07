import { Suspense } from "react";
import { ChatInterface } from "../components/chat-interface";
import { Loader2 } from "lucide-react";
import { chatService } from "@/services/chat.service";
import { authOptions } from "@/api/auth/[...nextauth]/route";
import { getServerSession } from "next-auth";
import { notFound, redirect } from "next/navigation";

interface ChatDetailPageProps {
  params: {
    chatId: string;
  };
}

// This is a Server Component (SSR)
export default async function ChatDetailPage({ params }: any) {
  const { chatId } = await params;
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    redirect("/auth");
  }

  const chatSession = await chatService.getSessionById(chatId);

  if (!chatSession || chatSession.userId !== session.user.id) {
    notFound();
  }

  const initialMessages = await chatService.getConversationMessages(chatId);

  // Map DB messages to AI SDK Message format
  const mappedMessages = initialMessages.map(m => ({
    id: m.id,
    role: m.role as "user" | "assistant",
    content: m.content,
    createdAt: m.createdAt,
  }));

  return (
    <main className="flex-1 relative h-screen overflow-hidden bg-background">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-teal-500/5 via-transparent to-transparent pointer-events-none" />

      <Suspense fallback={
        <div className="h-full flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-primary/50" />
        </div>
      }>
        <ChatInterface id={chatId} initialMessages={mappedMessages as any} />
      </Suspense>
    </main>
  );
}
