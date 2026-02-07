import { Suspense } from "react";
import { ChatInterface } from "./components/chat-interface";
import { Loader2 } from "lucide-react";

// This is a Server Component (SSR)
export default function ChatPage() {
    return (
        <main className="flex-1 relative h-screen overflow-hidden bg-background">
            {/* Background patterns for premium feel */}
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-teal-500/5 via-transparent to-transparent pointer-events-none" />
            <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none" />

            <Suspense fallback={
                <div className="h-full flex items-center justify-center">
                    <Loader2 className="w-8 h-8 animate-spin text-primary/50" />
                </div>
            }>
                <ChatInterface />
            </Suspense>
        </main>
    );
}
