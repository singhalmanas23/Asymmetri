
"use client";

import { useChat } from "ai/react";
import { Message } from "ai";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Send, Bot, User as UserIcon, Loader2, CloudSun, DollarSign, Trophy } from "lucide-react";
import { useEffect, useRef } from "react";
import { cn } from "@/lib/utils";
import { createChat } from "@/lib/actions";

interface ChatInterfaceProps {
    id?: string;
    initialMessages?: Message[];
}

export function ChatInterface({ id, initialMessages = [] }: ChatInterfaceProps) {
    const scrollRef = useRef<HTMLDivElement>(null);

    const { messages, input, handleInputChange, handleSubmit, isLoading } = useChat({
        api: "/api/chat",
        id,
        initialMessages,
        body: { chatId: id },
        onFinish: (message) => {
            // Optional: Revalidate or update UI if needed
        }
    });

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollIntoView({ behavior: "smooth" });
        }
    }, [messages, isLoading]);

    return (
        <div className="flex flex-col h-full max-w-4xl mx-auto w-full p-4 relative z-10">
            <ScrollArea className="flex-1 pr-4">
                {messages.length === 0 ? (
                    <EmptyState setInput={(val) => {
                        // A bit of a hack to set input, useChat provides setInput
                        // But we can just fire a fake event or pass setInput if Exposed.
                        // We will just assume user types it for now or implement setInput exposing.
                        const e = { target: { value: val } } as any;
                        handleInputChange(e);
                    }} />
                ) : (
                    <div className="space-y-6 pb-4">
                        {messages.map((m) => (
                            <div key={m.id} className={cn("flex gap-4", m.role === "user" ? "justify-end" : "justify-start")}>
                                {m.role !== "user" && (
                                    <Avatar className="h-8 w-8 border border-primary/20 bg-primary/10">
                                        <AvatarFallback><Bot className="h-4 w-4 text-primary" /></AvatarFallback>
                                        <AvatarImage src="/ai-avatar.png" />
                                    </Avatar>
                                )}

                                <div className={cn("flex flex-col gap-2 max-w-[80%]", m.role === "user" ? "items-end" : "items-start")}>
                                    {m.content && (
                                        <div
                                            className={cn(
                                                "rounded-2xl px-4 py-3 text-sm leading-relaxed shadow-sm",
                                                m.role === "user"
                                                    ? "bg-primary text-primary-foreground rounded-tr-sm"
                                                    : "bg-card border border-border text-foreground rounded-tl-sm"
                                            )}
                                        >
                                            {m.content}
                                        </div>
                                    )}

                                    {/* Tool Invocations (if any are present in the message object, Vercel AI SDK adds them) */}
                                    {m.toolInvocations?.map((toolInvocation) => {
                                        const toolCallId = toolInvocation.toolCallId;
                                        const toolName = toolInvocation.toolName;
                                        // const toolArgs = toolInvocation.args; // if needed

                                        if ('result' in toolInvocation) {
                                            // Tool has finished
                                            return (
                                                <ToolResult key={toolCallId} toolName={toolName} result={toolInvocation.result} />
                                            )
                                        } else {
                                            // Tool is loading
                                            return (
                                                <div key={toolCallId} className="flex items-center gap-2 text-xs text-muted-foreground bg-secondary/50 px-3 py-2 rounded-lg animate-pulse">
                                                    <Loader2 className="w-3 h-3 animate-spin flow-root" />
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
                <form onSubmit={handleSubmit} className="flex items-center gap-2 relative">
                    <Input
                        value={input}
                        onChange={handleInputChange}
                        placeholder="Ask about weather, stocks, or F1..."
                        className="flex-1 bg-background/50 border-white/10 focus:border-primary/50 h-12 pl-4 pr-12 rounded-xl backdrop-blur-sm shadow-inner"
                        disabled={isLoading}
                    />
                    <Button
                        type="submit"
                        size="icon"
                        className="absolute right-1 top-1 h-10 w-10 rounded-lg bg-primary hover:bg-primary/90 transition-all shadow-md"
                        disabled={isLoading || !input.trim()}
                    >
                        <Send className="w-4 h-4" />
                    </Button>
                </form>
            </div>
        </div>
    );
}

function EmptyState({ setInput }: { setInput: (v: string) => void }) {
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
                <p className="text-muted-foreground">I'm integrated with real-time tools. Ask me about current events or financial data.</p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 w-full max-w-lg">
                {suggestions.map((s) => (
                    <button
                        key={s.label}
                        onClick={() => setInput(s.prompt)}
                        className="flex flex-col items-center gap-3 p-4 rounded-xl bg-card border border-white/5 hover:border-primary/30 hover:bg-white/5 transition-all cursor-pointer group"
                    >
                        <div className="p-2 rounded-full bg-background group-hover:scale-110 transition-transform">{s.icon}</div>
                        <span className="text-sm font-medium">{s.label}</span>
                    </button>
                ))}
            </div>
        </div>
    )
}

function ToolResult({ toolName, result }: { toolName: string, result: any }) {
    if (toolName === 'getWeather') {
        const { location, temperature, condition, humidity, windSpeed, error } = result;
        if (error) return <ErrorCard error={error} />;

        return (
            <Card className="w-full max-w-xs bg-gradient-to-br from-blue-500/20 to-cyan-500/20 border-blue-500/30 overflow-hidden">
                <CardHeader className="pb-2">
                    <CardTitle className="flex items-center gap-2 text-sm font-medium text-blue-300">
                        <CloudSun className="w-4 h-4" /> Weather in {location}
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="flex items-baseline justify-between">
                        <span className="text-4xl font-bold">{Math.round(temperature)}°c</span>
                        <span className="text-sm capitalize text-muted-foreground">{condition}</span>
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-xs text-muted-foreground">
                        <div className="flex flex-col bg-background/20 p-2 rounded">
                            <span>Humidity</span>
                            <span className="font-semibold text-foreground">{humidity}%</span>
                        </div>
                        <div className="flex flex-col bg-background/20 p-2 rounded">
                            <span>Wind</span>
                            <span className="font-semibold text-foreground">{windSpeed} km/h</span>
                        </div>
                    </div>
                </CardContent>
            </Card>
        )
    }

    if (toolName === 'getStockPrice') {
        const { symbol, price, change, error } = result;
        if (error) return <ErrorCard error={error} />;
        const isPositive = change && change.startsWith('+') || parseFloat(change) > 0;

        return (
            <Card className="w-full max-w-xs bg-gradient-to-br from-green-500/10 to-emerald-500/10 border-green-500/30 overflow-hidden">
                <CardHeader className="pb-2">
                    <CardTitle className="flex items-center gap-2 text-sm font-medium text-green-400">
                        <DollarSign className="w-4 h-4" /> Stock Price
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="flex justify-between items-start mb-2">
                        <h3 className="text-2xl font-bold flex flex-col">
                            {symbol}
                            <span className="text-3xl mt-1">${parseFloat(price).toFixed(2)}</span>
                        </h3>
                        <span className={cn("px-2 py-1 rounded text-xs font-bold", isPositive ? "bg-green-500/20 text-green-400" : "bg-red-500/20 text-red-400")}>
                            {change}
                        </span>
                    </div>
                    <p className="text-xs text-muted-foreground text-right">Real-time data</p>
                </CardContent>
            </Card>
        )
    }

    if (toolName === 'getF1Matches') {
        const { raceName, circuit, location, date, time, error } = result;
        if (error) return <ErrorCard error={error} />;

        return (
            <Card className="w-full max-w-xs bg-gradient-to-br from-red-600/20 to-orange-600/20 border-red-500/30 overflow-hidden">
                <CardHeader className="pb-2">
                    <CardTitle className="flex items-center gap-2 text-sm font-medium text-red-400">
                        <Trophy className="w-4 h-4" /> Next F1 Race
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                    <div>
                        <h4 className="font-bold text-lg leading-tight">{raceName}</h4>
                        <p className="text-xs text-muted-foreground">{circuit}</p>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                        <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                        {location}
                    </div>
                    <div className="bg-background/20 p-3 rounded-lg flex justify-between items-center text-sm">
                        <span className="font-mono text-foreground">{date}</span>
                        <span className="font-mono text-red-400">{time?.replace('Z', '')} UTC</span>
                    </div>
                </CardContent>
            </Card>
        )
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
