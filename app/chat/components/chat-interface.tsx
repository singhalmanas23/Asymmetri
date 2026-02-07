"use client";

import { useChat } from "@ai-sdk/react";
// import { type Message } from "ai"; // Use any to bypass lint for now
import { Button } from "@/common/components/ui/button";
import { Input } from "@/common/components/ui/input";
import { ScrollArea } from "@/common/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/common/components/ui/avatar";
import { Card, CardContent, CardHeader, CardTitle } from "@/common/components/ui/card";
import { Send, Bot, User as UserIcon, Loader2, CloudSun, DollarSign, Trophy } from "lucide-react";
import { WeatherCard } from "./tools/weather-card";
import { StockCard } from "./tools/stock-card";
import { RaceCard } from "./tools/race-card";
import { ChatInput } from "@/common/components/sidebar/components/chat-input";
import { useEffect, useRef } from "react";
import { cn } from "@/common/lib/utils";
import { deleteChatSession } from "@/lib/actions";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

interface ChatInterfaceProps {
    id?: string;
    initialMessages?: any[];
}

export function ChatInterface({ id, initialMessages = [] }: ChatInterfaceProps) {
    const scrollRef = useRef<HTMLDivElement>(null);
    const router = useRouter();

    const { messages, status, error, sendMessage } = useChat({
        api: "/api/chat",
        id,
        initialMessages: initialMessages as any,
        body: { chatId: id },
        onResponse: (response: Response) => {
            const sessionId = response.headers.get("x-session-id");
            if (sessionId && !id) {
                router.push(`/chat/${sessionId}`);
            }
        },
        onError: (err: any) => {
            console.error("Chat error:", err);
            let message = "Failed to send message";

            // Handle both JSON error responses and raw text/status codes
            if (err.message) {
                try {
                    // Our API returns JSON for 429 errors
                    const parsed = JSON.parse(err.message);
                    if (parsed.error) message = parsed.error;
                } catch (e) {
                    // Fallback for non-JSON or other error formats
                    if (err.message.includes("429") ||
                        err.message.includes("quota") ||
                        err.message.toLowerCase().includes("limit") ||
                        err.message.includes("RESOURCE_EXHAUSTED")) {
                        message = "AI Provider rate limit reached. Please wait a moment before retrying.";
                    } else {
                        message = err.message;
                    }
                }
            }

            toast.error(message, {
                description: err.message || "This usually happens on free tier accounts after multiple rapid requests.",
                duration: 5000,
            });
        }
    } as any);

    const isLoading = status === 'submitted' || status === 'streaming';

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollIntoView({ behavior: "smooth" });
        }
    }, [messages, isLoading]);

    return (
        <div className="flex flex-col h-full max-w-4xl mx-auto w-full p-4 relative z-10">
            <ScrollArea className="flex-1 pr-4">
                {messages.length === 0 ? (
                    <EmptyState onSend={(val) => sendMessage({ text: val })} />
                ) : (
                    <div className="space-y-6 pb-4">
                        {messages.map((m: any) => (
                            <div key={m.id} className={cn("flex gap-4", m.role === "user" ? "justify-end" : "justify-start")}>
                                {m.role !== "user" && (
                                    <Avatar className="h-8 w-8 border border-primary/20 bg-primary/10">
                                        <AvatarFallback><Bot className="h-4 w-4 text-primary" /></AvatarFallback>
                                        <AvatarImage src="/ai-avatar.png" />
                                    </Avatar>
                                )}

                                <div className={cn("flex flex-col gap-2 max-w-[80%]", m.role === "user" ? "items-end" : "items-start")}>
                                    {(m.content || m.parts?.some((p: any) => p.type === 'text')) && (
                                        <div
                                            className={cn(
                                                "rounded-2xl px-4 py-3 text-sm leading-relaxed shadow-sm",
                                                m.role === "user"
                                                    ? "bg-primary text-primary-foreground rounded-tr-sm"
                                                    : "bg-card border border-border text-foreground rounded-tl-sm"
                                            )}
                                        >
                                            {m.content}
                                            {m.parts?.map((part: any, i: number) =>
                                                part.type === 'text' ? <span key={i}>{part.text}</span> : null
                                            )}
                                        </div>
                                    )}

                                    {/* Tool Invocations from parts (new SDK) */}
                                    {m.parts?.map((part: any, i: number) => {
                                        const isToolCall = part.type === 'tool-invocation' ||
                                            part.type === 'dynamic-tool' ||
                                            part.type.startsWith('tool-');

                                        if (!isToolCall) return null;

                                        // Normalize the tool invocation structure
                                        const toolInvocation = part.toolInvocation || part;

                                        const toolCallId = toolInvocation.toolCallId;
                                        // V6 uses tool-NAME as the type, and sometimes omits toolName in the part itself
                                        const toolName = toolInvocation.toolName ||
                                            (part.type?.startsWith('tool-') ? part.type.replace('tool-', '') : 'unknown');

                                        // V6 results might be in 'result' or 'output'
                                        const toolResult = toolInvocation.result !== undefined ? toolInvocation.result : toolInvocation.output;

                                        if (toolResult !== undefined && toolResult !== null) {
                                            return <ToolResult key={toolCallId || i} toolName={toolName} result={toolResult} />
                                        } else {
                                            return (
                                                <div key={toolCallId || i} className="flex items-center gap-2 text-xs text-muted-foreground bg-secondary/50 px-3 py-2 rounded-lg animate-pulse">
                                                    <Loader2 className="w-3 h-3 animate-spin" />
                                                    Using {toolName}...
                                                </div>
                                            )
                                        }
                                    })}

                                    {/* backward compatibility for m.toolInvocations */}
                                    {!m.parts && m.toolInvocations?.map((toolInvocation: any, i: number) => {
                                        const toolCallId = toolInvocation.toolCallId;
                                        const toolName = toolInvocation.toolName;

                                        if ('result' in toolInvocation) {
                                            return <ToolResult key={toolCallId || i} toolName={toolName} result={toolInvocation.result} />
                                        } else {
                                            return (
                                                <div key={toolCallId || i} className="flex items-center gap-2 text-xs text-muted-foreground bg-secondary/50 px-3 py-2 rounded-lg animate-pulse">
                                                    <Loader2 className="w-3 h-3 animate-spin" />
                                                    Using {toolName}...
                                                </div>
                                            )
                                        }
                                    })}
                                </div>

                                {m.role === "user" && (
                                    <Avatar className="h-8 w-8 border border-border">
                                        <AvatarFallback><UserIcon className="h-4 w-4" /></AvatarFallback>
                                    </Avatar>
                                )}
                            </div>
                        ))}
                        {isLoading && (
                            <div className="flex justify-start gap-4">
                                <Avatar className="h-8 w-8 border border-primary/20 bg-primary/10">
                                    <AvatarFallback><Bot className="h-4 w-4 text-primary" /></AvatarFallback>
                                </Avatar>
                                <div className="flex items-center gap-1 rounded-2xl bg-card border border-border px-4 py-3">
                                    <span className="w-2 h-2 rounded-full bg-primary/50 animate-bounce delay-0"></span>
                                    <span className="w-2 h-2 rounded-full bg-primary/50 animate-bounce delay-150"></span>
                                    <span className="w-2 h-2 rounded-full bg-primary/50 animate-bounce delay-300"></span>
                                </div>
                            </div>
                        )}
                        <div ref={scrollRef} />
                    </div>
                )}
            </ScrollArea>

            <div className="mt-4 pt-4 border-t border-white/5">
                <ChatInput
                    onSend={(val) => {
                        sendMessage({ text: val });
                    }}
                    isStreaming={isLoading}
                    disabled={isLoading}
                    placeholder="Ask about weather, stocks, or F1..."
                />
            </div>
        </div>
    );
}

function EmptyState({ onSend }: { onSend: (v: string) => void }) {
    const suggestions = [
        { label: "Weather in Tokyo", icon: <CloudSun className="w-4 h-4 text-orange-400" />, prompt: "What is the weather in Tokyo?" },
        { label: "Apple Stock Price", icon: <DollarSign className="w-4 h-4 text-green-400" />, prompt: "Get the stock price for AAPL" },
        { label: "Next F1 Race", icon: <Trophy className="w-4 h-4 text-red-500" />, prompt: "When is the next F1 race?" },
    ];

    return (
        <div className="h-full flex flex-col items-center justify-center p-8 text-center space-y-8">
            <div className="w-24 h-24 bg-primary/10 rounded-full flex items-center justify-center mb-4 ring-8 ring-primary/5">
                <Bot className="w-12 h-12 text-primary" />
            </div>
            <div className="space-y-2 max-w-md">
                <h2 className="text-2xl font-bold">How can I help you?</h2>
                <p className="text-muted-foreground">I&apos;m integrated with real-time tools. Ask me about current events or financial data.</p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 w-full max-w-2xl px-4">
                {suggestions.map((s, i) => (
                    <button
                        key={s.label}
                        onClick={() => onSend(s.prompt)}
                        className={cn(
                            "flex flex-col items-start gap-3 p-5 rounded-2xl bg-card/40 border border-white/5",
                            "hover:border-primary/40 hover:bg-primary/5 hover:translate-y-[-4px] transition-all duration-300",
                            "cursor-pointer group text-left backdrop-blur-md relative overflow-hidden shadow-lg",
                            "animate-in fade-in slide-in-from-bottom-4 duration-500 fill-mode-both"
                        )}
                        style={{ animationDelay: `${i * 100}ms` }}
                    >
                        <div className="absolute top-0 right-0 p-6 opacity-[0.03] group-hover:scale-150 transition-transform duration-500 pointer-events-none">
                            {s.icon}
                        </div>
                        <div className="p-2.5 rounded-xl bg-background/80 shadow-sm ring-1 ring-white/5 group-hover:ring-primary/20 transition-all">{s.icon}</div>
                        <div>
                            <span className="text-sm font-semibold block mb-1 group-hover:text-primary transition-colors">{s.label}</span>
                            <p className="text-[11px] text-muted-foreground line-clamp-2">Try asking: &quot;{s.prompt}&quot;</p>
                        </div>
                    </button>
                ))}
            </div>
        </div>
    )
}

function ToolResult({ toolName, result }: { toolName: string, result: any }) {
    if (!result) return null;
    const name = toolName.toLowerCase();

    if (name === 'getweather' || name === 'weather') {
        const { location, temperature, condition, humidity, windSpeed, error } = result;
        if (error) return <ErrorCard error={error} />;
        return <WeatherCard
            location={location}
            temperature={temperature}
            condition={condition}
            humidity={humidity}
            windSpeed={windSpeed || 0}
        />;
    }

    if (name === 'getstockprice' || name === 'stock') {
        const { symbol, price, change, error } = result;
        if (error) return <ErrorCard error={error} />;
        return <StockCard symbol={symbol} price={price} change={change} />;
    }

    if (name === 'getf1matches' || name === 'f1') {
        const { raceName, circuit, location, date, time, error } = result;
        if (error) return <ErrorCard error={error} />;
        return <RaceCard raceName={raceName} circuit={circuit} location={location} date={date} time={time} />;
    }

    return (
        <div className="bg-secondary/50 p-4 rounded-lg text-sm border border-border">
            <pre className="whitespace-pre-wrap">{JSON.stringify(result, null, 2)}</pre>
        </div>
    )
}

function ErrorCard({ error }: { error: string }) {
    return (
        <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-sm flex items-center gap-2">
            ⚠️ {error}
        </div>
    )
}
